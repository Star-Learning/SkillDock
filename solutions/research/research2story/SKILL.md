---
name: research2story
description: Research and verify papers for a user-supplied topic, extract a real representative figure for every included paper, and generate a local Markdown report plus a narrated HTML research timeline. Use when the user asks for 文献调研、论文时间线、研究脉络、论文主图动画、Research2Story, or a research-to-HTML story and wants the work executed in their local Agent workspace.
---

# Research2Story

Run the bundled deterministic pipeline locally. Do not send the user's files or task data to the solution-center website.

## Required inputs

- Topic
- Start and end year
- Output language: `zh` or `en`
- Output directory; default to `outputs/`

## Execute

1. Confirm that the current directory contains `package.json`, `config/venues.yaml`, and `scripts/run-research.ts`.
2. Check for Node.js 20 or newer.
3. If dependencies are absent, explain that a local npm install is required and obtain any approval required by the environment before running `npm install`.
4. Run:

   ```bash
   npm run research -- --topic "<topic>" --start <year> --end <year> --lang zh --output outputs
   ```

5. Keep the streamed progress visible. Do not replace failed searches or missing figures with invented papers, citations, or generated images.
6. Open or inspect the generated `index.html` when local browser testing is available.

## Verify delivery

Require all of the following before reporting completion:

- `research.md` exists and contains official paper links.
- `storyboard.json` contains one `paper_card` scene per included paper.
- `pics/` contains the extracted paper figure panels and `figures.json` records their captions and sources.
- `index.html` is self-contained and includes a timeline, one play/pause control, and browser narration.
- arXiv preprints are labeled as preprints.

If the public academic sources are unavailable, report the failed source and keep any partial files separate. Do not claim completion.

## Optional local interface

When the user prefers a form instead of the CLI, run `npm run dev` and open the local URL printed by Next.js. The interface is local only; it is not part of the cloud solution center.
