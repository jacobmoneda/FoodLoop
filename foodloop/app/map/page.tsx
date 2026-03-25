"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
}

export default function Home() {
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const location = '-36.8509,174.7645'; // Auckland coordinates
      const radius = 5000; // 5km radius
      const type = 'restaurant';

      try {
        // Fetch nearby restaurants via our API route
        const response = await fetch(
          `/api/places?location=${location}&radius=${radius}&type=${type}`
        );
        const data = await response.json();

        if (data.results) {
          // Split into popular and nearby (e.g., based on rating or randomly)
          const sorted = data.results.sort((a: any, b: any) => b.rating - a.rating);
          setPopularRestaurants(sorted.slice(0, 4).map((r: any) => ({
            id: r.place_id,
            name: r.name,
            image: r.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : '/next.svg',
            rating: r.rating || 0,
          })));
          setNearbyRestaurants(sorted.slice(4, 8).map((r: any) => ({
            id: r.place_id,
            name: r.name,
            image: r.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : '/next.svg',
            rating: r.rating || 0,
          })));
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

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

      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-gray-900">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search for restaurants..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Popular Restaurants */}
      <section className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Popular Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">{restaurant.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">Rating: {restaurant.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Restaurants */}
      <section className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Nearby Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">{restaurant.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">Rating: {restaurant.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}