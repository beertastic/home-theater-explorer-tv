
import { useToast } from '@/hooks/use-toast';
import { MediaItem } from '@/types/media';

interface UseMediaHandlersProps {
  mediaData: MediaItem[];
  setMediaData: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  selectedMedia: MediaItem | null;
  setSelectedMedia: React.Dispatch<React.SetStateAction<MediaItem | null>>;
  setIsScanning: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMediaScannerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useMediaHandlers = ({
  mediaData,
  setMediaData,
  selectedMedia,
  setSelectedMedia,
  setIsScanning,
  setIsMediaScannerOpen,
}: UseMediaHandlersProps) => {
  const { toast } = useToast();

  const handleRescan = async () => {
    setIsScanning(true);
    toast({
      title: "Updating library...",
      description: "Looking for new content on your NAS",
    });

    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Library update complete!",
        description: "Found 0 new items",
      });
    }, 3000);
  };

  const handleOpenScanner = () => {
    setIsMediaScannerOpen(true);
  };

  const handleScanComplete = (addedCount: number) => {
    setIsMediaScannerOpen(false);
    toast({
      title: "Library scan complete!",
      description: `Added ${addedCount} new items to your library`,
    });
  };

  const handleToggleFavorite = (id: string) => {
    setMediaData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    
    if (selectedMedia && selectedMedia.id === id) {
      setSelectedMedia(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }

    const item = mediaData.find(item => item.id === id);
    toast({
      title: item?.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${item?.title} ${item?.isFavorite ? 'removed from' : 'added to'} your favorites`,
    });
  };

  const handleUpdateWatchStatus = (id: string, status: 'unwatched' | 'in-progress' | 'watched') => {
    setMediaData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, watchStatus: status } : item
      )
    );
    
    if (selectedMedia && selectedMedia.id === id) {
      setSelectedMedia(prev => prev ? { ...prev, watchStatus: status } : null);
    }

    toast({
      title: "Watch status updated",
      description: `Marked as ${status.replace('-', ' ')}`,
    });
  };

  const handleUpdateEpisodeStatus = (mediaId: string, episodeId: string, status: 'watched' | 'unwatched') => {
    setMediaData(prevData => 
      prevData.map(item => {
        if (item.id === mediaId && item.episodes) {
          const updatedEpisodes = item.episodes.map(episode => 
            episode.id === episodeId ? { ...episode, watchStatus: status } : episode
          );
          
          const watchedCount = updatedEpisodes.filter(ep => ep.watchStatus === 'watched').length;
          const totalCount = updatedEpisodes.length;
          let newWatchStatus: 'unwatched' | 'in-progress' | 'watched';
          
          if (watchedCount === 0) {
            newWatchStatus = 'unwatched';
          } else if (watchedCount === totalCount) {
            newWatchStatus = 'watched';
          } else {
            newWatchStatus = 'in-progress';
          }
          
          return { 
            ...item, 
            episodes: updatedEpisodes,
            watchStatus: newWatchStatus,
            progress: newWatchStatus === 'in-progress' ? {
              ...item.progress,
              currentEpisode: watchedCount,
              totalEpisodes: totalCount,
              progressPercent: Math.round((watchedCount / totalCount) * 100)
            } : item.progress
          };
        }
        return item;
      })
    );
    
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(prev => {
        if (!prev || !prev.episodes) return prev;
        const updatedEpisodes = prev.episodes.map(episode => 
          episode.id === episodeId ? { ...episode, watchStatus: status } : episode
        );
        return { ...prev, episodes: updatedEpisodes };
      });
    }

    toast({
      title: "Episode status updated",
      description: `Episode marked as ${status}`,
    });
  };

  const handleUpdateMetadata = (mediaId: string, newMetadata: any) => {
    setMediaData(prevData => 
      prevData.map(item => 
        item.id === mediaId ? { ...item, ...newMetadata } : item
      )
    );
    
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(prev => prev ? { ...prev, ...newMetadata } : null);
    }

    toast({
      title: "Metadata updated",
      description: `Updated metadata for ${newMetadata.title}`,
    });
  };

  return {
    handleRescan,
    handleOpenScanner,
    handleScanComplete,
    handleToggleFavorite,
    handleUpdateWatchStatus,
    handleUpdateEpisodeStatus,
    handleUpdateMetadata,
  };
};
