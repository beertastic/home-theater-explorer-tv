import { MediaItem } from '@/types/media';

export const mockMedia: MediaItem[] = [
  {
    id: '1',
    title: 'The Matrix',
    type: 'movie',
    year: 1999,
    rating: 8.7,
    duration: '2h 16m',
    description: 'A computer programmer discovers that reality as he knows it might not be real after all.',
    thumbnail: 'https://images.unsplash.com/photo-1489599511835-c41b1ddce4df?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599511835-c41b1ddce4df?w=800&h=450&fit=crop',
    genre: ['Action', 'Sci-Fi'],
    dateAdded: '2024-01-15',
    watchStatus: 'watched',
    technicalInfo: {
      videoCodec: 'H.265',
      audioFormat: '5.1',
      resolution: '4K',
      subtitles: ['en', 'es', 'fr'],
      fileSize: '8.2 GB',
      bitrate: '15 Mbps'
    }
  },
  {
    id: '2',
    title: 'Stranger Things',
    type: 'tv',
    year: 2016,
    rating: 8.8,
    duration: '4 Seasons',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
    thumbnail: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=800&h=450&fit=crop',
    genre: ['Drama', 'Fantasy', 'Horror'],
    dateAdded: '2024-01-10',
    watchStatus: 'in-progress',
    progress: {
      currentEpisode: 2,
      totalEpisodes: 8,
      progressPercent: 25,
      lastWatched: '2024-01-14'
    },
    episodes: [
      {
        id: '1',
        title: 'Chapter One: The Vanishing of Will Byers',
        episodeNumber: 1,
        seasonNumber: 1,
        description: 'On his way home from a friend\'s house, young Will sees something terrifying.',
        duration: '47m',
        thumbnail: 'https://via.placeholder.com/300x170/334155/ffffff?text=Stranger+Things+S1E1',
        airDate: '2016-07-15',
        watchStatus: 'watched'
      },
      {
        id: '2',
        title: 'Chapter Two: The Weirdo on Maple Street',
        episodeNumber: 2,
        seasonNumber: 1,
        description: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods.',
        duration: '55m',
        thumbnail: 'https://via.placeholder.com/300x170/334155/ffffff?text=Stranger+Things+S1E2',
        airDate: '2016-07-15',
        watchStatus: 'watched'
      },
      {
        id: '3',
        title: 'Chapter Three: Holly, Jolly',
        episodeNumber: 3,
        seasonNumber: 1,
        description: 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan\'s been up to.',
        duration: '51m',
        thumbnail: 'https://via.placeholder.com/300x170/334155/ffffff?text=Stranger+Things+S1E3',
        airDate: '2016-07-15',
        watchStatus: 'unwatched'
      }
    ],
    technicalInfo: {
      videoCodec: 'H.264',
      audioFormat: 'Stereo',
      resolution: '1080p',
      subtitles: ['en', 'es'],
      fileSize: '3.5 GB',
      bitrate: '8 Mbps'
    }
  },
  {
    id: '3',
    title: 'Avengers: Endgame',
    type: 'movie',
    year: 2019,
    rating: 8.4,
    duration: '3h 1m',
    description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins.',
    thumbnail: 'https://images.unsplash.com/photo-1568373983957-23d39c330e82?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1568373983957-23d39c330e82?w=800&h=450&fit=crop',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    dateAdded: '2023-12-28',
    watchStatus: 'unwatched',
     technicalInfo: {
      videoCodec: 'H.265',
      audioFormat: 'Dolby Atmos',
      resolution: '4K',
      subtitles: ['en', 'zh'],
      fileSize: '9.1 GB',
      bitrate: '20 Mbps'
    }
  },
  {
    id: '4',
    title: 'The Queen’s Gambit',
    type: 'tv',
    year: 2020,
    rating: 8.6,
    duration: '1 Season',
    description: 'Orphaned at a young age, Beth Harmon discovers she has an amazing flair for chess.',
    thumbnail: 'https://images.unsplash.com/photo-1604971349434-54999545e994?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1604971349434-54999545e994?w=800&h=450&fit=crop',
    genre: ['Drama'],
    dateAdded: '2023-12-20',
    watchStatus: 'watched',
    technicalInfo: {
      videoCodec: 'H.264',
      audioFormat: 'Stereo',
      resolution: '1080p',
      subtitles: ['en', 'de', 'es'],
      fileSize: '4.8 GB',
      bitrate: '10 Mbps'
    }
  },
  {
    id: '5',
    title: 'Interstellar',
    type: 'movie',
    year: 2014,
    rating: 8.6,
    duration: '2h 49m',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    thumbnail: 'https://images.unsplash.com/photo-1505764043699-f5e3089c9788?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1505764043699-f5e3089c9788?w=800&h=450&fit=crop',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    dateAdded: '2023-11-15',
    watchStatus: 'watched',
    technicalInfo: {
      videoCodec: 'H.265',
      audioFormat: '7.1',
      resolution: '4K',
      subtitles: ['en', 'fr', 'it'],
      fileSize: '10.2 GB',
      bitrate: '22 Mbps'
    }
  },
  {
    id: '6',
    title: 'Breaking Bad',
    type: 'tv',
    year: 2008,
    rating: 9.5,
    duration: '5 Seasons',
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    thumbnail: 'https://images.unsplash.com/photo-1603386493294-59f9a66dd677?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1603386493294-59f9a66dd677?w=800&h=450&fit=crop',
    genre: ['Crime', 'Drama', 'Thriller'],
    dateAdded: '2023-10-01',
    watchStatus: 'in-progress',
    progress: {
      currentEpisode: 5,
      totalEpisodes: 16,
      progressPercent: 31,
      lastWatched: '2023-12-25'
    },
    episodes: [
      {
        id: '1',
        title: 'Pilot',
        episodeNumber: 1,
        seasonNumber: 1,
        description: 'A high school chemistry teacher, diagnosed with inoperable lung cancer, turns to a life of crime, producing and selling methamphetamine with a former student.',
        duration: '58m',
        thumbnail: 'https://via.placeholder.com/300x170/334155/ffffff?text=Breaking+Bad+S1E1',
        airDate: '2008-01-20',
        watchStatus: 'watched'
      },
      {
        id: '2',
        title: 'Cat\'s in the Bag...',
        episodeNumber: 2,
        seasonNumber: 1,
        description: 'Walt and Jesse clean up the mess they\'ve made, while dealing with the erratic Krazy-8 and Emilio.',
        duration: '48m',
        thumbnail: 'https://via.placeholder.com/300x170/334155/ffffff?text=Breaking+Bad+S1E2',
        airDate: '2008-01-27',
        watchStatus: 'watched'
      },
      {
        id: '3',
        title: '...And the Bag\'s in the River',
        episodeNumber: 3,
        seasonNumber: 1,
        description: 'Walt and Jesse must decide what to do with Krazy-8 and Emilio.',
        duration: '48m',
        thumbnail: 'https://via.placeholder.com/300x170/334155/ffffff?text=Breaking+Bad+S1E3',
        airDate: '2008-02-03',
        watchStatus: 'watched'
      }
    ],
    technicalInfo: {
      videoCodec: 'H.264',
      audioFormat: 'Stereo',
      resolution: '1080p',
      subtitles: ['en', 'es'],
      fileSize: '6.1 GB',
      bitrate: '12 Mbps'
    }
  }
];

export { mockMedia };
export type { MediaItem };
