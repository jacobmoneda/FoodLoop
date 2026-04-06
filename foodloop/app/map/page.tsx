"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

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

export default function Home() {
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    cuisine: '',
    minRating: 0,
    maxDistance: 5000,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([]);

  useEffect(() => {
    fetchRestaurants();
    // Load saved restaurants from localStorage
    const saved = localStorage.getItem('savedRestaurants');
    if (saved) {
      setSavedRestaurants(JSON.parse(saved));
    }
  }, []);

  const fetchRestaurants = async (filters: SearchFilters = searchFilters) => {
    setLoading(true);
    try {
      let url = `/api/places?location=-36.8509,174.7645&radius=${filters.maxDistance}&type=restaurant`;

      if (filters.query.trim()) {
        // Use search mode for text queries
        url = `/api/places?mode=search&query=${encodeURIComponent(filters.query)}&location=-36.8509,174.7645`;
      } else {
        // Use nearby search with optional cuisine filter
        if (filters.cuisine) {
          url += `&keyword=${encodeURIComponent(filters.cuisine)}`;
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        // Apply client-side filters
        let filteredResults = data.results.filter((r: any) => {
          const rating = r.rating || 0;
          return rating >= filters.minRating;
        });

        // Sort by rating (highest first)
        filteredResults.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

        // Split into popular and nearby
        setPopularRestaurants(filteredResults.slice(0, 4).map((r: any) => ({
          id: r.place_id,
          name: r.name,
          image: r.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : '/next.svg',
          rating: r.rating || 0,
          types: r.types,
          vicinity: r.vicinity,
        })));
        setNearbyRestaurants(filteredResults.slice(4, 12).map((r: any) => ({
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
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchRestaurants(searchFilters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSave = (placeId: string) => {
    setSavedRestaurants(prev => {
      const newSaved = prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId];
      localStorage.setItem('savedRestaurants', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  if (loading) return <div>Loading...</div>;

  // Rest of your component remains the same, but now uses real data
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          FoodLoop
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="p-4 bg-white dark:bg-gray-900">
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchFilters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cuisine:</label>
              <select
                value={searchFilters.cuisine}
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
                value={searchFilters.minRating}
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
                value={searchFilters.maxDistance}
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

      {/* Popular Restaurants */}
      <section className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Popular Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRestaurants.map((restaurant) => (
            <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nearby Restaurants */}
      <section className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Nearby Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyRestaurants.map((restaurant) => (
            <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}