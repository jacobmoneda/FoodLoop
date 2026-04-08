"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { RestaurantCard } from '../components/RestaurantCard';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  types?: string[];
  vicinity?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <div>Loading map...</div>;
    case Status.FAILURE:
      return <div>Error loading map</div>;
    case Status.SUCCESS:
      return <MapComponent />;
  }
};

function MapComponent() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  useEffect(() => {
    fetchNearbyRestaurants();
  }, []);

  const fetchNearbyRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/places?location=-36.8509,174.7645&radius=5000&type=restaurant');
      const data = await response.json();

      if (data.results) {
        setRestaurants(data.results.map((r: any) => ({
          id: r.place_id,
          name: r.name,
          image: r.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : '/next.svg',
          rating: r.rating || 0,
          types: r.types,
          vicinity: r.vicinity,
          geometry: r.geometry,
        })));
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (placeId: string, restaurant?: any) => {
    // This would be implemented similar to other pages
    console.log('Toggle save:', placeId);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="relative flex items-center justify-center p-4 bg-white dark:bg-gray-900 shadow-md">
        <Link href="/" className="absolute left-4 text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600">
          ←
        </Link>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          Restaurant Map
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Map */}
        <div className="flex-1">
          <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''} render={render}>
            <Map
              center={{ lat: -36.8509, lng: 174.7645 }}
              zoom={13}
              restaurants={restaurants}
              onMapLoad={onMapLoad}
              onMarkerClick={setSelectedRestaurant}
            />
          </Wrapper>
        </div>

        {/* Restaurant Details Sidebar */}
        {selectedRestaurant && (
          <div className="w-80 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="float-right text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <RestaurantCard
                restaurant={selectedRestaurant}
                isSaved={false} // You could implement saved state here
                onToggleSave={toggleSave}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  restaurants: Restaurant[];
  onMapLoad: (map: google.maps.Map) => void;
  onMarkerClick: (restaurant: Restaurant) => void;
}

function Map({ center, zoom, restaurants, onMapLoad, onMarkerClick }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
      setMap(newMap);
      onMapLoad(newMap);
    }
  }, [ref, map, center, zoom, onMapLoad]);

  useEffect(() => {
    if (map && restaurants.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));

      // Create new markers
      const newMarkers = restaurants
        .filter(r => r.geometry?.location)
        .map(restaurant => {
          const marker = new google.maps.Marker({
            position: restaurant.geometry!.location,
            map,
            title: restaurant.name,
          });

          marker.addListener('click', () => {
            onMarkerClick(restaurant);
          });

          return marker;
        });

      setMarkers(newMarkers);
    }
  }, [map, restaurants, onMarkerClick]);

  return <div ref={ref} className="w-full h-full" />;
}

export default function MapPage() {
  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''} render={render}>
      <MapComponent />
    </Wrapper>
  );
}