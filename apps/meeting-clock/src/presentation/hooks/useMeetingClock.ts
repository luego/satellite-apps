import { useContext } from 'react';

import { MeetingClockContext } from '../../bootstrap/MeetingClockProvider';

export function useMeetingClock() {
  const context = useContext(MeetingClockContext);

  if (!context) {
    throw new Error('useMeetingClock must be used inside MeetingClockProvider');
  }

  return context;
}
