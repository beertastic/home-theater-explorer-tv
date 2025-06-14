
import React from 'react';
import { Monitor, Volume2, Subtitles } from 'lucide-react';
import { MediaItem } from '@/types/media';

interface MediaModalTechnicalInfoProps {
  media: MediaItem;
  getSubtitleLanguages: (codes: string[]) => string;
}

const MediaModalTechnicalInfo = ({ media, getSubtitleLanguages }: MediaModalTechnicalInfoProps) => {
  if (!media.technicalInfo) return null;

  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Monitor className="h-4 w-4" />
        Technical Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <Monitor className="h-4 w-4 text-blue-400" />
          <span>{media.technicalInfo.videoCodec} • {media.technicalInfo.resolution}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Volume2 className="h-4 w-4 text-green-400" />
          <span>{media.technicalInfo.audioFormat}</span>
        </div>
        {media.technicalInfo.subtitles.length > 0 && (
          <div className="flex items-center gap-2 text-gray-300 md:col-span-2">
            <Subtitles className="h-4 w-4 text-yellow-400" />
            <span>Subtitles: {getSubtitleLanguages(media.technicalInfo.subtitles)}</span>
          </div>
        )}
        {media.technicalInfo.fileSize && (
          <div className="text-gray-400">
            Size: {media.technicalInfo.fileSize}
          </div>
        )}
        {media.technicalInfo.bitrate && (
          <div className="text-gray-400">
            Bitrate: {media.technicalInfo.bitrate}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModalTechnicalInfo;
