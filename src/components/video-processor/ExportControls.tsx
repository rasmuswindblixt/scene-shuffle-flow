import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle, Download, FileVideo } from "lucide-react";
import { useCoreContext, useExportContext } from "@/contexts/VideoProcessorContext";

interface ExportControlsProps {
  onExport: () => void;
}

export default function ExportControls({ onExport }: ExportControlsProps) {
  const {
    getSelectedShuffledScenes, getScenesWithinDuration,
    maxVideoDuration, getTotalDuration, getExtractionPercentage,
    originalVideoDuration, formatDuration,
    reshuffleScenes, onReset,
  } = useCoreContext();
  const { exportFormat, setExportFormat } = useExportContext();

  const selectedScenes = getSelectedShuffledScenes();
  const scenesToExport = getScenesWithinDuration(selectedScenes, maxVideoDuration);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FileVideo className="w-4 h-4" />
            Video Format
          </label>
          <Select value={exportFormat} onValueChange={(value: 'mp4' | 'webm') => setExportFormat(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select video format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="webm">WebM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-center space-y-2">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {scenesToExport.length} scenes
            </div>
            <div className="text-xl font-semibold text-muted-foreground">
              Final video: {formatDuration(getTotalDuration())}
            </div>
            <div className="text-sm text-muted-foreground">
              {getExtractionPercentage().toFixed(1)}% of original video extracted
              {originalVideoDuration > 0 && (
                <span className="ml-2">
                  (from {formatDuration(originalVideoDuration)} original)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={reshuffleScenes}
            disabled={selectedScenes.length < 2}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Reshuffle Selected ({selectedScenes.length})
          </Button>
          <Button onClick={onExport} size="lg">
            <Download className="w-4 h-4 mr-2" />
            Export Video (HD {exportFormat.toUpperCase()})
          </Button>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={onReset}>
            Upload Different Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
