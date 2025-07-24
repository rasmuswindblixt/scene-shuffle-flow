export interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  difference?: number;
  segment?: number;
  thumbnail?: string;
  selected?: boolean;
  videoIndex?: number;
  _fillRepeat?: number;
  _fillPartial?: boolean;
  _fillUsed?: boolean;
} 