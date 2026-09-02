import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer, type Theme as NavTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SavedScreen } from '@/screens/SavedScreen';
import { ShoppingListScreen } from '@/screens/ShoppingListScreen';
import { tabBarOpacity, useTheme } from '@/theme/theme';

/** The input flow, results and recipe detail will all push onto this stack. */
export type HomeStackParamList = {
  KitchenInput: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Saved: undefined;
  'Shopping List': undefined;
  Profile: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, [filled: keyof typeof Ionicons.glyphMap, outline: keyof typeof Ionicons.glyphMap]> = {
  Home: ['restaurant', 'restaurant-outline'],
  Saved: ['bookmark', 'bookmark-outline'],
  'Shopping List': ['cart', 'cart-outline'],
  Profile: ['person', 'person-outline'],
};

function HomeStackNavigator() {
  const { colors, typography } = useTheme();

  return (
    <HomeStack.Navigator
      screenOptions={{
        // Opaque top nav — there is no photo hero to scroll under (Design.md §4).
        headerStyle: { backgroundColor: colors.canvas },
        headerShadowVisible: false,
        headerTitleStyle: typography.navTitle,
        headerTintColor: colors.textPrimary,
        headerTitleAlign: 'left',
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <HomeStack.Screen
        name="KitchenInput"
        component={HomeScreen}
        options={{ title: 'Swaad' }}
      />
    </HomeStack.Navigator>
  );
}

export function RootNavigator() {
  const { colors, typography, touchTarget, hairline, scheme } = useTheme();

  // React Navigation paints the screen background before our screens mount;
  // feeding it the canvas token avoids a white flash on cold start and in dark
  // mode (Design.md §1 — never stark white).
  const navTheme: NavTheme = {
    ...DefaultTheme,
    dark: scheme === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.canvas,
      card: colors.canvas,
      text: colors.textPrimary,
      border: colors.divider,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          // Labels always shown (Design.md §4).
          tabBarShowLabel: true,
          tabBarLabelStyle: typography.tabLabel,
          tabBarStyle: {
            height: touchTarget.tabBarHeight,
            backgroundColor: colors.canvas,
            opacity: tabBarOpacity,
            borderTopWidth: hairline.divider,
            borderTopColor: colors.divider,
            elevation: 0,
          },
          tabBarIcon: ({ focused, color, size }) => {
            const [filled, outline] = TAB_ICONS[route.name];
            return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="Home" component={HomeStackNavigator} />
        <Tabs.Screen name="Saved" component={SavedScreen} />
        <Tabs.Screen name="Shopping List" component={ShoppingListScreen} />
        <Tabs.Screen name="Profile" component={ProfileScreen} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
