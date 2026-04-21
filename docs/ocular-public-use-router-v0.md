# Ocular Controller Public Use Router v0

Date: 2026-04-21

## Purpose

Route outside readers to the right public ocular controller surface without asking them to infer the next action from scattered artifacts.

This is the front-desk map for the public ocular controller surface.
It tells each reader where to start, what action is useful, what receipt
we want, and what claim must stay out of bounds.

## Canonical Public Surfaces

- repo: `https://github.com/SproutSeeds/retinal-longevity-controller-benchmarks`
- public_index: `https://github.com/SproutSeeds/retinal-longevity-controller-benchmarks/blob/main/docs/ocular-controller-public-index-v0.md`
- one_page: `https://github.com/SproutSeeds/retinal-longevity-controller-benchmarks/blob/main/docs/ocular-longevity-controller-one-page-v0.md`
- doi: `https://doi.org/10.5281/zenodo.19633942`
- synapse_index: `https://www.synapse.org/Synapse:syn74531916`

## Routes

### reader_quick_start

- audience: busy reviewer, funder, or host
- start here: one-page public brief
- public link: `https://github.com/SproutSeeds/retinal-longevity-controller-benchmarks/blob/main/docs/ocular-longevity-controller-one-page-v0.md`
- useful reply or receipt: routing signal, reviewer willingness, or funder/host fit note

What to do:
- Read the one-page brief before opening the larger shelf.
- Decide whether the useful response is review, host routing, funding fit, or data referral.

Do not infer:
- therapy readiness
- human intervention truth
- clinical utility

### benchmark_builder

- audience: benchmark or ML builder
- start here: public benchmark repository and CLI examples
- public link: `https://github.com/SproutSeeds/retinal-longevity-controller-benchmarks`
- useful reply or receipt: issue, pull request, reproducibility note, or schema critique

What to do:
- Install or inspect the controller benchmark packages.
- Run the CX-004 and hazard-stop examples to see contradiction and safety-block behavior.
- Pressure-test whether the schema preserves abstention, blocked claims, and missing anchors.

Commands:
- `npx controller-benchmark --help`
- `npx controller-benchmark --example cx004`
- `npx controller-benchmark --example hazard-stop`

Do not infer:
- the example outputs are biological proof
- the benchmark is a clinical product

### vision_researcher

- audience: vision scientist or ocular atlas/data expert
- start here: public artifact index
- public link: `https://github.com/SproutSeeds/retinal-longevity-controller-benchmarks/blob/main/docs/ocular-controller-public-index-v0.md`
- useful reply or receipt: dataset referral, boundary correction, or supervised review note

What to do:
- Check whether the data-role labels and blocked claims match the ocular evidence you know.
- Point to better human ocular datasets, contradiction cases, or validation surfaces.
- Challenge whether any support-only evidence is being promoted too far.

Do not infer:
- adult RGC restoration is solved
- support-only evidence closes the human validation gap

### eligible_host_or_funder

- audience: eligible host, collaborator, funder, or program officer
- start here: one-page public brief plus DOI
- public link: `https://doi.org/10.5281/zenodo.19633942`
- useful reply or receipt: eligible-host path, program-fit answer, or referral

What to do:
- Evaluate whether this fits a secondary-data ocular methods project.
- Route us toward an eligible host, collaborator, or funding mechanism if FRG cannot apply directly.
- Assess whether the output should be a public evidence-boundary layer rather than a therapy claim.

Do not infer:
- FRG eligibility is already resolved
- new human data collection is part of the current R21 shape
- the project is asking for clinical activity

### provider_or_wet_lab

- audience: wet-lab, sequencing, or analytical assay provider
- start here: public index for background only
- public link: `https://www.synapse.org/Synapse:syn74531916`
- useful reply or receipt: capability matrix, quote range, referral, or scope correction

What to do:
- Use the public shelf only to understand the controller boundary.
- Quote only the narrow missing-measurement tranche requested in the private provider packet.
- Separate data generation from state adjudication if your service cannot provide both.

Do not infer:
- the public shelf is a wet-lab protocol
- the provider work is patient-facing
- a broad discovery package is preferred over a narrow missing-data tranche

### independent_builder

- audience: independent researcher or careful public reader
- start here: claim boundary and public index
- public link: `https://github.com/SproutSeeds/retinal-longevity-controller-benchmarks/blob/main/docs/ocular-controller-public-index-v0.md`
- useful reply or receipt: public issue, boundary question, or reproducibility note

What to do:
- Use the shelf as a map of evidence roles, not as permission to make intervention claims.
- Reuse the examples to practice claim-boundary logic.
- Open a public issue or note if a boundary is unclear or misleading.

Do not infer:
- personal medical advice
- treatment direction
- clinical decision support

## Global Boundaries

- research infrastructure only
- no medical advice
- no clinical decision support
- no therapy-readiness claim
- no claim that public data closes the human validation gap
