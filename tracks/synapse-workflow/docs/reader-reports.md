# Reports for understanding the result

Kotaro's report preference: lead with what the website does and what we learned. Omit request/action counts from the main presentation. Explain behavior in plain English, identify who can access what, and make unresolved questions easy to see. Source filenames, HTTP codes and exhaustive inventories belong in optional supporting evidence.

`src/reader-report.mjs` renders a reviewed `reader-summary.json` into a standalone HTML report. The summary contains a conclusion, visitor journey, a few result cards, a short page/access table, and next checks. Each card explains whether it was observed in the browser or found in code. Do not translate a static code branch into a claim that it was tested.

Supply `readerSummaryFile` in an `analyze` configuration. `REPORT.html` becomes the reader version and `TECHNICAL.html` retains the detailed evidence. Both outputs use the same investigation; the summary does not initiate a new capture. Without a reviewed summary, the existing technical renderer remains available.

The fresh TOBIRA summary is `runs/tobira-fresh-report-20261014/reader-summary.json`. Its main report has no activity counters. Its footer exposes the detailed report only when the reader chooses it. Summary wording is reviewed by the agent/person; the renderer does not invent plain-language conclusions from counts or filenames.
