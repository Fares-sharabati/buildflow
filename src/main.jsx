// @ts-nocheck
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { supabase } from './supabaseClient'
import LoginPage from './LoginPage'
import App from './App.jsx'

function Root() {
  const [session, setSession]   = useState(undefined)
  const [profile, setProfile]   = useState(null)

  useEffect(() => {
    // On page load: restore session from localStorage and load profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session ?? null)
      if (session) await loadProfile(session.user)
    })

    // Only use onAuthStateChange to track SIGNED_OUT
    // (login flow is handled by LoginPage directly via handleLogin)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setSession(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (user) => {
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !prof) {
      console.error('Profile load error:', error)
      return   // ← do NOT setProfile(null) — keeps any existing profile intact
    }

    let companyName = 'Construction Management'
    if (prof.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', prof.company_id)
        .single()
      if (company?.name) companyName = company.name
    }

    setProfile({ ...prof, companies: { name: companyName } })
  }

  // Called by LoginPage after successful login + profile fetch
  const handleLogin = ({ user, profile }) => {
    setSession({ user })
    setProfile(profile)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  // Still loading initial session
  if (session === undefined) {
    return (
      <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:32, height:32, border:'3px solid #2a3045', borderTopColor:'#f59e0b', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <App session={session} profile={profile} onLogout={handleLogout} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
