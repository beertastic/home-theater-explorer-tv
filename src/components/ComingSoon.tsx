import React, { useState } from 'react';
import { Star, Calendar, Clock, Play } from 'lucide-react';
import MediaVerificationStatus from './MediaVerificationStatus';
import { MediaItem } from '@/types/media';
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

interface ComingSoonProps {
  mediaData: MediaItem[];
  onToggleFavorite: (id: string) => void;
}

const ComingSoon = ({ mediaData, onToggleFavorite }: ComingSoonProps) => {
  const [showRemoveFavoriteDialog, setShowRemoveFavoriteDialog] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState<MediaItem | null>(null);

  const handleFavoriteClick = (media: MediaItem) => {
    if (media.isFavorite) {
      setMediaToRemove(media);
      setShowRemoveFavoriteDialog(true);
    } else {
      onToggleFavorite(media.id);
    }
  };

  const handleConfirmRemoveFavorite = () => {
    if (mediaToRemove) {
      onToggleFavorite(mediaToRemove.id);
    }
    setShowRemoveFavoriteDialog(false);
    setMediaToRemove(null);
  };

  const getUpcomingMedia = () => {
    const today = new Date();
    return mediaData.filter(media => {
      if (!media.nextEpisodeDate) return false;
      const nextAirDate = new Date(media.nextEpisodeDate);
      return nextAirDate >= today;
    }).sort((a, b) => new Date(b.nextEpisodeDate!).getTime() - new Date(a.nextEpisodeDate!).getTime());
  };

  const getNewlyAddedMedia = () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7); // Consider media added in the last 7 days as "new"
    return mediaData.filter(media => new Date(media.dateAdded) >= cutoff)
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  };

  const getAllSortedMedia = () => {
    const newlyAddedMedia = getNewlyAddedMedia();
    const upcomingMedia = getUpcomingMedia();
    
    // Combine new media first, then upcoming media
    return [...newlyAddedMedia, ...upcomingMedia];
  };

  const sortedMedia = getAllSortedMedia();

  if (sortedMedia.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Coming Soon & New Arrivals</h2>
          <p className="text-gray-400">Stay up to date with upcoming releases and recent additions</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedMedia.map((media) => {
          const isNew = getNewlyAddedMedia().some(newMedia => newMedia.id === media.id);
          
          return (
            <div key={media.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors">
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg truncate">{media.title}</h3>
                <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                  {isNew ? (
                    <>
                      <Clock className="h-4 w-4" />
                      {media.duration}
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      {new Date(media.nextEpisodeDate!).toLocaleDateString()}
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                    isNew ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {isNew ? 'NEW' : 'UPCOMING'}
                  </span>
                  <MediaVerificationStatus mediaId={media.id} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFavoriteClick(media)}
                  className="p-2 bg-slate-700 hover:bg-blue-600 text-white rounded-full transition-colors"
                >
                  <Star className={`h-5 w-5 ${media.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                  <Play className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showRemoveFavoriteDialog} onOpenChange={setShowRemoveFavoriteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{mediaToRemove?.title}" from your favorites? This action cannot be undone.
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

export default ComingSoon;
