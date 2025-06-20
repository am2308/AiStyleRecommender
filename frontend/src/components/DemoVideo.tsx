import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, ChevronRight } from 'lucide-react';

interface DemoVideoProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoVideo: React.FC<DemoVideoProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Video sections with timestamps (in seconds)
  const sections = [
    { time: 0, title: "Introduction", description: "The problem StyleAI solves" },
    { time: 15, title: "AI Recommendations", description: "Personalized outfit suggestions" },
    { time: 30, title: "3D Virtual Try-On", description: "See outfits on your body type" },
    { time: 45, title: "Smart Wardrobe", description: "Digital closet management" },
    { time: 60, title: "Marketplace", description: "Complete your perfect looks" },
    { time: 75, title: "Subscription", description: "Premium features and benefits" }
  ];

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Update progress bar and current time
  const updateProgress = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const percentage = (currentTime / duration) * 100;
      
      setProgress(percentage);
      setCurrentTime(currentTime);
      
      // Update active section based on current time
      for (let i = sections.length - 1; i >= 0; i--) {
        if (currentTime >= sections[i].time) {
          setActiveSection(i);
          break;
        }
      }
    }
  };

  // Jump to section
  const jumpToSection = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          togglePlay();
          e.preventDefault();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'ArrowRight':
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
          }
          break;
        case 'ArrowLeft':
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isMuted, onClose]);

  // Auto-play when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Small delay to ensure modal animation completes
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(err => {
          console.log('Auto-play prevented:', err);
          // Many browsers prevent autoplay with sound
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(err => {
              console.log('Even muted autoplay failed:', err);
            });
          }
        });
        setIsPlaying(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Pause video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Set duration when metadata is loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Player */}
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                onTimeUpdate={updateProgress}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={handleMetadataLoaded}
                poster="/images/demo-poster.jpg"
                playsInline
              >
                <source src="/videos/styleai-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/70 via-black/30 to-black/50 opacity-0 hover:opacity-100 transition-opacity">
                {/* Top Bar */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-1">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-semibold">StyleAI Demo</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-red-500 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Center Play/Pause Button */}
                <div className="flex-1 flex items-center justify-center">
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause size={32} className="text-white" />
                    ) : (
                      <Play size={32} className="text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className="space-y-2">
                  {/* Progress Bar */}
                  <div className="relative w-full h-2 bg-white/30 rounded-full cursor-pointer"
                    onClick={(e) => {
                      if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        videoRef.current.currentTime = pos * videoRef.current.duration;
                      }
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                    
                    {/* Section Markers */}
                    {sections.map((section, index) => (
                      <div 
                        key={index}
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white/50 rounded-full"
                        style={{ 
                          left: `${(section.time / (duration || 90)) * 100}%`,
                          backgroundColor: index === activeSection ? 'white' : 'rgba(255,255,255,0.5)'
                        }}
                        title={section.title}
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-purple-400 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-purple-400 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX size={20} />
                        ) : (
                          <Volume2 size={20} />
                        )}
                      </button>
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration || 0)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm bg-white/20 px-2 py-1 rounded">
                        {sections[activeSection]?.title}
                      </span>
                      <span className="text-white/70 text-xs">HD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Chapters/Sections */}
            <div className="bg-gray-900 p-4">
              <h4 className="text-white font-medium mb-3">Video Sections</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => jumpToSection(section.time)}
                    className={`text-left px-3 py-2 rounded-lg transition-colors ${
                      index === activeSection 
                        ? 'bg-gradient-to-r from-purple-900/70 to-pink-900/70 border border-purple-500/30' 
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">
                        {formatTime(section.time)}
                      </span>
                      {index === activeSection && (
                        <div className="animate-pulse">
                          <ChevronRight size={14} className="text-purple-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium">{section.title}</p>
                    <p className="text-gray-400 text-xs">{section.description}</p>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-800 text-center">
                <p className="text-gray-400 text-sm">
                  Keyboard shortcuts: <span className="text-white">Space</span> (play/pause), 
                  <span className="text-white"> M</span> (mute), 
                  <span className="text-white"> ←→</span> (seek), 
                  <span className="text-white"> Esc</span> (close)
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoVideo;