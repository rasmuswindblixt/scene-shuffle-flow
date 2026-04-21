# ClipMixPRO — CLAUDE.md

Project context for Claude Code. Keep this up to date as the codebase evolves.

## What Is This App

ClipMixPRO lets YouTube creators bypass "reused content" detection by auto-detecting scenes in videos, shuffling them intelligently, and exporting unique variations. Core workflow: **upload videos → detect scenes → shuffle → export MP4**.

- URL: production on Vercel (check vercel.json / package.json deploy config)
- Stripe: subscription-gated export (premium only), no free export tier
- Auth: Supabase Auth (email + Google OAuth)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript, Vite (port 8080) |
| Styling | Tailwind CSS + shadcn-ui / Radix UI |
| State | React Context (split CoreContext + ExportContext) |
| Backend | Supabase (PostgreSQL + Deno Edge Functions) |
| Payments | Stripe subscription |
| Video processing | Canvas API + MediaRecorder (100% client-side, no FFmpeg) |
| Testing | Vitest |

---

## Key Architecture

### Video Processing Pipeline

```
VideoUpload.tsx
  → VideoProcessorContext.tsx (CoreContext + ExportContext)
    → VideoProcessorContainer.tsx (orchestrator)
      → SceneDetector.tsx         — frame-diff scene detection
      → SceneGrid.tsx             — scene thumbnail grid
      → DurationControl.tsx       — max duration slider
      → FinalVideoPreview.tsx     — live preview player
      → ExportControls.tsx        — format select + export button
      → ExportDialog.tsx          — export progress modal
      → AnalysisView.tsx          — analysis progress UI
```

### Context Split (important — do not collapse back into one)

`src/contexts/VideoProcessorContext.tsx` exports **two separate contexts**:

- `CoreContext` — scenes, shuffledScenes, step, videoFiles, videoUrls, analysis state, all actions
- `ExportContext` — isExporting, exportProgress, showExportDialog, exportedVideoBlob, exportLogs, exportFormat

Use `useCoreContext()` for scene/UI components, `useExportContext()` for export components. This prevents export-progress re-renders from hitting scene grid. Use `useVideoProcessor()` only when you need both.

### Shuffle Algorithm

`src/lib/shuffle.ts` — Fisher-Yates with `crypto.getRandomValues()`. Replaces the old biased `Array.sort(() => Math.random() - 0.5)`. Has unit tests in `src/lib/shuffle.test.ts`.

### Scene Detection

`SceneDetector.tsx` — pixel-diff analysis, processes video in 60s batches. Reads frames via Canvas, compares consecutive frames. All thresholds live in `src/lib/constants.ts`.

### Constants

All magic numbers are in `src/lib/constants.ts`. Never hardcode thresholds elsewhere.

---

## Files — What To Know

| File | Notes |
|---|---|
| `src/components/VideoProcessor.tsx` | **DEAD CODE** — old 1,227-line monolith, no longer imported. Candidate for deletion. |
| `src/components/YouTubeDownloader.tsx` | **DEAD CODE** — hidden behind `{false &&}` in VideoUpload. |
| `src/lib/constants.ts` | All scene detection + export thresholds. Edit here. |
| `src/contexts/AuthContext.tsx` | Auth + Stripe subscription state. **Do not modify.** |
| `src/integrations/supabase/` | Supabase client + types. **Do not modify.** |
| `src/components/onboarding/` | Onboarding flow. Working. Don't break. |
| `src/components/ui/` | shadcn primitives. Don't modify unless absolutely needed. |
| `src/pages/BlogAdmin.tsx` | Belongs to `feature/blog-seo` branch — incomplete, not wired to nav. |
| `supabase/functions/sitemap/` | Belongs to `feature/blog-seo` branch — needs deployment. |

---

## Development Commands

```bash
npm run dev       # Start dev server on port 8080
npm run build     # Production build
npm run test      # Run vitest tests
npm run lint      # ESLint
```

---

## Decisions Log

### 2026-04 — App 2.0 Refactor (branch: app-2.0, merged to main)
- Decomposed `VideoProcessor.tsx` monolith into 8 focused components
- Split context into CoreContext + ExportContext to prevent re-render cascades
- Replaced biased shuffle with Fisher-Yates + crypto.getRandomValues()
- Fixed memory leaks: blob URL revocation in `finally`, pooled thumbnail canvas, cleaned up seeked/timeupdate listeners
- Fixed race condition in FinalVideoPreview: `timeupdate` event replaces `setTimeout` for scene-end detection
- Replaced all hardcoded thresholds with named constants
- All export still via Canvas + MediaRecorder (no FFmpeg — kept client-side simplicity)

### YouTube Download via yt-dlp
- Evaluated and **deferred to backlog** — requires a dedicated server (Python/Node + yt-dlp CLI), cannot run in browser or Supabase Edge Functions.

---

## Backlog

See `BACKLOG.md` for deferred features in priority order.

Top items:
1. YouTube download integration (requires server-side yt-dlp)
2. Drag-and-drop scene reordering (`@dnd-kit`)
3. Export quality options (resolution/bitrate presets)
4. Scene trimming UI
5. Web Worker for scene detection (worker file exists but unused: `src/workers/frame-processor.worker.ts`)

---

## Known Issues / Quirks

- Canvas export produces video **without audio** on some browsers — MediaRecorder doesn't capture audio from muted video elements. This is a known limitation of the current Canvas pipeline. True audio export requires FFmpeg.wasm (tracked in backlog).
- `VideoProcessor.tsx` (old monolith) still exists in repo but is not imported anywhere. Safe to delete.
- Scene detection can be slow on long videos (60s batches, 0.5s frame interval, 25ms delay per frame).
