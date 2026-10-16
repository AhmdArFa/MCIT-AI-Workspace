# Thoth AI Agent, Cartouche Brand Pack (OLED edition)

Source: concept E, "E · Cartouche", from TuT Logo Concepts.
The royal name ring spelled T u T. Geometry is faithful to the original; only the colors were reworked for OLED.

## Files

- `svg/thoth-cartouche-master.svg`, vector master (viewBox 180, true black background)
- `svg/thoth-cartouche-mono-ivory.svg`, single-color variant on black
- `svg/thoth-cartouche-light.svg`, light-surface variant
- `icons/Thoth-Icon-<size>.png`, primary app icon at 16, 32, 48, 64, 80, 87, 120, 152, 167, 180, 192, 256, 512, 1024
- `variants/Thoth-Icon-mono-ivory-1024.png` and `Thoth-Icon-light-1024.png`
- `Thoth-Brand-Preview-Sheet.png`, one-page visual summary of the pack

Use `Thoth-Icon-1024.png` as the app icon source. It is a full-bleed square on true black; the platform applies its own mask (iOS squircle, Android adaptive).

## Palette

| Role | Hex | Name |
|---|---|---|
| Background | #000000 | OLED Black |
| Cartouche ring + base bar | #F7EF8A | Pale Gold (matches the MCIT Noir palette) |
| Letters T u T | #F8F5EC | Ivory |
| Ring, light variant | #B7791F | Bronze Gold |
| Letters, light variant | #1E1B4B | Deep Navy |

## Construction

- Royal cartouche: rounded rect x=28 y=54 w=112 h=72 rx=36, plus the closing base bar M150 46V134.
- Stroke width 7, round caps and joins, viewBox 180. Unchanged from concept E.
- Letters T u T drawn as strokes inside the ring, on the optical axis.
- Clearspace: keep a margin of one stroke width (7 units) around the mark.
- Minimum size: 16 px digital. Below that, use the mono ivory variant.

## Rules

- Do not recolor the ring outside this palette.
- No gradients, glows, shadows, or glassmorphism on the mark.
- Do not move the letters outside the ring or stretch the cartouche.
- On light surfaces, use the light variant (ivory background, bronze ring, navy letters).
