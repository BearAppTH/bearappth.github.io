# BearAppTH Portfolio — Project Rules

## Branch
Always develop on `claude/create-portfolio-website-g8YKC`.  
Never push directly to `main`.

## Workflow — REQUIRED every time
After **every** commit + push (no exceptions):
1. Push the branch: `git push -u origin <branch>`
2. Create a PR targeting `main` (or reuse the existing open one)
3. **Immediately merge the PR into `main`** using squash merge
4. GitHub Pages will then deploy automatically from `main`

## Stack
Plain HTML + CSS + vanilla JS — no frameworks, no build step.  
GitHub Pages deploys `main` automatically after every merge.

## Code style
- Mobile-first CSS, fluid values via `clamp()` throughout
- All hover styles inside `@media (hover: hover)`
- Input `font-size` must stay ≥ 16px (prevents iOS Safari zoom)
- No comments unless the WHY is non-obvious
