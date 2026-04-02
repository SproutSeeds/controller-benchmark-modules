export const BASELINE_OUTPUTS = Object.freeze([
  "promote",
  "downgrade",
]);

export const CONTROLLER_OUTPUTS = Object.freeze([
  "promote",
  "downgrade",
  "abstain",
  "hazard_blocked",
  "insufficient_evidence",
]);

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array`);
  }
}

function normalizeSelector(selector) {
  if (typeof selector === "function") {
    return selector;
  }

  if (typeof selector === "string" && selector.length > 0) {
    return (item) => item?.[selector];
  }

  throw new TypeError("selector must be a function or non-empty string");
}

function normalizeDelimitedIds(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function makeCountsObject(counts) {
  return Object.freeze(Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  ));
}

export function countBy(items, selector) {
  assertArray(items, "items");
  const pick = normalizeSelector(selector);
  const counts = {};

  for (const item of items) {
    const key = pick(item);
    const normalizedKey = String(key ?? "undefined");
    counts[normalizedKey] = (counts[normalizedKey] ?? 0) + 1;
  }

  return makeCountsObject(counts);
}

export function indexConditionRecords(records) {
  assertArray(records, "records");
  return Object.freeze(
    Object.fromEntries(records.map((record) => [record.condition_id, record])),
  );
}

export function groupConditionRecordsByPhase(records) {
  assertArray(records, "records");
  const groups = {};

  for (const record of records) {
    const key = record.phase_layer ?? "unknown";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
  }

  return Object.freeze(groups);
}

export function groupConditionRecordsByStudyFamily(records) {
  assertArray(records, "records");
  const groups = {};

  for (const record of records) {
    const key = record.study_family_id ?? "unknown";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
  }

  return Object.freeze(groups);
}

export function listNegativePressureConditions(records) {
  assertArray(records, "records");
  return records.filter((record) => {
    const ids = normalizeDelimitedIds(record.active_negative_family_ids);
    return ids.length > 0;
  });
}

export function compareOutputs(ageOnlyRows, controllerRows) {
  assertArray(ageOnlyRows, "ageOnlyRows");
  assertArray(controllerRows, "controllerRows");

  const controllerById = new Map(
    controllerRows.map((row) => [row.condition_id, row]),
  );

  const transitions = {};
  const baselinePromotedNegativeConditions = [];
  const controllerPromotedNegativeConditions = [];
  const controllerHazardBlockedConditions = [];

  for (const baselineRow of ageOnlyRows) {
    const conditionId = baselineRow.condition_id;
    const controllerRow = controllerById.get(conditionId);

    if (!controllerRow) {
      continue;
    }

    const baselineOutput = baselineRow.baseline_output ?? "undefined";
    const controllerOutput = controllerRow.controller_output ?? "undefined";
    const transitionKey = `${baselineOutput}->${controllerOutput}`;
    transitions[transitionKey] = (transitions[transitionKey] ?? 0) + 1;

    const negativeIds = [
      ...normalizeDelimitedIds(baselineRow.active_negative_family_ids),
      ...normalizeDelimitedIds(controllerRow.active_negative_family_ids),
    ];

    if (baselineOutput === "promote" && negativeIds.length > 0) {
      baselinePromotedNegativeConditions.push(conditionId);
    }

    if (controllerOutput === "promote" && negativeIds.length > 0) {
      controllerPromotedNegativeConditions.push(conditionId);
    }

    if (controllerOutput === "hazard_blocked") {
      controllerHazardBlockedConditions.push(conditionId);
    }
  }

  return {
    condition_count: ageOnlyRows.length,
    baseline_output_counts: countBy(ageOnlyRows, "baseline_output"),
    controller_output_counts: countBy(controllerRows, "controller_output"),
    transition_counts: makeCountsObject(transitions),
    baseline_promoted_negative_conditions: Object.freeze(
      baselinePromotedNegativeConditions.slice().sort(),
    ),
    controller_promoted_negative_conditions: Object.freeze(
      controllerPromotedNegativeConditions.slice().sort(),
    ),
    controller_hazard_blocked_conditions: Object.freeze(
      controllerHazardBlockedConditions.slice().sort(),
    ),
    fail_closed:
      controllerPromotedNegativeConditions.length === 0 &&
      controllerHazardBlockedConditions.length > 0,
  };
}

export function summarizeCoverageTrust(coverageTrustReceipt) {
  if (!coverageTrustReceipt || typeof coverageTrustReceipt !== "object") {
    throw new TypeError("coverageTrustReceipt must be an object");
  }

  const conditionRows = Array.isArray(coverageTrustReceipt.condition_rows)
    ? coverageTrustReceipt.condition_rows
    : [];

  const countFlattenedField = (fieldName) =>
    countBy(
      conditionRows.flatMap((row) =>
        Array.isArray(row[fieldName]) ? row[fieldName] : [],
      ),
      (value) => value,
    );

  return {
    condition_count: coverageTrustReceipt.condition_count ?? 0,
    source_kind_counts: Object.freeze({
      ...(coverageTrustReceipt.source_kind_counts ?? {}),
    }),
    rule_backed_condition_count:
      coverageTrustReceipt.rule_backed_condition_count ?? 0,
    fixture_backed_condition_count:
      coverageTrustReceipt.fixture_backed_condition_count ?? 0,
    coverage_verdict: coverageTrustReceipt.coverage_verdict ?? "unknown",
    trust_status_counts: countBy(conditionRows, "trust_status"),
    bounded_manual_judgment_field_counts: countFlattenedField(
      "bounded_manual_judgment_fields",
    ),
    derived_field_counts: countFlattenedField("derived_fields"),
    matrix_extracted_field_counts: countFlattenedField(
      "matrix_extracted_fields",
    ),
  };
}

export function summarizeShellReceipt(benchmarkShellReceipt) {
  if (!benchmarkShellReceipt || typeof benchmarkShellReceipt !== "object") {
    throw new TypeError("benchmarkShellReceipt must be an object");
  }

  const summary = benchmarkShellReceipt.summary ?? {};
  const baselinePromotedNegativeConditions =
    summary.baseline_promoted_negative_conditions ?? [];
  const controllerPromotedNegativeConditions =
    summary.controller_promoted_negative_conditions ?? [];
  const controllerHazardBlockedConditions =
    summary.controller_hazard_blocked_conditions ?? [];

  return {
    condition_count: benchmarkShellReceipt.condition_count ?? 0,
    source_kind_counts: Object.freeze({
      ...(benchmarkShellReceipt.source_kind_counts ?? {}),
    }),
    baseline_output_counts: Object.freeze({
      ...(summary.baseline_output_counts ?? {}),
    }),
    controller_output_counts: Object.freeze({
      ...(summary.controller_output_counts ?? {}),
    }),
    baseline_promoted_negative_count: baselinePromotedNegativeConditions.length,
    controller_promoted_negative_count:
      controllerPromotedNegativeConditions.length,
    controller_hazard_blocked_count:
      controllerHazardBlockedConditions.length,
    fail_closed:
      controllerPromotedNegativeConditions.length === 0 &&
      controllerHazardBlockedConditions.length > 0,
    shell_claim: summary.shell_claim ?? "",
  };
}

export function buildBenchmarkSnapshot({
  conditionRecords,
  coverageTrustReceipt,
  benchmarkShellReceipt,
  ageOnlyRows,
  controllerRows,
}) {
  assertArray(conditionRecords, "conditionRecords");

  const outputComparison =
    ageOnlyRows && controllerRows
      ? compareOutputs(ageOnlyRows, controllerRows)
      : null;

  return {
    condition_count: conditionRecords.length,
    phase_counts: countBy(conditionRecords, "phase_layer"),
    study_family_counts: countBy(conditionRecords, "study_family_id"),
    negative_pressure_condition_ids: Object.freeze(
      listNegativePressureConditions(conditionRecords)
        .map((record) => record.condition_id)
        .sort(),
    ),
    coverage: coverageTrustReceipt
      ? summarizeCoverageTrust(coverageTrustReceipt)
      : null,
    shell: benchmarkShellReceipt
      ? summarizeShellReceipt(benchmarkShellReceipt)
      : null,
    outputs: outputComparison,
  };
}
