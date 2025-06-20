import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface DemoVideoProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoVideo: React.FC<DemoVideoProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Video sections with timestamps (in seconds)
  const sections = [
    { time: 0, title: "Introduction" },
    { time: 15, title: "AI Style Recommendations" },
    { time: 30, title: "3D Virtual Try-On" },
    { time: 45, title: "Smart Wardrobe Management" },
    { time: 60, title: "Marketplace Integration" },
    { time: 75, title: "Subscription Benefits" }
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

  // Update progress bar
  const updateProgress = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
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
          toggleMute();
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
        videoRef.current?.play();
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
                poster="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&fit=crop"
              >
                {/* Replace with your actual video file */}
                <source src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                {/* Top Bar */}
                <div className="flex justify-between items-center">
                  <h3 className="text-white text-xl font-semibold">StyleAI Demo</h3>
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
                  <div className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer"
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
                        {videoRef.current ? 
                          `${Math.floor(videoRef.current.currentTime / 60)}:${Math.floor(videoRef.current.currentTime % 60).toString().padStart(2, '0')}` 
                          : '0:00'}
                      </span>
                    </div>
                    <div>
                      <span className="text-white text-sm">HD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Chapters/Sections */}
            <div className="bg-gray-900 p-4">
              <h4 className="text-white font-medium mb-3">Video Sections</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => jumpToSection(section.time)}
                    className="text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-gray-400 text-xs">
                      {Math.floor(section.time / 60)}:{(section.time % 60).toString().padStart(2, '0')}
                    </span>
                    <p className="text-white text-sm">{section.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoVideo;