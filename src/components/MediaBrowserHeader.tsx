import React from 'react';
import { Shuffle, RotateCcw, Settings, Calendar } from 'lucide-react';
import DownloadsManager from './DownloadsManager';
import FocusableButton from './FocusableButton';

interface MediaBrowserHeaderProps {
  onRandomSelect: () => void;
  onRescan: () => void;
  onOpenScanner: () => void;
  isScanning: boolean;
  actionRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  focusedSection: string;
  navigationItems: any[];
  focusedIndex: number;
  lastUpdated: string;
}

const MediaBrowserHeader = ({
  onRandomSelect,
  onRescan,
  onOpenScanner,
  isScanning,
  actionRefs,
  focusedSection,
  navigationItems,
  focusedIndex,
  lastUpdated
}: MediaBrowserHeaderProps) => {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Media Center</h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Last updated {formatLastUpdated(lastUpdated)}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <DownloadsManager />
          
          <FocusableButton
            ref={(el) => actionRefs.current[0] = el}
            variant="action"
            onClick={onRandomSelect}
            isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-0'}
          >
            <Shuffle className="h-4 w-4" />
            Random
          </FocusableButton>
          
          <FocusableButton
            ref={(el) => actionRefs.current[1] = el}
            variant="action"
            onClick={onRescan}
            disabled={isScanning}
            isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-1'}
          >
            <RotateCcw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Rescan'}
          </FocusableButton>
          
          <FocusableButton
            ref={(el) => actionRefs.current[2] = el}
            variant="action"
            onClick={onOpenScanner}
            isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-2'}
          >
            <Settings className="h-4 w-4" />
            Settings
          </FocusableButton>
        </div>
      </div>
    </div>
  );
};

export default MediaBrowserHeader;
