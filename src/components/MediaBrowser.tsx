import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Play, Info, Star, Calendar, Clock, RefreshCw, Sparkles } from 'lucide-react';
import MediaCard from './MediaCard';
import MediaModal from './MediaModal';
import RandomMovieSelector from './RandomMovieSelector';
import MediaPagination from './MediaPagination';
import MediaScanner from './MediaScanner';
import ComingSoon from './ComingSoon';
import FocusableButton from './FocusableButton';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { mockMedia } from '@/data/mockMedia';
import { MediaItem } from '@/types/media';
import { useToast } from '@/hooks/use-toast';

const MediaBrowser = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'recently-added' | 'in-progress'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [mediaData, setMediaData] = useState<MediaItem[]>(mockMedia);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isRandomSelectorOpen, setIsRandomSelectorOpen] = useState(false);
  const [isMediaScannerOpen, setIsMediaScannerOpen] = useState(false);
  const { toast } = useToast();

  const filterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const actionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const navigationItems = useMemo(() => {
    const items = [];
    
    filterRefs.current.forEach((ref, index) => {
      if (ref) {
        items.push({
          id: `filter-${index}`,
          element: ref,
          section: 'filters'
        });
      }
    });

    actionRefs.current.forEach((ref, index) => {
      if (ref) {
        items.push({
          id: `action-${index}`,
          element: ref,
          section: 'actions'
        });
      }
    });

    mediaRefs.current.forEach((ref, index) => {
      if (ref) {
        items.push({
          id: `media-${index}`,
          element: ref,
          section: 'media-grid'
        });
      }
    });

    return items;
  }, []);

  const { focusedIndex, focusedSection } = useKeyboardNavigation(navigationItems);

  const handleRescan = async () => {
    setIsScanning(true);
    toast({
      title: "Scanning media folders...",
      description: "Looking for new content on your NAS",
    });

    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Scan complete!",
        description: "Found 0 new items",
      });
    }, 3000);
  };

  const handleOpenScanner = () => {
    setIsMediaScannerOpen(true);
  };

  const handleScanComplete = (addedCount: number) => {
    setIsMediaScannerOpen(false);
    toast({
      title: "Library scan complete!",
      description: `Added ${addedCount} new items to your library`,
    });
  };

  const handleToggleFavorite = (id: string) => {
    setMediaData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    
    if (selectedMedia && selectedMedia.id === id) {
      setSelectedMedia(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }

    const item = mediaData.find(item => item.id === id);
    toast({
      title: item?.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${item?.title} ${item?.isFavorite ? 'removed from' : 'added to'} your favorites`,
    });
  };

  const handleUpdateWatchStatus = (id: string, status: 'unwatched' | 'in-progress' | 'watched') => {
    setMediaData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, watchStatus: status } : item
      )
    );
    
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
          matchesFilter = true;
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

  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedia = filteredMedia.slice(startIndex, startIndex + itemsPerPage);

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

  useEffect(() => {
    if (filterRefs.current[0]) {
      filterRefs.current[0].focus();
    }
  }, []);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'recently-added', label: 'Recently Added' },
    { key: 'movie', label: 'Movies' },
    { key: 'tv', label: 'TV Shows' }
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Media Center
          </h1>
          <p className="text-xl text-gray-300">Your personal media collection • Use arrow keys to navigate</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <FocusableButton
            ref={(el) => actionRefs.current[0] = el}
            variant="action"
            onClick={() => setIsRandomSelectorOpen(true)}
            isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-0'}
          >
            <Sparkles className="h-5 w-5" />
            Random Pick
          </FocusableButton>

          <FocusableButton
            ref={(el) => actionRefs.current[1] = el}
            variant="action"
            onClick={handleOpenScanner}
            isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-1'}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <Info className="h-5 w-5" />
            Verify Metadata
          </FocusableButton>

          <FocusableButton
            ref={(el) => actionRefs.current[2] = el}
            variant="action"
            onClick={handleRescan}
            disabled={isScanning}
            isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-2'}
            className={isScanning 
              ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25'
            }
          >
            <RefreshCw className={`h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Update Library'}
          </FocusableButton>
        </div>
      </div>

      {/* Coming Soon Section */}
      <ComingSoon 
        mediaData={mediaData} 
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search movies, shows, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {filters.map((filter, index) => (
            <FocusableButton
              key={filter.key}
              ref={(el) => filterRefs.current[index] = el}
              variant="filter"
              onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
              isActive={activeFilter === filter.key}
              isFocused={focusedSection === 'filters' && navigationItems[focusedIndex]?.id === `filter-${index}`}
            >
              {filter.label}
            </FocusableButton>
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
        {paginatedMedia.map((media, index) => (
          <MediaCard
            key={media.id}
            ref={(el) => mediaRefs.current[index] = el}
            media={media}
            onClick={() => setSelectedMedia(media)}
            showDateAdded={activeFilter === 'recently-added'}
            onToggleFavorite={handleToggleFavorite}
            isFocused={focusedSection === 'media-grid' && navigationItems[focusedIndex]?.id === `media-${index}`}
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

      {/* Media Scanner Modal */}
      <MediaScanner
        isOpen={isMediaScannerOpen}
        onClose={() => setIsMediaScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Random Movie Selector Modal */}
      <RandomMovieSelector 
        mediaData={mediaData}
        onSelectMedia={setSelectedMedia}
        onToggleFavorite={handleToggleFavorite}
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
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default MediaBrowser;
