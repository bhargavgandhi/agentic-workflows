# Navigation Patterns

## Stack Navigator (Typed)

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Define param list centrally
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  PostDetail: { postId: string; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 2. Navigator definition
function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
```

## Typed Navigation Hook

```typescript
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

// Create typed hooks for each screen
type ProfileScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { userId } = route.params; // Fully typed!

  return (
    <Button onPress={() => navigation.navigate('Settings')} title="Go to Settings" />
  );
}
```

## Bottom Tabs + Nested Stack

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarIcon: ({ color, size }) => {
          // Use icon library here (e.g., @expo/vector-icons)
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
```

## Deep Linking

```typescript
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Profile: 'user/:userId',
      PostDetail: 'post/:postId',
    },
  },
};

// In NavigationContainer
<NavigationContainer linking={linking}>
  <RootNavigator />
</NavigationContainer>
```

## Auth Flow Pattern

```typescript
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
```
