import React, { useState } from 'react';
import { Heart, Edit3, Download, Play, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { useLocalDownloads } from '@/hooks/useLocalDownloads';
import EpisodeList from './EpisodeList';
import MediaModalHeader from './modal/MediaModalHeader';
import MediaModalInfo from './modal/MediaModalInfo';
import MediaVerificationStatus from './MediaVerificationStatus';
import MetadataEditor from './MetadataEditor';
import VideoPlayer from './VideoPlayer';
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
  onUpdateMetadata?: (mediaId: string, newMetadata: any) => void;
}

const MediaModal = ({ media, onClose, onUpdateWatchStatus, onUpdateEpisodeStatus, onToggleFavorite, onUpdateMetadata }: MediaModalProps) => {
  const [showRemoveFavoriteDialog, setShowRemoveFavoriteDialog] = useState(false);
  const [showRemoveLocalDialog, setShowRemoveLocalDialog] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const {
    hasLocalCopy,
    getLocalFile,
    startDownload,
    getDownloadProgress,
    deleteLocalFile,
  } = useLocalDownloads();

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

  const handleRemoveLocal = () => {
    setShowRemoveLocalDialog(true);
  };

  const handleConfirmRemoveLocal = () => {
    deleteLocalFile(media.id);
    setShowRemoveLocalDialog(false);
  };

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

  const handlePlay = () => {
    setShowVideoPlayer(true);
  };

  const handleDownload = () => {
    // Simulate file URL - in real implementation, this would come from your NAS
    const fileUrl = `/api/media/${media.id}/download`;
    startDownload(media.id, media.title, fileUrl);
  };

  const isDownloading = getDownloadProgress(media.id)?.status === 'downloading';
  const isOfflineAvailable = hasLocalCopy(media.id);
  const localFile = getLocalFile(media.id);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <MediaModalHeader 
            media={media}
            onClose={onClose}
            getPlaceholderImage={getPlaceholderImage}
          />

          {/* Content */}
          <div className="p-8">
            {/* Verification Status - Prominent at top */}
            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Server Status</h3>
                  <MediaVerificationStatus mediaId={media.id} />
                </div>
                {onUpdateMetadata && (
                  <button
                    onClick={() => setShowMetadataEditor(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Change Metadata
                  </button>
                )}
              </div>
            </div>

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
                
                {/* Action buttons */}
                <div className="space-y-3 mt-4">
                  {/* Play button */}
                  <button
                    onClick={handlePlay}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    {isOfflineAvailable ? 'Play Offline' : 'Play'}
                    {isOfflineAvailable ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                  </button>

                  {/* Download button */}
                  {!isOfflineAvailable && !isDownloading && (
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download for Offline
                    </button>
                  )}

                  {isDownloading && (
                    <div className="w-full p-2 bg-yellow-600/20 border border-yellow-600 text-yellow-300 rounded-xl text-center">
                      <Download className="h-4 w-4 inline mr-2" />
                      Downloading...
                    </div>
                  )}

                  {isOfflineAvailable && localFile && (
                    <>
                      <div className="w-full p-2 bg-green-600/20 border border-green-600 text-green-300 rounded-xl text-center text-sm">
                        <WifiOff className="h-4 w-4 inline mr-2" />
                        Available Offline • {formatFileSize(localFile.fileSize)}
                      </div>
                      
                      {/* Remove from Local button */}
                      <button
                        onClick={handleRemoveLocal}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-red-600/20 border border-red-600 text-red-300 hover:bg-red-600/30 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove from Local
                      </button>
                    </>
                  )}

                  {/* Favorite button */}
                  <button
                    onClick={handleFavoriteClick}
                    className="w-full p-2 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart className={`h-6 w-6 ${media.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    <span className="text-white">
                      {media.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </span>
                  </button>
                </div>
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

        {/* Remove Local Dialog */}
        <AlertDialog open={showRemoveLocalDialog} onOpenChange={setShowRemoveLocalDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Local Storage</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{media.title}" from your local storage? 
                This will free up {localFile ? formatFileSize(localFile.fileSize) : ''} of space, but you'll need to download it again to watch offline.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmRemoveLocal}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove from Local
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Video Player */}
      {showVideoPlayer && (
        <VideoPlayer
          src={isOfflineAvailable && localFile ? localFile.filePath : `/api/media/${media.id}/stream`}
          title={media.title}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}

      {/* Metadata Editor */}
      {onUpdateMetadata && (
        <MetadataEditor
          isOpen={showMetadataEditor}
          onClose={() => setShowMetadataEditor(false)}
          media={media}
          onUpdateMetadata={onUpdateMetadata}
        />
      )}
    </>
  );
};

export default MediaModal;
