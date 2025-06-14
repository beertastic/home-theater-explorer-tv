
import React from 'react';
import { Download, Trash2, HardDrive } from 'lucide-react';
import { useLocalDownloads } from '@/hooks/useLocalDownloads';
import DownloadProgress from './DownloadProgress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const DownloadsManager = () => {
  const {
    downloads,
    localFiles,
    cancelDownload,
    deleteLocalFile,
  } = useLocalDownloads();

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const totalSize = localFiles.reduce((sum, file) => sum + file.fileSize, 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          <Download className="h-4 w-4" />
          Downloads
          {downloads.length > 0 && (
            <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">
              {downloads.length}
            </span>
          )}
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Download className="h-5 w-5" />
            Downloads Manager
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Manage your offline downloads and storage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Storage Info */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-gray-300" />
              <span className="text-white font-medium">Storage Usage</span>
            </div>
            <p className="text-gray-300">
              {localFiles.length} files • {formatFileSize(totalSize)} used
            </p>
          </div>

          {/* Active Downloads */}
          {downloads.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Active Downloads</h3>
              {downloads.map((download) => (
                <DownloadProgress
                  key={download.mediaId}
                  mediaId={download.mediaId}
                  title={download.title}
                  progress={download.progress}
                  status={download.status}
                  onCancel={cancelDownload}
                />
              ))}
            </div>
          )}

          {/* Downloaded Files */}
          {localFiles.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Downloaded Files</h3>
              <div className="space-y-2">
                {localFiles.map((file) => (
                  <div key={file.mediaId} className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{file.title}</h4>
                        <p className="text-gray-300 text-sm">
                          {formatFileSize(file.fileSize)} • Downloaded {formatDate(file.downloadDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                              <span className="text-sm">Remove from Local</span>
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Remove from Local Storage</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to remove "{file.title}" from your local storage? 
                                This will free up {formatFileSize(file.fileSize)} of space, but you'll need to download it again to watch offline.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteLocalFile(file.mediaId)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Remove from Local
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {downloads.length === 0 && localFiles.length === 0 && (
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300">No downloads yet</p>
              <p className="text-gray-400 text-sm">Downloaded files will appear here</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadsManager;
