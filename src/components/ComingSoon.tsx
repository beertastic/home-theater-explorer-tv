import React from 'react';
import { Star, Calendar, Clock, Play } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Media */}
        {upcomingMedia.map((media) => (
          <div key={media.id} className="relative group">
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full rounded-xl object-cover aspect-[2/3] shadow-xl"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">{media.title}</h3>
                <p className="text-gray-300 text-sm">
                  <Calendar className="inline-block h-4 w-4 mr-1 align-text-top" />
                  {new Date(media.nextEpisodeDate!).toLocaleDateString()}
                </p>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => onToggleFavorite(media.id)}
                  className="p-2 bg-slate-800 hover:bg-blue-600 text-white rounded-full transition-colors"
                >
                  <Star className={`h-5 w-5 ${media.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                  <Play className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Newly Added Media */}
        {newlyAddedMedia.map((media) => (
          <div key={media.id} className="relative group">
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full rounded-xl object-cover aspect-[2/3] shadow-xl"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">{media.title}</h3>
                <p className="text-gray-300 text-sm">
                  <Clock className="inline-block h-4 w-4 mr-1 align-text-top" />
                  {media.duration}
                </p>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => onToggleFavorite(media.id)}
                  className="p-2 bg-slate-800 hover:bg-blue-600 text-white rounded-full transition-colors"
                >
                  <Star className={`h-5 w-5 ${media.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                  <Play className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Update the badges section to include verification status */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                NEW
              </span>
              <MediaVerificationStatus mediaId={media.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComingSoon;
