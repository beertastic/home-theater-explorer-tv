
import React from 'react';
import { Download, X, Check, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DownloadProgressProps {
  mediaId: string;
  title: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error' | 'paused';
  onCancel: (mediaId: string) => void;
}

const DownloadProgress = ({ mediaId, title, progress, status, onCancel }: DownloadProgressProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'paused':
        return <Download className="h-4 w-4 text-yellow-400" />;
      default:
        return <Download className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Download complete';
      case 'error':
        return 'Download failed';
      case 'paused':
        return 'Download paused';
      default:
        return `Downloading... ${progress}%`;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-white font-medium truncate">{title}</span>
        </div>
        {status === 'downloading' && (
          <button
            onClick={() => onCancel(mediaId)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {status === 'downloading' && (
        <div className="mb-2">
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <p className="text-sm text-gray-400">{getStatusText()}</p>
    </div>
  );
};

export default DownloadProgress;
