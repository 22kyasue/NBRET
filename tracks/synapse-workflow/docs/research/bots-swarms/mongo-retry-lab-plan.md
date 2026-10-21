# Mongo retry query-scope oracle

Question: does the duplicate-key recovery retry preserve caller-supplied tenant attributes? Execute the unchanged pinned Mongo adapter with an inert collection that records queries, rejects its first two updates with synthetic code11000, then returns a fixed synthetic result. Disable index creation. No Mongo driver/server or packages.

Predeclared oracles: exactly three update calls; first and replacement queries contain `tenant: synthetic-a`; recursive third query loses that attribute; operation returns the fixed result. This proves query construction under the specified errors, not that a real Mongo server selects another tenant or that attributes constitute an authorization system.
