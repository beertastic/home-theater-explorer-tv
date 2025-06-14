
import React, { useState, useMemo } from 'react';
import { Search, Play, Info, Star, Calendar, Clock, RefreshCw } from 'lucide-react';
import MediaCard from './MediaCard';
import MediaModal from './MediaModal';
import { mockMediaData } from '@/data/mockMedia';
import { useToast } from '@/hooks/use-toast';

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
  dateAdded: string;
}

const MediaBrowser = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'recently-added'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleRescan = async () => {
    setIsScanning(true);
    toast({
      title: "Scanning media folders...",
      description: "Looking for new content on your NAS",
    });

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Scan complete!",
        description: "Found 0 new items", // In real implementation, this would show actual count
      });
    }, 3000);
  };

  const filteredMedia = useMemo(() => {
    let filtered = mockMediaData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (activeFilter === 'recently-added') {
        return matchesSearch; // Show all types for recently added
      }
      
      const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
      return matchesSearch && matchesFilter;
    });

    // Sort by date added if recently added view is active
    if (activeFilter === 'recently-added') {
      filtered = filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }

    return filtered;
  }, [searchQuery, activeFilter]);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Media Center
          </h1>
          <p className="text-xl text-gray-300">Your personal media collection</p>
        </div>
        
        {/* Update/Rescan Button */}
        <button
          onClick={handleRescan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            isScanning 
              ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25'
          }`}
        >
          <RefreshCw className={`h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Update Library'}
        </button>
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
            { key: 'recently-added', label: 'Recently Added' },
            { key: 'movie', label: 'Movies' },
            { key: 'tv', label: 'TV Shows' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as 'all' | 'movie' | 'tv' | 'recently-added')}
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

      {/* Recently Added Header */}
      {activeFilter === 'recently-added' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Recently Added</h2>
          <p className="text-gray-400">Latest additions to your media library</p>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {filteredMedia.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            onClick={() => setSelectedMedia(media)}
            showDateAdded={activeFilter === 'recently-added'}
          />
        ))}
      </div>

      {/* Results count */}
      <div className="mt-8 text-center text-gray-400">
        Showing {filteredMedia.length} of {mockMediaData.length} items
        {activeFilter === 'recently-added' && ' (sorted by date added)'}
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
