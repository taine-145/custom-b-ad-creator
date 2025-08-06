import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey, adId } = await request.json();

    if (!apiKey || !secretKey || !adId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const BASE_URL = 'https://api.binance.com';
    const endpoint = '/sapi/v1/c2c/ads/getDetailByNo';
    
    const params: Record<string, string | number> = {
      adsNo: adId,
      recvWindow: 5000,
      timestamp: Date.now()
    };
    
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const signature = createSignature(queryString, secretKey);
    params.signature = signature;
    
    const stringParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      stringParams[key] = String(value);
    });
    
    const url = `${BASE_URL}${endpoint}?${new URLSearchParams(stringParams)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch ad details' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ad details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}