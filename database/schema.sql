
-- Media Center Database Schema
-- SQLite compatible schema for local deployment

-- Media items table (movies and TV shows)
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('movie', 'tv')),
    year INTEGER,
    rating REAL,
    duration TEXT,
    description TEXT,
    thumbnail TEXT,
    backdrop TEXT,
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
    watch_status TEXT DEFAULT 'unwatched' CHECK (watch_status IN ('unwatched', 'in-progress', 'watched')),
    current_episode INTEGER,
    total_episodes INTEGER,
    last_watched DATETIME,
    progress_percent INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Genres table
CREATE TABLE genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Media genres junction table
CREATE TABLE media_genres (
    media_id INTEGER,
    genre_id INTEGER,
    PRIMARY KEY (media_id, genre_id),
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- Episodes table for TV shows
CREATE TABLE episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id INTEGER NOT NULL,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    air_date DATE,
    watch_status TEXT DEFAULT 'unwatched' CHECK (watch_status IN ('unwatched', 'watched')),
    thumbnail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    UNIQUE(media_id, season_number, episode_number)
);

-- User preferences/settings table
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Media file paths table (for local file management)
CREATE TABLE media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id INTEGER,
    episode_id INTEGER,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_format TEXT,
    quality TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    CHECK ((media_id IS NOT NULL AND episode_id IS NULL) OR (media_id IS NULL AND episode_id IS NOT NULL))
);

-- Watch history table
CREATE TABLE watch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id INTEGER,
    episode_id INTEGER,
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_watched INTEGER, -- in seconds
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_watch_status ON media(watch_status);
CREATE INDEX idx_media_date_added ON media(date_added);
CREATE INDEX idx_episodes_media_id ON episodes(media_id);
CREATE INDEX idx_episodes_season_episode ON episodes(season_number, episode_number);
CREATE INDEX idx_media_files_path ON media_files(file_path);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at);

-- Insert default genres
INSERT INTO genres (name) VALUES 
('Action'), ('Adventure'), ('Animation'), ('Biography'), ('Comedy'), 
('Crime'), ('Documentary'), ('Drama'), ('Family'), ('Fantasy'), 
('History'), ('Horror'), ('Music'), ('Mystery'), ('Romance'), 
('Sci-Fi'), ('Sport'), ('Thriller'), ('War'), ('Western');

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
('library_scan_interval', '3600'),
('default_quality', '1080p'),
('auto_mark_watched_threshold', '90'),
('theme', 'dark');

-- Sample data insertion (optional)
INSERT INTO media (title, type, year, rating, duration, description, thumbnail, backdrop, watch_status) VALUES 
('The Matrix', 'movie', 1999, 8.7, '2h 16m', 'A computer programmer discovers that reality as he knows it might not be real after all.', 'https://images.unsplash.com/photo-1489599511835-c41b1ddce4df?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1489599511835-c41b1ddce4df?w=800&h=450&fit=crop', 'watched'),
('Stranger Things', 'tv', 2016, 8.8, '4 Seasons', 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.', 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=800&h=450&fit=crop', 'in-progress');

-- Insert genres for sample media
INSERT INTO media_genres (media_id, genre_id) VALUES 
(1, 1), (1, 12), -- The Matrix: Action, Sci-Fi
(2, 8), (2, 10), (2, 7); -- Stranger Things: Drama, Fantasy, Horror

-- Sample episodes for Stranger Things
INSERT INTO episodes (media_id, season_number, episode_number, title, description, duration, air_date, watch_status) VALUES 
(2, 1, 1, 'Chapter One: The Vanishing of Will Byers', 'On his way home from a friend''s house, young Will sees something terrifying.', '47m', '2016-07-15', 'watched'),
(2, 1, 2, 'Chapter Two: The Weirdo on Maple Street', 'Lucas, Mike and Dustin try to talk to the girl they found in the woods.', '55m', '2016-07-15', 'watched'),
(2, 1, 3, 'Chapter Three: Holly, Jolly', 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan''s been up to.', '51m', '2016-07-15', 'unwatched');
