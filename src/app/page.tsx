'use client';

import BarcodeScanner from '@/components/BarcodeScanner';
import ProductDetails from '@/components/ProductDetails';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getProductByGTIN } from '@/lib/api';
import { GTINResponse } from '@/lib/types';
import { Loader2, QrCode } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [products, setProducts] = useState<GTINResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedGtin, setLastScannedGtin] = useState<string>('');

  const handleScan = async (gtin: string) => {
    setLoading(true);
    setError(null);
    setLastScannedGtin(gtin);

    try {
      const response = await getProductByGTIN(gtin);
      setProducts(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product information');
      setProducts({});
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    if (lastScannedGtin) {
      handleScan(lastScannedGtin);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <QrCode className="w-8 h-8" />
            Shopping API
          </h1>
          <p className="text-muted-foreground mt-2">
            Scan barcodes to get product information
          </p>
        </div>

        <BarcodeScanner onScan={handleScan} isLoading={loading} />

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Fetching product information...</span>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                {lastScannedGtin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRescan}
                    disabled={loading}
                  >
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {Object.keys(products).length > 0 && (
          <ProductDetails products={products} />
        )}

        {!loading && !error && Object.keys(products).length === 0 && lastScannedGtin && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No products found for GTIN: {lastScannedGtin}
            </p>
            <Button
              variant="outline"
              onClick={handleRescan}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
