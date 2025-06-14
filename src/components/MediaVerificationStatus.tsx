
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BulkVerificationDisplay from './verification/BulkVerificationDisplay';
import SingleMediaVerification from './verification/SingleMediaVerification';

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

  // Mock verification data generator - only return issues, not verified items
  const generateMockVerificationResult = (id: string): VerificationResult => {
    const issueStatuses: ('file-missing' | 'missing')[] = ['file-missing', 'missing'];
    const randomStatus = issueStatuses[Math.floor(Math.random() * issueStatuses.length)];
    const mediaType = Math.random() > 0.5 ? 'movie' : 'tv';
    
    return {
      id: id,
      title: `Mock Media ${id}`,
      type: mediaType,
      year: 2020 + Math.floor(Math.random() * 4),
      dateAdded: new Date().toISOString().split('T')[0],
      databaseExists: randomStatus !== 'missing',
      fileSystemExists: false, // Issues only
      status: randomStatus,
      filePath: `/nas/media/${mediaType === 'movie' ? 'movies' : 'tv'}/${id}/`,
      genre: ['Action', 'Drama']
    };
  };

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
      // Use mock data when API fails - but only show if there's an issue
      console.log('API failed, using mock verification data for testing');
      const mockResult = generateMockVerificationResult(id);
      setVerificationResult(mockResult);
      
      toast({
        title: "Using Mock Data",
        description: `Mock verification status: ${mockResult.status}`,
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
      // Use mock bulk data when API fails - only show items with issues
      console.log('API failed, using mock bulk verification data for testing');
      const issueResults = Array.from({ length: 3 }, (_, i) => generateMockVerificationResult(`issue-${i + 1}`));
      const mockBulkResults = {
        totalChecked: 15,
        verified: 12,
        issues: 3,
        results: issueResults // Only items with issues
      };
      setBulkResults(mockBulkResults);
      
      toast({
        title: "Using Mock Bulk Data",
        description: `Mock results: ${mockBulkResults.issues} issues found`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (mediaId) {
      verifyMedia(mediaId);
    }
  };

  useEffect(() => {
    if (mediaId) {
      verifyMedia(mediaId);
    }
  }, [mediaId]);

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

        {bulkResults && <BulkVerificationDisplay results={bulkResults} />}
      </div>
    );
  }

  return (
    <SingleMediaVerification 
      verificationResult={verificationResult}
      isLoading={isLoading}
      onRefresh={handleRefresh}
    />
  );
};

export default MediaVerificationStatus;
