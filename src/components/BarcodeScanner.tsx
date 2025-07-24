'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, RotateCcw, Search, Square, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
}

export default function BarcodeScanner({ onScan, isLoading }: BarcodeScannerProps) {
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onScan(input.trim());
      setInput('');
    }
  };

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearTimeout(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (readerRef.current) {
      readerRef.current.reset();
    }
    
    setIsScanning(false);
    setShowCamera(false);
    setScanError(null);
  }, []);

  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
    } catch (error) {
      console.error('Error getting cameras:', error);
    }
  }, []);

  const switchCamera = useCallback(() => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
      if (isScanning) {
        stopScanning();
        // Restart scanning with new camera after a brief delay
        setTimeout(() => startScanning(), 100);
      }
    }
  }, [cameras.length, currentCameraIndex, isScanning, stopScanning]);

  const startScanning = useCallback(async () => {
    try {
      setScanError(null);
      setShowCamera(true);
      
      // Get available cameras first
      await getCameras();
      
      let stream;
      const currentCamera = cameras[currentCameraIndex];
      
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: currentCamera ? { exact: currentCamera.deviceId } : undefined,
            facingMode: currentCamera ? undefined : 'environment'
          }
        });
      } catch {
        try {
          // Fallback to basic constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              deviceId: currentCamera ? { exact: currentCamera.deviceId } : undefined,
              facingMode: currentCamera ? undefined : 'environment'
            }
          });
        } catch {
          // Final fallback
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsScanning(true);
          
          // Initialize barcode reader
          if (!readerRef.current) {
            readerRef.current = new BrowserMultiFormatReader();
          }
          
           const scanFrame = async () => {
             if (!videoRef.current || !readerRef.current) return;
             
             try {
               const result = await readerRef.current.decodeFromVideoElement(videoRef.current);
               if (result && result.getText()) {
                 onScan(result.getText());
                 stopScanning();
                 return;
               }
             } catch {
               // Continue scanning
             }
             
             if (isScanning) {
               scanIntervalRef.current = setTimeout(scanFrame, 50);
             }
           };
          
          // Start the scanning loop
          scanFrame();
        };
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setScanError('Camera access denied. Please allow camera permissions.');
      setShowCamera(false);
    }
  }, [onScan, isScanning, stopScanning, getCameras, cameras, currentCameraIndex]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let fileToScan = file;

    if (file.name.toLowerCase().endsWith('.heic')) {
      try {
        const heic2any = (await import('heic2any')).default;
        const blob = await heic2any({ blob: file, toType: 'image/jpeg' });
        fileToScan = new File([Array.isArray(blob) ? blob[0] : blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch {
        return;
      }
    }

    try {
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(URL.createObjectURL(fileToScan));
      onScan(result.getText());
    } catch {
      setScanError('No barcode detected. Please try again with a clearer image.');
    }
  }, [onScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Camera Scanner */}
      {showCamera && (
        <div className="space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 sm:h-80 object-cover"
              playsInline
              muted
              autoPlay
            />
            
            {/* Scanner overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 sm:w-48 sm:h-48 border-2 border-white border-dashed rounded-lg opacity-50">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              </div>
            </div>
            
            {/* Control buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              {cameras.length > 1 && (
                <Button
                  onClick={switchCamera}
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                  title="Switch Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={stopScanning}
                variant="ghost"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Status indicator - moved outside video area */}
          <div className="bg-black/90 text-white px-4 py-3 rounded-lg text-sm text-center">
            {isScanning ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Scanning...
              </div>
            ) : (
              'Initializing camera...'
            )}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {scanError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {scanError}
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Item Number"
          disabled={isLoading}
          className="pr-32 h-12 text-lg"
        />
        
        {/* Live scan button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={isScanning ? stopScanning : startScanning}
          disabled={isLoading}
          className={`absolute right-24 top-1 h-10 w-10 p-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 ${
            isScanning ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800' : ''
          }`}
        >
          {isScanning ? <Square className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
        </Button>
        
        {/* File upload button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isScanning}
          className="absolute right-13 top-1 h-10 w-10 p-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <Upload className="w-5 h-5" />
        </Button>
        
        {/* Search button */}
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={isLoading || !input.trim() || isScanning}
          className="absolute right-2 top-1 h-10 w-10 p-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <Search className="w-5 h-5" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic"
          onChange={handleFileUpload}
          className="hidden"
        />
      </form>
    </div>
  );
}