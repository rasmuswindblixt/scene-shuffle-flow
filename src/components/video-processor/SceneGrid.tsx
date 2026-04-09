import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Square as SquareIcon } from "lucide-react";
import { useCoreContext } from "@/contexts/VideoProcessorContext";
import { Scene } from "@/types/scene";

const SceneCard = memo(({ scene, index, showVideoIndicator, onToggle }: {
  scene: Scene;
  index: number;
  showVideoIndicator: boolean;
  onToggle: (id: string) => void;
}) => (
  <div className="relative group">
    <div
      className={`relative rounded-lg border-2 cursor-pointer transition-all ${
        scene.selected
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 bg-gray-100 opacity-60'
      }`}
      onClick={() => onToggle(scene.id)}
    >
      <img
        src={scene.thumbnail}
        alt={`Scene ${index + 1}`}
        className={`w-full aspect-video object-cover rounded-lg transition-opacity ${
          scene.selected ? 'opacity-100' : 'opacity-50'
        }`}
      />

      {/* Selection Checkbox */}
      <div className="absolute top-1 left-1">
        <Checkbox
          checked={scene.selected}
          onCheckedChange={() => onToggle(scene.id)}
          className="bg-white/90 border-gray-400"
        />
      </div>

      {/* Scene Number */}
      <div className={`absolute bottom-1 left-1 text-white text-xs px-1 rounded ${
        scene.selected ? 'bg-primary' : 'bg-gray-500'
      }`}>
        {index + 1}
      </div>

      {/* Video Indicator */}
      {showVideoIndicator && (
        <div className="absolute top-1 right-1 bg-secondary text-primary text-xs px-1 rounded font-bold">
          V{(scene.videoIndex || 0) + 1}
        </div>
      )}

      {/* Hover Info */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <div className="text-white text-xs font-medium text-center">
          Scene {index + 1}
          {showVideoIndicator && (
            <>
              <br />
              <span className="text-xs bg-primary/80 px-1 rounded">
                Video {(scene.videoIndex || 0) + 1}
              </span>
            </>
          )}
          <br />
          {scene.duration.toFixed(1)}s
          <br />
          <span className={`text-xs px-1 rounded ${scene.selected ? 'bg-green-600' : 'bg-red-600'}`}>
            {scene.selected ? 'Selected' : 'Deselected'}
          </span>
        </div>
      </div>
    </div>
  </div>
));

SceneCard.displayName = 'SceneCard';

export default function SceneGrid() {
  const {
    scenes, shuffledScenes, videoFiles,
    getSelectedShuffledScenes, getVideoMixingStats,
    toggleSceneSelection, toggleSelectAll,
  } = useCoreContext();

  const showVideoIndicator = videoFiles.length > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scene Selection & Preview</CardTitle>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {getSelectedShuffledScenes().length} of {shuffledScenes.length} scenes selected
              {showVideoIndicator && (
                <>
                  <br />
                  <span className="text-primary font-medium">
                    {getVideoMixingStats(getSelectedShuffledScenes())}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="flex items-center gap-2"
            >
              {scenes.every(s => s.selected) ? (
                <>
                  <SquareIcon className="w-4 h-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Select All
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-3">
          {shuffledScenes.map((scene, index) => (
            <SceneCard
              key={`shuffled-${scene.id}-${index}`}
              scene={scene}
              index={index}
              showVideoIndicator={showVideoIndicator}
              onToggle={toggleSceneSelection}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
