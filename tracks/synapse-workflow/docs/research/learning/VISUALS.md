# Beginner visual edition

Kotaro requested pictures, diagrams and clean motion, then clarified that the previous overview assumed too much baseline knowledge. The reader now teaches through a fictional online shop with Alice and Bob. Technical articles remain available as optional deeper reading.

## Content and design

- `beginner.json` supplies the eight plain-English lessons, illustrated steps, comparison choices and recall answers. Stable topic IDs and the `nbret-learning-v1` storage key are preserved.
- `reader-visuals.js` supplies the short home page and concrete visual comparisons, including a reply label versus its private contents and a before/after repair check.
- `scripts/build-learning-visuals.mjs` creates sixteen original inline SVG illustration primitives and eight responsive, standalone figure pages. Figures are also embedded into the main HTML, which remains usable offline.
- `visual-motion-controller.js` is copied verbatim from the installed diagram-design `assets/template-motion.html` controller. Each figure has its own sandboxed document, controls, clock and media preference. All semantic text remains readable throughout playback. Text/step numbers and outlines distinguish state without relying on color.
- Kotaro explicitly selected “Match this reader’s cream/ink/orange style” on October 17, 2026. Colors and intentional system font stacks come from `reader.template.html`: paper `#f5f5f5`, ink `#2d3142`, accent `#b94c21`, tint `#f8ede6`, Segoe UI / Arial, Georgia, Consolas. No shared installed skill tokens were changed.

Local design references consulted: Prompt's `design.md` and the saved TOBIRA editions of `componentry-circuit-board` and `componentry-flight-status-card`. Their source metadata remains in that library. This implementation uses original SVG drawing code and a source-qualified teaching model, without copying the reference components. The circuit reference informed legible paths and the status-card reference informed separation of action progress from outcomes.

## Verification

Computeruse MCP and its existing `harness.browser.Page` APIs verified the reader in Chrome. All eight topic routes, iframe rendering, comparison selection and source targets passed. The standalone figure's Next control advanced the current step; playback finished at step five and stopped. Real browser media emulation confirmed reduced-motion mode shows the complete static figure with playback unavailable. All eight topics fit a 390px viewport without page overflow; responsive figure heights shrank again on desktop resize. Desktop and mobile appearance were visually inspected. All sixteen SVG primitives parse as XML, and all embedded data and executable scripts parse.

Temporary verification scripts, receipts and screenshots remain in ignored local storage under `runs/reader-visual-review/` and the computeruse screenshot archive. These checks establish reader behavior, not security findings.

Rebuild with `node scripts/build-learning-reader.mjs`. A local HTTP preview is available with `node scripts/serve-learning-reader.mjs`; the standalone `index.html` does not require it. Source research may advance after this snapshot.
