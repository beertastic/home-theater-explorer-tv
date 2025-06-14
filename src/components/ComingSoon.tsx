
import React from 'react';
import { Star, Calendar, Clock, Play, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import MediaVerificationStatus from './MediaVerificationStatus';
import { MediaItem } from '@/types/media';

interface ComingSoonProps {
  mediaData: MediaItem[];
  onToggleFavorite: (id: string) => void;
}

const ComingSoon = ({ mediaData, onToggleFavorite }: ComingSoonProps) => {
  const getUpcomingMedia = () => {
    const today = new Date();
    return mediaData.filter(media => {
      if (!media.nextEpisodeDate) return false;
      const nextAirDate = new Date(media.nextEpisodeDate);
      return nextAirDate >= today;
    }).sort((a, b) => new Date(a.nextEpisodeDate!).getTime() - new Date(b.nextEpisodeDate!).getTime());
  };

  const getNewlyAddedMedia = () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7); // Consider media added in the last 7 days as "new"
    return mediaData.filter(media => new Date(media.dateAdded) >= cutoff)
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  };

  const upcomingMedia = getUpcomingMedia();
  const newlyAddedMedia = getNewlyAddedMedia();

  if (upcomingMedia.length === 0 && newlyAddedMedia.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Coming Soon & New Arrivals</h2>
          <p className="text-gray-400">Stay up to date with upcoming releases and recent additions</p>
        </div>
        
        {/* Add bulk verification for new items */}
        {newlyAddedMedia.length > 0 && (
          <div className="w-80">
            <MediaVerificationStatus showBulkCheck={true} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Upcoming Media */}
        {upcomingMedia.map((media) => (
          <div key={media.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors">
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-lg truncate">{media.title}</h3>
              <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                {new Date(media.nextEpisodeDate!).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                  UPCOMING
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(media.id)}
                className="p-2 bg-slate-700 hover:bg-blue-600 text-white rounded-full transition-colors"
              >
                <Star className={`h-5 w-5 ${media.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                <Play className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Newly Added Media */}
        {newlyAddedMedia.map((media) => (
          <div key={media.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors">
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-lg truncate">{media.title}</h3>
              <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                <Clock className="h-4 w-4" />
                {media.duration}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                  NEW
                </span>
                <MediaVerificationStatus mediaId={media.id} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(media.id)}
                className="p-2 bg-slate-700 hover:bg-blue-600 text-white rounded-full transition-colors"
              >
                <Star className={`h-5 w-5 ${media.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                <Play className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComingSoon;
