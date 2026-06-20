import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for user, wine, and search
export interface UserInfo {
  user_id: string;
  username: string;
}

export interface Wine {
  wine_id: string;
  winemaker: string;
  wine_type: string;
  wine_name: string;
  varietal: string;
  vintage: number;
  region: string;
  tasting_notes: string;
  rating: number;
  img_url?: string;
}

export interface FoodPairing {
  pairing_id: string;
  wine_id: string;
  food_type: 'cheese' | 'charcuterie' | 'dish';
  name: string;
  notes?: string;
  img_url?: string;
  source: 'user_added' | 'ai_suggested';
}

export interface PairingSuggestion {
  food_type: 'cheese' | 'charcuterie' | 'dish';
  name: string;
  reason: string;
  recipe_blurb?: string;
}

export interface SearchParams {
  winemaker?: string;
  wine_type?: string;
  wine_name?: string;
  varietal?: string;
  vintage?: string;
  region?: string;
  tasting_notes?: string;
  rating?: string;
}

interface AppContextType {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
  wines: Wine[];
  setWines: (wines: Wine[]) => void;
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  searchResults: Wine[];
  setSearchResults: (results: Wine[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [searchResults, setSearchResults] = useState<Wine[]>([]);

  return (
    <AppContext.Provider value={{ userInfo, setUserInfo, wines, setWines, searchParams, setSearchParams, searchResults, setSearchResults }}>
      {children}
    </AppContext.Provider>
  );
};
