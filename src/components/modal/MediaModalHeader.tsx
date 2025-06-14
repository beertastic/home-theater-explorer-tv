
import React, { useState } from 'react';
import { X, Play, ChevronDown, Monitor, ExternalLink } from 'lucide-react';
import { MediaItem } from '@/types/media';
import VideoPlayer from '../VideoPlayer';

interface MediaModalHeaderProps {
  media: MediaItem;
  onClose: () => void;
  getPlaceholderImage: (width: number, height: number, text: string) => string;
}

const MediaModalHeader = ({ media, onClose, getPlaceholderImage }: MediaModalHeaderProps) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showPlayOptions, setShowPlayOptions] = useState(false);

  // Sample video URL - in a real app, this would come from your media item
  const getVideoUrl = () => {
    // Using a sample video for demonstration
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  };

  const handlePlayInBrowser = () => {
    setShowVideoPlayer(true);
    setShowPlayOptions(false);
  };

  const handlePlayInExternal = () => {
    const videoUrl = getVideoUrl();
    // Try to open with VLC protocol first, fallback to direct download
    const vlcUrl = `vlc://${videoUrl}`;
    
    // Create a temporary link to trigger the external app
    const link = document.createElement('a');
    link.href = vlcUrl;
    link.click();
    
    // Fallback: also provide direct file access
    setTimeout(() => {
      const fallbackLink = document.createElement('a');
      fallbackLink.href = videoUrl;
      fallbackLink.download = media.title;
      fallbackLink.click();
    }, 1000);
    
    setShowPlayOptions(false);
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
  };

  return (
    <>
      <div className="relative">
        <div className="aspect-video bg-slate-800 rounded-t-2xl overflow-hidden">
          <img
            src={media.backdrop || getPlaceholderImage(800, 450, media.title)}
            alt={media.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const placeholder = getPlaceholderImage(800, 450, media.title);
              if (target.src !== placeholder) {
                target.src = placeholder;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Play button with options */}
        <div className="absolute bottom-6 left-6">
          <div className="relative">
            <div className="flex">
              <button 
                onClick={handlePlayInBrowser}
                className="bg-blue-600 hover:bg-blue-700 rounded-l-full px-6 py-4 transition-colors shadow-lg flex items-center gap-2"
              >
                <Play className="h-8 w-8 text-white fill-current" />
                <span className="text-white font-semibold">Play</span>
              </button>
              
              <button
                onClick={() => setShowPlayOptions(!showPlayOptions)}
                className="bg-blue-600 hover:bg-blue-700 rounded-r-full px-3 py-4 transition-colors shadow-lg border-l border-blue-500"
              >
                <ChevronDown className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Play options dropdown */}
            {showPlayOptions && (
              <div className="absolute top-full left-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-600 min-w-48 z-10">
                <button
                  onClick={handlePlayInBrowser}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 rounded-t-lg transition-colors flex items-center gap-3 text-white"
                >
                  <Monitor className="h-4 w-4 text-blue-400" />
                  Play in Browser
                </button>
                <button
                  onClick={handlePlayInExternal}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 rounded-b-lg transition-colors flex items-center gap-3 text-white"
                >
                  <ExternalLink className="h-4 w-4 text-green-400" />
                  Open in External App
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for in-progress items */}
        {media.watchStatus === 'in-progress' && media.progress?.progressPercent && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${media.progress.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Video Player */}
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

export default MediaModalHeader;
