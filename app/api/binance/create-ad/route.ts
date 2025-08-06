import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey, adData } = await request.json();

    if (!apiKey || !secretKey || !adData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const BASE_URL = 'https://api.binance.com';
    const endpoint = '/sapi/v1/c2c/ads/post';
    
    const params: Record<string, any> = {
      recvWindow: 5000,
      timestamp: Date.now()
    };
    
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const signature = createSignature(queryString, secretKey);
    params.signature = signature;
    
    const url = `${BASE_URL}${endpoint}?${new URLSearchParams(params)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adData)
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : { success: true };
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to create ad' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}