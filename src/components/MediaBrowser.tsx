
import React, { useState, useMemo, useRef, useEffect } from 'react';
import MediaBrowserHeader from './MediaBrowserHeader';
import MediaFilters from './MediaFilters';
import MediaGrid from './MediaGrid';
import MediaModal from './MediaModal';
import RandomMovieSelector from './RandomMovieSelector';
import MediaScanner from './MediaScanner';
import ComingSoon from './ComingSoon';
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    if (filterRefs.current[0]) {
      filterRefs.current[0].focus();
    }
  }, []);

  return (
    <div className="min-h-screen p-8">
      <MediaBrowserHeader
        onRandomSelect={() => setIsRandomSelectorOpen(true)}
        onRescan={handleRescan}
        onOpenScanner={handleOpenScanner}
        isScanning={isScanning}
        actionRefs={actionRefs}
        focusedSection={focusedSection}
        navigationItems={navigationItems}
        focusedIndex={focusedIndex}
      />

      <ComingSoon 
        mediaData={mediaData} 
        onToggleFavorite={handleToggleFavorite}
      />

      <MediaFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchRef={searchRef}
        filterRefs={filterRefs}
        focusedSection={focusedSection}
        navigationItems={navigationItems}
        focusedIndex={focusedIndex}
      />

      <MediaGrid
        media={paginatedMedia}
        onMediaSelect={setSelectedMedia}
        onToggleFavorite={handleToggleFavorite}
        showDateAdded={activeFilter === 'recently-added'}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredMedia.length}
        activeFilter={activeFilter}
        mediaRefs={mediaRefs}
        focusedSection={focusedSection}
        navigationItems={navigationItems}
        focusedIndex={focusedIndex}
      />

      <MediaScanner
        isOpen={isMediaScannerOpen}
        onClose={() => setIsMediaScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      <RandomMovieSelector 
        mediaData={mediaData}
        onSelectMedia={setSelectedMedia}
        onToggleFavorite={handleToggleFavorite}
        isOpen={isRandomSelectorOpen}
        onClose={() => setIsRandomSelectorOpen(false)}
      />

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
