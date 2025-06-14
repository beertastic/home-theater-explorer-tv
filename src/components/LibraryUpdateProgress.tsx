
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, Database, CheckCircle } from 'lucide-react';

interface LibraryUpdateProgressProps {
  isVisible: boolean;
  progress: number;
  currentStep: string;
  folderCount: number;
  dbFileCount: number;
  newFilesFound: number;
}

const LibraryUpdateProgress = ({
  isVisible,
  progress,
  currentStep,
  folderCount,
  dbFileCount,
  newFilesFound
}: LibraryUpdateProgressProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-white text-lg font-semibold mb-4">Updating Library</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-300">
            <FolderOpen className="h-5 w-5 text-blue-400" />
            <span>Scanning {folderCount} folders</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-300">
            <Database className="h-5 w-5 text-green-400" />
            <span>Checking {dbFileCount} database entries</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>{currentStep}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          {newFilesFound > 0 && (
            <div className="flex items-center gap-2 text-green-400">
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
