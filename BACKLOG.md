# ClipMixPRO Backlog

Items deferred from the app-2.0 upgrade. Ordered by estimated impact.

---

## Features

### YouTube Download Integration
Import videos via YouTube URL instead of file upload. Requires a server-side component running `yt-dlp` (Python CLI). Cannot run in browser or edge functions.
- **Approach:** Minimal Python/Node server with yt-dlp, accepts URL, downloads 720p, streams file back
- **Constraints:** Max 10 min / 720p, rate limiting, copyright disclaimer needed
- **Ref:** https://github.com/yt-dlp/yt-dlp

### Drag-and-Drop Scene Reordering (Phase 4)
Manual scene arrangement using `@dnd-kit`. Currently users can only shuffle randomly.
- Wrap SceneGrid in `DndContext` + `SortableContext`
- Touch support via `PointerSensor` + `TouchSensor`
- "Undo last reorder" button

### Export Quality Options (Phase 6)
User control over resolution and bitrate. Currently fixed at 720p / 8 Mbps.
- Resolution presets: 720p / 1080p / 4K
- Quality presets: Fast / Balanced / Maximum
- Estimated file size display

### Scene Trimming UI (Phase 7)
Manual override of auto-trimmed scene boundaries (currently 0.4s edge trim, 6.9s max).
- Click scene to open trimmer with draggable start/end markers
- Extend Scene type: `originalStartTime`, `originalEndTime`, `trimmedByUser`

### Transitions / Effects
Cross-fades between scenes via FFmpeg `xfade` filter.

### Project Persistence
Save scene selections and shuffle state to Supabase or localStorage for session recovery.

### Web Worker Scene Detection
Move pixel-diff analysis to `frame-processor.worker.ts` (file exists but is unused) to unblock main thread.

### Advanced Scene Detection
ML-based scene detection instead of pixel-diff threshold.

---

## Bug Fixes / Code Quality

### Missing Export Validation
No check that video URLs are accessible before starting export. Canvas codec fallback happens silently without user notification.

### Dead Code Cleanup
- `YouTubeDownloader` component hidden behind `{false &&}` in VideoUpload
- Old `VideoProcessor.tsx` monolith (1,227 lines) still exists, no longer imported

---

## SEO / Marketing (feature/blog-seo branch)

### Blog Post Insert
SQL needs to be run in Supabase SQL Editor (RLS blocks anon insert).

### Sitemap Edge Function
Needs deployment to Supabase.

### OG Images
Create `og-default.png` and `og-blog.png` for social sharing.
