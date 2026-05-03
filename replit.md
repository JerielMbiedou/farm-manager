# Overview

This project is a pnpm monorepo using TypeScript, designed to manage a family poultry farm in Cameroon. The primary application, `ferme-familiale`, is a French-language React + Vite web app that provides comprehensive tools for farm management, including financial tracking, infrastructure management, poultry flock tracking, inventory, and business simulation. The project aims to digitalize and streamline the operations of a small-scale agricultural business, offering a robust and intuitive platform for farmers and investors.

The monorepo structure facilitates modular development, with shared libraries for API specifications, database interactions, and generated API clients. The backend is an Express 5 API server, utilizing PostgreSQL with Drizzle ORM for data persistence.

**Key Capabilities:**

- **Financial Management:** Tracking investments, expenses, and cash flow with detailed reporting.
- **Infrastructure Management:** Planning and tracking construction projects (chantiers) with budget management.
- **Poultry Flock Management:** Detailed tracking of poultry bands, including mortality, weight, feed consumption, vaccinations, and sales.
- **Inventory Management:** Stock control for feed, medications, and vaccines with expiration alerts.
- **Business Simulation:** Pre-launch profitability simulator and treasury forecasting.
- **User Management:** Role-based access control for Admin, Investor, Gestionnaire, and Lecteur.
- **AI Integration:** OCR scanning of paper tracking sheets using Google Gemini for automated data entry.

# User Preferences

I want iterative development. I prefer that you ask before making major changes. I want detailed explanations. Do not make changes to the `artifacts/ferme-familiale` folder. Do not make changes to the `lib/api-client-react` folder.

# System Architecture

The project is structured as a pnpm workspace monorepo. Each package in the workspace manages its own dependencies and is built using TypeScript 5.9.

**Core Technologies:**

- **Monorepo Tool:** pnpm workspaces
- **Backend API:** Express 5
- **Database:** PostgreSQL with Drizzle ORM for type-safe schema and queries. Sessions are managed using `connect-pg-simple`.
- **Frontend:** React + Vite, styled with Tailwind CSS and `shadcn/ui` components.
- **Validation:** Zod for API request/response validation and Drizzle ORM schemas.
- **API Codegen:** Orval generates React Query hooks (`api-client-react`) and Zod schemas (`api-zod`) from an OpenAPI 3.1 specification.
- **Build System:** esbuild for CJS bundles.
- **Charting:** Recharts for data visualization in various dashboards and simulations.
- **PDF/Excel Export:** `jspdf` + `jspdf-autotable` for PDF, `xlsx` for Excel exports.
- **Routing (frontend):** wouter v3. Protected routes are wrapped with a stable
  `makeProtectedRoute(Page)` helper that returns a memoizable component used as
  `<Route path="/x" component={WrappedRoute} />`. Do **not** pass inline arrow
  components (`component={() => ...}`) or use `<Route><Children/></Route>` for
  protected routes — both caused mount/render issues that made `/dashboard`
  appear blank in the past.

**Monorepo Structure:**

- `artifacts/api-server`: Express API server handling business logic and data access.
- `lib/db`: Drizzle ORM schema and database connection for PostgreSQL.
- `lib/api-spec`: Contains the OpenAPI specification and Orval configuration.
- `lib/api-zod`: Generated Zod schemas for API validation.
- `lib/api-client-react`: Generated React Query hooks for frontend API interaction.
- `artifacts/ferme-familiale`: The main React frontend application.
- `scripts`: Utility scripts for development and maintenance.

**Frontend Features (`ferme-familiale`):**

- **Modules:** Financement, Infrastructure, Dépenses, Bandes de Poulets, Trésorerie, Tableau de Bord.
- **Authentication:** Cookie-based `express-session` with bcrypt for password hashing and role-based authorization.
- **Data Visualization:** Extensive use of Recharts for mortality curves, growth curves, cost breakdowns, and financial forecasts.
- **Reporting:** PDF and Excel export functionalities for various reports, particularly for poultry band summaries and construction expenses.
- **Stock Management:** Custom API endpoints and hooks for managing feed and medication inventory with alerts.
- **Configurable Settings:** Application parameters (e.g., depreciation rates, mortality thresholds, vaccination schedules) stored in a `parametres` table.
- **OCR Integration:** Utilizes Google Gemini via Replit AI Integrations to scan and extract data from paper tracking sheets for automated entry.

**UI/UX Design:**

- **Typography:** Inter (body), Fraunces (headings) from Google Fonts.
- **Color Palette:** Deep forest green primary, golden amber secondary, terracotta accent, warm cream background.
- **Design Elements:** Rounded corners, subtle layered shadows, split-screen login, dark green gradient hero banners.
- **Localization:** Entire UI is in French, and all monetary amounts are in FCFA.

# External Dependencies

- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication/Session Management:** `express-session`, `connect-pg-simple`, bcrypt
- **API Specification:** OpenAPI 3.1
- **API Client Generation:** Orval
- **Frontend Frameworks/Libraries:** React, Vite, Tailwind CSS, shadcn/ui
- **Charting Library:** Recharts
- **PDF Generation:** jspdf, jspdf-autotable
- **Excel Generation:** xlsx
- **AI Integration:** Google Gemini (via Replit AI Integrations)
- **CORS Middleware:** `cors`
- **Database Driver:** `pg`