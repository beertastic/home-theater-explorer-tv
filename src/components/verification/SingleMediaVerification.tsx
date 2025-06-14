
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
  onRefresh?: () => void;
}

const SingleMediaVerification = ({ verificationResult, isLoading, onRefresh }: SingleMediaVerificationProps) => {
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
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              title="Refresh verification status"
            >
              <RefreshCw className="h-3 w-3 text-gray-400 hover:text-white" />
            </button>
          )}
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
