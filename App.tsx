import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { VehicleListScreen } from "./src/screens/VehicleListScreen";
import { VehicleFormScreen } from "./src/screens/VehicleFormScreen";
import { VehicleDetailsScreen } from "./src/screens/VehicleDetailsScreen";
import { RootStackParamList } from "./src/types";
import { ActivityIndicator, View } from "react-native";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#810CD2" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="VehicleList" component={VehicleListScreen} />
          <Stack.Screen name="VehicleForm" component={VehicleFormScreen} />
          <Stack.Screen
            name="VehicleDetails"
            component={VehicleDetailsScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
