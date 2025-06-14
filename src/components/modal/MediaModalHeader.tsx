
import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { MediaItem } from '@/types/media';
import VideoPlayer from '../VideoPlayer';

interface MediaModalHeaderProps {
  media: MediaItem;
  onClose: () => void;
  getPlaceholderImage: (width: number, height: number, text: string) => string;
}

const MediaModalHeader = ({ media, onClose, getPlaceholderImage }: MediaModalHeaderProps) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Sample video URL - in a real app, this would come from your media item
  const getVideoUrl = () => {
    // Using a sample video for demonstration
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  };

  const handlePlayClick = () => {
    setShowVideoPlayer(true);
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

        {/* Play button */}
        <button 
          onClick={handlePlayClick}
          className="absolute bottom-6 left-6 bg-blue-600 hover:bg-blue-700 rounded-full p-4 transition-colors shadow-lg"
        >
          <Play className="h-8 w-8 text-white fill-current" />
        </button>

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
