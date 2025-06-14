import React, { useState } from 'react';
import { PlayCircle, ChevronDown, Monitor, ExternalLink } from 'lucide-react';
import { MediaItem } from '@/types/media';
import VideoPlayer from '../VideoPlayer';

interface MediaModalPlayButtonProps {
  media: MediaItem;
}

const MediaModalPlayButton = ({ media }: MediaModalPlayButtonProps) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showPlayOptions, setShowPlayOptions] = useState(false);

  const getVideoUrl = () => {
    // Try the streaming endpoint for the actual media file first
    if (media.filePath) {
      return `http://192.168.1.94:3001/api/media/stream/${encodeURIComponent(media.filePath)}`;
    }
    // Fallback to ID-based streaming
    return `http://192.168.1.94:3001/api/media/stream/${media.id}`;
  };

  const handlePlayInBrowser = () => {
    setShowVideoPlayer(true);
    setShowPlayOptions(false);
  };

  const handlePlayInExternal = () => {
    const videoUrl = getVideoUrl();
    
    // For local files, try to open the file path directly
    if (media.filePath) {
      const localFilePath = `file://${media.filePath}`;
      const vlcUrl = `vlc://${localFilePath}`;
      
      const link = document.createElement('a');
      link.href = vlcUrl;
      link.click();
      
      // Also try opening the file directly
      setTimeout(() => {
        const fileLink = document.createElement('a');
        fileLink.href = localFilePath;
        fileLink.click();
      }, 1000);
    } else {
      // Fallback for remote URLs
      const vlcUrl = `vlc://${videoUrl}`;
      
      const link = document.createElement('a');
      link.href = vlcUrl;
      link.click();
      
      setTimeout(() => {
        const fallbackLink = document.createElement('a');
        fallbackLink.href = videoUrl;
        fallbackLink.download = media.title;
        fallbackLink.click();
      }, 1000);
    }
    
    setShowPlayOptions(false);
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
  };

  return (
    <>
      <div className="relative">
        <div className="flex">
          <button 
            onClick={handlePlayInBrowser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-l-xl font-semibold transition-colors flex items-center gap-2"
          >
            <PlayCircle className="h-5 w-5 fill-current" />
            {media.watchStatus === 'in-progress' ? 'Continue Watching' : 'Play Now'}
          </button>
          
          <button
            onClick={() => setShowPlayOptions(!showPlayOptions)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-r-xl font-semibold transition-colors border-l border-blue-500"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {showPlayOptions && (
          <div className="absolute top-full left-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-600 min-w-64 z-10">
            <button
              onClick={handlePlayInBrowser}
              className="w-full px-4 py-3 text-left hover:bg-slate-700 rounded-t-lg transition-colors flex items-center gap-3 text-white"
            >
              <Monitor className="h-4 w-4 text-blue-400" />
              <div>
                <div className="font-medium">Play in Browser</div>
                <div className="text-xs text-gray-400">Built-in video player</div>
              </div>
            </button>
            <button
              onClick={handlePlayInExternal}
              className="w-full px-4 py-3 text-left hover:bg-slate-700 rounded-b-lg transition-colors flex items-center gap-3 text-white"
            >
              <ExternalLink className="h-4 w-4 text-green-400" />
              <div>
                <div className="font-medium">Open in External App</div>
                <div className="text-xs text-gray-400">VLC, MPC-HC, etc.</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {showVideoPlayer && (
        <VideoPlayer
          src={getVideoUrl()}
          title={media.title}
          onClose={handleCloseVideoPlayer}
        />
      )}
    </>
  );
};

export default MediaModalPlayButton;
