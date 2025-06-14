
import React from 'react';
import { Search } from 'lucide-react';
import FocusableButton from './FocusableButton';
import { MediaItem } from '@/types/media';

interface MediaFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: 'all' | 'movie' | 'tv' | 'recently-added' | 'in-progress' | 'favorites';
  onFilterChange: (filter: 'all' | 'movie' | 'tv' | 'recently-added' | 'in-progress' | 'favorites') => void;
  searchRef: React.RefObject<HTMLInputElement>;
  filterRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  focusedSection: string;
  navigationItems: any[];
  focusedIndex: number;
  mediaData: MediaItem[];
}

const MediaFilters = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  searchRef,
  filterRefs,
  focusedSection,
  navigationItems,
  focusedIndex,
  mediaData
}: MediaFiltersProps) => {
  // Calculate actual counts from media data
  const movieCount = mediaData.filter(item => item.type === 'movie').length;
  const tvShowCount = mediaData.filter(item => item.type === 'tv').length;
  const favoritesCount = mediaData.filter(item => item.isFavorite).length;

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'recently-added', label: 'Recently Added' },
    { key: 'movie', label: `Movies (${movieCount})` },
    { key: 'tv', label: `TV Shows (${tvShowCount})` },
    { key: 'favorites', label: `Favorites (${favoritesCount})` }
  ];

  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'recently-added':
        return 'Recently Added';
      case 'in-progress':
        return 'Continue Watching';
      case 'favorites':
        return 'Favorites';
      default:
        return null;
    }
  };

  const getFilterDescription = () => {
    switch (activeFilter) {
      case 'recently-added':
        return 'Latest additions to your media library';
      case 'in-progress':
        return 'Pick up where you left off';
      case 'favorites':
        return 'Your favorite movies and TV shows';
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search movies, shows, genres..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {filters.map((filter, index) => (
            <FocusableButton
              key={filter.key}
              ref={(el) => filterRefs.current[index] = el}
              variant="filter"
              onClick={() => onFilterChange(filter.key as typeof activeFilter)}
              isActive={activeFilter === filter.key}
              isFocused={focusedSection === 'filters' && navigationItems[focusedIndex]?.id === `filter-${index}`}
            >
              {filter.label}
            </FocusableButton>
          ))}
        </div>
      </div>

      {getFilterLabel() && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{getFilterLabel()}</h2>
          <p className="text-gray-400">{getFilterDescription()}</p>
        </div>
      )}
    </>
  );
};

export default MediaFilters;
