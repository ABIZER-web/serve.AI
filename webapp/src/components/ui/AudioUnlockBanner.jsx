import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speechService } from '../../lib/speechService';
import { soundEffects } from '../../lib/soundEffects';
import { useRestaurant } from '../../context/RestaurantContext';

export const AudioUnlockBanner = () => {
  const { isAudioMuted, setIsAudioMuted } = useRestaurant();
  const [unlocked, setUnlocked] = useState(false);

  const handleEnableAudio = () => {
    speechService.unlockAudio();
    soundEffects.playNewOrderChime();
    setUnlocked(true);
    setIsAudioMuted(false);
  };

  const handleToggleMute = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  const handleTestAnnouncement = () => {
    speechService.testAnnouncement();
  };

  return (
    <div className="bg-primary-50 dark:bg-primary-950/40 border-b border-primary-100 dark:border-primary-900/50 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-primary-900 dark:text-primary-200">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        <span className="font-semibold">AI Voice Order Announcements:</span>
        <span className="hidden sm:inline">
          {isAudioMuted
            ? 'Voice announcements are currently muted.'
            : 'Active with automatic deduplication & speech synthesis.'}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        {!unlocked && (
          <button
            onClick={handleEnableAudio}
            className="px-2.5 py-1 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-600 transition"
          >
            Enable Audio
          </button>
        )}

        <button
          onClick={handleTestAnnouncement}
          className="px-2.5 py-1 bg-white dark:bg-secondary-800 border border-primary-200 dark:border-secondary-700 text-primary-800 dark:text-primary-300 font-semibold rounded-md hover:bg-primary-50 transition"
        >
          Test Voice Alert
        </button>

        <button
          onClick={handleToggleMute}
          className="p-1 rounded text-secondary-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-secondary-800 transition"
          title={isAudioMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-primary" />}
        </button>
      </div>
    </div>
  );
};

