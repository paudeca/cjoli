import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
  useNavigation,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
//import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Drawer } from "expo-router/drawer";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Providers } from "@/components/Providers";
import { Linking, StatusBar, View } from "react-native";
import { useTheme } from "tamagui";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { Button } from "@react-navigation/elements";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

//const Drawer = createDrawerNavigator();

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button onPress={() => {}}>Go to notifications</Button>
    </View>
  );
}

function NotificationsScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button onPress={() => navigation.goBack()}>Go back home</Button>
    </View>
  );
}

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });
  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && interError) {
    return null;
  }

  return (
    <Providers>
      <Drawer
        drawerContent={(props) => (
          <DrawerContentScrollView {...props}>
            <DrawerItem
              label="website"
              onPress={() => Linking.openURL("https://cjoli-hockey.com")}
            />
            <Link
              href={"/_sitemap"}
              onPress={() => props.navigation.closeDrawer()}
            >
              Login
            </Link>
          </DrawerContentScrollView>
        )}
        screenOptions={{
          title: "CJoli",
        }}
      ></Drawer>
      {/*<Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      </Drawer.Navigator>*/}
    </Providers>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            title: "Tamagui + Expo",
            presentation: "modal",
            animation: "slide_from_right",
            gestureEnabled: true,
            gestureDirection: "horizontal",
            contentStyle: {
              backgroundColor: theme.background.val,
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
