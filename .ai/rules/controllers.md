---
paths:
  - 'app/Http/Controllers/**'
---

# Controllers

## Student discovery is offer-scoped
Authenticated student discovery must never query all published courses. /courses and the student dashboard show only the user's payable offers; course access remains exclusively enrollment-based.
