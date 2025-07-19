import { GTINRequest, GTINResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getProductByGTIN(gtin: string): Promise<GTINResponse> {
  const request: GTINRequest = { gtin, raw: false };

  const response = await fetch(`${API_URL}/gtin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}