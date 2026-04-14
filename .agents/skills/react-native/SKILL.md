---
name: react-native
description: Build, debug, and optimize React Native mobile applications with Expo, React Navigation, and TypeScript.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Building a new React Native screen, component, or feature
- Debugging React Native performance, navigation, or native module issues
- Setting up Expo project structure or configuring navigation
- Writing mobile-specific styling or handling platform differences (iOS/Android)

## 2. Prerequisites

- Expo SDK version confirmed (or bare workflow decision made)
- React Navigation v7+ installed
- `references/navigation-patterns.md` and `references/styling-patterns.md` available

## 3. Steps

### Step 1: Confirm Expo vs Bare Workflow
Default to **Expo managed workflow** unless native modules not supported by Expo are required. Deciding this upfront avoids painful ejection later — check all required native dependencies before starting.

### Step 2: Project Structure
```
src/
├── app/          # Expo Router screens (or screens/ for React Navigation)
├── components/
│   ├── ui/       # Reusable primitives (Button, Input, Card)
│   └── features/ # Feature-specific composed components
├── hooks/        # Custom hooks
├── services/     # API clients, Firebase, auth
├── store/        # Redux / Zustand
├── navigation/   # Navigator definitions & types
├── constants/    # Colors, spacing, typography tokens
└── types/        # Shared TypeScript interfaces
```

### Step 3: Navigation
- Load `references/navigation-patterns.md` for stack, tab, and drawer patterns
- Define a central `RootStackParamList` type for all navigator params
- Use typed `NativeStackNavigationProp` and `RouteProp` generics — never untyped navigation

### Step 4: Styling
- **Always use `StyleSheet.create()`** — never inline style objects (they create new references on every render)
- Define a central `constants/theme.ts` for colors, spacing, typography, and shadows
- Use `Dimensions` or `react-native-responsive-screen` for cross-device responsive units
- Load `references/styling-patterns.md` for responsive and theming patterns

### Step 5: State Management
- Local UI state: `useState`/`useReducer`
- Global app state: Zustand (lightweight) or Redux Toolkit (heavy apps)
- Server state: TanStack React Query or RTK Query — never manually cache API data in Redux
- Sensitive persistent state: `expo-secure-store` (never plain `AsyncStorage` for tokens)

### Step 6: Performance
- `FlatList` over `ScrollView` for any list > ~20 items (always provide `keyExtractor` and `getItemLayout`)
- `React.memo` for expensive components, `useMemo`/`useCallback` only where profiling shows a problem
- `expo-image` or `react-native-fast-image` instead of default `<Image>`
- Load `references/performance-guide.md` for optimisation strategies

### Step 7: Platform Differences
- Use `Platform.select()` or `.ios.tsx` / `.android.tsx` file extensions — never scattered `Platform.OS === 'ios'` checks inline
- Always handle permissions gracefully: check → request → show rationale → handle denial

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll use `style={{ marginTop: 10 }}` for a quick fix" | Inline styles create new object references on every render, defeating `React.memo`. Use `StyleSheet.create()`. |
| "I'll use `ScrollView` to render the list for now" | A `ScrollView` with 100+ items causes memory consumption and jank. Use `FlatList`. |
| "I'll add `ParamList` types later" | Untyped navigation params cause runtime crashes TypeScript should catch. Type them now. |
| "I'll store the token in `AsyncStorage` temporarily" | Tokens in plain `AsyncStorage` are accessible to any code in the app. Use `expo-secure-store`. |
| "I'll decide Expo vs bare later" | Native module requirements determine this. Decide upfront or face ejection mid-project. |

## 5. Red Flags

Signs this skill is being violated:

- Inline style objects in JSX (`style={{ color: 'red' }}`)
- `ScrollView` rendering a list of more than 20 items
- Navigation params not typed with a `ParamList`
- Auth tokens stored in `AsyncStorage` without encryption
- `Platform.OS` checks scattered throughout components instead of centralised
- No `keyExtractor` provided to `FlatList`

## 6. Verification Gate

Before marking React Native work complete:

- [ ] Expo vs bare workflow confirmed before implementation started
- [ ] All styles use `StyleSheet.create()` — no inline style objects
- [ ] `RootStackParamList` type defined; navigation typed throughout
- [ ] `FlatList` used for all lists > 20 items with `keyExtractor`
- [ ] Sensitive data stored in `expo-secure-store`, not plain `AsyncStorage`
- [ ] Platform-specific code centralised (not scattered inline)
- [ ] `references/navigation-patterns.md` and `references/styling-patterns.md` consulted

## 7. References

- [navigation-patterns.md](references/navigation-patterns.md) — Stack, tab, and drawer navigation patterns
- [styling-patterns.md](references/styling-patterns.md) — Responsive styling and theming
- [performance-guide.md](references/performance-guide.md) — Mobile performance optimisation
