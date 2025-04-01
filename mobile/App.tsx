import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './app/lib/supabase'
import Auth from './app/components/Auth'
import { Text, SafeAreaView, StyleSheet, View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
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
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.safeArea}>
        {
          !session ? <Auth /> : <Text style={styles.text}>Welcome back, {session.user.email}</Text>
        }
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
    
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