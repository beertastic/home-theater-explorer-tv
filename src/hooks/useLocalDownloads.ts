
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DownloadProgress {
  mediaId: string;
  title: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error' | 'paused';
}

interface LocalFile {
  mediaId: string;
  title: string;
  filePath: string;
  fileSize: number;
  downloadDate: string;
  lastAccessed: string;
}

export const useLocalDownloads = () => {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const { toast } = useToast();

  // Check if file exists locally
  const hasLocalCopy = useCallback((mediaId: string): boolean => {
    return localFiles.some(file => file.mediaId === mediaId);
  }, [localFiles]);

  // Get local file info
  const getLocalFile = useCallback((mediaId: string): LocalFile | null => {
    return localFiles.find(file => file.mediaId === mediaId) || null;
  }, [localFiles]);

  // Start download
  const startDownload = useCallback(async (mediaId: string, title: string, fileUrl: string) => {
    if (hasLocalCopy(mediaId)) {
      toast({
        title: "Already downloaded",
        description: `${title} is already available offline`,
      });
      return;
    }

    // Add to downloads list
    setDownloads(prev => [...prev, {
      mediaId,
      title,
      progress: 0,
      status: 'downloading'
    }]);

    try {
      // Simulate download with progress updates
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          loaded += value.length;

          const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;
          
          setDownloads(prev => prev.map(d => 
            d.mediaId === mediaId ? { ...d, progress } : d
          ));
        }
      }

      // Create blob and store reference
      const blob = new Blob(chunks);
      const fileSize = blob.size;
      
      // In a real implementation, you'd store this in IndexedDB
      // For now, we'll simulate successful storage
      const localFile: LocalFile = {
        mediaId,
        title,
        filePath: `offline://${mediaId}`,
        fileSize,
        downloadDate: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };

      setLocalFiles(prev => [...prev, localFile]);
      
      setDownloads(prev => prev.map(d => 
        d.mediaId === mediaId ? { ...d, status: 'completed' as const } : d
      ));

      toast({
        title: "Download complete!",
        description: `${title} is now available offline`,
      });

    } catch (error) {
      setDownloads(prev => prev.map(d => 
        d.mediaId === mediaId ? { ...d, status: 'error' as const } : d
      ));

      toast({
        title: "Download failed",
        description: `Failed to download ${title}`,
        variant: "destructive",
      });
    }
  }, [hasLocalCopy, toast]);

  // Cancel download
  const cancelDownload = useCallback((mediaId: string) => {
    setDownloads(prev => prev.filter(d => d.mediaId !== mediaId));
  }, []);

  // Delete local file
  const deleteLocalFile = useCallback((mediaId: string) => {
    const file = getLocalFile(mediaId);
    if (file) {
      setLocalFiles(prev => prev.filter(f => f.mediaId !== mediaId));
      toast({
        title: "File deleted",
        description: `Removed ${file.title} from offline storage`,
      });
    }
  }, [getLocalFile, toast]);

  // Get current download progress
  const getDownloadProgress = useCallback((mediaId: string): DownloadProgress | null => {
    return downloads.find(d => d.mediaId === mediaId) || null;
  }, [downloads]);

  return {
    downloads,
    localFiles,
    hasLocalCopy,
    getLocalFile,
    startDownload,
    cancelDownload,
    deleteLocalFile,
    getDownloadProgress,
  };
};
