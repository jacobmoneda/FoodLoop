"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

interface RestaurantDetails {
  name: string;
  rating: number;
  formatted_address: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  formatted_phone_number?: string;
  website?: string;
  types: string[];
}

export default function RestaurantDetails() {
  const params = useParams();
  const placeId = params.placeId as string;
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await fetch(`/api/places?mode=details&place_id=${placeId}`);
        const data = await response.json();

        if (data.result) {
          setRestaurant(data.result);
        } else {
          setError('Restaurant not found');
        }
      } catch (err) {
        setError('Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };

    if (placeId) {
      fetchRestaurantDetails();
    }
  }, [placeId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!restaurant) return <div className="min-h-screen flex items-center justify-center">Restaurant not found</div>;

  const mainPhoto = restaurant.photos?.[0];
  const photoUrl = mainPhoto
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${mainPhoto.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
    : '/next.svg';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md">
        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600">
          ←
        </Link>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">FoodLoop</div>
        <div className="text-gray-600 dark:text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Main Photo */}
        <div className="mb-6">
          <Image
            src={photoUrl}
            alt={restaurant.name}
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Restaurant Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{restaurant.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-gray-800 dark:text-white font-semibold">{restaurant.rating}</span>
            </div>
            {restaurant.opening_hours && (
              <span className={`px-2 py-1 rounded text-sm ${restaurant.opening_hours.open_now ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {restaurant.opening_hours.open_now ? 'Open' : 'Closed'}
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">{restaurant.formatted_address}</p>

          {restaurant.formatted_phone_number && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-semibold">Phone:</span> {restaurant.formatted_phone_number}
            </p>
          )}

          {restaurant.website && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <span className="font-semibold">Website:</span>{' '}
              <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {restaurant.website}
              </a>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {restaurant.types.map((type) => (
              <span key={type} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Opening Hours */}
        {restaurant.opening_hours?.weekday_text && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Opening Hours</h2>
            <div className="space-y-1">
              {restaurant.opening_hours.weekday_text.map((day, index) => (
                <p key={index} className="text-gray-600 dark:text-gray-400">{day}</p>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Reviews</h2>
            <div className="space-y-4">
              {restaurant.reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800 dark:text-white">{review.author_name}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-gray-600 dark:text-gray-400">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}