'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { User } from '@clerk/nextjs/server';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  types?: string[];
  vicinity?: string;
}

export default function UserPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    loadSavedRestaurants();
  }, [user, isLoaded, router]);

  const loadSavedRestaurants = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/restaurants');
      const result = await response.json();

      if (result.data) {
        const restaurants: Restaurant[] = result.data.map((item: any) => ({
          id: item.place_id,
          name: item.name,
          image: item.image || '/next.svg',
          rating: item.rating || 0,
          types: item.types,
          vicinity: item.vicinity,
        }));

        setSavedRestaurants(restaurants);
      }
    } catch (error) {
      console.error('Error loading saved restaurants:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md">
        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600">
          ←
        </Link>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">Saved Restaurants</div>
        <div className="text-gray-600 dark:text-gray-400">
          {user && (
            /*
            <img
              src={user.imageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><circle cx="12" cy="8" r="4"/><path d="M12 14c-7 0-8 3.5-8 5v3h16v-3c0-1.5-1-5-8-5z"/></svg>'}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-300"
            />
            */
            <UserButton>
            </UserButton>
          )}
        </div>
      </header>

      <div className="p-4">
        {!user ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">Please sign in to view your saved restaurants.</p>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4">
                Sign In
              </button>
            </SignInButton>
          </div>
        ) : savedRestaurants.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">No saved restaurants yet.</p>
            <Link href="/" className="text-blue-600 hover:underline">Discover restaurants</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savedRestaurants.map((restaurant) => (
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
        )}
      </div>
    </div>
  );
}