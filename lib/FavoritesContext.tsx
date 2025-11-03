'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from localStorage on mount
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    // Save favorites to localStorage whenever they change
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (id: string) => {
    setFavorites((prev) => [...prev, id]);
  };

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((favoriteId) => favoriteId !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.includes(id);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 