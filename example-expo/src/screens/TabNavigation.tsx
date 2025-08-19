import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {StyleSheet, Image} from 'react-native';
import FetchingScreen from './FetchingScreen';
import FlushingScreen from './FlushingScreen';
import AnonymizeScreen from './AnonymizeScreen';
import NotificationScreen from './NotificationScreen';
import fetchIcon from '../img/fetch.png';
import notificationIcon from '../img/notification.png';
import flushIcon from '../img/flush.png';
import anonymizeIcon from '../img/anonymize.png';
import {Screen} from './Screens';

const Tab = createBottomTabNavigator();

export default function DashboardScreen(): React.ReactElement {
  return (
    <Tab.Navigator screenOptions={{tabBarActiveTintColor: 'black'}} detachInactiveScreens={false}>
      <Tab.Screen
        options={getTabBarOptions(Screen.Notifications)}
        name={Screen.Notifications}
        component={NotificationScreen}
      />
      <Tab.Screen
        options={getTabBarOptions(Screen.Fetching)}
        name={Screen.Fetching}
        component={FetchingScreen}
      />
      <Tab.Screen
        options={getTabBarOptions(Screen.Flushing)}
        name={Screen.Flushing}
        component={FlushingScreen}
      />
      <Tab.Screen
        options={getTabBarOptions(Screen.Anonymize)}
        name={Screen.Anonymize}
        component={AnonymizeScreen}
      />
    </Tab.Navigator>
  );
}

function getIcon(name: Screen) {
  switch (name) {
    case Screen.Notifications:
      return notificationIcon;
    case Screen.Fetching:
      return fetchIcon;
    case Screen.Flushing:
      return flushIcon;
    case Screen.Anonymize:
      return anonymizeIcon;
  }
}

function getTabBarOptions(screen: Screen): BottomTabNavigationOptions {
  return {
    tabBarIcon: (props: {focused: boolean; color: string; size: number}) => (
      <Image
        style={[styles.tabIcon, {tintColor: props.color}]}
        source={getIcon(screen)}
      />
    ),
  };
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 22,
    height: 22,
  },
});
