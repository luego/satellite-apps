import type { TimerStateLevel } from '../../domain/entities/MeetingTimer';

export const colors = {
  background: '#0B1020',
  surface: '#101415',
  surfaceLow: '#151C2F',
  surfaceContainer: '#1D263D',
  surfaceHigh: '#272A2C',
  ink: '#E0E3E5',
  muted: '#94A3B8',
  subtle: '#C6C5D6',
  divider: '#2A3550',
  outline: '#464653',
  primary: '#7C83FD',
  primarySoft: '#BFC2FF',
  primaryInk: '#070494',
  secondary: '#F9BC45',
  secondaryInk: '#422D00',
  success: '#BFC2FF',
  warning: '#F9BC45',
  critical: '#FF5D73',
  overtime: '#FF5D73',
  darkSurface: '#0B1020',
  darkInk: '#E0E3E5',
};

export const levelColors: Record<TimerStateLevel, string> = {
  normal: colors.primarySoft,
  warning: colors.warning,
  critical: colors.critical,
  overtime: colors.overtime,
};

export const typography = {
  headlineLg: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  labelLg: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.14,
  },
  labelSm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.48,
  },
  timerDisplay: {
    fontFamily: 'monospace',
    fontSize: 80,
    lineHeight: 96,
    fontWeight: '700' as const,
    letterSpacing: -1.6,
  },
  timerDisplayMobile: {
    fontFamily: 'monospace',
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '700' as const,
    letterSpacing: -1.12,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  gutter: 16,
  lg: 24,
  xl: 32,
  stackLg: 48,
};

export const radii = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
