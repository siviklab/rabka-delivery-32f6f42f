import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryScroll from '@/components/CategoryScroll';
import RestaurantCard from '@/components/RestaurantCard';
import { restaurants } from '@/data/restaurants';

interface HomePageProps {
  onRestaurantClick: (restaurantId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onRestaurantClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'all' ||
        restaurant.categories.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredRestaurants = filteredRestaurants.filter((r) => r.featured);
  const allRestaurants = filteredRestaurants;

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="px-4 py-4 space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            Cześć! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Co dziś zjemy w Rabce-Zdrój?
          </p>
        </div>

        {/* Search */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Categories */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CategoryScroll
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Featured Restaurants */}
        {featuredRestaurants.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              🌟 Polecane restauracje
            </h2>
            <div className="grid gap-4">
              {featuredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => onRestaurantClick(restaurant.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Restaurants */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">
            {searchQuery || selectedCategory !== 'all' 
              ? `Wyniki (${allRestaurants.length})`
              : '🍽️ Wszystkie restauracje'
            }
          </h2>
          {allRestaurants.length > 0 ? (
            <div className="grid gap-4">
              {allRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => onRestaurantClick(restaurant.id)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-muted-foreground">
                Nie znaleziono restauracji
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
