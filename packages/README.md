# Packages

This directory holds reusable package-shaped artifacts that are worth keeping
inside the longevity-research repo as tracked infrastructure rather than as
loose exploratory code.

## Current Packages

- `breakthroughs`
  - policy, dispatch, and traceability for targeted compute
  - discovered through the controller compute lane and kept general enough to
    reuse outside the ocular benchmark
- `controller-benchmark-schemas`
  - schemas and validators for benchmark condition records, compiler receipts,
    shell receipts, and explicit trust-boundary artifacts
  - discovered through the controller benchmark lane and kept general enough to
    travel beyond any one biological program
- `controller-benchmark-data`
  - versioned benchmark bundle and lightweight Node readers for the current
    phase-stratified controller shell
  - discovered through the controller benchmark lane and scoped enough to carry
    one exact benchmark state honestly
- `controller-benchmark-js`
  - thin JavaScript summarization and interpretation helpers for benchmark
    bundles, outputs, and trust receipts
  - discovered through the controller benchmark lane and kept intentionally
    lighter than the Python compiler and runner

## Working Rule

Add a package here only if it is:

- coherent enough to be reused
- grounded in an earned project need
- smaller and cleaner than embedding the same logic ad hoc across notes and
  scripts

Exploratory code that is not yet package-worthy should stay in a sandbox or
temporary path until it earns promotion.
