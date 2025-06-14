
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
  progress?: {
    currentEpisode?: number;
    totalEpisodes?: number;
    lastWatched?: string;
    progressPercent?: number;
  };
}

export const mockMediaData: MediaItem[] = [
  {
    id: '1',
    title: 'The Matrix',
    type: 'movie' as const,
    year: 1999,
    rating: 8.7,
    duration: '2h 16m',
    description: 'A computer programmer discovers that reality as he knows it might not be real after all.',
    thumbnail: 'https://images.unsplash.com/photo-1489599511835-c41b1ddce4df?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599511835-c41b1ddce4df?w=800&h=450&fit=crop',
    genre: ['Action', 'Sci-Fi'],
    dateAdded: '2024-06-10',
    watchStatus: 'watched'
  },
  {
    id: '2',
    title: 'Stranger Things',
    type: 'tv' as const,
    year: 2016,
    rating: 8.8,
    duration: '4 Seasons',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
    thumbnail: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=800&h=450&fit=crop',
    genre: ['Drama', 'Fantasy', 'Horror'],
    dateAdded: '2024-06-12',
    watchStatus: 'in-progress',
    progress: {
      currentEpisode: 5,
      totalEpisodes: 34,
      lastWatched: '2024-06-13',
      progressPercent: 15
    }
  },
  {
    id: '3',
    title: 'Inception',
    type: 'movie' as const,
    year: 2010,
    rating: 8.8,
    duration: '2h 28m',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=450&fit=crop',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    dateAdded: '2024-06-08',
    watchStatus: 'unwatched'
  },
  {
    id: '4',
    title: 'Breaking Bad',
    type: 'tv' as const,
    year: 2008,
    rating: 9.5,
    duration: '5 Seasons',
    description: 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student.',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=450&fit=crop',
    genre: ['Crime', 'Drama', 'Thriller'],
    dateAdded: '2024-06-05',
    watchStatus: 'in-progress',
    progress: {
      currentEpisode: 25,
      totalEpisodes: 62,
      lastWatched: '2024-06-12',
      progressPercent: 40
    }
  },
  {
    id: '5',
    title: 'Interstellar',
    type: 'movie' as const,
    year: 2014,
    rating: 8.6,
    duration: '2h 49m',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    thumbnail: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=450&fit=crop',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    dateAdded: '2024-06-13',
    watchStatus: 'unwatched'
  },
  {
    id: '6',
    title: 'The Crown',
    type: 'tv' as const,
    year: 2016,
    rating: 8.7,
    duration: '6 Seasons',
    description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
    genre: ['Biography', 'Drama', 'History'],
    dateAdded: '2024-06-14',
    watchStatus: 'watched'
  }
];
