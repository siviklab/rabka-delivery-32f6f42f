import React, { useState, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import RestaurantCard from '@/components/RestaurantCard';
import { restaurants, categories } from '@/data/restaurants';

interface SearchPageProps {
  onRestaurantClick: (restaurantId: string) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onRestaurantClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.menu.some(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        )
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border/50 px-4 py-4">
        <h1 className="text-xl font-bold text-foreground mb-4">Szukaj</h1>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>

      <main className="px-4 py-4">
        {!searchQuery.trim() ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Popularne kategorie</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(1).map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSearchQuery(category.name)}
                    className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 animate-scale-in text-left"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <p className="font-semibold text-foreground mt-2">{category.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Popularne wyszukiwania</h2>
              <div className="flex flex-wrap gap-2">
                {['Pierogi', 'Pizza', 'Burger', 'Kebab', 'Sushi', 'Ciasto'].map((term, index) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground mb-4">
              {searchResults.length > 0
                ? `Znaleziono ${searchResults.length} wyników`
                : 'Brak wyników'}
            </p>
            
            {searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((restaurant, index) => (
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
                  Nie znaleziono "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
