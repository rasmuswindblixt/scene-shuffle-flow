import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface DualVideoUploadProps {
  onVideosUpload: (files: [File, File]) => void;
  onBack: () => void;
}

const DualVideoUpload = ({ onVideosUpload, onBack }: DualVideoUploadProps) => {
  const [video1, setVideo1] = useState<File | null>(null);
  const [video2, setVideo2] = useState<File | null>(null);
  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error("Please select a valid video file");
      return false;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
      toast.error("File size must be less than 2GB");
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File, videoNumber: 1 | 2) => {
    if (!validateFile(file)) return;

    if (videoNumber === 1) {
      setVideo1(file);
      toast.success("Video 1 uploaded successfully!");
    } else {
      setVideo2(file);
      toast.success("Video 2 uploaded successfully!");
    }
  };

  const handleProceed = () => {
    if (!video1 || !video2) {
      toast.error("Please upload both videos before proceeding");
      return;
    }

    setIsUploading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsUploading(false);
      onVideosUpload([video1, video2]);
    }, 1500);
  };

  const handleDrop1 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging1(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0], 1);
    }
  };

  const handleDrop2 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging2(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0], 2);
    }
  };

  const UploadCard = ({ 
    videoNumber, 
    file, 
    isDragging, 
    onDrop, 
    onDragOver, 
    onDragLeave, 
    onClick 
  }: {
    videoNumber: 1 | 2;
    file: File | null;
    isDragging: boolean;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onClick: () => void;
  }) => (
    <Card className={`
      border-2 border-dashed transition-all duration-300 cursor-pointer
      ${isDragging 
        ? 'border-primary bg-primary/5 shadow-glow' 
        : file 
          ? 'border-green-500 bg-green-50' 
          : 'border-border hover:border-primary/50 hover:bg-accent/50'
      }
    `}>
      <CardContent 
        className="p-8 text-center"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={onClick}
      >
        {file ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Video {videoNumber} Ready</h3>
              <p className="text-sm text-muted-foreground mb-2">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                Size: {(file.size / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
              Change Video
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-2xl text-primary-foreground">{videoNumber}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {isDragging ? "Drop video here" : `Upload Video ${videoNumber}`}
              </h3>
              <p className="text-muted-foreground">
                or click to browse files
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Button variant="hero" size="lg">
                Select Video {videoNumber}
              </Button>
              <p className="text-sm text-muted-foreground">
                Supports MP4, MOV, AVI, WebM • Max size: 2GB
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Button variant="outline" onClick={onBack} className="mb-6">
            ← Back to Mode Selection
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upload Two Videos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload both video files to create a mashed compilation. The videos will be divided into segments and mixed together intelligently.
          </p>
        </div>

        {/* Upload Areas */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <UploadCard
            videoNumber={1}
            file={video1}
            isDragging={isDragging1}
            onDrop={handleDrop1}
            onDragOver={(e) => { e.preventDefault(); setIsDragging1(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging1(false); }}
            onClick={() => fileInput1Ref.current?.click()}
          />
          
          <UploadCard
            videoNumber={2}
            file={video2}
            isDragging={isDragging2}
            onDrop={handleDrop2}
            onDragOver={(e) => { e.preventDefault(); setIsDragging2(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging2(false); }}
            onClick={() => fileInput2Ref.current?.click()}
          />
        </div>

        {/* Proceed Button */}
        {video1 && video2 && (
          <div className="text-center">
            <Button 
              variant="premium" 
              size="lg" 
              onClick={handleProceed}
              disabled={isUploading}
              className="px-8"
            >
              {isUploading ? "Processing..." : "Proceed to Analysis"}
            </Button>
          </div>
        )}

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Segment Control</h3>
            <p className="text-sm text-muted-foreground">
              Choose how many segments to divide each video into for mixing
            </p>
          </Card>
          
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">⚖️</span>
            </div>
            <h3 className="font-semibold mb-2">Proportional Mixing</h3>
            <p className="text-sm text-muted-foreground">
              Longer videos contribute more clips per segment automatically
            </p>
          </Card>
          
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🎛️</span>
            </div>
            <h3 className="font-semibold mb-2">Same Filters</h3>
            <p className="text-sm text-muted-foreground">
              All filtering options apply to both videos for consistent results
            </p>
          </Card>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInput1Ref}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileSelect(files[0], 1);
            }
          }}
          className="hidden"
        />
        <input
          ref={fileInput2Ref}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileSelect(files[0], 2);
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default DualVideoUpload;