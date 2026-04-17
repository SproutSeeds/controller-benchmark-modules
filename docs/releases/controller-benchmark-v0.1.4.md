# Controller Benchmark v0.1.4

Date: 2026-04-17

This release is the first public GitHub and Zenodo release for the retinal
longevity controller benchmark surface after the `controller-benchmark@0.1.4`
npm CLI walkthrough release.

Versioned DOI:

- `10.5281/zenodo.19633942`

Concept DOI:

- `10.5281/zenodo.19633941`

## What Is New

- `controller-benchmark@0.1.4` is published on npm.
- The umbrella package exposes concrete CLI examples:
  - `npx controller-benchmark --list-examples`
  - `npx controller-benchmark --example cx004`
  - `npx controller-benchmark --example hazard-stop`
- The public repo includes citation and archival metadata:
  - `CITATION.cff`
  - `.zenodo.json`

## Why This Matters

The release gives outside readers one concrete public path to inspect how the
controller handles:

- contradiction preservation
- abstention when biology is missing
- hard safety stops
- provenance boundaries
- claim discipline around ocular longevity and partial reprogramming

## Verification

Validated before release-candidate preparation:

- clean npm registry install of `controller-benchmark@0.1.4`
- `npx controller-benchmark --list-examples`
- `npx controller-benchmark --example cx004`
- `npx controller-benchmark --example hazard-stop`
- public raw `CITATION.cff` returned HTTP `200`
- public raw `.zenodo.json` returned HTTP `200`
- controller checkpoint integrity passed in the private canonical repo

## Boundaries

This release is public benchmark infrastructure. It does not claim:

- therapy readiness
- clinical recommendation
- patient advice
- solved biology
- provider selection
- wet-lab truth

The benchmark surface is meant to make the controller's claim boundaries easier
to inspect, reuse, challenge, and cite.
