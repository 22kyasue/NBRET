# Takumi blackbox benchmark: what the measured comparison covers

Read **2026-10-17**, all nine extracted pages of the [2025-12-05 vendor benchmark](https://hs.flatt.tech/hubfs/Takumi%20Benchmark%20Report/Takumi%20%28Blackbox%29%20Benchmark%20Report.pdf). No target or benchmark code was executed.

GMO Flatt built one simulated e-commerce application with 25 planted vulnerabilities, supplied ordinary/admin accounts to both products, and gave neither application hints. AWS Security Agent's source-learning feature was unused. This is a vendor-designed blackbox comparison, not independent production evidence.

Reported recall was **68% Takumi versus 20% AWS**. High-confidence precision was **80% versus 100%**; including all reports reduced Takumi precision to **63.9%**. The reported F1 comparison uses the high-confidence precision. Thus the apparent winner depends on the metric and report threshold.

The vulnerability table supports 17/25 and 5/25 detected cases. The report describes roughly one day versus three hours; it is not an equal-time-budget comparison. Exact deployed models, repeated-trial variation, independent adjudication and a reproducible public target snapshot are not established.

Do not substitute another “96.2% detection” claim for this benchmark's recall or interpret lower recall as a universal ranking of current products. Both products and evaluation scope can change after the report.
