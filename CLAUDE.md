# BearAppTH Portfolio — Project Rules

## Branch
Always develop on `claude/create-portfolio-website-g8YKC`.  
Never push directly to `main`.

## Workflow — REQUIRED every time
After **every** commit + push (no exceptions):
1. Push the branch: `git push -u origin <branch>`
2. Check if PR #2 is open on `bearappth/bearappth.github.io`
3. If open → it auto-updates (no action needed, just confirm it's current)
4. If closed or missing → create a new PR targeting `main` using the GitHub MCP tool

## Stack
Plain HTML + CSS + vanilla JS — no frameworks, no build step.  
GitHub Pages deploys `main` automatically.

## Code style
- Mobile-first CSS, fluid values via `clamp()` throughout
- All hover styles inside `@media (hover: hover)`
- Input `font-size` must stay ≥ 16px (prevents iOS Safari zoom)
- No comments unless the WHY is non-obvious
