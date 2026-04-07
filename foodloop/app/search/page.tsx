"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { SignInButton, useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  types?: string[];
  vicinity?: string;
}

interface SearchFilters {
  query: string;
  cuisine: string;
  minRating: number;
  maxDistance: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: searchParams.get('query') || '',
    cuisine: searchParams.get('cuisine') || '',
    minRating: Number(searchParams.get('minRating')) || 0,
    maxDistance: Number(searchParams.get('maxDistance')) || 5000,
  });
  const [localFilters, setLocalFilters] = useState<SearchFilters>({
    query: '',
    cuisine: '',
    minRating: 0,
    maxDistance: 5000,
  });
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadSavedRestaurants();
    }
  }, [user]);

  useEffect(() => {
    // Update search filters from URL params
    const newFilters: SearchFilters = {
      query: searchParams.get('query') || '',
      cuisine: searchParams.get('cuisine') || '',
      minRating: Number(searchParams.get('minRating')) || 0,
      maxDistance: Number(searchParams.get('maxDistance')) || 5000,
    };
    setSearchFilters(newFilters);
    setLocalFilters(newFilters);
    fetchRestaurants();
  }, [searchParams]);

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

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      let url = `/api/places?location=-36.8509,174.7645&radius=${searchFilters.maxDistance}&type=restaurant`;

      if (searchFilters.query.trim()) {
        url = `/api/places?mode=search&query=${encodeURIComponent(searchFilters.query)}&location=-36.8509,174.7645`;
      } else {
        if (searchFilters.cuisine) {
          url += `&keyword=${encodeURIComponent(searchFilters.cuisine)}`;
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        let filteredResults = data.results.filter((r: any) => {
          const rating = r.rating || 0;
          return rating >= searchFilters.minRating;
        });

        filteredResults.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

        setRestaurants(filteredResults.map((r: any) => ({
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('query', localFilters.query);
    params.set('cuisine', localFilters.cuisine);
    params.set('minRating', String(localFilters.minRating));
    params.set('maxDistance', String(localFilters.maxDistance));
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="relative flex items-center justify-center p-4 bg-white dark:bg-gray-900 shadow-md">
        <Link href="/" className="absolute left-4 text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600">
          ←
        </Link>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          FoodLoop
        </div>
        <div className="absolute right-4">
          {user ? (
            <Link href={`/user`} className="block">
              <img
                src={user.imageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><circle cx="12" cy="8" r="4"/><path d="M12 14c-7 0-8 3.5-8 5v3h16v-3c0-1.5-1-5-8-5z"/></svg>'}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-600 transition-colors cursor-pointer"
              />
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Search and Filters */}
      <div className="p-4 bg-white dark:bg-gray-900">
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search restaurants, foods, places..."
              value={localFilters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cuisine:</label>
              <select
                value={localFilters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Cuisines</option>
                <option value="italian">Italian</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="indian">Indian</option>
                <option value="mexican">Mexican</option>
                <option value="thai">Thai</option>
                <option value="french">French</option>
                <option value="american">American</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="korean">Korean</option>
                <option value="vietnamese">Vietnamese</option>
                <option value="greek">Greek</option>
                <option value="spanish">Spanish</option>
                <option value="middle_eastern">Middle Eastern</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Rating:</label>
              <select
                value={localFilters.minRating}
                onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={3.5}>3.5+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Distance:</label>
              <select
                value={localFilters.maxDistance}
                onChange={(e) => handleFilterChange('maxDistance', Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value={1000}>1 km</option>
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={25000}>25 km</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Search Results */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Search Results</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
            {searchFilters.query && ` for "${searchFilters.query}"`}
          </p>

          {restaurants.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p className="text-lg">No restaurants found. Try adjusting your search.</p>
              <Link href="/" className="text-blue-600 hover:underline mt-4">Back to home</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(restaurant.id, restaurant);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors z-10"
                  >
                    <svg
                      className={`w-5 h-5 ${savedRestaurants.includes(restaurant.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">{restaurant.name}</h3>
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{restaurant.rating}</span>
                      </div>
                      {restaurant.vicinity && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{restaurant.vicinity}</p>
                      )}
                      {restaurant.types && restaurant.types.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {restaurant.types.slice(0, 2).map((type) => (
                            <span key={type} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              {type.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}