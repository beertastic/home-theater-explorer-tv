
import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import FocusableButton from './FocusableButton';

interface MediaBrowserHeaderProps {
  onRandomSelect: () => void;
  onRescan: () => void;
  isScanning: boolean;
  actionRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  focusedSection: string;
  navigationItems: any[];
  focusedIndex: number;
}

const MediaBrowserHeader = ({
  onRandomSelect,
  onRescan,
  isScanning,
  actionRefs,
  focusedSection,
  navigationItems,
  focusedIndex
}: MediaBrowserHeaderProps) => {
  return (
    <div className="mb-12 flex items-center justify-between">
      <div>
        <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Media Center
        </h1>
        <p className="text-xl text-gray-300">Your personal media collection • Use arrow keys to navigate</p>
      </div>
      
      <div className="flex gap-3">
        <FocusableButton
          ref={(el) => actionRefs.current[0] = el}
          variant="action"
          onClick={onRandomSelect}
          isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-0'}
        >
          <Sparkles className="h-5 w-5" />
          Random Pick
        </FocusableButton>

        <FocusableButton
          ref={(el) => actionRefs.current[1] = el}
          variant="action"
          onClick={onRescan}
          disabled={isScanning}
          isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-1'}
          className={isScanning 
            ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25'
          }
        >
          <RefreshCw className={`h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Update Library'}
        </FocusableButton>
      </div>
    </div>
  );
};

export default MediaBrowserHeader;
