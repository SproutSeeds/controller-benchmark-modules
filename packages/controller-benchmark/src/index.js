import {
  BENCHMARK_SHELL_RECEIPT_SCHEMA,
  COMPILER_COVERAGE_TRUST_RECEIPT_SCHEMA,
  CONDITION_RECORD_COMPILE_RECEIPT_SCHEMA,
  CONDITION_RECORD_SCHEMA,
  getSchema,
  listSchemas,
  validateBenchmarkShellReceipt,
  validateCompilerCoverageTrustReceipt,
  validateConditionRecord,
  validateConditionRecordCompileReceipt,
} from "controller-benchmark-schemas";

import {
  BUNDLE_ID,
  BUNDLE_MANIFEST,
  getArtifactPath,
  getArtifactUrl,
  listArtifacts,
  listCompilerRules,
  loadLatestBundle,
  readAgeOnlyBaselineOutputRows,
  readBenchmarkShellReceipt,
  readCompileReceipt,
  readCompilerRule,
  readConditionFixture,
  readConditionRecords,
  readContradictionKernelReceipt,
  readContradictionLedger,
  readCx004ExampleInsufficientPartnerReturn,
  readCx004ExampleInsufficientResolutionReceipt,
  readCx004ExampleInsufficientResolutionReviewReceipt,
  readCx004PartnerPacket,
  readCx004PartnerPacketReceipt,
  readCx004PartnerReturnTemplate,
  readCx004ResolutionReceiptContract,
  readCx004ResolutionReviewContract,
  readCx004ValidationHandoff,
  readCx004ValidationHandoffReceipt,
  readControllerOutputRows,
  readCoverageTrustReceipt,
  readNegativeFamilyRegistry,
  readPassiveRecommendationReceipt,
  readPassiveRecommendationScaffold,
  readStudyCorpusRows,
} from "controller-benchmark-data";

import {
  BASELINE_OUTPUTS,
  CONTROLLER_OUTPUTS,
  PASSIVE_RECOMMENDATION_POSTURES,
  buildBenchmarkSnapshot,
  compareOutputs,
  countBy,
  groupConditionRecordsByPhase,
  groupConditionRecordsByStudyFamily,
  indexConditionRecords,
  listNegativePressureConditions,
  summarizeCx004ResolutionReviewGate,
  summarizeCx004ValidationHandoff,
  summarizeContradictionLedger,
  summarizeCoverageTrust,
  summarizePassiveRecommendationScaffold,
  summarizeShellReceipt,
} from "controller-benchmark-js";

export {
  BASELINE_OUTPUTS,
  BENCHMARK_SHELL_RECEIPT_SCHEMA,
  BUNDLE_ID,
  BUNDLE_MANIFEST,
  COMPILER_COVERAGE_TRUST_RECEIPT_SCHEMA,
  CONDITION_RECORD_COMPILE_RECEIPT_SCHEMA,
  CONDITION_RECORD_SCHEMA,
  CONTROLLER_OUTPUTS,
  PASSIVE_RECOMMENDATION_POSTURES,
  buildBenchmarkSnapshot,
  compareOutputs,
  countBy,
  getArtifactPath,
  getArtifactUrl,
  getSchema,
  groupConditionRecordsByPhase,
  groupConditionRecordsByStudyFamily,
  indexConditionRecords,
  listArtifacts,
  listCompilerRules,
  listNegativePressureConditions,
  listSchemas,
  readAgeOnlyBaselineOutputRows,
  readBenchmarkShellReceipt,
  readCompileReceipt,
  readCompilerRule,
  readConditionFixture,
  readConditionRecords,
  readContradictionKernelReceipt,
  readContradictionLedger,
  readCx004ExampleInsufficientPartnerReturn,
  readCx004ExampleInsufficientResolutionReceipt,
  readCx004ExampleInsufficientResolutionReviewReceipt,
  readCx004PartnerPacket,
  readCx004PartnerPacketReceipt,
  readCx004PartnerReturnTemplate,
  readCx004ResolutionReceiptContract,
  readCx004ResolutionReviewContract,
  readCx004ValidationHandoff,
  readCx004ValidationHandoffReceipt,
  readControllerOutputRows,
  readCoverageTrustReceipt,
  readNegativeFamilyRegistry,
  readPassiveRecommendationReceipt,
  readPassiveRecommendationScaffold,
  readStudyCorpusRows,
  summarizeCx004ResolutionReviewGate,
  summarizeCx004ValidationHandoff,
  summarizeContradictionLedger,
  summarizeCoverageTrust,
  summarizePassiveRecommendationScaffold,
  summarizeShellReceipt,
  validateBenchmarkShellReceipt,
  validateCompilerCoverageTrustReceipt,
  validateConditionRecord,
  validateConditionRecordCompileReceipt,
};

function assertBundle(value) {
  if (!value || typeof value !== "object") {
    throw new TypeError("bundle must be an object");
  }
}

export const RELEASE_METADATA = Object.freeze({
  package_name: "controller-benchmark",
  release_channel: "public",
  steward: "SproutSeeds",
  research_stewardship: "Fractal Research Group",
  bundle_id: BUNDLE_ID,
  bundle_condition_count: BUNDLE_MANIFEST.condition_count ?? 0,
  package_layers: Object.freeze([
    "controller-benchmark-schemas",
    "controller-benchmark-data",
    "controller-benchmark-js",
  ]),
});

export const BUILT_IN_EXAMPLES = Object.freeze([
  Object.freeze({
    id: "cx004",
    aliases: Object.freeze(["cx-004", "gill-vs-olova", "gill_olova"]),
    label: "CX-004 contradiction walkthrough",
    summary:
      "Explains how the benchmark handles the live Gill-vs-Olova late-window disagreement end to end.",
  }),
  Object.freeze({
    id: "hazard-stop",
    aliases: Object.freeze(["hazard_stop", "hard-block", "ohnishi"]),
    label: "Hazard-stop hard block walkthrough",
    summary:
      "Explains how the benchmark fail-closes an attractive but hazard-bearing condition without opening an adjudication lane.",
  }),
]);

function normalizeExampleId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function resolveBuiltInExample(value) {
  const normalized = normalizeExampleId(value);
  return BUILT_IN_EXAMPLES.find(
    (row) => row.id === normalized || row.aliases.includes(normalized),
  );
}

function formatScalar(value) {
  if (typeof value === "number") {
    return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  }

  return String(value ?? "unknown");
}

function formatDelimitedList(values, emptyLabel = "none") {
  return Array.isArray(values) && values.length > 0
    ? values.join(", ")
    : emptyLabel;
}

function getConditionById(bundle, conditionId) {
  return (bundle.conditionRecords ?? []).find((row) => row.condition_id === conditionId);
}

function getRowById(rows, conditionId) {
  return (rows ?? []).find((row) => row.condition_id === conditionId);
}

function assertExampleCondition(bundle, conditionId) {
  const row = getConditionById(bundle, conditionId);

  if (!row) {
    throw new Error(`condition ${conditionId} is missing from the current benchmark`);
  }

  return row;
}

function assertExampleRow(rows, conditionId, label) {
  const row = getRowById(rows, conditionId);

  if (!row) {
    throw new Error(`${label} row for ${conditionId} is missing from the current benchmark`);
  }

  return row;
}

function assertCx004Contradictions(bundle) {
  const contradictions = (bundle.contradictionLedger?.live_contradictions ?? []).filter(
    (row) => row.contradiction_class_id === "CX-004",
  );

  if (contradictions.length === 0) {
    throw new Error("CX-004 contradictions are missing from the current benchmark");
  }

  return contradictions;
}

function getProtocolObjectByConditionId(bundle, conditionId) {
  return (bundle.passiveRecommendationScaffold?.protocol_objects ?? []).find((row) =>
    row.anchor_condition_ids?.includes(conditionId),
  );
}

function assertProtocolObject(bundle, conditionId) {
  const row = getProtocolObjectByConditionId(bundle, conditionId);

  if (!row) {
    throw new Error(
      `passive recommendation protocol object for ${conditionId} is missing from the current benchmark`,
    );
  }

  return row;
}

function renderCx004Example(bundle = loadCurrentBenchmark()) {
  assertBundle(bundle);

  const handoff = bundle.cx004ValidationHandoff ?? readCx004ValidationHandoff();
  const handoffReceipt =
    bundle.cx004ValidationHandoffReceipt ?? readCx004ValidationHandoffReceipt();
  const passiveReceipt =
    bundle.passiveRecommendationReceipt ?? readPassiveRecommendationReceipt();
  const snapshot = buildCurrentBenchmarkSnapshot(bundle);

  const [gillId, olovaId] = handoff?.target_pair?.condition_ids ?? [];
  const gillCondition = assertExampleCondition(bundle, gillId);
  const olovaCondition = assertExampleCondition(bundle, olovaId);

  const baselineGill = assertExampleRow(bundle.ageOnlyRows, gillId, "baseline");
  const baselineOlova = assertExampleRow(bundle.ageOnlyRows, olovaId, "baseline");
  const controllerGill = assertExampleRow(bundle.controllerRows, gillId, "controller");
  const controllerOlova = assertExampleRow(bundle.controllerRows, olovaId, "controller");

  const cx004Contradictions = assertCx004Contradictions(bundle);
  const gillContradiction = cx004Contradictions.find((row) => row.condition_id === gillId);
  const olovaContradiction = cx004Contradictions.find((row) => row.condition_id === olovaId);

  const lines = [
    "controller-benchmark built-in example: cx004",
    "",
    "What this example is:",
    "A live cross-family contradiction where Gill is more admissible, but Olova carries the stronger direct age contract.",
    "",
    "The pair:",
    `- ${gillId} (${gillCondition.study_family_id})`,
    `  age_signal_score=${formatScalar(gillCondition.age_signal_score)}, identity_status=${gillCondition.identity_status}, risk_status=${gillCondition.risk_status}`,
    `  summary: ${gillCondition.condition_summary}`,
    `- ${olovaId} (${olovaCondition.study_family_id})`,
    `  age_signal_score=${formatScalar(olovaCondition.age_signal_score)}, identity_status=${olovaCondition.identity_status}, risk_status=${olovaCondition.risk_status}`,
    `  summary: ${olovaCondition.condition_summary}`,
    "",
    "What the age-only baseline does:",
    `- ${gillId}: ${baselineGill.baseline_output} (${baselineGill.baseline_rationale})`,
    `- ${olovaId}: ${baselineOlova.baseline_output} (${baselineOlova.baseline_rationale})`,
    "",
    "What the controller does:",
    `- ${gillId}: ${controllerGill.controller_output} (${controllerGill.controller_rationale})`,
    `- ${olovaId}: ${controllerOlova.controller_output} (${controllerOlova.controller_rationale})`,
    "",
    "Why this becomes a contradiction instead of a silent ranking:",
    `- Gill-side contradiction: ${gillContradiction?.trigger_summary ?? "missing"}`,
    `- Olova-side contradiction: ${olovaContradiction?.trigger_summary ?? "missing"}`,
    `- active CX-004 contradiction count: ${cx004Contradictions.length}`,
    "",
    "How the benchmark escalates the disagreement:",
    `- handoff_id: ${handoff.handoff_id}`,
    `- handoff_verdict: ${handoffReceipt.handoff_verdict}`,
    `- minimum_timepoints (${handoff.minimal_validation_design.minimum_timepoints.length}): ${handoff.minimal_validation_design.minimum_timepoints.join(", ")}`,
    `- required_assays: ${formatDelimitedList(handoff.minimal_validation_design.required_assays)}`,
    `- discriminating_readouts (${handoff.exact_discriminating_readouts.length}): ${handoff.exact_discriminating_readouts.map((row) => row.name).join(", ")}`,
    "",
    "Current benchmark-wide safety posture:",
    `- shell fail_closed: ${snapshot.shell?.fail_closed === true ? "true" : "false"}`,
    `- live contradiction count: ${snapshot.contradictions?.live_contradiction_count ?? 0}`,
    `- dormant recommendation verdict: ${passiveReceipt.dormant_verdict}`,
    `- live recommendation active count: ${snapshot.recommendations?.live_recommendation_active_count ?? 0}`,
    "",
    "Bottom line:",
    "The benchmark does not let stronger age movement outrank unresolved identity and risk. It preserves the disagreement, freezes a validation handoff, and keeps live recommendation behavior dormant until the missing biology is earned.",
  ];

  return `${lines.join("\n")}\n`;
}

function renderHazardStopExample(bundle = loadCurrentBenchmark()) {
  assertBundle(bundle);

  const snapshot = buildCurrentBenchmarkSnapshot(bundle);
  const conditionId = "VITA_CTRL_006";
  const condition = assertExampleCondition(bundle, conditionId);
  const baselineRow = assertExampleRow(bundle.ageOnlyRows, conditionId, "baseline");
  const controllerRow = assertExampleRow(bundle.controllerRows, conditionId, "controller");
  const protocolObject = assertProtocolObject(bundle, conditionId);

  const lines = [
    "controller-benchmark built-in example: hazard-stop",
    "",
    "What this example is:",
    "A hard stop-rule case where age-only ranking still looks attractive, but the benchmark refuses to reopen a direct tumor-hazard family.",
    "",
    "The condition:",
    `- ${conditionId} (${condition.study_family_id})`,
    `  age_signal_score=${formatScalar(condition.age_signal_score)}, identity_status=${condition.identity_status}, risk_status=${condition.risk_status}`,
    `  summary: ${condition.condition_summary}`,
    "",
    "What the age-only baseline does:",
    `- ${conditionId}: ${baselineRow.baseline_output} (${baselineRow.baseline_rationale})`,
    "",
    "What the controller does:",
    `- ${conditionId}: ${controllerRow.controller_output} (${controllerRow.controller_rationale})`,
    `- active_negative_family_ids: ${controllerRow.active_negative_family_ids || "none"}`,
    "",
    "Why the benchmark fail-closes instead of escalating to adjudication:",
    `- passive_posture: ${protocolObject.passive_posture}`,
    `- protocol_hypothesis_label: ${protocolObject.protocol_hypothesis_label}`,
    `- blocking_boundaries: ${formatDelimitedList(protocolObject.recommendation_rationale?.blocking_boundaries)}`,
    `- live contradiction ids: ${formatDelimitedList(protocolObject.contradiction_state?.live_contradiction_ids)}`,
    `- required_evidence_before_activation: ${formatDelimitedList(protocolObject.required_evidence_before_activation)}`,
    "",
    "Current benchmark-wide safety posture:",
    `- controller_hazard_blocked_count: ${snapshot.shell?.controller_hazard_blocked_count ?? 0}`,
    `- controller_hazard_blocked_conditions: ${formatDelimitedList(snapshot.outputs?.controller_hazard_blocked_conditions)}`,
    `- shell fail_closed: ${snapshot.shell?.fail_closed === true ? "true" : "false"}`,
    `- dormant recommendation verdict: ${bundle.passiveRecommendationReceipt?.dormant_verdict ?? readPassiveRecommendationReceipt().dormant_verdict}`,
    "",
    "Bottom line:",
    "This is the benchmark saying absolutely not. A direct hazard blocker is active, so the condition stays preserve-blocked even though age-only ranking would otherwise promote it.",
  ];

  return `${lines.join("\n")}\n`;
}

export function listBuiltInExamples() {
  return BUILT_IN_EXAMPLES.map((row) => ({
    id: row.id,
    aliases: [...row.aliases],
    label: row.label,
    summary: row.summary,
  }));
}

export function renderBuiltInExample(exampleId = "cx004", bundle = loadCurrentBenchmark()) {
  const matched = resolveBuiltInExample(exampleId);

  if (!matched) {
    const knownIds = BUILT_IN_EXAMPLES.map((row) => row.id).join(", ");
    throw new Error(`unknown example "${exampleId}". Known examples: ${knownIds}`);
  }

  switch (matched.id) {
    case "cx004":
      return renderCx004Example(bundle);
    case "hazard-stop":
      return renderHazardStopExample(bundle);
    default:
      throw new Error(`example renderer missing for "${matched.id}"`);
  }
}

export function loadCurrentBenchmark() {
  return {
    ...loadLatestBundle(),
    ageOnlyRows: readAgeOnlyBaselineOutputRows(),
    controllerRows: readControllerOutputRows(),
  };
}

export function validateCurrentBenchmark(bundle = loadCurrentBenchmark()) {
  assertBundle(bundle);

  const conditionRecordResults = (bundle.conditionRecords ?? []).map((record) => ({
    condition_id: record.condition_id ?? "unknown",
    ...validateConditionRecord(record),
  }));

  const compileReceiptResult = validateConditionRecordCompileReceipt(
    bundle.compileReceipt,
  );
  const coverageTrustReceiptResult = validateCompilerCoverageTrustReceipt(
    bundle.coverageTrustReceipt,
  );
  const benchmarkShellReceiptResult = validateBenchmarkShellReceipt(
    bundle.benchmarkShellReceipt,
  );

  const invalidConditionIds = Object.freeze(
    conditionRecordResults
      .filter((result) => result.valid === false)
      .map((result) => result.condition_id)
      .sort(),
  );

  return {
    valid:
      invalidConditionIds.length === 0 &&
      compileReceiptResult.valid === true &&
      coverageTrustReceiptResult.valid === true &&
      benchmarkShellReceiptResult.valid === true,
    bundle_id: bundle.bundleId ?? BUNDLE_ID,
    condition_record_count: Array.isArray(bundle.conditionRecords)
      ? bundle.conditionRecords.length
      : 0,
    invalid_condition_ids: invalidConditionIds,
    validation: Object.freeze({
      condition_records: Object.freeze(conditionRecordResults),
      compile_receipt: compileReceiptResult,
      coverage_trust_receipt: coverageTrustReceiptResult,
      benchmark_shell_receipt: benchmarkShellReceiptResult,
    }),
  };
}

export function buildCurrentBenchmarkSnapshot(bundle = loadCurrentBenchmark()) {
  assertBundle(bundle);

  return buildBenchmarkSnapshot({
    conditionRecords: bundle.conditionRecords ?? [],
    coverageTrustReceipt:
      bundle.coverageTrustReceipt ?? readCoverageTrustReceipt(),
    benchmarkShellReceipt:
      bundle.benchmarkShellReceipt ?? readBenchmarkShellReceipt(),
    contradictionLedger:
      bundle.contradictionLedger ?? readContradictionLedger(),
    cx004ValidationHandoff:
      bundle.cx004ValidationHandoff ?? readCx004ValidationHandoff(),
    cx004ValidationHandoffReceipt:
      bundle.cx004ValidationHandoffReceipt ??
      readCx004ValidationHandoffReceipt(),
    cx004ResolutionReviewContract:
      bundle.cx004ResolutionReviewContract ??
      readCx004ResolutionReviewContract(),
    cx004ExampleInsufficientResolutionReviewReceipt:
      bundle.cx004ExampleInsufficientResolutionReviewReceipt ??
      readCx004ExampleInsufficientResolutionReviewReceipt(),
    passiveRecommendationScaffold:
      bundle.passiveRecommendationScaffold ??
      readPassiveRecommendationScaffold(),
    passiveRecommendationReceipt:
      bundle.passiveRecommendationReceipt ??
      readPassiveRecommendationReceipt(),
    ageOnlyRows: bundle.ageOnlyRows ?? readAgeOnlyBaselineOutputRows(),
    controllerRows: bundle.controllerRows ?? readControllerOutputRows(),
  });
}

export function loadValidatedCurrentBenchmark() {
  const benchmark = loadCurrentBenchmark();
  return {
    benchmark,
    validation: validateCurrentBenchmark(benchmark),
    snapshot: buildCurrentBenchmarkSnapshot(benchmark),
  };
}
