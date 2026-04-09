import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Film } from "lucide-react";
import SceneDetector from "@/components/SceneDetector";
import { useCoreContext } from "@/contexts/VideoProcessorContext";

export default function AnalysisView() {
  const {
    isAnalyzing, videoFiles, videoUrls,
    currentVideoIndex,
  } = useCoreContext();

  return (
    <div className="space-y-6">
      {/* Info message */}
      {isAnalyzing && (
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-base text-foreground">
                It's safe to leave the tab while processing, but don't close it
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Feel free to browse other tabs - your video will keep processing in the background!
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scene Detection in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>Analyzing video for scene changes...</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Enhanced detection analyzes every 0.5s with improved sensitivity to find more scenes.<br />
                Scenes are filtered to 1.8-7.7s, trimmed by 0.8s (transitions removed), then capped at 6.9s max.
              </p>
            </div>
          ) : (
            <p className="text-center">Analysis complete!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
