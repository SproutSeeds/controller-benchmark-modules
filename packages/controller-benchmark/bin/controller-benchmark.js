#!/usr/bin/env node

import {
  listBuiltInExamples,
  renderBuiltInExample,
} from "../src/index.js";

function printHelp() {
  const examples = listBuiltInExamples()
    .map((row) => `  - ${row.id}: ${row.label}`)
    .join("\n");

  process.stdout.write(`controller-benchmark

Usage:
  controller-benchmark --help
  controller-benchmark --list-examples
  controller-benchmark --example <id>

Options:
  --help, -h           Show this help text.
  --list-examples      List the built-in walkthrough examples.
  --example <id>       Print one built-in example, such as cx004.

Built-in examples:
${examples}

Example:
  controller-benchmark --example cx004
`);
}

function printExamples() {
  const lines = listBuiltInExamples().map(
    (row) => `${row.id}\t${row.label}\t${row.summary}`,
  );
  process.stdout.write(`${lines.join("\n")}\n`);
}

function fail(message) {
  process.stderr.write(`controller-benchmark: ${message}\n`);
  process.exitCode = 1;
}

function readOptionValue(argv, index, flag) {
  const inlineValue = argv[index].split("=")[1];
  if (inlineValue) {
    return inlineValue;
  }

  const nextValue = argv[index + 1];
  if (!nextValue || nextValue.startsWith("-")) {
    fail(`missing value for ${flag}`);
    return null;
  }

  return nextValue;
}

function main(argv = process.argv.slice(2)) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return;
  }

  if (argv.includes("--list-examples")) {
    printExamples();
    return;
  }

  const exampleIndex = argv.findIndex(
    (value) => value === "--example" || value.startsWith("--example="),
  );

  if (exampleIndex !== -1) {
    const exampleId = readOptionValue(argv, exampleIndex, "--example");
    if (!exampleId) {
      return;
    }

    try {
      process.stdout.write(renderBuiltInExample(exampleId));
      return;
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
      return;
    }
  }

  fail(`unknown arguments: ${argv.join(" ")}`);
}

main();
