# Rebrand to buyKꞰsell & Google Sign-In Branding Configuration

Rebrand the platform to **buyKꞰsell** with custom stylized typography where two mirror-opposed 'K's seamlessly join to form an 'N' ("buy-N-sell"), purge all legacy Kollecto P2P references, set the browser title to **Buy and Sell**, and update the Google sign-in UI and administrative consent configuration.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed during interactive clarification and govern this implementation:

- **Stylized Typography for `buyKꞰsell`**: Confirmed custom stylized lettering where the forward `K` and reversed `Ʞ` touch along their diagonal stems to visually evoke an `N` glyph while maintaining crisp rendering across light/dark themes.
- **Google Sign-In Consent Screen Title**: Confirmed updating all in-app sign-in UI to explicitly state "Sign in to Buy and Sell" / "buyKꞰsell", accompanied by direct Google Cloud Console & Supabase configuration steps to adjust the external Google OAuth consent dialog app name.
- **Browser Title & Meta**: Confirmed setting the browser tab title and meta tags to **Buy and Sell**.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms all website brand touchpoints from "KollectoP2P" to **buyKꞰsell**, featuring custom SVG/CSS typography where `K` and reversed `Ʞ` merge into an `N`. Configures page titles to **Buy and Sell**, and harmonizes the authentication flow to explicitly reflect the Buy and Sell identity.
- **Target Audience / Persona**: IISER Mohali campus students, faculty, and campus community members buying and selling hostel goods, cycles, electronics, and books.
- **Key Value**: A memorable visual identity ("buy-N-sell") with zero legacy branding clutter and immediate, transparent sign-in trust.

---

## 2. User Experience & Visual Design

### A. The `buyKꞰsell` Joined-K Wordmark
- **Typography & Geometry**:
  - `buy`: Rendered in font-black sans with tight letter-spacing.
  - `KꞰ` (The Ligature): A custom styled lockup consisting of an upright `K` and a horizontally mirrored `K` (`scaleX(-1)`), drawn with calibrated negative kerning (`-tracking` and margin overlap) so their inner diagonal arms intersect and form the diagonal stroke of a bold capital **N**, flanked by the two vertical stems.
  - `sell`: Rendered in matching font-black sans.
  - Color treatment: Accent highlight on the `KꞰ` ligature (`var(--text-accent-hero)`) ensuring visual pop in both dark and light modes.
  - Full accessibility: Semantic `aria-label="buyKꞰsell"` and `title="buyKꞰsell - Campus Marketplace"`.

### B. Google Sign-In Interface & Consent Screen Guidance
- **In-App Action**: Button labels updated from generic to intentional:
  - `"Sign in to Buy and Sell with Google"` on `LoginPage.jsx` and `AuthModal.jsx`.
- **Admin Configuration Guide**: An administrative helper dialog accessible to operators explaining how Google's external OAuth consent dialog displays the app title:
  - Step 1: In **Google Cloud Console** > *APIs & Services* > *OAuth consent screen*, set **App name** to `Buy and Sell`.
  - Step 2: In **Supabase Dashboard** > *Authentication* > *Providers* > *Google*, verify custom OAuth client ID integration so Google shows `Buy and Sell` rather than the raw Supabase project reference URL.

### C. Clean Page Title & Meta Tags
- `index.html` title set cleanly to `<title>Buy and Sell</title>`.
- OpenGraph title set to `Buy and Sell - Campus Marketplace`.
- Zero remaining instances of "Kollecto", "KollectoP2P", or "p2p" across any component, loader, or style files.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Joined-K Typography (Component vs Font vs Static Character)**
  - *Chosen Approach*: A dedicated, self-contained `BrandLogo` component using structured SVG and CSS optical alignment.
  - *Why*: Standard Unicode `Ʞ` (turned K) renders with variable font baselines across macOS, Windows, and Android, frequently breaking the diagonal intersection. A calibrated CSS/SVG lockup guarantees that the two Ks form an unmistakable `N` on every screen, DPI, and mobile browser.
  - *Alternative Rejected*: Plain unstyled Unicode text `buyKꞰsell` alone, which produces disjointed letterforms on some system fonts.

- **Decision 2: Google Sign-In Consent Screen Title Handling**
  - *Chosen Approach*: Update client-side button text and authentication headers to `"Sign in to Buy and Sell"`, while providing the administrative steps to update Google Cloud Console's OAuth consent screen.
  - *Why*: Google's remote OAuth consent screen (`accounts.google.com`) strictly pulls its headline title from Google Cloud Console's *OAuth consent screen > App name* setting. Client-side code cannot arbitrarily overwrite Google's security headers, so coupling clean in-app copy with exact Cloud Console setup ensures both local and Google-hosted screens match.

---

## 4. Technical Architecture & Data Strategy

### System Layout & Brand Asset Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                            │
│  <title>Buy and Sell</title> · <meta> buyKꞰsell            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
   ┌─────────────────────────┐   ┌───────────────────────────┐
   │    BrandLogo Component  │   │     Supabase / Auth       │
   │  - Upright K + Mirrored Ʞ│   │  - "Sign in to Buy & Sell"│
   │  - Optical N-junction   │   │  - OAuth hint & redirect  │
   └────────────┬────────────┘   └─────────────┬─────────────┘
                │                              │
        ┌───────┴───────┬──────────────┐       │
        ▼               ▼              ▼       ▼
   ┌─────────┐   ┌────────────┐  ┌───────────┐ ┌─────────────┐
   │ Header  │   │ LoginPage  │  │ Skeleton  │ │  AuthModal  │
   │ wordmark│   │ hero card  │  │ loader    │ │  profile    │
   └─────────┘   └────────────┘  └───────────┘ └─────────────┘
```

### Affected Files & Scope
1. **`src/components/BrandLogo.jsx`**: New component providing the canonical `buyKꞰsell` wordmark with the joined-K `N` design.
2. **`src/components/Header.jsx`**: Incorporate `BrandLogo` in the main navbar; verify announcement bar and navigation state.
3. **`src/components/LoginPage.jsx`**: Incorporate `BrandLogo`; update Google sign-in button copy to `"Sign in to Buy and Sell"`.
4. **`src/components/AuthModal.jsx`**: Update sign-in modal button copy to `"Sign in to Buy and Sell"`.
5. **`src/components/SkeletonLoader.jsx`**: Update loading message from "Loading KollectoP2P..." to "Loading buyKꞰsell...".
6. **`index.html`**: Set `<title>Buy and Sell</title>` and update meta/OG tags.
7. **`src/index.css` & `src/App.jsx`**: Clean up theme comments and local storage keys while preserving user theme preference.
