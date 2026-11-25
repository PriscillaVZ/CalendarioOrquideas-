# sdd profile — Calendario de Orquídeas (frontend)

Read by the `sdd` skill before anything else. Facts about this project only; the method lives in the
skill. When this file and the skill disagree, this file wins.

## Identity
- **Product:** Calendario de Orquídeas — the web interface of the orchid-greenhouse prototype
  (irrigation calendar, sensor data, sensors, notifications). It talks to Riego Backend
  (`../RiegoBackend`, its own SDD specs). Origin: course brief IEI-094 Etapa III. No customer-facing
  product name yet; the screens say "Orquídeas".
- **Owner:** the repo owner (git user `Alfonsonrx`)
- **Subject:** the app
- **Language:** Spanish (specs, plans, tasks); translations only on request, in `specs/NNN-name/en/`.
  The EARS keywords (`WHEN`, `WHILE`, `WHERE`, `IF`, `THEN`, `the app shall`) stay in English because
  `sdd_check.py` lints them; the rest of each bullet is Spanish. Brief ids (RF1–RF7) and the backend's
  Spanish messages stay as they are.
- **Numbering:** 0xx as-built baseline, 1xx new work
- **Exemplar:** none yet — the first spec written (001) becomes it
- **Backlog:** `specs/backlog.md`
- **Forks:** none
- **Pre-SDD notes:** none in this repo. The requirements source is the brief in the backend repo,
  `../RiegoBackend/docs/IEI-094_E3_S12_3_3_Documento(4).docx`: read it, don't edit it. RF ids follow
  its summary table RF1–RF7, as decided in backend spec 101 §10 D6.

## Reference
- **Architecture reference:** this profile's *Project rules* (no AGENTS.md or constitution exists) —
  read before any plan. What the API offers is fixed by the backend's specs (`../RiegoBackend/specs/`
  001, 101–105): read the ones a plan calls before writing it.
- **Header reference:** `Reference: \`specs/sdd.profile.md\``; also in tasks.md header: no

## Areas
| Section | Area | Path |
|---|---|---|
| A | Pages and shared client (HTML, CSS, JS) | `index.html`, `calendario.js`, `styles.css`, `api.js`, `login.html`, `Home/`, `Datos/`, `Configuracion/` |

## Project rules
1. **The backend is the source of truth.** Every datum a person creates or the sensors produce
   (schedules, sensors, readings, notifications, limits) is read from and written to the backend; the
   browser keeps only the session token and per-browser conveniences (which notifications it already
   showed). *Why:* data kept in the browser is lost with it, isn't shared between devices, and
   disagrees with what the backend reminds and alerts on.
2. **The backend decides, the app shows.** A rule the backend enforces (future dates, limit order,
   ownership, value ranges) is not re-implemented in the app; the app sends the request and shows the
   backend's Spanish message when it is refused. *Why:* two copies of a rule drift (the greenhouse's
   time zone is the backend's, not the browser's), and a rule only a screen enforces is not a rule.
3. **One client.** Every call goes through the shared client (`api.js`), which adds the token, turns a
   refusal into the backend's message, and sends an expired or missing session to the login screen.
   *Why:* the token and the error shape are the same for every page; a page that calls the API on its
   own skips the expired-session rule.
4. **Secrets.** The app never shows, logs or stores a password, and never stores a sensor's ingest key:
   it is shown once, when the backend returns it, for the person to copy into the device. *Why:* the
   browser's storage is readable by any script on the page; the backend stores only hashes (backend
   profile rule 3).
5. **Brief traceability.** Every FR of a 1xx spec names the brief's RF id it serves (`RF1`…`RF7`) in its
   paragraph, or says it serves none. *Why:* the prototype is judged against the brief.
6. **No build step, no framework.** Plain HTML, CSS and browser JavaScript served as static files; a
   library only from a CDN and only where a few lines can't do it (Chart.js for charts). *Why:* it's
   what the team built and can maintain; a bundler adds a toolchain for no feature the brief asks.

## Spec extras
- NFR labels: **Security**, **Language** (every text on screen is Spanish), **Traceability** (RF ids),
  **Freshness** (how old shown data may be), **Accessibility** (labels on inputs, keyboard-usable
  controls).
- An FR states what the app shows or sends, never the backend's rule itself: that lives in the backend
  spec, cited as `backend 101 FR-1.a`.

## Plan sections
- §2 Data model: the backend responses the page reads (fields used, cited to the backend spec), and
  what the browser stores (`localStorage` keys). There is no database here.
- §3 Surface: pages (path, what they show) and the backend calls each makes (method, path, FR).

## Tasks
- **Test command:** none — screens are verified by live checks, not automated tests (owner's decision,
  2026-11-18: no test tooling for a no-build HTML/JS prototype)
- **Test paths:** none
- **Generated files:** none
- **Live checks:** accepted for every bullet (there are no automated tests), recorded under spec §10
  `### Taken while building`: what was checked in a browser (Orca built-in browser) against a running
  backend, by whom and when. A `built` or `as-built` spec cites each bullet there.
- **Commits:** ask
- **Made when examples:** `node --check calendario.js` (the script parses), `grep -n "async function api" api.js`,
  with the backend on `:8000` and `python3 -m http.server 8080` here: open
  `http://localhost:8080/login.html`, log in, and check the page shows X.
- **CI gates:** none defined (no workflow in the repo)
- **Local gates:** `for f in *.js */*.js; do node --check "$f" || exit 1; done`
- **Secrets at runtime:** none (the page holds only the session token the backend issues)

## Secrets
- **Never open:** `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, credential JSON — here and
  in `../RiegoBackend`
- **Settings learned from:** `api.js` (`API_URL`), `../RiegoBackend/app/config.py` and
  `../RiegoBackend/.env.example` (names only)

## As-built
- **Read list:** `api.js`, `login.html`, `index.html`, `calendario.js`, `Home/home.html`,
  `Home/home.js`, `styles.css` (the parts the spec touches), and the backend specs the page calls
- **Build-order chain:** shared client → login → page markup → page data layer → page rendering →
  live check
- **Notes:** the as-built baseline describes the code on branch `conexion-backend` (commit `444dbab`).
  `Datos/` and `Configuracion/` still run on sample data and `localStorage`; they are not baseline
  behaviour — 1xx specs replace them.
