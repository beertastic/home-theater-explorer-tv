const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load environment variables from .env file in the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Debug: Log database configuration
console.log('Database Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('Environment file path:', path.join(__dirname, '.env'));

// Middleware
app.use(cors());
app.use(express.json());

// Debug: Log the exact connection config being used
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectTimeout: 20000, // 20 seconds
  acquireTimeout: 20000,
  timeout: 20000,
  reconnect: true
};

console.log('MySQL Connection Config:');
console.log('host:', dbConfig.host);
console.log('user:', dbConfig.user);
console.log('database:', dbConfig.database);
console.log('port:', dbConfig.port);
console.log('password:', dbConfig.password ? 'SET' : 'NOT SET');

// Database connection
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.error('Error details:');
    console.error('- Code:', err.code);
    console.error('- Errno:', err.errno);
    console.error('- Message:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

// Handle connection errors
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    // Handle reconnection logic here if needed
  }
});

// TMDB API helper
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY
  }
});

// Helper function to get library path based on media type
const getLibraryPath = (mediaType) => {
  if (mediaType === 'movie') {
    return process.env.MOVIES_LIBRARY_PATH || process.env.MEDIA_LIBRARY_PATH;
  } else if (mediaType === 'tv') {
    return process.env.TV_LIBRARY_PATH || process.env.MEDIA_LIBRARY_PATH;
  }
  return process.env.MEDIA_LIBRARY_PATH;
};

// Test TMDB API connection
app.get('/api/tmdb/test', async (req, res) => {
  try {
    console.log('Testing TMDB API connection...');
    console.log('API Key:', process.env.TMDB_API_KEY ? 'Present' : 'Missing');
    
    // Test with a simple configuration request
    const response = await tmdbApi.get('/configuration');
    
    res.json({
      success: true,
      message: 'TMDB API connection successful',
      apiKey: process.env.TMDB_API_KEY ? 'Present' : 'Missing',
      data: {
        imageBaseUrl: response.data.images.secure_base_url,
        posterSizes: response.data.images.poster_sizes
      }
    });
  } catch (error) {
    console.error('TMDB API test failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'TMDB API connection failed',
      error: error.message,
      apiKey: process.env.TMDB_API_KEY ? 'Present' : 'Missing'
    });
  }
});

// Routes

// Get all media with pagination
app.get('/api/media', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const type = req.query.type;
  const genre = req.query.genre;
  const search = req.query.search;

  let query = `
    SELECT m.*, GROUP_CONCAT(g.name) as genres
    FROM media m
    LEFT JOIN media_genres mg ON m.id = mg.media_id
    LEFT JOIN genres g ON mg.genre_id = g.id
  `;
  
  let conditions = [];
  let params = [];

  if (type) {
    conditions.push('m.type = ?');
    params.push(type);
  }

  if (search) {
    conditions.push('m.title LIKE ?');
    params.push(`%${search}%`);
  }

  if (genre) {
    conditions.push('g.name = ?');
    params.push(genre);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY m.id ORDER BY m.date_added DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT m.id) as total FROM media m';
    if (genre) {
      countQuery += ' LEFT JOIN media_genres mg ON m.id = mg.media_id LEFT JOIN genres g ON mg.genre_id = g.id';
    }
    
    let countConditions = [];
    let countParams = [];

    if (type) {
      countConditions.push('m.type = ?');
      countParams.push(type);
    }

    if (search) {
      countConditions.push('m.title LIKE ?');
      countParams.push(`%${search}%`);
    }

    if (genre) {
      countConditions.push('g.name = ?');
      countParams.push(genre);
    }

    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }

    db.query(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const processedResults = results.map(item => ({
        ...item,
        genre: item.genres ? item.genres.split(',') : []
      }));

      res.json({
        data: processedResults,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
    });
  });
});

// Get single media item with episodes
app.get('/api/media/:id', (req, res) => {
  const mediaId = req.params.id;

  const mediaQuery = `
    SELECT m.*, GROUP_CONCAT(g.name) as genres
    FROM media m
    LEFT JOIN media_genres mg ON m.id = mg.media_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    WHERE m.id = ?
    GROUP BY m.id
  `;

  db.query(mediaQuery, [mediaId], (err, mediaResults) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (mediaResults.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const media = {
      ...mediaResults[0],
      genre: mediaResults[0].genres ? mediaResults[0].genres.split(',') : []
    };

    if (media.type === 'tv') {
      const episodesQuery = `
        SELECT * FROM episodes
        WHERE media_id = ?
        ORDER BY season_number, episode_number
      `;

      db.query(episodesQuery, [mediaId], (err, episodes) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        media.episodes = episodes;
        res.json(media);
      });
    } else {
      res.json(media);
    }
  });
});

// Update media watch status
app.put('/api/media/:id/watch-status', (req, res) => {
  const { watchStatus, currentEpisode, progressPercent } = req.body;
  const mediaId = req.params.id;

  const query = `
    UPDATE media 
    SET watch_status = ?, current_episode = ?, progress_percent = ?, last_watched = NOW()
    WHERE id = ?
  `;

  db.query(query, [watchStatus, currentEpisode, progressPercent, mediaId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({ message: 'Watch status updated successfully' });
  });
});

// Update episode watch status
app.put('/api/episodes/:id/watch-status', (req, res) => {
  const { watchStatus } = req.body;
  const episodeId = req.params.id;

  const query = 'UPDATE episodes SET watch_status = ? WHERE id = ?';

  db.query(query, [watchStatus, episodeId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    res.json({ message: 'Episode watch status updated successfully' });
  });
});

// Get all genres
app.get('/api/genres', (req, res) => {
  const query = 'SELECT * FROM genres ORDER BY name';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Search TMDB and add to library
app.post('/api/media/add-from-tmdb', async (req, res) => {
  const { tmdbId, type } = req.body;

  try {
    let tmdbData;
    if (type === 'movie') {
      const response = await tmdbApi.get(`/movie/${tmdbId}`);
      tmdbData = response.data;
    } else {
      const response = await tmdbApi.get(`/tv/${tmdbId}`);
      tmdbData = response.data;
    }

    // Convert TMDB data to our format
    const mediaData = {
      title: type === 'movie' ? tmdbData.title : tmdbData.name,
      type: type,
      year: type === 'movie' 
        ? new Date(tmdbData.release_date).getFullYear() 
        : new Date(tmdbData.first_air_date).getFullYear(),
      rating: Math.round(tmdbData.vote_average * 10) / 10,
      description: tmdbData.overview,
      thumbnail: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null,
      backdrop: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` : null,
      duration: type === 'movie' ? `${tmdbData.runtime}m` : `${tmdbData.number_of_seasons} Seasons`,
      total_episodes: type === 'tv' ? tmdbData.number_of_episodes : null
    };

    // Insert media
    const insertQuery = `
      INSERT INTO media (title, type, year, rating, duration, description, thumbnail, backdrop, total_episodes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [
      mediaData.title, mediaData.type, mediaData.year, mediaData.rating,
      mediaData.duration, mediaData.description, mediaData.thumbnail,
      mediaData.backdrop, mediaData.total_episodes
    ], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const mediaId = result.insertId;

      // Add genres
      if (tmdbData.genres && tmdbData.genres.length > 0) {
        const genrePromises = tmdbData.genres.map(genre => {
          return new Promise((resolve, reject) => {
            // Insert genre if it doesn't exist
            db.query('INSERT IGNORE INTO genres (name) VALUES (?)', [genre.name], (err) => {
              if (err) return reject(err);
              
              // Get genre ID and link to media
              db.query('SELECT id FROM genres WHERE name = ?', [genre.name], (err, genreResult) => {
                if (err) return reject(err);
                
                const genreId = genreResult[0].id;
                db.query('INSERT INTO media_genres (media_id, genre_id) VALUES (?, ?)', 
                  [mediaId, genreId], (err) => {
                    if (err) return reject(err);
                    resolve();
                  });
              });
            });
          });
        });

        Promise.all(genrePromises)
          .then(() => {
            res.json({ message: 'Media added successfully', id: mediaId });
          })
          .catch(err => {
            res.status(500).json({ error: err.message });
          });
      } else {
        res.json({ message: 'Media added successfully', id: mediaId });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search TMDB
app.get('/api/tmdb/search', async (req, res) => {
  const { query, type } = req.query;

  try {
    let endpoint = '/search/multi';
    if (type === 'movie') endpoint = '/search/movie';
    if (type === 'tv') endpoint = '/search/tv';

    const response = await tmdbApi.get(endpoint, {
      params: { query }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get random movies by genre
app.get('/api/media/random', (req, res) => {
  const { genre, limit = 3 } = req.query;

  if (!genre) {
    return res.status(400).json({ error: 'Genre parameter is required' });
  }

  const query = `
    SELECT m.*, GROUP_CONCAT(g.name) as genres
    FROM media m
    LEFT JOIN media_genres mg ON m.id = mg.media_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    WHERE m.type = 'movie' AND g.name = ?
    GROUP BY m.id
    ORDER BY RAND()
    LIMIT ?
  `;

  db.query(query, [genre, parseInt(limit)], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const processedResults = results.map(item => ({
      ...item,
      genre: item.genres ? item.genres.split(',') : []
    }));

    res.json(processedResults);
  });
});

// Check file system and database consistency for media
app.get('/api/media/:id/verify', (req, res) => {
  const mediaId = req.params.id;
  const fs = require('fs');
  const path = require('path');

  // Get media info from database
  const mediaQuery = `
    SELECT m.*, GROUP_CONCAT(g.name) as genres, mf.file_path
    FROM media m
    LEFT JOIN media_genres mg ON m.id = mg.media_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN media_files mf ON m.id = mf.media_id
    WHERE m.id = ?
    GROUP BY m.id
  `;

  db.query(mediaQuery, [mediaId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.json({
        databaseExists: false,
        fileSystemExists: false,
        status: 'missing'
      });
    }

    const media = results[0];
    let fileSystemExists = false;
    let filePath = media.file_path;

    // If no file path in database, construct expected path using appropriate library
    if (!filePath) {
      const libraryPath = getLibraryPath(media.type);
      filePath = path.join(libraryPath, `${media.title} (${media.year})`);
    }

    // Check if file/directory exists
    try {
      if (fs.existsSync(filePath)) {
        fileSystemExists = true;
      }
    } catch (error) {
      console.log('File system check error:', error.message);
      fileSystemExists = false;
    }

    // Determine overall status
    let status = 'verified';
    if (!fileSystemExists) {
      status = 'file-missing';
    }

    res.json({
      databaseExists: true,
      fileSystemExists,
      status,
      filePath,
      media: {
        ...media,
        genre: media.genres ? media.genres.split(',') : []
      }
    });
  });
});

// Bulk verify recently added media (last 24 hours)
app.get('/api/media/verify-recent', (req, res) => {
  const hoursAgo = parseInt(req.query.hours) || 24;
  
  const query = `
    SELECT m.*, GROUP_CONCAT(g.name) as genres
    FROM media m
    LEFT JOIN media_genres mg ON m.id = mg.media_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    WHERE m.date_added >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    GROUP BY m.id
    ORDER BY m.date_added DESC
  `;

  db.query(query, [hoursAgo], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const verificationResults = [];
    const fs = require('fs');
    const path = require('path');

    for (const media of results) {
      const libraryPath = getLibraryPath(media.type);
      const expectedPath = path.join(libraryPath, `${media.title} (${media.year})`);
      
      let fileSystemExists = false;
      try {
        fileSystemExists = fs.existsSync(expectedPath);
      } catch (error) {
        fileSystemExists = false;
      }

      let status = 'verified';
      if (!fileSystemExists) {
        status = 'file-missing';
      }

      verificationResults.push({
        id: media.id,
        title: media.title,
        type: media.type,
        year: media.year,
        dateAdded: media.date_added,
        databaseExists: true,
        fileSystemExists,
        status,
        filePath: expectedPath,
        genre: media.genres ? media.genres.split(',') : []
      });
    }

    res.json({
      totalChecked: verificationResults.length,
      verified: verificationResults.filter(r => r.status === 'verified').length,
      issues: verificationResults.filter(r => r.status !== 'verified').length,
      results: verificationResults
    });
  });
});

// Scan file system for new media folders
app.get('/api/scan/folders', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const scannedFolders = [];
    
    // Get library paths from environment
    const movieLibraryPath = process.env.MOVIES_LIBRARY_PATH || process.env.MEDIA_LIBRARY_PATH;
    const tvLibraryPath = process.env.TV_LIBRARY_PATH || process.env.MEDIA_LIBRARY_PATH;
    
    console.log('Scanning movie library:', movieLibraryPath);
    console.log('Scanning TV library:', tvLibraryPath);
    
    // Helper function to scan a directory
    const scanDirectory = (libraryPath, mediaType) => {
      if (!libraryPath || !fs.existsSync(libraryPath)) {
        console.log(`Library path does not exist: ${libraryPath}`);
        return;
      }
      
      try {
        const items = fs.readdirSync(libraryPath, { withFileTypes: true });
        
        items.forEach((item, index) => {
          if (item.isDirectory()) {
            const fullPath = path.join(libraryPath, item.name);
            
            // Try to extract title and year from folder name
            const match = item.name.match(/^(.+?)\s*\((\d{4})\)$/);
            const title = match ? match[1].trim() : item.name;
            const year = match ? parseInt(match[2]) : new Date().getFullYear();
            
            scannedFolders.push({
              id: `${mediaType}-${index}-${Date.now()}`,
              path: fullPath,
              name: item.name,
              status: 'pending',
              detectedMetadata: {
                id: `auto-${mediaType}-${index}`,
                title: title,
                year: year,
                overview: `Detected ${mediaType} from file system: ${title}`,
                poster_path: '/placeholder.svg',
                backdrop_path: '/placeholder.svg',
                vote_average: 0,
                type: mediaType
              }
            });
          }
        });
      } catch (error) {
        console.error(`Error scanning ${mediaType} directory:`, error.message);
      }
    };
    
    // Scan movie library
    if (movieLibraryPath) {
      scanDirectory(movieLibraryPath, 'movie');
    }
    
    // Scan TV library (if different from movie library)
    if (tvLibraryPath && tvLibraryPath !== movieLibraryPath) {
      scanDirectory(tvLibraryPath, 'tv');
    }
    
    console.log(`Found ${scannedFolders.length} folders to scan`);
    
    res.json({
      success: true,
      folders: scannedFolders,
      totalFound: scannedFolders.length
    });
    
  } catch (error) {
    console.error('Error scanning folders:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      folders: []
    });
  }
});

// Get library statistics
app.get('/api/stats/library', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Get database count
    db.query('SELECT COUNT(*) as count FROM media', (err, dbResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const dbCount = dbResults[0].count;
      
      // Get folder counts from file system
      const movieLibraryPath = process.env.MOVIES_LIBRARY_PATH || process.env.MEDIA_LIBRARY_PATH;
      const tvLibraryPath = process.env.TV_LIBRARY_PATH || process.env.MEDIA_LIBRARY_PATH;
      
      let movieFolderCount = 0;
      let tvFolderCount = 0;
      
      // Count movie folders
      if (movieLibraryPath && fs.existsSync(movieLibraryPath)) {
        try {
          const movieItems = fs.readdirSync(movieLibraryPath, { withFileTypes: true });
          movieFolderCount = movieItems.filter(item => item.isDirectory()).length;
        } catch (error) {
          console.error('Error counting movie folders:', error.message);
        }
      }
      
      // Count TV folders (if different path)
      if (tvLibraryPath && tvLibraryPath !== movieLibraryPath && fs.existsSync(tvLibraryPath)) {
        try {
          const tvItems = fs.readdirSync(tvLibraryPath, { withFileTypes: true });
          tvFolderCount = tvItems.filter(item => item.isDirectory()).length;
        } catch (error) {
          console.error('Error counting TV folders:', error.message);
        }
      } else if (tvLibraryPath === movieLibraryPath) {
        // If same path, we need to distinguish between movies and TV
        // For now, we'll split the count or use a different logic
        tvFolderCount = Math.floor(movieFolderCount * 0.3); // Rough estimate
      }
      
      res.json({
        success: true,
        dbFileCount: dbCount,
        movieFolderCount,
        tvFolderCount,
        totalFolders: movieFolderCount + tvFolderCount
      });
    });
    
  } catch (error) {
    console.error('Error getting library stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add episode data for existing TV show
app.post('/api/media/:id/populate-episodes', async (req, res) => {
  const mediaId = req.params.id;
  
  console.log(`Starting episode population for media ID: ${mediaId}`);

  try {
    // First, get the media item to ensure it's a TV show
    const mediaQuery = 'SELECT * FROM media WHERE id = ? AND type = "tv"';
    
    db.query(mediaQuery, [mediaId], async (err, mediaResults) => {
      if (err) {
        console.error('Database error when fetching media:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Database error: ' + err.message 
        });
      }

      if (mediaResults.length === 0) {
        console.log(`No TV show found with ID: ${mediaId}`);
        return res.status(404).json({ 
          success: false,
          error: 'TV show not found' 
        });
      }

      const media = mediaResults[0];
      console.log(`Found TV show: ${media.title} (${media.year})`);
      
      try {
        // Check if TMDB API key is available
        if (!process.env.TMDB_API_KEY) {
          console.error('TMDB API key is missing');
          return res.status(500).json({
            success: false,
            error: 'TMDB API key not configured'
          });
        }

        // Search TMDB for the show to get the TMDB ID
        console.log(`Searching TMDB for: ${media.title} (${media.year})`);
        const searchResponse = await tmdbApi.get('/search/tv', {
          params: { 
            query: media.title,
            first_air_date_year: media.year
          }
        });

        if (searchResponse.data.results.length === 0) {
          console.log(`No TMDB results found for: ${media.title}`);
          return res.status(404).json({ 
            success: false,
            error: 'Show not found on TMDB' 
          });
        }

        const tmdbShow = searchResponse.data.results[0];
        console.log(`Found TMDB show: ${tmdbShow.name} (ID: ${tmdbShow.id})`);

        // Get detailed show information including seasons
        const showDetailsResponse = await tmdbApi.get(`/tv/${tmdbShow.id}`);
        const showDetails = showDetailsResponse.data;
        console.log(`Show has ${showDetails.seasons.length} seasons`);

        let totalEpisodesAdded = 0;

        // Fetch episodes for each season
        for (const season of showDetails.seasons) {
          if (season.season_number === 0) continue; // Skip specials

          try {
            console.log(`Fetching season ${season.season_number}...`);
            const seasonResponse = await tmdbApi.get(`/tv/${tmdbShow.id}/season/${season.season_number}`);
            const seasonData = seasonResponse.data;

            console.log(`Processing Season ${season.season_number} with ${seasonData.episodes.length} episodes`);

            // Insert each episode
            for (const episode of seasonData.episodes) {
              const episodeInsertQuery = `
                INSERT INTO episodes (
                  media_id, title, episode_number, season_number, 
                  description, duration, air_date, date_added, watch_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'unwatched')
              `;

              const duration = episode.runtime ? `${episode.runtime}m` : '45m'; // Default to 45m if no runtime
              const airDate = episode.air_date || new Date().toISOString().split('T')[0];

              await new Promise((resolve, reject) => {
                db.query(episodeInsertQuery, [
                  mediaId,
                  episode.name || `Episode ${episode.episode_number}`,
                  episode.episode_number,
                  episode.season_number,
                  episode.overview || '',
                  duration,
                  airDate
                ], (err, result) => {
                  if (err) {
                    console.error(`Error inserting episode ${episode.episode_number}:`, err);
                    reject(err);
                  } else {
                    totalEpisodesAdded++;
                    resolve(result);
                  }
                });
              });
            }
          } catch (seasonError) {
            console.error(`Error fetching season ${season.season_number}:`, seasonError.message);
          }
        }

        // Update the media item with total episodes
        const updateMediaQuery = 'UPDATE media SET total_episodes = ? WHERE id = ?';
        db.query(updateMediaQuery, [totalEpisodesAdded, mediaId], (err) => {
          if (err) {
            console.error('Error updating total episodes:', err);
          }
        });

        console.log(`Successfully added ${totalEpisodesAdded} episodes for ${media.title}`);
        res.json({
          success: true,
          message: `Successfully added ${totalEpisodesAdded} episodes for ${media.title}`,
          episodesAdded: totalEpisodesAdded,
          seasons: showDetails.seasons.length
        });

      } catch (tmdbError) {
        console.error('TMDB API error:', tmdbError.message);
        console.error('TMDB Error details:', tmdbError.response?.data || 'No additional details');
        res.status(500).json({ 
          success: false,
          error: 'Failed to fetch episode data from TMDB: ' + tmdbError.message
        });
      }
    });

  } catch (error) {
    console.error('Unexpected error in populate-episodes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Unexpected error: ' + error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Media Center API running on port ${port}`);
});
