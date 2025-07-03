import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail?: string;
  segment: number;
}

interface SceneTimelineProps {
  scenes: Scene[];
  videoUrl: string;
}

const SceneTimeline = ({ scenes, videoUrl }: SceneTimelineProps) => {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [playingScene, setPlayingScene] = useState<string | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getDurationColor = (duration: number) => {
    if (duration < 1) return "bg-red-500";
    if (duration < 3) return "bg-yellow-500";
    if (duration < 6) return "bg-green-500";
    return "bg-blue-500";
  };

  const groupedScenes = scenes.reduce((acc, scene) => {
    if (!acc[scene.segment]) {
      acc[scene.segment] = [];
    }
    acc[scene.segment].push(scene);
    return acc;
  }, {} as { [key: number]: Scene[] });

  const handleSceneClick = (sceneId: string) => {
    setSelectedScene(sceneId === selectedScene ? null : sceneId);
  };

  const playScene = (scene: Scene) => {
    setPlayingScene(scene.id);
    // In a real implementation, this would control video playback
    setTimeout(() => setPlayingScene(null), scene.duration * 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="text-2xl">📽️</span>
          Scene Timeline
          <span className="text-sm font-normal text-muted-foreground">
            ({scenes.length} scenes)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline Overview */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>&lt;1s</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>1-3s</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>3-6s</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>6s+</span>
              </div>
            </div>
            
            <div className="flex gap-1 h-8 rounded overflow-hidden">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className={`
                    ${getDurationColor(scene.duration)} opacity-80 hover:opacity-100 
                    cursor-pointer transition-all duration-200 relative group
                    ${selectedScene === scene.id ? 'ring-2 ring-primary scale-105' : ''}
                  `}
                  style={{ 
                    width: `${(scene.duration / scenes.reduce((acc, s) => acc + s.duration, 0)) * 100}%`,
                    minWidth: '4px'
                  }}
                  onClick={() => handleSceneClick(scene.id)}
                  title={`Scene ${scenes.indexOf(scene) + 1}: ${formatTime(scene.startTime)} - ${formatTime(scene.endTime)} (${scene.duration.toFixed(1)}s)`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Segment Groups */}
          {Object.entries(groupedScenes)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([segment, segmentScenes]) => (
            <div key={segment} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">
                  Segment {parseInt(segment) + 1}
                </h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {segmentScenes.length} scenes
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {segmentScenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className={`
                      border rounded-lg p-3 cursor-pointer transition-all duration-200
                      ${selectedScene === scene.id 
                        ? 'border-primary bg-primary/5 shadow-primary' 
                        : 'border-border hover:border-primary/50 hover:shadow-md'
                      }
                      ${playingScene === scene.id ? 'animate-pulse' : ''}
                    `}
                    onClick={() => handleSceneClick(scene.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Scene {scenes.indexOf(scene) + 1}
                      </span>
                      <div className={`
                        w-2 h-2 rounded-full
                        ${getDurationColor(scene.duration)}
                      `}></div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Start: {formatTime(scene.startTime)}</div>
                      <div>End: {formatTime(scene.endTime)}</div>
                      <div className="font-medium">
                        Duration: {scene.duration.toFixed(1)}s
                      </div>
                    </div>

                    {selectedScene === scene.id && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            playScene(scene);
                          }}
                        >
                          {playingScene === scene.id ? 'Playing...' : 'Preview Scene'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-gradient-secondary rounded-lg p-4">
            <h4 className="font-semibold mb-2">Timeline Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Scenes:</span>
                <div className="font-semibold">{scenes.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Segments:</span>
                <div className="font-semibold">{Object.keys(groupedScenes).length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Duration:</span>
                <div className="font-semibold">
                  {(scenes.reduce((acc, s) => acc + s.duration, 0) / scenes.length).toFixed(1)}s
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Time:</span>
                <div className="font-semibold">
                  {formatTime(scenes.reduce((acc, s) => acc + s.duration, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SceneTimeline;