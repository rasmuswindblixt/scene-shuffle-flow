import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useDropzone } from 'react-dropzone';
import { Film, Upload, ArrowDown, Play } from 'lucide-react';

interface VideoUploadProps {
  onVideoUpload: (files: File[]) => void;
}

const VideoUpload = ({ onVideoUpload }: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileSelect = (file: File) => {
    // Use the same multi-file handler for consistency
    handleMultipleFiles([file]);
  };

  const removeVideo = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    toast.success("Video removed!");
  };

  const startProcessing = () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one video");
      return;
    }
    onVideoUpload(uploadedFiles);
  };



  const onDrop = (acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    
    if (!acceptedFiles || acceptedFiles.length === 0) {
      console.log('No files to process');
      return;
    }
    
    // Check if we would exceed the limit
    const availableSlots = 3 - uploadedFiles.length;
    if (acceptedFiles.length > availableSlots) {
      toast.error(`Maximum 3 videos allowed. You have ${availableSlots} slot${availableSlots !== 1 ? 's' : ''} remaining, but tried to add ${acceptedFiles.length} files.`);
      return;
    }
    
    // Process all files together instead of one by one
    handleMultipleFiles(acceptedFiles);
  };

  const handleMultipleFiles = async (files: File[]) => {
    console.log('Processing multiple files:', files.map(f => f.name));
    setIsUploading(true);
    
    const validFiles: File[] = [];
    
    // Validate all files first
    for (const file of files) {
      console.log('Validating file:', file.name);
      
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a valid video file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024 * 1024) { // 5GB limit
        toast.error(`${file.name} is too large (max 5GB)`);
        continue;
      }

      // Check duration limit (60 minutes = 3600 seconds)
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      
      try {
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            if (video.duration > 3600) {
              toast.error(`${file.name} is too long (max 60 minutes)`);
              URL.revokeObjectURL(video.src);
              reject(new Error('Video too long'));
            } else {
              URL.revokeObjectURL(video.src);
              resolve();
            }
          };
          video.onerror = (error) => {
            console.log(`Video validation error for ${file.name} (this is normal for invalid files):`, error);
            toast.error(`Error loading ${file.name}`);
            URL.revokeObjectURL(video.src);
            reject(new Error('Video load error'));
          };
        });
        
        validFiles.push(file);
        console.log('File validated:', file.name);
      } catch (error) {
        console.log('File validation failed:', file.name, error);
        // Error already shown in toast
      }
    }
    
    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }
    
    // Simulate upload processing
    setTimeout(() => {
      setIsUploading(false);
      
      // Add all valid files to uploaded files
      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      
             if (validFiles.length === 1) {
         if (newFiles.length === 1) {
           toast.success(`${validFiles[0].name} uploaded! Add more videos to mix them together.`);
         } else {
           toast.success(`${validFiles[0].name} uploaded! Ready to analyze ${newFiles.length} videos.`);
         }
       } else {
         toast.success(`${validFiles.length} videos uploaded! Ready to analyze.`);
       }
    }, 1500);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => {
      console.log('Drag entered dropzone');
    },
    onDragLeave: () => {
      console.log('Drag left dropzone');
    },
    onDropAccepted: (files) => {
      console.log('Files accepted by dropzone:', files);
    },
    onDropRejected: (rejections) => {
      console.log('Files rejected by dropzone:', rejections);
      rejections.forEach(rejection => {
        console.log('Rejection reason:', rejection.errors);
        toast.error(`File rejected: ${rejection.errors[0]?.message || 'Invalid file'}`);
      });
    },
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv']
    },
    multiple: true,
    maxFiles: 3,
    disabled: isUploading,
    noClick: false,
    noKeyboard: false
  });



  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Upload Your Videos</h2>
          <p className="text-muted-foreground">
            Upload 1-3 videos to mix and shuffle their scenes together (max 60 minutes each)
          </p>
        </div>

        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isDragActive 
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
                  <Film className="w-8 h-8 text-white" />
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
            ) : isDragActive ? (
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                  <ArrowDown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Drop your video{uploadedFiles.length === 0 ? 's' : ''} here</h3>
                  <p className="text-muted-foreground">
                    Release to upload {uploadedFiles.length === 0 ? 'up to 3 videos' : 'your video file'}
                  </p>
                  {uploadedFiles.length > 0 && (
                    <p className="text-sm text-primary mt-2">
                      {uploadedFiles.length}/3 videos uploaded
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                  <Film className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Choose Video File</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your video here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: MP4, AVI, MOV, MKV, WebM • Max: 5GB, 60 minutes
                  </p>
                </div>
                <Button size="lg" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show uploaded videos */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Uploaded Videos ({uploadedFiles.length}/3)</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeVideo(index)}
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-4">
                {uploadedFiles.length < 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    {uploadedFiles.length === 1 
                      ? "Add more videos to mix them together for longer output" 
                      : uploadedFiles.length === 2 
                        ? "Add one more video for maximum content variety"
                        : "Add more videos to mix them together for longer output"
                    }
                  </p>
                )}
                
                <div className="flex justify-center">
                  <Button 
                    onClick={startProcessing} 
                    size="lg"
                    className="px-8 py-3 text-lg"
                    disabled={isUploading || uploadedFiles.length === 0}
                  >
                    {uploadedFiles.length === 1 ? (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Continue to Scene Analysis
                      </>
                    ) : (
                      <>
                        <Film className="w-5 h-5 mr-2" />
                        Mix & Analyze {uploadedFiles.length} Videos
                      </>
                    )}
                  </Button>
                </div>
                
                {uploadedFiles.length === 3 && (
                  <p className="text-sm text-primary text-center font-medium">
                    <Film className="w-4 h-4 inline mr-1" />
                    Excellent! Three videos will be mixed together for maximum content variety
                  </p>
                )}
                {uploadedFiles.length === 2 && (
                  <p className="text-sm text-primary text-center font-medium">
                    <Film className="w-4 h-4 inline mr-1" />
                    Great! Two videos will be mixed together for enhanced variety
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Videos will be analyzed for scene changes, mixed together, and filtered to 1-6.9 second clips.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;