import React, { useState, useEffect } from 'react';
import { FolderOpen, CheckCircle, AlertCircle, SkipForward } from 'lucide-react';
import MetadataVerificationModal from './MetadataVerificationModal';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

interface ScannedFolder {
  id: string;
  path: string;
  name: string;
  status: 'pending' | 'verified' | 'skipped' | 'processing';
  detectedMetadata?: any;
}

interface MediaScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (addedCount: number) => void;
}

const MediaScanner = ({ isOpen, onClose, onScanComplete }: MediaScannerProps) => {
  const [scannedFolders, setScannedFolders] = useState<ScannedFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<ScannedFolder | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load actual folders from file system when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFoldersFromFileSystem();
    }
  }, [isOpen]);

  const loadFoldersFromFileSystem = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Scanning file system for media folders...');
      const response = await fetch(`${apiService.API_BASE_URL}/scan/folders`);
      
      if (!response.ok) {
        throw new Error(`Failed to scan folders: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Scan results:', data);
      
      if (data.success) {
        setScannedFolders(data.folders || []);
        toast({
          title: "Folder scan complete",
          description: `Found ${data.totalFound} folders to review`,
        });
      } else {
        throw new Error(data.error || 'Failed to scan folders');
      }
    } catch (err) {
      console.error('Failed to scan folders:', err);
      setError(err.message);
      toast({
        title: "Scan failed",
        description: "Could not scan media folders. Check backend logs.",
        variant: "destructive"
      });
      // Fallback to empty array instead of hardcoded data
      setScannedFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleVerifyMetadata = (folder: ScannedFolder) => {
    setCurrentFolder(folder);
    setIsVerificationOpen(true);
  };

  const handleAcceptMetadata = (metadata: any) => {
    if (currentFolder) {
      setScannedFolders(prev => 
        prev.map(folder => 
          folder.id === currentFolder.id 
            ? { ...folder, status: 'verified', detectedMetadata: metadata }
            : folder
        )
      );
      
      toast({
        title: "Metadata accepted",
        description: `${metadata.title} will be added to your library`,
      });
    }
    setIsVerificationOpen(false);
    setCurrentFolder(null);
  };

  const handleSkipFolder = (folderId: string) => {
    setScannedFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, status: 'skipped' }
          : folder
      )
    );
    
    toast({
      title: "Folder skipped",
      description: "This folder will not be added to your library",
    });
  };

  const handleFinishScan = () => {
    const verifiedCount = scannedFolders.filter(f => f.status === 'verified').length;
    onScanComplete(verifiedCount);
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'skipped': return <SkipForward className="h-5 w-5 text-gray-400" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'border-green-500/30 bg-green-500/10';
      case 'skipped': return 'border-gray-500/30 bg-gray-500/10';
      default: return 'border-yellow-500/30 bg-yellow-500/10';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-2">Media Library Scanner</h2>
            <p className="text-gray-400">Review and verify detected metadata before adding to your library</p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">Scanning your media folders...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Scan Failed</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={loadFoldersFromFileSystem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Retry Scan
              </button>
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && (
            <div className="p-6">
              {scannedFolders.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No New Folders Found</h3>
                  <p className="text-gray-400">
                    No new media folders were detected in your library paths.
                    Check your backend environment variables for correct media paths.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {scannedFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className={`border-2 rounded-xl p-4 transition-all ${getStatusColor(folder.status)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(folder.status)}
                            <div>
                              <h3 className="text-white font-semibold">{folder.name}</h3>
                              <p className="text-gray-400 text-sm">{folder.path}</p>
                              {folder.detectedMetadata && (
                                <p className="text-gray-300 text-sm mt-1">
                                  Detected: {folder.detectedMetadata.title} ({folder.detectedMetadata.year})
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {folder.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyMetadata(folder)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleSkipFolder(folder.id)}
                                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                  Skip
                                </button>
                              </>
                            )}
                            {folder.status !== 'pending' && (
                              <button
                                onClick={() => handleVerifyMetadata(folder)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary and finish button */}
                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-300">
                        <p>
                          {scannedFolders.filter(f => f.status === 'verified').length} items will be added, {' '}
                          {scannedFolders.filter(f => f.status === 'skipped').length} skipped, {' '}
                          {scannedFolders.filter(f => f.status === 'pending').length} pending
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={onClose}
                          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFinishScan}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                        >
                          Finish Scan
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metadata verification modal */}
      <MetadataVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => {
          setIsVerificationOpen(false);
          setCurrentFolder(null);
        }}
        folderName={currentFolder?.name || ''}
        detectedMetadata={currentFolder?.detectedMetadata || null}
        onAcceptMetadata={handleAcceptMetadata}
        onRejectAndSearch={() => {
          if (currentFolder) {
            handleSkipFolder(currentFolder.id);
          }
        }}
      />
    </>
  );
};

export default MediaScanner;
