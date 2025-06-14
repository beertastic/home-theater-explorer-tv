
import React, { useState } from 'react';
import { X, Search, Check, AlertTriangle, Calendar, Star, Info, Zap } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { useToast } from '@/hooks/use-toast';
import { apiService, TMDBSearchResult } from '@/services/apiService';

interface MetadataMatch {
  id: string;
  title: string;
  year: number;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  type: 'movie' | 'tv';
  first_air_date?: string;
  release_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

interface MetadataVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  detectedMetadata: MetadataMatch | null;
  onAcceptMetadata: (metadata: MetadataMatch) => void;
  onRejectAndSearch: () => void;
}

const MetadataVerificationModal = ({
  isOpen,
  onClose,
  folderName,
  detectedMetadata,
  onAcceptMetadata,
  onRejectAndSearch
}: MetadataVerificationModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MetadataMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MetadataMatch | null>(detectedMetadata);
  const [isAdding, setIsAdding] = useState(false);
  const [folderPath, setFolderPath] = useState(''); // Add state for folder path
  const { toast } = useToast();

  if (!isOpen) return null;

  const convertTMDBToMetadataMatch = (tmdbResult: TMDBSearchResult): MetadataMatch => {
    const isTV = tmdbResult.media_type === 'tv' || tmdbResult.name;
    const title = isTV ? tmdbResult.name : tmdbResult.title;
    const releaseDate = isTV ? tmdbResult.first_air_date : tmdbResult.release_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 0;

    return {
      id: tmdbResult.id.toString(),
      title: title || 'Unknown Title',
      year,
      overview: tmdbResult.overview || 'No overview available',
      poster_path: tmdbResult.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}` : '',
      backdrop_path: '', // TMDB search doesn't include backdrop
      vote_average: tmdbResult.vote_average || 0,
      type: isTV ? 'tv' : 'movie',
      first_air_date: tmdbResult.first_air_date,
      release_date: tmdbResult.release_date,
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      console.log('Searching TMDB for:', searchQuery);
      const response = await apiService.searchTMDB(searchQuery);
      console.log('TMDB search response:', response);
      
      if (response.results && response.results.length > 0) {
        const convertedResults = response.results.map(convertTMDBToMetadataMatch);
        setSearchResults(convertedResults);
        console.log('Converted search results:', convertedResults);
        
        // Auto-select the first result as "best guess"
        if (convertedResults.length > 0) {
          setSelectedMatch(convertedResults[0]);
        }
      } else {
        setSearchResults([]);
        toast({
          title: "No results found",
          description: `No results found for "${searchQuery}"`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      toast({
        title: "Search failed",
        description: "Could not search for metadata. Please check your backend connection.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!selectedMatch) return;
    
    setIsAdding(true);
    try {
      console.log('Adding to library:', selectedMatch, 'with folder path:', folderPath);
      const response = await apiService.addMediaFromTMDB(
        parseInt(selectedMatch.id), 
        selectedMatch.type,
        folderPath || folderName // Use folderPath if set, otherwise use folderName
      );
      console.log('Add media response:', response);
      
      toast({
        title: "Added to library!",
        description: `${selectedMatch.title} has been added to your library`,
      });
      
      onAcceptMetadata(selectedMatch);
      onClose();
    } catch (error) {
      console.error('Error adding to library:', error);
      toast({
        title: "Failed to add to library",
        description: "Could not add media to your library. Please check your backend connection.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleBestGuess = async () => {
    if (!folderName) return;
    
    // Use folder name as search query for best guess
    setSearchQuery(folderName);
    setIsSearching(true);
    
    try {
      console.log('Best guess search for:', folderName);
      const response = await apiService.searchTMDB(folderName);
      
      if (response.results && response.results.length > 0) {
        const bestGuess = convertTMDBToMetadataMatch(response.results[0]);
        setSelectedMatch(bestGuess);
        setSearchResults([bestGuess]);
        
        toast({
          title: "Best guess selected",
          description: `Selected: ${bestGuess.title} (${bestGuess.year})`,
        });
      } else {
        toast({
          title: "No matches found",
          description: "Could not find any matches for the folder name",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Best guess search error:', error);
      toast({
        title: "Search failed",
        description: "Could not perform best guess search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccept = () => {
    if (selectedMatch) {
      onAcceptMetadata(selectedMatch);
      onClose();
    }
  };

  const handleReject = () => {
    onRejectAndSearch();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Verify Metadata</h2>
            <p className="text-gray-400 mt-1">Folder: <span className="text-blue-400">{folderName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Folder path input */}
          <div className="mb-6">
            <label htmlFor="folderPath" className="block text-sm font-medium text-white mb-2">
              Media Folder Path (Optional)
            </label>
            <input
              id="folderPath"
              type="text"
              placeholder={`/path/to/media/folders/${folderName}`}
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-gray-400 text-sm mt-1">
              Specify the full path to link this media with actual files on your system
            </p>
          </div>

          {/* Auto-detected section */}
          {detectedMetadata && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">Auto-detected Metadata</h3>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-4 border-2 border-yellow-400/30">
                <div className="flex gap-4">
                  <img
                    src={detectedMetadata.poster_path || '/placeholder.svg'}
                    alt={detectedMetadata.title}
                    className="w-24 h-36 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2">{detectedMetadata.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{detectedMetadata.year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{detectedMetadata.vote_average}/10</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        detectedMetadata.type === 'movie' ? 'bg-red-600' : 'bg-green-600'
                      }`}>
                        {detectedMetadata.type === 'movie' ? 'Movie' : 'TV Show'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3">{detectedMetadata.overview}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleBestGuess}
                disabled={isSearching}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Best Guess
              </button>
            </div>
          </div>

          {/* Search section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search for Correct Match
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search for the correct title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-400 text-white rounded-xl font-semibold transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-white mb-3">Search Results</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedMatch(result)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedMatch?.id === result.id
                        ? 'bg-blue-600/20 border-2 border-blue-500'
                        : 'bg-slate-800 hover:bg-slate-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={result.poster_path || '/placeholder.svg'}
                        alt={result.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-semibold text-white">{result.title}</h5>
                        <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                          <span>{result.year}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>{result.vote_average}/10</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.type === 'movie' ? 'bg-red-600' : 'bg-green-600'
                          }`}>
                            {result.type === 'movie' ? 'Movie' : 'TV Show'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{result.overview}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button
              onClick={handleReject}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
            >
              Skip This Item
            </button>
            <button
              onClick={handleAddToLibrary}
              disabled={!selectedMatch || isAdding}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              {isAdding ? 'Adding...' : 'Add to Library'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataVerificationModal;
