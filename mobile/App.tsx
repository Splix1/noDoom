import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './app/lib/supabase'
import Auth from './app/components/Auth'
import { View, Text, SafeAreaView } from 'react-native'
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
      <SafeAreaView>
        {
          !session ? <Auth /> : <Text style={{ color: '#ffffff' }}>Welcome back, {session.user.email}</Text>
        }
      </SafeAreaView>
    </SafeAreaProvider>
    
  )
}