import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PhaseContainer } from '../PhaseContainer';
import { Camera, Upload, RotateCcw, Check, Square } from 'lucide-react';

interface PhotoUploadPhaseProps {
  onPhotoUpload: (file: File) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PhotoUploadPhase: React.FC<PhotoUploadPhaseProps> = ({
  onPhotoUpload,
  onNext,
  onBack
}) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tagDetectionPosition, setTagDetectionPosition] = useState({ x: 20, y: 30 });
  const [tagDetectionOpacity, setTagDetectionOpacity] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>();

  const startCamera = async () => {
    setShowCamera(true);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
    } catch (error) {
      console.error('Camera access denied:', error);
      setShowCamera(false);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShowCamera(false);
    setIsCapturing(false);
    
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Animate the tag detection overlay with fading
  useEffect(() => {
    if (showCamera) {
      const animate = () => {
        const time = Date.now() * 0.001;
        
        // Create a smooth circular motion around the windshield area
        const radius = 15;
        const centerX = 50;
        const centerY = 40;
        
        // Update position
        setTagDetectionPosition({
          x: centerX + Math.sin(time) * radius + Math.sin(time * 0.7) * 5,
          y: centerY + Math.cos(time * 0.8) * radius + Math.cos(time * 1.2) * 3
        });
        
        // Create fading effect - fade in and out every 2 seconds
        const fadeCycle = Math.sin(time * 2) * 0.5 + 0.5; // 0 to 1
        setTagDetectionOpacity(fadeCycle);
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showCamera]);

  const capturePhoto = () => {
    if (videoRef.current && !isCapturing) {
      setIsCapturing(true);
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      
      if (context) {
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob and create file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'installation-photo.jpg', { type: 'image/jpeg' });
            setPhoto(file);
            setPreviewUrl(canvas.toDataURL());
            stopCamera();
          }
          setIsCapturing(false);
        }, 'image/jpeg', 0.9);
      } else {
        setIsCapturing(false);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRetry = () => {
    setPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (photo) {
      setIsUploading(true);
      try {
        onPhotoUpload(photo);
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        onNext();
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stream]);

  return (
    <PhaseContainer
      currentPhase={2}
      totalPhases={4}
      title="Final Step: Confirm Installation"
      subtitle="Upload a photo of your installed TagMax"
    >
      <div className="space-y-6">
        {!showCamera && !photo ? (
          <>
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">📸</div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  Take a photo of TagMax on your windshield
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure the device and windshield are clearly visible
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4">
              <h4 className="font-medium text-amber-800 mb-2">Photo Guidelines:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Show the full windshield area</li>
                <li>• Ensure TagMax is clearly visible</li>
                <li>• No tint or obstructions in view</li>
                <li>• Good lighting for clear image</li>
              </ul>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-3">
              <Button
                onClick={startCamera}
                className="w-full flex items-center gap-2"
                variant="default"
              >
                <Camera className="w-4 h-4" />
                Auto Capture
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Upload className="w-4 h-4" />
                Take a Photo
              </Button>
            </div>
          </>
        ) : showCamera ? (
          <>
            {/* Live Camera Feed with AR Overlays */}
            <div className="relative aspect-video bg-black overflow-hidden rounded-md">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Windshield Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/80 bg-transparent rounded-lg">
                  <div className="absolute -top-6 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                    Align windshield within frame
                  </div>
                </div>
              </div>

              {/* Fading Tag Detection Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="absolute w-16 h-12 border-2 border-blue-400 bg-blue-400/10 rounded-lg flex items-center justify-center"
                  style={{
                    left: `${tagDetectionPosition.x}%`,
                    top: `${tagDetectionPosition.y}%`,
                    opacity: tagDetectionOpacity,
                    transition: 'opacity 0.2s ease-out'
                  }}
                >
                  <div className="text-blue-300 text-xs font-medium text-center">
                    <div className="animate-pulse">Searching Tag</div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mt-1 animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                Position your windshield within the white frame
              </p>
              <p className="text-xs text-muted-foreground">
                Make sure TagMax is clearly visible
              </p>
            </div>
            
            {/* Camera Controls */}
            <div className="flex gap-3">
              <Button
                onClick={stopCamera}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="flex-1 flex items-center gap-2"
                variant="default"
              >
                {isCapturing ? (
                  <>
                    <Square className="w-4 h-4 animate-pulse" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    Capture Photo
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Photo Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted overflow-hidden rounded-lg">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="TagMax installation preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Does this photo clearly show your TagMax installation?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="flex-1 flex items-center gap-2"
                variant="default"
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        <div className="flex gap-3 mt-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isUploading}
          >
            Back
          </Button>
        </div>
      </div>
    </PhaseContainer>
  );
};
