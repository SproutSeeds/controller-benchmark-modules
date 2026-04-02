import { readFileSync } from "node:fs";

export {
  AGE_SIGNAL_STATUSES,
  EVIDENCE_CLASSES,
  PHASE_LAYERS,
  PRESSURE_LEVELS,
  PRESSURE_STATUSES,
  SOURCE_KINDS,
  validateBenchmarkShellReceipt,
  validateCompilerCoverageTrustReceipt,
  validateConditionRecord,
  validateConditionRecordCompileReceipt,
} from "./validators.js";

const SCHEMA_FILE_MAP = Object.freeze({
  conditionRecord: new URL("../schemas/condition-record.schema.json", import.meta.url),
  conditionRecordCompileReceipt: new URL(
    "../schemas/condition-record-compile-receipt.schema.json",
    import.meta.url,
  ),
  benchmarkShellReceipt: new URL(
    "../schemas/benchmark-shell-receipt.schema.json",
    import.meta.url,
  ),
  compilerCoverageTrustReceipt: new URL(
    "../schemas/compiler-coverage-trust-receipt.schema.json",
    import.meta.url,
  ),
});

function loadSchema(url) {
  return JSON.parse(readFileSync(url, "utf-8"));
}

export const CONDITION_RECORD_SCHEMA = loadSchema(SCHEMA_FILE_MAP.conditionRecord);
export const CONDITION_RECORD_COMPILE_RECEIPT_SCHEMA = loadSchema(
  SCHEMA_FILE_MAP.conditionRecordCompileReceipt,
);
export const BENCHMARK_SHELL_RECEIPT_SCHEMA = loadSchema(
  SCHEMA_FILE_MAP.benchmarkShellReceipt,
);
export const COMPILER_COVERAGE_TRUST_RECEIPT_SCHEMA = loadSchema(
  SCHEMA_FILE_MAP.compilerCoverageTrustReceipt,
);

const SCHEMA_CACHE = Object.freeze({
  conditionRecord: CONDITION_RECORD_SCHEMA,
  conditionRecordCompileReceipt: CONDITION_RECORD_COMPILE_RECEIPT_SCHEMA,
  benchmarkShellReceipt: BENCHMARK_SHELL_RECEIPT_SCHEMA,
  compilerCoverageTrustReceipt: COMPILER_COVERAGE_TRUST_RECEIPT_SCHEMA,
});

export function listSchemas() {
  return Object.freeze(Object.keys(SCHEMA_CACHE));
}

export function getSchema(name) {
  if (!Object.hasOwn(SCHEMA_CACHE, name)) {
    throw new Error(
      `Unknown schema name: ${name}. Expected one of: ${Object.keys(SCHEMA_CACHE).join(", ")}`,
    );
  }

  return SCHEMA_CACHE[name];
}
