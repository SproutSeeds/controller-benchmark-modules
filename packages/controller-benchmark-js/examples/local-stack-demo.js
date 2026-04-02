import {
  validateBenchmarkShellReceipt,
  validateCompilerCoverageTrustReceipt,
  validateConditionRecord,
} from "../../controller-benchmark-schemas/src/index.js";

import {
  loadLatestBundle,
  readAgeOnlyBaselineOutputRows,
  readControllerOutputRows,
} from "../../controller-benchmark-data/src/index.js";

import {
  buildBenchmarkSnapshot,
  compareOutputs,
  summarizeCoverageTrust,
  summarizeShellReceipt,
} from "../src/index.js";

function summarizeConditionValidation(conditionRecords) {
  const invalid = [];

  for (const record of conditionRecords) {
    const result = validateConditionRecord(record);
    if (!result.valid) {
      invalid.push({
        condition_id: record.condition_id,
        errors: result.errors,
      });
    }
  }

  return {
    checked: conditionRecords.length,
    valid: conditionRecords.length - invalid.length,
    invalid,
  };
}

const bundle = loadLatestBundle();
const ageOnlyRows = readAgeOnlyBaselineOutputRows();
const controllerRows = readControllerOutputRows();

const coverageValidation = validateCompilerCoverageTrustReceipt(
  bundle.coverageTrustReceipt,
);
const shellValidation = validateBenchmarkShellReceipt(
  bundle.benchmarkShellReceipt,
);
const conditionValidation = summarizeConditionValidation(bundle.conditionRecords);

const coverageSummary = summarizeCoverageTrust(bundle.coverageTrustReceipt);
const shellSummary = summarizeShellReceipt(bundle.benchmarkShellReceipt);
const outputComparison = compareOutputs(ageOnlyRows, controllerRows);
const benchmarkSnapshot = buildBenchmarkSnapshot({
  conditionRecords: bundle.conditionRecords,
  coverageTrustReceipt: bundle.coverageTrustReceipt,
  benchmarkShellReceipt: bundle.benchmarkShellReceipt,
  ageOnlyRows,
  controllerRows,
});

const report = {
  bundle_id: bundle.bundleId,
  validation: {
    coverage_trust_receipt: coverageValidation,
    benchmark_shell_receipt: shellValidation,
    condition_records: conditionValidation,
  },
  summaries: {
    coverage: coverageSummary,
    shell: shellSummary,
    outputs: outputComparison,
    snapshot: benchmarkSnapshot,
  },
};

console.log(JSON.stringify(report, null, 2));
