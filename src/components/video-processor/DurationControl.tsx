import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Film } from "lucide-react";
import { useCoreContext } from "@/contexts/VideoProcessorContext";

export default function DurationControl() {
  const {
    maxVideoDuration, setMaxVideoDuration,
    getSelectedShuffledScenes, getScenesWithinDuration, formatDuration,
  } = useCoreContext();

  const selectedScenes = getSelectedShuffledScenes();
  const totalSelected = selectedScenes.reduce((sum, s) => sum + s.duration, 0);
  const minDuration = Math.min(60, totalSelected);
  const scenesWithin = getScenesWithinDuration(selectedScenes, maxVideoDuration);
  const excluded = selectedScenes.length - scenesWithin.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Length Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Max Video Duration</label>
            <span className="text-sm text-muted-foreground">
              {formatDuration(maxVideoDuration)} / {formatDuration(totalSelected)}
            </span>
          </div>

          <Slider
            value={[maxVideoDuration]}
            onValueChange={(value) => setMaxVideoDuration(value[0])}
            max={totalSelected}
            min={minDuration}
            step={0.1}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatDuration(minDuration)}</span>
            <span>{formatDuration(totalSelected)}</span>
          </div>

          {excluded > 0 && (
            <div className="text-center text-sm text-muted-foreground bg-card border border-border p-2 rounded">
              <Film className="w-4 h-4 inline mr-1" />
              {excluded} selected scenes will be excluded to fit duration limit
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
