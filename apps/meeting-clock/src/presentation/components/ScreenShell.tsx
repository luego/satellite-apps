import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, usePathname } from 'expo-router';

import { colors, radii, shadows, spacing, typography } from '../theme/colors';
import { useMeetingClock } from '../hooks/useMeetingClock';
import type { TranslationKey } from '../../localization';

interface ScreenShellProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  showBottomNav?: boolean;
}

const navItems = [
  { href: '/', labelKey: 'navSetup', icon: '⏱' },
  { href: '/history', labelKey: 'navHistory', icon: '↺' },
  { href: '/settings', labelKey: 'navSettings', icon: '⚙' },
] as const satisfies readonly { href: string; labelKey: TranslationKey; icon: string }[];

export function ScreenShell({ title, subtitle, children, showBottomNav = true }: ScreenShellProps) {
  const pathname = usePathname();
  const { t } = useMeetingClock();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.appBar}>
          <Text style={styles.brand}>MeetingClock</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
      {showBottomNav ? (
        <View style={styles.nav}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={styles.navItem}>
                  <Text style={[styles.navIcon, active && styles.navActive]}>{item.icon}</Text>
                  <Text style={[styles.navLabel, active && styles.navActive]}>{t(item.labelKey)}</Text>
                  <View style={[styles.navDot, active && styles.navDotActive]} />
                </Pressable>
              </Link>
            );
          })}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 104,
  },
  appBar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.ink,
    ...typography.labelLg,
    fontSize: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    color: colors.ink,
    ...typography.headlineMd,
  },
  subtitle: {
    color: colors.muted,
    ...typography.labelSm,
  },
  nav: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,16,32,0.92)',
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: 10,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    minHeight: 48,
    minWidth: 72,
    textAlign: 'center',
  },
  navIcon: {
    color: colors.ink,
    fontSize: 16,
    textAlign: 'center',
  },
  navLabel: {
    color: colors.ink,
    ...typography.labelSm,
    marginTop: 2,
    textAlign: 'center',
  },
  navActive: {
    color: colors.primarySoft,
  },
  navDot: {
    backgroundColor: 'transparent',
    borderRadius: radii.full,
    height: 4,
    marginTop: 4,
    width: 4,
  },
  navDotActive: {
    backgroundColor: colors.primarySoft,
  },
  card: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
});
