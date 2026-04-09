import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Scene } from "@/types/scene";
import { toast } from "sonner";
import { shuffleWithConstraints } from "@/lib/shuffle";

// ── Core context (scenes, step, duration, analysis) ──

interface CoreContextType {
  videoFiles: File[];
  videoUrls: string[];
  onReset: () => void;

  currentStep: 'analyze' | 'results' | 'export';
  setCurrentStep: (step: 'analyze' | 'results' | 'export') => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  shuffledScenes: Scene[];
  setShuffledScenes: (scenes: Scene[]) => void;

  originalVideoDuration: number;
  setOriginalVideoDuration: (v: number) => void;
  maxVideoDuration: number;
  setMaxVideoDuration: (v: number) => void;

  currentVideoIndex: number;
  setCurrentVideoIndex: (v: number) => void;
  allVideoScenes: Scene[][];
  setAllVideoScenes: (scenes: Scene[][]) => void;

  getSelectedScenes: () => Scene[];
  getSelectedShuffledScenes: () => Scene[];
  getScenesWithinDuration: (scenes: Scene[], maxDuration: number) => Scene[];
  getTotalDuration: () => number;
  getExtractionPercentage: () => number;

  toggleSceneSelection: (sceneId: string) => void;
  toggleSelectAll: () => void;
  reshuffleScenes: () => void;
  formatDuration: (seconds: number) => string;
  getVideoMixingStats: (scenes: Scene[]) => string;
}

// ── Export context (progress, logs, blob, format) ──

interface ExportContextType {
  isExporting: boolean;
  setIsExporting: (v: boolean) => void;
  exportProgress: number;
  setExportProgress: (v: number) => void;
  showExportDialog: boolean;
  setShowExportDialog: (v: boolean) => void;
  exportedVideoBlob: Blob | null;
  setExportedVideoBlob: (blob: Blob | null) => void;
  exportLogs: string[];
  addLog: (message: string) => void;
  setExportLogs: (logs: string[]) => void;
  exportFormat: 'mp4' | 'webm';
  setExportFormat: (f: 'mp4' | 'webm') => void;
}

const CoreContext = createContext<CoreContextType | null>(null);
const ExportContext = createContext<ExportContextType | null>(null);

export function useVideoProcessor() {
  const core = useContext(CoreContext);
  const exp = useContext(ExportContext);
  if (!core || !exp) throw new Error("useVideoProcessor must be used within VideoProcessorProvider");
  return { ...core, ...exp };
}

export function useCoreContext() {
  const ctx = useContext(CoreContext);
  if (!ctx) throw new Error("useCoreContext must be used within VideoProcessorProvider");
  return ctx;
}

export function useExportContext() {
  const ctx = useContext(ExportContext);
  if (!ctx) throw new Error("useExportContext must be used within VideoProcessorProvider");
  return ctx;
}

// ── Provider ──

interface ProviderProps {
  videoFiles: File[];
  videoUrls: string[];
  onReset: () => void;
  children: ReactNode;
}

export function VideoProcessorProvider({ videoFiles, videoUrls, onReset, children }: ProviderProps) {
  // Core state
  const [currentStep, setCurrentStep] = useState<'analyze' | 'results' | 'export'>('analyze');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [shuffledScenes, setShuffledScenes] = useState<Scene[]>([]);

  // Duration state
  const [originalVideoDuration, setOriginalVideoDuration] = useState(0);
  const [maxVideoDuration, setMaxVideoDuration] = useState(0);

  // Multi-video analysis
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [allVideoScenes, setAllVideoScenes] = useState<Scene[][]>([]);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const [exportLogs, setExportLogs] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>('mp4');

  // ── Shared callbacks ──

  const addLog = useCallback((message: string) => {
    setExportLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getSelectedScenes = useCallback(() => scenes.filter(s => s.selected), [scenes]);
  const getSelectedShuffledScenes = useCallback(() => shuffledScenes.filter(s => s.selected), [shuffledScenes]);

  const getScenesWithinDuration = useCallback((scenesArr: Scene[], maxDuration: number): Scene[] => {
    const result: Scene[] = [];
    let totalDuration = 0;
    for (const scene of scenesArr) {
      if (totalDuration + scene.duration <= maxDuration) {
        result.push(scene);
        totalDuration += scene.duration;
      } else {
        break;
      }
    }
    return result;
  }, []);

  const getTotalDuration = useCallback(() => {
    const selected = shuffledScenes.filter(s => s.selected);
    const withinLimit = getScenesWithinDuration(selected, maxVideoDuration);
    return withinLimit.reduce((total, s) => total + s.duration, 0);
  }, [shuffledScenes, maxVideoDuration, getScenesWithinDuration]);

  const getExtractionPercentage = useCallback(() => {
    if (originalVideoDuration === 0) return 0;
    return (getTotalDuration() / originalVideoDuration) * 100;
  }, [getTotalDuration, originalVideoDuration]);

  const toggleSceneSelection = useCallback((sceneId: string) => {
    const toggle = (s: Scene) => s.id === sceneId ? { ...s, selected: !s.selected } : s;
    setScenes(prev => prev.map(toggle));
    setShuffledScenes(prev => prev.map(toggle));
  }, []);

  const toggleSelectAll = useCallback(() => {
    const allSelected = scenes.every(s => s.selected);
    const newState = !allSelected;
    setScenes(prev => prev.map(s => ({ ...s, selected: newState })));
    setShuffledScenes(prev => prev.map(s => ({ ...s, selected: newState })));
  }, [scenes]);

  const reshuffleScenes = useCallback(() => {
    const selected = shuffledScenes.filter(s => s.selected);
    if (selected.length === 0) { toast.error("No scenes selected for shuffling!"); return; }
    if (selected.length === 1) { toast.info("Only one scene selected - nothing to shuffle!"); return; }
    const newShuffle = shuffleWithConstraints(selected);
    setShuffledScenes(newShuffle);
    toast.success(`${selected.length} selected scenes reshuffled!`);
  }, [shuffledScenes]);

  const getVideoMixingStats = useCallback((scenesArr: Scene[]): string => {
    const counts = scenesArr.reduce((acc, s) => {
      const vi = s.videoIndex || 0;
      acc[vi] = (acc[vi] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const labels = Object.keys(counts).map(key => {
      const i = parseInt(key);
      const name = videoFiles[i]?.name.split('.')[0] || `Video ${i + 1}`;
      return `${name}: ${counts[i]} clips`;
    });
    return `Mixed from ${labels.join(' • ')}`;
  }, [videoFiles]);

  // ── Memoized context values ──

  const coreValue = useMemo<CoreContextType>(() => ({
    videoFiles, videoUrls, onReset,
    currentStep, setCurrentStep,
    isAnalyzing, setIsAnalyzing,
    scenes, setScenes,
    shuffledScenes, setShuffledScenes,
    originalVideoDuration, setOriginalVideoDuration,
    maxVideoDuration, setMaxVideoDuration,
    currentVideoIndex, setCurrentVideoIndex,
    allVideoScenes, setAllVideoScenes,
    getSelectedScenes, getSelectedShuffledScenes,
    getScenesWithinDuration, getTotalDuration, getExtractionPercentage,
    toggleSceneSelection, toggleSelectAll, reshuffleScenes,
    formatDuration, getVideoMixingStats,
  }), [
    videoFiles, videoUrls, onReset,
    currentStep, isAnalyzing, scenes, shuffledScenes,
    originalVideoDuration, maxVideoDuration,
    currentVideoIndex, allVideoScenes,
    getSelectedScenes, getSelectedShuffledScenes,
    getScenesWithinDuration, getTotalDuration, getExtractionPercentage,
    toggleSceneSelection, toggleSelectAll, reshuffleScenes,
    formatDuration, getVideoMixingStats,
  ]);

  const exportValue = useMemo<ExportContextType>(() => ({
    isExporting, setIsExporting,
    exportProgress, setExportProgress,
    showExportDialog, setShowExportDialog,
    exportedVideoBlob, setExportedVideoBlob,
    exportLogs, addLog, setExportLogs,
    exportFormat, setExportFormat,
  }), [
    isExporting, exportProgress, showExportDialog, exportedVideoBlob,
    exportLogs, addLog, exportFormat,
  ]);

  return (
    <CoreContext.Provider value={coreValue}>
      <ExportContext.Provider value={exportValue}>
        {children}
      </ExportContext.Provider>
    </CoreContext.Provider>
  );
}
