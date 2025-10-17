Project snapshot
- Small Flask app + static site. Backend: `app.py` (Flask). Static UI: `templates/` and `static/`.
- A `docs/` static copy was created for GitHub Pages (publish from `main`/`docs`).

Quick run (local)
- Create Python venv and install deps (Windows PowerShell):
  py -3 -m venv .venv
  .\.venv\Scripts\python -m pip install --upgrade pip
  .\.venv\Scripts\python -m pip install -r requirements.txt
  .\.venv\Scripts\python app.py
- App listens on http://127.0.0.1:5000. Use `/faculty` and `/student` routes.

Important files
- `app.py` — routes: `/`, `/faculty`, `/student`, `/save` (POST JSON append to `data/submissions.json`).
- `templates/` — Jinja templates used by Flask while developing. `static/` contains CSS/JS.
- `docs/` — self-contained static HTML for GitHub Pages (already prepared).
- `VOICE_README.md` — original voice tool notes.

Conventions & gotchas
- Storage: `app.py` appends newline-delimited JSON to `data/submissions.json`. If you need a JSON array, migrate using a safe read/append with locking.
- Static assets are served from `/static/...` when running Flask. GitHub Pages serves only static `docs/` files — templates will not render on Pages.
- Development server runs with `debug=True`. Don't use this in production.

Examples for agents (small, precise changes)
- Fix a bug in `app.py`: replace `_name_` / `_main_` with `__name__` / `__main__` and prefer `app = Flask(__name__)`.
- Add validation to `/save`: require at least one of `name`/`email` and respond with 400 on invalid input.
- Convert `data/submissions.json` to a JSON array: read file, parse existing lines, append object, write back atomically.

Testing & verification
- After changes, run unit check: start server and probe `http://127.0.0.1:5000/` plus `POST /save` with a small payload and verify `data/submissions.json` updates.

When to ask the user
- If a change requires credentials (GitHub remotes, ngrok token) or exposes data (submissions), stop and ask before proceeding.
