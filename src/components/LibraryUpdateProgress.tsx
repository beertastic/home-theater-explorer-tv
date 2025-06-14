import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FolderOpen, Database, CheckCircle, Tv, Film } from 'lucide-react';

interface LibraryUpdateProgressProps {
  isVisible: boolean;
  currentStep: string;
  tvProgress: number;
  movieProgress: number;
  tvFolderCount: number;
  movieFolderCount: number;
  dbFileCount: number;
  newFilesFound: number;
}

const LibraryUpdateProgress = ({
  isVisible,
  currentStep,
  tvProgress,
  movieProgress,
  tvFolderCount,
  movieFolderCount,
  dbFileCount,
  newFilesFound
}: LibraryUpdateProgressProps) => {
  if (!isVisible) return null;

  return (
    <div className="mt-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <h3 className="text-white text-lg font-semibold mb-4">Updating Library</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <Database className="h-4 w-4 text-green-400" />
          <span>Checking {dbFileCount} database entries</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TV Shows Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Tv className="h-4 w-4" />
              <span className="font-medium">TV Shows</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <FolderOpen className="h-4 w-4 text-blue-400" />
              <span>Scanning {tvFolderCount} TV folders</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Progress</span>
                <span>{Math.round(tvProgress)}%</span>
              </div>
              <Progress value={tvProgress} className="w-full" />
            </div>
          </div>
          
          {/* Movies Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400">
              <Film className="h-4 w-4" />
              <span className="font-medium">Movies</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <FolderOpen className="h-4 w-4 text-orange-400" />
              <span>Scanning {movieFolderCount} movie folders</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Progress</span>
                <span>{Math.round(movieProgress)}%</span>
              </div>
              <Progress value={movieProgress} className="w-full" />
            </div>
          </div>
        </div>
        
        <Separator className="bg-slate-600" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-300 text-sm">{currentStep}</span>
          {newFilesFound > 0 && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>{newFilesFound} new files found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryUpdateProgress;
