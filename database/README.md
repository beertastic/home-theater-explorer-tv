
# Media Center Database Setup

This guide will help you set up the database for your Media Center application locally.

## Database Options

### Option 1: SQLite (Recommended for local deployment)
SQLite is perfect for local NAS deployment as it requires no additional server setup.

#### Setup Steps:
1. Install SQLite on your system:
   ```bash
   # Ubuntu/Debian
   sudo apt install sqlite3
   
   # macOS
   brew install sqlite
   
   # Windows
   # Download from https://sqlite.org/download.html
   ```

2. Create the database:
   ```bash
   sqlite3 media_center.db < schema.sql
   ```

3. Verify the setup:
   ```bash
   sqlite3 media_center.db
   .tables
   .quit
   ```

### Option 2: PostgreSQL (For more advanced setups)
If you prefer PostgreSQL, you can adapt the schema:

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE media_center;
   ```
3. Modify the schema.sql to use PostgreSQL syntax (change AUTOINCREMENT to SERIAL, etc.)

## Environment Variables
Create a `.env` file in your project root:

```env
# Database configuration
DATABASE_TYPE=sqlite
DATABASE_PATH=./database/media_center.db

# Or for PostgreSQL:
# DATABASE_TYPE=postgresql
# DATABASE_URL=postgresql://username:password@localhost:5432/media_center

# Media library paths
MEDIA_LIBRARY_PATH=/path/to/your/media/files
THUMBNAIL_CACHE_PATH=/path/to/thumbnail/cache

# Server configuration
PORT=3000
HOST=0.0.0.0
```

## API Integration
To connect this React app to your database, you'll need a backend API. You can use:

1. **Node.js/Express** with SQLite driver
2. **Python/FastAPI** with SQLite3
3. **Go** with database/sql
4. **PHP** with PDO

### Example Node.js API endpoints:
```javascript
// GET /api/media - Get all media
// GET /api/media/:id - Get specific media with episodes
// PUT /api/media/:id/watch-status - Update watch status
// PUT /api/episodes/:id/watch-status - Update episode watch status
// POST /api/media/scan - Trigger library scan
```

## File Structure
```
your-media-server/
├── database/
│   ├── media_center.db
│   ├── schema.sql
│   └── README.md
├── media/
│   ├── movies/
│   └── tv-shows/
├── thumbnails/
├── api/ (your backend code)
└── web/ (this React app)
```

## Media File Organization
Organize your media files like this:

```
media/
├── movies/
│   ├── The Matrix (1999)/
│   │   ├── The Matrix (1999).mkv
│   │   └── poster.jpg
│   └── Inception (2010)/
│       ├── Inception (2010).mp4
│       └── poster.jpg
└── tv-shows/
    ├── Stranger Things/
    │   ├── Season 1/
    │   │   ├── S01E01 - Chapter One.mkv
    │   │   └── S01E02 - Chapter Two.mkv
    │   └── poster.jpg
    └── Breaking Bad/
        ├── Season 1/
        │   └── S01E01 - Pilot.mkv
        └── poster.jpg
```

## Media Scanning
Your backend should implement a media scanner that:
1. Recursively scans the media directory
2. Extracts metadata (title, year, duration, etc.)
3. Generates thumbnails
4. Updates the database
5. Matches against external databases (TMDB, TVDB) for metadata

## Deployment on NAS
1. Copy files to your NAS
2. Install Node.js/Python on your NAS
3. Set up the database
4. Configure file paths
5. Start the backend API
6. Serve the React app (built version)
7. Access via your NAS IP address

Most modern NAS systems (Synology, QNAP, etc.) support Docker, making deployment even easier with containerization.
