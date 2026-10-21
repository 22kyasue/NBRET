# LAC xPDR: two different SIEM operating models

Accessed October 17, 2026; three public pages' main text read completely. Diagrams were not visually inspected.

## Microsoft 365-oriented xPDR

The [service page](https://www.lac.co.jp/operation/jsocxpdr.html), product list dated July 2026, uses the customer's Sentinel primary workspace; secondary workspaces are excluded. Customer prerequisites include contact details, Internet access permission to Microsoft 365 and Azure Lighthouse delegation. Portal registration/preconfiguration follow provider documents; customer-built Sentinel is an option. Approximately two months from contract is a possibility, not a measured commitment.

Monitoring, applicable condition-triggered response instructions, missing-log contact and intelligence distribution are continuous. Routine rule changes occur during weekday daytime; emergency tuning is continuous. A 24-hour inquiry window does not mean all incident answers are continuous: the footnote limits those answers to weekday daytime. Monthly reporting and storage are listed without retention days.

Isolation/authentication-denial examples establish possible automated actions, not exact per-action approval, remote completion or rollback. Those policies remain unreviewed.

## Splunk-oriented Advanced

The [April 21 announcement](https://www.lac.co.jp/news/2026/04/21_press_01.html) set October 1, 2026 availability. It describes delegated isolation/investigation as an option and AI-assisted detection/analysis/response as future expansion. Passing the scheduled date does not prove a customer deployment or completed AI release.

The [current Advanced catalog](https://www.lac.co.jp/operation/jsocxpdr_advanced.html) lists managed SIEM infrastructure/licenses, monitoring, operating maintenance and reporting. Unlike its broad headline, the detailed table puts hunting in weekday daytime and emergency response in an optional menu. Supported sources span identities, endpoints, gateways, cloud records, storage and mail.

Customer prerequisites include source/environment information, Syslog collection, Internet connectivity and a provider- or customer-supplied Azure tenant. Timing depends on Splunk construction. Exact access roles, raw-log retention, response clock and recovery completion criteria are absent. Prices require individual quotation.

## Interpretation

The shared name does not justify applying Sentinel's delegation details to the Splunk service. Operational claims need the purchased menu, product path and authority matrix.
