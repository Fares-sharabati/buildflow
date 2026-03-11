// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const F = `'Inter','Segoe UI',sans-serif`
const C = {
  bg: '#0f1117', surface: '#181c27', card: '#1e2333', border: '#2a3045',
  accent: '#f59e0b', accentDim: '#f59e0b1a', accentMid: '#f59e0b44',
  text: '#e8eaf0', muted: '#7a849e',
  green: '#22c55e', greenDim: '#22c55e1a',
  red: '#ef4444', redDim: '#ef44441a',
  blue: '#3b82f6', blueDim: '#3b82f61a',
}

const ALL_PERMISSIONS = [
  { key: 'dashboard',  label: 'Dashboard' },
  { key: 'projects',   label: 'Projects' },
  { key: 'invoicing',  label: 'Invoices' },
  { key: 'payments',   label: 'Payments' },
  { key: 'team',       label: 'Team' },
  { key: 'calendar',   label: 'Calendar' },
  { key: 'tasks',      label: 'Tasks' },
  { key: 'tenders',    label: 'Tenders' },
  { key: 'reports',    label: 'Reports' },
  { key: 'prices',     label: 'Price Tracking' },
  { key: 'estimates',  label: 'Estimates' },
]

export default function UsersPage({ currentUser, profile }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // New user form
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('user')
  const [newPerms, setNewPerms] = useState({
    dashboard: true, projects: true, invoicing: true,
    payments: true, team: true, calendar: true,
    tasks: true, tenders: true, reports: true,
    prices: true, estimates: true,
  })

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', profile.company_id)
      .neq('id', currentUser.id)
      .order('created_at', { ascending: false })
    if (!error) setUsers(data || [])
    setLoading(false)
  }

  const handleAddUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setError('Name, email and password are required.')
      return
    }
    setError('')

    // Create auth user via Supabase Admin (using service role via edge function)
    // For now we use signUp and then update the profile
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: newPassword.trim(),
      options: {
        data: { full_name: newName.trim() }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: signUpData.user.id,
      full_name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      company_id: profile.company_id,
      permissions: newPerms,
    })

    if (profileError) {
      setError(profileError.message)
      return
    }

    setSuccess(`User ${newName} created successfully! They can now log in.`)
    setShowAdd(false)
    resetForm()
    loadUsers()
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleUpdatePermissions = async (userId, perms) => {
    const { error } = await supabase
      .from('profiles')
      .update({ permissions: perms })
      .eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: perms } : u))
      setSuccess('Permissions updated!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeleteUser = async (userId) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== userId))
      setSuccess('User removed.')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const resetForm = () => {
    setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('user')
    setNewPerms({ dashboard:true, projects:true, invoicing:true, payments:true, team:true, calendar:true, tasks:true, tenders:true, reports:true, prices:true, estimates:true })
  }

  const INP = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7,
    padding: '9px 12px', color: C.text, fontFamily: F, fontSize: 13,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: 0 }}>User Management</h2>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>
            Manage team accounts and permissions for {profile.companies?.name}
          </div>
        </div>
        <button onClick={() => { setShowAdd(true); setError('') }} style={{
          background: C.accent, color: '#000', border: 'none',
          padding: '10px 20px', borderRadius: 8, fontFamily: F,
          fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          + Add User
        </button>
      </div>

      {/* Success / Error */}
      {success && <div style={{ background: C.greenDim, border: `1px solid ${C.green}44`, borderRadius: 8, padding: '10px 14px', color: C.green, fontSize: 13, marginBottom: 16 }}>{success}</div>}
      {error && <div style={{ background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: 8, padding: '10px 14px', color: C.red, fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {/* Add User Form */}
      {showAdd && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>New User</span>
            <button onClick={() => { setShowAdd(false); resetForm(); setError('') }} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Full Name *</label>
              <input style={INP} placeholder="John Smith" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div>
              <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Email *</label>
              <input style={INP} type="email" placeholder="john@eva.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Password *</label>
              <input style={INP} type="text" placeholder="Temporary password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Role</label>
              <select style={{ ...INP, cursor: 'pointer' }} value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 10, textTransform: 'uppercase' }}>Module Access</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_PERMISSIONS.map(p => (
                <button key={p.key} onClick={() => setNewPerms(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                  style={{
                    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: F,
                    fontSize: 12, fontWeight: 600,
                    background: newPerms[p.key] ? C.accentDim : C.surface,
                    color: newPerms[p.key] ? C.accent : C.muted,
                    border: newPerms[p.key] ? `1px solid ${C.accentMid}` : `1px solid ${C.border}`,
                  }}>
                  {newPerms[p.key] ? '✓ ' : ''}{p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAddUser} style={{ background: C.accent, color: '#000', border: 'none', padding: '10px 24px', borderRadius: 8, fontFamily: F, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Create User
            </button>
            <button onClick={() => { setShowAdd(false); resetForm(); setError('') }} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, padding: '10px 18px', borderRadius: 8, fontFamily: F, fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ background: C.card, border: `2px dashed ${C.border}`, borderRadius: 12, padding: '60px 20px', textAlign: 'center', color: C.muted }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No users yet</div>
          <div style={{ fontSize: 13 }}>Add your first team member using the button above</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onUpdatePermissions={handleUpdatePermissions}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function UserCard({ user, onUpdatePermissions, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [perms, setPerms] = useState(user.permissions || {})
  const [delConfirm, setDelConfirm] = useState(false)

  const initials = (user.full_name || user.email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const togglePerm = (key) => {
    const next = { ...perms, [key]: !perms[key] }
    setPerms(next)
    onUpdatePermissions(user.id, next)
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.accentDim, border: `2px solid ${C.accentMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{user.full_name || '—'}</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{user.email}</div>
        </div>
        <span style={{
          background: user.role === 'admin' ? C.accentDim : C.blueDim,
          color: user.role === 'admin' ? C.accent : C.blue,
          padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
        }}>
          {user.role === 'admin' ? 'Admin' : 'User'}
        </span>
        <button onClick={() => setExpanded(!expanded)} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, padding: '6px 12px', borderRadius: 6, fontFamily: F, fontSize: 12, cursor: 'pointer' }}>
          {expanded ? 'Hide' : 'Permissions'}
        </button>
        {delConfirm ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onDelete(user.id)} style={{ background: C.red, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontFamily: F, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
            <button onClick={() => setDelConfirm(false)} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: 6, fontFamily: F, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setDelConfirm(true)} style={{ background: 'transparent', color: C.red, border: `1px solid ${C.red}33`, padding: '6px 12px', borderRadius: 6, fontFamily: F, fontSize: 12, cursor: 'pointer' }}>Remove</button>
        )}
      </div>

      {/* Permissions Panel */}
      {expanded && (
        <div style={{ padding: '14px 20px 18px', borderTop: `1px solid ${C.border}`, background: C.surface }}>
          <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Module Access</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_PERMISSIONS.map(p => (
              <button key={p.key} onClick={() => togglePerm(p.key)}
                style={{
                  padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: F,
                  fontSize: 12, fontWeight: 600,
                  background: perms[p.key] ? C.accentDim : C.card,
                  color: perms[p.key] ? C.accent : C.muted,
                  border: perms[p.key] ? `1px solid ${C.accentMid}` : `1px solid ${C.border}`,
                }}>
                {perms[p.key] ? '✓ ' : ''}{p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
