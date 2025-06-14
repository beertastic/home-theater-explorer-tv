
import React, { useState } from 'react';
import { Shuffle, Sparkles, X } from 'lucide-react';
import { MediaItem } from '@/types/media';
import MediaCard from './MediaCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RandomMovieSelectorProps {
  mediaData: MediaItem[];
  onSelectMedia: (media: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const RandomMovieSelector = ({ mediaData, onSelectMedia, onToggleFavorite, isOpen, onClose }: RandomMovieSelectorProps) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [randomMovies, setRandomMovies] = useState<MediaItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get unique genres from media data
  const availableGenres = Array.from(
    new Set(mediaData.flatMap(item => item.genre))
  ).sort();

  const generateRandomMovies = () => {
    if (!selectedGenre) return;
    
    setIsGenerating(true);
    
    // Filter movies by selected genre
    const moviesInGenre = mediaData.filter(
      item => item.type === 'movie' && item.genre.includes(selectedGenre)
    );
    
    // Shuffle and take up to 3 random movies
    const shuffled = [...moviesInGenre].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, Math.min(3, shuffled.length));
    
    // Simulate loading for better UX
    setTimeout(() => {
      setRandomMovies(randomSelection);
      setIsGenerating(false);
    }, 1000);
  };

  const handleMovieSelect = (media: MediaItem) => {
    onSelectMedia(media);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Random Movie Picker</span>
              <p className="text-sm text-gray-400 font-normal">Can't decide what to watch? Let us help!</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Select a genre...</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            
            <button
              onClick={generateRandomMovies}
              disabled={!selectedGenre || isGenerating}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                !selectedGenre || isGenerating
                  ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-600/25'
              }`}
            >
              <Shuffle className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Picking...' : 'Pick Random Movies'}
            </button>
          </div>

          {randomMovies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Random {selectedGenre} Movies for You:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {randomMovies.map(movie => (
                  <div key={movie.id} className="transform hover:scale-105 transition-transform">
                    <MediaCard
                      media={movie}
                      onClick={() => handleMovieSelect(movie)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedGenre && randomMovies.length === 0 && !isGenerating && (
            <div className="text-center py-8 text-gray-400">
              <Shuffle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No movies found in the {selectedGenre} genre.</p>
              <p className="text-sm">Try selecting a different genre.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RandomMovieSelector;
