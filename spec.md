# CIVIXA

## Current State
The app uses a `BackgroundLayout` component that applies a `.bg-hero` CSS class — a static dark gradient overlaid on a fallback JPEG image (`background-fallback.dim_1920x1080.jpg`). A `.scan-line` pseudo-element overlay adds a subtle scanline effect.

## Requested Changes (Diff)

### Add
- A looping, muted, autoplay HTML5 `<video>` element as the full-page background layer inside `BackgroundLayout`.
- A semi-transparent dark overlay (same navy tint as the current gradient) placed over the video so existing glass UI remains readable.
- A civic/urban infrastructure themed ambient video (generated or embedded as a data-URI fallback placeholder; since we can't fetch external video at build time, use a CSS animated gradient as the video "fallback" that mimics motion).

### Modify
- `BackgroundLayout.tsx`: replace the static `.bg-hero` div with a positioned `<video>` element (autoPlay, loop, muted, playsInline) plus an overlay div, keeping the `.scan-line` effect on the wrapper.
- `index.css`: keep `.bg-hero` as fallback for when video fails/is unsupported; add `.video-bg` and `.video-overlay` utility classes.

### Remove
- Nothing removed — static background kept as CSS fallback.

## Implementation Plan
1. Update `BackgroundLayout.tsx` to include a `<video>` tag pointing to a hosted ambient city/infrastructure video URL (use a free public CDN video), with the dark overlay preserved.
2. Add `.video-bg` and `.video-overlay` CSS classes in `index.css`.
3. Keep the scanline effect on the outer wrapper.

## UX Notes
- Video must be `autoPlay muted loop playsInline` to work on mobile.
- The overlay opacity should be high enough (~0.75–0.85) that glass cards remain clearly readable.
- Video should not affect scroll behavior — use `position: fixed` or `absolute` with `z-index: -1`.
