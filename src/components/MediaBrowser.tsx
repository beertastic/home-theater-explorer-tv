
import React, { useState, useMemo } from 'react';
import { Search, Play, Info, Star, Calendar, Clock } from 'lucide-react';
import MediaCard from './MediaCard';
import MediaModal from './MediaModal';
import { mockMediaData } from '@/data/mockMedia';

interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  year: number;
  rating: number;
  duration: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  genre: string[];
}

const MediaBrowser = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredMedia = useMemo(() => {
    return mockMediaData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Media Center
        </h1>
        <p className="text-xl text-gray-300">Your personal media collection</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search movies, shows, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'movie', label: 'Movies' },
            { key: 'tv', label: 'TV Shows' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as 'all' | 'movie' | 'tv')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {filteredMedia.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            onClick={() => setSelectedMedia(media)}
          />
        ))}
      </div>

      {/* Results count */}
      <div className="mt-8 text-center text-gray-400">
        Showing {filteredMedia.length} of {mockMediaData.length} items
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
};

export default MediaBrowser;
