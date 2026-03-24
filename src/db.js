// @ts-nocheck
// ─── db.js — All Supabase database operations ────────────────────────────────
import { supabase } from './supabaseClient'

// Company ID is set once after login
let _companyId = null
let _userId    = null
let _userName  = null

export const initDb = (companyId, userId, userName) => {
  _companyId = companyId
  _userId    = userId
  _userName  = userName
}

const cid = () => _companyId

// ── PROJECTS ──────────────────────────────────────────────────────────────────
export const dbProjects = {
  getAll: () => supabase.from('projects').select('*').eq('company_id', cid()).order('created_at', { ascending: false }),

  add: (p) => supabase.from('projects').insert({
    company_id:  cid(),
    name:        p.name        || '',
    address:     p.address     || '',
    description: p.desc        || '',
    client:      p.client      || {},
    value:       Number(p.value) || 0,
    status:      p.status      || 'quoting',
    progress:    Number(p.progress) || 0,
    phase:       p.phase       || '',
    location:    p.location    || '',
    start_date:  p.startDateISO || p.startDate || null,
    due_date:    p.due || p.endISO || null,
    due_fmt:     p.dueFmt      || '',
    created_by:  _userId,
  }),

  update: (id, patch) => {
    // Map app-shape keys to DB column names
    // Only columns that exist in the projects table (verified against add())
    const dbPatch = {}
    if (patch.name        !== undefined) dbPatch.name       = patch.name
    if (patch.address     !== undefined) dbPatch.address    = patch.address
    if (patch.status      !== undefined) dbPatch.status     = patch.status
    if (patch.progress    !== undefined) dbPatch.progress   = Number(patch.progress) || 0
    if (patch.location    !== undefined) dbPatch.location   = patch.location
    if (patch.value       !== undefined) dbPatch.value      = Number(patch.value) || 0
    if (patch.client      !== undefined) dbPatch.client     = patch.client
    if (patch.startDateISO!== undefined) dbPatch.start_date = patch.startDateISO
    if (patch.due         !== undefined) dbPatch.due_date   = patch.due
    if (patch.dueFmt      !== undefined) dbPatch.due_fmt    = patch.dueFmt
    if (patch.projType    !== undefined) dbPatch.proj_type  = patch.projType
    if (patch.desc        !== undefined) dbPatch.description = patch.desc
    // Uses user JWT via supabase client — respects RLS, no service key in frontend
    return supabase.from('projects').update(dbPatch).eq('id', id)
  },
  delete: (id) => supabase.from('projects').delete().eq('id', id).eq('company_id', cid()),
}

// ── INVOICES ──────────────────────────────────────────────────────────────────
export const dbInvoices = {
  getAll: () => supabase.from('invoices').select('*').eq('company_id', cid()).order('created_at', { ascending: false }),

  add: (inv) => supabase.from('invoices').insert({
    company_id:   cid(),
    project_id:   inv.projId || null,
    inv_id:       inv.invId || inv.id,
    project_name: inv.project || '',
    client:       inv.client || '',
    supplier:     inv.supplier || '',
    description:  inv.desc || '',
    amount:       Number(inv.amount) || 0,
    currency:     inv.currency || 'AED',
    status:       inv.status || 'pending',
    due:          inv.due || null,
    due_fmt:      inv.dueFmt || '',
    inv_date:     inv.invDate || '',
    data_url:     inv.dataUrl || null,
    file_name:    inv.name || null,
    file_size:    inv.size || null,
    created_by:   _userId,
  }),

  update: (id, patch) => {
    const mapped = {}
    if (patch.status !== undefined)      mapped.status      = patch.status
    if (patch.invoiceStatus !== undefined) mapped.status    = patch.invoiceStatus
    if (patch.amount !== undefined)      mapped.amount      = Number(patch.amount)
    if (patch.desc !== undefined)        mapped.description = patch.desc
    if (patch.supplier !== undefined)    mapped.supplier    = patch.supplier
    if (patch.invId !== undefined)       mapped.inv_id      = patch.invId
    if (patch.invDate !== undefined)     mapped.inv_date    = patch.invDate
    if (patch.due !== undefined)         mapped.due         = patch.due
    if (patch.dueFmt !== undefined)      mapped.due_fmt     = patch.dueFmt
    if (patch.currency !== undefined)    mapped.currency    = patch.currency
    if (patch.dataUrl !== undefined)     mapped.data_url    = patch.dataUrl
    if (patch.name !== undefined)        mapped.file_name   = patch.name
    if (patch.size !== undefined)        mapped.file_size   = patch.size
    if (patch.project !== undefined)     mapped.project_name = patch.project
    return supabase.from('invoices').update(mapped).eq('id', id).eq('company_id', cid())
  },

  delete: (id) => supabase.from('invoices').delete().eq('id', id).eq('company_id', cid()),
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export const dbPayments = {
  getAll: () => supabase.from('payments').select('*').eq('company_id', cid()).order('created_at', { ascending: false }),

  add: (p) => supabase.from('payments').insert({
    company_id:   cid(),
    project_id:   p.projId   || null,
    project_name: p.project  || '',
    amount:       Number(p.amount) || 0,
    currency:     p.currency || 'AED',
    method:       p.method   || '',
    date:         p.date     || '',
    invoice_ref:  p.invRef   || p.invoice || '',
    notes:        p.notes    || '',
    receipt_data: p.receipt  || null,
    created_by:   _userId,
  }),

  update: (id, patch) => {
    const mapped = {}
    if (patch.project !== undefined)  mapped.project_name = patch.project
    if (patch.amount !== undefined)   mapped.amount       = Number(patch.amount)
    if (patch.method !== undefined)   mapped.method       = patch.method
    if (patch.date !== undefined)     mapped.date         = patch.date
    if (patch.invoice !== undefined)  mapped.invoice_ref  = patch.invoice
    if (patch.notes !== undefined)    mapped.notes        = patch.notes
    if (patch.receipt  !== undefined) mapped.receipt_data = patch.receipt
    if (patch.currency !== undefined) mapped.currency     = patch.currency
    return supabase.from('payments').update(mapped).eq('id', id).eq('company_id', cid())
  },

  delete: (id) => supabase.from('payments').delete().eq('id', id).eq('company_id', cid()),
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
export const dbTasks = {
  getAll: () => supabase.from('tasks').select('*').eq('company_id', cid()).order('created_at', { ascending: false }),

  add: (t) => supabase.from('tasks').insert({
    company_id:   cid(),
    project_id:   t.projId || null,
    project_name: t.project || '',
    title:        t.title || '',
    description:  t.desc || '',
    member:       t.member || '',
    date:         t.date || '',
    status:       t.status || 'pending',
    created_by:   _userId,
  }),

  update: (id, patch) => {
    const mapped = {}
    if (patch.title !== undefined)   mapped.title        = patch.title
    if (patch.desc !== undefined)    mapped.description  = patch.desc
    if (patch.member !== undefined)  mapped.member       = patch.member
    if (patch.date !== undefined)    mapped.date         = patch.date
    if (patch.status !== undefined)  mapped.status       = patch.status
    if (patch.project !== undefined) mapped.project_name = patch.project
    return supabase.from('tasks').update(mapped).eq('id', id).eq('company_id', cid())
  },

  delete: (id) => supabase.from('tasks').delete().eq('id', id).eq('company_id', cid()),
}

// ── TEAM MEMBERS ──────────────────────────────────────────────────────────────
export const dbTeam = {
  getByProject: (projectId) => supabase.from('team_members').select('*').eq('company_id', cid()).eq('project_id', projectId).order('created_at', { ascending: true }),

  getAll: () => supabase.from('team_members').select('*').eq('company_id', cid()).order('created_at', { ascending: true }),

  add: (m, projectId) => supabase.from('team_members').insert({
    company_id: cid(),
    project_id: projectId,
    name:   m.name || '',
    role:   m.role || '',
    type:   m.type || 'employee',
    status: m.status || 'on-site',
    phone:  m.phone || '',
    email:  m.email || '',
    color:  m.color || '#3b82f6',
    init:   m.name ? m.name.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?',
  }),

  update: (id, patch) => {
    // Map explicitly — never spread raw app object into Supabase update
    const mapped = {}
    if (patch.name   !== undefined) mapped.name   = patch.name
    if (patch.role   !== undefined) mapped.role   = patch.role
    if (patch.type   !== undefined) mapped.type   = patch.type
    if (patch.status !== undefined) mapped.status = patch.status
    if (patch.phone  !== undefined) mapped.phone  = patch.phone
    if (patch.email  !== undefined) mapped.email  = patch.email
    if (patch.color  !== undefined) mapped.color  = patch.color
    if (patch.name   !== undefined) mapped.init   = patch.name.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    return supabase.from('team_members').update(mapped).eq('id', id).eq('company_id', cid())
  },

  delete: (id) => supabase.from('team_members').delete().eq('id', id).eq('company_id', cid()),
}

// ── TENDERS ───────────────────────────────────────────────────────────────────
export const dbTenders = {
  getAll: () => supabase.from('tenders').select('*').eq('company_id', cid()).order('created_at', { ascending: false }),

  add: (t) => supabase.from('tenders').insert({
    company_id:   cid(),
    project_id:   t.projId || null,
    project_name: t.project || '',
    name:         t.name || '',
    description:  t.desc || '',
    offers:       t.offers || [],
    created_by:   _userId,
  }),

  update: (id, patch) => {
    // Map explicitly — never pass raw app object to Supabase
    const mapped = {}
    if (patch.name        !== undefined) mapped.name         = patch.name
    if (patch.desc        !== undefined) mapped.description  = patch.desc
    if (patch.project     !== undefined) mapped.project_name = patch.project
    if (patch.projId      !== undefined) mapped.project_id   = patch.projId
    if (patch.offers      !== undefined) mapped.offers       = patch.offers
    return supabase.from('tenders').update(mapped).eq('id', id).eq('company_id', cid())
  },

  delete: (id) => supabase.from('tenders').delete().eq('id', id).eq('company_id', cid()),
}

// ── ACTIVITY LOG ──────────────────────────────────────────────────────────────
export const dbLog = {
  getRecent: () => supabase.from('activity_log').select('*').eq('company_id', cid()).order('created_at', { ascending: false }),

  push: (action, detail, icon = '●') => supabase.from('activity_log').insert({
    company_id: cid(),
    action,
    detail,
    user_name: _userName || 'User',
    user_id:   _userId,
    icon,
  }),
}

// ── NOTES ─────────────────────────────────────────────────────────────────────
export const dbNotes = {
  getByProject: (projectId) => supabase.from('notes').select('*').eq('company_id', cid()).eq('project_id', projectId).order('created_at', { ascending: false }),

  add: (projectId, text) => supabase.from('notes').insert({
    company_id: cid(),
    project_id: projectId,
    text,
    author: _userName || 'User',
  }),

  delete: (id) => supabase.from('notes').delete().eq('id', id).eq('company_id', cid()),
}

// ── PROFILES (users in company) ───────────────────────────────────────────────
export const dbProfiles = {
  getCompanyUsers: () => supabase.from('profiles').select('*').eq('company_id', cid()),

  // Update non-sensitive profile fields (job title, phone, status, colour)
  // Role and permissions intentionally excluded here — those use dedicated methods below
  updateProfile: (id, patch) => {
    const mapped = {}
    if (patch.job_title !== undefined) mapped.job_title = patch.job_title
    if (patch.phone     !== undefined) mapped.phone     = patch.phone
    if (patch.status    !== undefined) mapped.status    = patch.status
    if (patch.color     !== undefined) mapped.color     = patch.color
    return supabase.from('profiles').update(mapped).eq('id', id)
  },

  // Update tab permissions for a user — RLS enforces only superadmins can do this
  updatePermissions: (userId, permissions) =>
    supabase.from('profiles').update({ permissions }).eq('id', userId),

  // Update role for a user — RLS enforces only superadmins can do this
  updateRole: (userId, role) =>
    supabase.from('profiles').update({ role }).eq('id', userId),

  // Fetch all profiles in the same company — used by UsersPage
  getByCompany: (companyId) =>
    supabase.from('profiles').select('*').eq('company_id', companyId),
}

// ── Helper: map DB row → app shape ────────────────────────────────────────────
export const mapInvoice = (row) => ({
  id:            row.id,
  invId:         row.inv_id || row.id,
  project:       row.project_name || '',
  client:        row.client || '',
  supplier:      row.supplier || '',
  desc:          row.description || '',
  amount:        row.amount || 0,
  currency:      row.currency || 'AED',
  status:        row.status || 'pending',
  invoiceStatus: row.status || 'pending',
  due:           row.due || '',
  dueFmt:        row.due_fmt || '',
  dueDate:       row.due_fmt || '',
  invDate:       row.inv_date || '',
  dataUrl:       row.data_url || null,
  name:          row.file_name || null,
  size:          row.file_size || 0,
  projId:        row.project_id || null,
  iid:           row.inv_id || row.id,
  st:            row.status || 'pending',
  dd:            row.due_fmt || row.due || '—',
})

export const mapPayment = (row) => ({
  id:       row.id,
  project:  row.project_name || '',
  projId:   row.project_id   || null,
  amount:   row.amount       || 0,
  currency: row.currency     || 'AED',
  method:   row.method       || '',
  date:     row.date         || '',
  dateFmt:  row.date ? new Date(row.date + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—',
  invRef:   row.invoice_ref  || '',
  invoice:  row.invoice_ref  || '',
  notes:    row.notes        || '',
  receipt:  row.receipt_data || null,
})

export const mapTask = (row) => ({
  id:      row.id,
  title:   row.title || '',
  desc:    row.description || '',
  member:  row.member || '',
  project: row.project_name || '',
  projId:  row.project_id || null,
  date:    row.date || '',
  status:  row.status || 'pending',
})

export const mapProject = (row) => ({
  id:           row.id,
  name:         row.name         || '',
  address:      row.address      || '',
  client:       row.client       || {},
  contacts:     row.contacts     || [],
  value:        row.value        || 0,
  status:       row.status       || 'active',
  progress:     row.progress     || 0,
  phase:        row.phase        || '',
  location:     row.location     || '',
  desc:         row.description  || '',
  projType:     row.proj_type    || 'business',
  startDate:    row.start_date   || '—',
  startDateISO: row.start_date   || '',
  due:          row.due_date     || null,
  dueFmt:       row.due_fmt      || '—',
  created_at:   row.created_at   || '',
})

export const mapMember = (row) => ({
  id:     row.id,
  name:   row.name || '',
  role:   row.role || '',
  type:   row.type || 'employee',
  status: row.status || 'on-site',
  phone:  row.phone || '',
  email:  row.email || '',
  color:  row.color || '#3b82f6',
  init:   row.init || '?',
  projId: row.project_id || null,
})

export const mapTender = (row) => ({
  id:      row.id,
  name:    row.name || '',
  desc:    row.description || '',
  project: row.project_name || '',
  projId:  row.project_id || null,
  offers:  row.offers || [],
})

export const mapLog = (row) => ({
  id:        row.id,
  action:    row.action     || '',
  detail:    row.detail     || '',
  user:      row.user_name  || '',
  userId:    row.user_id    || null,
  icon:      row.icon       || '●',
  // Short display time (used in log rows)
  time:      new Date(row.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }),
  // Full timestamp for the modal
  createdAt: row.created_at || null,
})

// ── Project Files (photos, plans) ─────────────────────────────────────────────
export const dbFiles = {
  getByProject: (projectId, type) => {
    const q = supabase.from('project_files').select('*').eq('project_id', projectId)
    return type ? q.eq('type', type) : q
  },
  add: (row) => supabase.from('project_files').insert({
    company_id:   row.company_id,
    project_id:   row.project_id,
    type:         row.type,
    name:         row.name         || '',
    size:         row.size         || 0,
    url:          row.url          || '',
    storage_path: row.storage_path || '',
    title:        row.title        || '',
    description:  row.description  || '',
  }),
  remove: (id) => supabase.from('project_files').delete().eq('id', id),
}