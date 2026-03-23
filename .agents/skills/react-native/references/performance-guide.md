# React Native Performance Guide

## FlatList Optimization

```typescript
import { FlatList } from 'react-native';

// ✅ Optimized FlatList
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}               // Defined outside with useCallback
  getItemLayout={(_, index) => ({       // Pre-calculate layout for fixed-height items
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}          // Unmount off-screen items (Android)
  maxToRenderPerBatch={10}              // Render 10 items per batch
  windowSize={5}                        // Render 5 screens worth of items
  initialNumToRender={10}               // Render 10 items initially
/>

// ✅ Memoized renderItem
const renderItem = useCallback(({ item }: { item: ItemType }) => (
  <MemoizedItemComponent item={item} onPress={handlePress} />
), [handlePress]);

// ✅ Memoized list item component
const ItemComponent = React.memo(({ item, onPress }) => {
  return (
    <Pressable onPress={() => onPress(item.id)}>
      <Text>{item.title}</Text>
    </Pressable>
  );
});
```

## Image Optimization

```typescript
// ❌ Default Image component is slow for large lists
import { Image } from 'react-native';

// ✅ Use expo-image for caching and performance
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  placeholder={blurhash}                // Show placeholder while loading
  transition={200}                      // Smooth fade-in
  cachePolicy="memory-disk"             // Cache aggressively
/>
```

## Avoiding Re-renders

```typescript
// ❌ Anonymous function creates new reference every render
<Button onPress={() => handleSubmit(id)} />

// ✅ Stable reference with useCallback
const onSubmit = useCallback(() => handleSubmit(id), [id]);
<Button onPress={onSubmit} />

// ❌ Inline style object creates new reference every render
<View style={{ marginTop: spacing }} />

// ✅ Dynamic styles via useMemo
const dynamicStyle = useMemo(() => ({ marginTop: spacing }), [spacing]);
<View style={dynamicStyle} />
```

## Animation Performance

```typescript
// ✅ Use Reanimated for JS-thread-free animations
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function AnimatedCard() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Pressable
        onPressIn={() => (scale.value = 0.95)}
        onPressOut={() => (scale.value = 1)}
      >
        <Text>Tap me</Text>
      </Pressable>
    </Animated.View>
  );
}
```

## Bundle Size

- Use `expo-constants` to check bundle size in dev.
- Prefer tree-shakeable packages (`lodash-es` over `lodash`).
- Lazy-load heavy screens: `React.lazy()` with Suspense or dynamic imports.
- Audit with `npx react-native-bundle-visualizer` (bare) or `npx expo export` analysis.

## Memory Leaks

- Always clean up subscriptions and listeners in `useEffect` return functions.
- Cancel pending network requests on unmount (AbortController).
- Remove event listeners (`AppState`, `Keyboard`, `Dimensions`) on cleanup.
