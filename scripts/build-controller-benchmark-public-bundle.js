console.error(
  [
    "This public repo distributes the benchmark bundle as a release artifact.",
    "Bundle regeneration is maintained in the canonical development workspace.",
    "If you need to rebuild the bundle from source inputs, do that from the",
    "private or canonical controller benchmark environment rather than here.",
  ].join(" "),
);

process.exit(1);
