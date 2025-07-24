export interface Promotion {
  id?: string;
  name?: string;
  base?: string;
  loyalty?: string;
  url?: string;
  start?: number;
  end?: number;
  old_price?: number;
  new_price?: number;
}

export interface GTINRequest {
  gtin: string;
  raw: boolean;
}

export interface ProductData {
  store: string;
  gtin: string;
  time: number;
  raw: Record<string, unknown> | unknown[];
  id: string;
  name: string;
  brand: string;
  categories: string[];
  quantity: number;
  currency: string;
  price: number;
  unit_price: number;
  unit_of_measure: string;
  discounts: (string | number)[];
  promotions: (string | Promotion)[];
  images: string[];
  rating: number;
  rating_count: number;
  url: string;
}

export interface GTINResponse {
  [key: string]: ProductData;
}