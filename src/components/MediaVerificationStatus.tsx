
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationResult {
  id: string;
  title: string;
  type: string;
  year: number;
  dateAdded: string;
  databaseExists: boolean;
  fileSystemExists: boolean;
  status: 'verified' | 'file-missing' | 'missing';
  filePath: string;
  genre: string[];
}

interface MediaVerificationStatusProps {
  mediaId?: string;
  showBulkCheck?: boolean;
}

const MediaVerificationStatus = ({ mediaId, showBulkCheck = false }: MediaVerificationStatusProps) => {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [bulkResults, setBulkResults] = useState<{
    totalChecked: number;
    verified: number;
    issues: number;
    results: VerificationResult[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const verifyMedia = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/media/${id}/verify`);
      const data = await response.json();
      setVerificationResult(data);
      
      if (data.status !== 'verified') {
        toast({
          title: "Verification Issue",
          description: data.status === 'file-missing' 
            ? "Media exists in database but files not found on NAS"
            : "Media not found in database",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify media status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRecentMedia = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/media/verify-recent?hours=24');
      const data = await response.json();
      setBulkResults(data);
      
      if (data.issues > 0) {
        toast({
          title: "Verification Issues Found",
          description: `${data.issues} of ${data.totalChecked} recent items have issues`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "All Recent Media Verified",
          description: `${data.verified} items checked successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Bulk Verification Failed",
        description: "Could not verify recent media",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mediaId) {
      verifyMedia(mediaId);
    }
  }, [mediaId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'file-missing':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400';
      case 'file-missing':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'file-missing':
        return 'Files Missing';
      default:
        return 'Not Found';
    }
  };

  if (showBulkCheck) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Media Verification</h3>
          <button
            onClick={verifyRecentMedia}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Checking...' : 'Verify Recent'}
          </button>
        </div>

        {bulkResults && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{bulkResults.totalChecked}</div>
                <div className="text-gray-400">Checked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{bulkResults.verified}</div>
                <div className="text-gray-400">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{bulkResults.issues}</div>
                <div className="text-gray-400">Issues</div>
              </div>
            </div>

            {bulkResults.results.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-semibold text-gray-300">Recent Items:</h4>
                {bulkResults.results.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="text-white text-sm">{result.title} ({result.year})</span>
                    </div>
                    <span className={`text-xs ${getStatusColor(result.status)}`}>
                      {getStatusText(result.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!verificationResult && !isLoading) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {isLoading ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
          <span className="text-gray-300">Verifying...</span>
        </>
      ) : verificationResult ? (
        <>
          {getStatusIcon(verificationResult.status)}
          <span className={getStatusColor(verificationResult.status)}>
            {getStatusText(verificationResult.status)}
          </span>
          {verificationResult.status === 'file-missing' && (
            <span className="text-gray-400 text-xs">
              Expected: {verificationResult.filePath}
            </span>
          )}
        </>
      ) : null}
    </div>
  );
};

export default MediaVerificationStatus;
