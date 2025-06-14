
import React from 'react';
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

interface BulkVerificationDisplayProps {
  results: {
    totalChecked: number;
    verified: number;
    issues: number;
    results: VerificationResult[];
  };
}

const BulkVerificationDisplay = ({ results }: BulkVerificationDisplayProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{results.totalChecked}</div>
          <div className="text-gray-400">Checked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{results.verified}</div>
          <div className="text-gray-400">Verified</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{results.issues}</div>
          <div className="text-gray-400">Issues</div>
        </div>
      </div>

      {results.results.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-semibold text-gray-300">Recent Items:</h4>
          {results.results.map((result) => (
            <div key={result.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <VerificationIcon status={result.status} />
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
  );
};

export default BulkVerificationDisplay;
