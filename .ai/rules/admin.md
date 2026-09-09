---
paths:
  - 'app/Http/Controllers/Admin/**'
  - app/Http/Controllers/Admin/CheckoutLinkController.php
---

# Admin

## Program handoff preselects only active programs
When a new program is saved with redirect_to_offer, redirect to the offer creation flow with program_id. Offer creation must honor program_id only when that program is active; inactive or invalid IDs must not be preselected.

## Checkout link reporting uses paid orders only
Commercial metrics, per-link revenue, sales counts, and latest sales must include only orders whose status is PAID and whose checkout_link_id is set. Never derive these values from pending or failed payments; deactivating a link preserves its historical orders.
