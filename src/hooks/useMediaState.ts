
import { useState, useEffect } from 'react';
import { MediaItem } from '@/types/media';
import { apiService, ApiMediaItem } from '@/services/apiService';

// Helper function to convert API media to frontend MediaItem format
const convertApiMediaToMediaItem = (apiMedia: ApiMediaItem): MediaItem => {
  return {
    id: apiMedia.id,
    title: apiMedia.title,
    type: apiMedia.type,
    year: apiMedia.year,
    rating: apiMedia.rating,
    duration: apiMedia.duration,
    description: apiMedia.description,
    thumbnail: apiMedia.thumbnail,
    backdrop: apiMedia.backdrop,
    genre: Array.isArray(apiMedia.genre) ? apiMedia.genre : [],
    dateAdded: apiMedia.dateAdded,
    watchStatus: apiMedia.watch_status,
    isFavorite: apiMedia.is_favorite || false,
    progress: apiMedia.progress_percent ? {
      currentEpisode: apiMedia.current_episode,
      totalEpisodes: apiMedia.total_episodes,
      progressPercent: apiMedia.progress_percent,
      lastWatched: apiMedia.last_watched
    } : undefined,
    // Add any missing properties with defaults
    episodes: [],
    technicalInfo: {
      videoCodec: 'H.264',
      audioFormat: 'Stereo',
      resolution: '1080p',
      subtitles: ['en']
    }
  };
};

export const useMediaState = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'recently-added' | 'in-progress' | 'favorites'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isRandomSelectorOpen, setIsRandomSelectorOpen] = useState(false);
  const [isMediaScannerOpen, setIsMediaScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load media data from API on component mount
  useEffect(() => {
    const loadMediaData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading media data from API...');
        
        const response = await apiService.getMedia(1, 100); // Get more items for initial load
        console.log('API Response:', response);
        
        const convertedMedia = response.data.map(convertApiMediaToMediaItem);
        console.log('Converted media:', convertedMedia);
        
        setMediaData(convertedMedia);
      } catch (err) {
        console.error('Failed to load media data:', err);
        setError('Failed to load media data. Using empty library.');
        setMediaData([]); // Set empty array instead of falling back to mock data
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaData();
  }, []);

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
    isLoading,
    error,
  };
};
