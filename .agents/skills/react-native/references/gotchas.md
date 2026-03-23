# React Native Gotchas

1. **Inline styles in JSX**: Writing `style={{ marginTop: 10 }}` creates a new object on every render, defeating `React.memo`. Always use `StyleSheet.create()` or `useMemo` for dynamic styles.

2. **ScrollView for long lists**: Using `<ScrollView>` to render 100+ items loads them ALL into memory at once. Use `<FlatList>` or `<FlashList>` with proper `keyExtractor` and `getItemLayout`.

3. **Untyped navigation params**: Navigating with `navigation.navigate('Profile', { id: 123 })` without a `ParamList` type. Causes silent runtime crashes when params are missing or misnamed.

4. **Storing tokens in AsyncStorage**: `AsyncStorage` is unencrypted plaintext on both platforms. Use `expo-secure-store` or `react-native-keychain` for auth tokens and sensitive data.

5. **Missing error boundaries**: An unhandled JS error in any component crashes the entire app with a red screen. Wrap navigators and critical screens in `ErrorBoundary` components.

6. **Platform.OS checks scattered everywhere**: Sprinkling `Platform.OS === 'ios' ? ... : ...` throughout components makes code fragile. Centralize platform logic in utilities or use `.ios.tsx` / `.android.tsx` file extensions.

7. **Ignoring `useEffect` cleanup**: Forgetting to return a cleanup function from `useEffect` causes memory leaks — especially with listeners (`AppState.addEventListener`, `Keyboard.addListener`, `Dimensions.addEventListener`).

8. **Default `<Image>` in lists**: The built-in `<Image>` component has no disk cache and poor memory management in lists. Use `expo-image` or `react-native-fast-image` for any non-trivial image rendering.

9. **Expo managed vs bare confusion**: Starting with Expo managed workflow and then discovering a required native module needs `npx expo prebuild`. Plan native dependencies upfront during architecture.

10. **Console.log in production**: Leaving `console.log` in production builds causes noticeable performance degradation on Android. Use `babel-plugin-transform-remove-console` or conditional logging.
