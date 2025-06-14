
import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EpisodePopulatorProps {
  mediaId: string;
  mediaTitle: string;
  onEpisodesPopulated: () => void;
}

const EpisodePopulator = ({ mediaId, mediaTitle, onEpisodesPopulated }: EpisodePopulatorProps) => {
  const [isPopulating, setIsPopulating] = useState(false);
  const { toast } = useToast();

  const handlePopulateEpisodes = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsPopulating(true);
    
    try {
      console.log(`Attempting to populate episodes for media ID: ${mediaId}`);
      
      const response = await fetch(`http://192.168.1.94:3001/api/media/${mediaId}/populate-episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response. Content-Type:', contentType);
        const textResponse = await response.text();
        console.error('Response body:', textResponse.substring(0, 500)); // Log first 500 chars
        throw new Error(`Server returned HTML instead of JSON. This usually indicates a server error. Check server logs.`);
      }

      const data = await response.json();
      console.log('Parsed JSON response:', data);

      if (data.success) {
        toast({
          title: "Episodes Added Successfully",
          description: `Added ${data.episodesAdded} episodes for ${mediaTitle}`,
        });
        onEpisodesPopulated();
      } else {
        throw new Error(data.error || 'Failed to populate episodes');
      }
    } catch (error) {
      console.error('Error populating episodes:', error);
      
      let errorMessage = 'Failed to fetch episodes';
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Episodes Found</h3>
        <p className="text-gray-400 mb-4">
          This TV show doesn't have episode data yet. Would you like to fetch episodes from TMDB?
        </p>
        <button
          type="button"
          onClick={handlePopulateEpisodes}
          disabled={isPopulating}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-semibold transition-colors mx-auto"
        >
          {isPopulating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Fetching Episodes...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Fetch Episodes from TMDB
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EpisodePopulator;
