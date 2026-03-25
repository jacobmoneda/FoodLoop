import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

// Helper function to fetch nearby restaurants
async function getNearbyRestaurants(location: string, radius: string, type: string) {
  if (!API_KEY) {
    throw new Error('API key not found');
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${API_KEY}`
  );
  return response.json();
}

// Helper function to search restaurants
async function searchRestaurants(query: string, location: string) {
  if (!API_KEY) {
    throw new Error('API key not found');
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${location}&key=${API_KEY}`
  );
  return response.json();
}

// Helper function to get restaurant details
async function getRestaurantDetails(placeId: string) {
  if (!API_KEY) {
    throw new Error('API key not found');
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,opening_hours,photos,reviews,formatted_phone_number,website,types&key=${API_KEY}`
  );
  return response.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'nearby';

  try {
    if (mode === 'search') {
      const query = searchParams.get('query');
      const location = searchParams.get('location') || '-36.8509,174.7645';

      if (!query) {
        return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
      }

      const data = await searchRestaurants(query, location);
      return NextResponse.json(data);
    }

    if (mode === 'details') {
      const placeId = searchParams.get('place_id');

      if (!placeId) {
        return NextResponse.json({ error: 'Place ID parameter required' }, { status: 400 });
      }

      const data = await getRestaurantDetails(placeId);
      return NextResponse.json(data);
    }

    // Default: nearby search
    const location = searchParams.get('location') || '-36.8509,174.7645';
    const radius = searchParams.get('radius') || '5000';
    const type = searchParams.get('type') || 'restaurant';

    const data = await getNearbyRestaurants(location, radius, type);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
