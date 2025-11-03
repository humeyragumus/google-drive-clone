'use client';

import { useFavorites } from '@/lib/FavoritesContext';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  id: string;
  className?: string;
}

export function FavoriteButton({ id, className }: FavoriteButtonProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isItemFavorite = isFavorite(id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isItemFavorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={cn(
        'p-2 rounded-full hover:bg-gray-100 transition-colors',
        className
      )}
      aria-label={isItemFavorite ? 'Remove from favorites' : 'Add to favorites'}
      tabIndex={0}
    >
      <Heart
        className={cn(
          'w-5 h-5 transition-colors',
          isItemFavorite ? 'fill-[#ac93b9] text-[#ac93b9]' : 'text-gray-400'
        )}
      />
    </button>
  );
} 