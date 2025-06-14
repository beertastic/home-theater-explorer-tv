
import React, { useState } from 'react';
import { Search, Edit3, Check, X } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { useToast } from '@/hooks/use-toast';
import { apiService, TMDBSearchResult } from '@/services/apiService';

interface MetadataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem;
  onUpdateMetadata: (mediaId: string, newMetadata: any) => void;
}

const MetadataEditor = ({ isOpen, onClose, media, onUpdateMetadata }: MetadataEditorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const response = await apiService.searchTMDB(searchQuery, media.type);
      setSearchResults(response.results || []);
      
      if (response.results && response.results.length === 0) {
        toast({
          title: "No results found",
          description: `No ${media.type === 'tv' ? 'TV shows' : 'movies'} found for "${searchQuery}"`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search TMDB. Please check your connection and API key.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMetadata = (selectedMetadata: TMDBSearchResult) => {
    const title = media.type === 'tv' ? selectedMetadata.name : selectedMetadata.title;
    const releaseDate = media.type === 'tv' ? selectedMetadata.first_air_date : selectedMetadata.release_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : media.year;
    
    onUpdateMetadata(media.id, {
      ...media,
      title: title || media.title,
      year: year,
      description: selectedMetadata.overview || media.description,
      rating: Math.round(selectedMetadata.vote_average * 10) / 10,
      thumbnail: selectedMetadata.poster_path 
        ? `https://image.tmdb.org/t/p/w500${selectedMetadata.poster_path}` 
        : media.thumbnail,
      tmdbId: selectedMetadata.id
    });
    
    toast({
      title: "Metadata updated",
      description: `${title} metadata has been applied`,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Change Metadata Reference</h2>
            <p className="text-gray-400 mt-1">Search for the correct {media.type === 'tv' ? 'TV show' : 'movie'} metadata</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Current metadata */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Current: {media.title}</h3>
          <p className="text-gray-400 text-sm">{media.description}</p>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search for ${media.type === 'tv' ? 'TV show' : 'movie'}...`}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">Search Results</h4>
              {searchResults.map((result) => {
                const title = media.type === 'tv' ? result.name : result.title;
                const releaseDate = media.type === 'tv' ? result.first_air_date : result.release_date;
                const year = releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown';
                
                return (
                  <div
                    key={result.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-white font-semibold">{title} ({year})</h5>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{result.overview}</p>
                        <p className="text-blue-400 text-sm mt-2">Rating: {result.vote_average}/10</p>
                      </div>
                      <button
                        onClick={() => handleSelectMetadata(result)}
                        className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;
