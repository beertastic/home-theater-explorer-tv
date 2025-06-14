
import React, { useState } from 'react';
import { Shuffle, RotateCcw, Settings, Calendar } from 'lucide-react';
import DownloadsManager from './DownloadsManager';
import FocusableButton from './FocusableButton';
import LibraryUpdateProgress from './LibraryUpdateProgress';
import { apiService } from '@/services/apiService';

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
  libraryStats: {
    dbFileCount: number;
    movieFolderCount: number;
    tvFolderCount: number;
    totalFolders: number;
  };
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
  lastUpdated,
  libraryStats
}: MediaBrowserHeaderProps) => {
  const [showProgress, setShowProgress] = useState(false);
  const [isUpdateComplete, setIsUpdateComplete] = useState(false);
  const [tvProgress, setTvProgress] = useState(0);
  const [movieProgress, setMovieProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [newFilesFound, setNewFilesFound] = useState(0);
  const [newlyFoundContent, setNewlyFoundContent] = useState<Array<{
    type: 'movie' | 'tv';
    title: string;
    season?: number;
    episode?: number;
  }>>([]);

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

  const handleRescanWithProgress = async () => {
    setShowProgress(true);
    setIsUpdateComplete(false);
    setTvProgress(0);
    setMovieProgress(0);
    setNewFilesFound(0);
    setNewlyFoundContent([]);
    
    // Simulate the scan progress with real-time updates
    const steps = [
      { tv: 0, movie: 0, step: 'Initializing scan...' },
      { tv: 10, movie: 5, step: 'Scanning TV show folders...' },
      { tv: 25, movie: 15, step: 'Scanning movie folders...' },
      { tv: 45, movie: 35, step: 'Checking database entries...' },
      { tv: 60, movie: 55, step: 'Comparing file timestamps...' },
      { tv: 75, movie: 70, step: 'Processing TV episodes...' },
      { tv: 85, movie: 85, step: 'Processing movie files...' },
      { tv: 95, movie: 95, step: 'Updating metadata...' },
      { tv: 100, movie: 100, step: 'Scan complete!' }
    ];
    
    // Fake newly found content
    const fakeNewContent = [
      { type: 'movie' as const, title: 'The Matrix Resurrections' },
      { type: 'tv' as const, title: 'Breaking Bad', season: 3, episode: 7 },
      { type: 'movie' as const, title: 'Dune: Part Two' },
      { type: 'tv' as const, title: 'Stranger Things', season: 4, episode: 9 },
      { type: 'tv' as const, title: 'The Mandalorian', season: 2, episode: 8 },
      { type: 'movie' as const, title: 'Oppenheimer' },
      { type: 'tv' as const, title: 'House of the Dragon', season: 1, episode: 10 },
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const currentStepData = steps[stepIndex];
        setTvProgress(currentStepData.tv);
        setMovieProgress(currentStepData.movie);
        setCurrentStep(currentStepData.step);
        
        // Simulate finding new files at certain steps
        if (stepIndex === 6) {
          const newCount = Math.floor(Math.random() * 7) + 3; // 3-9 new files
          setNewFilesFound(newCount);
          setNewlyFoundContent(fakeNewContent.slice(0, newCount));
        }
        
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsUpdateComplete(true);
        onRescan();
      }
    }, 900);
  };

  const handleCloseProgress = () => {
    setShowProgress(false);
    setIsUpdateComplete(false);
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">WOPR Media</h1>
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
              onClick={handleRescanWithProgress}
              disabled={isScanning || showProgress}
              isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-1'}
            >
              <RotateCcw className={`h-4 w-4 ${isScanning || showProgress ? 'animate-spin' : ''}`} />
              {isScanning || showProgress ? 'Updating...' : 'Update Library'}
            </FocusableButton>
            
            <FocusableButton
              ref={(el) => actionRefs.current[2] = el}
              variant="action"
              onClick={onOpenScanner}
              isFocused={focusedSection === 'actions' && navigationItems[focusedIndex]?.id === 'action-2'}
            >
              <Settings className="h-4 w-4" />
              Verify new files
            </FocusableButton>
          </div>
        </div>
      </div>

      <LibraryUpdateProgress
        isVisible={showProgress}
        isComplete={isUpdateComplete}
        currentStep={currentStep}
        tvProgress={tvProgress}
        movieProgress={movieProgress}
        tvFolderCount={libraryStats.tvFolderCount}
        movieFolderCount={libraryStats.movieFolderCount}
        dbFileCount={libraryStats.dbFileCount}
        newFilesFound={newFilesFound}
        newlyFoundContent={newlyFoundContent}
        onClose={handleCloseProgress}
      />
    </>
  );
};

export default MediaBrowserHeader;
