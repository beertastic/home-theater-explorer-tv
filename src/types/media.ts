
export interface MediaTechnicalInfo {
  videoCodec: 'H.264' | 'H.265' | 'HEVC' | 'AV1' | 'VP9';
  audioFormat: 'Stereo' | '5.1' | '7.1' | 'Dolby Atmos' | 'DTS';
  resolution: '720p' | '1080p' | '4K' | '8K';
  subtitles: string[]; // Array of language codes like ['en', 'es', 'fr']
  fileSize?: string;
  bitrate?: string;
}

export interface MediaProgress {
  currentEpisode?: number;
  totalEpisodes?: number;
  progressPercent?: number;
  lastWatched?: string;
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  description: string;
  duration: string;
  thumbnail: string;
  airDate: string;
  dateAdded: string; // New field for when episode was added to library
  watchStatus: 'watched' | 'unwatched';
  technicalInfo?: MediaTechnicalInfo;
}

export interface MediaItem {
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
  watchStatus: 'unwatched' | 'in-progress' | 'watched';
  progress?: MediaProgress;
  episodes?: Episode[];
  technicalInfo?: MediaTechnicalInfo;
  isFavorite?: boolean;
  nextEpisodeDate?: string; // For TV shows, when the next episode is expected
  nextEpisodeName?: string; // New field for the next episode name
  filePath?: string; // Add filePath property for streaming media files
}
