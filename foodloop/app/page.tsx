"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { RestaurantCard } from './components/RestaurantCard';
import Header from './components/Header';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  types?: string[];
  vicinity?: string;
}

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getUserLocation();
    if (user) {
      loadSavedRestaurants();
    } else {
      setSavedRestaurants([]);
    }
  }, [user]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchRestaurants(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default location (Auckland, NZ)
          setUserLocation({ lat: -36.8509, lng: 174.7645 });
          fetchRestaurants(-36.8509, 174.7645);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // Fallback to default location
      setUserLocation({ lat: -36.8509, lng: 174.7645 });
      fetchRestaurants(-36.8509, 174.7645);
    }
  };

  const loadSavedRestaurants = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/restaurants');
      const result = await response.json();
      if (result.data) {
        setSavedRestaurants(result.data.map((s: any) => s.place_id));
      }
    } catch (error) {
      console.error('Error loading saved restaurants:', error);
    }
  };

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'User';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const fetchRestaurants = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // Fetch popular restaurants (using a broader search in a major city center)
      const popularResponse = await fetch(`/api/places?location=-36.8509,174.7645&radius=10000&type=restaurant`);
      const popularData = await popularResponse.json();

      // Fetch nearby restaurants based on user's location
      const nearbyResponse = await fetch(`/api/places?location=${lat},${lng}&radius=5000&type=restaurant`);
      const nearbyData = await nearbyResponse.json();

      if (popularData.results) {
        // Sort by rating for popular restaurants and take top ones
        const sortedPopular = popularData.results
          .filter((r: any) => r.rating && r.rating >= 4.0) // Only highly rated
          .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 8); // Take top 8

        setPopularRestaurants(sortedPopular.map((r: any) => ({
          id: r.place_id,
          name: r.name,
          image: r.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : '/next.svg',
          rating: r.rating || 0,
          types: r.types,
          vicinity: r.vicinity,
        })));
      }

      if (nearbyData.results) {
        // For nearby restaurants, sort by distance (Google Places API returns results sorted by relevance/distance)
        const nearbyResults = nearbyData.results.slice(0, 8); // Take first 8 (closest)

        setNearbyRestaurants(nearbyResults.map((r: any) => ({
          id: r.place_id,
          name: r.name,
          image: r.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : '/next.svg',
          rating: r.rating || 0,
          types: r.types,
          vicinity: r.vicinity,
        })));
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (placeId: string, restaurant?: any) => {
    if (!user) return;

    try {
      const isSaved = savedRestaurants.includes(placeId);

      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/restaurants?placeId=${placeId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSavedRestaurants(prev => prev.filter(id => id !== placeId));
        }
      } else {
        // Save
        const response = await fetch('/api/restaurants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            placeId,
            name: restaurant?.name,
            image: restaurant?.image,
            rating: restaurant?.rating,
            types: restaurant?.types,
            vicinity: restaurant?.vicinity,
          }),
        });

        if (response.ok) {
          setSavedRestaurants(prev => [...prev, placeId]);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header />
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Finding great restaurants...</p>
        </div>
      </div>
    </div>
  );

  // Rest of your component remains the same, but now uses real data
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header />

      {/* Search Bar */}
      <section className="py-3 px-4 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {firstName}</h1>
          <div className="w-full max-w-md">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">Popular Restaurants</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Highly-rated restaurants in your area</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRestaurants.length > 0 ? (
            popularRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSaved={savedRestaurants.includes(restaurant.id)}
                onToggleSave={toggleSave}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No popular restaurants found</p>
            </div>
          )}
        </div>
      </section>

      {/* Nearby Restaurants */}
      <section className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">Nearby Restaurants</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Restaurants close to {userLocation ? 'your location' : 'you'}
            {userLocation && (
              <span className="text-xs text-gray-500 ml-2">
                ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyRestaurants.length > 0 ? (
            nearbyRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSaved={savedRestaurants.includes(restaurant.id)}
                onToggleSave={toggleSave}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No nearby restaurants found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}