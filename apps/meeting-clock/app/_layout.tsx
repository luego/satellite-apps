import { Stack } from 'expo-router';

import { MeetingClockProvider } from '../src/bootstrap/MeetingClockProvider';

function MeetingClockStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="session" options={{ orientation: 'landscape' }} />
      <Stack.Screen name="history" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <MeetingClockProvider>
      <MeetingClockStack />
    </MeetingClockProvider>
  );
}
