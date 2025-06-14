
import React from 'react';
import { Play, Star, Clock, Calendar, Plus } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  year: number;
  rating: number;
  duration: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  genre: string[];
  dateAdded: string;
}

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  showDateAdded?: boolean;
}

const MediaCard = ({ media, onClick, showDateAdded = false }: MediaCardProps) => {
  const formatDateAdded = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Added today';
    if (diffDays <= 7) return `Added ${diffDays} days ago`;
    if (diffDays <= 30) return `Added ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Added ${date.toLocaleDateString()}`;
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        <img
          src={media.thumbnail}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x450/334155/ffffff?text=${encodeURIComponent(media.title)}`;
          }}
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="bg-blue-600 rounded-full p-4 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-8 w-8 text-white fill-current" />
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            media.type === 'movie' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {media.type === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>

        {/* Recently added badge */}
        {showDateAdded && (
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-600 text-white flex items-center gap-1">
              <Plus className="h-3 w-3" />
              NEW
            </span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">
            {media.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            {showDateAdded ? (
              <>
                <Plus className="h-3 w-3" />
                <span>{formatDateAdded(media.dateAdded)}</span>
              </>
            ) : (
              <>
                <Calendar className="h-3 w-3" />
                <span>{media.year}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current ml-2" />
                <span>{media.rating}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
