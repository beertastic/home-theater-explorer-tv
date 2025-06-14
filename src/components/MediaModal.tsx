import React from 'react';
import { X, Play, Star, Calendar, Clock, Tag, Plus, Eye, EyeOff, PlayCircle, Monitor, Volume2, Subtitles } from 'lucide-react';
import { MediaItem } from '@/types/media';
import EpisodeList from './EpisodeList';

interface MediaModalProps {
  media: MediaItem;
  onClose: () => void;
  onUpdateWatchStatus: (id: string, status: 'unwatched' | 'in-progress' | 'watched') => void;
  onUpdateEpisodeStatus?: (mediaId: string, episodeId: string, status: 'watched' | 'unwatched') => void;
}

const MediaModal = ({ media, onClose, onUpdateWatchStatus, onUpdateEpisodeStatus }: MediaModalProps) => {
  const formatDateAdded = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatLastWatched = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getWatchStatusColor = (status: string) => {
    switch (status) {
      case 'watched': return 'bg-green-600';
      case 'in-progress': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const handleEpisodeStatusUpdate = (episodeId: string, status: 'watched' | 'unwatched') => {
    if (onUpdateEpisodeStatus) {
      onUpdateEpisodeStatus(media.id, episodeId, status);
    }
  };

  const getSubtitleLanguages = (codes: string[]) => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };
    
    return codes.map(code => languageNames[code] || code).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with backdrop */}
        <div className="relative">
          <div className="aspect-video bg-slate-800 rounded-t-2xl overflow-hidden">
            <img
              src={media.backdrop}
              alt={media.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/800x450/334155/ffffff?text=${encodeURIComponent(media.title)}`;
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
          <button className="absolute bottom-6 left-6 bg-blue-600 hover:bg-blue-700 rounded-full p-4 transition-colors shadow-lg">
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

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="lg:w-1/3">
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-full rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/300x450/334155/ffffff?text=${encodeURIComponent(media.title)}`;
                }}
              />
            </div>

            {/* Info */}
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-bold text-white mb-4">{media.title}</h1>
              
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  {media.watchStatus === 'in-progress' ? 'Continue Watching' : 'Play Now'}
                </button>
                
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
          </div>

          {/* Episode List for TV Shows */}
          {media.type === 'tv' && media.episodes && (
            <EpisodeList 
              episodes={media.episodes} 
              onUpdateEpisodeStatus={handleEpisodeStatusUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
