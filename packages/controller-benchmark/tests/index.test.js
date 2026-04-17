import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  BUNDLE_ID,
  BUILT_IN_EXAMPLES,
  CONDITION_RECORD_SCHEMA,
  RELEASE_METADATA,
  buildCurrentBenchmarkSnapshot,
  getSchema,
  listBuiltInExamples,
  loadCurrentBenchmark,
  loadValidatedCurrentBenchmark,
  renderBuiltInExample,
  validateCurrentBenchmark,
} from "../src/index.js";

const CLI_PATH = fileURLToPath(new URL("../bin/controller-benchmark.js", import.meta.url));

test("release metadata stays aligned with the current public bundle", () => {
  assert.equal(RELEASE_METADATA.package_name, "controller-benchmark");
  assert.equal(RELEASE_METADATA.bundle_id, "phase-stratified-controller-benchmark-v0");
  assert.deepEqual(RELEASE_METADATA.package_layers, [
    "controller-benchmark-schemas",
    "controller-benchmark-data",
    "controller-benchmark-js",
  ]);
});

test("curated schema re-exports are available", () => {
  assert.equal(BUNDLE_ID, "phase-stratified-controller-benchmark-v0");
  assert.equal(CONDITION_RECORD_SCHEMA.title, "Controller Benchmark Condition Record");
  assert.equal(getSchema("benchmarkShellReceipt").title, "Benchmark Shell Receipt");
});

test("current benchmark loader exposes the happy path object", () => {
  const benchmark = loadCurrentBenchmark();

  assert.equal(benchmark.bundleId, "phase-stratified-controller-benchmark-v0");
  assert.equal(benchmark.conditionRecords.length, 8);
  assert.equal(benchmark.ageOnlyRows.length, 8);
  assert.equal(benchmark.controllerRows.length, 8);
  assert.equal(benchmark.cx004ValidationHandoff.handoff_id, "CTRL-BENCH-CX004-HANDOFF-V0-001");
  assert.equal(
    benchmark.cx004ValidationHandoffReceipt.handoff_verdict,
    "cx004_validation_handoff_frozen",
  );
  assert.equal(
    benchmark.cx004ResolutionReviewContract.review_dependency_id,
    "cx004_resolution_receipt_reviewed_for_anchor_condition",
  );
  assert.equal(
    benchmark.cx004ExampleInsufficientResolutionReviewReceipt.review_verdict,
    "keep_dormant_due_to_insufficient_resolution",
  );
  assert.equal(benchmark.passiveRecommendationScaffold.protocol_objects.length, 8);
  assert.equal(benchmark.passiveRecommendationReceipt.protocol_object_count, 8);
});

test("current benchmark validation stays green on the released bundle", () => {
  const benchmark = loadCurrentBenchmark();
  const validation = validateCurrentBenchmark(benchmark);

  assert.equal(validation.valid, true);
  assert.equal(validation.condition_record_count, 8);
  assert.deepEqual(validation.invalid_condition_ids, []);
});

test("snapshot helper preserves fail-closed shell behavior", () => {
  const benchmark = loadCurrentBenchmark();
  const snapshot = buildCurrentBenchmarkSnapshot(benchmark);

  assert.equal(snapshot.condition_count, 8);
  assert.equal(snapshot.outputs.fail_closed, true);
  assert.equal(snapshot.shell.fail_closed, true);
  assert.equal(snapshot.phase_counts.maturation_phase_bulk_plus_abstention, 4);
  assert.equal(snapshot.validation_handoff.handoff_verdict, "cx004_validation_handoff_frozen");
  assert.equal(
    snapshot.resolution_review_gate.example_review_verdict,
    "keep_dormant_due_to_insufficient_resolution",
  );
  assert.equal(snapshot.recommendations.protocol_object_count, 8);
  assert.equal(snapshot.recommendations.live_recommendation_active_count, 0);
});

test("built-in example registry exposes cx004", () => {
  assert.ok(BUILT_IN_EXAMPLES.some((row) => row.id === "cx004"));
  assert.ok(BUILT_IN_EXAMPLES.some((row) => row.id === "hazard-stop"));
  assert.ok(listBuiltInExamples().some((row) => row.id === "cx004"));
  assert.ok(listBuiltInExamples().some((row) => row.id === "hazard-stop"));
});

test("cx004 example renderer explains the frozen contradiction path", () => {
  const rendered = renderBuiltInExample("cx004");

  assert.match(rendered, /VITA_CTRL_003/);
  assert.match(rendered, /VITA_CTRL_005/);
  assert.match(rendered, /handoff_verdict: cx004_validation_handoff_frozen/);
  assert.match(rendered, /passive_scaffolding_only_live_recommendation_dormant/);
});

test("hazard-stop example renderer explains the hard preserve-block path", () => {
  const rendered = renderBuiltInExample("hazard-stop");

  assert.match(rendered, /VITA_CTRL_006/);
  assert.match(rendered, /ohnishi_premature_termination_tumor_hazard/);
  assert.match(rendered, /passive_posture: preserve_block/);
  assert.match(
    rendered,
    /A direct hazard blocker is active, so the condition stays preserve-blocked/,
  );
});

test("CLI help advertises built-in examples", () => {
  const output = execFileSync(process.execPath, [CLI_PATH, "--help"], {
    encoding: "utf8",
  });

  assert.match(output, /--example <id>/);
  assert.match(output, /--list-examples/);
  assert.match(output, /cx004/);
  assert.match(output, /hazard-stop/);
});

test("CLI example command renders the cx004 walkthrough", () => {
  const output = execFileSync(process.execPath, [CLI_PATH, "--example", "cx004"], {
    encoding: "utf8",
  });

  assert.match(output, /controller-benchmark built-in example: cx004/);
  assert.match(output, /Gill-side contradiction/);
  assert.match(
    output,
    /The benchmark does not let stronger age movement outrank unresolved identity and risk\./,
  );
});

test("CLI example command renders the hazard-stop walkthrough", () => {
  const output = execFileSync(process.execPath, [CLI_PATH, "--example", "hazard-stop"], {
    encoding: "utf8",
  });

  assert.match(output, /controller-benchmark built-in example: hazard-stop/);
  assert.match(output, /passive_posture: preserve_block/);
  assert.match(output, /controller_hazard_blocked_conditions/);
});

test("validated loader composes benchmark, validation, and snapshot", () => {
  const result = loadValidatedCurrentBenchmark();

  assert.equal(result.validation.valid, true);
  assert.equal(result.snapshot.study_family_counts.gill_2022, 3);
  assert.equal(result.snapshot.coverage.rule_backed_condition_count, 8);
});
