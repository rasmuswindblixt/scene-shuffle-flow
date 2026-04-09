import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useCoreContext, useExportContext } from "@/contexts/VideoProcessorContext";
import { EXPORT_WIDTH, EXPORT_HEIGHT, EXPORT_BITRATE_HIGH } from "@/lib/constants";

interface ExportDialogProps {
  onDownload: () => void;
}

export default function ExportDialog({ onDownload }: ExportDialogProps) {
  const { getSelectedShuffledScenes, getScenesWithinDuration, maxVideoDuration } = useCoreContext();
  const {
    showExportDialog, setShowExportDialog,
    isExporting, exportProgress,
    exportedVideoBlob, exportLogs,
  } = useExportContext();

  const scenesToExport = getScenesWithinDuration(getSelectedShuffledScenes(), maxVideoDuration);

  return (
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export in Progress</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Processing {scenesToExport.length} selected scenes within duration limit...</p>
            <p>Quality: HD 720p ({EXPORT_WIDTH}x{EXPORT_HEIGHT}) • Format: MP4/WebM • Bitrate: {EXPORT_BITRATE_HIGH / 1_000_000} Mbps</p>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {exportProgress.toFixed(0)}% complete
              </p>
            </div>
          )}

          {exportedVideoBlob && (
            <div className="space-y-2">
              <p className="text-sm text-center text-green-600">
                Export completed successfully!
              </p>
              <Button onClick={onDownload} className="w-full">
                Download Shuffled Video
              </Button>
            </div>
          )}

          {exportLogs.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Processing Logs:</h4>
              <div className="text-xs space-y-1">
                {exportLogs.map((log, index) => (
                  <div key={index} className="text-gray-600">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
