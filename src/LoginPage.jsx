// @ts-nocheck
import { useState } from 'react'
import { supabase } from './supabaseClient'

const F = `'Inter','Segoe UI',sans-serif`

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    // Get user profile (role, permissions, company)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      setError('Account setup incomplete. Please contact your administrator.')
      setLoading(false)
      return
    }

    onLogin({ user: authData.user, profile })
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F,
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(#2a304522 1px, transparent 1px), linear-gradient(90deg, #2a304522 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, background: '#f59e0b', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5"/>
            </svg>
          </div>
          <div style={{ color: '#e8eaf0', fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>BuildFlow</div>
          <div style={{ color: '#7a849e', fontSize: 13, marginTop: 6 }}>Construction Management Platform</div>
        </div>

        {/* Card */}
        <div style={{
          background: '#181c27',
          border: '1px solid #2a3045',
          borderRadius: 16,
          padding: '32px 28px',
        }}>
          <div style={{ color: '#e8eaf0', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Welcome back</div>
          <div style={{ color: '#7a849e', fontSize: 13, marginBottom: 28 }}>Sign in to your company workspace</div>

          {error && (
            <div style={{
              background: '#ef44441a', border: '1px solid #ef444444',
              borderRadius: 8, padding: '10px 14px',
              color: '#ef4444', fontSize: 13, marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#7a849e', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@company.com"
              style={{
                width: '100%', background: '#0f1117', border: '1px solid #2a3045',
                borderRadius: 8, padding: '11px 14px', color: '#e8eaf0',
                fontFamily: F, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ color: '#7a849e', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%', background: '#0f1117', border: '1px solid #2a3045',
                borderRadius: 8, padding: '11px 14px', color: '#e8eaf0',
                fontFamily: F, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', background: '#f59e0b', color: '#000',
              border: 'none', borderRadius: 9, padding: '13px 0',
              fontFamily: F, fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid #00000044', borderTopColor: '#000', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, color: '#7a849e', fontSize: 12 }}>
            Don't have an account? Contact your administrator.
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, color: '#3a4055', fontSize: 12 }}>
          © 2025 BuildFlow · All rights reserved
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
