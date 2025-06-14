
import React from 'react';
import { X, Play, Star, Calendar, Clock, Tag, Plus } from 'lucide-react';

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

interface MediaModalProps {
  media: MediaItem;
  onClose: () => void;
}

const MediaModal = ({ media, onClose }: MediaModalProps) => {
  const formatDateAdded = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with backdrop */}
        <div className="relative">
          <div className="aspect-video bg-slate-800 rounded-t-2xl overflow-hidden">
            <img
              src={media.backdrop}
              alt={media.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/800x450/334155/ffffff?text=${encodeURIComponent(media.title)}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Play button */}
          <button className="absolute bottom-6 left-6 bg-blue-600 hover:bg-blue-700 rounded-full p-4 transition-colors shadow-lg">
            <Play className="h-8 w-8 text-white fill-current" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="lg:w-1/3">
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-full rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/300x450/334155/ffffff?text=${encodeURIComponent(media.title)}`;
                }}
              />
            </div>

            {/* Info */}
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-bold text-white mb-4">{media.title}</h1>
              
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

              {/* Description */}
              <p className="text-gray-300 leading-relaxed text-lg">{media.description}</p>

              {/* Action buttons */}
              <div className="mt-8 flex gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  Play Now
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                  Add to Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
