import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, Subtitles } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer = ({ src, title, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [textTracks, setTextTracks] = useState<TextTrack[]>([]);
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState(-1);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      
      // Get text tracks (subtitles)
      if (video.textTracks) {
        setTextTracks(Array.from(video.textTracks));
      }
    };

    const handleError = () => {
      console.error('Video failed to load:', src);
      setVideoError(true);
    };

    const handleCanPlay = () => {
      setVideoError(false);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [src]);

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Error playing video:', err);
        setVideoError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleSubtitleTrackChange = (trackIndex: number) => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;

    // Hide all text tracks
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = 'hidden';
    }
    
    // Show selected track
    if (trackIndex >= 0 && trackIndex < video.textTracks.length) {
      video.textTracks[trackIndex].mode = 'showing';
      setSelectedSubtitleTrack(trackIndex);
    } else {
      setSelectedSubtitleTrack(-1);
    }
  };

  if (videoError) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Video Unavailable</h2>
          <p className="text-gray-300 mb-6">The video file could not be loaded. It may not be available on the server.</p>
          <div className="space-x-4">
            <button
              onClick={handleCloseClick}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setVideoError(false);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        className="relative w-full h-full max-w-6xl max-h-full"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />

        {/* Controls overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">{title}</h2>
            <button
              onClick={handleCloseClick}
              className="text-white hover:text-gray-300 text-2xl font-bold z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Center play button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors pointer-events-auto"
            >
              {isPlaying ? (
                <Pause className="h-12 w-12 text-white" />
              ) : (
                <Play className="h-12 w-12 text-white fill-current" />
              )}
            </button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="absolute bottom-20 right-4 bg-black/90 rounded-lg p-4 min-w-64">
              <h3 className="text-white font-semibold mb-3">Settings</h3>
              
              {/* Subtitle tracks */}
              <div>
                <h4 className="text-gray-300 text-sm mb-2">Subtitles</h4>
                <button
                  onClick={() => handleSubtitleTrackChange(-1)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors mb-1 ${
                    selectedSubtitleTrack === -1 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Off
                </button>
                {textTracks.map((track, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubtitleTrackChange(index)}
                    className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors mb-1 ${
                      selectedSubtitleTrack === index 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {track.label || `Subtitle ${index + 1}`} {track.language && `(${track.language})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer video-slider"
              />
              <div className="flex justify-between text-white text-sm mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => skipTime(-10)}
                  className="text-white hover:text-gray-300"
                >
                  <SkipBack className="h-6 w-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 fill-current" />
                  )}
                </button>
                <button
                  onClick={() => skipTime(10)}
                  className="text-white hover:text-gray-300"
                >
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer video-slider"
                  />
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`text-white hover:text-gray-300 ${showSettings ? 'bg-blue-600 rounded' : ''}`}
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-gray-300"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .video-slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
          }
          
          .video-slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
          }
        `
      }} />
    </div>
  );
};

export default VideoPlayer;
