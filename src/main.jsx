// @ts-nocheck
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { supabase } from './supabaseClient'
import LoginPage from './LoginPage'
import App from './App.jsx'

function Root() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) await loadProfile(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) await loadProfile(session.user)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (user) => {
    // Step 1: load profile row (no join)
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !prof) {
      console.error('Profile load error:', error)
      setProfile(null)
      return
    }

    // Step 2: load company name separately
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

  const handleLogin = ({ user, profile }) => {
    setProfile(profile)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #2a3045', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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
