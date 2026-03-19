import Image from "next/image";

export default function Home() {
  // Dummy data for restaurants
  const popularRestaurants = [
    { id: 1, name: "Pizza Palace", image: "/next.svg", rating: 4.5 },
    { id: 2, name: "Burger Barn", image: "/next.svg", rating: 4.2 },
    { id: 3, name: "Sushi Spot", image: "/next.svg", rating: 4.8 },
    { id: 4, name: "Taco Town", image: "/next.svg", rating: 4.3 },
  ];

  const nearbyRestaurants = [
    { id: 5, name: "Local Diner", image: "/next.svg", rating: 4.0 },
    { id: 6, name: "Cafe Corner", image: "/next.svg", rating: 4.1 },
    { id: 7, name: "Grill House", image: "/next.svg", rating: 4.6 },
    { id: 8, name: "Noodle Nook", image: "/next.svg", rating: 4.4 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          FoodLoop
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {/* User Icon Placeholder */}
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
