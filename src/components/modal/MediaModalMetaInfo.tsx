
import React from 'react';
import { Calendar, Clock, Star, Plus, Tag } from 'lucide-react';
import { MediaItem } from '@/types/media';

interface MediaModalMetaInfoProps {
  media: MediaItem;
  getWatchStatusColor: (status: string) => string;
  formatDateAdded: (dateString: string) => string;
  formatLastWatched: (dateString: string) => string;
}

const MediaModalMetaInfo = ({ 
  media, 
  getWatchStatusColor, 
  formatDateAdded, 
  formatLastWatched 
}: MediaModalMetaInfoProps) => {
  return (
    <>
      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-300">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{media.year}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{media.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span>{media.rating}/10</span>
        </div>
        <div className="flex items-center gap-1">
          <Plus className="h-4 w-4 text-orange-400" />
          <span>Added {formatDateAdded(media.dateAdded)}</span>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          media.type === 'movie' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {media.type === 'movie' ? 'Movie' : 'TV Show'}
        </span>
      </div>

      {/* Genres */}
      <div className="flex items-center gap-2 mb-6">
        <Tag className="h-4 w-4 text-gray-400" />
        <div className="flex flex-wrap gap-2">
          {media.genre.map((genre, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-slate-800 text-gray-300 rounded-full text-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default MediaModalMetaInfo;
