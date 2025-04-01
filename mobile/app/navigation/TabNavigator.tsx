import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Timeline } from '../screens/Timeline'

const Tab = createBottomTabNavigator()

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    >
      <Tab.Screen name="Timeline" component={Timeline} />
    </Tab.Navigator>
  )
}