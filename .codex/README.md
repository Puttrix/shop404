Codex Memory

Purpose
- Persist lightweight preferences and context for this project so the assistant can reload them at the start of future sessions.

Location
- `.codex/memory.json`

What to edit
- `user.preferences`: Add or tweak style, tech choices, tools, or any standing instructions.
- `project.summary` and `how_to_run`: Keep current if you change the setup.
- `conversations`: Optional short notes or decisions you want remembered.

Notes
- This is a simple, local memory. It’s not sent anywhere.
- I’ll look for this file and load it next time I’m opened in this repo.

