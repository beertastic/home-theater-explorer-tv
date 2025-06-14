
import React from 'react';
import { RefreshCw } from 'lucide-react';
import VerificationIcon from './VerificationIcon';
import { getStatusColor, getStatusText } from './VerificationUtils';

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

interface SingleMediaVerificationProps {
  verificationResult: VerificationResult | null;
  isLoading: boolean;
}

const SingleMediaVerification = ({ verificationResult, isLoading }: SingleMediaVerificationProps) => {
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
          <VerificationIcon status={verificationResult.status} />
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

export default SingleMediaVerification;
