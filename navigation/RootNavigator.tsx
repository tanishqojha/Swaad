import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer, type Theme as NavTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { BudgetScreen } from '@/screens/BudgetScreen';
import { DietaryScreen } from '@/screens/DietaryScreen';
import { KitchenInputScreen } from '@/screens/KitchenInputScreen';
import { LandingScreen } from '@/screens/LandingScreen';
import { MealTypeScreen } from '@/screens/MealTypeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { RecipeDetailScreen } from '@/screens/RecipeDetailScreen';
import { RecipeReviewsScreen } from '@/screens/RecipeReviewsScreen';
import { ResultsScreen } from '@/screens/ResultsScreen';
import { SavedScreen } from '@/screens/SavedScreen';
import { ShoppingListScreen } from '@/screens/ShoppingListScreen';
import { SignInScreen } from '@/screens/SignInScreen';
import type { BudgetRange, DietaryCategory, MealType, RankedRecipe, Recipe } from '@/lib/types';
import { tabBarOpacity, useTheme } from '@/theme/theme';

/** The full input flow -> results -> detail, all pushed onto the Home tab's stack (PRD §5). */
export type HomeStackParamList = {
  Landing: undefined;
  KitchenInput: undefined;
  Budget: { ingredientSlugs: string[]; freeTextIngredients: string[]; applianceSlugs: string[] };
  MealType: HomeStackParamList['Budget'] & { budget: BudgetRange };
  Dietary: HomeStackParamList['MealType'] & { mealType: MealType };
  Results: HomeStackParamList['Dietary'] & { dietary: DietaryCategory; allergyNote: string };
  RecipeDetail: { recipe: Recipe; ranked?: RankedRecipe };
  RecipeReviews: { recipe: Recipe };
  SignIn: undefined;
};

export type SavedStackParamList = {
  SavedList: undefined;
  RecipeDetail: { recipe: Recipe; ranked?: RankedRecipe };
  RecipeReviews: { recipe: Recipe };
  SignIn: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Saved: undefined;
  'Shopping List': undefined;
  Profile: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
// Each tab gets its own native-stack shell, even the single-screen ones —
// react-native-screens' stack header applies the top safe-area inset
// automatically; a bare Tabs.Screen with headerShown:false does not, so its
// content renders under the status bar/notch without one (Design.md §8).
const ShoppingListStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, [filled: keyof typeof Ionicons.glyphMap, outline: keyof typeof Ionicons.glyphMap]> = {
  Home: ['restaurant', 'restaurant-outline'],
  Saved: ['bookmark', 'bookmark-outline'],
  'Shopping List': ['cart', 'cart-outline'],
  Profile: ['person', 'person-outline'],
};

function useStackScreenOptions() {
  const { colors, typography } = useTheme();
  return {
    // Opaque top nav — there is no photo hero to scroll under (Design.md §4).
    headerStyle: { backgroundColor: colors.canvas },
    headerShadowVisible: false,
    headerTitleStyle: typography.navTitle,
    headerTintColor: colors.textPrimary,
    headerTitleAlign: 'left' as const,
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: colors.canvas },
  };
}

function HomeStackNavigator() {
  const screenOptions = useStackScreenOptions();

  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="KitchenInput"
        component={KitchenInputScreen}
        options={{ headerTitle: () => <Logo /> }}
      />
      <HomeStack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget' }} />
      <HomeStack.Screen name="MealType" component={MealTypeScreen} options={{ title: 'Meal type' }} />
      <HomeStack.Screen name="Dietary" component={DietaryScreen} options={{ title: 'Dietary' }} />
      <HomeStack.Screen name="Results" component={ResultsScreen} options={{ title: 'Your dishes' }} />
      <HomeStack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '' }} />
      <HomeStack.Screen name="RecipeReviews" component={RecipeReviewsScreen} options={{ title: 'Reviews' }} />
      <HomeStack.Screen name="SignIn" component={SignInScreen} options={{ title: '' }} />
    </HomeStack.Navigator>
  );
}

function SavedStackNavigator() {
  const screenOptions = useStackScreenOptions();

  return (
    <SavedStack.Navigator screenOptions={screenOptions}>
      <SavedStack.Screen name="SavedList" component={SavedScreen} options={{ title: 'Saved' }} />
      <SavedStack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '' }} />
      <SavedStack.Screen name="RecipeReviews" component={RecipeReviewsScreen} options={{ title: 'Reviews' }} />
      <SavedStack.Screen name="SignIn" component={SignInScreen} options={{ title: '' }} />
    </SavedStack.Navigator>
  );
}

function ShoppingListStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <ShoppingListStack.Navigator screenOptions={screenOptions}>
      <ShoppingListStack.Screen name="ShoppingList" component={ShoppingListScreen} options={{ title: 'Shopping List' }} />
    </ShoppingListStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
  );
}

export function RootNavigator() {
  const { colors, typography, touchTarget, hairline, scheme } = useTheme();
  const insets = useSafeAreaInsets();

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
          // Explicit tabBarStyle.height opts out of RN Navigation's own safe-area
          // padding, so it has to be added back by hand — otherwise the bar sits
          // under Android's gesture pill / 3-button nav (Design.md §8).
          tabBarStyle: {
            height: touchTarget.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
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
        <Tabs.Screen name="Saved" component={SavedStackNavigator} />
        <Tabs.Screen name="Shopping List" component={ShoppingListStackNavigator} />
        <Tabs.Screen name="Profile" component={ProfileStackNavigator} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
