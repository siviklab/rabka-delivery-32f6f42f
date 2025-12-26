import React from 'react';
import { categories } from '@/data/restaurants';
import { cn } from '@/lib/utils';

interface CategoryScrollProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryScroll: React.FC<CategoryScrollProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 pb-2">
        {categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 animate-fade-in',
              selectedCategory === category.id
                ? 'gradient-primary text-primary-foreground shadow-md'
                : 'bg-card text-foreground shadow-card hover:shadow-card-hover'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="font-semibold text-sm">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryScroll;
