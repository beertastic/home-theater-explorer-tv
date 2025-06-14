
import { useState } from 'react';
import { MediaItem } from '@/types/media';
import { mockMedia } from '@/data/mockMedia';

export const useMediaState = () => {
  // Add episode names to TV shows with upcoming episodes
  const enhancedMockMedia = mockMedia.map(media => {
    if (media.type === 'tv' && media.nextEpisodeDate) {
      const episodeNames = [
        'The Storm Approaches',
        'Revelations',
        'Into the Unknown',
        'Breaking Point',
        'New Beginnings',
        'The Final Hour',
        'Unexpected Allies',
        'Dark Secrets',
        'The Turning Tide',
        'Legacy'
      ];
      return {
        ...media,
        nextEpisodeName: episodeNames[Math.floor(Math.random() * episodeNames.length)]
      };
    }
    return media;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'recently-added' | 'in-progress' | 'favorites'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [mediaData, setMediaData] = useState<MediaItem[]>(enhancedMockMedia);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isRandomSelectorOpen, setIsRandomSelectorOpen] = useState(false);
  const [isMediaScannerOpen, setIsMediaScannerOpen] = useState(false);

  return {
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
  };
};
