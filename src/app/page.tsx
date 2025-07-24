'use client';

import BarcodeScanner from '@/components/BarcodeScanner';
import { QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleScan = (gtin: string) => {
    router.push(`/gtin/${gtin}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <QrCode className="w-8 h-8" />
            Shop API
          </h1>
          <p className="text-muted-foreground mt-2">
            Scan barcodes to get information
          </p>
        </div>

        <BarcodeScanner onScan={handleScan} isLoading={false} />
      </div>
    </div>
  );
}
