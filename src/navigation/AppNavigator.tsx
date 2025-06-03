import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import SearchScreen from '../screens/SearchScreen';
import ResultsScreen from '../screens/ResultsScreen';
import UserHistoryScreen from '../screens/UserHistoryScreen';
import EditWineScreen from '../screens/EditWineScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="UserHistory" component={UserHistoryScreen} />
      <Stack.Screen name="EditWine" component={EditWineScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
