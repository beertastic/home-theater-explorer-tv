
import React, { useState, useMemo } from 'react';
import { Search, Play, Info, Star, Calendar, Clock, RefreshCw, Sparkles } from 'lucide-react';
import MediaCard from './MediaCard';
import MediaModal from './MediaModal';
import RandomMovieSelector from './RandomMovieSelector';
import MediaPagination from './MediaPagination';
import { mockMediaData, MediaItem } from '@/data/mockMedia';
import { useToast } from '@/hooks/use-toast';

const MediaBrowser = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'recently-added' | 'in-progress'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [mediaData, setMediaData] = useState<MediaItem[]>(mockMediaData);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24); // 24 items per page for good grid layout
  const [isRandomSelectorOpen, setIsRandomSelectorOpen] = useState(false);
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

  const handleUpdateWatchStatus = (id: string, status: 'unwatched' | 'in-progress' | 'watched') => {
    setMediaData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, watchStatus: status } : item
      )
    );
    
    // Update selected media if it's currently open
    if (selectedMedia && selectedMedia.id === id) {
      setSelectedMedia(prev => prev ? { ...prev, watchStatus: status } : null);
    }

    toast({
      title: "Watch status updated",
      description: `Marked as ${status.replace('-', ' ')}`,
    });
  };

  const handleUpdateEpisodeStatus = (mediaId: string, episodeId: string, status: 'watched' | 'unwatched') => {
    setMediaData(prevData => 
      prevData.map(item => {
        if (item.id === mediaId && item.episodes) {
          const updatedEpisodes = item.episodes.map(episode => 
            episode.id === episodeId ? { ...episode, watchStatus: status } : episode
          );
          
          // Update overall watch status based on episodes
          const watchedCount = updatedEpisodes.filter(ep => ep.watchStatus === 'watched').length;
          const totalCount = updatedEpisodes.length;
          let newWatchStatus: 'unwatched' | 'in-progress' | 'watched';
          
          if (watchedCount === 0) {
            newWatchStatus = 'unwatched';
          } else if (watchedCount === totalCount) {
            newWatchStatus = 'watched';
          } else {
            newWatchStatus = 'in-progress';
          }
          
          return { 
            ...item, 
            episodes: updatedEpisodes,
            watchStatus: newWatchStatus,
            progress: newWatchStatus === 'in-progress' ? {
              ...item.progress,
              currentEpisode: watchedCount,
              totalEpisodes: totalCount,
              progressPercent: Math.round((watchedCount / totalCount) * 100)
            } : item.progress
          };
        }
        return item;
      })
    );
    
    // Update selected media if it's currently open
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(prev => {
        if (!prev || !prev.episodes) return prev;
        const updatedEpisodes = prev.episodes.map(episode => 
          episode.id === episodeId ? { ...episode, watchStatus: status } : episode
        );
        return { ...prev, episodes: updatedEpisodes };
      });
    }

    toast({
      title: "Episode status updated",
      description: `Episode marked as ${status}`,
    });
  };

  const filteredMedia = useMemo(() => {
    let filtered = mediaData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesFilter = true;
      
      switch (activeFilter) {
        case 'recently-added':
          matchesFilter = true; // Show all types for recently added
          break;
        case 'in-progress':
          matchesFilter = item.watchStatus === 'in-progress';
          break;
        case 'movie':
        case 'tv':
          matchesFilter = item.type === activeFilter;
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });

    // Sort by appropriate criteria
    if (activeFilter === 'recently-added') {
      filtered = filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    } else if (activeFilter === 'in-progress') {
      filtered = filtered.sort((a, b) => {
        const aLastWatched = a.progress?.lastWatched ? new Date(a.progress.lastWatched).getTime() : 0;
        const bLastWatched = b.progress?.lastWatched ? new Date(b.progress.lastWatched).getTime() : 0;
        return bLastWatched - aLastWatched;
      });
    }

    return filtered;
  }, [searchQuery, activeFilter, mediaData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedia = filteredMedia.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'recently-added':
        return 'Recently Added';
      case 'in-progress':
        return 'Continue Watching';
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
      default:
        return null;
    }
  };

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
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Random Movie Picker Button */}
          <button
            onClick={() => setIsRandomSelectorOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-600/25"
          >
            <Sparkles className="h-5 w-5" />
            Random Pick
          </button>

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
            { key: 'in-progress', label: 'In Progress' },
            { key: 'recently-added', label: 'Recently Added' },
            { key: 'movie', label: 'Movies' },
            { key: 'tv', label: 'TV Shows' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
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

      {/* Filter Header */}
      {getFilterLabel() && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{getFilterLabel()}</h2>
          <p className="text-gray-400">{getFilterDescription()}</p>
        </div>
      )}

      {/* Media Grid with pagination */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {paginatedMedia.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            onClick={() => setSelectedMedia(media)}
            showDateAdded={activeFilter === 'recently-added'}
          />
        ))}
      </div>

      {/* Pagination */}
      <MediaPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredMedia.length}
        itemsPerPage={itemsPerPage}
      />

      {/* Results count */}
      <div className="mt-8 text-center text-gray-400">
        Showing {filteredMedia.length} of {mediaData.length} items
        {activeFilter === 'recently-added' && ' (sorted by date added)'}
        {activeFilter === 'in-progress' && ' (sorted by last watched)'}
      </div>

      {/* Random Movie Selector Modal */}
      <RandomMovieSelector 
        mediaData={mediaData}
        onSelectMedia={setSelectedMedia}
        isOpen={isRandomSelectorOpen}
        onClose={() => setIsRandomSelectorOpen(false)}
      />

      {/* Media Modal */}
      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onUpdateWatchStatus={handleUpdateWatchStatus}
          onUpdateEpisodeStatus={handleUpdateEpisodeStatus}
        />
      )}
    </div>
  );
};

export default MediaBrowser;
