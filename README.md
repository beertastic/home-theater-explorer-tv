# Media Center - Personal Media Library

A modern, keyboard-navigable media center built with React, designed for NAS deployment and 10-foot UI experiences.

## Project Info

**URL**: https://lovable.dev/projects/49cdfc12-4339-4e44-bb3b-1a9adbf467b6

## Features

- 🎬 Modern media browser with grid layout
- ⌨️ Full keyboard navigation (arrow keys, Enter to select)
- 📱 Responsive design for all screen sizes
- 🎯 10-foot UI optimized for TV/remote control
- 🔍 Search and filter functionality
- 📊 Watch progress tracking
- 🎲 Random movie selection
- 🔄 Automatic media library scanning
- 📝 Metadata verification with TMDB integration

## Development Setup

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Local Development
```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

### Edit Options
- **Use Lovable**: Visit the [Lovable Project](https://lovable.dev/projects/49cdfc12-4339-4e44-bb3b-1a9adbf467b6)
- **Use your IDE**: Clone and push changes to sync with Lovable
- **GitHub Codespaces**: Launch directly from the repository
- **Direct GitHub editing**: Edit files through the web interface

## Production Deployment on Raspberry Pi

### Hardware Requirements
- **Raspberry Pi 4** (4GB+ RAM recommended)
- **MicroSD card** (32GB+ Class 10 or better)
- **External storage** for media files (USB drive or NAS)
- **Network connection** (Ethernet recommended for stability)

### Software Installation

#### 1. Prepare Raspberry Pi
```bash
# Flash Raspberry Pi OS Lite to SD card
# Enable SSH and configure WiFi/Ethernet during setup

# Update system
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Core Services
```bash
# Install Apache web server
sudo apt install apache2 -y

# Install MySQL server
sudo apt install mysql-server -y

# Install Node.js (for backend API)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PHP (optional, for phpMyAdmin)
sudo apt install php php-mysql -y
```

#### 3. Configure MySQL Database
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

Execute in MySQL:
```sql
CREATE DATABASE media_center;
CREATE USER 'media_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON media_center.* TO 'media_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import database schema:
```bash
mysql -u media_user -p media_center < database/mysql-schema.sql
```

#### 4. Deploy Backend API
```bash
# Copy backend files to Pi
scp -r backend/ pi@your-pi-ip:/home/pi/media-center-api/

# Install dependencies
cd /home/pi/media-center-api
npm install

# Configure environment
cp .env.example .env
nano .env
```

Update `.env` configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=media_user
DB_PASSWORD=your_secure_password
DB_NAME=media_center
DB_PORT=3306

# TMDB API (get from https://www.themoviedb.org/settings/api)
TMDB_API_KEY=your_tmdb_api_key

# Server Configuration
PORT=3001
NODE_ENV=production

# Media Library Path
MEDIA_LIBRARY_PATH=/media/library
```

#### 5. Deploy Frontend
```bash
# Build React app (on development machine)
npm run build

# Copy to Pi web directory
scp -r dist/ pi@your-pi-ip:/var/www/html/media-center/
```

#### 6. Configure Apache
Create virtual host:
```bash
sudo nano /etc/apache2/sites-available/media-center.conf
```

Add configuration:
```apache
<VirtualHost *:80>
    ServerName your-pi-ip
    DocumentRoot /var/www/html/media-center
    
    # Serve React frontend
    <Directory /var/www/html/media-center>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
    
    # Proxy API requests to Node.js backend
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
</VirtualHost>
```

Enable site and modules:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2ensite media-center.conf
sudo a2dissite 000-default
sudo systemctl restart apache2
```

#### 7. Set Up Media Storage
```bash
# Create media directories
sudo mkdir -p /media/library/{movies,tv-shows}
sudo chown -R pi:pi /media/

# For NAS mounting (optional)
sudo mkdir /mnt/nas
# Add to /etc/fstab for permanent mounting:
# //nas-ip/media /mnt/nas cifs username=user,password=pass,uid=pi,gid=pi 0 0
```

Recommended directory structure:
```
/media/library/
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

#### 8. Set Up Automated Library Scanning

Create a library scan script:
```bash
sudo nano /home/pi/scan-media-library.sh
```

Add the script content:
```bash
#!/bin/bash

# Media Library Scanner Script
# Logs to /var/log/media-scanner.log

LOG_FILE="/var/log/media-scanner.log"
API_URL="http://localhost:3001/api"

echo "$(date): Starting media library scan..." >> $LOG_FILE

# Option 1: Call API endpoint (if you have a scan endpoint)
# curl -X POST "$API_URL/media/scan" >> $LOG_FILE 2>&1

# Option 2: Use Node.js script to scan filesystem
cd /home/pi/media-center-api
/usr/bin/node -e "
const fs = require('fs');
const path = require('path');
const mediaPath = process.env.MEDIA_LIBRARY_PATH || '/media';

console.log('Scanning media library at:', mediaPath);
// Add your scanning logic here
" >> $LOG_FILE 2>&1

echo "$(date): Media library scan completed." >> $LOG_FILE
```

Make it executable:
```bash
chmod +x /home/pi/scan-media-library.sh
```

Set up cron job to run every 6 hours:
```bash
crontab -e
```

Add this line:
```bash
# Run media library scan every 6 hours
0 */6 * * * /home/pi/scan-media-library.sh
```

Alternative: For specific times (6 AM, 12 PM, 6 PM, 12 AM):
```bash
0 6,12,18,0 * * * /home/pi/scan-media-library.sh
```

Check cron job status:
```bash
# Check if cron service is running
sudo systemctl status cron

# View cron logs
sudo tail -f /var/log/cron.log

# View your custom scan log
tail -f /var/log/media-scanner.log
```

#### 9. Create System Service
```bash
sudo nano /etc/systemd/system/media-center-api.service
```

Add service configuration:
```ini
[Unit]
Description=Media Center API
After=network.target mysql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/media-center-api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl enable media-center-api
sudo systemctl start media-center-api
sudo systemctl status media-center-api
```

#### 10. Configure Firewall (Optional)
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (if using SSL)
sudo ufw enable
```

### Access Your Media Center

1. Open browser and navigate to `http://your-pi-ip`
2. Use arrow keys to navigate, Enter to select
3. Access from any device on your network

## Optional Enhancements

### SSL Certificate (HTTPS)
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com
```

### Automatic Backups
```bash
# Create backup script
sudo nano /home/pi/backup-media-db.sh
```

```bash
#!/bin/bash
mysqldump -u media_user -p'your_password' media_center > /backup/media_center_$(date +%Y%m%d).sql
find /backup -name "media_center_*.sql" -mtime +7 -delete
```

### Performance Tuning
```bash
# Increase PHP memory limit (if using)
sudo nano /etc/php/7.4/apache2/php.ini
# memory_limit = 256M

# MySQL optimization
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# innodb_buffer_pool_size = 256M
```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Web Server**: Apache
- **Build Tool**: Vite

## API Endpoints

- `GET /api/media` - Get all media (with pagination, filtering)
- `GET /api/media/:id` - Get single media item with episodes
- `PUT /api/media/:id/watch-status` - Update watch status
- `PUT /api/episodes/:id/watch-status` - Update episode watch status
- `GET /api/media/random?genre=Action&limit=3` - Get random movies
- `GET /api/genres` - Get all genres
- `GET /api/tmdb/search?query=matrix&type=movie` - Search TMDB
- `POST /api/media/add-from-tmdb` - Add media from TMDB

## Keyboard Navigation

- **Arrow Keys**: Navigate between items
- **Enter**: Select/open item
- **Escape**: Close modals/go back
- **Tab**: Switch between sections
- **Space**: Toggle play/pause (in video player)

## Troubleshooting

### Common Issues

1. **API not accessible**: Check if Node.js service is running
   ```bash
   sudo systemctl status media-center-api
   sudo journalctl -u media-center-api -f
   ```

2. **Database connection issues**: Verify MySQL credentials
   ```bash
   mysql -u media_user -p media_center
   ```

3. **Media files not showing**: Check file permissions
   ```bash
   sudo chown -R pi:pi /media/library
   ```

4. **Apache not serving files**: Check virtual host configuration
   ```bash
   sudo apache2ctl configtest
   sudo systemctl status apache2
   ```

## Custom Domain Setup

To connect a custom domain:
1. Point your domain's DNS to your Pi's IP address
2. Update Apache virtual host configuration
3. Configure SSL certificate with Let's Encrypt

## Deployment

For production deployment outside of Raspberry Pi, the built React app can be deployed to any static hosting service, while the backend API can be deployed to services like Heroku, DigitalOcean, or AWS.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
