'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductData } from '@/lib/types';
import { ChevronDown, ChevronUp, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import JsonViewer from './JsonViewer';

interface ProductDetailsProps {
  products: Record<string, ProductData>;
}

export default function ProductDetails({ products }: ProductDetailsProps) {
  const productEntries = Object.entries(products);
  const [selectedImage, setSelectedImage] = useState<Record<string, number>>({});
  const [expandedPromos, setExpandedPromos] = useState<Record<string, boolean>>({});

  if (productEntries.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Product Information</h2>
      
      {productEntries.map(([store, product]) => (
        <Card key={store} className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {(product.store || store).toUpperCase()}
              </CardTitle>
              {product.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-10 w-10 p-0 hover:bg-gray-500"
                >
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="space-y-4">
                {product.images && product.images.length > 0 && (
                  <div className="relative aspect-square w-full max-w-sm mx-auto">
                    <Image
                      src={product.images[selectedImage[store] || 0]}
                      alt={product.name || 'Product image'}
                      fill
                      className="object-contain rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onClick={() => window.open(product.images[selectedImage[store] || 0], '_blank')}
                      onError={(e) => {
                        console.error('Image failed to load:', product.images[selectedImage[store] || 0]);
                        e.currentTarget.style.display = 'none';
                      }}
                      priority={false}
                      unoptimized
                    />
                  </div>
                )}
                
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`relative w-16 h-16 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${
                          (selectedImage[store] || 0) === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedImage(prev => ({ ...prev, [store]: index }))}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover rounded border"
                          sizes="64px"
                          onError={(e) => {
                            console.error('Thumbnail failed to load:', image);
                            e.currentTarget.style.display = 'none';
                          }}
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{product.name || 'Unknown Product'}</h3>
                  {product.brand && (
                    <p className="text-muted-foreground">by {product.brand}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>GTIN: {product.gtin}</span>
                </div>

                {/* Categories */}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.categories.slice(0, 5).map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Price Information */}
                <div className="space-y-2">
                  {product.price > 0 && (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        {product.currency} {product.price.toFixed(2)}
                      </div>
                      {product.discounts && product.discounts.length > 0 && (
                        <div className="space-y-1">
                          {product.discounts.map((discountPrice, index) => {
                            const discount = typeof discountPrice === 'number' ? discountPrice : parseFloat(discountPrice);
                            const percentage = Math.round(((product.price - discount) / product.price) * 100);
                            return (
                              <div key={index} className="border-2 border-red-500 bg-red-50 px-3 py-2 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                  {product.currency} {discount.toFixed(2)}
                                </div>
                                <div className="text-sm font-medium text-red-600">
                                  {percentage}% OFF
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {product.unit_price > 0 && product.unit_of_measure && (
                    <div className="text-sm text-muted-foreground">
                      {product.currency} {product.unit_price.toFixed(2)} / {product.unit_of_measure}
                    </div>
                  )}
                  
                  {product.quantity > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Stock: {product.quantity}
                    </div>
                  )}
                </div>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{(product.rating * 100).toFixed(0)}%</span>
                    </div>
                    {product.rating_count > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({product.rating_count} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Promotions */}
                {product.promotions && product.promotions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Promotions</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedPromos(prev => ({ ...prev, [`${store}-promo`]: !prev[`${store}-promo`] }))}
                        className="h-10 w-10 p-0 hover:bg-gray-500"
                      >
                        {expandedPromos[`${store}-promo`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {expandedPromos[`${store}-promo`] && product.promotions.map((promo, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          {typeof promo === 'string' ? (
                            <span className="text-green-800 text-sm">{promo}</span>
                          ) : (
                            <JsonViewer data={promo} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}