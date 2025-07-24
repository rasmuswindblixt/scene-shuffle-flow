// Frame processor worker
let previousFrameData: Uint8ClampedArray | null = null;
let sceneThreshold = 20; // Adjustable threshold for scene detection

self.onmessage = async (e: MessageEvent) => {
  const { frameData, timestamp, width, height } = e.data;
  
  // Convert ArrayBuffer to Uint8ClampedArray if needed
  const currentFrameData = frameData instanceof Uint8ClampedArray 
    ? frameData 
    : new Uint8ClampedArray(frameData);

  if (!previousFrameData) {
    previousFrameData = currentFrameData;
    self.postMessage({ type: 'progress', timestamp });
    return;
  }

  const difference = calculateFrameDifference(currentFrameData, previousFrameData, width, height);
  
  if (difference > sceneThreshold) {
    self.postMessage({
      type: 'scene_detected',
      timestamp,
      difference
    });
  }

  self.postMessage({ type: 'progress', timestamp });
  previousFrameData = currentFrameData;
};

function calculateFrameDifference(
  current: Uint8ClampedArray,
  previous: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let diff = 0;
  const skipPixels = 2; // Process every nth pixel for speed
  const totalPixels = (width * height) / (skipPixels * skipPixels);

  // Compare every nth pixel (RGB values)
  for (let i = 0; i < current.length; i += 4 * skipPixels) {
    const r1 = current[i];
    const g1 = current[i + 1];
    const b1 = current[i + 2];
    
    const r2 = previous[i];
    const g2 = previous[i + 1];
    const b2 = previous[i + 2];
    
    // Calculate color difference
    const pixelDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    diff += pixelDiff;
  }

  // Normalize the difference
  return (diff / totalPixels) / 765 * 100; // 765 is max difference per pixel (255 * 3)
} 