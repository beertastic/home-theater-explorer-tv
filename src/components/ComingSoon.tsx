import React, { useState } from 'react';
import { Star, Calendar, Clock, Play, Download, Trash2, X, Tv, AlertTriangle } from 'lucide-react';
import MediaVerificationStatus from './MediaVerificationStatus';
import VideoPlayer from './VideoPlayer';
import { MediaItem } from '@/types/media';
import { useLocalDownloads } from '@/hooks/useLocalDownloads';
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
  isUsingMockData?: boolean;
}

const ComingSoon = ({ mediaData, onToggleFavorite, isUsingMockData = false }: ComingSoonProps) => {
  const [showRemoveFavoriteDialog, setShowRemoveFavoriteDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState<MediaItem | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const { hasLocalCopy, startDownload, deleteLocalFile, getDownloadProgress, cancelDownload } = useLocalDownloads();

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

  const handlePlayClick = (media: MediaItem) => {
    setPlayingMedia(media);
  };

  const handleDownload = (media: MediaItem) => {
    const downloadUrl = isUsingMockData 
      ? `http://192.168.1.94:3001/api/media/stream/${encodeURIComponent(media.filePath || media.id)}`
      : `http://192.168.1.94:3001/api/media/stream/${media.id}`;
    startDownload(media.id, media.title, downloadUrl);
  };

  const handleRemoveDownload = (media: MediaItem) => {
    setMediaToDelete(media);
    setShowDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (mediaToDelete) {
      deleteLocalFile(mediaToDelete.id);
    }
    setShowDeleteConfirmDialog(false);
    setMediaToDelete(null);
  };

  const handleCancelDownload = (media: MediaItem) => {
    cancelDownload(media.id);
  };

  const getNewlyAddedMedia = () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // Show items added in the last 30 days
    
    return mediaData.filter(media => {
      // Only show unwatched or in-progress media
      if (media.watchStatus === 'watched') return false;
      
      const dateAdded = new Date(media.dateAdded);
      return dateAdded >= cutoff;
    }).sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  };

  const getUpcomingMedia = () => {
    const today = new Date();
    return mediaData.filter(media => {
      if (!media.nextEpisodeDate) return false;
      if (media.watchStatus === 'watched') return false;
      const nextAirDate = new Date(media.nextEpisodeDate);
      return nextAirDate >= today;
    }).sort((a, b) => new Date(a.nextEpisodeDate!).getTime() - new Date(b.nextEpisodeDate!).getTime());
  };

  const getRecentlyAddedMedia = () => {
    const newlyAddedMedia = getNewlyAddedMedia();
    const upcomingMedia = getUpcomingMedia();
    
    // Prioritize newly added, then upcoming
    const combined = [...newlyAddedMedia];
    
    // Add upcoming media if we don't have enough newly added
    if (combined.length < 6) {
      const remainingSlots = 6 - combined.length;
      const upcomingToAdd = upcomingMedia.slice(0, remainingSlots);
      combined.push(...upcomingToAdd);
    }
    
    return combined.slice(0, 6);
  };

  const getSeasonEpisodeInfo = (media: MediaItem) => {
    if (media.type !== 'tv' || !media.progress) return null;
    
    const currentEpisode = media.progress.currentEpisode || 1;
    const season = Math.floor((currentEpisode - 1) / 12) + 1;
    const episodeInSeason = ((currentEpisode - 1) % 12) + 1;
    
    return {
      season: season,
      episode: episodeInSeason + 1
    };
  };

  const getVideoUrl = (media: MediaItem) => {
    if (isUsingMockData && media.filePath) {
      // For mock data, try the file path first
      return `http://192.168.1.94:3001/api/media/stream/${encodeURIComponent(media.filePath)}`;
    }
    // For real API data, use the streaming endpoint
    return `http://192.168.1.94:3001/api/media/stream/${media.id}`;
  };

  const recentMedia = getRecentlyAddedMedia();

  // Don't show the section if there's no recent media
  if (recentMedia.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Recently Added</h2>
          <p className="text-gray-400">New additions to your library</p>
          {isUsingMockData && (
            <div className="flex items-center gap-2 mt-2 text-yellow-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Using demo data - API server not available</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {recentMedia.map((media) => {
          const isNew = getNewlyAddedMedia().some(newMedia => newMedia.id === media.id);
          const hasDownload = hasLocalCopy(media.id);
          const downloadProgress = getDownloadProgress(media.id);
          const seasonEpisodeInfo = getSeasonEpisodeInfo(media);
          
          return (
            <div key={media.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors">
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg truncate">{media.title}</h3>
                
                {media.type === 'tv' && media.nextEpisodeName && (
                  <div className="flex items-center gap-1 text-blue-300 text-sm mt-1">
                    <Tv className="h-3 w-3" />
                    <span className="truncate">
                      {seasonEpisodeInfo && (
                        <span className="text-gray-400 mr-2">
                          S{seasonEpisodeInfo.season.toString().padStart(2, '0')} E{seasonEpisodeInfo.episode.toString().padStart(2, '0')}
                        </span>
                      )}
                      {media.nextEpisodeName}
                    </span>
                  </div>
                )}
                
                <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                  {isNew ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Added {new Date(media.dateAdded).toLocaleDateString()}
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      {media.nextEpisodeDate ? new Date(media.nextEpisodeDate).toLocaleDateString() : 'No upcoming episodes'}
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                    isNew ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {isNew ? 'RECENTLY ADDED' : 'UPCOMING'}
                  </span>
                  {!isUsingMockData && <MediaVerificationStatus mediaId={media.id} />}
                  {hasDownload && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-700 text-white">
                      DOWNLOADED
                    </span>
                  )}
                  {downloadProgress && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-600 text-white">
                      {downloadProgress.progress}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFavoriteClick(media)}
                  className="p-2 bg-slate-700 hover:bg-blue-600 text-white rounded-full transition-colors"
                >
                  <Star className={`h-5 w-5 ${media.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                
                {hasDownload ? (
                  <button
                    onClick={() => handleRemoveDownload(media)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    title="Remove download"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                ) : downloadProgress ? (
                  <button
                    onClick={() => handleCancelDownload(media)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    title="Cancel download"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownload(media)}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                    title="Download for offline viewing"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
                
                <button 
                  onClick={() => handlePlayClick(media)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                >
                  <Play className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Player */}
      {playingMedia && (
        <VideoPlayer
          src={getVideoUrl(playingMedia)}
          title={playingMedia.title}
          onClose={() => setPlayingMedia(null)}
        />
      )}

      {/* Remove Favorite Confirmation Dialog */}
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

      {/* Delete Download Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Download?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{mediaToDelete?.title}" from your downloads? This will free up storage space but you'll need to download it again to watch offline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ComingSoon;
