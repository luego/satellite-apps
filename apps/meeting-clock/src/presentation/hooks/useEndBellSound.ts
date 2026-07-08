import { useCallback, useEffect } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

const endBellSource = require('../../../assets/audio/end-bell.mp3');

export function useEndBellSound() {
  const player = useAudioPlayer(endBellSource);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    }).catch(() => {});
  }, []);

  return useCallback(() => {
    player.seekTo(0);
    player.play();
  }, [player]);
}
