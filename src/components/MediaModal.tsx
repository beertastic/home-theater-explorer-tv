
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { MediaItem } from '@/types/media';
import EpisodeList from './EpisodeList';
import MediaModalHeader from './modal/MediaModalHeader';
import MediaModalInfo from './modal/MediaModalInfo';
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

interface MediaModalProps {
  media: MediaItem;
  onClose: () => void;
  onUpdateWatchStatus: (id: string, status: 'unwatched' | 'in-progress' | 'watched') => void;
  onUpdateEpisodeStatus?: (mediaId: string, episodeId: string, status: 'watched' | 'unwatched') => void;
  onToggleFavorite: (id: string) => void;
}

const MediaModal = ({ media, onClose, onUpdateWatchStatus, onUpdateEpisodeStatus, onToggleFavorite }: MediaModalProps) => {
  const [showRemoveFavoriteDialog, setShowRemoveFavoriteDialog] = useState(false);

  const handleFavoriteClick = () => {
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

  // Generate placeholder images
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
        <MediaModalHeader 
          media={media}
          onClose={onClose}
          getPlaceholderImage={getPlaceholderImage}
        />

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="lg:w-1/3">
              <img
                src={media.thumbnail || getPlaceholderImage(300, 450, media.title)}
                alt={media.title}
                className="w-full rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const placeholder = getPlaceholderImage(300, 450, media.title);
                  if (target.src !== placeholder) {
                    target.src = placeholder;
                  }
                }}
              />
              
              {/* Favorite button */}
              <button
                onClick={handleFavoriteClick}
                className="w-full mt-4 p-2 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Heart className={`h-6 w-6 ${media.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                <span className="text-white">
                  {media.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </span>
              </button>
            </div>

            <MediaModalInfo 
              media={media}
              onUpdateWatchStatus={onUpdateWatchStatus}
              getPlaceholderImage={getPlaceholderImage}
              formatDateAdded={formatDateAdded}
              formatLastWatched={formatLastWatched}
              getWatchStatusColor={getWatchStatusColor}
              getSubtitleLanguages={getSubtitleLanguages}
            />
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showRemoveFavoriteDialog} onOpenChange={setShowRemoveFavoriteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{media.title}" from your favorites? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemoveFavorite}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MediaModal;
