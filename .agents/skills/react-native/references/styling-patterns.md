# Styling Patterns

## Design Tokens (constants/theme.ts)

```typescript
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  error: '#FF3B30',
  success: '#34C759',
  border: '#C6C6C8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  h1: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.37 },
  h2: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.36 },
  h3: { fontSize: 22, fontWeight: '600' as const, letterSpacing: 0.35 },
  body: { fontSize: 17, fontWeight: '400' as const, letterSpacing: -0.41 },
  caption: { fontSize: 13, fontWeight: '400' as const, letterSpacing: -0.08 },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;
```

## StyleSheet.create() Pattern

```typescript
import { StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.md,
  },
});
```

## Responsive Sizing

```typescript
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale based on iPhone 14 Pro (393 x 852)
const BASE_WIDTH = 393;

export function scale(size: number): number {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
}

// Usage
const styles = StyleSheet.create({
  button: {
    paddingHorizontal: scale(24),
    paddingVertical: scale(12),
    borderRadius: scale(8),
  },
});
```

## Platform-Specific Styles

```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.select({ ios: 44, android: 0 }),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
});
```

## Dark Mode Support

```typescript
import { useColorScheme } from 'react-native';

const lightColors = { background: '#F2F2F7', text: '#000000', surface: '#FFFFFF' };
const darkColors = { background: '#000000', text: '#FFFFFF', surface: '#1C1C1E' };

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

// Usage in component
function MyScreen() {
  const colors = useThemeColors();
  return <View style={[styles.container, { backgroundColor: colors.background }]} />;
}
```
