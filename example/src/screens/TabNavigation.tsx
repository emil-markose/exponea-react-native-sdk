import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {StyleSheet, Image} from 'react-native';
import TrackingScreen from './TrackingScreen';
import FetchingScreen from './FetchingScreen';
import FlushingScreen from './FlushingScreen';
import AnonymizeScreen from './AnonymizeScreen.tsx';
import trackIcon from '../img/track.png';
import fetchIcon from '../img/fetch.png';
import flushIcon from '../img/flush.png';
import anonymizeIcon from '../img/anonymize.png';
import inAppCbIcon from '../img/content_blocks.png';
import InAppCbScreen from './InAppCbScreen';
import {Screen} from './Screens';

const Tab = createBottomTabNavigator();

export default function TabNavigation(): React.ReactElement {
  return (
    <Tab.Navigator screenOptions={{tabBarActiveTintColor: 'black'}}>
      <Tab.Screen
        options={getTabBarOptions(Screen.Tracking)}
        name={Screen.Tracking}
        component={TrackingScreen}
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
      <Tab.Screen
        options={getTabBarOptions(Screen.InAppCB)}
        name={Screen.InAppCB}
        component={InAppCbScreen}
      />
    </Tab.Navigator>
  );
}

function getIcon(name: Screen) {
  switch (name) {
    case Screen.Tracking:
      return trackIcon;
    case Screen.Fetching:
      return fetchIcon;
    case Screen.Flushing:
      return flushIcon;
    case Screen.Anonymize:
      return anonymizeIcon;
    case Screen.InAppCB:
      return inAppCbIcon;
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
