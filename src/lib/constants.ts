// Scene filtering thresholds
export const SCENE_MIN_DURATION = 1.8;       // Minimum scene duration after detection (seconds)
export const SCENE_MAX_DURATION = 7.7;       // Maximum scene duration after detection (seconds)
export const SCENE_EDGE_TRIM = 0.4;          // Trim from each edge to remove transitions (seconds)
export const SCENE_MAX_FINAL_DURATION = 6.9; // Max duration after trimming (seconds)

// Scene detection
export const SCENE_DIFFERENCE_THRESHOLD = 0.15;  // Pixel difference threshold for scene change
export const SCENE_DETECTION_BATCH_SIZE = 60;     // Process video in 60-second batches
export const SCENE_MIN_DETECTION_DURATION = 0.5;  // Minimum duration between scene cuts
export const SCENE_FRAME_INTERVAL = 0.5;          // Check every 0.5 seconds
export const SCENE_DETECTION_DELAY_MS = 25;       // Delay between frames to prevent blocking

// Export settings
export const EXPORT_WIDTH = 1280;
export const EXPORT_HEIGHT = 720;
export const EXPORT_BITRATE_HIGH = 8_000_000;    // 8 Mbps for h264/vp9
export const EXPORT_BITRATE_LOW = 5_000_000;     // 5 Mbps for vp8 fallback
export const EXPORT_FRAMERATE = 60;

// Upload limits
export const MAX_VIDEO_COUNT = 4;
export const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
export const MAX_VIDEO_DURATION_SECONDS = 3600;              // 60 minutes
