
import React, { useState } from 'react';
import { Play, Eye, EyeOff, Calendar, Clock, CheckCircle, Circle } from 'lucide-react';
import { Episode } from '@/data/mockMedia';
import { useToast } from '@/hooks/use-toast';

interface EpisodeListProps {
  episodes: Episode[];
  onUpdateEpisodeStatus: (episodeId: string, status: 'watched' | 'unwatched') => void;
}

const EpisodeList = ({ episodes, onUpdateEpisodeStatus }: EpisodeListProps) => {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1]));
  const { toast } = useToast();

  // Group episodes by season
  const episodesBySeason = episodes.reduce((acc, episode) => {
    if (!acc[episode.seasonNumber]) {
      acc[episode.seasonNumber] = [];
    }
    acc[episode.seasonNumber].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>);

  const toggleSeason = (seasonNumber: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
    }
    setExpandedSeasons(newExpanded);
  };

  const handleEpisodeStatusUpdate = (episodeId: string, status: 'watched' | 'unwatched') => {
    onUpdateEpisodeStatus(episodeId, status);
    toast({
      title: "Episode status updated",
      description: `Marked as ${status}`,
    });
  };

  const formatAirDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-6">Episodes</h3>
      
      {Object.entries(episodesBySeason)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([seasonNumber, seasonEpisodes]) => {
          const isExpanded = expandedSeasons.has(Number(seasonNumber));
          const watchedCount = seasonEpisodes.filter(ep => ep.watchStatus === 'watched').length;
          const totalCount = seasonEpisodes.length;
          
          return (
            <div key={seasonNumber} className="mb-6">
              {/* Season Header */}
              <button
                onClick={() => toggleSeason(Number(seasonNumber))}
                className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors mb-4"
              >
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-white">
                    Season {seasonNumber}
                  </h4>
                  <span className="text-sm text-gray-400">
                    {watchedCount}/{totalCount} watched
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${(watchedCount / totalCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 transform transition-transform duration-200">
                    {isExpanded ? '−' : '+'}
                  </span>
                </div>
              </button>

              {/* Episodes List */}
              {isExpanded && (
                <div className="space-y-2">
                  {seasonEpisodes
                    .sort((a, b) => a.episodeNumber - b.episodeNumber)
                    .map((episode) => (
                      <div
                        key={episode.id}
                        className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Episode Number Circle */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            episode.watchStatus === 'watched' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-slate-700 text-gray-300'
                          }`}>
                            {episode.watchStatus === 'watched' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              episode.episodeNumber
                            )}
                          </div>

                          {/* Episode Info */}
                          <div className="flex-grow">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="text-white font-semibold mb-1">
                                  {episode.episodeNumber}. {episode.title}
                                </h5>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{episode.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatAirDate(episode.airDate)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                  <Play className="h-4 w-4 text-white fill-current" />
                                </button>
                                <button
                                  onClick={() => handleEpisodeStatusUpdate(
                                    episode.id, 
                                    episode.watchStatus === 'watched' ? 'unwatched' : 'watched'
                                  )}
                                  className={`p-2 rounded-lg transition-colors ${
                                    episode.watchStatus === 'watched'
                                      ? 'bg-green-600 hover:bg-green-700 text-white'
                                      : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                                  }`}
                                >
                                  {episode.watchStatus === 'watched' ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {episode.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default EpisodeList;
