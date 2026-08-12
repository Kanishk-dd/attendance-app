# Attendance App

A lightweight attendance tracker built with React and Vite. This project provides a simple UI for recording and viewing attendance, filtering by date, and exporting selected dates to Excel.

## Key features
- Record attendance entries (present / absent / notes)
- Calendar-based date selection and filtering
- View attendance by day, week, or month
- Export selected dates or ranges to Excel (XLSX) — added in v1.2
- Fast dev workflow using Vite with React HMR

## Tech stack
- Frontend: React
- Build tool: Vite
- Language: JavaScript
- Typical libraries (may vary): date handling (e.g., date-fns), Excel export (e.g., SheetJS / xlsx), UI components

## Demo / Screenshots
(Optionally add screenshots or a link to a deployed demo here.)

## Getting started

Prerequisites
- Node.js 16+ (or current LTS)
- npm (or yarn / pnpm)

Install dependencies
```bash
npm install
# or
# yarn
# pnpm install
```

Start dev server
```bash
npm run dev
```
Open http://localhost:5173 (or the port Vite prints) to view the app with HMR.

Build for production
```bash
npm run build
```

Preview production build locally
```bash
npm run preview
```

Common npm scripts
- `dev` — start the Vite development server
- `build` — produce a production build
- `preview` — preview the built app locally
- `lint` / `format` — (if configured) run linters or formatters

## Usage

- Add or edit attendance entries using the UI.
- Use the calendar or date-range controls to filter the view.
- To export attendance data:
  - Select the dates you want to include (single dates, multiple selection, or a range).
  - Click the "Export" / "Download" button to download an Excel (.xlsx) file containing the selected attendance records.
  - The export format contains columns like Date, Name/ID, Status, and Notes (adjusted to the app's schema).

If your frontend integrates with an API or backend, set the appropriate API base URL via an environment variable (see Environment below).

## Project structure (example)
```
/src
  /components   # React components (Calendar, AttendanceList, ExportButton, etc.)
  /hooks        # Reusable hooks
  /pages        # Views / pages
  /utils        # Helpers (date utilities, export helpers)
  main.jsx
vite.config.js
package.json
```

Adjust paths to match the repository layout.

## Environment & configuration
If your app uses environment variables, create a `.env` file at the project root (don't commit secrets). Example:
```
VITE_API_BASE_URL=https://api.example.com
```
Vite exposes env variables prefixed with `VITE_` to the client.

## Tests
(If present) Run tests with:
```bash
npm test
# or
# npm run test:watch
```

## Linting & formatting
(If configured) Example:
```bash
npm run lint
npm run format
```

## Deployment
You can deploy a Vite-built static site to platforms like Vercel, Netlify, GitHub Pages, or any static-file host. Typical steps:
1. `npm run build`
2. Upload `dist/` (or the build output) to your host.

## Troubleshooting
- Port in use: change dev server port in `vite.config.js` or run `npm run dev -- --port 3000`.
- Build errors: check console output for missing modules or unresolved imports.
- Excel export issues: ensure the export library version matches usage (SheetJS examples: create sheet, append rows, writeFile).

## Contributing
Contributions, bug reports, and pull requests are welcome.
1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Install dependencies and run the app locally
4. Open a PR describing your change

Please follow existing code style and add tests where applicable.

## Changelog (high level)
- v1.2 — Added selected-dates Excel export and related UI improvements

## License
Specify a license, e.g. MIT. Add a LICENSE file at the repo root.

## Contact
Maintainer: Kanishk-dd (GitHub: @Kanishk-dd)

---

If you'd like, I can:
- Commit this README directly to `master`/`main` in your repository,
- Modify the README to include exact commands and scripts from your package.json,
- Add screenshots or live demo links (if you provide them).
Which would you like me to do next?
