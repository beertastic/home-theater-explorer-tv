
import React, { useState } from 'react';
import { Calendar, Clock, Star, Plus, Tag, Monitor, Volume2, Subtitles, Eye, EyeOff, PlayCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { MediaItem } from '@/types/media';
import VideoPlayer from '../VideoPlayer';

interface MediaModalInfoProps {
  media: MediaItem;
  onUpdateWatchStatus: (id: string, status: 'unwatched' | 'in-progress' | 'watched') => void;
  getPlaceholderImage: (width: number, height: number, text: string) => string;
  formatDateAdded: (dateString: string) => string;
  formatLastWatched: (dateString: string) => string;
  getWatchStatusColor: (status: string) => string;
  getSubtitleLanguages: (codes: string[]) => string;
}

const MediaModalInfo = ({ 
  media, 
  onUpdateWatchStatus, 
  getPlaceholderImage,
  formatDateAdded,
  formatLastWatched,
  getWatchStatusColor,
  getSubtitleLanguages
}: MediaModalInfoProps) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showPlayOptions, setShowPlayOptions] = useState(false);

  // Sample video URL - in a real app, this would come from your media item
  const getVideoUrl = () => {
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
      <div className="lg:w-2/3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-white">{media.title}</h1>
        </div>
        
        {/* Watch Status */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <span className={`px-4 py-2 text-sm font-semibold rounded-full text-white flex items-center gap-2 ${getWatchStatusColor(media.watchStatus)}`}>
              {media.watchStatus === 'watched' && <Eye className="h-4 w-4" />}
              {media.watchStatus === 'in-progress' && <PlayCircle className="h-4 w-4" />}
              {media.watchStatus === 'unwatched' && <EyeOff className="h-4 w-4" />}
              {media.watchStatus.charAt(0).toUpperCase() + media.watchStatus.slice(1).replace('-', ' ')}
            </span>
          </div>

          {/* Progress info for in-progress items */}
          {media.watchStatus === 'in-progress' && media.progress && (
            <div className="text-gray-300 text-sm">
              {media.type === 'tv' ? (
                <p>Episode {media.progress.currentEpisode} of {media.progress.totalEpisodes}</p>
              ) : (
                <p>{media.progress.progressPercent}% complete</p>
              )}
              {media.progress.lastWatched && (
                <p>Last watched {formatLastWatched(media.progress.lastWatched)}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-300">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{media.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{media.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span>{media.rating}/10</span>
          </div>
          <div className="flex items-center gap-1">
            <Plus className="h-4 w-4 text-orange-400" />
            <span>Added {formatDateAdded(media.dateAdded)}</span>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            media.type === 'movie' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {media.type === 'movie' ? 'Movie' : 'TV Show'}
          </span>
        </div>

        {/* Technical Info */}
        {media.technicalInfo && (
          <div className="mb-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Technical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Monitor className="h-4 w-4 text-blue-400" />
                <span>{media.technicalInfo.videoCodec} • {media.technicalInfo.resolution}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Volume2 className="h-4 w-4 text-green-400" />
                <span>{media.technicalInfo.audioFormat}</span>
              </div>
              {media.technicalInfo.subtitles.length > 0 && (
                <div className="flex items-center gap-2 text-gray-300 md:col-span-2">
                  <Subtitles className="h-4 w-4 text-yellow-400" />
                  <span>Subtitles: {getSubtitleLanguages(media.technicalInfo.subtitles)}</span>
                </div>
              )}
              {media.technicalInfo.fileSize && (
                <div className="text-gray-400">
                  Size: {media.technicalInfo.fileSize}
                </div>
              )}
              {media.technicalInfo.bitrate && (
                <div className="text-gray-400">
                  Bitrate: {media.technicalInfo.bitrate}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Genres */}
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-4 w-4 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {media.genre.map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-800 text-gray-300 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 leading-relaxed text-lg mb-8">{media.description}</p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4">
          {/* Play button with dropdown */}
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

            {/* Play options dropdown */}
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
          
          {/* Watch Status Controls */}
          <div className="flex gap-2">
            <button 
              onClick={() => onUpdateWatchStatus(media.id, 'unwatched')}
              className={`px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                media.watchStatus === 'unwatched' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
              }`}
            >
              <EyeOff className="h-4 w-4" />
              Unwatched
            </button>
            <button 
              onClick={() => onUpdateWatchStatus(media.id, 'watched')}
              className={`px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                media.watchStatus === 'watched' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
              }`}
            >
              <Eye className="h-4 w-4" />
              Watched
            </button>
          </div>
        </div>
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

export default MediaModalInfo;
