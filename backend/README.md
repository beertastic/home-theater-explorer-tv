
# Media Center Backend API

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup:**
   - Create a MySQL database named `media_center`
   - Import the schema: `mysql -u your_user -p media_center < ../database/mysql-schema.sql`

3. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update the database credentials and TMDB API key

4. **Start the Server:**
   ```bash
   # Development with auto-restart
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Media
- `GET /api/media` - Get all media (with pagination, filtering)
- `GET /api/media/:id` - Get single media item with episodes
- `PUT /api/media/:id/watch-status` - Update watch status
- `GET /api/media/random?genre=Action&limit=3` - Get random movies by genre

### Episodes
- `PUT /api/episodes/:id/watch-status` - Update episode watch status

### Genres
- `GET /api/genres` - Get all genres

### TMDB Integration
- `GET /api/tmdb/search?query=matrix&type=movie` - Search TMDB
- `POST /api/media/add-from-tmdb` - Add media from TMDB to library

## Query Parameters

### GET /api/media
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `type` - Filter by type (movie/tv)
- `genre` - Filter by genre name
- `search` - Search by title

## Frontend Integration

Update your React app's API calls to point to `http://localhost:3001/api/`

Example:
```javascript
// In your React components, replace mock data calls with:
fetch('http://localhost:3001/api/media?page=1&limit=20')
  .then(res => res.json())
  .then(data => setMedia(data.data));
```
