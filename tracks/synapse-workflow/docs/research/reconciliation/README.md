# Research reconciliation

Start with [Using the security research](USE-RESEARCH.md). This file records what this directory contains, how it was built, how it was verified, and what is still open.

## Contents

| Path | What it is |
| --- | --- |
| [USE-RESEARCH.md](USE-RESEARCH.md) | The guide agents read first: the ten cross-cutting rules, engagement stages, hazards, corrections, gaps and the decision record |
| [register/findings.json](register/findings.json) | 325 decision-relevant findings, each with claim, implication, limits, evidence strength, stages, practitioner questions, search terms, sources, receipts and contrary evidence |
| [register/corrections.json](register/corrections.json) | 203 pairs of an earlier passage and the later passage that narrows, reverses or supersedes it, with risk and guidance |
| [register/hazards.json](register/hazards.json) | 80 passages that could lead an agent into unsafe or out-of-bounds action, with what to do instead |
| [domains/](domains/) | Generated per-area digests (`build-register.mjs`); do not edit by hand |
| [find-research.mjs](find-research.mjs) | Local, read-only search over the register and the studies; also `--check` (validation) and `--eval` (retrieval recall) |
| [lib.mjs](lib.mjs), [build-register.mjs](build-register.mjs) | Shared loader, validator and ranking (section-chunked BM25 with domain synonyms and Japanese term mapping); digest generator |
| [eval/](eval/) | Independent question sets and the baseline reproduction of the original search |
| [corpus.json](corpus.json), [reading-ledger.json](reading-ledger.json), [read-corpus.mjs](read-corpus.mjs) | Pine's original snapshot (1,080 files, SHA-256) and contiguous reading ledger; historical records |
| [decisions.json](decisions.json), [retrieval-checks.json](retrieval-checks.json), [synapse-handoff-review.json](synapse-handoff-review.json) | Pine's original eight decision notes, self-authored routing checks and Synapse reading receipt; superseded by the register and kept for provenance |

## How it was built

**Phase 1: initial reconciliation (Pine, 2026-10-18).** Kotaro asked for a reading of every line of the research so none of it would be wasted. Pine snapshotted the corpus and credited all 264 Markdown studies (5.2 M characters) in a contiguous reading ledger. Pine then wrote a routing guide, eight decision notes and a lexical search.

**Phase 2: independent audit (Bodhi, 2026-10-18).** Kotaro doubted that the result was enough, so nine auditors re-read the corpus in slices, including the very large continuation files from start to finish. Each auditor checked every guide claim against its source. The audit found:

- **Accuracy was good.** Of about 150 claims checked, none was materially wrong and one was overstated. One attribution was unsupported: the guide cited "a useful result" and "second model agreement" to `synthesis.md`, which says neither.
- **Coverage was the problem.**
  - The guide drew on a small fraction of the studies.
  - About 200 internal corrections were not carried.
  - Several stale "next step" passages still proposed stopped work.
  - Search found the answering passage within its top five results for only 35% of independently written questions.
- **The reading credit was doubtful.**
  - All 5.2 M characters were credited in about 41 minutes.
  - Two ledger notes described content that is not in the file they cite: the continuation-exhaustion notes for lines 1–52 and 799–802.
  - The notes were never shown to future agents.

The full audit reports sit outside the repository, in the session scratchpad (`audit-consolidated.md`).

**Phase 3: register rebuild (Bodhi, 2026-10-18).** Kotaro approved the rebuild and Pine released this directory.

- **Extraction.** The same auditors turned their slices into structured entries. Two slices (toolchain and authorization) and the independent question writer were stopped mid-write by a safety classifier; none of them retried. Bodhi wrote those two slices' entries by hand from the completed audit reports, framed as what assessors should and should not conclude. The question set was salvaged at 54 complete questions.
- **Guide and search.** The guide was rewritten around the register, and search was rebuilt so that section-level chunks rank independently of file size.

## Verification

- **Quotes.** `node docs/research/reconciliation/find-research.mjs --check` verifies the schema, then every source, contrary, correction and hazard quote verbatim against its cited line (±2, whitespace and emphasis normalized), every receipt path, every guide and digest link, and every register ID cited in the guide. The result is currently 0 problems. This proves the citations are real; it does not prove the conclusions are correct.
- **Retrieval.** `node docs/research/reconciliation/find-research.mjs --eval [file] [--k N]` reports whether the answering passage or a finding citing it appears in the top N results, at k = 5:

  | Question set | Original search, passage | Register search, passage | Register search, passage or finding |
  | --- | --- | --- | --- |
  | [heldout-questions.json](eval/heldout-questions.json): 54 questions by a writer with no access to the register | 35% | 81% | 100% |
  | [auditor-questions.json](eval/auditor-questions.json): 52 questions from the phase-1 auditors | 62% | 77% | 100% |

  - **How to reproduce the baseline:** [eval/baseline-pine-search.mjs](eval/baseline-pine-search.mjs) re-implements the original ranking.
  - **The auditor set is optimistic.** Its authors also wrote the register entries.
  - **One fix was made after the first held-out run.** Its single miss exposed a stop-word bug: "get" was dropped, so HTTP GET questions failed. The fix and a read-only/state-changing synonym group are general rather than question-specific, but they were made after seeing that question.
  - **What the metric means.** It checks line overlap, not whether the answer is right.
- **Answer-level judgment.** A separate reviewer ran every held-out question and read only the top three findings and passages. Of 54 questions, 52 were answered in that output and 2 pointed to the right file without stating the answer. None was misleading or missed. Those two exposed gaps in the hand-written toolchain slice: Prowler doing work at import time, and Nmap proxy-chain limits. Both were added to the register afterwards, so they no longer test the register blind.
- **Guide verification.** A third reviewer checked every factual statement in USE-RESEARCH.md against its register entries and source lines, plus a sample of 25 uncited findings.
  - **Guide errors:** 6 wrong statements and about 15 missing limits, all corrected. Examples: a mislabelled percentage, a test that was read but not run listed as runtime-confirmed, a pricing instruction that contradicted its card, and an unsupported "one role at a time".
  - **Card errors:** 2 strength labels, 2 overstated cards, 7 off-by-one citations, and 8 cards whose claims rested partly on uncited lines. All were fixed, and the validator now requires the exact cited line.
  - **Sample:** none of the 25 sampled findings contradicted its source.

## What remains open

- **Supporting files are mostly unread.** These are the JSON receipts (18 of 580 credited), scripts and Go fixtures. Auditor spot checks of about 30 receipts all matched their Markdown summaries, except one PDF receipt with no extractable text (the Takumi benchmark).
- **The register covers what auditors judged decision-relevant.** Absence from the register is not absence from the research, so use passage search and `rg` for anything else.
- **Most findings are source-trace.** 175 of 325 come from reading code; only 6 come from a real integrated tool run.
- **Some slices were not re-read in full.** The assessment-core auditor read every file in its slice, finishing the files it had first read only in part. The two hand-written slices were built from the complete audit reports and the cited lines, not from a fresh full re-read.
- **Synapse strategy documents are not in this repository.** The mapping cites files from a Downloads folder.
- **The register is not a product decision.** NBRET's existing code is a prototype to assess. Stopped operations stay stopped; see [safety-context](../safety-context/README.md) and the hazards.
