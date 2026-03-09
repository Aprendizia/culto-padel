# CPAM Brand Identity — Circuito de Pádel Amateur Mexicano

## Logo Assets (saved to `public/brands/cpam/`)
- `logo-orange.png` — Primary orange version (on white/transparent)
- `logo-black.png` — Monochrome black version (on white)
- `logo-white.png` — White version (for dark backgrounds — appears blank on white)
- `logo-source.pdf` — Illustrator source file (multi-page brand guide)
- `sponsors-mascot.png` — Mascot with sponsor logos

## Typography
- **Logo wordmark "CPAM":** Bold italic sans-serif, ultra-heavy weight. Rounded terminals.
  - Font match: Transducer Test Condensed Bold Oblique (from AI file metadata)
- **Tagline "CIRCUITO DE PADEL AMATEUR MEXICANO":** Sans-serif, uppercase, wide letter-spacing
  - Font match: Transducer Test Extended Medium Oblique (from AI file metadata)
- **Web alternatives:** Montserrat Black Italic / Oswald Bold Italic for CPAM, Montserrat Medium for tagline

## Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `cpam-orange` | `#F5A623` | Primary brand color — logo, accents, CTAs |
| `cpam-black` | `#1D1D1B` | Text, monochrome logo |
| `cpam-white` | `#FFFFFF` | Backgrounds, inverted logo |

## Logo Description
- Padel racket integrated above/behind "CPAM" text
- Racket head has grid of circular perforations (classic padel racket pattern)
- Handle with grip texture flows into the letterforms
- Italic slant conveys movement and sport dynamism
- Monochromatic — single flat color, no gradients

## Sponsors
1. **Luckia.mx** — Online betting/gaming. White + orange, four-leaf clover icon
2. **Pilgrim's** — Poultry/food brand (Alitas Picositas). Navy + red + orange, red rooster icon
3. **All for Padel** — (from IG research, no logo asset yet)
4. **Wilson** — Sporting goods (rackets)

## Social Media
- Instagram: @circuito_padel_amateur_mx (~7.8K followers)
- TikTok: @cpam_mx
- Facebook: Circuito de Pádel Amateur Mexicano

## Brand Voice
- Fun, community-driven, amateur/accessible
- Sporty, energetic
- Spanish-only
- Targets recreational padel players in Mexico

## White-Label Tenant Config (for DB)
```json
{
  "slug": "cpam",
  "name": "Circuito de Pádel Amateur Mexicano",
  "custom_domain": "cpam.com.mx",
  "brand_colors": {
    "primary": "#F5A623",
    "secondary": "#1D1D1B",
    "accent": "#F5A623",
    "background": "#FFFFFF"
  },
  "logo_url": "/brands/cpam/logo-orange.png",
  "favicon_url": "/brands/cpam/logo-orange.png"
}
```
