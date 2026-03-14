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

  update: (id, patch) => supabase.from('projects').update(patch).eq('id', id).eq('company_id', cid()),

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

  update: (id, patch) => supabase.from('team_members').update({
    ...patch,
    init: patch.name ? patch.name.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : undefined,
  }).eq('id', id).eq('company_id', cid()),

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

  update: (id, patch) => supabase.from('tenders').update(patch).eq('id', id).eq('company_id', cid()),

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
  id:      row.id,
  project: row.project_name || '',
  projId:  row.project_id   || null,
  amount:  row.amount       || 0,
  method:  row.method       || '',
  date:    row.date         || '',
  dateFmt: row.date ? new Date(row.date + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—',
  invRef:  row.invoice_ref  || '',
  invoice: row.invoice_ref  || '',
  notes:   row.notes        || '',
  receipt: row.receipt_data || null,
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
  id:     row.id,
  action: row.action || '',
  detail: row.detail || '',
  user:   row.user_name || '',
  time:   new Date(row.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }),
  icon:   row.icon || '●',
})

// ── Project Files (photos, plans) ─────────────────────────────────────────────
export const dbFiles = {
  getByProject: (projectId, type) => {
    const q = supabase.from('project_files').select('*').eq('project_id', projectId)
    return type ? q.eq('type', type) : q
  },
  add: (row) => supabase.from('project_files').insert(row),
  remove: (id) => supabase.from('project_files').delete().eq('id', id),
}
