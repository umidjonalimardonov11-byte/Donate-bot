# Catalog rules
- Group catalog categories only for display; retain exact provider slugs for server details, validation and purchases to preserve the Railway API contract.
- Load catalog presentation extensions after the existing Mini App script so unrelated bot changes remain intact.
- Run node --test test/catalog.test.js when changing grouping.
