<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# User shortcuts

- **"cook"** (anywhere in the user's message, e.g. "lets cook", "cook bro") — start the Next.js dev server via `mcp__Claude_Preview__preview_start` with name `next-dev` (config lives in `.claude/launch.json`), then verify with `curl` that `http://localhost:3000/` returns 200. If the server is already running, just confirm it's up. Reply briefly with the localhost URL.
