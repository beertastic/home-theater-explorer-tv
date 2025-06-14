
import React, { useState, useMemo } from 'react';
import { Heart, Calendar, Clock, Plus } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { format, parseISO, isAfter, isWithinInterval, subDays } from 'date-fns';
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

  // Memoize the expensive filtering operation to prevent unnecessary re-renders
  const { upcomingShows, recentShows } = useMemo(() => {
    const now = new Date();
    const twoDaysAgo = subDays(now, 2);

    // Get upcoming episodes from favorite TV shows
    const upcoming = mediaData
      .filter(item => {
        return item.type === 'tv' && 
               item.isFavorite && 
               item.nextEpisodeDate &&
               isAfter(parseISO(item.nextEpisodeDate), now);
      })
      .sort((a, b) => 
        parseISO(a.nextEpisodeDate!).getTime() - parseISO(b.nextEpisodeDate!).getTime()
      )
      .slice(0, 4); // Show max 4 upcoming shows

    // Get recently added shows (last 2 days)
    const recent = mediaData
      .filter(item => {
        const dateAdded = parseISO(item.dateAdded);
        return isWithinInterval(dateAdded, { start: twoDaysAgo, end: now });
      })
      .sort((a, b) => 
        parseISO(b.dateAdded).getTime() - parseISO(a.dateAdded).getTime()
      )
      .slice(0, 4); // Show max 4 recent shows

    return { upcomingShows: upcoming, recentShows: recent };
  }, [mediaData]);

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

  const allItems = [...recentShows.map(item => ({ ...item, isRecent: true })), ...upcomingShows.map(item => ({ ...item, isRecent: false }))];

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-current" />
          <h2 className="text-xl font-bold text-white">Coming Soon & New Arrivals</h2>
        </div>
        <div className="text-sm text-gray-400">Recent additions and upcoming episodes</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allItems.map((item) => (
          <div 
            key={`${item.id}-${item.isRecent ? 'recent' : 'upcoming'}`} 
            className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
              item.isRecent 
                ? 'bg-slate-800/50 hover:bg-slate-700/50' 
                : 'bg-slate-800/20 hover:bg-slate-700/30 opacity-70'
            }`}
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold truncate ${item.isRecent ? 'text-white' : 'text-gray-300'}`}>
                {item.title}
              </h3>
              <div className={`flex items-center gap-2 text-sm ${item.isRecent ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.isRecent ? (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>Added {format(parseISO(item.dateAdded), 'MMM d')}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-3 w-3" />
                    <span>{format(parseISO(item.nextEpisodeDate!), 'MMM d, yyyy')}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.isRecent && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                  NEW
                </span>
              )}
              {!item.isRecent && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-600 text-gray-300">
                  SOON
                </span>
              )}
              {item.isFavorite && (
                <button
                  onClick={() => handleFavoriteClick(item.id, item.title, item.isFavorite)}
                  className="p-1 hover:bg-slate-600 rounded transition-colors"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </button>
              )}
            </div>
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
