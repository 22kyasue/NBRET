# What Microsoft's phishing experiment measured

[Microsoft-authored preprint, arXiv v1, 2025-11-17](https://arxiv.org/html/2511.13860), accessed 2026-10-17. Full HTML methods/results/appendices read; artifacts were not independently reproduced.

The study reports 167 external analysts assigned to random-order control, prioritized-queue-only, or prioritized queue with agent explanations. Each classified 25 emails drawn from a 93-email Microsoft employee corpus. Researchers inserted synthetic wrong verdicts/explanations because the agent made no errors on the original small corpus. Thirteen low-scoring responses were excluded.

The headline 6.53× true positives per analyst time combines measured behavior with a modeled protocol that removes agent-labeled benign mail from human review. It is **not an observed whole-SOC production speedup**. Roughly 83% of that scenario's gain comes from queue filtering/prioritization. The pessimistic counterfactual yields 3.07×.

The reported 77% improvement concerns F1, not a 77-percentage-point increase in accuracy. In the imperfect-agent scenario, recall's change was not statistically significant; this is not proof of equivalence or universal safety. Analysts shown AI judgments missed more synthetic false negatives.

Interpretation: useful causal evidence for this bounded task, with vendor authorship, small corpus, artificial errors, short forced-choice work and counterfactual workflow assumptions limiting deployment generalization.
