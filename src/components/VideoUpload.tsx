import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useDropzone } from 'react-dropzone';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
  onBack?: () => void;
}

const VideoUpload = ({ onVideoUpload, onBack }: VideoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputKey, setInputKey] = useState(0);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error("Please select a valid video file");
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
      toast.error("File size must be less than 2GB");
      return;
    }

    setIsUploading(true);
    
    // Simulate upload processing
    setTimeout(() => {
      setIsUploading(false);
      onVideoUpload(file);
      toast.success("Video uploaded successfully!");
      if (fileInputRef.current) fileInputRef.current.value = '';
      setInputKey(k => k + 1); // force new input
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
      e.target.value = '';
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false,
    maxFiles: 1,
    noKeyboard: false,
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="mb-6">
              ← Back to Mode Selection
            </Button>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upload Your Video
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your video file to start the automatic scene detection and splitting process. 
            We support MP4, MOV, AVI, and other common video formats.
          </p>
        </div>

        {/* Upload Area */}
        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isDragActive || isDragging 
              ? 'border-primary bg-primary/5 shadow-glow' 
              : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }
            ${isUploading ? 'pointer-events-none opacity-75' : ''}
          `}
        >
          <CardContent className="p-12 text-center">
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-2xl">🎬</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Processing Upload...</h3>
                  <p className="text-muted-foreground">
                    Preparing your video for scene detection
                  </p>
                </div>
                <div className="w-48 mx-auto bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl text-primary-foreground">📁</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isDragging ? "Drop your video here" : "Drag & drop your video"}
                  </h3>
                  <p className="text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Button variant="hero" size="lg" onClick={openFileDialog}>
                    Select Video File
                  </Button>
                   <p className="text-sm text-muted-foreground">
                     Supports MP4, MOV, AVI, WebM • Max size: 2GB
                   </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Smart Detection</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered scene change detection analyzes your video automatically
            </p>
          </Card>
          
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Fast Processing</h3>
            <p className="text-sm text-muted-foreground">
              Process videos quickly with browser-based analysis
            </p>
          </Card>
          
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🔀</span>
            </div>
            <h3 className="font-semibold mb-2">Smart Shuffle</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent scene shuffling with segment preservation
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;