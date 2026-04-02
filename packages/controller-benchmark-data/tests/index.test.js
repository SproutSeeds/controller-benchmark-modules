import test from "node:test";
import assert from "node:assert/strict";

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
  readCompilerRule,
  readConditionFixture,
  readConditionRecords,
  readControllerOutputRows,
  readCoverageTrustReceipt,
  readNegativeFamilyRegistry,
  readStudyCorpusRows,
} from "../src/index.js";

test("bundle metadata is available", () => {
  assert.equal(BUNDLE_ID, "phase-stratified-controller-benchmark-v0");
  assert.equal(BUNDLE_MANIFEST.condition_count, 8);
  assert.equal(BUNDLE_MANIFEST.coverage_verdict, "all_live_conditions_rule_backed");
});

test("artifact registry exposes the core bundle surfaces", () => {
  assert.deepEqual(listArtifacts(), [
    "studyCorpus",
    "negativeFamilyRegistry",
    "conditionFixture",
    "conditionRecords",
    "compileReceipt",
    "coverageTrustReceipt",
    "ageOnlyBaselineOutput",
    "controllerOutput",
    "benchmarkShellReceipt",
  ]);
  assert.equal(
    getArtifactPath("conditionRecords"),
    "controller-benchmark-condition-records-v0.jsonl",
  );
  assert.equal(
    getArtifactUrl("conditionRecords").pathname.endsWith(
      "/controller-benchmark-condition-records-v0.jsonl",
    ),
    true,
  );
});

test("study corpus and negative family registry are readable", () => {
  const studyCorpus = readStudyCorpusRows();
  const negativeFamilies = readNegativeFamilyRegistry();

  assert.equal(studyCorpus.length, 10);
  assert.equal(studyCorpus[0].study_family_id, "sarkar_2020");
  assert.equal(negativeFamilies.length, 4);
  assert.equal(negativeFamilies[0].family_id, "ohnishi_premature_termination_tumor_hazard");
});

test("compiled condition records and fixture are readable", () => {
  const fixture = readConditionFixture();
  const records = readConditionRecords();

  assert.equal(fixture.length, 8);
  assert.equal(records.length, 8);
  assert.equal(records[0].condition_id, "VITA_CTRL_001");
  assert.equal(records[2].study_family_id, "gill_2022");
});

test("compiler rules are readable", () => {
  const rules = listCompilerRules();
  const gillRule = readCompilerRule("gill_2022-v0");

  assert.deepEqual(rules, [
    "gill_2022-v0",
    "human_full_reprog_d14-v0",
    "ohnishi_2014-v0",
    "olova_ohnuki-v0",
    "roux_2022_sc-v0",
    "sarkar_2020-v0",
  ]);
  assert.equal(gillRule.study_family_id, "gill_2022");
});

test("receipts and output tables remain aligned with the live shell", () => {
  const coverage = readCoverageTrustReceipt();
  const shell = readBenchmarkShellReceipt();
  const ageOnlyRows = readAgeOnlyBaselineOutputRows();
  const controllerRows = readControllerOutputRows();

  assert.equal(coverage.rule_backed_condition_count, 8);
  assert.equal(coverage.fixture_backed_condition_count, 0);
  assert.equal(shell.summary.controller_output_counts.promote, 1);
  assert.equal(ageOnlyRows.length, 8);
  assert.equal(controllerRows.length, 8);
});

test("latest bundle loader returns a coherent snapshot", () => {
  const bundle = loadLatestBundle();

  assert.equal(bundle.bundleId, BUNDLE_ID);
  assert.equal(bundle.manifest.bundle_id, BUNDLE_ID);
  assert.equal(bundle.conditionRecords.length, 8);
  assert.equal(bundle.benchmarkShellReceipt.condition_count, 8);
});
