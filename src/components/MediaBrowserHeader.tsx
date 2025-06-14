
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
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [folderCount] = useState(247); // Fake data
  const [dbFileCount] = useState(1842); // Fake data
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
    setProgress(0);
    setNewFilesFound(0);
    
    // Simulate progress steps
    const steps = [
      { progress: 0, step: 'Initializing scan...' },
      { progress: 15, step: 'Scanning media folders...' },
      { progress: 35, step: 'Checking database entries...' },
      { progress: 55, step: 'Comparing file timestamps...' },
      { progress: 75, step: 'Processing new files...' },
      { progress: 90, step: 'Updating metadata...' },
      { progress: 100, step: 'Scan complete!' }
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const currentStepData = steps[stepIndex];
        setProgress(currentStepData.progress);
        setCurrentStep(currentStepData.step);
        
        // Simulate finding new files at certain steps
        if (stepIndex === 4) {
          setNewFilesFound(Math.floor(Math.random() * 8) + 1); // 1-8 new files
        }
        
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowProgress(false);
          onRescan(); // Call the original rescan function
        }, 1000);
      }
    }, 800);
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
        progress={progress}
        currentStep={currentStep}
        folderCount={folderCount}
        dbFileCount={dbFileCount}
        newFilesFound={newFilesFound}
      />
    </>
  );
};

export default MediaBrowserHeader;
