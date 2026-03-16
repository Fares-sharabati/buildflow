// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { dbProfiles } from './db.js'

const F = `'Inter','Segoe UI',sans-serif`
const C = {
  bg:'#0f1117', surface:'#181c27', card:'#1e2333', border:'#2a3045',
  accent:'#f59e0b', accentDim:'#f59e0b1a', accentMid:'#f59e0b44',
  text:'#e8eaf0', muted:'#7a849e',
  green:'#22c55e', greenDim:'#22c55e1a',
  red:'#ef4444',   redDim:'#ef44441a',
  blue:'#3b82f6',  blueDim:'#3b82f61a',
  purple:'#a855f7',purpleDim:'#a855f71a',
}
const INP = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:7, padding:'9px 12px', color:C.text, fontFamily:F, fontSize:13, outline:'none', width:'100%', boxSizing:'border-box' }
const LBL = { color:C.muted, fontSize:11, fontWeight:700, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }

const ALL_PERMISSIONS = [
  { key:'dashboard',  label:'Dashboard',     icon:'📊' },
  { key:'projects',   label:'Projects',      icon:'🏗' },
  { key:'invoicing',  label:'Invoices',      icon:'🧾' },
  { key:'payments',   label:'Payments',      icon:'💰' },
  { key:'team',       label:'Team',          icon:'👥' },
  { key:'calendar',   label:'Calendar',      icon:'📅' },
  { key:'tasks',      label:'Tasks',         icon:'✅' },
  { key:'tenders',    label:'Tenders',       icon:'📋' },
  { key:'reports',    label:'Reports',       icon:'📈' },
  { key:'prices',     label:'Price Tracking',icon:'📉' },
  { key:'accountant', label:'Accountant',    icon:'🧮' },
]

const ROLE_META = {
  superadmin: { bg:'#f59e0b1a', color:'#f59e0b', label:'Super Admin' },
  admin:      { bg:'#a855f71a', color:'#a855f7', label:'Admin'       },
  user:       { bg:'#3b82f61a', color:'#3b82f6', label:'User'        },
}

export default function UsersPage({ currentUser, profile }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saved,   setSaved]   = useState('')

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', profile.company_id)
    if (!error && data) {
      const order = { superadmin:0, admin:1, user:2 }
      data.sort((a,b) => {
        if (a.id === currentUser.id) return -1
        if (b.id === currentUser.id) return 1
        return (order[a.role]??3) - (order[b.role]??3)
      })
      setUsers(data)
    }
    setLoading(false)
  }

  const updatePermissions = async (userId, perms) => {
    const { error } = await dbProfiles.updatePermissions(userId, perms)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: perms } : u))
      setSaved(userId)
      setTimeout(() => setSaved(''), 2000)
    }
  }

  const updateRole = async (userId, role) => {
    const { error } = await dbProfiles.updateRole(userId, role)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      setSaved(userId)
      setTimeout(() => setSaved(''), 2000)
    }
  }

  return (
    <div style={{ fontFamily:F }}>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ color:C.text, fontSize:22, fontWeight:700, margin:0 }}>User Management</h2>
        <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>Manage tab access · Users are added via Supabase</div>
      </div>

      <div style={{ background:C.accentDim, border:`1px solid ${C.accentMid}`, borderRadius:10, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:18 }}>🔑</span>
        <div>
          <div style={{ color:C.accent, fontWeight:700, fontSize:13, fontFamily:F }}>You control who has access</div>
          <div style={{ color:C.muted, fontSize:12, fontFamily:F, marginTop:2 }}>To add or remove users, go to your Supabase dashboard. Here you manage which tabs each user can see.</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:24 }}>
        {[
          ['Total Users',  users.length, C.blue],
          ['Admins',       users.filter(u=>u.role==='admin'||u.role==='superadmin').length, C.purple],
          ['Regular Users',users.filter(u=>u.role==='user').length, C.green],
        ].map(([l,v,c]) => (
          <div key={l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 20px', flex:1 }}>
            <div style={{ color:C.muted, fontFamily:F, fontSize:11, marginBottom:4 }}>{l}</div>
            <div style={{ color:c, fontFamily:F, fontWeight:700, fontSize:26 }}>{v}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:C.muted, fontFamily:F }}>Loading users…</div>
      ) : users.length === 0 ? (
        <div style={{ background:C.card, border:`2px dashed ${C.border}`, borderRadius:12, padding:'60px 20px', textAlign:'center', color:C.muted, fontFamily:F }}>
          <div style={{ fontSize:36, marginBottom:10 }}>👤</div>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>No users found</div>
          <div style={{ fontSize:12, marginTop:6 }}>Add users from your Supabase dashboard</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isSelf={user.id === currentUser.id}
              justSaved={saved === user.id}
              isSuperadmin={profile.role === 'superadmin'}
              onUpdatePermissions={updatePermissions}
              onUpdateRole={updateRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function UserCard({ user, isSelf, justSaved, isSuperadmin, onUpdatePermissions, onUpdateRole }) {
  const [expanded, setExpanded] = useState(false)
  const [perms,    setPerms]    = useState(user.permissions || {})
  const isSuperadminUser = user.role === 'superadmin'

  useEffect(() => { setPerms(user.permissions || {}) }, [user.permissions])

  const togglePerm = (key) => {
    const next = { ...perms, [key]: !perms[key] }
    setPerms(next)
    onUpdatePermissions(user.id, next)
  }

  const grantAll = () => {
    const next = Object.fromEntries(ALL_PERMISSIONS.map(p => [p.key, true]))
    setPerms(next)
    onUpdatePermissions(user.id, next)
  }

  const revokeAll = () => {
    const next = Object.fromEntries(ALL_PERMISSIONS.map(p => [p.key, false]))
    setPerms(next)
    onUpdatePermissions(user.id, next)
  }

  const initials  = (user.full_name || user.email || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const roleMeta  = ROLE_META[user.role] || ROLE_META.user
  const grantedCount = ALL_PERMISSIONS.filter(p => perms[p.key]).length

  return (
    <div style={{ background:C.card, border:`1px solid ${justSaved ? C.green : C.border}`, borderRadius:12, overflow:'hidden', transition:'border-color .3s' }}>

      {/* ── Main row ── */}
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px' }}>

        {/* Avatar */}
        <div style={{ width:42, height:42, borderRadius:'50%', background:roleMeta.bg, border:`2px solid ${roleMeta.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color:roleMeta.color, fontWeight:800, fontSize:14, flexShrink:0, fontFamily:F }}>
          {initials}
        </div>

        {/* Name + email */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ color:C.text, fontWeight:700, fontSize:14, fontFamily:F }}>{user.full_name || '—'}</span>
            {isSelf && <span style={{ background:C.accentDim, color:C.accent, fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, fontFamily:F }}>YOU</span>}
            {justSaved && <span style={{ color:C.green, fontSize:11, fontFamily:F }}>✓ Saved</span>}
          </div>
          <div style={{ color:C.muted, fontSize:12, marginTop:2, fontFamily:F }}>{user.email}</div>
        </div>

        {/* Tab count — only for non-superadmin */}
        {!isSuperadminUser && (
          <div style={{ color:C.muted, fontSize:12, fontFamily:F, textAlign:'right', flexShrink:0 }}>
            <div style={{ color:C.text, fontWeight:700, fontSize:16 }}>{grantedCount}/{ALL_PERMISSIONS.length}</div>
            <div>tabs</div>
          </div>
        )}

        {/* Role selector (superadmin only, not on self) */}
        {isSuperadmin && !isSelf ? (
          <select
            value={user.role || 'user'}
            onChange={e => onUpdateRole(user.id, e.target.value)}
            style={{ background:roleMeta.bg, color:roleMeta.color, border:`1px solid ${roleMeta.color}44`, padding:'4px 10px', borderRadius:6, fontFamily:F, fontSize:12, fontWeight:700, cursor:'pointer', outline:'none' }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        ) : (
          <span style={{ background:roleMeta.bg, color:roleMeta.color, padding:'4px 12px', borderRadius:6, fontSize:12, fontWeight:700, fontFamily:F, flexShrink:0 }}>
            {roleMeta.label}
          </span>
        )}

        {/* Access button — superadmins get a locked badge, everyone else gets the toggle */}
        {isSuperadminUser ? (
          <span style={{ background:C.accentDim, color:C.accent, border:`1px solid ${C.accentMid}`, padding:'7px 14px', borderRadius:7, fontFamily:F, fontSize:12, fontWeight:700, flexShrink:0 }}>
            🔓 Full Access
          </span>
        ) : (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background:expanded ? C.accentDim : C.surface, border:`1px solid ${expanded ? C.accentMid : C.border}`, color:expanded ? C.accent : C.muted, padding:'7px 14px', borderRadius:7, fontFamily:F, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 }}
          >
            {expanded ? '▲ Hide' : '▼ Access'}
          </button>
        )}
      </div>

      {/* ── Permissions panel — only for non-superadmin, when expanded ── */}
      {expanded && !isSuperadminUser && (
        <div style={{ padding:'16px 20px 20px', borderTop:`1px solid ${C.border}`, background:C.surface }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ color:C.muted, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, fontFamily:F }}>Tab Access</span>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={grantAll}  style={{ background:C.greenDim, color:C.green,  border:`1px solid ${C.green}33`,  padding:'4px 12px', borderRadius:6, fontFamily:F, fontSize:11, fontWeight:700, cursor:'pointer' }}>Grant All</button>
              <button onClick={revokeAll} style={{ background:C.redDim,   color:C.red,    border:`1px solid ${C.red}33`,    padding:'4px 12px', borderRadius:6, fontFamily:F, fontSize:11, fontWeight:700, cursor:'pointer' }}>Revoke All</button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:8 }}>
            {ALL_PERMISSIONS.map(p => (
              <button
                key={p.key}
                onClick={() => togglePerm(p.key)}
                style={{
                  padding:'9px 12px', borderRadius:8, cursor:'pointer', fontFamily:F, fontSize:12, fontWeight:600,
                  background: perms[p.key] ? C.accentDim : C.card,
                  color:      perms[p.key] ? C.accent    : C.muted,
                  border:     perms[p.key] ? `1px solid ${C.accentMid}` : `1px solid ${C.border}`,
                  display:'flex', alignItems:'center', gap:7, textAlign:'left',
                }}
              >
                <span style={{ fontSize:14 }}>{p.icon}</span>
                <span>{p.label}</span>
                {perms[p.key] && <span style={{ marginLeft:'auto', fontSize:10 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
