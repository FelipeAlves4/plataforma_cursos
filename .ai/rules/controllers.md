---
paths:
  - 'app/Http/Controllers/**'
  - app/Http/Controllers/OfferCheckoutController.php
---

# Controllers

## Student discovery is offer-scoped
Authenticated student discovery must never query all published courses. /courses and the student dashboard show only the user's payable offers; course access remains exclusively enrollment-based.

## Checkout external redirects use Inertia location responses
The checkout endpoint must return the Symfony base Response so it can return both back()->withErrors() and Inertia::location(). For an Inertia request, external checkout redirects must remain 409 responses with X-Inertia-Location; do not replace them with redirect()->away().
