# CIVIXA

## Current State
The public Home dashboard shows every service as an individual card in a grid -- including all 10 banks and all 10 ISPs as separate flat cards. This creates a very long list and buries important summary information.

## Requested Changes (Diff)

### Add
- A grouped "Bank Branch Operations" card on the Home dashboard that shows an overall/aggregate status and expands via a dropdown to reveal each of the 10 banks individually.
- A grouped "Internet" card on the Home dashboard that shows an overall/aggregate status and expands via a dropdown to reveal the **top 5 ISPs** (BSNL, Jio Fiber, Airtel, ACT Fibernet, Hathway) individually with their statuses.

### Modify
- Home page service grid: replace the 10 individual bank service cards with one grouped `BankGroupCard`, and replace all 10 ISP cards with one grouped `InternetGroupCard`.
- The aggregate/overall status of each group card is the worst status among its members (Interrupted > Warning > Operational).
- The dropdown list inside each group card shows each member's name and its individual StatusBadge.

### Remove
- Individual flat service cards for each bank and each ISP on the public Home page (they remain in admin panel unchanged).

## Implementation Plan
1. Create a `GroupServiceCard` component that accepts a group label, an icon, a list of `CivixaService` items, and renders:
   - Header row: group icon, group name, aggregate StatusBadge
   - Collapsible dropdown list: each service name + its individual StatusBadge
2. In `Home.tsx`, separate `locationServices` into:
   - `bankServices` = services whose name matches known bank names
   - `ispServices` = top 5 ISP services (BSNL, Jio Fiber, Airtel, ACT Fibernet, Hathway)
   - `otherServices` = everything else
3. Render `otherServices` as flat `ServiceCard`s, then one `GroupServiceCard` for banks (all 10) and one for internet (top 5 ISPs).

## UX Notes
- Dropdown toggle should be a chevron icon button.
- Aggregate status badge is shown collapsed; individual statuses are visible when expanded.
- Expanded state defaults to collapsed (closed) to keep dashboard clean.
- Group card visual style matches existing `glass-card` aesthetic.
