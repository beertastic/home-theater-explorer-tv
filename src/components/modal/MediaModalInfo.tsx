
import React from 'react';
import { MediaItem } from '@/types/media';
import MediaModalPlayButton from './MediaModalPlayButton';
import MediaModalMetaInfo from './MediaModalMetaInfo';
import MediaModalTechnicalInfo from './MediaModalTechnicalInfo';
import MediaModalWatchStatus from './MediaModalWatchStatus';

interface MediaModalInfoProps {
  media: MediaItem;
  onUpdateWatchStatus: (id: string, status: 'unwatched' | 'in-progress' | 'watched') => void;
  getPlaceholderImage: (width: number, height: number, text: string) => string;
  formatDateAdded: (dateString: string) => string;
  formatLastWatched: (dateString: string) => string;
  getWatchStatusColor: (status: string) => string;
  getSubtitleLanguages: (codes: string[]) => string;
}

const MediaModalInfo = ({ 
  media, 
  onUpdateWatchStatus, 
  getPlaceholderImage,
  formatDateAdded,
  formatLastWatched,
  getWatchStatusColor,
  getSubtitleLanguages
}: MediaModalInfoProps) => {
  return (
    <div className="lg:w-2/3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold text-white">{media.title}</h1>
      </div>
      
      <MediaModalWatchStatus 
        media={media}
        onUpdateWatchStatus={onUpdateWatchStatus}
        getWatchStatusColor={getWatchStatusColor}
        formatLastWatched={formatLastWatched}
      />
      
      <MediaModalMetaInfo 
        media={media}
        getWatchStatusColor={getWatchStatusColor}
        formatDateAdded={formatDateAdded}
        formatLastWatched={formatLastWatched}
      />

      <MediaModalTechnicalInfo 
        media={media}
        getSubtitleLanguages={getSubtitleLanguages}
      />

      {/* Description */}
      <p className="text-gray-300 leading-relaxed text-lg mb-8">{media.description}</p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4">
        <MediaModalPlayButton media={media} />
      </div>
    </div>
  );
};

export default MediaModalInfo;
