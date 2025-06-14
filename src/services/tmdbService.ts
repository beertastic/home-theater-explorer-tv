
// TMDB API service for fetching movie and TV show metadata
// Note: In production, you'd store the API key in Supabase secrets

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// For demo purposes - in production, use Supabase secrets
const DEMO_API_KEY = 'your-tmdb-api-key-here';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres: { id: number; name: string }[];
  poster_path: string;
  backdrop_path: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  poster_path: string;
  backdrop_path: string;
  seasons: TMDBSeason[];
}

export interface TMDBSeason {
  season_number: number;
  episode_count: number;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string;
  runtime: number;
  still_path?: string;
}

class TMDBService {
  private apiKey: string;

  constructor(apiKey: string = DEMO_API_KEY) {
    this.apiKey = apiKey;
  }

  private async fetchFromTMDB(endpoint: string) {
    if (!this.apiKey || this.apiKey === 'your-tmdb-api-key-here') {
      throw new Error('TMDB API key not configured. Please set up your API key.');
    }

    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    return response.json();
  }

  async searchMovie(query: string): Promise<TMDBMovie[]> {
    const data = await this.fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}`);
    return data.results;
  }

  async searchTVShow(query: string): Promise<TMDBTVShow[]> {
    const data = await this.fetchFromTMDB(`/search/tv?query=${encodeURIComponent(query)}`);
    return data.results;
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return await this.fetchFromTMDB(`/movie/${movieId}`);
  }

  async getTVShowDetails(tvId: number): Promise<TMDBTVShow> {
    const show = await this.fetchFromTMDB(`/tv/${tvId}`);
    
    // Fetch season details
    const seasonsWithEpisodes = await Promise.all(
      show.seasons.map(async (season: TMDBSeason) => {
        if (season.season_number === 0) return season; // Skip specials
        const seasonDetails = await this.fetchFromTMDB(`/tv/${tvId}/season/${season.season_number}`);
        return {
          ...season,
          episodes: seasonDetails.episodes
        };
      })
    );

    return {
      ...show,
      seasons: seasonsWithEpisodes
    };
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.fetchFromTMDB(`/discover/movie?with_genres=${genreId}&page=${page}`);
    return data.results;
  }

  async getGenres(): Promise<{ id: number; name: string }[]> {
    const data = await this.fetchFromTMDB('/genre/movie/list');
    return data.genres;
  }

  getImageUrl(path: string): string {
    return `${TMDB_IMAGE_BASE_URL}${path}`;
  }
}

export const tmdbService = new TMDBService();
