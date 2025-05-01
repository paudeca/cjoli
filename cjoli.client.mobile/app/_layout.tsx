import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, Stack, useFocusEffect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
//import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
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
import Constants from "expo-constants";
//import * as Application from "expo-application";
import { AppState } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

//const Drawer = createDrawerNavigator();

function HomeScreen() {
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

  const [count, setCount] = useState(0);

  useEffect(() => {
    const u = AppState.addEventListener("change", (a) => {
      console.log("change", a, count);
      a == "active" && setCount(count + 1);
    });
    return () => u.remove();
  });

  if (!interLoaded && interError) {
    return null;
  }

  const version = Constants.manifest2?.extra?.expoClient?.version;

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
          title: `CJoli v${version} - ${count}`,
        }}
      ></Drawer>
    </Providers>
  );
}
