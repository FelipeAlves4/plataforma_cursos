---
paths:
  - 'app/Http/Controllers/Admin/**'
---

# Admin

## Program handoff preselects only active programs
When a new program is saved with redirect_to_offer, redirect to the offer creation flow with program_id. Offer creation must honor program_id only when that program is active; inactive or invalid IDs must not be preselected.
