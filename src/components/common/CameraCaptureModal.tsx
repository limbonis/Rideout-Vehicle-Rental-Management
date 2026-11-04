import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  title: string;
  isSelfie?: boolean;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  title,
  isSelfie = false,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setIsInitializing(true);
        setCameraError(null);
        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isSelfie ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
          videoRef.current.play();
        }
        setStream(localStream);
      } catch (err: any) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera access was denied in browser permissions. You can upload a photo instead.'
            : 'No working camera device was detected on your system.'
        );
      } finally {
        setIsInitializing(false);
      }
    }

    initCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isSelfie]);

  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isSelfie) {
      // Mirror selfie
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        onCapture(reader.result as string);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-stone-100">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-xs text-stone-300 max-w-sm">{cameraError}</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg cursor-pointer">
                <span>Select Photo from Files</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFallbackUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : isInitializing ? (
            <div className="text-xs text-stone-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Starting camera viewfinder...</span>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${isSelfie ? '-scale-x-100' : ''}`}
              />
              {/* Overlay target grid */}
              <div className="absolute inset-0 pointer-events-none border border-white/20 m-6 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                  {isSelfie ? 'Center rider selfie here' : 'Align motorbike in frame'}
                </span>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
          <label className="text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer underline">
            <span>Or choose file from gallery</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFallbackUpload}
              className="hidden"
            />
          </label>

          <div className="flex items-center gap-2">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 rounded-lg flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Use Photo</span>
                </button>
              </>
            ) : !cameraError ? (
              <button
                type="button"
                onClick={handleSnap}
                className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-2 shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
