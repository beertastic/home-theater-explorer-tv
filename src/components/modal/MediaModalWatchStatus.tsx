
import React from 'react';
import { Eye, EyeOff, PlayCircle } from 'lucide-react';
import { MediaItem } from '@/types/media';

interface MediaModalWatchStatusProps {
  media: MediaItem;
  onUpdateWatchStatus: (id: string, status: 'unwatched' | 'in-progress' | 'watched') => void;
  getWatchStatusColor: (status: string) => string;
  formatLastWatched: (dateString: string) => string;
}

const MediaModalWatchStatus = ({ 
  media, 
  onUpdateWatchStatus, 
  getWatchStatusColor, 
  formatLastWatched 
}: MediaModalWatchStatusProps) => {
  return (
    <>
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
    </>
  );
};

export default MediaModalWatchStatus;
