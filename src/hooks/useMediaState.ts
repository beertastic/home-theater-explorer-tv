
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
    filePath: apiMedia.file_path, // Map the file_path from API
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

// Mock data for fallback when API is unavailable
const getMockMediaData = (): MediaItem[] => {
  const today = new Date();
  const recentDates = [
    new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  ];

  return [
    {
      id: 'mock-1',
      title: 'The Dark Knight',
      type: 'movie' as const,
      year: 2008,
      rating: 9.0,
      duration: '152 min',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...',
      thumbnail: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
      genre: ['Action', 'Crime', 'Drama'],
      dateAdded: recentDates[0],
      watchStatus: 'unwatched' as const,
      isFavorite: false,
      filePath: '/movies/The Dark Knight (2008)/The Dark Knight.mp4',
      episodes: [],
      technicalInfo: {
        videoCodec: 'H.264',
        audioFormat: 'Stereo',
        resolution: '1080p',
        subtitles: ['en']
      }
    },
    {
      id: 'mock-2',
      title: 'Breaking Bad',
      type: 'tv' as const,
      year: 2008,
      rating: 9.5,
      duration: '45 min',
      description: 'A high school chemistry teacher diagnosed with inoperable lung cancer...',
      thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
      genre: ['Crime', 'Drama', 'Thriller'],
      dateAdded: recentDates[1],
      watchStatus: 'in-progress' as const,
      isFavorite: true,
      filePath: '/tv/Breaking Bad/Season 01/Breaking Bad S01E01.mp4',
      progress: {
        currentEpisode: 3,
        totalEpisodes: 62,
        progressPercent: 25,
        lastWatched: new Date().toISOString()
      },
      episodes: [],
      technicalInfo: {
        videoCodec: 'H.264',
        audioFormat: '5.1',
        resolution: '1080p',
        subtitles: ['en', 'es']
      }
    }
  ];
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
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [libraryStats, setLibraryStats] = useState({
    dbFileCount: 0,
    movieFolderCount: 0,
    tvFolderCount: 0,
    totalFolders: 0
  });

  // Load media data from API on component mount
  useEffect(() => {
    const loadMediaData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsUsingMockData(false);
        console.log('Loading media data from API...');
        
        const response = await apiService.getMedia(1, 100); // Get more items for initial load
        console.log('API Response:', response);
        
        const convertedMedia = response.data.map(convertApiMediaToMediaItem);
        console.log('Converted media with file paths:', convertedMedia);
        
        setMediaData(convertedMedia);
      } catch (err) {
        console.error('Failed to load media data:', err);
        console.log('API unavailable, falling back to mock data for demonstration');
        setError('API server unavailable. Using mock data for demonstration.');
        setIsUsingMockData(true);
        setMediaData(getMockMediaData()); // Use mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaData();
  }, []);

  // Load library statistics
  useEffect(() => {
    const loadLibraryStats = async () => {
      try {
        console.log('Loading library statistics...');
        const stats = await apiService.getLibraryStats();
        console.log('Library stats:', stats);
        
        if (stats.success) {
          setLibraryStats({
            dbFileCount: stats.dbFileCount,
            movieFolderCount: stats.movieFolderCount,
            tvFolderCount: stats.tvFolderCount,
            totalFolders: stats.totalFolders
          });
        }
      } catch (err) {
        console.error('Failed to load library stats:', err);
        if (isUsingMockData) {
          // Set mock stats when using mock data
          setLibraryStats({
            dbFileCount: 2,
            movieFolderCount: 1,
            tvFolderCount: 1,
            totalFolders: 2
          });
        }
      }
    };

    loadLibraryStats();
  }, [isUsingMockData]);

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
    isUsingMockData,
    libraryStats,
  };
};
