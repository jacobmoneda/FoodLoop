'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  types?: string[];
  vicinity?: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSaved: boolean;
  onToggleSave: (placeId: string, restaurant: Restaurant) => void;
}

export function RestaurantCard({ restaurant, isSaved, onToggleSave }: RestaurantCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(restaurant.id, restaurant);
        }}
        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors z-10"
      >
        <svg
          className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-400'}`}
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
  );
}
