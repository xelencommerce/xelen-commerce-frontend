# Zellen Commerce / ecomiQ

A React and TypeScript frontend for a multi-tenant commerce SaaS with future CRM modules. The application includes a feature-based foundation and Figma-based login, recovery, sign-up, verification, and business-onboarding screens. Authentication and document flows are interactive frontend previews; backend authentication and business workflows are not implemented.

See the [authentication feature guide](src/features/auth/README.md) for the design references, assets, page behavior, and remaining integration requirements.

## Getting started

Use Node **22.20.0** (`.nvmrc`) and npm. Run commands inside `frontend/`:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. The application works with the API URL left blank. `backend/` and the reference project `a2prop` are independent and unchanged.

| Command                | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Start the development server                               |
| `npm run typecheck`    | Check application, tests, and Vite/Vitest configuration    |
| `npm run lint`         | Check TypeScript, React Hooks, and architecture boundaries |
| `npm run format:check` | Verify formatting without changing files                   |
| `npm run format`       | Apply Prettier formatting                                  |
| `npm test`             | Run focused foundation tests once                          |
| `npm run test:watch`   | Run tests during development                               |
| `npm run build`        | Typecheck and generate the production bundle in `dist/`    |
| `npm run preview`      | Serve the production bundle locally after building         |
| `npm run check`        | Run all required quality checks and the build              |

## Folder structure

```text
src/
├── app/
│   ├── providers/       # Query provider and future application providers
│   ├── router/          # Route configuration, root shell, errors, and 404
│   └── App.tsx          # Application composition
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── videos/
├── components/
│   ├── ui/             # Button, Input, Card: domain-independent primitives
│   ├── common/         # Shared application presentation
│   ├── forms/          # Future reusable field composition
│   ├── layout/         # Super Admin and Merchant shells
│   └── feedback/       # Loader and ErrorState
├── config/             # Validated environment configuration
├── constants/          # Application-wide constants, including route paths
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── pages/
│   │   ├── index.ts    # Login/recovery and shared auth shell exports
│   │   └── signup.ts   # Separate lazy registration entry point
│   ├── admin/          # components/, pages/, services/, index.ts
│   └── merchant/       # components/, pages/, services/, index.ts
├── hooks/              # Hooks genuinely shared across features
├── lib/
│   ├── api/            # Axios configuration and the shared ApiError
│   └── query/          # Query client and tenant query-key helper
├── services/           # Future cross-feature integration services
├── store/              # Shared, ephemeral UI state
├── styles/             # Global styles and semantic design tokens
├── test/               # Test setup; behavior tests live beside their code
├── types/              # Types genuinely shared across features
├── utils/              # Pure, framework-independent shared helpers
└── main.tsx            # React startup and global stylesheet import
```

Empty folders use `.gitkeep` so the intended structure survives version control. Add files when there is real behavior to own; remove the relevant placeholder then.

### Architecture rules

1. `app` composes features and shared foundations. Shared folders cannot import `app` or `features`.
2. Features cannot import `app`. Features can use shared modules and other features' explicit public entry points.
3. Import another feature as `@/features/<name>`. Keep its internals private. Within a feature, use relative imports for its own files.
4. Keep types, helpers, schemas, and state local to a feature until multiple features actually need them.
5. Shared `services/` is reserved for cross-feature integrations. Feature-specific requests stay in that feature's `services/`. `lib/api` owns HTTP mechanics.
6. `utils/` owns pure shared helpers. There is no competing `lib/utils` directory.

ESLint checks these layer boundaries for alias and relative imports, re-exports, and literal dynamic imports. Computed import paths should not be used to bypass the boundaries. Use `@/` for imports across folders; the alias is shared by TypeScript, Vite, and Vitest.

Admin and Merchant are role-specific composition areas. Future customers, orders, contacts, or deals modules belong beside them under `features/`; their business logic should not be duplicated inside both role areas. Pages compose feature components rather than growing into the home for request handling and business rules.

To add a feature: create its folder, add only the subfolders it needs, define explicit public exports in `index.ts`, and register lazy pages in `app/router`. Avoid a global barrel that re-exports every feature.

## Routing and current behavior

React Router runs in data mode with a stable browser router, nested `Outlet` layouts, and lazy-loaded feature page modules. Tests use the same route configuration with memory history.

| Path                             | Layout             | Content                                                                        |
| -------------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| `/`                              | —                  | Redirects to `/login` with history replacement                                 |
| `/login`                         | Auth feature shell | Credentials form                                                               |
| `/login/verify`                  | Auth feature shell | Verification method selection                                                  |
| `/login/verify/sms`              | Auth feature shell | SMS OTP entry and local resend timer                                           |
| `/login/verify/authenticator`    | Auth feature shell | Authenticator OTP entry                                                        |
| `/forgot-password`               | Auth feature shell | Reset-link request preview                                                     |
| `/forgot-password/check-email`   | Auth feature shell | Email confirmation preview                                                     |
| `/reset-password`                | Auth feature shell | Password requirements and confirmation                                         |
| `/register`                      | Auth feature shell | Sign-up form                                                                   |
| `/register/verify`               | Auth feature shell | Verification-method setup                                                      |
| `/register/phone`                | Auth feature shell | International phone entry                                                      |
| `/register/verify/sms`           | Auth feature shell | Local SMS verification preview                                                 |
| `/register/authenticator`        | Auth feature shell | Illustrative QR setup                                                          |
| `/register/verify/authenticator` | Auth feature shell | Local authenticator-code preview                                               |
| `/register/business`             | Auth feature shell | Business name                                                                  |
| `/register/industry`             | Auth feature shell | Searchable industry selection                                                  |
| `/register/documents`            | Auth feature shell | Local document-selection preview                                               |
| `/register/submitted`            | Auth feature shell | Submission preview; redirects to documents if the draft has not been submitted |
| `/admin`                         | Super Admin        | Administration workspace placeholder                                           |
| `/merchant`                      | Merchant           | Commerce/CRM workspace placeholder                                             |
| Any unmatched path               | Shared fallback    | 404 with a return link                                                         |

All routes are currently public. Auth forms validate and navigate locally, with clear preview feedback: they do not authenticate, send email/SMS, verify a code, or change a password. No fake session, role guard, token flow, or backend endpoint is implemented. Passwords and codes remain in local form state and clear after valid submission; they are not persisted. Navigation between role areas is for reviewing the foundation, not an access-control mechanism. Future backend authorization must independently validate every request's user and tenant access.

The root provides a skip link, route loading feedback, and a route error boundary. Layouts provide semantic headers, navigation, and main landmarks. Workspace navigation collapses on smaller screens. Shared components expose native HTML props, keyboard behavior, ref support, and ARIA attributes.

## Environment and API client

The sole API environment variable is optional:

```dotenv
VITE_API_BASE_URL=
```

Supply an absolute HTTP(S) URL only when the backend URL and contract are known. `config/env.ts` trims and validates it. Invalid nonempty values stop startup with a configuration error; absent values allow placeholder browsing. Restart Vite after changing environment files. Production environment values are embedded at build time, so rebuild after changing them.

`VITE_*` variables are public browser configuration. Never store credentials, private keys, or secrets in them. Local environment files are ignored; `.env.example` is tracked.

Use the shared `apiClient` from `lib/api/client.ts` in future feature services. It has a 15-second timeout and accepts Axios request options, including `signal`. An attempted request without a configured base URL rejects before the network adapter runs.

`ApiError` carries a `kind` (`configuration`, `http`, `network`, `cancelled`, or `unknown`), an optional HTTP status, and the original cause. It does not assume any backend error envelope. There are no token interceptors, refresh flows, tenant headers, cookie policies, or invented endpoints. Those require the backend contract.

## State ownership and tenant isolation

| State                                      | Owner                                       |
| ------------------------------------------ | ------------------------------------------- |
| Server records and request lifecycle       | TanStack Query                              |
| Shared presentation state                  | Zustand (`store/`)                          |
| Form values and validation                 | React Hook Form + Zod, local to the feature |
| Shareable filters, pagination, and sorting | URL search parameters                       |
| Local component behavior                   | React state                                 |

The Query client is created once per provider mount. Queries default to a 30-second stale time and one retry for eligible failures. Configuration errors, cancellation, and HTTP 4xx responses are not retried. Mutations are not automatically retried. Override these settings at the feature level when the actual backend semantics require it.

Pass the Query function's `signal` through feature services into Axios so cancellation reaches the transport. Do not duplicate server records in Zustand or persist the Query cache in Step 1. The existing UI store only controls the mobile workspace menu and is not persisted.

For tenant-owned data, use `tenantQueryKey(tenantId, ...resourceAndVariables)` from `lib/query/tenant-query-key.ts`. It requires a nonblank explicit tenant ID; there is no default tenant. Include all parameters affecting results, including filters and pagination. Tenant-independent platform data needs its own separate keys.

Before implementing tenant or session switching:

1. Block new work for the previous context and clear its visible data immediately.
2. Await cancellation of queries under `tenantQueryKey(previousTenantId)`; forward their signals to Axios.
3. Remove that tenant's cached queries and reset any tenant-dependent local/feature state. Clear session-owned caches on logout.
4. Install the next authoritative context and enable its queries. Account for in-flight mutations separately; cancellation cannot undo a completed server write.

Query keys isolate client caches; they do not enforce backend tenant authorization. Tenant discovery, switching, identity sources, and request transport are intentionally deferred until the backend contract is available.

## Design and feature readiness

Tailwind 4 uses its Vite plugin. `styles/tokens.css` centralizes semantic colors, typography, spacing, radii, and shadows through `@theme`; `styles/globals.css` provides base styles and visible focus indicators. Use semantic classes such as `bg-surface` and `text-muted-foreground` instead of scattering brand color values throughout components.

The shared foundation retains its neutral theme and system fonts. The auth feature uses scoped Figma tokens, self-hosted Geist/Geist Mono, original imagery, and reusable React/SVG marketing cards. Forms use React Hook Form and Zod. Registration has its own lazy entry point, in-memory draft, international phone validation, industry selector, and document metadata previews. Target current evergreen browsers. Dark mode, localization, production dashboards, backend integration, and animations remain deferred. Motion is installed and is not currently used.

Button defaults to `type="button"`, supports variants/sizes, and disables interaction when loading. Input accepts native attributes and refs; provide a visible label and connect descriptions/errors using IDs. Card is a composable container. Loader exposes a live status without animation. ErrorState supports an optional retry action.

## Dependencies and compatibility

Installed runtime packages:

| Package                 | Version |
| ----------------------- | ------- |
| `react`, `react-dom`    | 19.3.1  |
| `react-router`          | 7.18.5  |
| `axios`                 | 1.21.1  |
| `@tanstack/react-query` | 5.107.1 |
| `zustand`               | 5.1.0   |
| `react-hook-form`       | 7.92.0  |
| `@hookform/resolvers`   | 7.0.6   |
| `zod`                   | 4.6.7   |
| `lucide-react`          | 1.73.0  |
| `libphonenumber-js`     | 1.13.16 |
| `motion`                | 14.14.0 |
| `clsx`                  | 2.1.1   |
| `tailwind-merge`        | 3.7.0   |

Installed development packages:

| Package                            | Version |
| ---------------------------------- | ------- |
| `vite`                             | 8.3.8   |
| `@vitejs/plugin-react`             | 6.3.0   |
| `typescript`                       | 6.0.3   |
| `@types/node`                      | 22.20.5 |
| `@types/react`, `@types/react-dom` | 19.3.0  |
| `tailwindcss`, `@tailwindcss/vite` | 4.3.5   |
| `eslint`                           | 10.15.0 |
| `@eslint/js`                       | 10.0.1  |
| `typescript-eslint`                | 8.72.2  |
| `eslint-plugin-react-hooks`        | 7.1.1   |
| `eslint-plugin-react-refresh`      | 0.5.8   |
| `eslint-config-prettier`           | 10.1.8  |
| `globals`                          | 17.14.0 |
| `prettier`                         | 3.10.1  |
| `vitest`                           | 5.1.0   |
| `jsdom`                            | 27.4.0  |
| `@testing-library/react`           | 16.3.3  |
| `@testing-library/dom`             | 10.4.2  |
| `@testing-library/jest-dom`        | 7.0.1   |
| `@testing-library/user-event`      | 14.6.12 |

`package-lock.json` records resolved versions. Use `npm ci` for reproducible installs and `npm ls --depth=0` to inspect installed versions.

- React Router is pinned to **7.18.5** to support the installed Node 22.20.0 runtime. Router 8 requires a newer Node release.
- TypeScript uses **6.0.x**, within typescript-eslint's supported range. Do not upgrade it independently of lint tooling compatibility.
- jsdom uses **27.x** for Node 22.20.0 compatibility.
- A scoped npm override moves typescript-estree's minimatch dependency to **11.0.1 or later in 11.x** to address advisory GHSA-g3hv-75wg-m249. Recheck upstream dependency support before removing it; the full checks exercise the overridden lint toolchain.

## Verification and deployment

Run `npm run check` before merging. Tests cover routes/layouts, redirect/404/error behavior, keyboard interaction, component accessibility, forms, password requirements, OTP entry, rejection fixtures, resend cleanup, mobile navigation, API configuration/cancellation, tenant cache separation, and auth navigation without network or storage writes. Check responsive CSS in an actual browser as jsdom does not perform layout.

Build with `npm run build`, then deploy `dist/` to a static host. Configure SPA fallback so direct visits to routes such as `/merchant` return `index.html`, while real asset requests retain normal file/404 handling. No particular hosting provider is assumed. `npm run preview` is for local verification, not the production server.

The auth feature includes login, recovery, and the complete sign-up/onboarding preview. No account is created, no SMS is sent, and no documents are uploaded or verified. Backend contracts must be agreed before replacing preview handlers with authentication, delivery, sessions, reset tokens, or document processing. The feature guide records unavailable design details and deliberate preview differences.
