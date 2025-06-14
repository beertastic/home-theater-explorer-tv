
// TMDB API Service for fetching movie and TV show metadata
const TMDB_API_KEY = '9e31c876387ff25023fff5be636bcff8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  runtime?: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

class TMDBService {
  private async fetchFromTMDB(endpoint: string): Promise<any> {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return response.json();
  }

  // Search for movies and TV shows
  async searchMulti(query: string): Promise<{ movies: TMDBMovie[]; tvShows: TMDBTVShow[] }> {
    const data = await this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
    
    const movies = data.results.filter((item: any) => item.media_type === 'movie');
    const tvShows = data.results.filter((item: any) => item.media_type === 'tv');
    
    return { movies, tvShows };
  }

  // Get movie details by ID
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return this.fetchFromTMDB(`/movie/${movieId}`);
  }

  // Get TV show details by ID
  async getTVShowDetails(tvId: number): Promise<TMDBTVShow> {
    return this.fetchFromTMDB(`/tv/${tvId}`);
  }

  // Get TV show seasons
  async getTVShowSeasons(tvId: number): Promise<TMDBSeason[]> {
    const data = await this.fetchFromTMDB(`/tv/${tvId}`);
    return data.seasons || [];
  }

  // Get season episodes
  async getSeasonEpisodes(tvId: number, seasonNumber: number): Promise<TMDBEpisode[]> {
    const data = await this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    return data.episodes || [];
  }

  // Get all genres for movies and TV shows
  async getGenres(): Promise<{ movieGenres: TMDBGenre[]; tvGenres: TMDBGenre[] }> {
    const [movieData, tvData] = await Promise.all([
      this.fetchFromTMDB('/genre/movie/list'),
      this.fetchFromTMDB('/genre/tv/list')
    ]);
    
    return {
      movieGenres: movieData.genres,
      tvGenres: tvData.genres
    };
  }

  // Search specifically for movies
  async searchMovies(query: string): Promise<TMDBMovie[]> {
    const data = await this.fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}`);
    return data.results;
  }

  // Search specifically for TV shows
  async searchTVShows(query: string): Promise<TMDBTVShow[]> {
    const data = await this.fetchFromTMDB(`/search/tv?query=${encodeURIComponent(query)}`);
    return data.results;
  }

  // Get popular movies
  async getPopularMovies(): Promise<TMDBMovie[]> {
    const data = await this.fetchFromTMDB('/movie/popular');
    return data.results;
  }

  // Get popular TV shows
  async getPopularTVShows(): Promise<TMDBTVShow[]> {
    const data = await this.fetchFromTMDB('/tv/popular');
    return data.results;
  }

  // Helper method to get full image URL
  getImageUrl(path: string | null): string | null {
    return path ? `${TMDB_IMAGE_BASE_URL}${path}` : null;
  }

  // Helper method to convert TMDB data to our MediaItem format
  convertToMediaItem(tmdbItem: TMDBMovie | TMDBTVShow, type: 'movie' | 'tv'): any {
    const isMovie = type === 'movie';
    const item = tmdbItem as any;
    
    return {
      id: `tmdb-${type}-${item.id}`,
      title: isMovie ? item.title : item.name,
      description: item.overview,
      type,
      year: isMovie ? 
        new Date(item.release_date).getFullYear() : 
        new Date(item.first_air_date).getFullYear(),
      rating: Math.round(item.vote_average * 10) / 10,
      thumbnail: this.getImageUrl(item.poster_path) || '/placeholder.svg',
      backdrop: this.getImageUrl(item.backdrop_path),
      genre: [], // Would need to map genre_ids to genre names
      watchStatus: 'unwatched' as const,
      dateAdded: new Date().toISOString(),
      // Add more fields as needed
    };
  }
}

export const tmdbService = new TMDBService();
