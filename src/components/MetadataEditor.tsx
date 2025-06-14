
import React, { useState } from 'react';
import { Search, Edit3, Check, X } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { useToast } from '@/hooks/use-toast';

interface MetadataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem;
  onUpdateMetadata: (mediaId: string, newMetadata: any) => void;
}

const MetadataEditor = ({ isOpen, onClose, media, onUpdateMetadata }: MetadataEditorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Mock search results - in real app this would call TMDB API
    setTimeout(() => {
      setSearchResults([
        {
          id: 'tmdb-1',
          title: media.type === 'tv' ? 'Doctor Who (2005)' : 'Interstellar',
          year: media.type === 'tv' ? 2005 : 2014,
          overview: media.type === 'tv' 
            ? 'The further adventures of the time traveling alien adventurer and companions.'
            : 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
          poster_path: '/placeholder.svg',
          vote_average: media.type === 'tv' ? 8.4 : 8.6,
          type: media.type
        },
        {
          id: 'tmdb-2',
          title: media.type === 'tv' ? 'Doctor Who (1963)' : 'Inception',
          year: media.type === 'tv' ? 1963 : 2010,
          overview: media.type === 'tv'
            ? 'The original long-running British science fiction television series.'
            : 'A thief who steals corporate secrets through the use of dream-sharing technology.',
          poster_path: '/placeholder.svg',
          vote_average: media.type === 'tv' ? 8.2 : 8.8,
          type: media.type
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  const handleSelectMetadata = (selectedMetadata: any) => {
    onUpdateMetadata(media.id, {
      ...media,
      title: selectedMetadata.title,
      year: selectedMetadata.year,
      description: selectedMetadata.overview,
      tmdbId: selectedMetadata.id
    });
    
    toast({
      title: "Metadata updated",
      description: `${selectedMetadata.title} metadata has been applied`,
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
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="text-white font-semibold">{result.title} ({result.year})</h5>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;
