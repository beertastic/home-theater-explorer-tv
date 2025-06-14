import React, { forwardRef } from 'react';
import { Play, Star, Clock, Calendar, Plus, Eye, EyeOff, PlayCircle } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  showDateAdded?: boolean;
  onToggleFavorite: (id: string) => void;
  isFocused?: boolean;
}

const MediaCard = forwardRef<HTMLDivElement, MediaCardProps>(({ 
  media, 
  onClick, 
  showDateAdded = false, 
  onToggleFavorite,
  isFocused = false 
}, ref) => {
  const formatDateAdded = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Added today';
    if (diffDays <= 7) return `Added ${diffDays} days ago`;
    if (diffDays <= 30) return `Added ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Added ${date.toLocaleDateString()}`;
  };

  const getWatchStatusBadge = () => {
    switch (media.watchStatus) {
      case 'watched':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white flex items-center gap-1">
            <Eye className="h-3 w-3" />
            WATCHED
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white flex items-center gap-1">
            <PlayCircle className="h-3 w-3" />
            IN PROGRESS
          </span>
        );
      default:
        return null;
    }
  };

  const getPlaceholderImage = () => {
    const colors = ['334155', '475569', '64748b', '6366f1', '8b5cf6', 'ef4444', 'f59e0b', '10b981'];
    const colorIndex = Math.abs(media.title.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
    const color = colors[colorIndex];
    return `https://via.placeholder.com/300x450/${color}/ffffff?text=${encodeURIComponent(media.title.substring(0, 20))}`;
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 outline-none",
        isFocused && "ring-4 ring-blue-400/60 ring-offset-2 ring-offset-slate-900 scale-105 z-20"
      )}
      tabIndex={isFocused ? 0 : -1}
      role="button"
      aria-label={`Play ${media.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        <img
          src={media.thumbnail || getPlaceholderImage()}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== getPlaceholderImage()) {
              target.src = getPlaceholderImage();
            }
          }}
        />
        
        {/* Progress bar for in-progress items */}
        {media.watchStatus === 'in-progress' && media.progress?.progressPercent && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 z-20">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${media.progress.progressPercent}%` }}
            />
          </div>
        )}
        
        {/* Play overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20",
          isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className="bg-blue-600 rounded-full p-4 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-8 w-8 text-white fill-current" />
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            media.type === 'movie' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {media.type === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>

        {/* Watch status or Recently added badge */}
        <div className="absolute top-3 left-3 z-20">
          {showDateAdded ? (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-600 text-white flex items-center gap-1">
              <Plus className="h-3 w-3" />
              NEW
            </span>
          ) : (
            getWatchStatusBadge()
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">
            {media.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            {showDateAdded ? (
              <>
                <Plus className="h-3 w-3" />
                <span>{formatDateAdded(media.dateAdded)}</span>
              </>
            ) : media.watchStatus === 'in-progress' && media.progress ? (
              <>
                <PlayCircle className="h-3 w-3" />
                <span>
                  {media.type === 'tv' 
                    ? `Ep ${media.progress.currentEpisode}/${media.progress.totalEpisodes}`
                    : `${media.progress.progressPercent}%`
                  }
                </span>
              </>
            ) : (
              <>
                <Calendar className="h-3 w-3" />
                <span>{media.year}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current ml-2" />
                <span>{media.rating}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
