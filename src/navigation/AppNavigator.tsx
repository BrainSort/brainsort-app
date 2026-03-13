import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import HomeScreen from "../screens/HomeScreen";
import ProblemDetailScreen from "../screens/ProblemDetailScreen";
import ProblemsScreen from "../screens/ProblemsScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type RootStackParamList = {
    Home: undefined;
    Problems: undefined;
    ProblemDetail: { id: string };
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
    initialRouteName?: keyof RootStackParamList;
};

export default function AppNavigator({ initialRouteName = "Home" }: AppNavigatorProps) {
return (
    <NavigationContainer>
        <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
            headerTitleAlign: "center",
        }}
        >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Problems" component={ProblemsScreen} />
        <Stack.Screen name="ProblemDetail" component={ProblemDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    </NavigationContainer>
);
}