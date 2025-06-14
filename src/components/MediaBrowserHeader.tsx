
import React from 'react';
import { Shuffle, RefreshCw, Search, Film, Tv } from 'lucide-react';
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
  movieCount: number;
  tvShowCount: number;
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
  movieCount,
  tvShowCount
}: MediaBrowserHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Media Library</h1>
          <p className="text-gray-400">Browse and manage your movies and TV shows</p>
        </div>
        
        {/* Count buttons */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
            <Film className="h-5 w-5 text-blue-400" />
            <span className="text-white font-semibold">{movieCount}</span>
            <span className="text-gray-400 text-sm">Movies</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
            <Tv className="h-5 w-5 text-purple-400" />
            <span className="text-white font-semibold">{tvShowCount}</span>
            <span className="text-gray-400 text-sm">TV Shows</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <FocusableButton
          onClick={onRandomSelect}
          ref={(el) => (actionRefs.current[0] = el)}
          isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-0'}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Shuffle className="h-5 w-5" />
          Random
        </FocusableButton>
        
        <FocusableButton
          onClick={onOpenScanner}
          ref={(el) => (actionRefs.current[1] = el)}
          isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-1'}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Search className="h-5 w-5" />
          Verify Show Data
        </FocusableButton>
        
        <FocusableButton
          onClick={onRescan}
          disabled={isScanning}
          ref={(el) => (actionRefs.current[2] = el)}
          isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-2'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Update Library'}
        </FocusableButton>
      </div>
    </div>
  );
};

export default MediaBrowserHeader;
