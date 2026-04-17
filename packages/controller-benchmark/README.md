# controller-benchmark

Published by SproutSeeds. Research stewardship: Fractal Research Group ([frg.earth](https://frg.earth)).

Opinionated umbrella package for the current public controller benchmark release.

## Install

```bash
npm install controller-benchmark
```

For local development inside this repo:

```bash
cd packages/controller-benchmark
npm install --no-package-lock
npm test
npm pack --dry-run
```

## CLI

The package also ships a tiny CLI for built-in walkthrough examples.

```bash
controller-benchmark --help
controller-benchmark --list-examples
controller-benchmark --example cx004
controller-benchmark --example hazard-stop
```

The built-in examples currently cover:

- `cx004`
  - the concrete Gill-versus-Olova contradiction path, including the baseline
    output, controller output, contradiction escalation, validation handoff,
    and current dormant safety posture
- `hazard-stop`
  - a direct hard-block case where the baseline still looks attractive, but the
    controller refuses to reopen a tumor-hazard family

## What This Is

`controller-benchmark` is the one-install happy path for the current public
controller benchmark surface.

It composes:

- `controller-benchmark-schemas`
  - contract and validation layer
- `controller-benchmark-data`
  - current released benchmark bundle
- `controller-benchmark-js`
  - thin JavaScript interpretation and summarization helpers

The point is to make the current public benchmark release easy to load,
validate, and inspect without forcing users to learn the full internal package
split on day one.

The current public tranche includes:

- contradiction-ledger and passive recommendation bundle layers
- one exact `CX-004` validation handoff for the live Gill-versus-Olova pair

## What This Is Not

`controller-benchmark` is not:

- the Python compiler
- the benchmark runner
- a model-training runtime
- a controller-serving stack
- a claim that the underlying biology is settled

It is the public release surface for the current benchmark bundle and its
shareable JS/runtime helpers.

## Quick Start

```js
import {
  RELEASE_METADATA,
  buildCurrentBenchmarkSnapshot,
  loadCurrentBenchmark,
  validateCurrentBenchmark,
} from "controller-benchmark";

console.log(RELEASE_METADATA.bundle_id);

const benchmark = loadCurrentBenchmark();
const validation = validateCurrentBenchmark(benchmark);
const snapshot = buildCurrentBenchmarkSnapshot(benchmark);

console.log(validation.valid);
console.log(snapshot.shell.fail_closed);
console.log(snapshot.validation_handoff.handoff_verdict);
```

## Tiny Browser Demo

A static browser demo is included here:

- `packages/controller-benchmark/examples/browser-demo/index.html`

Refresh the demo data:

```bash
node packages/controller-benchmark/examples/browser-demo/build-demo-data.mjs
```

Serve it locally:

```bash
cd packages/controller-benchmark/examples/browser-demo
python3 -m http.server 8000
```

## API Surface

### Umbrella helpers

- `RELEASE_METADATA`
- `BUILT_IN_EXAMPLES`
- `loadCurrentBenchmark()`
- `validateCurrentBenchmark(bundle?)`
- `buildCurrentBenchmarkSnapshot(bundle?)`
- `loadValidatedCurrentBenchmark()`
- `listBuiltInExamples()`
- `renderBuiltInExample(exampleId, bundle?)`
- `readCx004ValidationHandoff()`
- `readCx004ValidationHandoffReceipt()`
- `summarizeCx004ValidationHandoff(handoff, receipt?)`

### Curated re-exports

- schema validators and schema constants from `controller-benchmark-schemas`
- bundle readers and bundle metadata from `controller-benchmark-data`
- summarization and snapshot helpers from `controller-benchmark-js`

## Design Boundary

This package is intentionally opinionated around one current public release.

The lower-level packages remain the more stable foundation:

- `controller-benchmark-schemas`
- `controller-benchmark-data`
- `controller-benchmark-js`

That keeps the architecture clean while giving most users a much simpler entry
point.
