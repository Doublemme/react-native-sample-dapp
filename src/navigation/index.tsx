import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HeaderButton, Text } from "@react-navigation/elements";
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";
import { Image } from "react-native";
import bell from "../assets/bell.png";
import newspaper from "../assets/newspaper.png";
import { Home } from "./screens/Home";
import { Profile } from "./screens/Profile";
import { Settings } from "./screens/Settings";
import { Updates } from "./screens/Updates";
import { NotFound } from "./screens/NotFound";

const HomeTabs = createBottomTabNavigator({
  screens: {
    Home: {
      screen: Home,
      options: {
        title: "Feed",
        tabBarIcon: ({ color, size }) => (
          <Image
            source={newspaper}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Updates: {
      screen: Updates,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Image
            source={bell}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
  },
});

export type RootStackParamList = {
  Home: undefined;
  OnWalletConnect: {
    publicKey: string;
    nonce: string;
    data: string;
  };
  Profile: {
    userId?: string;
  };
  Settings: undefined;
};

export type ProfileScreenProps = StackScreenProps<
  RootStackParamList,
  "Profile"
>;
export type HomeScreenProps = StackScreenProps<RootStackParamList, "Home">;

export const Stack = createStackNavigator<RootStackParamList>();

export function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
