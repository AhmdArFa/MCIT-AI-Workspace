# Thoth AI Agent, Layered-u Brand Pack (OLED edition)

Source: concept D, "D · Layered u", from TuT Logo Concepts.
Nemes stripes folded into the u of TuT: three nested u arches. Geometry is faithful to the original; the colors were reworked for OLED (the dark gradient background became true black).

## Files

- `svg/thoth-layeredu-master.svg`, vector master (viewBox 180, true black background)
- `svg/thoth-layeredu-mono-ivory.svg`, single-color variant on black
- `svg/thoth-layeredu-light.svg`, light-surface variant
- `icons/Thoth-LayeredU-<size>.png`, primary app icon at 16, 32, 48, 64, 80, 87, 120, 152, 167, 180, 192, 256, 512, 1024
- `variants/Thoth-LayeredU-mono-ivory-1024.png` and `Thoth-LayeredU-light-1024.png`
- `Thoth-LayeredU-Preview-Sheet.png`, one-page visual summary of the pack

Use `Thoth-LayeredU-1024.png` as the app icon source. It is a full-bleed square on true black; the platform applies its own mask (iOS squircle, Android adaptive).

## Palette

| Role | Hex | Name |
|---|---|---|
| Background | #000000 | OLED Black |
| Outer arch | #F7EF8A | Pale Gold (matches the MCIT Noir palette) |
| Middle arch | #16A6E9 | Pulse Blue (matches the MCIT Noir palette) |
| Inner arch | #F8F5EC | Ivory |
| Arches, light variant | #B7791F | Bronze Gold |
| Middle arch, light variant | #1E507A | Royal Blue |

## Construction

- Three nested u arches, stroke 12, round caps and joins, viewBox 180.
- Outer: M40 44V90a50 50 0 0 0 100 0V44. Middle: M60 58V92a30 30 0 0 0 60 0V58. Inner: M80 72V94a10 10 0 0 0 20 0V72.
- Clearspace: keep a margin of one stroke width (12 units) around the mark.
- Minimum size: 16 px digital. Below that, use the mono ivory variant.

## Rules

- Do not recolor the arches outside this palette.
- No gradients, glows, shadows, or glassmorphism on the mark.
- Do not change the nesting order or the spacing of the arches.
- On light surfaces, use the light variant (ivory background, bronze arches, royal blue middle).
