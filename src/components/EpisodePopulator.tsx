
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

  const handlePopulateEpisodes = async () => {
    setIsPopulating(true);
    
    try {
      const response = await fetch(`http://192.168.1.94:3001/api/media/${mediaId}/populate-episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

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
      toast({
        title: "Error",
        description: `Failed to fetch episodes: ${error.message}`,
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
