import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './app/lib/supabase'
import Auth from './app/components/Auth'
import { Text, SafeAreaView, StyleSheet, View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import TabNavigator from './app/navigation/TabNavigator'
import { NavigationContainer } from '@react-navigation/native'
export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <NavigationContainer>
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.safeArea}>
        {
          !session ? <Auth /> : <TabNavigator />
        }
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  text: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  }
})