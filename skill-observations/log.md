# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue — resolved statuses always carry their resolution date

---

- 2026-08-16 checkpoint: no reusable skill observations after the client-portal research, architecture, and scaffold milestones.

### Observation 1: Verify compact control geometry instead of trusting font metrics

**Status:** OPEN
**Date:** 2026-08-16
**Session context:** Completing and visually verifying a responsive administration shell.
**Skill:** frontend-design
**Type:** open-source
**Phase/Area:** Component polish and browser verification

**Issue:** A directional text glyph was mathematically centered by layout CSS but remained visibly off-center because its font bounding box and optical weight were asymmetric.

**Suggested improvement:** In the build-and-critique phase, require SVG or CSS-drawn geometry for compact directional controls and verify the child-to-parent center delta in the rendered browser alongside a screenshot.

**Principle:** Optical alignment in small controls should be verified from rendered geometry and visual weight, not inferred from flex or grid centering alone.

### Observation 2: Cross-origin flows require shared-state assertions

**Status:** OPEN
**Date:** 2026-08-16
**Session context:** Completing and verifying a multi-application product with separate public, admin, and client origins.
**Skill:** do
**Type:** open-source
**Phase/Area:** Integration verification

**Issue:** Independently functional browser-local workflows initially appeared connected, but localStorage is origin-scoped, so records written by one application could never be observed by another application on a different origin.

**Suggested improvement:** Add an explicit cross-origin data-flow checkpoint before declaring a multi-app phase complete: create through the producer UI, verify through the shared API, consume through the second UI after reload, and reject tests that only assert optimistic presentation.

**Principle:** Multi-app integration is proven only when state crosses origins through a shared trusted boundary and survives reload; parallel local state is not integration.

### Observation 3: Scope toolbar CSS away from nested popovers

**Status:** OPEN
**Date:** 2026-08-16
**Session context:** Repairing a client account dropdown after adding shared top-bar controls.
**Skill:** frontend-design
**Type:** open-source
**Phase/Area:** Component CSS and regression testing

**Issue:** A broad descendant selector for top-bar buttons and links forced every nested account-menu row into the toolbar control's fixed 40 by 40 geometry, collapsing otherwise correct popover content into an unreadable stack.

**Suggested improvement:** Require shared toolbar rules to target direct children or dedicated control classes, and add rendered row width and minimum-height assertions whenever a toolbar contains nested menus.

**Principle:** Container-level control styling must stop at the component boundary; nested interactive surfaces need independent geometry.
