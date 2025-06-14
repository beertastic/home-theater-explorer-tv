
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface VerificationIconProps {
  status: string;
}

const VerificationIcon = ({ status }: VerificationIconProps) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'file-missing':
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    default:
      return <XCircle className="h-4 w-4 text-red-400" />;
  }
};

export default VerificationIcon;
