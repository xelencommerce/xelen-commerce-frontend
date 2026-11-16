# Authentication feature

Login, MFA, and password recovery follow the approved Zellen Commerce design. These are interactive frontend previews; no user is authenticated, no message is sent, and no password is changed.

## Ownership

- `pages/` composes each route and its local flow.
- `components/` owns the auth shell, field composition, forms, OTP controls, feedback, and resend controls.
- `components/marketing/` owns independent React cards and native SVG charts for the shared visual panel. Shapes remain separate for future animation work; no animations are currently applied.
- `schemas/` owns Zod validation and inferred form types.
- `hooks/` owns the local email context, page titles, and resend cooldown.
- `types/` owns presentation-only flow types.
- `styles/auth.css` owns centralized, scoped auth tokens and responsive styles. Admin, Merchant, and the registration placeholder retain the shared foundation theme.

Public page and shell exports live in `index.ts`; `app/router` assembles their lazy routes. No feature services or backend contracts are invented.

## Routes and preview behavior

| Route                          | Behavior                                                                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`                       | Empty initial fields, email/required-password validation, password visibility, and an in-memory remember checkbox. Valid input clears credentials and opens method selection. |
| `/login/verify`                | Local navigation to SMS or authenticator entry. The masked number is illustrative Figma content, not an account lookup.                                                       |
| `/login/verify/sms`            | Six-digit entry, paste/autofill, keyboard editing, a 45-second resend cooldown, and an explicit unverified completion message.                                                |
| `/login/verify/authenticator`  | The same OTP component; help returns to method selection.                                                                                                                     |
| `/forgot-password`             | Email validation, then a local confirmation preview.                                                                                                                          |
| `/forgot-password/check-email` | Uses the entered email or generic direct-visit wording, original illustration, local resend feedback, and an explicit link to preview password reset.                         |
| `/reset-password`              | Live password requirements, matching confirmation, visibility controls, and a completion notice stating that no password changed. Values clear on valid submission.           |

`/register` remains a placeholder. Sign-up, company setup, KYC/KYB, production sessions, reset tokens, and backend authentication are outside this implementation.

Email is kept only in the mounted shell's React state. Passwords and OTP values stay in local form state and clear after valid submission. There is no local/session storage, cookie, URL, log, or API persistence of credentials. Direct visits are permitted for reviewing the pages; they do not represent an authorized recovery session.

## Design provenance

Source: [Zellen Commerce — Login & Auth](https://www.figma.com/design/AvbnG0nM6qLZGDXOtJkdmW?node-id=1031-18), file `AvbnG0nM6qLZGDXOtJkdmW`, section `1031:18`, inspected November 16, 2026.

| Screen                     | Figma nodes                        |
| -------------------------- | ---------------------------------- |
| Login and rejection        | `1031:23`, `1031:232`              |
| Method selection           | `1031:411`                         |
| SMS, filled, and rejection | `1031:564`, `1031:720`, `1031:876` |
| Authenticator              | `1031:1036`                        |
| Forgot password            | `1032:2505`                        |
| Email confirmation         | `1056:33948`                       |
| New password               | `1032:2654`                        |

Exact MCP node metadata was available for login and method selection. Figma then rate-limited detailed node reads. All ten reference PNGs, the original avatar images, and the original email illustration were available through Figma's read-only export endpoints. The remaining screens use the approved screenshot-based measurements and shared node-derived tokens. No reference screenshot is used as an interactive page or background.

At 1440×900 the measured frame uses an 8px outer inset/gap, a 712×884px white panel with 16px corners, 88px horizontal form padding, a 536px form, and 48px inputs/buttons with 12px corners. Login content starts at x=96, y=246; the method-selection block starts at y=298. The shared heading is Geist 500 at 32/40; the marketing heading is 64/64. Revenue values use Geist Mono 500 at 32/36.

The OTP height (64px), gaps (12px), recovery composition, password-meter layout, and rejection-banner treatment were matched to the exported images. The email illustration's 536×240 dimensions come from its actual exported SVG. Mobile layouts below 1024px are an approved adaptation; no mobile Figma frames were supplied. Form controls never clip; only the decorative marketing panel crops on desktop as shown in Figma. Short desktop viewports use normal-flow feedback to prevent overlap.

Original avatar images and email artwork live in `src/assets/images/auth`. Chart paths and brand glyphs come from the exported Figma SVG and remain native React SVG elements. Common UI icons use Lucide. The marketing values, dates, names, and messages are static design content rather than live business records.

Geist Regular/Medium/Semibold and Geist Mono Medium are self-hosted WOFF2 files from [Vercel's official font repository](https://github.com/vercel/geist-font), commit `ef2597cfc42f4797676df105517ccc0a1cfa6569`. Their SIL Open Font License is retained beside the fonts in `src/assets/fonts/geist/OFL.txt`.

## Intentional differences and unavailable specifications

- Initial credentials are empty rather than prefilled. The design's filled and rejection states are exercised through interaction and component fixtures.
- Preview notices explain that verification, email, and password operations are not real. They occupy the feedback area on desktop and normal document flow on mobile/short viewports.
- Only the documented 30-day remember preference is shown; no unspecified duration dropdown is invented. This is a local preference without session behavior.
- Privacy and Terms remain plain footer text because destinations were not supplied.
- Authenticator help returns to method selection because no support destination was supplied.
- No password-reset success screen was supplied; the frontend reports preview completion without claiming a password change.
- Rejection banners are component states tested with fixtures. The frontend does not decide that specific credentials or codes are wrong.

## Verification

Run `npm run check` from `frontend/`. Tests cover route composition, forms, password policies, OTP paste/navigation/autofill, error fixtures, timer cleanup, and a full frontend flow without network or storage writes. Use a real browser for desktop reference comparison, responsive layout, focus behavior, back navigation, and production-bundle verification.

Future backend integration must provide authoritative authentication/MFA challenges, delivery and resend policies, reset-token validation, session transport, error contracts, and tenant authorization. Replace the preview handlers only after those contracts are agreed.
