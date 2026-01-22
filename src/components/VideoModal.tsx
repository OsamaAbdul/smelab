import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';

const VideoModal = ({ isVideoOpen, setIsVideoOpen }) => {
  const videoId = 'gR7YNrVX9wI';
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [player, setPlayer] = useState(null);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Preload YouTube Iframe API only when modal opens
  useEffect(() => {
    if (isVideoOpen && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, [isVideoOpen]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [player]);

  const youtubeOpts = {
    width: '100%',
    height: '400',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      vq: 'sddefault', // Lower initial quality for faster loading
      playsinline: 1, // Optimize for mobile
      enablejsapi: 1, // Enable JS API for better control
      iv_load_policy: 3, // Disable annotations
      controls: 1, // Show controls for user interaction
    },
  };

  const handleVideoReady = useCallback((event) => {
    setPlayer(event.target);
    setIsVideoLoaded(true);
    setShowThumbnail(false);
  }, []);

  const handleThumbnailClick = useCallback(() => {
    setShowThumbnail(false);
  }, []);

  const handleClose = useCallback(() => {
    if (player) {
      player.stopVideo();
    }
    setIsVideoOpen(false);
    setIsVideoLoaded(false);
    setShowThumbnail(true);
  }, [player, setIsVideoOpen]);

  return (
    <AnimatePresence>
      {isVideoOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="bg-white p-4 rounded-xl max-w-3xl w-full relative overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-black hover:bg-sme-orange hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close video modal"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              {showThumbnail && (
                <div
                  className="absolute inset-0 cursor-pointer bg-cover bg-center"
                  style={{ backgroundImage: `url(https://img.youtube.com/vi/${videoId}/mqdefault.jpg)` }}
                  onClick={handleThumbnailClick}
                >
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                  >
                    <motion.button
                      className="w-12 h-12 text-white opacity-90 hover:opacity-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleThumbnailClick}
                      aria-label="Play video"
                    >
                      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.button>
                  </motion.div>
                </div>
              )}

              {!showThumbnail && (
                <YouTube
                  videoId={videoId}
                  opts={youtubeOpts}
                  onReady={handleVideoReady}
                  loading="lazy"
                  className="w-full h-full"
                  iframeClassName="w-full h-full rounded-lg"
                />
              )}

              {!isVideoLoaded && !showThumbnail && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <svg
                    className="animate-spin h-8 w-8 text-sme-orange"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;