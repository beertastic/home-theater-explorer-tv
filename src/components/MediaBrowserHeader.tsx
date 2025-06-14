
import React, { useState } from 'react';
import { Shuffle, RotateCcw, Settings, Calendar } from 'lucide-react';
import DownloadsManager from './DownloadsManager';
import FocusableButton from './FocusableButton';
import LibraryUpdateProgress from './LibraryUpdateProgress';

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
  const [showProgress, setShowProgress] = useState(false);
  const [tvProgress, setTvProgress] = useState(0);
  const [movieProgress, setMovieProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [tvFolderCount] = useState(143); // Fake TV folder count
  const [movieFolderCount] = useState(104); // Fake movie folder count
  const [dbFileCount] = useState(1842); // Fake database file count
  const [newFilesFound, setNewFilesFound] = useState(0);

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

  const handleRescanWithProgress = () => {
    setShowProgress(true);
    setTvProgress(0);
    setMovieProgress(0);
    setNewFilesFound(0);
    
    // Simulate separate progress for TV and Movies
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
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const currentStepData = steps[stepIndex];
        setTvProgress(currentStepData.tv);
        setMovieProgress(currentStepData.movie);
        setCurrentStep(currentStepData.step);
        
        // Simulate finding new files at certain steps
        if (stepIndex === 6) {
          setNewFilesFound(Math.floor(Math.random() * 12) + 3); // 3-14 new files
        }
        
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowProgress(false);
          onRescan(); // Call the original rescan function
        }, 1500);
      }
    }, 900);
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
        currentStep={currentStep}
        tvProgress={tvProgress}
        movieProgress={movieProgress}
        tvFolderCount={tvFolderCount}
        movieFolderCount={movieFolderCount}
        dbFileCount={dbFileCount}
        newFilesFound={newFilesFound}
      />
    </>
  );
};

export default MediaBrowserHeader;
