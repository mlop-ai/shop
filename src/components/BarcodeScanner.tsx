'use client';

import { useState, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Camera, Search } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
}

export default function BarcodeScanner({ onScan, isLoading }: BarcodeScannerProps) {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onScan(input.trim());
      setInput('');
    }
  };

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
      // Silent fail
    }
  }, [onScan]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter barcode or search for products"
          disabled={isLoading}
          className="pr-24 h-12 text-lg"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="absolute right-12 top-1 h-10 w-10 p-0 hover:bg-gray-500"
        >
          <Camera className="w-5 h-5" />
        </Button>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={isLoading || !input.trim()}
          className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-gray-500"
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