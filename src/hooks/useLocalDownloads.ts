
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

// Mock data for testing
const mockLocalFiles: LocalFile[] = [
  {
    mediaId: '1',
    title: 'The Shawshank Redemption',
    filePath: 'offline://1',
    fileSize: 2147483648, // 2GB
    downloadDate: '2024-01-15T10:30:00Z',
    lastAccessed: '2024-01-20T14:45:00Z'
  },
  {
    mediaId: '3',
    title: 'The Dark Knight',
    filePath: 'offline://3',
    fileSize: 3221225472, // 3GB
    downloadDate: '2024-01-10T08:15:00Z',
    lastAccessed: '2024-01-18T20:30:00Z'
  },
  {
    mediaId: '6',
    title: 'Breaking Bad',
    filePath: 'offline://6',
    fileSize: 1073741824, // 1GB
    downloadDate: '2024-01-12T16:20:00Z',
    lastAccessed: '2024-01-19T12:00:00Z'
  }
];

export const useLocalDownloads = () => {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>(mockLocalFiles);
  const [downloadTimers, setDownloadTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());
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

    // Check if already downloading
    if (downloads.some(d => d.mediaId === mediaId)) {
      return;
    }

    // Add to downloads list with 0% progress
    setDownloads(prev => [...prev, {
      mediaId,
      title,
      progress: 0,
      status: 'downloading'
    }]);

    toast({
      title: "Download started",
      description: `Downloading ${title}...`,
    });

    // Simulate realistic download progress
    let progress = 0;
    const updateProgress = () => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20%
      
      if (progress >= 100) {
        progress = 100;
        
        // Complete the download
        setDownloads(prev => prev.map(d => 
          d.mediaId === mediaId ? { ...d, progress: 100, status: 'completed' as const } : d
        ));

        // Add to local files
        const localFile: LocalFile = {
          mediaId,
          title,
          filePath: `offline://${mediaId}`,
          fileSize: Math.floor(Math.random() * 2000000000) + 1000000000, // Random size 1-3GB
          downloadDate: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        };

        setLocalFiles(prev => [...prev, localFile]);

        // Remove from downloads after a short delay
        setTimeout(() => {
          setDownloads(prev => prev.filter(d => d.mediaId !== mediaId));
        }, 2000);

        // Clear timer
        setDownloadTimers(prev => {
          const newMap = new Map(prev);
          const timer = newMap.get(mediaId);
          if (timer) {
            clearInterval(timer);
            newMap.delete(mediaId);
          }
          return newMap;
        });

        toast({
          title: "Download complete!",
          description: `${title} is now available offline`,
        });
      } else {
        // Update progress
        setDownloads(prev => prev.map(d => 
          d.mediaId === mediaId ? { ...d, progress: Math.floor(progress) } : d
        ));
      }
    };

    // Start progress simulation
    const timer = setInterval(updateProgress, 800); // Update every 800ms
    setDownloadTimers(prev => new Map(prev).set(mediaId, timer));

  }, [hasLocalCopy, downloads, toast]);

  // Cancel download
  const cancelDownload = useCallback((mediaId: string) => {
    // Clear timer
    setDownloadTimers(prev => {
      const newMap = new Map(prev);
      const timer = newMap.get(mediaId);
      if (timer) {
        clearInterval(timer);
        newMap.delete(mediaId);
      }
      return newMap;
    });

    // Remove from downloads
    setDownloads(prev => prev.filter(d => d.mediaId !== mediaId));

    const download = downloads.find(d => d.mediaId === mediaId);
    if (download) {
      toast({
        title: "Download cancelled",
        description: `Cancelled download of ${download.title}`,
      });
    }
  }, [downloads, toast]);

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
