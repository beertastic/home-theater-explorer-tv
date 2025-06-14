import React, { useState } from 'react';
import { Heart, Calendar, Clock } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { format, parseISO, isAfter } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ComingSoonProps {
  mediaData: MediaItem[];
  onToggleFavorite: (id: string) => void;
}

const ComingSoon = ({ mediaData, onToggleFavorite }: ComingSoonProps) => {
  const [showRemoveFavoriteDialog, setShowRemoveFavoriteDialog] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState<string>('');
  const [selectedShowTitle, setSelectedShowTitle] = useState<string>('');

  // Get favorite TV shows with upcoming episodes
  const upcomingShows = mediaData
    .filter(item => {
      console.log(`Checking item: ${item.title}, type: ${item.type}, isFavorite: ${item.isFavorite}, nextEpisodeDate: ${item.nextEpisodeDate}`);
      return item.type === 'tv' && 
             item.isFavorite && 
             item.nextEpisodeDate &&
             isAfter(parseISO(item.nextEpisodeDate), new Date());
    })
    .sort((a, b) => 
      parseISO(a.nextEpisodeDate!).getTime() - parseISO(b.nextEpisodeDate!).getTime()
    )
    .slice(0, 8); // Show max 8 shows

  console.log(`Found ${upcomingShows.length} upcoming shows:`, upcomingShows.map(s => s.title));

  const handleFavoriteClick = (showId: string, showTitle: string, isFavorite: boolean) => {
    if (isFavorite) {
      setSelectedShowId(showId);
      setSelectedShowTitle(showTitle);
      setShowRemoveFavoriteDialog(true);
    } else {
      onToggleFavorite(showId);
    }
  };

  const handleConfirmRemoveFavorite = () => {
    onToggleFavorite(selectedShowId);
    setShowRemoveFavoriteDialog(false);
    setSelectedShowId('');
    setSelectedShowTitle('');
  };

  if (upcomingShows.length === 0) {
    console.log('No upcoming shows found, not rendering Coming Soon section');
    return null;
  }

  return (
    <div className="mb-8 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-current" />
          <h2 className="text-xl font-bold text-white">Coming Soon</h2>
        </div>
        <div className="text-sm text-gray-400">Favorite shows with upcoming episodes</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {upcomingShows.map((show) => (
          <div key={show.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 hover:bg-slate-700/50 transition-colors">
            <img
              src={show.thumbnail}
              alt={show.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{show.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{format(parseISO(show.nextEpisodeDate!), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <button
              onClick={() => handleFavoriteClick(show.id, show.title, show.isFavorite)}
              className="p-1 hover:bg-slate-600 rounded transition-colors"
            >
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            </button>
          </div>
        ))}
      </div>

      <AlertDialog open={showRemoveFavoriteDialog} onOpenChange={setShowRemoveFavoriteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedShowTitle}" from your favorites? This action cannot be undone.
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
