import React, { forwardRef, useState } from 'react';
import { Play, Heart, Calendar, Star, Eye, EyeOff } from 'lucide-react';
import { MediaItem } from '@/types/media';
import MediaVerificationStatus from './MediaVerificationStatus';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  showDateAdded: boolean;
  onToggleFavorite: (id: string) => void;
  isFocused?: boolean;
}

const MediaCard = forwardRef<HTMLDivElement, MediaCardProps>(
  ({ media, onClick, showDateAdded, onToggleFavorite, isFocused = false }, ref) => {
    const [showRemoveFavoriteDialog, setShowRemoveFavoriteDialog] = useState(false);

    const getPlaceholderImage = (width: number, height: number, text: string) => {
      const colors = ['334155', '475569', '64748b', '6366f1', '8b5cf6', 'ef4444', 'f59e0b', '10b981'];
      const colorIndex = Math.abs(text.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
      const color = colors[colorIndex];
      return `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${encodeURIComponent(text.substring(0, 20))}`;
    };

    const formatDateAdded = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    const getWatchStatusIcon = (status: string) => {
      switch (status) {
        case 'watched':
          return <Eye className="h-4 w-4 text-green-400" />;
        case 'in-progress':
          return <Play className="h-4 w-4 text-blue-400 fill-current" />;
        default:
          return <EyeOff className="h-4 w-4 text-gray-400" />;
      }
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (media.isFavorite) {
        setShowRemoveFavoriteDialog(true);
      } else {
        onToggleFavorite(media.id);
      }
    };

    const handleConfirmRemoveFavorite = () => {
      onToggleFavorite(media.id);
      setShowRemoveFavoriteDialog(false);
    };

    return (
      <>
        <div
          ref={ref}
          className={`group bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:bg-slate-700 hover:scale-105 hover:shadow-2xl cursor-pointer ${
            isFocused ? 'ring-2 ring-blue-400 scale-105' : ''
          }`}
          onClick={onClick}
        >
          {/* Poster Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={media.thumbnail || getPlaceholderImage(300, 450, media.title)}
              alt={media.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const placeholder = getPlaceholderImage(300, 450, media.title);
                if (target.src !== placeholder) {
                  target.src = placeholder;
                }
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Play className="h-12 w-12 text-white fill-current drop-shadow-lg" />
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
            >
              <Heart className={`h-4 w-4 ${media.isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} />
            </button>

            {/* Watch Status */}
            <div className="absolute top-3 left-3 p-2 bg-black/50 rounded-full">
              {getWatchStatusIcon(media.watchStatus)}
            </div>

            {/* Rating */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full text-sm">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-white font-medium">{media.rating}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
              {media.title}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{media.year}</span>
              <span className="capitalize">{media.type}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
              <span>{media.duration}</span>
              <span>{media.genre.slice(0, 2).join(', ')}</span>
            </div>

            {/* Verification Status */}
            <div className="mb-3">
              <MediaVerificationStatus mediaId={media.id} />
            </div>

            {showDateAdded && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Added {formatDateAdded(media.dateAdded)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Remove Favorite Confirmation Dialog */}
        <AlertDialog open={showRemoveFavoriteDialog} onOpenChange={setShowRemoveFavoriteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Favorites</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{media.title}" from your favorites? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRemoveFavorite}>
                Remove from Favorites
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

MediaCard.displayName = 'MediaCard';

export default MediaCard;
