export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  airDate: string;
  watchStatus: 'unwatched' | 'watched';
  thumbnail?: string;
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
  progress?: {
    currentEpisode?: number;
    totalEpisodes?: number;
    lastWatched?: string;
    progressPercent?: number;
  };
  episodes?: Episode[];
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
    },
    episodes: [
      {
        id: 'st-s1e1',
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Chapter One: The Vanishing of Will Byers',
        description: 'On his way home from a friend\'s house, young Will sees something terrifying.',
        duration: '47m',
        airDate: '2016-07-15',
        watchStatus: 'watched'
      },
      {
        id: 'st-s1e2',
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'Chapter Two: The Weirdo on Maple Street',
        description: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods.',
        duration: '55m',
        airDate: '2016-07-15',
        watchStatus: 'watched'
      },
      {
        id: 'st-s1e3',
        seasonNumber: 1,
        episodeNumber: 3,
        title: 'Chapter Three: Holly, Jolly',
        description: 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan\'s been up to.',
        duration: '51m',
        airDate: '2016-07-15',
        watchStatus: 'watched'
      },
      {
        id: 'st-s1e4',
        seasonNumber: 1,
        episodeNumber: 4,
        title: 'Chapter Four: The Body',
        description: 'Refusing to believe Will is dead, Joyce tries to connect with her son.',
        duration: '50m',
        airDate: '2016-07-15',
        watchStatus: 'watched'
      },
      {
        id: 'st-s1e5',
        seasonNumber: 1,
        episodeNumber: 5,
        title: 'Chapter Five: Dig Dug',
        description: 'Hopper discovers the truth about the lab, while Nancy and Jonathan confront the monster.',
        duration: '52m',
        airDate: '2016-07-15',
        watchStatus: 'watched'
      },
      {
        id: 'st-s2e1',
        seasonNumber: 2,
        episodeNumber: 1,
        title: 'Chapter Six: MADMAX',
        description: 'As the town preps for Halloween, a high-scoring rival shakes things up in the arcade.',
        duration: '48m',
        airDate: '2017-10-27',
        watchStatus: 'unwatched'
      }
    ]
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
    },
    episodes: [
      {
        id: 'bb-s1e1',
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Pilot',
        description: 'Walter White, a struggling high school chemistry teacher, is diagnosed with inoperable lung cancer.',
        duration: '58m',
        airDate: '2008-01-20',
        watchStatus: 'watched'
      },
      {
        id: 'bb-s1e2',
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'Cat\'s in the Bag...',
        description: 'Walter and Jesse attempt to tie up loose ends.',
        duration: '48m',
        airDate: '2008-01-27',
        watchStatus: 'watched'
      },
      {
        id: 'bb-s1e3',
        seasonNumber: 1,
        episodeNumber: 3,
        title: '...And the Bag\'s in the River',
        description: 'Walter fights with Jesse over his drug use, forcing him to leave the house.',
        duration: '48m',
        airDate: '2008-02-10',
        watchStatus: 'unwatched'
      }
    ]
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
    watchStatus: 'watched',
    episodes: [
      {
        id: 'tc-s1e1',
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Wolferton Splash',
        description: 'A young Princess Elizabeth marries Prince Philip.',
        duration: '57m',
        airDate: '2016-11-04',
        watchStatus: 'watched'
      },
      {
        id: 'tc-s1e2',
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'Hyde Park Corner',
        description: 'Elizabeth is crowned Queen after King George VI\'s death.',
        duration: '56m',
        airDate: '2016-11-04',
        watchStatus: 'watched'
      }
    ]
  }
];
