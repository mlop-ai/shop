'use client';

import BarcodeScanner from '@/components/BarcodeScanner';
import ProductDetails from '@/components/ProductDetails';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getProductByGTIN } from '@/lib/api';
import { GTINResponse } from '@/lib/types';
import JsBarcode from 'jsbarcode';
import { Copy, Loader2, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface PageProps {
  params: Promise<{ gtin: string }>;
}

export default function GTINPage({ params }: PageProps) {
  const router = useRouter();
  const [gtin, setGtin] = useState<string>('');
  const [products, setProducts] = useState<GTINResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const barcodeRef = useRef<SVGSVGElement>(null);

  const handleScan = async (newGtin: string) => {
    if (newGtin === gtin) {
      return;
    }
    router.push(`/gtin/${newGtin}`);
  };

  const fetchProductData = async (gtinToFetch: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductByGTIN(gtinToFetch);
      setProducts(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch information');
      setProducts({});
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    fetchProductData(gtin);
  };

  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Generate barcode when GTIN changes
  useEffect(() => {
    if (gtin && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, gtin, {
          format: "EAN13",
          width: 2,
          height: 60,
          displayValue: false,
          margin: 10,
          background: "#f8fafc", // Light blue background to match the container
          lineColor: "#1e40af" // Blue color to match the theme
        });
      } catch (err) {
        console.error('Failed to generate barcode:', err);
        // Try with a more generic format if EAN13 fails
        try {
          JsBarcode(barcodeRef.current, gtin, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: false,
            margin: 10,
            background: "#f8fafc",
            lineColor: "#1e40af"
          });
        } catch (err2) {
          console.error('Failed to generate barcode with CODE128:', err2);
        }
      }
    }
  }, [gtin]);

  useEffect(() => {
    params.then(({ gtin: gtinParam }) => {
      setGtin(gtinParam);
      if (gtinParam) {
        fetchProductData(gtinParam);
      }
    });
  }, [params]);

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

        <BarcodeScanner onScan={handleScan} isLoading={loading} />

        {gtin && (
          <div className="max-w-md mx-auto">
            <div className="relative border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 px-4 py-4 rounded-lg">
              <div className="text-center space-y-3">
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  GTIN
                </div>
                
                {/* Barcode display */}
                <div className="flex justify-center">
                  <svg 
                    ref={barcodeRef}
                    className="max-w-full h-auto"
                  ></svg>
                </div>
                
                {/* GTIN number below barcode */}
                <div className="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100 break-all">
                  {gtin}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300"
                title="Copy page URL"
              >
                <Copy className="w-4 h-4" />
              </Button>
              {copySuccess && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                  Saved URL to Clipboard
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Fetching product...</span>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                {gtin && (
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

        {!loading && !error && Object.keys(products).length === 0 && gtin && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No products found for GTIN: {gtin}
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