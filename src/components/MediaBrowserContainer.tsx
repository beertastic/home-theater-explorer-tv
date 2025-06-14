import React, { useMemo, useRef, useEffect } from 'react';
import MediaBrowserHeader from './MediaBrowserHeader';
import MediaFilters from './MediaFilters';
import MediaGrid from './MediaGrid';
import MediaModal from './MediaModal';
import RandomMovieSelector from './RandomMovieSelector';
import MediaScanner from './MediaScanner';
import ComingSoon from './ComingSoon';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useMediaState } from '@/hooks/useMediaState';
import { useMediaHandlers } from '@/hooks/useMediaHandlers';

const MediaBrowserContainer = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedMedia,
    setSelectedMedia,
    activeFilter,
    setActiveFilter,
    isScanning,
    setIsScanning,
    mediaData,
    setMediaData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    isRandomSelectorOpen,
    setIsRandomSelectorOpen,
    isMediaScannerOpen,
    setIsMediaScannerOpen,
  } = useMediaState();

  // Add last updated state
  const [lastUpdated, setLastUpdated] = React.useState<string>(new Date().toISOString());

  const {
    handleRescan,
    handleOpenScanner,
    handleScanComplete,
    handleToggleFavorite,
    handleUpdateWatchStatus,
    handleUpdateEpisodeStatus,
    handleUpdateMetadata,
  } = useMediaHandlers({
    mediaData,
    setMediaData,
    selectedMedia,
    setSelectedMedia,
    setIsScanning,
    setIsMediaScannerOpen,
  });

  // Wrap handleRescan to update lastUpdated
  const handleRescanWithUpdate = () => {
    handleRescan();
    setLastUpdated(new Date().toISOString());
  };

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

  // Helper function to get the most recent addition date for a media item
  const getMostRecentAdditionDate = (item: any) => {
    if (item.type === 'movie') {
      return new Date(item.dateAdded);
    }
    
    // For TV shows, compare show dateAdded with most recent episode dateAdded
    let mostRecentDate = new Date(item.dateAdded);
    
    if (item.episodes && item.episodes.length > 0) {
      const mostRecentEpisodeDate = item.episodes.reduce((latest: Date, episode: any) => {
        const episodeDate = new Date(episode.dateAdded);
        return episodeDate > latest ? episodeDate : latest;
      }, new Date(0)); // Start with earliest possible date
      
      if (mostRecentEpisodeDate > mostRecentDate) {
        mostRecentDate = mostRecentEpisodeDate;
      }
    }
    
    return mostRecentDate;
  };

  // Calculate movie and TV show counts
  const movieCount = useMemo(() => mediaData.filter(item => item.type === 'movie').length, [mediaData]);
  const tvShowCount = useMemo(() => mediaData.filter(item => item.type === 'tv').length, [mediaData]);

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
      filtered = filtered.sort((a, b) => {
        const dateA = getMostRecentAdditionDate(a);
        const dateB = getMostRecentAdditionDate(b);
        return dateB.getTime() - dateA.getTime();
      });
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
        onRescan={handleRescanWithUpdate}
        onOpenScanner={handleOpenScanner}
        isScanning={isScanning}
        actionRefs={actionRefs}
        focusedSection={focusedSection}
        navigationItems={navigationItems}
        focusedIndex={focusedIndex}
        lastUpdated={lastUpdated}
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
        movieCount={movieCount}
        tvShowCount={tvShowCount}
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
          onUpdateMetadata={handleUpdateMetadata}
        />
      )}
    </div>
  );
};

export default MediaBrowserContainer;
