'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { RestaurantCard } from '../components/RestaurantCard';
import Header from '../components/Header';

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

  const toggleSave = async (placeId: string, restaurant?: any) => {
    if (!user) return;

    try {
      // Always unsave on profile page
      const response = await fetch(`/api/restaurants?placeId=${placeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedRestaurants(prev => prev.filter(r => r.id !== placeId));
      }
    } catch (error) {
      console.error('Error removing restaurant:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header />

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
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSaved={true}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}