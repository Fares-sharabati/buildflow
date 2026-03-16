// @ts-nocheck
// ─── Supabase Client (no npm package — pure fetch) ────────────────────────────

const SUPABASE_URL = 'https://mghwscmrosxiymtdqvaa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naHdzY21yb3N4aXltdGRxdmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjE0MzUsImV4cCI6MjA4ODgzNzQzNX0.zq7SAYsAWvO338CCQncnewOR2n2UloKP3AqZaWefaNg'

const getToken        = () => { try { return localStorage.getItem('bf_token') } catch { return null } }
const getRefreshToken = () => { try { return localStorage.getItem('bf_refresh') } catch { return null } }
const setToken        = (t) => { try { localStorage.setItem('bf_token', t||'') } catch {} }
const setRefreshToken = (t) => { try { localStorage.setItem('bf_refresh', t||'') } catch {} }

let _authListeners = []
let _currentSession = null
let _refreshing = false
const notifyListeners = (event, session) => { _currentSession = session; _authListeners.forEach(fn => fn(event, session)) }

// Refresh the access token using the refresh token
const refreshAccessToken = async () => {
  if (_refreshing) return false
  const rt = getRefreshToken()
  if (!rt) return false
  _refreshing = true
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) { _refreshing = false; return false }
    const data = await res.json()
    setToken(data.access_token)
    setRefreshToken(data.refresh_token)
    _refreshing = false
    return true
  } catch { _refreshing = false; return false }
}

// Auto-refresh if token is expired (JWT exp check)
const getValidToken = async () => {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiresAt = payload.exp * 1000
    // Refresh if within 5 minutes of expiry or already expired
    if (Date.now() > expiresAt - 5 * 60 * 1000) {
      const ok = await refreshAccessToken()
      return ok ? getToken() : token
    }
  } catch {}
  return token
}

const headers = (extra={}) => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${getToken() || SUPABASE_ANON_KEY}`,
  ...extra,
})

// Headers with fresh token (use for write operations)
const headersAsync = async (extra={}) => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${await getValidToken() || SUPABASE_ANON_KEY}`,
  ...extra,
})

const auth = {
  getSession: async () => {
    const token = getToken()
    if (!token) return { data: { session: null } }
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: headers() })
      if (!res.ok) { setToken(null); setRefreshToken(null); return { data: { session: null } } }
      const user = await res.json()
      const session = { access_token: token, user }
      _currentSession = session
      return { data: { session } }
    } catch { return { data: { session: null } } }
  },

  signInWithPassword: async ({ email, password }) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { data: null, error: { message: data.error_description || 'Login failed' } }
      setToken(data.access_token)
      setRefreshToken(data.refresh_token)
      const session = { access_token: data.access_token, user: data.user }
      notifyListeners('SIGNED_IN', session)
      return { data: { session, user: data.user }, error: null }
    } catch (e) { return { data: null, error: { message: 'Network error' } } }
  },

  signUp: async ({ email, password, options }) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password, data: options?.data || {} }),
      })
      const data = await res.json()
      if (!res.ok) return { data: null, error: { message: data.error_description || 'Signup failed' } }
      return { data: { user: data }, error: null }
    } catch (e) { return { data: null, error: { message: 'Network error' } } }
  },

  signOut: async () => {
    try { await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: headers() }) } catch {}
    setToken(null); setRefreshToken(null)
    notifyListeners('SIGNED_OUT', null)
    return { error: null }
  },

  onAuthStateChange: (callback) => {
    _authListeners.push(callback)
    return { data: { subscription: { unsubscribe: () => { _authListeners = _authListeners.filter(fn => fn !== callback) } } } }
  },
}

const from = (table) => {
  let _filters = [], _select = '*', _single = false, _order = null, _neq = []

  const builder = {
    select: (cols='*') => { _select=cols; return builder },
    eq: (col,val) => { _filters.push(`${col}=eq.${encodeURIComponent(val)}`); return builder },
    neq: (col,val) => { _neq.push(`${col}=neq.${encodeURIComponent(val)}`); return builder },
    order: (col, {ascending=true}={}) => { _order=`${col}.${ascending?'asc':'desc'}`; return builder },
    single: () => { _single=true; return builder },

    then: async (resolve) => {
      try {
        let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(_select)}`
        _filters.forEach(f => { url += `&${f}` })
        _neq.forEach(f => { url += `&${f}` })
        if (_order) url += `&order=${_order}`
        if (_single) url += '&limit=1'
        const res = await fetch(url, { headers: headers({ 'Accept': 'application/json' }) })
        const data = await res.json()
        if (!res.ok) return resolve({ data: null, error: data })
        const result = _single ? (Array.isArray(data) ? data[0]||null : data) : data
        resolve({ data: result, error: null })
      } catch (e) { resolve({ data: null, error: { message: e.message } }) }
    },

    insert: async (rows) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: await headersAsync({ 'Prefer': 'return=representation' }),
          body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
        })
        const data = await res.json()
        if (!res.ok) return { data: null, error: data }
        return { data, error: null }
      } catch (e) { return { data: null, error: { message: e.message } } }
    },

    upsert: async (rows) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: await headersAsync({ 'Prefer': 'return=representation,resolution=merge-duplicates' }),
          body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
        })
        const data = await res.json()
        if (!res.ok) return { data: null, error: data }
        return { data, error: null }
      } catch (e) { return { data: null, error: { message: e.message } } }
    },

    update: (patch) => {
      const doUpdate = async () => {
        try {
          let url = `${SUPABASE_URL}/rest/v1/${table}?`
          _filters.forEach(f => { url += `${f}&` })
          const res = await fetch(url, {
            method: 'PATCH',
            headers: await headersAsync({ 'Prefer': 'return=representation' }),
            body: JSON.stringify(patch),
          })
          const data = await res.json()
          if (!res.ok) return { data: null, error: data }
          return { data, error: null }
        } catch (e) { return { data: null, error: { message: e.message } } }
      }
      const ub = { eq: (col,val) => { _filters.push(`${col}=eq.${encodeURIComponent(val)}`); return ub }, then: (resolve) => doUpdate().then(resolve) }
      return ub
    },

    delete: () => {
      const doDelete = async () => {
        try {
          let url = `${SUPABASE_URL}/rest/v1/${table}?`
          _filters.forEach(f => { url += `${f}&` })
          const res = await fetch(url, { method: 'DELETE', headers: await headersAsync() })
          if (!res.ok) { const data = await res.json(); return { error: data } }
          return { error: null }
        } catch (e) { return { error: { message: e.message } } }
      }
      const db = { eq: (col,val) => { _filters.push(`${col}=eq.${encodeURIComponent(val)}`); return db }, then: (resolve) => doDelete().then(resolve) }
      return db
    },
  }
  return builder
}

export const supabase = { auth, from }

// ─── Supabase Storage API ──────────────────────────────────────────────────────
export const supabaseStorage = {
  // Upload a File or Blob. path = e.g. "companyId/photos/projectId/filename.jpg"
  upload: async (bucket, path, file) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: file,
      })
      if (!res.ok) { const e = await res.json(); return { data: null, error: e } }
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
      return { data: { path, publicUrl }, error: null }
    } catch (e) { return { data: null, error: { message: e.message } } }
  },

  getPublicUrl: (bucket, path) =>
    `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`,

  remove: async (bucket, paths) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken() || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: paths }),
      })
      if (!res.ok) { const e = await res.json(); return { error: e } }
      return { error: null }
    } catch (e) { return { error: { message: e.message } } }
  },
}
