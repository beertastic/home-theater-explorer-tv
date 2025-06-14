
const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiMediaItem {
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
  watch_status: 'unwatched' | 'in-progress' | 'watched';
  progress_percent?: number;
  current_episode?: number;
  total_episodes?: number;
  last_watched?: string;
  is_favorite?: boolean;
}

export interface ApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  media_type?: string;
}

export const apiService = {
  // Get all media
  async getMedia(page = 1, limit = 20, type?: string, search?: string): Promise<ApiResponse<ApiMediaItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/media?${params}`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  },

  // Get single media item
  async getMediaById(id: string): Promise<ApiMediaItem> {
    const response = await fetch(`${API_BASE_URL}/media/${id}`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  },

  // Update watch status
  async updateWatchStatus(id: string, watchStatus: string, currentEpisode?: number, progressPercent?: number) {
    const response = await fetch(`${API_BASE_URL}/media/${id}/watch-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchStatus, currentEpisode, progressPercent }),
    });
    if (!response.ok) throw new Error('Failed to update watch status');
    return response.json();
  },

  // Search TMDB
  async searchTMDB(query: string, type?: string): Promise<{ results: TMDBSearchResult[] }> {
    const params = new URLSearchParams({ query });
    if (type) params.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/tmdb/search?${params}`);
    if (!response.ok) throw new Error('Failed to search TMDB');
    return response.json();
  },

  // Add media from TMDB
  async addMediaFromTMDB(tmdbId: number, type: string) {
    const response = await fetch(`${API_BASE_URL}/media/add-from-tmdb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId, type }),
    });
    if (!response.ok) throw new Error('Failed to add media from TMDB');
    return response.json();
  },

  // Test TMDB connection
  async testTMDB() {
    const response = await fetch(`${API_BASE_URL}/tmdb/test`);
    if (!response.ok) throw new Error('Failed to test TMDB connection');
    return response.json();
  }
};
