// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";

const Icon = ({ d, size=16, stroke="#7a849e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const ICONS = {
  dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  projects:  "M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5",
  estimates: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  invoicing: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-6 4h4",
  payments:  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  team:      "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 4v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  tasks:     "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  tenders:   "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 7l8-4 8 4",
  reports:   "M18 20V10M12 20V4M6 20v-6",
  prices:    "M3 17l4-8 4 4 4-6 4 10M3 21h18",
};

// ─── Storage wrapper ───────────────────────────────────────────────────────────
const storage = {
  get: async (key) => {
    try {
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    } catch (_) {
      return null;
    }
  },
  set: async (key, val) => {
    try {
      localStorage.setItem(key, val);
    } catch (_) {}
  },
};

// ─── Theme tokens ──────────────────────────────────────────────────────────────
const DARK_THEME = {
  bg: '#0f1117',
  surface: '#181c27',
  card: '#1e2333',
  border: '#2a3045',
  accent: '#f59e0b',
  accentDim: '#f59e0b1a',
  accentMid: '#f59e0b44',
  text: '#e8eaf0',
  muted: '#7a849e',
  green: '#22c55e',
  greenDim: '#22c55e1a',
  red: '#ef4444',
  redDim: '#ef44441a',
  blue: '#3b82f6',
  blueDim: '#3b82f61a',
  purple: '#a78bfa',
  purpleDim: '#a78bfa1a',
  overlay: 'rgba(10,12,20,0.82)',
  isDark: true,
};
const LIGHT_THEME = {
  bg: '#f0f2f7',
  surface: '#ffffff',
  card: '#ffffff',
  border: '#dde1eb',
  accent: '#d97706',
  accentDim: '#d977061a',
  accentMid: '#d9770644',
  text: '#111827',
  muted: '#6b7280',
  green: '#16a34a',
  greenDim: '#16a34a1a',
  red: '#dc2626',
  redDim: '#dc26261a',
  blue: '#2563eb',
  blueDim: '#2563eb1a',
  purple: '#7c3aed',
  purpleDim: '#7c3aed1a',
  overlay: 'rgba(17,24,39,0.6)',
  isDark: false,
};

// Mutable ref so non-component helpers (SM, INP, LBL) can always read current theme
const ThemeRef = { current: DARK_THEME };
// C is a proxy that always reads from ThemeRef — works everywhere
const C = new Proxy({}, { get: (_, k) => ThemeRef.current[k] });

const ThemeCtx = React.createContext({
  theme: DARK_THEME,
  toggleTheme: () => {},
});
function useTheme() {
  return React.useContext(ThemeCtx);
}

function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const s = localStorage.getItem('bf_theme');
      return s ? s === 'dark' : true;
    } catch {
      return true;
    }
  });
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  // keep ThemeRef in sync so C proxy works in non-hook contexts
  ThemeRef.current = theme;
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem('bf_theme', next ? 'dark' : 'light');
    } catch {}
  };
  return (
    <ThemeCtx.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

const F = `'Inter','Segoe UI',sans-serif`;

// ─── Static Data ───────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    name: 'Riverside Townhomes',
    address: '14 Harbour Gate St, Dubai Marina, Dubai, UAE',
    client: {
      name: 'Ahmed Al-Rashidi',
      company: 'Apex Realty Group',
      phone: '+971 50 234 5678',
      email: 'ahmed@apexrealty.ae',
      initials: 'AR',
    },
    value: 480000,
    status: 'active',
    progress: 62,
    due: '2025-06-15',
    dueFmt: 'Jun 15, 2025',
    phase: 'Framing',
    location: 'Dubai Marina',
    startDate: 'Jan 12, 2025',
  },
  {
    id: 2,
    name: 'Summit Office Fitout',
    address: 'Business Bay Tower, Floor 12, Business Bay, Dubai',
    client: {
      name: 'Sara Al-Mansouri',
      company: 'TechCorp LLC',
      phone: '+971 55 876 4321',
      email: 'sarah@techcorp.ae',
      initials: 'SM',
    },
    value: 120000,
    status: 'active',
    progress: 34,
    due: '2025-05-30',
    dueFmt: 'May 30, 2025',
    phase: 'Electrical',
    location: 'Business Bay',
    startDate: 'Feb 3, 2025',
  },
  {
    id: 3,
    name: 'Harbour View Terrace',
    address: 'The Walk, JBR, Dubai, UAE',
    client: {
      name: 'Jay Morris',
      company: 'Independent',
      phone: '+971 52 111 9999',
      email: 'jay.morris@gmail.com',
      initials: 'JM',
    },
    value: 28500,
    status: 'quoting',
    progress: 0,
    due: null,
    dueFmt: '—',
    phase: 'Quoting',
    location: 'JBR',
    startDate: '—',
  },
  {
    id: 4,
    name: 'Eastside Warehouse',
    address: 'Al Quoz Industrial Area, Building 7, Dubai, UAE',
    client: {
      name: 'Khalid Al-Naimy',
      company: 'Logistics Corp',
      phone: '+971 4 333 7777',
      email: 'k.naimy@logistics.ae',
      initials: 'KN',
    },
    value: 310000,
    status: 'completed',
    progress: 100,
    due: '2025-03-01',
    dueFmt: 'Mar 1, 2025',
    phase: 'Completed',
    location: 'Al Quoz',
    startDate: 'Sep 10, 2024',
  },
];

const PROJ_INV = {
  1: [
    {
      id: 'INV-041',
      amount: 96000,
      status: 'paid',
      due: '2025-02-01',
      dueFmt: 'Feb 1, 2025',
      desc: 'Foundation & Structure',
    },
    {
      id: 'INV-044',
      amount: 144000,
      status: 'pending',
      due: '2025-03-28',
      dueFmt: 'Mar 28, 2025',
      desc: 'Framing Milestone',
    },
  ],
  2: [
    {
      id: 'INV-042',
      amount: 40800,
      status: 'overdue',
      due: '2025-02-20',
      dueFmt: 'Feb 20, 2025',
      desc: 'Initial Electrical Work',
    },
  ],
  3: [],
  4: [
    {
      id: 'INV-038',
      amount: 120000,
      status: 'paid',
      due: '2024-11-10',
      dueFmt: 'Nov 10, 2024',
      desc: 'Phase 1 – Civil Works',
    },
    {
      id: 'INV-039',
      amount: 95000,
      status: 'paid',
      due: '2024-12-15',
      dueFmt: 'Dec 15, 2024',
      desc: 'Phase 2 – Structure',
    },
    {
      id: 'INV-040',
      amount: 95000,
      status: 'paid',
      due: '2025-01-20',
      dueFmt: 'Jan 20, 2025',
      desc: 'Phase 3 – Completion',
    },
  ],
};

const ALL_INV_STATIC = [
  {
    id: 'INV-041',
    project: 'Riverside Townhomes',
    client: 'Apex Realty Group',
    amount: 96000,
    status: 'paid',
    due: '2025-02-01',
    dueFmt: 'Feb 1, 2025',
    desc: 'Foundation & Structure',
  },
  {
    id: 'INV-042',
    project: 'Summit Office Fitout',
    client: 'TechCorp LLC',
    amount: 40800,
    status: 'overdue',
    due: '2025-02-20',
    dueFmt: 'Feb 20, 2025',
    desc: 'Initial Electrical Work',
  },
  {
    id: 'INV-043',
    project: 'Maple Street Ext.',
    client: 'City Works',
    amount: 57600,
    status: 'pending',
    due: '2025-03-15',
    dueFmt: 'Mar 15, 2025',
    desc: 'Road Extension Phase 1',
  },
  {
    id: 'INV-044',
    project: 'Riverside Townhomes',
    client: 'Apex Realty Group',
    amount: 144000,
    status: 'pending',
    due: '2025-03-28',
    dueFmt: 'Mar 28, 2025',
    desc: 'Framing Milestone',
  },
];

const PROJ_CREW_SEED = {
  1: [
    {
      id: 1,
      name: 'Marcus Webb',
      role: 'Site Foreman',
      type: 'employee',
      status: 'on-site',
      init: 'MW',
      color: '#3b82f6',
      projId: 1,
    },
    {
      id: 2,
      name: 'Delta Electric',
      role: 'Electrician',
      type: 'subcontractor',
      status: 'scheduled',
      init: 'DE',
      color: '#a78bfa',
      projId: 1,
    },
    {
      id: 3,
      name: 'Jenna Torres',
      role: 'Project Manager',
      type: 'employee',
      status: 'remote',
      init: 'JT',
      color: '#22c55e',
      projId: 1,
    },
    {
      id: 4,
      name: 'ClearView Plumbing',
      role: 'Plumber',
      type: 'subcontractor',
      status: 'on-site',
      init: 'CP',
      color: '#f59e0b',
      projId: 1,
    },
  ],
  2: [
    {
      id: 1,
      name: "Ray O'Konko",
      role: 'Carpenter',
      type: 'employee',
      status: 'on-site',
      init: 'RO',
      color: '#3b82f6',
      projId: 2,
    },
    {
      id: 2,
      name: 'Delta Electric',
      role: 'Electrician',
      type: 'subcontractor',
      status: 'on-site',
      init: 'DE',
      color: '#a78bfa',
      projId: 2,
    },
  ],
  3: [],
  4: [
    {
      id: 1,
      name: 'Marcus Webb',
      role: 'Site Foreman',
      type: 'employee',
      status: 'on-site',
      init: 'MW',
      color: '#3b82f6',
      projId: 4,
    },
  ],
};

const PROJ_LOGS_SEED = {
  1: [
    {
      id: 101,
      action: 'Photo uploaded',
      detail: 'Progress_site_week9.jpg',
      user: 'Marcus Webb',
      time: '10 min ago',
      icon: '📷',
    },
    {
      id: 102,
      action: 'Invoice sent',
      detail: 'INV-044 · $144,000',
      user: 'Jordan Blake',
      time: '2 hrs ago',
      icon: '🧾',
    },
    {
      id: 103,
      action: 'Note added',
      detail: 'Client wall insulation request',
      user: 'Jordan Blake',
      time: 'Mar 5',
      icon: '📝',
    },
    {
      id: 104,
      action: 'Plan uploaded',
      detail: 'Foundation_Layout_v3.dwg',
      user: 'Marcus Webb',
      time: 'Feb 28',
      icon: '📐',
    },
  ],
  2: [
    {
      id: 201,
      action: 'Overdue invoice',
      detail: 'INV-042 · $40,800',
      user: 'System',
      time: '2 days ago',
      icon: '⚠️',
    },
  ],
  3: [
    {
      id: 301,
      action: 'Project created',
      detail: 'Harbour View Terrace',
      user: 'Jordan Blake',
      time: 'Mar 1',
      icon: '🏗',
    },
  ],
  4: [
    {
      id: 401,
      action: 'Project completed',
      detail: 'All phases complete',
      user: 'System',
      time: 'Mar 1',
      icon: '🏆',
    },
  ],
};

const PROJ_NOTES_SEED = {
  1: [
    {
      id: 1,
      text: 'Client requested extra insulation on north-facing walls. Confirmed with Marcus.',
      author: 'Jordan Blake',
      time: 'Mar 5',
    },
    {
      id: 2,
      text: 'Structural engineer sign-off received for foundation phase.',
      author: 'Jenna Torres',
      time: 'Feb 28',
    },
  ],
  2: [
    {
      id: 1,
      text: 'Invoice INV-042 is overdue. Need to follow up with client.',
      author: 'Jordan Blake',
      time: 'Mar 2',
    },
  ],
  3: [],
  4: [
    {
      id: 1,
      text: 'Project complete. All final inspections passed.',
      author: 'Marcus Webb',
      time: 'Mar 1',
    },
  ],
};

const TASKS_SEED = [
  {
    id: 't1',
    title: 'Site Inspection',
    desc: 'Weekly walkthrough of all active zones',
    member: 'Marcus Webb',
    project: 'Riverside Townhomes',
    projId: 1,
    date: '2025-03-10',
    status: 'pending',
  },
  {
    id: 't2',
    title: 'Electrical Rough-in',
    desc: 'Complete rough-in wiring for floors 1–3',
    member: 'Delta Electric',
    project: 'Riverside Townhomes',
    projId: 1,
    date: '2025-03-12',
    status: 'pending',
  },
  {
    id: 't3',
    title: 'PM Progress Review',
    desc: 'Review milestones and update client',
    member: 'Jenna Torres',
    project: 'Riverside Townhomes',
    projId: 1,
    date: '2025-03-14',
    status: 'done',
  },
  {
    id: 't4',
    title: 'Plumbing Fit-off',
    desc: 'Install all plumbing fixtures',
    member: 'ClearView Plumbing',
    project: 'Riverside Townhomes',
    projId: 1,
    date: '2025-03-18',
    status: 'pending',
  },
  {
    id: 't5',
    title: 'Electrical Panel Install',
    desc: 'Mount and wire main distribution panel',
    member: 'Delta Electric',
    project: 'Summit Office Fitout',
    projId: 2,
    date: '2025-03-11',
    status: 'pending',
  },
  {
    id: 't6',
    title: 'Carpentry Work',
    desc: 'Install all custom cabinetry',
    member: "Ray O'Konko",
    project: 'Summit Office Fitout',
    projId: 2,
    date: '2025-03-13',
    status: 'pending',
  },
  {
    id: 't7',
    title: 'Final Walkthrough',
    desc: 'Final sign-off inspection with client',
    member: 'Marcus Webb',
    project: 'Eastside Warehouse',
    projId: 4,
    date: '2025-03-05',
    status: 'done',
  },
];

const TENDERS_SEED = [
  {
    id: 'ten1',
    name: 'Structural Steel Beams',
    projId: 1,
    project: 'Riverside Townhomes',
    desc: 'I-beams and hollow sections for floors 2–4 framing',
    offers: [
      {
        id: 'o1',
        supplier: 'Gulf Steel Co.',
        price: 42000,
        quality: 'High – ISO certified',
        delivery: '10 days',
        notes: 'Includes delivery to site',
      },
      {
        id: 'o2',
        supplier: 'AlMadar Metals',
        price: 38500,
        quality: 'Medium – standard grade',
        delivery: '14 days',
        notes: 'Discount for full payment upfront',
      },
      {
        id: 'o3',
        supplier: 'Emirates Iron LLC',
        price: 44800,
        quality: 'Premium – EN-10025 certified',
        delivery: '7 days',
        notes: 'Fastest delivery, premium grade',
      },
    ],
  },
  {
    id: 'ten2',
    name: 'Ready-Mix Concrete',
    projId: 1,
    project: 'Riverside Townhomes',
    desc: 'C30 concrete mix for slab pours',
    offers: [
      {
        id: 'o4',
        supplier: 'Dubai Ready Mix',
        price: 18000,
        quality: 'High – BS 8500 compliant',
        delivery: '3 days',
        notes: 'Batching plant 2km from site',
      },
      {
        id: 'o5',
        supplier: 'Concrete Plus',
        price: 16200,
        quality: 'Standard – basic mix design',
        delivery: '5 days',
        notes: 'Cheaper but longer lead time',
      },
    ],
  },
];

// ─── Status styles ─────────────────────────────────────────────────────────────
const SM = {
  active: { bg: C.greenDim, color: C.green, label: 'Active' },
  completed: { bg: C.blueDim, color: C.blue, label: 'Completed' },
  quoting: { bg: C.accentDim, color: C.accent, label: 'Quoting' },
  paid: { bg: C.greenDim, color: C.green, label: 'Paid' },
  overdue: { bg: C.redDim, color: C.red, label: 'Overdue' },
  pending: { bg: C.accentDim, color: C.accent, label: 'Pending' },
  done: { bg: C.greenDim, color: C.green, label: 'Done' },
  'on-site': { bg: C.greenDim, color: C.green, label: 'On Site' },
  scheduled: { bg: C.blueDim, color: C.blue, label: 'Scheduled' },
  remote: { bg: C.purpleDim, color: C.purple, label: 'Remote' },
  employee: { bg: C.blueDim, color: C.blue, label: 'Employee' },
  subcontractor: { bg: C.accentDim, color: C.accent, label: 'Sub' },
  cad: { bg: C.blueDim, color: C.blue, label: 'CAD' },
  drawing: { bg: C.purpleDim, color: C.purple, label: 'Drawing' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtBytes(b) {
  if (!b || b < 1024) return (b || 0) + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function planCat(n) {
  const l = n.toLowerCase();
  if (['.dwg', '.dxf', '.rvt', '.ifc', '.skp'].some((e) => l.endsWith(e)))
    return 'cad';
  return 'drawing';
}
function planIcon(c) {
  return c === 'cad' ? 'CAD' : 'DWG';
}
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function firstDayOfMonth(y, m) {
  return new Date(y, m, 1).getDay();
}
function inRange(dateStr, from, to) {
  if (!from && !to) return true;
  const d = new Date(dateStr + 'T00:00:00');
  if (from && d < new Date(from + 'T00:00:00')) return false;
  if (to && d > new Date(to + 'T23:59:59')) return false;
  return true;
}

// ── Progress calculator: uses project dates to compute timeline-based progress ──
function calcProgress(project) {
  // If project is completed always 100
  if (project.status === 'completed') return 100;
  // If quoting or no dates, return stored value (0 for quoting)
  const startISO = project.startDateISO || project.start;
  const endISO = project.due;
  if (!startISO || !endISO) return project.progress || 0;
  const start = new Date(startISO + 'T00:00:00').getTime();
  const end = new Date(endISO + 'T00:00:00').getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end)
    return project.status === 'completed'
      ? 100
      : Math.min(project.progress || 99, 99);
  const pct = ((now - start) / (end - start)) * 100;
  return Math.round(Math.min(Math.max(pct, 0), 100));
}
function daysRemaining(project) {
  const endISO = project.due;
  if (!endISO) return null;
  const diff = new Date(endISO + 'T00:00:00').getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MCOLORS = [
  C.blue,
  C.purple,
  C.green,
  C.accent,
  '#f43f5e',
  '#06b6d4',
  '#84cc16',
];
const ROLES = [
  'Architect',
  'Structural Engineer',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Site Foreman',
  'Project Manager',
  'Draftsman',
  'General Contractor',
  'Laborers',
  'Other',
];

// ─── Shared UI ─────────────────────────────────────────────────────────────────
const INP = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  padding: '9px 12px',
  color: C.text,
  fontFamily: F,
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};
const LBL = {
  color: C.muted,
  fontFamily: F,
  fontSize: 11,
  fontWeight: 700,
  display: 'block',
  marginBottom: 5,
};

function Badge({ status }) {
  const s = SM[status] || { bg: '#fff1', color: '#aaa', label: status };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '3px 10px',
        borderRadius: 4,
        fontSize: 11,
        fontFamily: F,
        fontWeight: 700,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}
function Bar({ pct, color }) {
  return (
    <div
      style={{
        background: C.border,
        borderRadius: 4,
        height: 6,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          background: color || C.accent,
          height: '100%',
          borderRadius: 4,
          transition: 'width .6s ease',
        }}
      />
    </div>
  );
}
function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: C.overlay,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
function SLabel({ children }) {
  return (
    <div
      style={{
        color: C.muted,
        fontFamily: F,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

// ─── InlineFormShell ──────────────────────────────────────────────────────────
// Renders a form INSIDE the module card — no overlay, no fixed positioning.
// • header: title string or node
// • accent: colour for the save button
// • saveLabel / onSave / onCancel: actions
// • children: the form fields
function InlineFormShell({
  header,
  accent = C.accent,
  saveLabel = 'Save',
  onSave,
  onCancel,
  children,
  err,
}) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        background: C.surface,
        overflow: 'hidden',
        marginTop: 4,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.card,
        }}
      >
        <span
          style={{
            color: C.text,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {header}
        </span>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.muted,
            fontSize: 20,
            lineHeight: 1,
            cursor: 'pointer',
            padding: '0 2px',
          }}
        >
          ✕
        </button>
      </div>
      {/* Scrollable body */}
      <div
        style={{ overflowY: 'auto', maxHeight: 480, padding: '18px 18px 0' }}
      >
        {err && (
          <div
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}44`,
              borderRadius: 7,
              padding: '9px 12px',
              color: C.red,
              fontFamily: F,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            ⚠ {err}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
        {/* spacer so last field clears the sticky footer */}
        <div style={{ height: 16 }} />
      </div>
      {/* Sticky footer */}
      <div
        style={{
          padding: '12px 18px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
          background: C.card,
        }}
      >
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            color: C.muted,
            border: `1px solid ${C.border}`,
            padding: '9px 18px',
            borderRadius: 7,
            fontFamily: F,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          style={{
            background: accent,
            color: accent === C.accent ? '#000' : '#fff',
            border: 'none',
            padding: '9px 26px',
            borderRadius: 7,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
// Reusable confirmation dialog for delete / edit actions.
// variant: "delete" (red) | "edit" (amber) | "warn" (amber)
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'delete',
  onConfirm,
  onCancel,
  children,
}) {
  const isDelete = variant === 'delete';
  const accentColor = isDelete ? C.red : C.accent;
  const accentDim = isDelete ? C.redDim : C.accentDim;
  const icon = isDelete ? 'DEL' : 'EDIT';
  return (
    <Overlay onClose={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          border: `1px solid ${accentColor}44`,
          borderRadius: 18,
          padding: '32px 28px',
          width: 420,
          maxWidth: '92vw',
          boxShadow: '0 24px 60px rgba(0,0,0,.45)',
          fontFamily: F,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: accentDim,
            border: `2px solid ${accentColor}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d={
                isDelete
                  ? 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6'
                  : 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'
              }
            />
          </svg>
        </div>
        {/* Title + message */}
        <div style={{ textAlign: 'center', marginBottom: children ? 16 : 24 }}>
          <div
            style={{
              color: C.text,
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 10,
            }}
          >
            {title}
          </div>
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.65 }}>
            {message}
          </div>
        </div>
        {/* Optional extra content (e.g. item preview) */}
        {children && <div style={{ marginBottom: 22 }}>{children}</div>}
        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'transparent',
              color: C.text,
              border: `1px solid ${C.border}`,
              padding: '12px 0',
              borderRadius: 9,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: F,
              transition: 'all .15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = C.accent + '88')
            }
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: accentColor,
              color: isDelete ? '#fff' : '#000',
              border: 'none',
              padding: '12px 0',
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: F,
              transition: 'opacity .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────
function useFiles(key) {
  const [files, setFiles] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await storage.get(key);
        if (alive) setFiles(r ? JSON.parse(r.value) : []);
      } catch (_) {
        if (alive) setFiles([]);
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [key]);
  const persist = async (next) => {
    setFiles(next);
    await storage.set(key, JSON.stringify(next));
  };
  return {
    files,
    ready,
    add: (f) => persist([...files, f]),
    remove: (id) => persist(files.filter((f) => f.id !== id)),
    update: (id, p) =>
      persist(files.map((f) => (f.id === id ? { ...f, ...p } : f))),
  };
}
function useTeam(projectId) {
  const seed = PROJ_CREW_SEED[projectId] || [];
  const [members, setMembers] = useState(null);
  const key = `team:${projectId}`;
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get(key);
      if (!alive) return;
      if (r) setMembers(JSON.parse(r.value));
      else {
        setMembers(seed);
        await storage.set(key, JSON.stringify(seed));
      }
    })();
    return () => {
      alive = false;
    };
  }, [projectId]);
  const save = async (next) => {
    setMembers(next);
    await storage.set(key, JSON.stringify(next));
  };
  return {
    members: members || [],
    ready: members !== null,
    addMember: (m) => save([...(members || []), m]),
    removeMember: (id) => save((members || []).filter((m) => m.id !== id)),
    updateMember: (id, patch) =>
      save(
        (members || []).map((m) =>
          m.id === id
            ? {
                ...m,
                ...patch,
                init: patch.name
                  ? patch.name
                      .trim()
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : m.init,
              }
            : m
        )
      ),
  };
}
function useTasks() {
  const [tasks, setTasks] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get('tasks:global');
      if (!alive) return;
      if (r) setTasks(JSON.parse(r.value));
      else {
        setTasks(TASKS_SEED);
        await storage.set('tasks:global', JSON.stringify(TASKS_SEED));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const save = async (next) => {
    setTasks(next);
    await storage.set('tasks:global', JSON.stringify(next));
  };
  return {
    tasks: tasks || [],
    ready: tasks !== null,
    addTask: (t) => save([...(tasks || []), t]),
    removeTask: (id) => save((tasks || []).filter((t) => t.id !== id)),
    updateTask: (id, p) =>
      save((tasks || []).map((t) => (t.id === id ? { ...t, ...p } : t))),
  };
}
function useTenders() {
  const [tenders, setTenders] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get('tenders:global');
      if (!alive) return;
      if (r) setTenders(JSON.parse(r.value));
      else {
        setTenders(TENDERS_SEED);
        await storage.set('tenders:global', JSON.stringify(TENDERS_SEED));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const save = async (next) => {
    setTenders(next);
    await storage.set('tenders:global', JSON.stringify(next));
  };
  return {
    tenders: tenders || [],
    ready: tenders !== null,
    addTender: (t) => save([...(tenders || []), t]),
    removeTender: (id) => save((tenders || []).filter((t) => t.id !== id)),
    addOffer: (tid, o) =>
      save(
        (tenders || []).map((t) =>
          t.id === tid ? { ...t, offers: [...t.offers, o] } : t
        )
      ),
    removeOffer: (tid, oid) =>
      save(
        (tenders || []).map((t) =>
          t.id === tid
            ? { ...t, offers: t.offers.filter((o) => o.id !== oid) }
            : t
        )
      ),
  };
}

// ─── useProjects hook (dynamic projects on top of seed) ───────────────────────
function usePayments() {
  const [payments, setPayments] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get('payments:global');
      if (!alive) return;
      setPayments(r ? JSON.parse(r.value) : []);
    })();
    return () => {
      alive = false;
    };
  }, []);
  const save = async (next) => {
    setPayments(next);
    await storage.set('payments:global', JSON.stringify(next));
  };
  return {
    payments: payments || [],
    ready: payments !== null,
    addPayment: (p) => save([...(payments || []), p]),
    removePayment: (id) => save((payments || []).filter((p) => p.id !== id)),
    updatePayment: (id, patch) =>
      save((payments || []).map((p) => (p.id === id ? { ...p, ...patch } : p))),
  };
}

function useProjects() {
  const [extra, setExtra] = useState(null);
  const [edits, setEdits] = useState(null); // patches for static projects
  const [deleted, setDeleted] = useState(null); // set of deleted static project ids
  useEffect(() => {
    let alive = true;
    (async () => {
      const [r1, r2, r3] = await Promise.all([
        storage.get('projects:extra'),
        storage.get('projects:edits'),
        storage.get('projects:deleted'),
      ]);
      if (!alive) return;
      setExtra(r1 ? JSON.parse(r1.value) : []);
      setEdits(r2 ? JSON.parse(r2.value) : {});
      setDeleted(r3 ? new Set(JSON.parse(r3.value)) : new Set());
    })();
    return () => {
      alive = false;
    };
  }, []);
  const saveExtra = async (next) => {
    setExtra(next);
    await storage.set('projects:extra', JSON.stringify(next));
  };
  const saveEdits = async (next) => {
    setEdits(next);
    await storage.set('projects:edits', JSON.stringify(next));
  };
  const saveDeleted = async (next) => {
    setDeleted(next);
    await storage.set('projects:deleted', JSON.stringify([...next]));
  };

  const addProject = (p) => saveExtra([...(extra || []), p]);

  const updateProject = async (id, patch) => {
    if ((extra || []).find((p) => p.id === id)) {
      await saveExtra(
        (extra || []).map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    } else {
      const next = {
        ...(edits || {}),
        [id]: { ...((edits || {})[id] || {}), ...patch },
      };
      await saveEdits(next);
    }
  };

  // Permanently delete a project (extra) or mark static project hidden
  const deleteProject = async (id) => {
    if ((extra || []).find((p) => p.id === id)) {
      await saveExtra((extra || []).filter((p) => p.id !== id));
    } else {
      const next = new Set(deleted || []);
      next.add(id);
      await saveDeleted(next);
    }
    // Also clean up its edits entry
    if ((edits || {})[id]) {
      const nextE = { ...(edits || {}) };
      delete nextE[id];
      await saveEdits(nextE);
    }
  };

  const allProjects = useMemo(
    () => [
      ...PROJECTS.filter((p) => !(deleted || new Set()).has(p.id)).map((p) => ({
        ...p,
        ...((edits || {})[p.id] || {}),
      })),
      ...(extra || []),
    ],
    [extra, edits, deleted]
  );

  return {
    allProjects,
    extraProjects: extra || [],
    addProject,
    updateProject,
    deleteProject,
    ready: extra !== null && edits !== null && deleted !== null,
  };
}

// ─── Global Activity Log hook ──────────────────────────────────────────────────
function useGlobalLog() {
  const [log, setLog] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get('globallog');
      if (!alive) return;
      setLog(r ? JSON.parse(r.value) : []);
    })();
    return () => {
      alive = false;
    };
  }, []);
  const push = async (entry) => {
    const next = [entry, ...(log || [])];
    setLog(next);
    await storage.set('globallog', JSON.stringify(next));
  };
  return { log: log || [], push };
}

// ─── DropZone ──────────────────────────────────────────────────────────────────
function DropZone({ onFiles, busy, label }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = Array.from(e.dataTransfer.files);
        if (f.length) onFiles(f);
      }}
      style={{
        border: `2px dashed ${drag ? C.accent : C.border}`,
        borderRadius: 10,
        padding: '16px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        background: drag ? C.accentDim : 'transparent',
        transition: 'all .2s',
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>{busy ? '...' : '+'}</div>
      <div
        style={{
          color: busy ? C.accent : C.muted,
          fontFamily: F,
          fontSize: 12,
        }}
      >
        {busy ? 'Uploading…' : label || 'Drop files here or click to browse'}
      </div>
      <input
        ref={ref}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = Array.from(e.target.files);
          if (f.length) onFiles(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── Modals ────────────────────────────────────────────────────────────────────
function ContactModal({ client, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          width: 360,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Client Contact
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            paddingBottom: 18,
            marginBottom: 18,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: C.accentDim,
              border: `2px solid ${C.accentMid}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.accent,
              fontFamily: F,
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {client.initials}
          </div>
          <div>
            <div
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {client.name}
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {client.company}
            </div>
          </div>
        </div>
        {[
          ['📞', 'Phone', client.phone],
          ['✉️', 'Email', client.email],
        ].map(([icon, lbl, val]) => (
          <div
            key={lbl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: C.surface,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            <div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                {lbl}
              </div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {val}
              </div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <a
            href={`tel:${client.phone}`}
            style={{
              flex: 1,
              background: C.accent,
              color: '#000',
              padding: '10px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Call
          </a>
          <a
            href={`mailto:${client.email}`}
            style={{
              flex: 1,
              background: C.surface,
              color: C.text,
              border: `1px solid ${C.border}`,
              padding: '10px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Email
          </a>
        </div>
      </div>
    </Overlay>
  );
}

const INV_ST = [
  { v: 'pending', l: 'Pending', c: C.accent },
  { v: 'paid', l: 'Paid', c: C.green },
  { v: 'overdue', l: 'Overdue', c: C.red },
];

// AI Invoice extraction helper
async function aiExtractInvoice(file) {
  if (!file.dataUrl) return null;
  const isImg = file.dataUrl.startsWith('data:image');
  const isPdf = file.name?.toLowerCase().endsWith('.pdf');
  try {
    const msgContent = isImg
      ? [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: file.dataUrl.split(';')[0].split(':')[1],
              data: file.dataUrl.split(',')[1],
            },
          },
          {
            type: 'text',
            text: 'Extract invoice data from this image. Return ONLY valid JSON with fields: supplierName, invoiceNumber, invoiceDate (YYYY-MM-DD), dueDate (YYYY-MM-DD), amount (number), currency, description. Use null for missing fields.',
          },
        ]
      : [
          {
            type: 'text',
            text: `Extract invoice data from this document named "${file.name}". Return ONLY valid JSON with fields: supplierName, invoiceNumber, invoiceDate (YYYY-MM-DD), dueDate (YYYY-MM-DD), amount (number), currency, description. Use null for missing fields.`,
          },
        ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: msgContent }],
      }),
    });
    const data = await res.json();
    const text = data.content?.find((b) => b.type === 'text')?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}

function InvModal({ pending, onConfirm, onCancel }) {
  const [step, setStep] = useState('upload'); // upload | review
  const [extracting, setExtracting] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [invNum, setInvNum] = useState('');
  const [invDate, setInvDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('pending');
  const [aiNote, setAiNote] = useState('');

  useEffect(() => {
    if (!pending) return;
    setStep('upload');
    setSupplier('');
    setInvNum('');
    setInvDate('');
    setDueDate('');
    setAmount('');
    setCurrency('USD');
    setDesc('');
    setStatus('pending');
    setAiNote('');
  }, [pending]);

  const runExtract = async () => {
    setExtracting(true);
    setAiNote('');
    const result = await aiExtractInvoice(pending);
    if (result) {
      if (result.supplierName) setSupplier(result.supplierName);
      if (result.invoiceNumber) setInvNum(result.invoiceNumber);
      if (result.invoiceDate) setInvDate(result.invoiceDate);
      if (result.dueDate) setDueDate(result.dueDate);
      if (result.amount) setAmount(String(result.amount));
      if (result.currency) setCurrency(result.currency);
      if (result.description) setDesc(result.description);
      setAiNote(
        'OK AI extracted data from your file — please review and correct if needed.'
      );
    } else {
      setAiNote(
        '⚠️ Could not extract data automatically. Please fill in the fields manually.'
      );
    }
    setStep('review');
    setExtracting(false);
  };

  if (!pending) return null;
  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          width: 500,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '22px 26px 0', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 17,
                }}
              >
                🧾 Add Invoice
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {pending.name}
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
          {/* Steps */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
            {[
              ['1', 'Upload'],
              ['2', 'Review & Save'],
            ].map(([n, l], i) => {
              const done = step === 'review' && i === 0;
              const active =
                (step === 'upload' && i === 0) ||
                (step === 'review' && i === 1);
              return (
                <div
                  key={n}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: i === 0 ? 0 : 1,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: done
                          ? C.green
                          : active
                          ? C.accent
                          : C.border,
                        color: done || active ? '#000' : C.muted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {done ? '✓' : n}
                    </div>
                    <span
                      style={{
                        color: active ? C.text : done ? C.green : C.muted,
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: active ? 700 : 400,
                      }}
                    >
                      {l}
                    </span>
                  </div>
                  {i === 0 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: done ? C.green : C.border,
                        borderRadius: 1,
                        margin: '0 10px',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 26px' }}>
          {step === 'upload' && (
            <div style={{ paddingBottom: 8 }}>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: '28px 20px',
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>🧾</div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  {pending.name}
                </div>
                <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
                  {pending.size ? (pending.size / 1024).toFixed(1) + ' KB' : ''}
                </div>
                {pending.dataUrl?.startsWith('data:image') && (
                  <img
                    src={pending.dataUrl}
                    alt=""
                    style={{
                      maxWidth: '100%',
                      maxHeight: 180,
                      objectFit: 'contain',
                      borderRadius: 8,
                      marginTop: 12,
                      border: `1px solid ${C.border}`,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  background: 'linear-gradient(135deg,#a78bfa08,#3b82f608)',
                  border: `1px solid ${C.purple}33`,
                  borderRadius: 10,
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span
                    style={{
                      color: C.purple,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    AI Invoice Extraction
                  </span>
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Click below to automatically extract supplier name, invoice
                  number, dates, amount, and description from your file.
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div style={{ paddingBottom: 8 }}>
              {aiNote && (
                <div
                  style={{
                    background: aiNote.startsWith('OK')
                      ? C.greenDim
                      : C.accentDim,
                    border: `1px solid ${
                      aiNote.startsWith('OK') ? C.green + '44' : C.accent + '44'
                    }`,
                    borderRadius: 8,
                    padding: '9px 13px',
                    color: aiNote.startsWith('OK') ? C.green : C.accent,
                    fontFamily: F,
                    fontSize: 12,
                    marginBottom: 16,
                  }}
                >
                  {aiNote}
                </div>
              )}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label style={LBL}>Supplier / Company Name</label>
                    <input
                      style={INP}
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="e.g. Gulf Steel Co."
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Invoice #</label>
                    <input
                      style={INP}
                      value={invNum}
                      onChange={(e) => setInvNum(e.target.value)}
                      placeholder="INV-001"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Invoice Date</label>
                    <input
                      style={{ ...INP, colorScheme: 'dark' }}
                      type="date"
                      value={invDate}
                      onChange={(e) => setInvDate(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Due Date</label>
                    <input
                      style={{ ...INP, colorScheme: 'dark' }}
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label style={LBL}>Total Amount</label>
                    <input
                      style={INP}
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ ...INP, cursor: 'pointer' }}
                    >
                      {['USD', 'AED', 'SAR', 'EUR', 'GBP', 'QAR', 'KWD'].map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={LBL}>Description</label>
                  <textarea
                    style={{ ...INP, resize: 'none' }}
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Invoice summary or scope"
                  />
                </div>
                <div>
                  <label style={LBL}>Status</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {INV_ST.map((s) => (
                      <button
                        key={s.v}
                        onClick={() => setStatus(s.v)}
                        style={{
                          flex: 1,
                          padding: '9px 0',
                          borderRadius: 7,
                          cursor: 'pointer',
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: 700,
                          border:
                            status === s.v
                              ? `2px solid ${s.c}`
                              : `1px solid ${C.border}`,
                          background:
                            status === s.v ? s.c + '22' : 'transparent',
                          color: status === s.v ? s.c : C.muted,
                        }}
                      >
                        {s.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '18px 26px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {step === 'upload' ? (
            <>
              <button
                onClick={onCancel}
                style={{
                  background: 'transparent',
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  padding: '11px 18px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={runExtract}
                disabled={extracting}
                style={{
                  background: C.purple,
                  color: '#fff',
                  border: 'none',
                  padding: '11px 28px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: extracting ? 0.7 : 1,
                }}
              >
                {extracting ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid #fff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin .7s linear infinite',
                      }}
                    />
                    Extracting…
                  </>
                ) : (
                  <>🤖 Extract with AI</>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('upload')}
                style={{
                  background: 'transparent',
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  padding: '11px 18px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() =>
                  onConfirm({
                    status,
                    desc: desc || invNum || 'Invoice',
                    amount,
                    due: dueDate,
                    supplier,
                    invNum,
                    invDate,
                    currency,
                  })
                }
                style={{
                  background: C.accent,
                  color: '#000',
                  border: 'none',
                  padding: '11px 28px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ✓ Save Invoice
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function FilePreviewModal({ file, onClose }) {
  if (!file) return null;
  const isImg = file?.dataUrl?.startsWith('data:image');
  return (
    <Overlay onClose={onClose}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 28,
          width: 560,
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            color: C.muted,
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 28 }}>{file.icon || 'DOC'}</span>
          <div>
            <div style={{ color: C.text, fontFamily: F, fontWeight: 700 }}>
              {file.name}
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              {fmtBytes(file.size)}
            </div>
          </div>
        </div>
        {isImg ? (
          <img
            src={file.dataUrl}
            alt={file.name}
            style={{
              width: '100%',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
            }}
          />
        ) : (
          <div
            style={{
              background: C.surface,
              borderRadius: 10,
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>
              {file.icon || 'DOC'}
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              Open in a compatible application
            </div>
            {file.dataUrl && (
              <a
                href={file.dataUrl}
                download={file.name}
                style={{
                  background: C.accent,
                  color: '#000',
                  padding: '8px 20px',
                  borderRadius: 6,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                ↓ Download
              </a>
            )}
          </div>
        )}
      </div>
    </Overlay>
  );
}

function AddMemberModal({ project, onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [projId, setProjId] = useState(project.id);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('on-site');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!name.trim()) {
      setErr('Name is required');
      return;
    }
    if (!phone.trim()) {
      setErr('Phone is required');
      return;
    }
    const color = MCOLORS[Math.floor(Math.random() * MCOLORS.length)];
    const init = name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    onConfirm({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      role,
      projId,
      phone: phone.trim(),
      email: email.trim(),
      status,
      color,
      init,
      type: 'employee',
    });
  };
  const ST = [
    { v: 'on-site', l: 'On Site' },
    { v: 'scheduled', l: 'Scheduled' },
    { v: 'remote', l: 'Remote' },
  ];
  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          width: 460,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <span
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            Add Team Member
          </span>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        {err && (
          <div
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}44`,
              borderRadius: 7,
              padding: '8px 12px',
              color: C.red,
              fontFamily: F,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {err}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LBL}>Full Name *</label>
            <input
              style={INP}
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr('');
              }}
            />
          </div>
          <div>
            <label style={LBL}>Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>Project</label>
            <select
              value={projId}
              onChange={(e) => setProjId(Number(e.target.value))}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {(allProjects || PROJECTS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>Phone *</label>
            <input
              style={INP}
              placeholder="+971 50 000 0000"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErr('');
              }}
            />
          </div>
          <div>
            <label style={LBL}>Email (optional)</label>
            <input
              style={INP}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={LBL}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ST.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setStatus(s.v)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    border:
                      status === s.v
                        ? `2px solid ${C.green}`
                        : `1px solid ${C.border}`,
                    background: status === s.v ? C.greenDim : 'transparent',
                    color: status === s.v ? C.green : C.muted,
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            onClick={submit}
            style={{
              flex: 1,
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '12px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✓ Add Member
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '12px 18px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function AddTaskModal({
  onConfirm,
  onCancel,
  allMembers,
  allProjects = PROJECTS,
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [member, setMember] = useState(allMembers[0]?.name || '');
  const [projId, setProjId] = useState(allProjects[0]?.id || PROJECTS[0].id);
  const [date, setDate] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!title.trim()) {
      setErr('Task title is required');
      return;
    }
    if (!member.trim()) {
      setErr('Team member is required');
      return;
    }
    if (!date) {
      setErr('Date is required');
      return;
    }
    const proj =
      allProjects.find((p) => p.id === projId) ||
      PROJECTS.find((p) => p.id === projId);
    onConfirm({
      id: `t${Date.now()}`,
      title: title.trim(),
      desc: desc.trim(),
      member: member.trim(),
      project: proj?.name || '',
      date,
      projId,
      status: 'pending',
    });
  };
  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          width: 460,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <span
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            Assign Task
          </span>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        {err && (
          <div
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}44`,
              borderRadius: 7,
              padding: '8px 12px',
              color: C.red,
              fontFamily: F,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {err}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LBL}>Task Title *</label>
            <input
              style={INP}
              placeholder="e.g. Site Inspection"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErr('');
              }}
            />
          </div>
          <div>
            <label style={LBL}>Description</label>
            <textarea
              style={{ ...INP, resize: 'none' }}
              rows={2}
              placeholder="What needs to be done?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div>
            <label style={LBL}>Assigned Team Member *</label>
            <select
              value={member}
              onChange={(e) => setMember(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {allMembers.length > 0 ? (
                allMembers.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} – {m.role}
                  </option>
                ))
              ) : (
                <option value="">No members</option>
              )}
            </select>
          </div>
          <div>
            <label style={LBL}>Project</label>
            <select
              value={projId}
              onChange={(e) => setProjId(Number(e.target.value))}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>Due Date *</label>
            <input
              style={{ ...INP, colorScheme: 'dark' }}
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErr('');
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            onClick={submit}
            style={{
              flex: 1,
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '12px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✓ Assign Task
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '12px 18px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Add Invoice Form Modal (form-first, doc upload inside) ───────────────────
function AddInvoiceFormModal({ project, onConfirm, onCancel }) {
  const staticInv = PROJ_INV[project.id] || [];
  const nextId = (files) => {
    const max = Math.max(
      0,
      ...[
        ...staticInv.map((i) => i.id),
        ...(files || []).map((f) => f.invId || ''),
      ].map((s) => parseInt((s || '').replace(/\D/g, '')) || 0)
    );
    return `INV-${String(max + 1).padStart(3, '0')}`;
  };
  const [supplier, setSupplier] = useState('');
  const [invNum, setInvNum] = useState('');
  const [invDate, setInvDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('pending');
  const [docFile, setDocFile] = useState(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef();

  const handleDocFile = async (raw) => {
    if (!raw) return;
    const du =
      raw.size < 5 * 1024 * 1024
        ? await new Promise((r) => {
            const rd = new FileReader();
            rd.onload = (e) => r(e.target.result);
            rd.readAsDataURL(raw);
          })
        : null;
    setDocFile({ name: raw.name, size: raw.size, dataUrl: du });
    if (du) {
      setAiRunning(true);
      setAiNote('🤖 Reading document with AI…');
      const result = await aiExtractInvoice({
        name: raw.name,
        size: raw.size,
        dataUrl: du,
      });
      if (result) {
        if (result.supplierName && !supplier) setSupplier(result.supplierName);
        if (result.invoiceNumber && !invNum) setInvNum(result.invoiceNumber);
        if (result.invoiceDate && !invDate) setInvDate(result.invoiceDate);
        if (result.dueDate && !dueDate) setDueDate(result.dueDate);
        if (result.amount && !amount) setAmount(String(result.amount));
        if (result.currency) setCurrency(result.currency);
        if (result.description && !desc) setDesc(result.description);
        setAiNote('OK AI extracted data — review and correct if needed');
      } else {
        setAiNote(
          'ℹ️ AI could not extract data — please fill in fields manually'
        );
      }
      setAiRunning(false);
    }
  };

  const submit = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setErr('Invoice amount is required');
      return;
    }
    const fmt = dueDate
      ? new Date(dueDate + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';
    const id = invNum || nextId([]);
    onConfirm({
      id: `${Date.now()}`,
      invId: id,
      name: docFile?.name || `${id}.pdf`,
      size: docFile?.size || 0,
      dataUrl: docFile?.dataUrl || null,
      icon: '🧾',
      invoiceStatus: status,
      desc: desc || id,
      amount: parseFloat(amount),
      dueDate: fmt,
      dueDateISO: dueDate,
      uploadedAt: new Date().toLocaleDateString(),
      supplier: supplier || '—',
      invDate: invDate || '—',
      currency,
    });
  };

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          width: 600,
          maxHeight: '93vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 28px 18px',
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                🧾 Add Invoice
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {project.name}
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                fontSize: 22,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>
          {err && (
            <div
              style={{
                background: C.redDim,
                border: `1px solid ${C.red}44`,
                borderRadius: 8,
                padding: '9px 14px',
                color: C.red,
                fontFamily: F,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              ⚠ {err}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {/* Supplier + Invoice # */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 2 }}>
                <label style={LBL}>Supplier / Company</label>
                <input
                  style={INP}
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Gulf Steel Co."
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Invoice #</label>
                <input
                  style={INP}
                  value={invNum}
                  onChange={(e) => setInvNum(e.target.value)}
                  placeholder="INV-001"
                />
              </div>
            </div>
            {/* Dates */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Invoice Date</label>
                <input
                  style={{ ...INP, colorScheme: 'dark' }}
                  type="date"
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Due Date</label>
                <input
                  style={{ ...INP, colorScheme: 'dark' }}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            {/* Amount + Currency */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 2 }}>
                <label style={LBL}>Amount *</label>
                <input
                  style={INP}
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErr('');
                  }}
                  placeholder="0.00"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ ...INP, cursor: 'pointer' }}
                >
                  {['AED', 'USD', 'SAR', 'EUR', 'GBP', 'QAR', 'KWD'].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            {/* Description */}
            <div>
              <label style={LBL}>Description</label>
              <textarea
                style={{ ...INP, resize: 'none' }}
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Scope or summary of this invoice"
              />
            </div>
            {/* Status */}
            <div>
              <label style={LBL}>Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {INV_ST.map((s) => (
                  <button
                    key={s.v}
                    onClick={() => setStatus(s.v)}
                    style={{
                      flex: 1,
                      padding: '9px 0',
                      borderRadius: 7,
                      cursor: 'pointer',
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 700,
                      border:
                        status === s.v
                          ? `2px solid ${s.c}`
                          : `1px solid ${C.border}`,
                      background: status === s.v ? s.c + '22' : 'transparent',
                      color: status === s.v ? s.c : C.muted,
                      transition: 'all .15s',
                    }}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
            </div>
            {/* Document upload */}
            <div>
              <label style={LBL}>
                Attach Document{' '}
                <span style={{ color: C.muted, fontWeight: 400 }}>
                  (PDF, image, screenshot — optional)
                </span>
              </label>
              {docFile ? (
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.green}44`,
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  {aiRunning && (
                    <div
                      style={{
                        color: C.purple,
                        fontFamily: F,
                        fontSize: 12,
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          border: '2px solid',
                          borderColor: C.purple,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin .7s linear infinite',
                        }}
                      />
                      Extracting with AI…
                    </div>
                  )}
                  {aiNote && !aiRunning && (
                    <div
                      style={{
                        color: aiNote.startsWith('OK') ? C.green : C.muted,
                        fontFamily: F,
                        fontSize: 11,
                        marginBottom: 10,
                        padding: '8px 10px',
                        background: aiNote.startsWith('OK')
                          ? C.greenDim
                          : C.surface,
                        borderRadius: 6,
                        border: `1px solid ${
                          aiNote.startsWith('OK') ? C.green + '33' : C.border
                        }`,
                      }}
                    >
                      {aiNote}
                    </div>
                  )}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: C.card,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {docFile.dataUrl?.startsWith('data:image') ? '🖼️' : '📄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 600,
                          fontSize: 13,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {docFile.name}
                      </div>
                      <div
                        style={{
                          color: C.muted,
                          fontFamily: F,
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {docFile.size
                          ? (docFile.size / 1024).toFixed(1) + ' KB'
                          : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDocFile(null);
                        setAiNote('');
                      }}
                      style={{
                        background: 'transparent',
                        color: C.red,
                        border: `1px solid ${C.red}33`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontFamily: F,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  {docFile.dataUrl?.startsWith('data:image') && (
                    <img
                      src={docFile.dataUrl}
                      alt=""
                      style={{
                        maxWidth: '100%',
                        maxHeight: 180,
                        objectFit: 'contain',
                        borderRadius: 8,
                        marginTop: 12,
                        border: `1px solid ${C.border}`,
                      }}
                    />
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.accent;
                    e.currentTarget.style.background = C.accentDim;
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                    const f = e.dataTransfer.files[0];
                    if (f) handleDocFile(f);
                  }}
                  style={{
                    border: `2px dashed ${C.border}`,
                    borderRadius: 10,
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.accent + '88';
                    e.currentTarget.style.background = C.accentDim;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    Drop document or click to browse
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    PDF · Images · Screenshots · Word docs · Any format
                  </div>
                  <div
                    style={{
                      color: C.purple,
                      fontFamily: F,
                      fontSize: 11,
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    🤖 AI will auto-extract invoice data from your file
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.doc,.docx,.xls,.xlsx,.txt,.csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) handleDocFile(f);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
        {/* Footer */}
        <div
          style={{
            padding: '18px 28px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '11px 20px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '11px 32px',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✓ Save Invoice
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Module Panels ─────────────────────────────────────────────────────────────
function InvoicesPanel({
  project,
  onActivity,
  onAddGlobalInvoice,
  allInvoices = [],
}) {
  const { files, ready, add, remove, update } = useFiles(`inv:${project.id}`);
  const [preview, setPreview] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // row to delete
  const staticInv = PROJ_INV[project.id] || [];
  // inline form state
  const [supplier, setSupplier] = useState('');
  const [invNum, setInvNum] = useState('');
  const [invDate, setInvDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('pending');
  const [docFile, setDocFile] = useState(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [formErr, setFormErr] = useState('');
  const invFileRef = useRef();

  const openAdd = () => {
    setSupplier('');
    setInvNum('');
    setInvDate('');
    setDueDate('');
    setAmount('');
    setCurrency('AED');
    setDesc('');
    setStatus('pending');
    setDocFile(null);
    setAiRunning(false);
    setAiNote('');
    setFormErr('');
    setShowAdd(true);
  };

  const handleInvDoc = async (raw) => {
    if (!raw) return;
    const du =
      raw.size < 5 * 1024 * 1024
        ? await new Promise((r) => {
            const rd = new FileReader();
            rd.onload = (e) => r(e.target.result);
            rd.readAsDataURL(raw);
          })
        : null;
    setDocFile({ name: raw.name, size: raw.size, dataUrl: du });
    if (du) {
      setAiRunning(true);
      setAiNote('🤖 Reading with AI…');
      const res = await aiExtractInvoice({
        name: raw.name,
        size: raw.size,
        dataUrl: du,
      });
      if (res) {
        if (res.supplierName && !supplier) setSupplier(res.supplierName);
        if (res.invoiceNumber && !invNum) setInvNum(res.invoiceNumber);
        if (res.invoiceDate && !invDate) setInvDate(res.invoiceDate);
        if (res.dueDate && !dueDate) setDueDate(res.dueDate);
        if (res.amount && !amount) setAmount(String(res.amount));
        if (res.currency) setCurrency(res.currency);
        if (res.description && !desc) setDesc(res.description);
        setAiNote('OK AI extracted — review below');
      } else setAiNote("ℹ️ Couldn't extract — fill manually");
      setAiRunning(false);
    }
  };

  const submitInv = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setFormErr('Invoice amount is required');
      return;
    }
    const fmt = dueDate
      ? new Date(dueDate + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';
    const id = invNum || `INV-${Date.now()}`;
    const invObj = {
      id: `${Date.now()}`,
      invId: id,
      name: docFile?.name || `${id}.pdf`,
      size: docFile?.size || 0,
      dataUrl: docFile?.dataUrl || null,
      icon: '🧾',
      invoiceStatus: status,
      status,
      desc: desc || id,
      amount: parseFloat(amount),
      dueDate: fmt,
      dueDateISO: dueDate,
      due: dueDate,
      dueFmt: fmt,
      uploadedAt: new Date().toLocaleDateString(),
      supplier: supplier || '—',
      invDate: invDate || '—',
      currency,
      project: project.name,
      client: project.client?.company || project.client?.name || '',
      projId: project.id,
    };
    await add(invObj);
    // Sync to global invoices so Invoices nav page shows it immediately
    if (onAddGlobalInvoice) await onAddGlobalInvoice(invObj);
    onActivity('Invoice added', '🧾');
    setShowAdd(false);
  };

  const cycle = async (f) => {
    const idx = INV_ST.findIndex((s) => s.v === f.invoiceStatus);
    await update(f.id, { invoiceStatus: INV_ST[(idx + 1) % INV_ST.length].v });
  };
  // Merge: static seed + local uploads + global invoices for this project
  const globalProjInv = allInvoices.filter(
    (i) => !i._static && (i.projId === project.id || i.project === project.name)
  );
  const localFileIds = new Set(files.map((f) => f.id));
  const globalExtra = globalProjInv.filter((i) => !localFileIds.has(i.id));
  const rows = [
    ...staticInv.map((i) => ({
      ...i,
      _s: true,
      st: i.status,
      dd: i.dueFmt,
      iid: i.id,
    })),
    ...files.map((f) => ({
      ...f,
      _s: false,
      st: f.invoiceStatus,
      dd: f.dueDate,
      iid: f.invId,
    })),
    ...globalExtra.map((i) => ({
      ...i,
      _s: false,
      st: i.status || i.invoiceStatus,
      dd: i.dueFmt || i.dueDate,
      iid: i.id,
    })),
  ];
  if (!ready)
    return (
      <div
        style={{
          color: C.muted,
          fontFamily: F,
          fontSize: 12,
          padding: '16px 0',
          textAlign: 'center',
        }}
      >
        Loading…
      </div>
    );
  return (
    <div>
      {preview && (
        <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Invoice?"
          message={`Are you sure you want to delete invoice "${confirmDelete.iid}"? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          variant="delete"
          onConfirm={() => {
            remove(confirmDelete.id);
            setConfirmDelete(null);
            onActivity('Invoice deleted', 'Del');
          }}
          onCancel={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: C.accent,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {confirmDelete.iid}
            </span>
            <span style={{ color: C.text, fontFamily: F, fontWeight: 700 }}>
              {confirmDelete.amount
                ? `$${Number(confirmDelete.amount).toLocaleString()}`
                : '—'}
            </span>
          </div>
        </ConfirmDialog>
      )}
      {!showAdd && rows.length > 0 && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 14,
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: F,
              fontSize: 12,
            }}
          >
            <thead>
              <tr
                style={{
                  background: C.bg,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {['#', 'Description', 'Amount', 'Due', 'Status', ''].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        color: C.muted,
                        fontWeight: 700,
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontSize: 11,
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const st = INV_ST.find((s) => s.v === row.st) || INV_ST[0];
                return (
                  <tr
                    key={row.id || row.iid}
                    style={{
                      borderBottom:
                        i < rows.length - 1
                          ? `1px solid ${C.border}22`
                          : 'none',
                    }}
                  >
                    <td
                      style={{
                        color: C.accent,
                        padding: '9px 12px',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {row.iid}
                    </td>
                    <td
                      style={{
                        color: C.text,
                        padding: '9px 12px',
                        maxWidth: 110,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.desc}
                    </td>
                    <td
                      style={{
                        color: C.text,
                        padding: '9px 12px',
                        fontWeight: 700,
                      }}
                    >
                      {row.amount
                        ? `$${Number(row.amount).toLocaleString()}`
                        : '—'}
                    </td>
                    <td
                      style={{
                        color: row.st === 'overdue' ? C.red : C.muted,
                        padding: '9px 12px',
                      }}
                    >
                      {row.dd || '—'}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      {row._s ? (
                        <Badge status={row.st} />
                      ) : (
                        <button
                          onClick={() => cycle(row)}
                          style={{
                            background: st.c + '22',
                            color: st.c,
                            border: `1px solid ${st.c}55`,
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontFamily: F,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {st.l}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {!row._s && row.dataUrl && (
                          <button
                            onClick={() => setPreview(row)}
                            style={{
                              background: 'transparent',
                              color: C.blue,
                              border: `1px solid ${C.blue}33`,
                              padding: '2px 7px',
                              borderRadius: 4,
                              fontFamily: F,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            View
                          </button>
                        )}
                        {!row._s && (
                          <button
                            onClick={() => setConfirmDelete(row)}
                            style={{
                              background: 'transparent',
                              color: C.red,
                              border: `1px solid ${C.red}33`,
                              padding: '2px 7px',
                              borderRadius: 4,
                              fontFamily: F,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!showAdd && rows.length === 0 && (
        <div
          style={{
            color: C.muted,
            fontFamily: F,
            fontSize: 12,
            padding: '10px 0',
            marginBottom: 12,
          }}
        >
          No invoices yet — add your first one
        </div>
      )}
      {showAdd ? (
        <InlineFormShell
          header="🧾 New Invoice"
          accent={C.accent}
          saveLabel="Save Invoice"
          onSave={submitInv}
          onCancel={() => setShowAdd(false)}
          err={formErr}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}>
              <label style={LBL}>Supplier / Company</label>
              <input
                style={INP}
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Gulf Steel Co."
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Invoice #</label>
              <input
                style={INP}
                value={invNum}
                onChange={(e) => setInvNum(e.target.value)}
                placeholder="INV-001"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Invoice Date</label>
              <input
                style={{ ...INP, colorScheme: 'dark' }}
                type="date"
                value={invDate}
                onChange={(e) => setInvDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Due Date</label>
              <input
                style={{ ...INP, colorScheme: 'dark' }}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}>
              <label style={LBL}>Amount *</label>
              <input
                style={INP}
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFormErr('');
                }}
                placeholder="0.00"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ ...INP, cursor: 'pointer' }}
              >
                {['AED', 'USD', 'SAR', 'EUR', 'GBP', 'QAR', 'KWD'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={LBL}>Description</label>
            <textarea
              style={{ ...INP, resize: 'none' }}
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Scope or summary"
            />
          </div>
          <div>
            <label style={LBL}>Status</label>
            <div style={{ display: 'flex', gap: 7 }}>
              {INV_ST.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setStatus(s.v)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    border:
                      status === s.v
                        ? `2px solid ${s.c}`
                        : `1px solid ${C.border}`,
                    background: status === s.v ? s.c + '22' : 'transparent',
                    color: status === s.v ? s.c : C.muted,
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={LBL}>
              Attach Document{' '}
              <span style={{ color: C.muted, fontWeight: 400 }}>
                (optional — AI auto-extracts)
              </span>
            </label>
            {docFile ? (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.green}44`,
                  borderRadius: 9,
                  padding: '12px 14px',
                }}
              >
                {aiRunning && (
                  <div
                    style={{
                      color: C.purple,
                      fontFamily: F,
                      fontSize: 11,
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        border: '2px solid',
                        borderColor: C.purple,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin .7s linear infinite',
                      }}
                    />
                    Extracting…
                  </div>
                )}
                {aiNote && !aiRunning && (
                  <div
                    style={{
                      color: aiNote.startsWith('OK') ? C.green : C.muted,
                      fontFamily: F,
                      fontSize: 11,
                      marginBottom: 8,
                      padding: '6px 9px',
                      background: aiNote.startsWith('OK')
                        ? C.greenDim
                        : 'transparent',
                      borderRadius: 5,
                    }}
                  >
                    {aiNote}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      background: C.card,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {docFile.dataUrl?.startsWith('data:image') ? '🖼️' : '📄'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontWeight: 600,
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {docFile.name}
                    </div>
                    <div
                      style={{ color: C.muted, fontFamily: F, fontSize: 10 }}
                    >
                      {docFile.size
                        ? (docFile.size / 1024).toFixed(1) + ' KB'
                        : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDocFile(null);
                      setAiNote('');
                    }}
                    style={{
                      background: 'transparent',
                      color: C.red,
                      border: `1px solid ${C.red}33`,
                      borderRadius: 5,
                      padding: '3px 8px',
                      fontFamily: F,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => invFileRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.background = C.accentDim;
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                  const f = e.dataTransfer.files[0];
                  if (f) handleInvDoc(f);
                }}
                style={{
                  border: `2px dashed ${C.border}`,
                  borderRadius: 9,
                  padding: '18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent + '88';
                  e.currentTarget.style.background = C.accentDim;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 5 }}>📎</div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 600,
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  Drop file or click to browse
                </div>
                <div style={{ color: C.purple, fontFamily: F, fontSize: 11 }}>
                  🤖 AI will auto-extract invoice data
                </div>
              </div>
            )}
            <input
              ref={invFileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) handleInvDoc(f);
                e.target.value = '';
              }}
            />
          </div>
        </InlineFormShell>
      ) : (
        <button
          onClick={openAdd}
          style={{
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '10px 22px',
            borderRadius: 8,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          🧾 + Add Invoice
        </button>
      )}
    </div>
  );
}

// ─── Add Plan Form Modal ──────────────────────────────────────────────────────
function AddPlanFormModal({ project, onConfirm, onCancel }) {
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('drawing');
  const [notes, setNotes] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [err, setErr] = useState('');
  const fileRef = useRef();
  const PLAN_CATS = [
    { v: 'drawing', l: 'Drawing', icon: 'DWG' },
    { v: 'electrical', l: 'Electrical', icon: 'ELC' },
    { v: 'plumbing', l: 'Plumbing', icon: 'PLB' },
    { v: 'structural', l: 'Structural', icon: 'STR' },
    { v: 'cad', l: 'CAD File', icon: 'CAD' },
    { v: 'permit', l: 'Permit / Legal', icon: 'PRM' },
    { v: 'other', l: 'Other', icon: 'DOC' },
  ];

  const handleDocFile = async (raw) => {
    if (!raw) return;
    const du =
      raw.size < 6 * 1024 * 1024
        ? await new Promise((r) => {
            const rd = new FileReader();
            rd.onload = (e) => r(e.target.result);
            rd.readAsDataURL(raw);
          })
        : null;
    setDocFile({ name: raw.name, size: raw.size, dataUrl: du });
    if (!title)
      setTitle(raw.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
  };

  const submit = () => {
    if (!docFile) {
      setErr('Please upload a file');
      return;
    }
    const chosenCat = PLAN_CATS.find((c) => c.v === cat) || PLAN_CATS[0];
    onConfirm({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: docFile.name,
      displayTitle: title || docFile.name,
      size: docFile.size,
      dataUrl: docFile.dataUrl,
      icon: chosenCat.icon,
      badgeStatus: cat,
      notes: notes.trim(),
      uploadedAt: new Date().toLocaleDateString(),
    });
  };

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          width: 580,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        <div
          style={{
            padding: '22px 28px 18px',
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                📐 Add Plan / Document
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {project.name}
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                fontSize: 22,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>
          {err && (
            <div
              style={{
                background: C.redDim,
                border: `1px solid ${C.red}44`,
                borderRadius: 8,
                padding: '9px 14px',
                color: C.red,
                fontFamily: F,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              ⚠ {err}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* File upload first — primary action */}
            <div>
              <label style={LBL}>Upload Document *</label>
              {docFile ? (
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.green}44`,
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    {docFile.dataUrl?.startsWith('data:image') ? (
                      <img
                        src={docFile.dataUrl}
                        alt=""
                        style={{
                          width: 52,
                          height: 52,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: `1px solid ${C.border}`,
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          background: C.card,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 28,
                          flexShrink: 0,
                        }}
                      >
                        📄
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: C.green,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        ✓ File uploaded
                      </div>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontSize: 12,
                          marginTop: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {docFile.name}
                      </div>
                      <div
                        style={{
                          color: C.muted,
                          fontFamily: F,
                          fontSize: 11,
                          marginTop: 1,
                        }}
                      >
                        {docFile.size
                          ? (docFile.size / 1024).toFixed(1) + ' KB'
                          : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => setDocFile(null)}
                      style={{
                        background: 'transparent',
                        color: C.red,
                        border: `1px solid ${C.red}33`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontFamily: F,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.blue;
                    e.currentTarget.style.background = C.blueDim;
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                    const f = e.dataTransfer.files[0];
                    if (f) {
                      handleDocFile(f);
                      setErr('');
                    }
                  }}
                  style={{
                    border: `2px dashed ${C.border}`,
                    borderRadius: 12,
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.blue + '88';
                    e.currentTarget.style.background = C.blueDim;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 38, marginBottom: 10 }}>📁</div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 5,
                    }}
                  >
                    Drop file here or click to browse
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
                    PDF · CAD (.dwg .dxf) · Images · Word · Excel · Any format
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    handleDocFile(f);
                    setErr('');
                  }
                  e.target.value = '';
                }}
              />
            </div>
            {/* Title */}
            <div>
              <label style={LBL}>Document Title</label>
              <input
                style={INP}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Foundation Layout v3"
              />
            </div>
            {/* Category */}
            <div>
              <label style={LBL}>Document Type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PLAN_CATS.map((c) => (
                  <button
                    key={c.v}
                    onClick={() => setCat(c.v)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 700,
                      border:
                        cat === c.v
                          ? `2px solid ${C.blue}`
                          : `1px solid ${C.border}`,
                      background: cat === c.v ? C.blueDim : 'transparent',
                      color: cat === c.v ? C.blue : C.muted,
                      transition: 'all .15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {c.icon} {c.l}
                  </button>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div>
              <label style={LBL}>
                Notes{' '}
                <span style={{ color: C.muted, fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <textarea
                style={{ ...INP, resize: 'none' }}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Version info, revision notes, instructions…"
              />
            </div>
          </div>
        </div>
        <div
          style={{
            padding: '18px 28px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '11px 20px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              background: C.blue,
              color: '#fff',
              border: 'none',
              padding: '11px 32px',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            📐 Save Document
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function PlansPanel({ project, onActivity }) {
  const { files, ready, add, remove } = useFiles(`plans:${project.id}`);
  const [preview, setPreview] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // file to delete
  // inline form state
  const [planTitle, setPlanTitle] = useState('');
  const [planCat, setPlanCat] = useState('drawing');
  const [planNotes, setPlanNotes] = useState('');
  const [planFile, setPlanFile] = useState(null);
  const [planErr, setPlanErr] = useState('');
  const planFileRef = useRef();
  const PLAN_CATS = [
    { v: 'drawing', l: 'Drawing', icon: 'DWG' },
    { v: 'electrical', l: 'Electrical', icon: 'ELC' },
    { v: 'plumbing', l: 'Plumbing', icon: 'PLB' },
    { v: 'structural', l: 'Structural', icon: 'STR' },
    { v: 'cad', l: 'CAD File', icon: 'CAD' },
    { v: 'permit', l: 'Permit', icon: 'PRM' },
    { v: 'other', l: 'Other', icon: 'DOC' },
  ];

  const handlePlanFile = async (raw) => {
    if (!raw) return;
    const du =
      raw.size < 6 * 1024 * 1024
        ? await new Promise((r) => {
            const rd = new FileReader();
            rd.onload = (e) => r(e.target.result);
            rd.readAsDataURL(raw);
          })
        : null;
    setPlanFile({ name: raw.name, size: raw.size, dataUrl: du });
    if (!planTitle)
      setPlanTitle(raw.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
    setPlanErr('');
  };

  const submitPlan = async () => {
    if (!planFile) {
      setPlanErr('Please upload a file');
      return;
    }
    const chosenCat = PLAN_CATS.find((c) => c.v === planCat) || PLAN_CATS[0];
    await add({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: planFile.name,
      displayTitle: planTitle || planFile.name,
      size: planFile.size,
      dataUrl: planFile.dataUrl,
      icon: chosenCat.icon,
      badgeStatus: planCat,
      notes: planNotes.trim(),
      uploadedAt: new Date().toLocaleDateString(),
    });
    onActivity('Plan uploaded', '📐');
    setShowAdd(false);
  };

  if (!ready)
    return (
      <div
        style={{
          color: C.muted,
          fontFamily: F,
          fontSize: 12,
          padding: '16px 0',
          textAlign: 'center',
        }}
      >
        Loading…
      </div>
    );
  return (
    <div>
      {preview && (
        <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Document?"
          message={`Are you sure you want to delete "${
            confirmDelete.displayTitle || confirmDelete.name
          }"? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          variant="delete"
          onConfirm={() => {
            remove(confirmDelete.id);
            setConfirmDelete(null);
            onActivity('Document deleted', 'Del');
          }}
          onCancel={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.accent,
                background: C.accentDim,
                padding: '3px 6px',
                borderRadius: 4,
              }}
            >
              {confirmDelete.icon || 'DOC'}
            </span>
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {confirmDelete.displayTitle || confirmDelete.name}
              </div>
              <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                {fmtBytes(confirmDelete.size)}
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}
      {!showAdd && files.length === 0 && (
        <div
          style={{
            color: C.muted,
            fontFamily: F,
            fontSize: 12,
            padding: '10px 0',
            marginBottom: 12,
          }}
        >
          No documents yet — add your first plan or file
        </div>
      )}
      {!showAdd && files.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            marginBottom: 14,
          }}
        >
          {files.map((f) => (
            <div
              key={f.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 7,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {f.dataUrl?.startsWith('data:image') ? (
                <img
                  src={f.dataUrl}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 5,
                    border: `1px solid ${C.border}`,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: C.card,
                    borderRadius: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {f.icon || 'DOC'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 600,
                    fontSize: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.displayTitle || f.name}
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 10,
                    marginTop: 2,
                  }}
                >
                  {fmtBytes(f.size)} · {f.uploadedAt}
                  {f.notes && <span> · {f.notes.slice(0, 40)}</span>}
                </div>
              </div>
              <Badge status={f.badgeStatus} />
              <button
                onClick={() => setPreview(f)}
                style={{
                  background: 'transparent',
                  color: C.blue,
                  border: `1px solid ${C.blue}33`,
                  padding: '3px 9px',
                  borderRadius: 4,
                  fontFamily: F,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                View
              </button>
              <button
                onClick={() => setConfirmDelete(f)}
                style={{
                  background: 'transparent',
                  color: C.red,
                  border: `1px solid ${C.red}33`,
                  padding: '3px 9px',
                  borderRadius: 4,
                  fontFamily: F,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
      {showAdd ? (
        <InlineFormShell
          header="📐 Add Plan / Document"
          accent={C.blue}
          saveLabel="📐 Save Document"
          onSave={submitPlan}
          onCancel={() => setShowAdd(false)}
          err={planErr}
        >
          {/* File upload */}
          <div>
            <label style={LBL}>Upload File *</label>
            {planFile ? (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.green}44`,
                  borderRadius: 9,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {planFile.dataUrl?.startsWith('data:image') ? (
                  <img
                    src={planFile.dataUrl}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: C.card,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    📄
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: C.green,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    ✓ File ready
                  </div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontSize: 11,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {planFile.name}
                  </div>
                </div>
                <button
                  onClick={() => setPlanFile(null)}
                  style={{
                    background: 'transparent',
                    color: C.red,
                    border: `1px solid ${C.red}33`,
                    borderRadius: 5,
                    padding: '3px 8px',
                    fontFamily: F,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => planFileRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = C.blue;
                  e.currentTarget.style.background = C.blueDim;
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                  const f = e.dataTransfer.files[0];
                  if (f) handlePlanFile(f);
                }}
                style={{
                  border: `2px dashed ${C.border}`,
                  borderRadius: 9,
                  padding: '22px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.blue + '88';
                  e.currentTarget.style.background = C.blueDim;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 7 }}>📁</div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 600,
                    fontSize: 12,
                    marginBottom: 3,
                  }}
                >
                  Drop file or click to browse
                </div>
                <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                  PDF · CAD · Images · Word · Excel · Any format
                </div>
              </div>
            )}
            <input
              ref={planFileRef}
              type="file"
              accept="*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) handlePlanFile(f);
                e.target.value = '';
              }}
            />
          </div>
          <div>
            <label style={LBL}>Document Title</label>
            <input
              style={INP}
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder="e.g. Foundation Layout v3"
            />
          </div>
          <div>
            <label style={LBL}>Document Type</label>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {PLAN_CATS.map((c) => (
                <button
                  key={c.v}
                  onClick={() => setPlanCat(c.v)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 700,
                    border:
                      planCat === c.v
                        ? `2px solid ${C.blue}`
                        : `1px solid ${C.border}`,
                    background: planCat === c.v ? C.blueDim : 'transparent',
                    color: planCat === c.v ? C.blue : C.muted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {c.icon} {c.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={LBL}>
              Notes{' '}
              <span style={{ color: C.muted, fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <textarea
              style={{ ...INP, resize: 'none' }}
              rows={2}
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              placeholder="Version info, revision notes…"
            />
          </div>
        </InlineFormShell>
      ) : (
        <button
          onClick={() => {
            setPlanTitle('');
            setPlanCat('drawing');
            setPlanNotes('');
            setPlanFile(null);
            setPlanErr('');
            setShowAdd(true);
          }}
          style={{
            background: C.blue,
            color: '#fff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: 8,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          📐 + Add Plan / Document
        </button>
      )}
    </div>
  );
}

function TeamPanel({ project, onOpenTeamPage }) {
  const { members, ready, addMember } = useTeam(project.id);
  const [showAdd, setShowAdd] = useState(false);
  const [tmName, setTmName] = useState('');
  const [tmRole, setTmRole] = useState(ROLES[0]);
  const [tmPhone, setTmPhone] = useState('');
  const [tmStatus, setTmStatus] = useState('on-site');
  const [tmErr, setTmErr] = useState('');
  const MCOLORS_LIST = [
    C.blue,
    C.purple,
    C.green,
    C.accent,
    '#f43f5e',
    '#06b6d4',
    '#84cc16',
  ];

  const submitMember = async () => {
    if (!tmName.trim()) {
      setTmErr('Name is required');
      return;
    }
    if (!tmPhone.trim()) {
      setTmErr('Phone is required');
      return;
    }
    const color = MCOLORS_LIST[Math.floor(Math.random() * MCOLORS_LIST.length)];
    const init = tmName
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    await addMember({
      id: `m${Date.now()}`,
      name: tmName.trim(),
      role: tmRole,
      phone: tmPhone.trim(),
      status: tmStatus,
      color,
      init,
      projId: project.id,
      projectName: project.name,
      type: 'employee',
    });
    setShowAdd(false);
  };

  if (!ready)
    return (
      <div
        style={{
          color: C.muted,
          fontFamily: F,
          fontSize: 12,
          padding: '14px 0',
          textAlign: 'center',
        }}
      >
        Loading…
      </div>
    );
  return (
    <div>
      {!showAdd && members.length === 0 && (
        <div
          style={{
            color: C.muted,
            fontFamily: F,
            fontSize: 12,
            padding: '12px 0',
            textAlign: 'center',
          }}
        >
          No team members yet
        </div>
      )}
      {!showAdd && members.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {members.slice(0, 4).map((m) => (
            <div
              key={m.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: (m.color || C.blue) + '22',
                  border: `2px solid ${m.color || C.blue}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.color || C.blue,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {m.init}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 11,
                    marginTop: 1,
                  }}
                >
                  {m.role}
                </div>
              </div>
              <Badge status={m.status || 'on-site'} />
            </div>
          ))}
          {members.length > 4 && (
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 11,
                textAlign: 'center',
                padding: '4px 0',
              }}
            >
              +{members.length - 4} more
            </div>
          )}
        </div>
      )}
      {showAdd ? (
        <InlineFormShell
          header="👷 Add Team Member"
          accent={C.green}
          saveLabel="Add Member"
          onSave={submitMember}
          onCancel={() => setShowAdd(false)}
          err={tmErr}
        >
          <div>
            <label style={LBL}>Full Name *</label>
            <input
              style={INP}
              value={tmName}
              onChange={(e) => {
                setTmName(e.target.value);
                setTmErr('');
              }}
              placeholder="e.g. Marcus Webb"
            />
          </div>
          <div>
            <label style={LBL}>Role</label>
            <select
              value={tmRole}
              onChange={(e) => setTmRole(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>Phone *</label>
            <input
              style={INP}
              value={tmPhone}
              onChange={(e) => {
                setTmPhone(e.target.value);
                setTmErr('');
              }}
              placeholder="+971 50 000 0000"
            />
          </div>
          <div>
            <label style={LBL}>Status</label>
            <div style={{ display: 'flex', gap: 7 }}>
              {[
                { v: 'on-site', l: 'On Site' },
                { v: 'scheduled', l: 'Scheduled' },
                { v: 'remote', l: 'Remote' },
              ].map((s) => (
                <button
                  key={s.v}
                  onClick={() => setTmStatus(s.v)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    border:
                      tmStatus === s.v
                        ? `2px solid ${C.green}`
                        : `1px solid ${C.border}`,
                    background: tmStatus === s.v ? C.greenDim : 'transparent',
                    color: tmStatus === s.v ? C.green : C.muted,
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
        </InlineFormShell>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setTmName('');
              setTmRole(ROLES[0]);
              setTmPhone('');
              setTmStatus('on-site');
              setTmErr('');
              setShowAdd(true);
            }}
            style={{
              background: C.green,
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 7,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            👷 + Add Member
          </button>
          <button
            onClick={onOpenTeamPage}
            style={{
              background: 'transparent',
              color: C.text,
              border: `1px solid ${C.border}`,
              padding: '9px 16px',
              borderRadius: 7,
              fontFamily: F,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Full Team →
          </button>
        </div>
      )}
    </div>
  );
}

function ModCard({ icon, title, sub, color, dim, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${open ? color + '66' : C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color .2s',
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '20px 22px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: open ? color + '0d' : 'transparent',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 13,
            background: dim,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        </div>
        <span
          style={{
            color: open ? color : C.muted,
            fontSize: 20,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform .25s',
          }}
        >
          ›
        </span>
      </div>
      {open && (
        <div
          style={{
            padding: '0 22px 20px',
            borderTop: `1px solid ${C.border}22`,
            paddingTop: 16,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Team Page ─────────────────────────────────────────────────────────────────
// ─── Edit Member Modal ─────────────────────────────────────────────────────────
function EditMemberModal({ member, allProjects, onConfirm, onCancel }) {
  const [name, setName] = useState(member.name || '');
  const [role, setRole] = useState(member.role || ROLES[0]);
  const [phone, setPhone] = useState(member.phone || '');
  const [email, setEmail] = useState(member.email || '');
  const [projId, setProjId] = useState(member.projId || allProjects[0]?.id);
  const [status, setStatus] = useState(member.status || 'on-site');
  const [type, setType] = useState(member.type || 'employee');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!name.trim()) {
      setErr('Name is required');
      return;
    }
    if (!phone.trim()) {
      setErr('Phone number is required');
      return;
    }
    const newProj =
      allProjects.find((p) => p.id === projId) ||
      allProjects.find((p) => p.id === member.projId);
    onConfirm({
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim(),
      projId,
      projectName: newProj?.name || '',
      status,
      type,
    });
  };

  const ST = [
    { v: 'on-site', l: 'On Site' },
    { v: 'scheduled', l: 'Scheduled' },
    { v: 'remote', l: 'Remote' },
  ];
  const TY = [
    { v: 'employee', l: 'Employee' },
    { v: 'subcontractor', l: 'Subcontractor' },
  ];

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          width: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              ✏️ Edit Team Member
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 12,
                marginTop: 3,
              }}
            >
              Update information for{' '}
              <strong style={{ color: C.accent }}>{member.name}</strong>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {err && (
          <div
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}44`,
              borderRadius: 7,
              padding: '9px 14px',
              color: C.red,
              fontFamily: F,
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            ⚠ {err}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div>
            <label style={LBL}>Full Name *</label>
            <input
              style={INP}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr('');
              }}
              placeholder="e.g. Marcus Webb"
            />
          </div>

          {/* Role */}
          <div>
            <label style={LBL}>Profession / Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Phone + Email */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Phone Number *</label>
              <input
                style={INP}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErr('');
                }}
                placeholder="+971 50 000 0000"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>
                Email{' '}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (optional)
                </span>
              </label>
              <input
                style={INP}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Assigned Project */}
          <div>
            <label style={LBL}>Assigned Project</label>
            <select
              value={projId}
              onChange={(e) => setProjId(Number(e.target.value))}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={LBL}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ST.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setStatus(s.v)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    border:
                      status === s.v
                        ? `2px solid ${C.green}`
                        : `1px solid ${C.border}`,
                    background: status === s.v ? C.greenDim : 'transparent',
                    color: status === s.v ? C.green : C.muted,
                    transition: 'all .15s',
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label style={LBL}>Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TY.map((t) => (
                <button
                  key={t.v}
                  onClick={() => setType(t.v)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    border:
                      type === t.v
                        ? `2px solid ${C.blue}`
                        : `1px solid ${C.border}`,
                    background: type === t.v ? C.blueDim : 'transparent',
                    color: type === t.v ? C.blue : C.muted,
                    transition: 'all .15s',
                  }}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            onClick={submit}
            style={{
              flex: 1,
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '12px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✓ Save Changes
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '12px 20px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ member, taskCount, onConfirm, onCancel }) {
  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.red}44`,
          borderRadius: 16,
          padding: 32,
          width: 420,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: C.redDim,
            border: `2px solid ${C.red}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            margin: '0 auto 20px',
          }}
        >
          🗑️
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            Remove Team Member?
          </div>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            You are about to remove{' '}
            <strong style={{ color: C.text }}>{member.name}</strong> (
            {member.role}) from this project.
            {taskCount > 0 && (
              <span style={{ display: 'block', marginTop: 8, color: C.accent }}>
                ⚠️ They have{' '}
                <strong>
                  {taskCount} assigned task{taskCount !== 1 ? 's' : ''}
                </strong>{' '}
                that will be unassigned.
              </span>
            )}
          </div>
        </div>

        {/* Member preview */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '14px 18px',
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: (member.color || C.blue) + '22',
              border: `2px solid ${member.color || C.blue}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: member.color || C.blue,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {member.init}
          </div>
          <div>
            <div
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {member.name}
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {member.role} · {member.status}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'transparent',
              color: C.text,
              border: `1px solid ${C.border}`,
              padding: '12px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Keep Member
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: C.red,
              color: '#fff',
              border: 'none',
              padding: '12px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function TeamPage({ project, onBack, onAddToLog, tasks = [], updateTask }) {
  const { members, ready, addMember, removeMember, updateMember } = useTeam(
    project.id
  );
  const { allProjects } = useProjects();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmEditData, setConfirmEditData] = useState(null); // {member, patch}

  const taskCountFor = (name) => tasks.filter((t) => t.member === name).length;

  const handleAdd = async (m) => {
    await addMember(m);
    onAddToLog(`${m.name} added to team`, '👷');
    setShowAdd(false);
  };

  const handleEditConfirm = async (patch) => {
    const oldName = editing.name;
    await updateMember(editing.id, patch);
    if (updateTask && patch.name && patch.name !== oldName) {
      tasks
        .filter((t) => t.member === oldName)
        .forEach((t) => updateTask(t.id, { member: patch.name }));
    }
    onAddToLog(
      `${oldName}${patch.name !== oldName ? ' → ' + patch.name : ''} updated`,
      'Edit'
    );
    setEditing(null);
    setConfirmEditData(null);
  };

  const handleDeleteConfirm = async () => {
    const m = deleting;
    await removeMember(m.id);
    if (updateTask) {
      tasks
        .filter((t) => t.member === m.name)
        .forEach((t) => updateTask(t.id, { member: 'Unassigned' }));
    }
    onAddToLog(`${m.name} removed from team`, 'Del');
    setDeleting(null);
  };

  return (
    <div>
      {showAdd && (
        <AddMemberModal
          project={project}
          onConfirm={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <EditMemberModal
          member={editing}
          allProjects={allProjects}
          onConfirm={(patch) => {
            setConfirmEditData({ member: editing, patch });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
      {confirmEditData && (
        <ConfirmDialog
          title="Save Member Changes?"
          message="Are you sure you want to apply these changes to this team member?"
          confirmLabel="Yes, Save"
          variant="edit"
          onConfirm={() => handleEditConfirm(confirmEditData.patch)}
          onCancel={() => setConfirmEditData(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: (confirmEditData.member.color || C.blue) + '22',
                border: `2px solid ${confirmEditData.member.color || C.blue}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: confirmEditData.member.color || C.blue,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {confirmEditData.member.init}
            </div>
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {confirmEditData.member.name}
              </div>
              <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                {confirmEditData.patch.name &&
                confirmEditData.patch.name !== confirmEditData.member.name
                  ? `Rename to "${confirmEditData.patch.name}"`
                  : confirmEditData.member.role}
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}
      {deleting && (
        <ConfirmDialog
          title="Remove Team Member?"
          message={`Are you sure you want to remove ${deleting.name} (${
            deleting.role
          }) from this project? This action cannot be undone.${
            taskCountFor(deleting.name) > 0
              ? ' They have ' +
                taskCountFor(deleting.name) +
                ' assigned task(s) that will be unassigned.'
              : ''
          }`}
          confirmLabel="Yes, Remove"
          variant="delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleting(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: (deleting.color || C.blue) + '22',
                border: `2px solid ${deleting.color || C.blue}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: deleting.color || C.blue,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {deleting.init}
            </div>
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {deleting.name}
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {deleting.role} · {deleting.status}
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}

      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 22,
        }}
      >
        <button
          onClick={() => onBack('projects')}
          style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            color: C.muted,
            padding: '6px 14px',
            borderRadius: 7,
            fontFamily: F,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Projects
        </button>
        <span style={{ color: C.border, fontSize: 14 }}>›</span>
        <button
          onClick={() => onBack('detail')}
          style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            color: C.muted,
            padding: '6px 14px',
            borderRadius: 7,
            fontFamily: F,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {project.name}
        </button>
        <span style={{ color: C.border, fontSize: 14 }}>›</span>
        <span
          style={{
            color: C.accent,
            fontFamily: F,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Team
        </span>
      </div>

      {/* Project header */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 26,
                  background: C.green,
                  borderRadius: 2,
                }}
              />
              <h1
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontSize: 22,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {project.name}
              </h1>
              <Badge status={project.status} />
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 13,
                marginLeft: 14,
              }}
            >
              📍 {project.address}
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '11px 22px',
              borderRadius: 9,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}
      >
        {[
          ['Total', members.length, C.blue],
          [
            'On Site',
            members.filter((m) => m.status === 'on-site').length,
            C.green,
          ],
          [
            'Scheduled',
            members.filter((m) => m.status === 'scheduled').length,
            C.purple,
          ],
          [
            'Remote',
            members.filter((m) => m.status === 'remote').length,
            C.accent,
          ],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '16px 20px',
              flex: 1,
              minWidth: 100,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 11,
                marginBottom: 5,
              }}
            >
              {l}
            </div>
            <div
              style={{
                color: c,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Members list */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '20px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <span
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            👷 Project Team
          </span>
          <span
            style={{
              background: C.greenDim,
              color: C.green,
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: F,
            }}
          >
            {members.length} members
          </span>
        </div>

        {!ready && (
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 13,
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            Loading…
          </div>
        )}

        {ready && members.length === 0 && (
          <div
            style={{
              border: `2px dashed ${C.border}`,
              borderRadius: 10,
              padding: '40px 20px',
              textAlign: 'center',
              color: C.muted,
              fontFamily: F,
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>👷</div>No members
            yet — click <strong>+ Add Member</strong> to get started
          </div>
        )}

        {ready && members.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map((m) => {
              const tc = taskCountFor(m.name);
              return (
                <div
                  key={m.id}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    transition: 'border-color .18s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = C.accent + '55')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = C.border)
                  }
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: (m.color || C.blue) + '22',
                      border: `2px solid ${m.color || C.blue}55`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: m.color || C.blue,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {m.init}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      style={{
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 12,
                        marginTop: 3,
                        display: 'flex',
                        gap: 14,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>🔨 {m.role}</span>
                      {m.phone && <span>📞 {m.phone}</span>}
                      {m.email && <span>✉️ {m.email}</span>}
                      {tc > 0 && (
                        <span style={{ color: C.blue }}>
                          {tc} task{tc !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      alignItems: 'flex-end',
                      flexShrink: 0,
                    }}
                  >
                    <Badge status={m.type || 'employee'} />
                    <Badge status={m.status || 'on-site'} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setEditing(m)}
                      style={{
                        background: C.blueDim,
                        color: C.blue,
                        border: `1px solid ${C.blue}44`,
                        padding: '7px 14px',
                        borderRadius: 7,
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all .15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.blue;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = C.blueDim;
                        e.currentTarget.style.color = C.blue;
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleting(m)}
                      style={{
                        background: C.redDim,
                        color: C.red,
                        border: `1px solid ${C.red}44`,
                        padding: '7px 14px',
                        borderRadius: 7,
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all .15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.red;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = C.redDim;
                        e.currentTarget.style.color = C.red;
                      }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TASKS PAGE ────────────────────────────────────────────────────────────────
function TasksPage({
  tasks,
  addTask,
  updateTask,
  removeTask,
  allProjects = PROJECTS,
}) {
  const allMembers = useMemo(
    () =>
      Object.values(PROJ_CREW_SEED)
        .flat()
        .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i),
    []
  );
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [projFilter, setProjFilter] = useState('all');

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (filter === 'pending' && t.status !== 'pending') return false;
        if (filter === 'done' && t.status !== 'done') return false;
        if (projFilter !== 'all' && String(t.projId) !== projFilter)
          return false;
        return true;
      }),
    [tasks, filter, projFilter]
  );

  const byMember = useMemo(() => {
    const m = {};
    filtered.forEach((t) => {
      if (!m[t.member]) m[t.member] = [];
      m[t.member].push(t);
    });
    return m;
  }, [filtered]);

  return (
    <div>
      {showAdd && (
        <AddTaskModal
          onConfirm={(t) => {
            addTask(t);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
          allMembers={allMembers}
          allProjects={allProjects}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 22,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Task Management
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Assign and track work across your team
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '11px 22px',
            borderRadius: 9,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + Assign Task
        </button>
      </div>

      <div
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}
      >
        {[
          ['Total', tasks.length, C.blue],
          [
            'Pending',
            tasks.filter((t) => t.status === 'pending').length,
            C.accent,
          ],
          [
            'Completed',
            tasks.filter((t) => t.status === 'done').length,
            C.green,
          ],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '16px 22px',
              flex: 1,
              minWidth: 120,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 11,
                marginBottom: 5,
              }}
            >
              {l}
            </div>
            <div
              style={{
                color: c,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <div
          style={{
            display: 'flex',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 9,
            padding: 4,
            gap: 3,
          }}
        >
          {[
            ['all', 'All'],
            ['pending', 'Pending'],
            ['done', 'Done'],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                background: filter === v ? C.accentDim : 'transparent',
                color: filter === v ? C.accent : C.muted,
                border:
                  filter === v
                    ? `1px solid ${C.accentMid}`
                    : '1px solid transparent',
                borderRadius: 6,
                padding: '7px 14px',
                fontFamily: F,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <select
          value={projFilter}
          onChange={(e) => setProjFilter(e.target.value)}
          style={{
            ...INP,
            width: 'auto',
            padding: '7px 14px',
            borderRadius: 9,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Projects</option>
          {allProjects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {Object.keys(byMember).length === 0 && (
        <div
          style={{
            background: C.card,
            border: `2px dashed ${C.border}`,
            borderRadius: 12,
            padding: '48px 20px',
            textAlign: 'center',
            color: C.muted,
            fontFamily: F,
          }}
        >
          No tasks match your filters
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(byMember).map(([member, mtasks]) => {
          const mInfo = allMembers.find((m) => m.name === member);
          const col = mInfo?.color || C.blue;
          const init = member
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <div
              key={member}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 20px',
                  background: col + '0d',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: col + '22',
                    border: `2px solid ${col}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: col,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {init}
                </div>
                <div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {member}
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    {mInfo?.role || ''} · {mtasks.length} task
                    {mtasks.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {mtasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${
                        t.status === 'done' ? C.green + '44' : C.border
                      }`,
                      borderRadius: 9,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      opacity: t.status === 'done' ? 0.7 : 1,
                    }}
                  >
                    <button
                      onClick={() =>
                        updateTask(t.id, {
                          status: t.status === 'done' ? 'pending' : 'done',
                        })
                      }
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: `2px solid ${
                          t.status === 'done' ? C.green : C.border
                        }`,
                        background:
                          t.status === 'done' ? C.green : 'transparent',
                        color: '#000',
                        fontSize: 12,
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {t.status === 'done' && '✓'}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 13,
                          textDecoration:
                            t.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {t.title}
                      </div>
                      {t.desc && (
                        <div
                          style={{
                            color: C.muted,
                            fontFamily: F,
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {t.desc}
                        </div>
                      )}
                      <div
                        style={{
                          color: C.muted,
                          fontFamily: F,
                          fontSize: 11,
                          marginTop: 4,
                          display: 'flex',
                          gap: 10,
                        }}
                      >
                        <span>{t.project}</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                    <Badge status={t.status} />
                    <button
                      onClick={() => removeTask(t.id)}
                      style={{
                        background: 'transparent',
                        color: C.red,
                        border: 'none',
                        padding: '4px 6px',
                        fontFamily: F,
                        fontSize: 14,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Offer Extraction helper ───────────────────────────────────────────────
async function aiExtractOffer(file) {
  if (!file.dataUrl) return null;
  const isImg = file.dataUrl.startsWith('data:image');
  try {
    const msgContent = isImg
      ? [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: file.dataUrl.split(';')[0].split(':')[1],
              data: file.dataUrl.split(',')[1],
            },
          },
          {
            type: 'text',
            text: 'Extract supplier offer details from this image. Return ONLY valid JSON with fields: supplier (string), price (number), delivery (string, e.g. "10 days"), quality (string description), validity (string), notes (string). Use null for missing fields.',
          },
        ]
      : [
          {
            type: 'text',
            text: `Extract supplier offer from this document: "${file.name}". Return ONLY valid JSON with fields: supplier, price (number), delivery (e.g. "10 days"), quality, validity, notes. Use null for missing fields.`,
          },
        ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: msgContent }],
      }),
    });
    const data = await res.json();
    const text = data.content?.find((b) => b.type === 'text')?.text || '';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    return null;
  }
}

// ─── Upload Offer Modal (AI-powered) ──────────────────────────────────────────
function UploadOfferModal({ tenderId, onConfirm, onCancel }) {
  const [step, setStep] = useState('drop'); // drop | extracting | review
  const [file, setFile] = useState(null);
  const [supplier, setSupplier] = useState('');
  const [price, setPrice] = useState('');
  const [delivery, setDelivery] = useState('');
  const [quality, setQuality] = useState('');
  const [validity, setValidity] = useState('');
  const [notes, setNotes] = useState('');
  const [aiNote, setAiNote] = useState('');
  const dropRef = useRef();

  const handleFile = async (raw) => {
    let du = null;
    if (raw.size < 5 * 1024 * 1024) {
      du = await new Promise((r) => {
        const rd = new FileReader();
        rd.onload = (e) => r(e.target.result);
        rd.readAsDataURL(raw);
      });
    }
    const f = { name: raw.name, size: raw.size, dataUrl: du };
    setFile(f);
    setStep('extracting');
    const result = await aiExtractOffer(f);
    if (result) {
      if (result.supplier) setSupplier(result.supplier);
      if (result.price) setPrice(String(result.price));
      if (result.delivery) setDelivery(result.delivery);
      if (result.quality) setQuality(result.quality);
      if (result.validity) setValidity(result.validity);
      if (result.notes) setNotes(result.notes);
      setAiNote('OK AI extracted data — review and edit before saving.');
    } else {
      setAiNote(
        '⚠️ Could not auto-extract. Please fill in the details manually.'
      );
    }
    setStep('review');
  };

  const save = () => {
    onConfirm({
      id: `o${Date.now()}`,
      supplier: supplier.trim() || 'Unknown',
      price: parseFloat(price) || 0,
      delivery: delivery.trim(),
      quality: quality.trim(),
      validity: validity.trim(),
      notes: notes.trim(),
      fileName: file?.name,
    });
  };

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          width: 520,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '22px 26px 0', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 17,
                }}
              >
                📤 Upload Supplier Offer
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Upload any document, image or screenshot
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
            {[
              ['1', 'Upload'],
              ['2', 'AI Extract'],
              ['3', 'Review & Save'],
            ].map(([n, l], i) => {
              const done =
                (step === 'extracting' && i === 0) ||
                (step === 'review' && i <= 1);
              const active =
                (step === 'drop' && i === 0) ||
                (step === 'extracting' && i === 1) ||
                (step === 'review' && i === 2);
              return (
                <div
                  key={n}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: i < 2 ? 0 : 1,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: done
                          ? C.green
                          : active
                          ? C.accent
                          : C.border,
                        color: done || active ? '#000' : C.muted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 11,
                        flexShrink: 0,
                        transition: 'all .2s',
                      }}
                    >
                      {done ? '✓' : n}
                    </div>
                    <span
                      style={{
                        color: active ? C.text : done ? C.green : C.muted,
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: active ? 700 : 400,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {l}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        width: 20,
                        height: 2,
                        background: done ? C.green : C.border,
                        borderRadius: 1,
                        margin: '0 8px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 26px' }}>
          {/* Step: drop */}
          {step === 'drop' && (
            <div style={{ paddingBottom: 8 }}>
              <div
                onClick={() => dropRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
                style={{
                  border: `2px dashed ${C.accent}55`,
                  borderRadius: 12,
                  padding: '44px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: C.accentDim,
                  transition: 'all .2s',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>📎</div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  Drop offer document here
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  PDF · Images · Screenshots · Word docs
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    background: C.accent,
                    color: '#000',
                    padding: '9px 22px',
                    borderRadius: 7,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Browse Files
                </div>
                <input
                  ref={dropRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                  }}
                />
              </div>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    marginBottom: 8,
                  }}
                >
                  Supported formats
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    '📄 PDF',
                    '🖼️ Images',
                    '📧 Email screenshots',
                    '💬 Message screenshots',
                    '📝 Word docs',
                  ].map((t) => (
                    <span
                      key={t}
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: 4,
                        padding: '3px 9px',
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 11,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: extracting */}
          {step === 'extracting' && (
            <div
              style={{
                paddingBottom: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 0',
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: C.purpleDim,
                  border: `2px solid ${C.purple}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 16,
                }}
              >
                🤖
              </div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                Analysing document…
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                Extracting supplier, price, delivery & specs
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: C.purple,
                      animation: `bounce .9s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step: review */}
          {step === 'review' && (
            <div style={{ paddingBottom: 8 }}>
              {aiNote && (
                <div
                  style={{
                    background: aiNote.startsWith('OK')
                      ? C.greenDim
                      : C.accentDim,
                    border: `1px solid ${
                      aiNote.startsWith('OK') ? C.green + '44' : C.accent + '44'
                    }`,
                    borderRadius: 8,
                    padding: '9px 13px',
                    color: aiNote.startsWith('OK') ? C.green : C.accent,
                    fontFamily: F,
                    fontSize: 12,
                    marginBottom: 14,
                  }}
                >
                  {aiNote}
                </div>
              )}
              {file && (
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>
                    {file.dataUrl?.startsWith('data:image') ? '🖼️' : '📄'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontWeight: 600,
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 10,
                        marginTop: 1,
                      }}
                    >
                      {file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}
                    </div>
                  </div>
                  {file.dataUrl?.startsWith('data:image') && (
                    <img
                      src={file.dataUrl}
                      alt=""
                      style={{
                        width: 44,
                        height: 44,
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: `1px solid ${C.border}`,
                      }}
                    />
                  )}
                </div>
              )}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label style={LBL}>Supplier Name *</label>
                    <input
                      style={INP}
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="e.g. Gulf Steel Co."
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Price ($) *</label>
                    <input
                      style={INP}
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Delivery Time</label>
                    <input
                      style={INP}
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value)}
                      placeholder="e.g. 10 days"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Offer Validity</label>
                    <input
                      style={INP}
                      value={validity}
                      onChange={(e) => setValidity(e.target.value)}
                      placeholder="e.g. 30 days"
                    />
                  </div>
                </div>
                <div>
                  <label style={LBL}>Quality / Specifications</label>
                  <input
                    style={INP}
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    placeholder="e.g. High – ISO certified"
                  />
                </div>
                <div>
                  <label style={LBL}>Notes</label>
                  <textarea
                    style={{ ...INP, resize: 'none' }}
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Conditions, inclusions, exclusions…"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '18px 26px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {step === 'drop' && (
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                color: C.muted,
                border: `1px solid ${C.border}`,
                padding: '11px 18px',
                borderRadius: 8,
                fontFamily: F,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          {step === 'review' && (
            <>
              <button
                onClick={() => {
                  setStep('drop');
                  setFile(null);
                }}
                style={{
                  background: 'transparent',
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  padding: '11px 18px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ← Upload Another
              </button>
              <button
                onClick={save}
                style={{
                  background: C.accent,
                  color: '#000',
                  border: 'none',
                  padding: '11px 28px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ✓ Save Offer
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

// ─── TENDERS PAGE ──────────────────────────────────────────────────────────────
function TendersPage({ allProjects = PROJECTS }) {
  const { tenders, ready, addTender, removeTender, addOffer, removeOffer } =
    useTenders();
  const [showAddMat, setShowAddMat] = useState(false);
  const [addingOffer, setAddingOffer] = useState(null);
  const [analyses, setAnalyses] = useState({});
  const [analysing, setAnalysing] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [mName, setMName] = useState('');
  const [mProj, setMProj] = useState(allProjects[0]?.id || PROJECTS[0].id);
  const [mDesc, setMDesc] = useState('');
  const [mErr, setMErr] = useState('');

  const submitMat = () => {
    if (!mName.trim()) {
      setMErr('Name required');
      return;
    }
    addTender({
      id: `ten${Date.now()}`,
      name: mName.trim(),
      projId: mProj,
      project: allProjects.find((p) => p.id === mProj)?.name || '',
      desc: mDesc.trim(),
      offers: [],
    });
    setMName('');
    setMDesc('');
    setShowAddMat(false);
  };

  const runAnalysis = (tender) => {
    setAnalysing(tender.id);
    setTimeout(() => {
      const offers = [...tender.offers];
      if (offers.length === 0) {
        setAnalysing(null);
        return;
      }
      const minP = Math.min(...offers.map((o) => o.price));
      const maxP = Math.max(...offers.map((o) => o.price));
      const qualKeywords = [
        'premium',
        'high',
        'iso',
        'certified',
        'en-',
        'bs ',
        'grade a',
      ];
      const scored = offers.map((o) => {
        const priceScore = ((maxP - o.price) / (maxP - minP || 1)) * 40;
        const qualScore =
          qualKeywords.filter((k) => o.quality.toLowerCase().includes(k))
            .length * 8;
        const delivDays = parseInt(o.delivery) || 99;
        const delivScore = Math.max(0, 30 - (delivDays - 3));
        const total = priceScore + qualScore + delivScore;
        return { ...o, priceScore, qualScore, delivScore, total };
      });
      const sorted = [...scored].sort((a, b) => b.total - a.total);
      const ranked = sorted.map((o, i) => ({ ...o, rank: i + 1 }));
      const best = ranked[0];
      const priceRange = `$${minP.toLocaleString()} – $${maxP.toLocaleString()}`;
      const analysis = {
        summary: `${offers.length} offers received for "${
          tender.name
        }". Prices range from ${priceRange}. Delivery times vary between ${Math.min(
          ...offers.map((o) => parseInt(o.delivery) || 99)
        )} and ${Math.max(
          ...offers.map((o) => parseInt(o.delivery) || 99)
        )} days. Quality levels range from standard to ${
          offers.some((o) => o.quality.toLowerCase().includes('premium'))
            ? 'premium-grade certified'
            : 'high-grade material'
        }.`,
        recommendation: `${
          best.supplier
        } offers the best overall value — scoring highest across price competitiveness, quality, and delivery speed. ${
          best.quality.toLowerCase().includes('certified') ||
          best.quality.toLowerCase().includes('iso') ||
          best.quality.toLowerCase().includes('premium')
            ? 'Their certified material quality reduces risk of rework or structural issues.'
            : 'Their offering balances cost and reliability well.'
        } Delivery in ${best.delivery} keeps the project timeline on track. ${
          ranked.length > 1
            ? `The next-best option is ${
                ranked[1].supplier
              } at $${ranked[1].price.toLocaleString()}, which scores lower due to ${
                ranked[1].delivery > best.delivery
                  ? 'longer delivery time'
                  : 'slightly lower quality rating'
              }.`
            : ''
        }`,
        ranked,
      };
      setAnalyses((prev) => ({ ...prev, [tender.id]: analysis }));
      setAnalysing(null);
    }, 1400);
  };

  if (!ready)
    return (
      <div
        style={{
          color: C.muted,
          fontFamily: F,
          padding: 40,
          textAlign: 'center',
        }}
      >
        Loading…
      </div>
    );

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {showAddMat && (
        <Overlay onClose={() => setShowAddMat(false)}>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 28,
              width: 460,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 17,
                }}
              >
                Add Material / Good
              </span>
              <button
                onClick={() => setShowAddMat(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  fontSize: 20,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            {mErr && (
              <div
                style={{
                  background: C.redDim,
                  border: `1px solid ${C.red}44`,
                  borderRadius: 7,
                  padding: '8px 12px',
                  color: C.red,
                  fontFamily: F,
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                {mErr}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LBL}>Material / Good Name *</label>
                <input
                  style={INP}
                  placeholder="e.g. Structural Steel Beams"
                  value={mName}
                  onChange={(e) => {
                    setMName(e.target.value);
                    setMErr('');
                  }}
                />
              </div>
              <div>
                <label style={LBL}>Associated Project</label>
                <select
                  value={mProj}
                  onChange={(e) => setMProj(Number(e.target.value))}
                  style={{ ...INP, cursor: 'pointer' }}
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={LBL}>Description (optional)</label>
                <textarea
                  style={{ ...INP, resize: 'none' }}
                  rows={2}
                  placeholder="Specifications, quantity…"
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                onClick={submitMat}
                style={{
                  flex: 1,
                  background: C.accent,
                  color: '#000',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 8,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ✓ Add Material
              </button>
              <button
                onClick={() => setShowAddMat(false)}
                style={{
                  background: 'transparent',
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  padding: '12px 18px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {addingOffer && (
        <UploadOfferModal
          tenderId={addingOffer}
          onConfirm={(o) => {
            addOffer(addingOffer, o);
            setAddingOffer(null);
          }}
          onCancel={() => setAddingOffer(null)}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 22,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Tenders
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Procurement offers for materials & goods
          </div>
        </div>
        <button
          onClick={() => setShowAddMat(true)}
          style={{
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '11px 22px',
            borderRadius: 9,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + Add Material
        </button>
      </div>

      {tenders.length === 0 && (
        <div
          style={{
            background: C.card,
            border: `2px dashed ${C.border}`,
            borderRadius: 14,
            padding: '60px 20px',
            textAlign: 'center',
            color: C.muted,
            fontFamily: F,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 6,
            }}
          >
            No tenders yet
          </div>
          <div style={{ fontSize: 13 }}>
            Add a material to start collecting supplier offers
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {tenders.map((tender) => {
          const open = !!expanded[tender.id];
          const analysis = analyses[tender.id];
          const isAnalysing = analysing === tender.id;
          return (
            <div
              key={tender.id}
              style={{
                background: C.card,
                border: `1px solid ${open ? C.accent + '55' : C.border}`,
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'border-color .2s',
              }}
            >
              <div
                onClick={() =>
                  setExpanded((p) => ({ ...p, [tender.id]: !open }))
                }
                style={{
                  padding: '18px 22px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: open ? C.accentDim : 'transparent',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: C.accentDim,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.accent,
                    flexShrink: 0,
                  }}
                >
                  MAT
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {tender.name}
                  </div>
                  <div
                    style={{
                      color: C.muted,
                      fontFamily: F,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {tender.project} · {tender.offers.length} offer
                    {tender.offers.length !== 1 ? 's' : ''}{' '}
                    {tender.desc && `· ${tender.desc}`}
                  </div>
                </div>
                <span
                  style={{
                    color: open ? C.accent : C.muted,
                    fontSize: 20,
                    transform: open ? 'rotate(90deg)' : 'none',
                    transition: 'transform .25s',
                  }}
                >
                  ›
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTender(tender.id);
                  }}
                  style={{
                    background: 'transparent',
                    color: C.red,
                    border: 'none',
                    padding: '4px 8px',
                    fontFamily: F,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {open && (
                <div
                  style={{
                    padding: '0 22px 22px',
                    borderTop: `1px solid ${C.border}22`,
                  }}
                >
                  {tender.offers.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '28px 0',
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 13,
                      }}
                    >
                      No offers yet — add one below
                    </div>
                  ) : (
                    <div
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 9,
                        overflow: 'auto',
                        margin: '16px 0 14px',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontFamily: F,
                          fontSize: 12,
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              background: C.bg,
                              borderBottom: `1px solid ${C.border}`,
                            }}
                          >
                            {[
                              'Rank',
                              'Supplier',
                              'Price',
                              'Quality',
                              'Delivery',
                              'Notes',
                              '',
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  color: C.muted,
                                  fontWeight: 700,
                                  padding: '8px 12px',
                                  textAlign: 'left',
                                  fontSize: 11,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tender.offers.map((o, i) => {
                            const rank = analysis?.ranked?.find(
                              (r) => r.id === o.id
                            )?.rank;
                            const rankColors = {
                              1: C.green,
                              2: C.accent,
                              3: C.muted,
                            };
                            return (
                              <tr
                                key={o.id}
                                style={{
                                  borderBottom:
                                    i < tender.offers.length - 1
                                      ? `1px solid ${C.border}22`
                                      : 'none',
                                  background:
                                    rank === 1 ? C.green + '06' : 'transparent',
                                }}
                              >
                                <td style={{ padding: '10px 12px' }}>
                                  {rank ? (
                                    <span
                                      style={{
                                        background: rankColors[rank] || '#fff1',
                                        color: rankColors[rank] || '#aaa',
                                        borderRadius: 4,
                                        padding: '2px 8px',
                                        fontSize: 11,
                                        fontWeight: 700,
                                      }}
                                    >
                                      #{rank}
                                    </span>
                                  ) : (
                                    <span
                                      style={{ color: C.muted, fontSize: 11 }}
                                    >
                                      —
                                    </span>
                                  )}
                                </td>
                                <td
                                  style={{
                                    color: C.text,
                                    padding: '10px 12px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {o.supplier}
                                  {rank === 1 && (
                                    <span
                                      style={{ marginLeft: 6, fontSize: 10 }}
                                    >
                                      ⭐
                                    </span>
                                  )}
                                </td>
                                <td
                                  style={{
                                    color: C.accent,
                                    padding: '10px 12px',
                                    fontWeight: 700,
                                  }}
                                >
                                  ${Number(o.price).toLocaleString()}
                                </td>
                                <td
                                  style={{
                                    color: C.text,
                                    padding: '10px 12px',
                                    maxWidth: 140,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {o.quality || '—'}
                                </td>
                                <td
                                  style={{
                                    color: C.muted,
                                    padding: '10px 12px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {o.delivery || '—'}
                                </td>
                                <td
                                  style={{
                                    color: C.muted,
                                    padding: '10px 12px',
                                    maxWidth: 140,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {o.notes || '—'}
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  <button
                                    onClick={() => removeOffer(tender.id, o.id)}
                                    style={{
                                      background: 'transparent',
                                      color: C.red,
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: 13,
                                    }}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      marginBottom: analysis ? 16 : 0,
                    }}
                  >
                    <button
                      onClick={() => setAddingOffer(tender.id)}
                      style={{
                        background: C.surface,
                        color: C.text,
                        border: `1px solid ${C.border}`,
                        padding: '9px 18px',
                        borderRadius: 8,
                        fontFamily: F,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      + Add Offer
                    </button>
                    {tender.offers.length >= 2 && (
                      <button
                        onClick={() => runAnalysis(tender)}
                        disabled={isAnalysing}
                        style={{
                          background: isAnalysing ? 'transparent' : C.purple,
                          color: isAnalysing ? C.purple : '#fff',
                          border: `1px solid ${C.purple}44`,
                          padding: '9px 20px',
                          borderRadius: 8,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {isAnalysing ? (
                          <>
                            <div
                              style={{
                                width: 14,
                                height: 14,
                                border: `2px solid ${C.purple}`,
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin .7s linear infinite',
                              }}
                            />
                            Analysing…
                          </>
                        ) : (
                          '🤖 AI Analysis'
                        )}
                      </button>
                    )}
                  </div>

                  {analysis && (
                    <div
                      style={{
                        background:
                          'linear-gradient(135deg,#a78bfa08,#3b82f608)',
                        border: `1px solid ${C.purple}33`,
                        borderRadius: 12,
                        padding: '20px 22px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: C.purpleDim,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                          }}
                        >
                          🤖
                        </div>
                        <span
                          style={{
                            color: C.purple,
                            fontFamily: F,
                            fontWeight: 700,
                            fontSize: 15,
                          }}
                        >
                          AI Analysis
                        </span>
                        <span
                          style={{
                            color: C.muted,
                            fontFamily: F,
                            fontSize: 11,
                            marginLeft: 'auto',
                          }}
                        >
                          Scored on price, quality & delivery
                        </span>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <SLabel>Summary</SLabel>
                        <div
                          style={{
                            color: C.text,
                            fontFamily: F,
                            fontSize: 13,
                            lineHeight: 1.65,
                          }}
                        >
                          {analysis.summary}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <SLabel>Rankings</SLabel>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          {analysis.ranked.map((r) => {
                            const medal =
                              r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉';
                            const bc =
                              r.rank === 1
                                ? C.green
                                : r.rank === 2
                                ? C.accent
                                : C.muted;
                            return (
                              <div
                                key={r.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  background:
                                    r.rank === 1 ? C.green + '0d' : C.surface,
                                  border: `1px solid ${
                                    r.rank === 1 ? C.green + '44' : C.border
                                  }`,
                                  borderRadius: 9,
                                  padding: '12px 16px',
                                }}
                              >
                                <span style={{ fontSize: 20, flexShrink: 0 }}>
                                  {medal}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      color: C.text,
                                      fontFamily: F,
                                      fontWeight: 700,
                                      fontSize: 14,
                                    }}
                                  >
                                    {r.supplier}
                                    {r.rank === 1 && (
                                      <span
                                        style={{
                                          color: C.green,
                                          fontSize: 11,
                                          fontWeight: 600,
                                          marginLeft: 8,
                                        }}
                                      >
                                        Best Pick
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      color: C.muted,
                                      fontFamily: F,
                                      fontSize: 11,
                                      marginTop: 2,
                                      display: 'flex',
                                      gap: 12,
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: C.accent,
                                        fontWeight: 700,
                                      }}
                                    >
                                      ${r.price.toLocaleString()}
                                    </span>
                                    <span>{r.quality}</span>
                                    <span>🚚 {r.delivery}</span>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                    alignItems: 'flex-end',
                                    flexShrink: 0,
                                  }}
                                >
                                  {[
                                    ['Price', r.priceScore, 40],
                                    ['Quality', r.qualScore, 40],
                                    ['Delivery', r.delivScore, 30],
                                  ].map(([lbl, val, max]) => (
                                    <div
                                      key={lbl}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: C.muted,
                                          fontFamily: F,
                                          fontSize: 9,
                                          width: 44,
                                          textAlign: 'right',
                                        }}
                                      >
                                        {lbl}
                                      </span>
                                      <div
                                        style={{
                                          width: 60,
                                          height: 4,
                                          background: C.border,
                                          borderRadius: 2,
                                          overflow: 'hidden',
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              (val / max) * 100
                                            )}%`,
                                            height: '100%',
                                            background: bc,
                                            borderRadius: 2,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div
                        style={{
                          background: C.green + '0d',
                          border: `1px solid ${C.green}33`,
                          borderRadius: 9,
                          padding: '14px 18px',
                        }}
                      >
                        <div
                          style={{
                            color: C.green,
                            fontFamily: F,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 0.8,
                            marginBottom: 6,
                          }}
                        >
                          Recommendation
                        </div>
                        <div
                          style={{
                            color: C.text,
                            fontFamily: F,
                            fontSize: 13,
                            lineHeight: 1.65,
                          }}
                        >
                          {analysis.recommendation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Payments Page ─────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Card',
  'Online Transfer',
  'Other',
];

function AddPaymentModal({ allProjects, allInvoices, onConfirm, onCancel }) {
  const [projId, setProjId] = useState(allProjects[0]?.id || 1);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [invRef, setInvRef] = useState('');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [err, setErr] = useState('');
  const fileRef = useRef();

  const proj = allProjects.find((p) => p.id === projId);
  const projInvoices = allInvoices.filter(
    (i) => i.projId === projId || i.project === proj?.name
  );

  const handleFile = async (raw) => {
    if (raw.size > 5 * 1024 * 1024) {
      setErr('File too large (max 5MB)');
      return;
    }
    const du = await new Promise((r) => {
      const rd = new FileReader();
      rd.onload = (e) => r(e.target.result);
      rd.readAsDataURL(raw);
    });
    setReceipt({ name: raw.name, size: raw.size, dataUrl: du });
  };

  const submit = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setErr('Payment amount is required');
      return;
    }
    if (!date) {
      setErr('Payment date is required');
      return;
    }
    const fmtDate = (d) =>
      new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    onConfirm({
      id: `pay-${Date.now()}`,
      projId,
      project: proj?.name || '',
      amount: parseFloat(amount),
      date,
      dateFmt: fmtDate(date),
      method,
      invRef: invRef || null,
      notes: notes.trim(),
      receipt: receipt || null,
      recordedAt: new Date().toLocaleDateString(),
    });
  };

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          width: 600,
          maxHeight: '93vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        <div
          style={{
            padding: '22px 28px 18px',
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              💰 Record Payment
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Record a payment received from the client
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 22,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>
          {err && (
            <div
              style={{
                background: C.redDim,
                border: `1px solid ${C.red}44`,
                borderRadius: 7,
                padding: '9px 12px',
                color: C.red,
                fontFamily: F,
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              ⚠ {err}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={LBL}>Project</label>
              <select
                value={projId}
                onChange={(e) => setProjId(Number(e.target.value))}
                style={{ ...INP, cursor: 'pointer' }}
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Amount *</label>
                <input
                  style={INP}
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErr('');
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Payment Date *</label>
                <input
                  style={{ ...INP, colorScheme: 'dark' }}
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErr('');
                  }}
                />
              </div>
            </div>
            <div>
              <label style={LBL}>Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{ ...INP, cursor: 'pointer' }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={LBL}>
                Related Invoice{' '}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (optional)
                </span>
              </label>
              <select
                value={invRef}
                onChange={(e) => setInvRef(e.target.value)}
                style={{ ...INP, cursor: 'pointer' }}
              >
                <option value="">— None —</option>
                {projInvoices.map((i) => (
                  <option key={i.id || i.invId} value={i.id || i.invId}>
                    {i.id || i.invId} · ${Number(i.amount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={LBL}>
                Notes{' '}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (optional)
                </span>
              </label>
              <textarea
                style={{ ...INP, resize: 'none' }}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reference number, comments…"
              />
            </div>
            {/* Receipt / document upload */}
            <div>
              <label style={LBL}>
                Attach Receipt / Document{' '}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (optional)
                </span>
              </label>
              {receipt ? (
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.green}44`,
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: C.card,
                        borderRadius: 7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {receipt.dataUrl?.startsWith('data:image') ? '🖼️' : '📄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: C.green,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        ✓ File attached
                      </div>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontSize: 11,
                          marginTop: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {receipt.name}
                      </div>
                    </div>
                    <button
                      onClick={() => setReceipt(null)}
                      style={{
                        background: 'transparent',
                        color: C.red,
                        border: `1px solid ${C.red}33`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontFamily: F,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  {receipt.dataUrl?.startsWith('data:image') && (
                    <img
                      src={receipt.dataUrl}
                      alt=""
                      style={{
                        maxWidth: '100%',
                        maxHeight: 180,
                        objectFit: 'contain',
                        borderRadius: 8,
                        marginTop: 10,
                        border: `1px solid ${C.border}`,
                      }}
                    />
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.green;
                    e.currentTarget.style.background = C.greenDim;
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                  }}
                  style={{
                    border: `2px dashed ${C.border}`,
                    borderRadius: 10,
                    padding: '24px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.green + '88';
                    e.currentTarget.style.background = C.greenDim;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 7 }}>📎</div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 3,
                    }}
                  >
                    Drop receipt or click to browse
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    PDF · Images · Screenshots · Any format
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.doc,.docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            padding: '18px 28px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '11px 20px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              background: C.green,
              color: '#fff',
              border: 'none',
              padding: '11px 32px',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            💰 Save Payment
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── EditPaymentModal ─────────────────────────────────────────────────────────
function EditPaymentModal({
  payment,
  allProjects,
  allInvoices,
  onConfirm,
  onCancel,
}) {
  const fmtDate = (d) =>
    d
      ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';
  const [projId, setProjId] = useState(
    payment.projId || allProjects[0]?.id || 1
  );
  const [amount, setAmount] = useState(String(payment.amount || ''));
  const [date, setDate] = useState(payment.date || '');
  const [method, setMethod] = useState(payment.method || PAYMENT_METHODS[0]);
  const [invRef, setInvRef] = useState(payment.invRef || '');
  const [notes, setNotes] = useState(payment.notes || '');
  const [receipt, setReceipt] = useState(payment.receipt || null);
  const [err, setErr] = useState('');
  const fileRef = useRef();

  const proj = allProjects.find((p) => p.id === projId) || allProjects[0];
  const projInvoices = allInvoices.filter(
    (i) => i.projId === projId || i.project === proj?.name
  );

  const handleFile = async (raw) => {
    if (raw.size > 5 * 1024 * 1024) {
      setErr('File too large (max 5MB)');
      return;
    }
    const du = await new Promise((r) => {
      const rd = new FileReader();
      rd.onload = (e) => r(e.target.result);
      rd.readAsDataURL(raw);
    });
    setReceipt({ name: raw.name, size: raw.size, dataUrl: du });
  };

  const submit = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setErr('Payment amount is required');
      return;
    }
    if (!date) {
      setErr('Payment date is required');
      return;
    }
    onConfirm({
      ...payment,
      projId,
      project: proj?.name || payment.project || '',
      amount: parseFloat(amount),
      date,
      dateFmt: fmtDate(date),
      method,
      invRef: invRef || null,
      notes: notes.trim(),
      receipt: receipt || null,
    });
  };

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          width: 600,
          maxHeight: '93vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        <div
          style={{
            padding: '22px 28px 18px',
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              ✏️ Edit Payment
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Update payment information
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 22,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>
          {err && (
            <div
              style={{
                background: C.redDim,
                border: `1px solid ${C.red}44`,
                borderRadius: 7,
                padding: '9px 12px',
                color: C.red,
                fontFamily: F,
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              ⚠ {err}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={LBL}>Project</label>
              <select
                value={projId}
                onChange={(e) => setProjId(Number(e.target.value))}
                style={{ ...INP, cursor: 'pointer' }}
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Amount *</label>
                <input
                  style={INP}
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErr('');
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Payment Date *</label>
                <input
                  style={{ ...INP, colorScheme: 'dark' }}
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErr('');
                  }}
                />
              </div>
            </div>
            <div>
              <label style={LBL}>Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{ ...INP, cursor: 'pointer' }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={LBL}>
                Related Invoice{' '}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (optional)
                </span>
              </label>
              <select
                value={invRef}
                onChange={(e) => setInvRef(e.target.value)}
                style={{ ...INP, cursor: 'pointer' }}
              >
                <option value="">— None —</option>
                {projInvoices.map((i) => (
                  <option key={i.id || i.invId} value={i.id || i.invId}>
                    {i.id || i.invId} · ${Number(i.amount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={LBL}>
                Notes{' '}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (optional)
                </span>
              </label>
              <textarea
                style={{ ...INP, resize: 'none' }}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reference number, comments…"
              />
            </div>
            <div>
              <label style={LBL}>
                Receipt / Document{' '}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (optional — replace existing)
                </span>
              </label>
              {receipt ? (
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.green}44`,
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: C.card,
                        borderRadius: 7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {receipt.dataUrl?.startsWith('data:image') ? '🖼️' : '📄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: C.green,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        ✓ Attached
                      </div>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontSize: 11,
                          marginTop: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {receipt.name}
                      </div>
                    </div>
                    <button
                      onClick={() => setReceipt(null)}
                      style={{
                        background: 'transparent',
                        color: C.red,
                        border: `1px solid ${C.red}33`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontFamily: F,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  {receipt.dataUrl?.startsWith('data:image') && (
                    <img
                      src={receipt.dataUrl}
                      alt=""
                      style={{
                        maxWidth: '100%',
                        maxHeight: 160,
                        objectFit: 'contain',
                        borderRadius: 8,
                        marginTop: 10,
                        border: `1px solid ${C.border}`,
                      }}
                    />
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.green;
                    e.currentTarget.style.background = C.greenDim;
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                  }}
                  style={{
                    border: `2px dashed ${C.border}`,
                    borderRadius: 10,
                    padding: '22px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.green + '88';
                    e.currentTarget.style.background = C.greenDim;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 600,
                      fontSize: 12,
                      marginBottom: 2,
                    }}
                  >
                    Drop file or click to browse
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    PDF · Images · Screenshots
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.doc,.docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            padding: '18px 28px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '11px 20px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '11px 32px',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✓ Save Changes
          </button>
        </div>
      </div>
    </Overlay>
  );
}
function PayReceiptBtn({ receipt }) {
  const [show, setShow] = useState(false);
  return (
    <>
      {show && (
        <FilePreviewModal file={receipt} onClose={() => setShow(false)} />
      )}
      <button
        onClick={() => setShow(true)}
        style={{
          background: 'transparent',
          color: C.blue,
          border: `1px solid ${C.blue}33`,
          padding: '2px 8px',
          borderRadius: 4,
          fontFamily: F,
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        View
      </button>
    </>
  );
}
// Payments panel inside project detail
function PaymentsPanel({
  project,
  payments,
  addPayment,
  updatePayment,
  removePayment,
  allProjects,
  allInvoices,
  onActivity,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [confirmEditPay, setConfirmEditPay] = useState(null);
  const [confirmDeletePay, setConfirmDeletePay] = useState(null);
  const projPayments = payments.filter(
    (p) => p.projId === project.id || p.project === project.name
  );
  const total = projPayments.reduce((s, p) => s + p.amount, 0);
  // inline form state
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState('');
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0]);
  const [payInvRef, setPayInvRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payReceipt, setPayReceipt] = useState(null);
  const [payErr, setPayErr] = useState('');
  const payFileRef = useRef();

  const projInvoices = useMemo(
    () =>
      allInvoices.filter(
        (i) => i.projId === project.id || i.project === project.name
      ),
    [allInvoices, project]
  );

  const handlePayFile = async (raw) => {
    if (raw.size > 5 * 1024 * 1024) {
      setPayErr('File too large (max 5MB)');
      return;
    }
    const du = await new Promise((r) => {
      const rd = new FileReader();
      rd.onload = (e) => r(e.target.result);
      rd.readAsDataURL(raw);
    });
    setPayReceipt({ name: raw.name, size: raw.size, dataUrl: du });
  };

  const submitPay = () => {
    if (!payAmount || isNaN(parseFloat(payAmount))) {
      setPayErr('Payment amount is required');
      return;
    }
    if (!payDate) {
      setPayErr('Payment date is required');
      return;
    }
    const fmtD = (d) =>
      new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    addPayment({
      id: `pay-${Date.now()}`,
      projId: project.id,
      project: project.name,
      amount: parseFloat(payAmount),
      date: payDate,
      dateFmt: fmtD(payDate),
      method: payMethod,
      invRef: payInvRef || null,
      notes: payNotes.trim(),
      receipt: payReceipt || null,
      recordedAt: new Date().toLocaleDateString(),
    });
    onActivity &&
      onActivity(
        `Payment $${parseFloat(payAmount).toLocaleString()} recorded`,
        '💰'
      );
    setShowAdd(false);
  };

  return (
    <div>
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          allProjects={allProjects}
          allInvoices={allInvoices}
          onConfirm={(patch) => {
            setEditingPayment(null);
            setConfirmEditPay({ id: editingPayment.id, patch });
          }}
          onCancel={() => setEditingPayment(null)}
        />
      )}
      {confirmEditPay && (
        <ConfirmDialog
          title="Save Payment Changes?"
          message="Are you sure you want to apply these changes to this payment?"
          confirmLabel="Yes, Save"
          variant="edit"
          onConfirm={() => {
            updatePayment &&
              updatePayment(confirmEditPay.id, confirmEditPay.patch);
            onActivity &&
              onActivity(
                `Payment $${confirmEditPay.patch.amount?.toLocaleString()} updated`,
                'Edit'
              );
            setConfirmEditPay(null);
          }}
          onCancel={() => setConfirmEditPay(null)}
        />
      )}
      {confirmDeletePay && (
        <ConfirmDialog
          title="Delete Payment?"
          message={`Are you sure you want to delete this payment of $${Number(
            confirmDeletePay.amount || 0
          ).toLocaleString()}? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          variant="delete"
          onConfirm={() => {
            removePayment && removePayment(confirmDeletePay.id);
            onActivity &&
              onActivity(
                `Payment $${confirmDeletePay.amount?.toLocaleString()} deleted`,
                'Del'
              );
            setConfirmDeletePay(null);
          }}
          onCancel={() => setConfirmDeletePay(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: C.muted, fontFamily: F, fontSize: 13 }}>
              {confirmDeletePay.dateFmt}
            </span>
            <span style={{ color: C.green, fontFamily: F, fontWeight: 700 }}>
              ${Number(confirmDeletePay.amount || 0).toLocaleString()}
            </span>
          </div>
        </ConfirmDialog>
      )}
      {projPayments.length > 0 && !showAdd && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 14,
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: F,
              fontSize: 12,
            }}
          >
            <thead>
              <tr
                style={{
                  background: C.bg,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {[
                  'Date',
                  'Amount',
                  'Method',
                  'Invoice',
                  'Notes',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: C.muted,
                      fontWeight: 700,
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontSize: 11,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projPayments.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom:
                      i < projPayments.length - 1
                        ? `1px solid ${C.border}22`
                        : 'none',
                  }}
                >
                  <td style={{ color: C.muted, padding: '9px 12px' }}>
                    {p.dateFmt}
                  </td>
                  <td
                    style={{
                      color: C.green,
                      padding: '9px 12px',
                      fontWeight: 700,
                    }}
                  >
                    ${p.amount.toLocaleString()}
                  </td>
                  <td style={{ color: C.muted, padding: '9px 12px' }}>
                    {p.method}
                  </td>
                  <td
                    style={{
                      color: C.accent,
                      padding: '9px 12px',
                      fontSize: 11,
                    }}
                  >
                    {p.invRef || '—'}
                  </td>
                  <td
                    style={{
                      color: C.muted,
                      padding: '9px 12px',
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.notes || '—'}
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.receipt && <PayReceiptBtn receipt={p.receipt} />}
                      <button
                        onClick={() => setEditingPayment(p)}
                        style={{
                          background: C.blueDim,
                          color: C.blue,
                          border: `1px solid ${C.blue}33`,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontFamily: F,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setConfirmDeletePay(p)}
                        style={{
                          background: 'transparent',
                          color: C.red,
                          border: `1px solid ${C.red}33`,
                          padding: '2px 7px',
                          borderRadius: 4,
                          fontFamily: F,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              padding: '8px 14px',
              borderTop: `1px solid ${C.border}22`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 4,
            }}
          >
            <span style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
              Total received:
            </span>
            <span
              style={{
                color: C.green,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      {projPayments.length === 0 && !showAdd && (
        <div
          style={{
            color: C.muted,
            fontFamily: F,
            fontSize: 12,
            padding: '10px 0',
            marginBottom: 12,
          }}
        >
          No payments recorded yet
        </div>
      )}
      {showAdd ? (
        <InlineFormShell
          header="Record Payment"
          accent={C.green}
          saveLabel="Save Payment"
          onSave={submitPay}
          onCancel={() => setShowAdd(false)}
          err={payErr}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Amount *</label>
              <input
                style={INP}
                type="number"
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => {
                  setPayAmount(e.target.value);
                  setPayErr('');
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Payment Date *</label>
              <input
                style={{ ...INP, colorScheme: 'dark' }}
                type="date"
                value={payDate}
                onChange={(e) => {
                  setPayDate(e.target.value);
                  setPayErr('');
                }}
              />
            </div>
          </div>
          <div>
            <label style={LBL}>Payment Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>
              Related Invoice{' '}
              <span style={{ fontWeight: 400, color: C.muted }}>
                (optional)
              </span>
            </label>
            <select
              value={payInvRef}
              onChange={(e) => setPayInvRef(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              <option value="">— None —</option>
              {projInvoices.map((i) => (
                <option key={i.id || i.invId} value={i.id || i.invId}>
                  {i.id || i.invId} · ${Number(i.amount).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>
              Notes{' '}
              <span style={{ fontWeight: 400, color: C.muted }}>
                (optional)
              </span>
            </label>
            <textarea
              style={{ ...INP, resize: 'none' }}
              rows={2}
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="Reference number, comments…"
            />
          </div>
          <div>
            <label style={LBL}>
              Attach Receipt{' '}
              <span style={{ fontWeight: 400, color: C.muted }}>
                (optional)
              </span>
            </label>
            {payReceipt ? (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.green}44`,
                  borderRadius: 9,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    background: C.card,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {payReceipt.dataUrl?.startsWith('data:image') ? '🖼️' : '📄'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: C.green,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    ✓ Attached
                  </div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontSize: 11,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {payReceipt.name}
                  </div>
                </div>
                <button
                  onClick={() => setPayReceipt(null)}
                  style={{
                    background: 'transparent',
                    color: C.red,
                    border: `1px solid ${C.red}33`,
                    borderRadius: 5,
                    padding: '3px 8px',
                    fontFamily: F,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => payFileRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = C.green;
                  e.currentTarget.style.background = C.greenDim;
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                  const f = e.dataTransfer.files[0];
                  if (f) handlePayFile(f);
                }}
                style={{
                  border: `2px dashed ${C.border}`,
                  borderRadius: 9,
                  padding: '18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.green + '88';
                  e.currentTarget.style.background = C.greenDim;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 5 }}>📎</div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 600,
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  Drop receipt or click to browse
                </div>
                <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                  PDF · Images · Screenshots
                </div>
              </div>
            )}
            <input
              ref={payFileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.doc,.docx"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) handlePayFile(f);
                e.target.value = '';
              }}
            />
          </div>
        </InlineFormShell>
      ) : (
        <button
          onClick={() => {
            setPayAmount('');
            setPayDate('');
            setPayMethod(PAYMENT_METHODS[0]);
            setPayInvRef('');
            setPayNotes('');
            setPayReceipt(null);
            setPayErr('');
            setShowAdd(true);
          }}
          style={{
            background: C.green,
            color: '#fff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 7,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          + Record Payment
        </button>
      )}
    </div>
  );
}

// Global payments page
function PaymentsPage({
  payments,
  allProjects,
  addPayment,
  allInvoices,
  removePayment,
  updatePayment,
}) {
  const [projFilter, setProjFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [confirmEditPay, setConfirmEditPay] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        if (projFilter !== 'all' && String(p.projId) !== projFilter)
          return false;
        return true;
      }),
    [payments, projFilter]
  );

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const thisMonth = payments
    .filter((p) => {
      if (!p.date) return false;
      const d = new Date(p.date + 'T12:00:00');
      const n = new Date();
      return (
        d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
      );
    })
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      {showAdd && (
        <AddPaymentModal
          allProjects={allProjects}
          allInvoices={allInvoices}
          onConfirm={(p) => {
            addPayment(p);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          allProjects={allProjects}
          allInvoices={allInvoices}
          onConfirm={(patch) => {
            setEditingPayment(null);
            setConfirmEditPay({ id: editingPayment.id, patch });
          }}
          onCancel={() => setEditingPayment(null)}
        />
      )}
      {confirmEditPay && (
        <ConfirmDialog
          title="Save Payment Changes?"
          message="Are you sure you want to apply these changes to this payment?"
          confirmLabel="Yes, Save"
          variant="edit"
          onConfirm={() => {
            updatePayment &&
              updatePayment(confirmEditPay.id, confirmEditPay.patch);
            setConfirmEditPay(null);
          }}
          onCancel={() => setConfirmEditPay(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Payment?"
          message={`Are you sure you want to delete this payment of $${Number(
            confirmDelete.amount || 0
          ).toLocaleString()}? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          variant="delete"
          onConfirm={() => {
            if (removePayment) removePayment(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: C.muted, fontFamily: F, fontSize: 13 }}>
              {confirmDelete.project} · {confirmDelete.dateFmt}
            </span>
            <span style={{ color: C.green, fontFamily: F, fontWeight: 700 }}>
              ${Number(confirmDelete.amount || 0).toLocaleString()}
            </span>
          </div>
        </ConfirmDialog>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 22,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Payments
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Track all client payments across projects
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: C.green,
            color: '#fff',
            border: 'none',
            padding: '11px 22px',
            borderRadius: 9,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + Record Payment
        </button>
      </div>
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}
      >
        {[
          ['Total Received', '$' + total.toLocaleString(), C.green],
          ['This Month', '$' + thisMonth.toLocaleString(), C.blue],
          ['Transactions', payments.length, C.purple],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '18px 22px',
              flex: 1,
              minWidth: 130,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 11,
                marginBottom: 5,
              }}
            >
              {l}
            </div>
            <div
              style={{
                color: c,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 26,
                lineHeight: 1,
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <select
          value={projFilter}
          onChange={(e) => setProjFilter(e.target.value)}
          style={{
            ...INP,
            width: 'auto',
            padding: '8px 14px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Projects</option>
          {allProjects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: C.muted,
              fontFamily: F,
              fontSize: 13,
            }}
          >
            No payments recorded yet
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: F,
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  background: C.surface,
                }}
              >
                {[
                  'Date',
                  'Project',
                  'Amount',
                  'Method',
                  'Invoice Ref',
                  'Notes',
                  'Receipt',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: C.muted,
                      fontWeight: 700,
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1
                        ? `1px solid ${C.border}22`
                        : 'none',
                  }}
                >
                  <td style={{ color: C.muted, padding: '13px 16px' }}>
                    {p.dateFmt}
                  </td>
                  <td
                    style={{
                      color: C.text,
                      padding: '13px 16px',
                      fontWeight: 600,
                    }}
                  >
                    {p.project}
                  </td>
                  <td
                    style={{
                      color: C.green,
                      padding: '13px 16px',
                      fontWeight: 700,
                    }}
                  >
                    ${p.amount.toLocaleString()}
                  </td>
                  <td style={{ color: C.muted, padding: '13px 16px' }}>
                    {p.method}
                  </td>
                  <td
                    style={{
                      color: C.accent,
                      padding: '13px 16px',
                      fontSize: 12,
                    }}
                  >
                    {p.invRef || '—'}
                  </td>
                  <td
                    style={{
                      color: C.muted,
                      padding: '13px 16px',
                      maxWidth: 140,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.notes || '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {p.receipt ? (
                      <span
                        style={{
                          color: C.blue,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setEditingPayment(p)}
                        style={{
                          background: C.blueDim,
                          color: C.blue,
                          border: `1px solid ${C.blue}33`,
                          padding: '4px 9px',
                          borderRadius: 5,
                          fontFamily: F,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p)}
                        style={{
                          background: 'transparent',
                          color: C.red,
                          border: `1px solid ${C.red}33`,
                          padding: '4px 9px',
                          borderRadius: 5,
                          fontFamily: F,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── REPORT GENERATOR ─────────────────────────────────────────────────────────
function ReportPage({ tasks, allProjects }) {
  const [projId, setProjId] = useState(
    (allProjects && allProjects[0]?.id) || PROJECTS[0].id
  );
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo] = useState('2025-12-31');
  const [report, setReport] = useState(null);
  const [generating, setGen] = useState(false);

  const fmtD = (d) => {
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const generate = () => {
    setGen(true);
    setTimeout(() => {
      const project =
        (allProjects || PROJECTS).find((p) => p.id === projId) ||
        PROJECTS.find((p) => p.id === projId);
      const invoices = (PROJ_INV[projId] || []).filter((i) =>
        inRange(i.due, from, to)
      );
      const logs = PROJ_LOGS_SEED[projId] || [];
      const notes = PROJ_NOTES_SEED[projId] || [];
      const ptasks = tasks.filter(
        (t) => t.projId === projId && inRange(t.date, from, to)
      );
      const totalInv = invoices.reduce((s, i) => s + i.amount, 0);
      const paidInv = invoices
        .filter((i) => i.status === 'paid')
        .reduce((s, i) => s + i.amount, 0);
      const members = PROJ_CREW_SEED[projId] || [];
      setReport({
        project,
        invoices,
        logs,
        notes,
        tasks: ptasks,
        totalInv,
        paidInv,
        members,
        from,
        to,
      });
      setGen(false);
    }, 800);
  };

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.rpt{animation:fadeUp .3s ease}`}</style>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 22,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Report Generator
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Generate a summary of any project for a selected time period
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 24,
        }}
      >
        <SLabel>Report Configuration</SLabel>
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={LBL}>Project</label>
            <select
              value={projId}
              onChange={(e) => {
                setProjId(Number(e.target.value));
                setReport(null);
              }}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {(allProjects || PROJECTS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={LBL}>From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setReport(null);
              }}
              style={{ ...INP, colorScheme: 'dark' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={LBL}>To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setReport(null);
              }}
              style={{ ...INP, colorScheme: 'dark' }}
            />
          </div>
          <button
            onClick={generate}
            disabled={generating}
            style={{
              background: generating ? 'transparent' : C.accent,
              color: generating ? C.accent : '#000',
              border: generating ? `1px solid ${C.accent}44` : 'none',
              padding: '10px 28px',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              height: 40,
            }}
          >
            {generating ? (
              <>
                <div
                  style={{
                    width: 15,
                    height: 15,
                    border: '2px solid #f59e0b44',
                    borderTopColor: C.accent,
                    borderRadius: '50%',
                    animation: 'spin .7s linear infinite',
                  }}
                />
                Generating…
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </div>

      {!report && !generating && (
        <div
          style={{
            background: C.card,
            border: `2px dashed ${C.border}`,
            borderRadius: 14,
            padding: '60px 20px',
            textAlign: 'center',
            color: C.muted,
            fontFamily: F,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 6,
            }}
          >
            No report generated yet
          </div>
          <div style={{ fontSize: 13 }}>
            Select a project and date range, then click Generate Report
          </div>
        </div>
      )}

      {report && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          className="rpt"
        >
          {/* Cover */}
          <div
            style={{
              background: `linear-gradient(135deg,${C.accent}18,${C.blue}10)`,
              border: `1px solid ${C.accent}44`,
              borderRadius: 16,
              padding: '28px 32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  Project Report
                </div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 24,
                  }}
                >
                  {report.project.name}
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  📍 {report.project.address}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Reporting Period
                </div>
                <div
                  style={{
                    color: C.accent,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 15,
                    marginTop: 4,
                  }}
                >
                  {fmtD(report.from)} – {fmtD(report.to)}
                </div>
                <div style={{ marginTop: 6 }}>
                  <Badge status={report.project.status} />
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                marginTop: 22,
                flexWrap: 'wrap',
              }}
            >
              {[
                ['Phase', report.project.phase],
                ['Progress', report.project.progress + '%'],
                ['Contract Value', '$' + report.project.value.toLocaleString()],
                ['Client', report.project.client.name],
                ['Due', report.project.dueFmt],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      color: C.muted,
                      fontFamily: F,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 600,
                      fontSize: 14,
                      marginTop: 3,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <Bar
                pct={report.project.progress}
                color={
                  report.project.status === 'completed' ? C.green : C.accent
                }
              />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              ['Invoices in Period', report.invoices.length, C.blue],
              [
                'Total Billed',
                '$' + report.totalInv.toLocaleString(),
                C.accent,
              ],
              ['Collected', '$' + report.paidInv.toLocaleString(), C.green],
              [
                'Outstanding',
                '$' + (report.totalInv - report.paidInv).toLocaleString(),
                C.red,
              ],
              ['Tasks', report.tasks.length, C.purple],
              ['Team', report.members.length, C.green],
            ].map(([l, v, c]) => (
              <div
                key={l}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '14px 18px',
                  flex: 1,
                  minWidth: 100,
                }}
              >
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 10,
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    color: c,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 20,
                    lineHeight: 1,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          {/* Invoices */}
          {report.invoices.length > 0 && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <SLabel>🧾 Invoices in Period</SLabel>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: F,
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Invoice', 'Description', 'Amount', 'Due', 'Status'].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            color: C.muted,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '7px 10px',
                            textAlign: 'left',
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {report.invoices.map((inv, i) => (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom:
                          i < report.invoices.length - 1
                            ? `1px solid ${C.border}22`
                            : 'none',
                      }}
                    >
                      <td
                        style={{
                          color: C.accent,
                          padding: '10px',
                          fontWeight: 700,
                        }}
                      >
                        {inv.id}
                      </td>
                      <td style={{ color: C.text, padding: '10px' }}>
                        {inv.desc}
                      </td>
                      <td
                        style={{
                          color: C.text,
                          padding: '10px',
                          fontWeight: 700,
                        }}
                      >
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td style={{ color: C.muted, padding: '10px' }}>
                        {inv.dueFmt}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {report.invoices.length === 0 && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '20px 24px',
                color: C.muted,
                fontFamily: F,
                fontSize: 13,
              }}
            >
              🧾 No invoices in this period.
            </div>
          )}

          {/* Tasks */}
          {report.tasks.length > 0 && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <SLabel>Tasks in Period</SLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.tasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: C.surface,
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: t.status === 'done' ? C.green : C.accent,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {t.title}
                      </span>
                      {t.desc && (
                        <span
                          style={{
                            color: C.muted,
                            fontFamily: F,
                            fontSize: 11,
                            marginLeft: 8,
                          }}
                        >
                          {t.desc}
                        </span>
                      )}
                    </div>
                    <span
                      style={{ color: C.muted, fontFamily: F, fontSize: 12 }}
                    >
                      👤 {t.member}
                    </span>
                    <span
                      style={{ color: C.muted, fontFamily: F, fontSize: 12 }}
                    >
                      📅 {t.date}
                    </span>
                    <Badge status={t.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {report.notes.length > 0 && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <SLabel>📝 Notes & Updates</SLabel>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {report.notes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      borderLeft: `3px solid ${C.accent}`,
                      paddingLeft: 14,
                      paddingTop: 4,
                      paddingBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {n.text}
                    </div>
                    <div
                      style={{
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 11,
                        marginTop: 4,
                      }}
                    >
                      {n.author} · {n.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {report.members.length > 0 && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <SLabel>👷 Team</SLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {report.members.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: C.surface,
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: (m.color || C.blue) + '22',
                        border: `2px solid ${m.color || C.blue}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: m.color || C.blue,
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {m.init}
                    </div>
                    <div>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {m.name}
                      </div>
                      <div
                        style={{ color: C.muted, fontFamily: F, fontSize: 11 }}
                      >
                        {m.role}
                      </div>
                    </div>
                    <Badge status={m.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          {report.logs.length > 0 && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <SLabel>🕐 Activity Log</SLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {report.logs.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      background: C.surface,
                      borderRadius: 7,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        background: C.card,
                        borderRadius: 7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {e.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {e.action}
                      </span>
                      <span
                        style={{
                          color: C.muted,
                          fontFamily: F,
                          fontSize: 12,
                          marginLeft: 10,
                        }}
                      >
                        {e.detail}
                      </span>
                    </div>
                    <span
                      style={{
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.user} · {e.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Calendar Page ─────────────────────────────────────────────────────────────
function CalendarPage({
  allInvoices,
  tasks,
  onAddTask,
  projectEvents = [],
  payments = [],
  allProjects = PROJECTS,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState('month');
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [dayDate, setDayDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`
  );
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const allMembers = useMemo(
    () =>
      Object.values(PROJ_CREW_SEED)
        .flat()
        .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i),
    []
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(() => {
    const ws = new Date(year, month, 1);
    ws.setDate(ws.getDate() - ws.getDay() + weekOffset * 7);
    return ws;
  }, [year, month, weekOffset]);
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart]
  );
  const fmtDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

  const invEvents = useMemo(
    () =>
      allInvoices
        .filter((i) => i.due)
        .map((i) => ({
          id: `inv-${i.id}`,
          type: 'invoice',
          date: i.due,
          title: `${i.id} due`,
          subtitle: `${i.project || ''} · $${Number(
            i.amount || 0
          ).toLocaleString()}`,
          color:
            i.status === 'overdue'
              ? C.red
              : i.status === 'paid'
              ? C.green
              : C.accent,
          detail: i,
        })),
    [allInvoices]
  );
  const taskEvents = useMemo(
    () =>
      tasks.map((t) => ({
        id: `task-${t.id}`,
        type: 'task',
        date: t.date,
        title: t.title,
        subtitle: `${t.member} · ${t.project}`,
        color: t.status === 'done' ? C.green : C.blue,
        detail: t,
      })),
    [tasks]
  );
  const paymentEvents = useMemo(
    () =>
      payments
        .filter((p) => p.date)
        .map((p) => ({
          id: `pay-${p.id}`,
          type: 'payment',
          date: p.date,
          title: `${p.project}`,
          subtitle: `$${Number(p.amount || 0).toLocaleString()} · ${p.method}`,
          color: '#10b981',
          detail: p,
        })),
    [payments]
  );
  const allEvents = useMemo(() => {
    if (filter === 'invoices') return invEvents;
    if (filter === 'team') return taskEvents;
    if (filter === 'projects') return projectEvents;
    if (filter === 'payments') return paymentEvents;
    return [...invEvents, ...taskEvents, ...projectEvents, ...paymentEvents];
  }, [filter, invEvents, taskEvents, projectEvents, paymentEvents]);
  const eventsOn = (d) => allEvents.filter((e) => e.date === d);

  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const grid = Array.from({ length: firstDay + days }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );
  while (grid.length % 7 !== 0) grid.push(null);
  const fmt = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(
      2,
      '0'
    )}`;
  const prevM = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextM = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div>
      {showAddTask && (
        <AddTaskModal
          onConfirm={(t) => {
            onAddTask(t);
            setShowAddTask(false);
          }}
          onCancel={() => setShowAddTask(false)}
          allMembers={allMembers}
          allProjects={allProjects}
        />
      )}
      {sel && (
        <Overlay onClose={() => setSel(null)}>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 28,
              width: 380,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: sel.color,
                  }}
                />
                <span
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {sel.title}
                </span>
              </div>
              <button
                onClick={() => setSel(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  fontSize: 20,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                background: C.surface,
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              {sel.type === 'invoice'
                ? [
                    ['Invoice', sel.detail.id || sel.detail.invId],
                    ['Project', sel.detail.project || '—'],
                    ['Description', sel.detail.desc || '—'],
                    [
                      'Amount',
                      `$${Number(sel.detail.amount || 0).toLocaleString()}`,
                    ],
                    ['Due', sel.detail.dueFmt || sel.detail.due || '—'],
                    [
                      'Status',
                      sel.detail.status || sel.detail.invoiceStatus || '—',
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ color: C.muted, fontFamily: F, fontSize: 12 }}
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))
                : sel.type === 'payment'
                ? [
                    ['Project', sel.detail.project || '—'],
                    [
                      'Amount',
                      `$${Number(sel.detail.amount || 0).toLocaleString()}`,
                    ],
                    ['Date', sel.detail.dateFmt || sel.detail.date || '—'],
                    ['Method', sel.detail.method || '—'],
                    ['Invoice Ref', sel.detail.invRef || '—'],
                    ['Notes', sel.detail.notes || '—'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ color: C.muted, fontFamily: F, fontSize: 12 }}
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          color: k === 'Amount' ? C.green : C.text,
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: 600,
                          maxWidth: '60%',
                          textAlign: 'right',
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))
                : sel.type === 'project'
                ? [
                    ['Project', sel.detail.name],
                    ['Client', sel.detail.client?.name || '—'],
                    ['Phase', sel.detail.phase || '—'],
                    ['Start', sel.detail.startDate || '—'],
                    ['Due', sel.detail.dueFmt || '—'],
                    ['Status', sel.detail.status || '—'],
                    [
                      'Type',
                      sel.detail.projType === 'business'
                        ? '🏢 Business'
                        : sel.detail.projType === 'customer'
                        ? '👤 Customer'
                        : '—',
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ color: C.muted, fontFamily: F, fontSize: 12 }}
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: 600,
                          maxWidth: '60%',
                          textAlign: 'right',
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))
                : [
                    ['Task', sel.detail.title],
                    ['Member', sel.detail.member],
                    ['Project', sel.detail.project],
                    ['Date', sel.detail.date],
                    ['Status', sel.detail.status || 'pending'],
                    ['Description', sel.detail.desc || '—'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ color: C.muted, fontFamily: F, fontSize: 12 }}
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: 600,
                          maxWidth: '60%',
                          textAlign: 'right',
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </Overlay>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 22,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Calendar
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Project deadlines, invoices & team tasks
          </div>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          style={{
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          + Add Task
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 9,
            padding: 4,
            gap: 3,
          }}
        >
          {[
            ['all', 'All'],
            ['invoices', 'Invoices'],
            ['team', 'Tasks'],
            ['projects', 'Projects'],
            ['payments', '💰 Payments'],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                background: filter === v ? C.accentDim : 'transparent',
                color: filter === v ? C.accent : C.muted,
                border:
                  filter === v
                    ? `1px solid ${C.accentMid}`
                    : '1px solid transparent',
                borderRadius: 6,
                padding: '7px 14px',
                fontFamily: F,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 9,
            padding: 4,
            gap: 3,
          }}
        >
          {[
            ['month', 'Month'],
            ['week', 'Week'],
            ['day', 'Day'],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? C.blueDim : 'transparent',
                color: view === v ? C.blue : C.muted,
                border:
                  view === v
                    ? `1px solid ${C.blue}44`
                    : '1px solid transparent',
                borderRadius: 6,
                padding: '7px 14px',
                fontFamily: F,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        {view !== 'day' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginLeft: 'auto',
            }}
          >
            <button
              onClick={
                view === 'week' ? () => setWeekOffset((o) => o - 1) : prevM
              }
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.text,
                width: 32,
                height: 32,
                borderRadius: 7,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ‹
            </button>
            <span
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 15,
                minWidth: 160,
                textAlign: 'center',
              }}
            >
              {view === 'week'
                ? `${weekDays[0].toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} – ${weekDays[6].toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}`
                : `${MONTHS[month]} ${year}`}
            </span>
            <button
              onClick={
                view === 'week' ? () => setWeekOffset((o) => o + 1) : nextM
              }
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.text,
                width: 32,
                height: 32,
                borderRadius: 7,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {view === 'month' && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {DAYS_SHORT.map((d) => (
              <div
                key={d}
                style={{
                  padding: '10px 0',
                  textAlign: 'center',
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}
          >
            {grid.map((day, i) => {
              const ds = day ? fmt(day) : null;
              const evs = ds ? eventsOn(ds) : [];
              const isToday = ds === todayStr;
              return (
                <div
                  key={i}
                  style={{
                    minHeight: 90,
                    padding: '8px 6px',
                    borderRight:
                      i % 7 !== 6 ? `1px solid ${C.border}22` : 'none',
                    borderBottom:
                      i < grid.length - 7 ? `1px solid ${C.border}22` : 'none',
                  }}
                >
                  {day && (
                    <>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: isToday ? C.accent : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isToday ? '#000' : C.muted,
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: isToday ? 700 : 400,
                          marginBottom: 4,
                        }}
                      >
                        {day}
                      </div>
                      {evs.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSel(ev)}
                          style={{
                            background: ev.color + '22',
                            border: `1px solid ${ev.color}44`,
                            borderRadius: 3,
                            padding: '2px 5px',
                            fontSize: 10,
                            fontFamily: F,
                            fontWeight: 600,
                            color: ev.color,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            marginBottom: 2,
                          }}
                        >
                          {ev.type === 'invoice'
                            ? 'INV'
                            : ev.type === 'project'
                            ? 'PRJ'
                            : ev.type === 'payment'
                            ? 'PAY'
                            : 'TSK'}{' '}
                          {ev.title}
                        </div>
                      ))}
                      {evs.length > 3 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: C.muted,
                            fontFamily: F,
                          }}
                        >
                          +{evs.length - 3}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {weekDays.map((d, i) => {
              const ds = fmtDate(d);
              const isToday = ds === todayStr;
              return (
                <div
                  key={i}
                  style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    borderRight: i < 6 ? `1px solid ${C.border}22` : 'none',
                  }}
                >
                  <div
                    style={{
                      color: C.muted,
                      fontFamily: F,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {DAYS_SHORT[d.getDay()]}
                  </div>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: isToday ? C.accent : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isToday ? '#000' : C.text,
                      fontFamily: F,
                      fontSize: 14,
                      fontWeight: 700,
                      margin: '4px auto 0',
                    }}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              minHeight: 280,
            }}
          >
            {weekDays.map((d, i) => {
              const evs = eventsOn(fmtDate(d));
              return (
                <div
                  key={i}
                  style={{
                    padding: '8px 6px',
                    borderRight: i < 6 ? `1px solid ${C.border}22` : 'none',
                    minHeight: 200,
                  }}
                >
                  {evs.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSel(ev)}
                      style={{
                        background: ev.color + '22',
                        border: `1px solid ${ev.color}44`,
                        borderRadius: 5,
                        padding: '5px 7px',
                        fontSize: 11,
                        fontFamily: F,
                        fontWeight: 600,
                        color: ev.color,
                        marginBottom: 5,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ev.type === 'invoice'
                          ? 'INV'
                          : ev.type === 'project'
                          ? 'PRJ'
                          : ev.type === 'payment'
                          ? 'PAY'
                          : 'TSK'}{' '}
                        {ev.title}
                      </div>
                      <div
                        style={{
                          color: ev.color + '99',
                          fontSize: 10,
                          marginTop: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ev.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'day' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <input
              type="date"
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              style={{ ...INP, width: 'auto', colorScheme: 'dark' }}
            />
            {dayDate && (
              <span
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {new Date(dayDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: '20px 24px',
            }}
          >
            {eventsOn(dayDate).length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 13,
                }}
              >
                No events on this day
              </div>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {eventsOn(dayDate).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSel(ev)}
                    style={{
                      background: ev.color + '15',
                      border: `1px solid ${ev.color}44`,
                      borderRadius: 10,
                      padding: '14px 18px',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: ev.color,
                        }}
                      />
                      <span
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {ev.title}
                      </span>
                      <span
                        style={{
                          color: C.muted,
                          fontFamily: F,
                          fontSize: 11,
                          marginLeft: 'auto',
                        }}
                      >
                        {ev.type === 'invoice'
                          ? 'Invoice'
                          : ev.type === 'project'
                          ? 'Project Milestone'
                          : ev.type === 'payment'
                          ? 'Payment Received'
                          : 'Team Task'}
                      </span>
                    </div>
                    <div
                      style={{
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 12,
                        marginTop: 5,
                        marginLeft: 20,
                      }}
                    >
                      {ev.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}
      >
        {[
          ['Invoice Due', C.accent],
          ['Overdue', C.red],
          ['Paid', C.green],
          ['Team Task', C.blue],
          ['Done Task', C.green],
          ['Project Start', C.green],
          ['Project Due', C.purple],
          ['Payment Received', '#10b981'],
        ].map(([l, c]) => (
          <div
            key={l}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: c,
              }}
            />
            <span style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
              {l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Project Detail ────────────────────────────────────────────────────────────
// ─── Module Order hook ────────────────────────────────────────────────────────
const DEFAULT_MODULE_ORDER = ['invoices', 'payments', 'plans', 'team'];

function useModuleOrder(projectId) {
  const key = `moduleorder:${projectId}`;
  const [order, setOrder] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get(key);
      if (!alive) return;
      setOrder(r ? JSON.parse(r.value) : DEFAULT_MODULE_ORDER);
    })();
    return () => {
      alive = false;
    };
  }, [key]);
  const save = async (next) => {
    setOrder(next);
    await storage.set(key, JSON.stringify(next));
  };
  return {
    order: order || DEFAULT_MODULE_ORDER,
    ready: order !== null,
    setOrder: save,
  };
}

// ─── Draggable Module Card ─────────────────────────────────────────────────────
function DraggableModCard({
  id,
  icon,
  title,
  sub,
  color,
  dim,
  children,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => {
        setDragging(true);
        onDragStart(id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => {
        setDragging(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(id);
      }}
      style={{
        background: C.card,
        border: `2px solid ${
          isDragOver ? C.accent : open ? color + '66' : C.border
        }`,
        borderRadius: 14,
        /* NO overflow:hidden — content must never be clipped */
        transition:
          'border-color .2s, box-shadow .2s, opacity .2s, transform .2s',
        opacity: dragging ? 0.45 : 1,
        transform: dragging ? 'scale(0.98)' : 'scale(1)',
        boxShadow: isDragOver ? `0 0 0 3px ${C.accent}33` : 'none',
        cursor: 'default',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header row — click to expand */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '20px 24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: open ? color + '0d' : 'transparent',
          userSelect: 'none',
          borderRadius: open ? '14px 14px 0 0' : 14,
        }}
      >
        {/* drag handle */}
        <div
          draggable={false}
          title="Drag to reorder"
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            cursor: 'grab',
            flexShrink: 0,
            padding: '4px 2px',
            opacity: 0.4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '.4')}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 2,
                background: C.muted,
                borderRadius: 1,
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 13,
            background: dim,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        </div>
        <span
          style={{
            color: open ? color : C.muted,
            fontSize: 20,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform .25s',
            flexShrink: 0,
          }}
        >
          ›
        </span>
      </div>

      {/* Content — fully visible, no height cap, no overflow clip */}
      {open && (
        <div
          style={{
            padding: '18px 24px 24px',
            borderTop: `1px solid ${C.border}33`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Photo Comments ───────────────────────────────────────────────────────────
function usePhotoComments(projectId) {
  const key = `photocomments:${projectId}`;
  const [map, setMap] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get(key);
      if (alive) setMap(r ? JSON.parse(r.value) : {});
    })();
    return () => {
      alive = false;
    };
  }, [key]);
  const save = async (next) => {
    setMap(next);
    await storage.set(key, JSON.stringify(next));
  };
  const addComment = (photoId, text, author) => {
    const c = {
      id: `c${Date.now()}`,
      text: text.trim(),
      author: author || 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
    const next = {
      ...(map || {}),
      [photoId]: [...((map || {})[photoId] || []), c],
    };
    save(next);
  };
  const editComment = (photoId, commentId, text) => {
    const next = {
      ...(map || {}),
      [photoId]: ((map || {})[photoId] || []).map((c) =>
        c.id === commentId ? { ...c, text: text.trim(), edited: true } : c
      ),
    };
    save(next);
  };
  const deleteComment = (photoId, commentId) => {
    const next = {
      ...(map || {}),
      [photoId]: ((map || {})[photoId] || []).filter((c) => c.id !== commentId),
    };
    save(next);
  };
  const getComments = (photoId) => (map || {})[photoId] || [];
  return {
    ready: map !== null,
    addComment,
    editComment,
    deleteComment,
    getComments,
  };
}

// Photo lightbox + comment panel
function PhotoCommentModal({
  photo,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onClose,
}) {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const textRef = useRef();

  const submit = () => {
    if (!text.trim()) return;
    onAddComment(photo.id, text);
    setText('');
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.text);
  };
  const saveEdit = () => {
    if (!editText.trim()) return;
    onEditComment(photo.id, editingId, editText);
    setEditingId(null);
    setEditText('');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,7,15,.88)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          gap: 0,
          width: 'min(960px,100%)',
          maxHeight: '92vh',
          borderRadius: 16,
          overflow: 'hidden',
          background: C.card,
          border: `1px solid ${C.border}`,
          boxShadow: '0 32px 80px rgba(0,0,0,.7)',
        }}
      >
        {/* Left: photo */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: 300,
          }}
        >
          <img
            src={photo.dataUrl}
            alt={photo.name}
            style={{
              maxWidth: '100%',
              maxHeight: '92vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0,0,0,.6)',
              border: 'none',
              color: '#fff',
              width: 32,
              height: 32,
              borderRadius: '50%',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent,rgba(0,0,0,.7))',
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                color: '#fff',
                fontFamily: F,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {photo.name.replace(/\.[^.]+$/, '')}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,.55)',
                fontFamily: F,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Uploaded {photo.uploadedAt}
            </div>
          </div>
        </div>

        {/* Right: comments panel */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: C.card,
            borderLeft: `1px solid ${C.border}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: `1px solid ${C.border}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              💬 Comments
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Comment list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {comments.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px 10px',
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                No comments yet — add the first one below
              </div>
            )}
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  padding: '10px 12px',
                }}
              >
                {editingId === c.id ? (
                  <div>
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          saveEdit();
                        }
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      rows={3}
                      style={{
                        ...INP,
                        resize: 'none',
                        fontSize: 12,
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={saveEdit}
                        style={{
                          flex: 1,
                          background: C.green,
                          color: '#fff',
                          border: 'none',
                          padding: '6px 0',
                          borderRadius: 5,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          background: 'transparent',
                          color: C.muted,
                          border: `1px solid ${C.border}`,
                          padding: '6px 10px',
                          borderRadius: 5,
                          fontFamily: F,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontSize: 12,
                        lineHeight: 1.55,
                        marginBottom: 7,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {c.text}
                      {c.edited && (
                        <span
                          style={{
                            color: C.muted,
                            fontSize: 10,
                            marginLeft: 5,
                          }}
                        >
                          (edited)
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: C.accent,
                            fontFamily: F,
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {c.author}
                        </div>
                        <div
                          style={{
                            color: C.muted,
                            fontFamily: F,
                            fontSize: 10,
                            marginTop: 1,
                          }}
                        >
                          {c.time}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => startEdit(c)}
                          style={{
                            background: 'transparent',
                            color: C.muted,
                            border: 'none',
                            padding: '3px 6px',
                            borderRadius: 4,
                            fontFamily: F,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteComment(photo.id, c.id)}
                          style={{
                            background: 'transparent',
                            color: C.red,
                            border: 'none',
                            padding: '3px 6px',
                            borderRadius: 4,
                            fontFamily: F,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div
            style={{
              padding: '12px 14px',
              borderTop: `1px solid ${C.border}`,
              flexShrink: 0,
            }}
          >
            <textarea
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Write a comment… (Enter to send)"
              rows={3}
              style={{
                ...INP,
                resize: 'none',
                fontSize: 12,
                lineHeight: 1.5,
                marginBottom: 8,
              }}
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              style={{
                width: '100%',
                background: text.trim() ? C.accent : C.border,
                color: text.trim() ? '#000' : C.muted,
                border: 'none',
                padding: '9px 0',
                borderRadius: 7,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 12,
                cursor: text.trim() ? 'pointer' : 'default',
                transition: 'all .15s',
              }}
            >
              💬 Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Single photo card with thumbnail + comment preview
function PhotoCard({ photo, comments, onOpen, onDelete }) {
  const topComment = comments[comments.length - 1];
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color .18s,box-shadow .18s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.accent + '66';
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,.18)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail */}
      <div
        onClick={() => onOpen(photo)}
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          cursor: 'pointer',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <img
          src={photo.dataUrl}
          alt={photo.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform .25s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = 'scale(1.04)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* overlay buttons */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            display: 'flex',
            gap: 5,
            opacity: 0,
            transition: 'opacity .18s',
          }}
          className="photo-actions"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(photo);
            }}
            style={{
              background: 'rgba(0,0,0,.65)',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              width: 28,
              height: 28,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="View & comment"
          >
            💬
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo.id);
            }}
            style={{
              background: 'rgba(200,50,50,.8)',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              width: 28,
              height: 28,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Delete"
          >
            🗑
          </button>
        </div>
        {/* comment count badge */}
        {comments.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              right: 7,
              background: 'rgba(0,0,0,.7)',
              color: '#fff',
              borderRadius: 99,
              padding: '2px 7px',
              fontFamily: F,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            💬 {comments.length}
          </div>
        )}
      </div>

      {/* Caption + latest comment */}
      <div
        style={{ padding: '10px 12px', flex: 1 }}
        onClick={() => onOpen(photo)}
      >
        <div
          style={{
            color: C.text,
            fontFamily: F,
            fontWeight: 600,
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: topComment ? 6 : 0,
            cursor: 'pointer',
          }}
          title={photo.name.replace(/\.[^.]+$/, '')}
        >
          {photo.name.replace(/\.[^.]+$/, '')}
        </div>
        {topComment && (
          <div
            style={{
              background: C.card,
              borderRadius: 6,
              padding: '6px 8px',
              borderLeft: `3px solid ${C.accent}`,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 10,
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {topComment.text}
            </div>
            <div
              style={{
                color: C.accent,
                fontFamily: F,
                fontSize: 9,
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              {topComment.author} · {topComment.time}
            </div>
          </div>
        )}
        {!topComment && (
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 10,
              fontStyle: 'italic',
              cursor: 'pointer',
            }}
          >
            Click to add a comment
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Project Detail Page ───────────────────────────────────────────────────────
function ProjectPage({
  project,
  onBack,
  onOpenTeam,
  extraLog = [],
  payments = [],
  addPayment,
  updatePayment,
  removePayment,
  allProjects = [],
  allInvoices = [],
  addInvoice,
  onUpdateProject,
  onLog,
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [confirmProjectPatch, setConfirmProjectPatch] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(() => PROJ_NOTES_SEED[project.id] || []);
  const [log, setLog] = useState(() => PROJ_LOGS_SEED[project.id] || []);
  const photoRef = useRef();
  const dragOver = useRef(null);
  const dragItem = useRef(null);

  const {
    files: photos,
    add: addPhoto,
    remove: removePhoto,
  } = useFiles(`photos:${project.id}`);
  const {
    ready: commentsReady,
    addComment,
    editComment,
    deleteComment,
    getComments,
  } = usePhotoComments(project.id);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const { order: moduleOrder, setOrder: setModuleOrder } = useModuleOrder(
    project.id
  );
  const [dragOverId, setDragOverId] = useState(null);

  const pushLog = (action, icon, proj) => {
    const entry = {
      id: Date.now(),
      action,
      detail: proj || project.name,
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon,
    };
    setLog((prev) => [entry, ...prev]);
    if (onLog) onLog(entry);
  };
  const mergedLog = useMemo(
    () =>
      [...extraLog.filter((e) => !log.find((l) => l.id === e.id)), ...log].sort(
        (a, b) => (b.id || 0) - (a.id || 0)
      ),
    [extraLog, log]
  );
  const saveNote = () => {
    if (!noteText.trim()) return;
    const n = {
      id: Date.now(),
      text: noteText.trim(),
      author: 'Jordan Blake',
      time: new Date().toLocaleDateString(),
    };
    setNotes((p) => [n, ...p]);
    pushLog('Note added', '📝');
    setNoteText('');
  };
  const uploadPhotos = (files) =>
    Array.from(files).forEach((f) => {
      const rd = new FileReader();
      rd.onload = async (e) => {
        await addPhoto({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: f.name,
          size: f.size,
          dataUrl: e.target.result,
          uploadedAt: new Date().toLocaleDateString(),
        });
        pushLog('Photo uploaded', '📷');
      };
      rd.readAsDataURL(f);
    });
  const projectPayments = useMemo(
    () =>
      payments.filter(
        (p) => p.projId === project.id || p.project === project.name
      ),
    [payments, project]
  );
  const handleAddPayment = async (p) => {
    addPayment && addPayment(p);
    pushLog(`Payment $${p.amount.toLocaleString()} recorded`, 'PAY');
  };

  // Drag handlers
  const handleDragStart = (id) => {
    dragItem.current = id;
  };
  const handleDragOver = (id) => {
    if (id !== dragItem.current) {
      setDragOverId(id);
      dragOver.current = id;
    }
  };
  const handleDrop = (id) => {
    if (!dragItem.current || dragItem.current === id) return;
    const next = [...moduleOrder];
    const from = next.indexOf(dragItem.current);
    const to = next.indexOf(id);
    if (from < 0 || to < 0) return;
    next.splice(from, 1);
    next.splice(to, 0, dragItem.current);
    setModuleOrder(next);
    dragItem.current = null;
    dragOver.current = null;
    setDragOverId(null);
  };

  // Live counts for module subtitles
  const { files: invFiles } = useFiles(`inv:${project.id}`);
  const { files: planFiles } = useFiles(`plans:${project.id}`);
  const { members: teamMembers } = useTeam(project.id);
  const staticInvCount = (PROJ_INV[project.id] || []).length;
  const invCount = staticInvCount + invFiles.length;
  const payCount = projectPayments.length;
  const planCount = planFiles.length;
  const teamCount = (teamMembers || []).length;

  // Module definitions — rendered in persisted order
  const MODULE_DEFS = {
    invoices: {
      icon: '🧾',
      title: 'Invoices',
      color: C.accent,
      dim: C.accentDim,
      sub: `${invCount} invoice${invCount !== 1 ? 's' : ''}`,
      content: (
        <InvoicesPanel
          project={project}
          onActivity={pushLog}
          onAddGlobalInvoice={addInvoice}
          allInvoices={allInvoices}
        />
      ),
    },
    payments: {
      icon: '💰',
      title: 'Payments',
      color: C.green,
      dim: C.greenDim,
      sub: `${payCount} payment${payCount !== 1 ? 's' : ''}`,
      content: (
        <PaymentsPanel
          project={project}
          payments={projectPayments}
          addPayment={handleAddPayment}
          updatePayment={updatePayment}
          removePayment={removePayment}
          allProjects={allProjects}
          allInvoices={allInvoices}
          onActivity={pushLog}
        />
      ),
    },
    plans: {
      icon: '📐',
      title: 'Plans',
      color: C.blue,
      dim: C.blueDim,
      sub: `${planCount} document${planCount !== 1 ? 's' : ''}`,
      content: <PlansPanel project={project} onActivity={pushLog} />,
    },
    team: {
      icon: '👷',
      title: 'Team',
      color: C.green,
      dim: C.greenDim,
      sub: `${teamCount} member${teamCount !== 1 ? 's' : ''}`,
      content: <TeamPanel project={project} onOpenTeamPage={onOpenTeam} />,
    },
  };

  return (
    <div>
      {contactOpen && (
        <ContactModal
          client={project.client}
          onClose={() => setContactOpen(false)}
        />
      )}
      {editingProject && (
        <EditProjectModal
          project={project}
          onConfirm={(patch) => {
            setEditingProject(false);
            setConfirmProjectPatch(patch);
          }}
          onCancel={() => setEditingProject(false)}
        />
      )}
      {confirmProjectPatch && (
        <ConfirmDialog
          title="Save Project Changes?"
          message="Are you sure you want to apply these changes to this project?"
          confirmLabel="Yes, Save Changes"
          variant="edit"
          onConfirm={() => {
            onUpdateProject && onUpdateProject(project.id, confirmProjectPatch);
            setConfirmProjectPatch(null);
          }}
          onCancel={() => setConfirmProjectPatch(null)}
        />
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: `1px solid ${C.border}`,
          color: C.muted,
          padding: '7px 16px',
          borderRadius: 7,
          fontFamily: F,
          fontSize: 13,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = C.text;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = C.muted;
        }}
      >
        ← Back to Projects
      </button>

      {/* Top outer row: main content + narrow activity log */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* ── Left: header + modules + photos + notes ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Header card */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: '26px 30px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 28,
                      background: C.accent,
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                  <h1
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontSize: 22,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {project.name}
                  </h1>
                  <Badge status={project.status} />
                  {project.projType && (
                    <span
                      style={{
                        background:
                          project.projType === 'business'
                            ? C.purpleDim
                            : C.blueDim,
                        color:
                          project.projType === 'business' ? C.purple : C.blue,
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: F,
                      }}
                    >
                      {project.projType === 'business'
                        ? '🏢 Business'
                        : '👤 Customer'}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 13,
                    marginLeft: 14,
                  }}
                >
                  📍 {project.address}
                </div>
                {project.desc && (
                  <div
                    style={{
                      color: C.muted,
                      fontFamily: F,
                      fontSize: 12,
                      marginLeft: 14,
                      marginTop: 6,
                      fontStyle: 'italic',
                      lineHeight: 1.55,
                    }}
                  >
                    {project.desc}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  flexShrink: 0,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      color: C.muted,
                      fontFamily: F,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    CONTRACT VALUE
                  </div>
                  <div
                    style={{
                      color: C.accent,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 20,
                    }}
                  >
                    ${project.value.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setContactOpen(true)}
                  style={{
                    background: C.accent,
                    color: '#000',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: 9,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  👤 Contact
                </button>
                <button
                  onClick={() => setEditingProject(true)}
                  style={{
                    background: C.surface,
                    color: C.text,
                    border: `1px solid ${C.border}`,
                    padding: '11px 18px',
                    borderRadius: 9,
                    fontFamily: F,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
            {project.status !== 'quoting' && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 18,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                {(() => {
                  const pct = calcProgress(project);
                  const days = daysRemaining(project);
                  const overdue =
                    days !== null && days < 0 && project.status !== 'completed';
                  return (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}
                        >
                          {[
                            ['Phase', project.phase],
                            [
                              'Started',
                              project.startDate || project.startDateFmt || '—',
                            ],
                            ['Due', project.dueFmt],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <div
                                style={{
                                  color: C.muted,
                                  fontFamily: F,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {k}
                              </div>
                              <div
                                style={{
                                  color: C.text,
                                  fontFamily: F,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  marginTop: 2,
                                }}
                              >
                                {v}
                              </div>
                            </div>
                          ))}
                          {days !== null && (
                            <div>
                              <div
                                style={{
                                  color: C.muted,
                                  fontFamily: F,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              >
                                Remaining
                              </div>
                              <div
                                style={{
                                  color: overdue
                                    ? C.red
                                    : days <= 7
                                    ? C.accent
                                    : C.green,
                                  fontFamily: F,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  marginTop: 2,
                                }}
                              >
                                {project.status === 'completed'
                                  ? 'Done'
                                  : overdue
                                  ? `${Math.abs(days)}d overdue`
                                  : `${days}d left`}
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              color: C.muted,
                              fontFamily: F,
                              fontSize: 12,
                            }}
                          >
                            Timeline Progress
                          </span>
                          <span
                            style={{
                              color:
                                project.status === 'completed'
                                  ? C.green
                                  : overdue
                                  ? C.red
                                  : C.accent,
                              fontFamily: F,
                              fontWeight: 700,
                              fontSize: 18,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <Bar
                        pct={pct}
                        color={
                          project.status === 'completed'
                            ? C.green
                            : overdue
                            ? C.red
                            : C.accent
                        }
                      />
                    </>
                  );
                })()}
              </div>
            )}
            {project.contacts && project.contacts.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 18,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    marginBottom: 12,
                  }}
                >
                  Project Contacts
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {project.contacts.map((ct, i) => (
                    <div
                      key={ct.id || i}
                      style={{
                        background: C.surface,
                        border: `1px solid ${
                          i === 0 ? C.green + '44' : C.border
                        }`,
                        borderRadius: 9,
                        padding: '12px 16px',
                        minWidth: 200,
                        flex: '1 1 180px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: i === 0 ? C.green + '22' : C.accentDim,
                            border: `2px solid ${
                              i === 0 ? C.green + '44' : C.accentMid
                            }`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: i === 0 ? C.green : C.accent,
                            fontFamily: F,
                            fontWeight: 700,
                            fontSize: 10,
                            flexShrink: 0,
                          }}
                        >
                          {ct.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase() || '?'}
                        </div>
                        <div>
                          <div
                            style={{
                              color: C.text,
                              fontFamily: F,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {ct.name}
                          </div>
                          {ct.company && (
                            <div
                              style={{
                                color: C.muted,
                                fontFamily: F,
                                fontSize: 11,
                              }}
                            >
                              {ct.company}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            marginLeft: 'auto',
                            background: i === 0 ? C.greenDim : C.accentDim,
                            color: i === 0 ? C.green : C.accent,
                            padding: '2px 7px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: F,
                          }}
                        >
                          {ct.role}
                        </span>
                      </div>
                      <div
                        style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
                      >
                        {ct.phone && (
                          <a
                            href={`tel:${ct.phone}`}
                            style={{
                              color: C.muted,
                              fontFamily: F,
                              fontSize: 11,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            📞 {ct.phone}
                          </a>
                        )}
                        {ct.email && (
                          <a
                            href={`mailto:${ct.email}`}
                            style={{
                              color: C.muted,
                              fontFamily: F,
                              fontSize: 11,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            ✉️ {ct.email}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Draggable module cards */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Project Modules
              </span>
              <span
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 10,
                  opacity: 0.6,
                }}
              >
                — drag to reorder
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {moduleOrder
                .filter((id) => MODULE_DEFS[id])
                .map((id) => {
                  const m = MODULE_DEFS[id];
                  return (
                    <DraggableModCard
                      key={id}
                      id={id}
                      icon={m.icon}
                      title={m.title}
                      sub={m.sub}
                      color={m.color}
                      dim={m.dim}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragOver={dragOverId === id}
                    >
                      {m.content}
                    </DraggableModCard>
                  );
                })}
            </div>
          </div>

          {/* Photos */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '20px 22px',
            }}
          >
            {/* Lightbox */}
            {lightboxPhoto && (
              <PhotoCommentModal
                photo={lightboxPhoto}
                comments={getComments(lightboxPhoto.id)}
                onAddComment={addComment}
                onEditComment={editComment}
                onDeleteComment={deleteComment}
                onClose={() => setLightboxPhoto(null)}
              />
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  📷 Photos
                </span>
                <span
                  style={{
                    background: C.surface,
                    color: C.muted,
                    border: `1px solid ${C.border}`,
                    borderRadius: 99,
                    padding: '2px 9px',
                    fontSize: 10,
                    fontFamily: F,
                    fontWeight: 700,
                  }}
                >
                  {photos.length}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.muted, fontFamily: F, fontSize: 10 }}>
                  Click a photo to comment
                </span>
                <button
                  onClick={() => photoRef.current.click()}
                  style={{
                    background: C.accentDim,
                    color: C.accent,
                    border: `1px solid ${C.accentMid}`,
                    padding: '7px 14px',
                    borderRadius: 6,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  📷 Upload
                </button>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => uploadPhotos(e.target.files)}
                />
              </div>
            </div>
            {/* CSS for photo action buttons hover */}
            <style>
              {'.photo-card:hover .photo-actions { opacity: 1 !important; }'}
            </style>
            {photos.length === 0 ? (
              <div
                onClick={() => photoRef.current.click()}
                style={{
                  border: `2px dashed ${C.border}`,
                  borderRadius: 10,
                  padding: '44px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 13,
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent + '88';
                  e.currentTarget.style.color = C.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = C.muted;
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>No
                photos yet — click to upload
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: 14,
                }}
              >
                {photos.map((p) => (
                  <div key={p.id} className="photo-card">
                    <PhotoCard
                      photo={p}
                      comments={getComments(p.id)}
                      onOpen={setLightboxPhoto}
                      onDelete={(id) => {
                        removePhoto(id);
                        if (lightboxPhoto?.id === id) setLightboxPhoto(null);
                      }}
                    />
                  </div>
                ))}
                {/* Upload tile */}
                <div
                  onClick={() => photoRef.current.click()}
                  style={{
                    borderRadius: 10,
                    border: `2px dashed ${C.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: 6,
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 12,
                    padding: '20px 0',
                    minHeight: 160,
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.accent + '88';
                    e.currentTarget.style.color = C.accent;
                    e.currentTarget.style.background = C.accentDim;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.color = C.muted;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
                  <span>Add Photo</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: activity log + notes ── */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'sticky',
            top: 16,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
          }}
        >
          {/* Notes panel */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                📝 Notes
              </span>
              <span
                style={{
                  background: C.accentDim,
                  color: C.accent,
                  padding: '1px 6px',
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {notes.length}
              </span>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveNote();
              }}
              placeholder="Write a note…"
              rows={3}
              style={{
                resize: 'none',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 7,
                padding: '8px 10px',
                fontSize: 12,
                color: C.text,
                fontFamily: F,
                lineHeight: 1.5,
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={saveNote}
              style={{
                background: C.accent,
                color: '#000',
                border: 'none',
                padding: '7px 0',
                borderRadius: 6,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              {notes.length === 0 && (
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 11,
                    textAlign: 'center',
                    padding: '8px 0',
                  }}
                >
                  No notes yet
                </div>
              )}
              {notes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: C.surface,
                    borderRadius: 7,
                    padding: '8px 10px',
                    borderLeft: `3px solid ${C.accent}`,
                  }}
                >
                  <div
                    style={{
                      color: C.text,
                      fontSize: 11,
                      fontFamily: F,
                      lineHeight: 1.5,
                      marginBottom: 3,
                    }}
                  >
                    {n.text}
                  </div>
                  <div style={{ color: C.muted, fontSize: 10, fontFamily: F }}>
                    {n.author} · {n.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '13px 14px 10px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                Activity
              </span>
              <span
                style={{
                  background: C.accentDim,
                  color: C.accent,
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 7px',
                }}
              >
                {mergedLog.length}
              </span>
            </div>
            <div>
              {mergedLog.map((e, i) => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    gap: 8,
                    padding: '10px 12px',
                    borderBottom:
                      i < mergedLog.length - 1
                        ? `1px solid ${C.border}22`
                        : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      background: C.surface,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {e.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontWeight: 600,
                        fontSize: 11,
                        lineHeight: 1.3,
                      }}
                    >
                      {e.action}
                    </div>
                    <div
                      style={{
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 10,
                        marginTop: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.detail}
                    </div>
                    <div
                      style={{
                        color: '#5a6480',
                        fontSize: 9,
                        fontFamily: F,
                        marginTop: 3,
                      }}
                    >
                      {e.user} · {e.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Project Modal ────────────────────────────────────────────────────────
function EditProjectModal({ project, onConfirm, onCancel }) {
  const [name, setName] = useState(project.name || '');
  const [address, setAddress] = useState(project.address || '');
  const [desc, setDesc] = useState(project.desc || '');
  const [startISO, setStartISO] = useState(project.startDateISO || '');
  const [endISO, setEndISO] = useState(project.due || '');
  const [projType, setProjType] = useState(project.projType || 'business');
  const [value, setValue] = useState(String(project.value || ''));
  const [phase, setPhase] = useState(project.phase || '');
  const [status, setStatus] = useState(project.status || 'active');
  const [contacts, setContacts] = useState(
    project.contacts?.length ? project.contacts : [emptyContact()]
  );
  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');

  const updateContact = (id, field, val) =>
    setContacts((cs) =>
      cs.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  const addContact = () => setContacts((cs) => [...cs, emptyContact()]);
  const removeContact = (id) =>
    setContacts((cs) => cs.filter((c) => c.id !== id));
  const fmtD = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const goNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setErr('Project name is required');
        return;
      }
      if (!address.trim()) {
        setErr('Project address is required');
        return;
      }
      setErr('');
      setStep(2);
    } else if (step === 2) {
      setErr('');
      setStep(3);
    }
  };

  const handleSave = () => {
    const validContacts = contacts.filter((c) => c.name.trim());
    const primaryClient = validContacts[0] ||
      project.client || {
        name: 'Unassigned',
        company: '',
        phone: '',
        email: '',
        initials: '?',
      };
    const initials =
      primaryClient.name
        .trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || '?';
    onConfirm({
      name: name.trim(),
      address: address.trim(),
      desc: desc.trim(),
      startDateISO: startISO,
      due: endISO,
      startDate: fmtD(startISO),
      dueFmt: fmtD(endISO),
      projType,
      status,
      phase: phase || project.phase || 'Active',
      value: parseFloat(value) || project.value || 0,
      location: address.trim().split(',')[0] || '',
      client: {
        name: primaryClient.name,
        company: primaryClient.company || '',
        phone: primaryClient.phone || '',
        email: primaryClient.email || '',
        initials,
      },
      contacts: validContacts,
    });
  };

  const PROJ_STATUSES = [
    { v: 'active', l: 'Active', c: C.green },
    { v: 'quoting', l: 'Quoting', c: C.blue },
    { v: 'on-hold', l: 'On Hold', c: C.accent },
    { v: 'completed', l: 'Completed', c: C.purple },
  ];
  const PHASES = [
    'Quoting',
    'Planning',
    'Foundation',
    'Framing',
    'Electrical',
    'Plumbing',
    'Finishing',
    'Completed',
  ];
  const STEPS = [
    ['1', 'Project Info'],
    ['2', 'Timeline & Type'],
    ['3', 'Contacts'],
  ];

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          width: 600,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 0', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                ✏️ Edit Project
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Update information for{' '}
                <strong style={{ color: C.accent }}>{project.name}</strong>
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                fontSize: 20,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
            {STEPS.map(([n, l], i) => {
              const active = step === i + 1;
              const done = step > i + 1;
              return (
                <div
                  key={n}
                  style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: done
                          ? C.green
                          : active
                          ? C.accent
                          : C.border,
                        color: done || active ? '#000' : C.muted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                        transition: 'all .2s',
                      }}
                    >
                      {done ? '✓' : n}
                    </div>
                    <span
                      style={{
                        color: active ? C.text : done ? C.green : C.muted,
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        transition: 'color .2s',
                      }}
                    >
                      {l}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 24,
                        height: 2,
                        background: done ? C.green : C.border,
                        borderRadius: 1,
                        margin: '0 8px',
                        flexShrink: 0,
                        transition: 'background .2s',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
          {err && (
            <div
              style={{
                background: C.redDim,
                border: `1px solid ${C.red}44`,
                borderRadius: 8,
                padding: '9px 14px',
                color: C.red,
                fontFamily: F,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              {err}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 15,
                paddingBottom: 4,
              }}
            >
              <div>
                <label style={LBL}>Project Name *</label>
                <input
                  style={INP}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErr('');
                  }}
                />
              </div>
              <div>
                <label style={LBL}>Project Address *</label>
                <input
                  style={INP}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErr('');
                  }}
                />
              </div>
              <div>
                <label style={LBL}>
                  Description{' '}
                  <span style={{ color: C.muted, fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  style={{ ...INP, resize: 'none', lineHeight: 1.55 }}
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={LBL}>Contract Value</label>
                  <input
                    style={INP}
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={LBL}>Current Phase</label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    style={{ ...INP, cursor: 'pointer' }}
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={LBL}>Project Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PROJ_STATUSES.map((s) => (
                    <button
                      key={s.v}
                      onClick={() => setStatus(s.v)}
                      style={{
                        flex: 1,
                        minWidth: 90,
                        padding: '9px 0',
                        borderRadius: 7,
                        cursor: 'pointer',
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: 700,
                        border:
                          status === s.v
                            ? `2px solid ${s.c}`
                            : `1px solid ${C.border}`,
                        background: status === s.v ? s.c + '22' : 'transparent',
                        color: status === s.v ? s.c : C.muted,
                        transition: 'all .15s',
                      }}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                paddingBottom: 4,
              }}
            >
              <div>
                <label style={{ ...LBL, marginBottom: 12 }}>
                  Project Timeline
                </label>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Starting Date</label>
                    <input
                      type="date"
                      value={startISO}
                      onChange={(e) => setStartISO(e.target.value)}
                      style={{ ...INP, colorScheme: 'dark' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Expected Finish Date</label>
                    <input
                      type="date"
                      value={endISO}
                      onChange={(e) => setEndISO(e.target.value)}
                      style={{ ...INP, colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                {startISO &&
                  endISO &&
                  (() => {
                    const diff = Math.round(
                      (new Date(endISO) - new Date(startISO)) /
                        (1000 * 60 * 60 * 24)
                    );
                    const weeks = Math.round(diff / 7);
                    return (
                      diff > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            background: C.green + '0d',
                            border: `1px solid ${C.green}33`,
                            borderRadius: 7,
                            padding: '8px 12px',
                            color: C.green,
                            fontFamily: F,
                            fontSize: 12,
                          }}
                        >
                          Duration: <strong>{diff} days</strong> ({weeks} weeks)
                        </div>
                      )
                    );
                  })()}
                {startISO &&
                  endISO &&
                  new Date(endISO) <= new Date(startISO) && (
                    <div
                      style={{
                        marginTop: 10,
                        background: C.redDim,
                        border: `1px solid ${C.red}44`,
                        borderRadius: 7,
                        padding: '8px 12px',
                        color: C.red,
                        fontFamily: F,
                        fontSize: 12,
                      }}
                    >
                      ⚠️ End date must be after start date
                    </div>
                  )}
              </div>
              <div>
                <label style={{ ...LBL, marginBottom: 12 }}>Project Type</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    [
                      'business',
                      '🏢',
                      'Business',
                      'For a company or organization',
                    ],
                    ['customer', '👤', 'Customer', 'For an individual client'],
                  ].map(([v, ic, l, sub]) => (
                    <div
                      key={v}
                      onClick={() => setProjType(v)}
                      style={{
                        flex: 1,
                        border: `2px solid ${
                          projType === v
                            ? v === 'business'
                              ? C.purple
                              : C.blue
                            : C.border
                        }`,
                        borderRadius: 12,
                        padding: '16px 18px',
                        cursor: 'pointer',
                        background:
                          projType === v
                            ? v === 'business'
                              ? C.purpleDim
                              : C.blueDim
                            : 'transparent',
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{ic}</div>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          color: C.muted,
                          fontFamily: F,
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        {sub}
                      </div>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${
                            projType === v
                              ? v === 'business'
                                ? C.purple
                                : C.blue
                              : C.border
                          }`,
                          background:
                            projType === v
                              ? v === 'business'
                                ? C.purple
                                : C.blue
                              : 'transparent',
                          marginTop: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          color: '#000',
                          fontWeight: 700,
                        }}
                      >
                        {projType === v && '✓'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Contacts */}
          {step === 3 && (
            <div style={{ paddingBottom: 4 }}>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                Update the contacts for this project. The first contact is the
                primary client.
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {contacts.map((c, ci) => (
                  <div
                    key={c.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${
                        ci === 0 ? C.green + '44' : C.border
                      }`,
                      borderRadius: 12,
                      padding: '16px 18px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 13,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: C.accentDim,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: C.accent,
                            fontFamily: F,
                            fontWeight: 700,
                            fontSize: 10,
                          }}
                        >
                          {ci + 1}
                        </div>
                        <span
                          style={{
                            color: C.text,
                            fontFamily: F,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {ci === 0 ? 'Primary Contact' : 'Contact ' + (ci + 1)}
                        </span>
                        {ci === 0 && (
                          <span
                            style={{
                              background: C.greenDim,
                              color: C.green,
                              fontSize: 10,
                              fontWeight: 700,
                              fontFamily: F,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            Primary
                          </span>
                        )}
                      </div>
                      {ci > 0 && (
                        <button
                          onClick={() => removeContact(c.id)}
                          style={{
                            background: C.redDim,
                            color: C.red,
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            cursor: 'pointer',
                            fontFamily: F,
                            fontWeight: 700,
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 11,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>Full Name</label>
                          <input
                            style={INP}
                            value={c.name}
                            onChange={(e) =>
                              updateContact(c.id, 'name', e.target.value)
                            }
                            placeholder="Contact name"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>Role</label>
                          <select
                            value={c.role}
                            onChange={(e) =>
                              updateContact(c.id, 'role', e.target.value)
                            }
                            style={{ ...INP, cursor: 'pointer' }}
                          >
                            {CONTACT_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={LBL}>Company / Organisation</label>
                        <input
                          style={INP}
                          value={c.company}
                          onChange={(e) =>
                            updateContact(c.id, 'company', e.target.value)
                          }
                          placeholder="Company name (optional)"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>Phone</label>
                          <input
                            style={INP}
                            value={c.phone}
                            onChange={(e) =>
                              updateContact(c.id, 'phone', e.target.value)
                            }
                            placeholder="+971 50 000 0000"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>Email</label>
                          <input
                            style={INP}
                            value={c.email}
                            onChange={(e) =>
                              updateContact(c.id, 'email', e.target.value)
                            }
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addContact}
                  style={{
                    background: 'transparent',
                    color: C.accent,
                    border: `1px dashed ${C.accent}66`,
                    borderRadius: 8,
                    padding: '10px 0',
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  + Add Another Contact
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div
          style={{
            padding: '18px 28px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {step > 1 ? (
            <button
              onClick={() => {
                setErr('');
                setStep((s) => s - 1);
              }}
              style={{
                background: 'transparent',
                color: C.muted,
                border: `1px solid ${C.border}`,
                padding: '11px 20px',
                borderRadius: 8,
                fontFamily: F,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                color: C.muted,
                border: `1px solid ${C.border}`,
                padding: '11px 20px',
                borderRadius: 8,
                fontFamily: F,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={goNext}
              style={{
                background: C.accent,
                color: '#000',
                border: 'none',
                padding: '11px 32px',
                borderRadius: 8,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              style={{
                background: C.green,
                color: '#fff',
                border: 'none',
                padding: '11px 32px',
                borderRadius: 8,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ✓ Save Changes
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}

// ─── New Project Modal ─────────────────────────────────────────────────────────
const CONTACT_ROLES = [
  'Client',
  'Site Manager',
  'Project Manager',
  'Architect',
  'Structural Engineer',
  'Supplier',
  'Subcontractor',
  'Investor',
  'Legal Advisor',
  'Other',
];

const emptyContact = () => ({
  id: `c${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: '',
  company: '',
  phone: '',
  email: '',
  role: 'Client',
});

function NewProjectModal({ onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [desc, setDesc] = useState('');
  const [startISO, setStartISO] = useState('');
  const [endISO, setEndISO] = useState('');
  const [projType, setProjType] = useState('business');
  const [contacts, setContacts] = useState([emptyContact()]);
  const [step, setStep] = useState(1); // 1=info, 2=timeline&type, 3=contacts
  const [err, setErr] = useState('');

  const updateContact = (id, field, val) =>
    setContacts((cs) =>
      cs.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  const addContact = () => setContacts((cs) => [...cs, emptyContact()]);
  const removeContact = (id) =>
    setContacts((cs) => cs.filter((c) => c.id !== id));

  const fmtD = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const goNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setErr('Project name is required');
        return;
      }
      if (!address.trim()) {
        setErr('Project address is required');
        return;
      }
      setErr('');
      setStep(2);
    } else if (step === 2) {
      setErr('');
      setStep(3);
    }
  };

  const handleCreate = () => {
    const validContacts = contacts.filter((c) => c.name.trim());
    const primaryClient = validContacts[0] || {
      name: 'Unassigned',
      company: '',
      phone: '',
      email: '',
      initials: '?',
    };
    const initials =
      primaryClient.name
        .trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || '?';
    const newId = Date.now();
    const proj = {
      id: newId,
      name: name.trim(),
      address: address.trim(),
      desc: desc.trim(),
      startDateISO: startISO,
      due: endISO,
      startDate: fmtD(startISO),
      dueFmt: fmtD(endISO),
      projType,
      status: 'quoting',
      progress: 0,
      phase: 'Quoting',
      value: 0,
      location: address.trim().split(',')[0] || '',
      client: {
        name: primaryClient.name,
        company: primaryClient.company || '',
        phone: primaryClient.phone || '',
        email: primaryClient.email || '',
        initials,
      },
      contacts: validContacts,
    };
    onConfirm(proj);
  };

  const STEPS = [
    ['1', 'Project Info'],
    ['2', 'Timeline & Type'],
    ['3', 'Contacts'],
  ];

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          width: 580,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 0', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                🏗 New Project
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Fill in the details to create your project
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                fontSize: 20,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
            {STEPS.map(([n, l], i) => {
              const active = step === i + 1;
              const done = step > i + 1;
              return (
                <div
                  key={n}
                  style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: done
                          ? C.green
                          : active
                          ? C.accent
                          : C.border,
                        color: done || active ? '#000' : C.muted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                        transition: 'all .2s',
                      }}
                    >
                      {done ? '✓' : n}
                    </div>
                    <span
                      style={{
                        color: active ? C.text : done ? C.green : C.muted,
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        transition: 'color .2s',
                      }}
                    >
                      {l}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 24,
                        height: 2,
                        background: done ? C.green : C.border,
                        borderRadius: 1,
                        margin: '0 8px',
                        flexShrink: 0,
                        transition: 'background .2s',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
          {err && (
            <div
              style={{
                background: C.redDim,
                border: `1px solid ${C.red}44`,
                borderRadius: 8,
                padding: '9px 14px',
                color: C.red,
                fontFamily: F,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              {err}
            </div>
          )}

          {/* ── Step 1: Project Info ── */}
          {step === 1 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                paddingBottom: 4,
              }}
            >
              <div>
                <label style={LBL}>Project Name *</label>
                <input
                  style={INP}
                  placeholder="e.g. Riverside Townhomes Phase 2"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErr('');
                  }}
                />
              </div>
              <div>
                <label style={LBL}>Project Address *</label>
                <input
                  style={INP}
                  placeholder="Full address including city, country"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErr('');
                  }}
                />
              </div>
              <div>
                <label style={LBL}>
                  Project Description{' '}
                  <span style={{ color: C.muted, fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  style={{ ...INP, resize: 'none', lineHeight: 1.55 }}
                  rows={3}
                  placeholder="Brief overview of scope, objectives, or special requirements…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Timeline & Type ── */}
          {step === 2 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                paddingBottom: 4,
              }}
            >
              <div>
                <label style={{ ...LBL, marginBottom: 12 }}>
                  Project Timeline
                </label>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Starting Date</label>
                    <input
                      type="date"
                      value={startISO}
                      onChange={(e) => setStartISO(e.target.value)}
                      style={{ ...INP, colorScheme: 'dark' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={LBL}>Expected Finish Date</label>
                    <input
                      type="date"
                      value={endISO}
                      onChange={(e) => setEndISO(e.target.value)}
                      style={{ ...INP, colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                {startISO &&
                  endISO &&
                  (() => {
                    const diff = Math.round(
                      (new Date(endISO) - new Date(startISO)) /
                        (1000 * 60 * 60 * 24)
                    );
                    const weeks = Math.round(diff / 7);
                    return (
                      diff > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            background: C.green + '0d',
                            border: `1px solid ${C.green}33`,
                            borderRadius: 7,
                            padding: '8px 12px',
                            color: C.green,
                            fontFamily: F,
                            fontSize: 12,
                          }}
                        >
                          📅 Project duration: <strong>{diff} days</strong> (
                          {weeks} weeks)
                        </div>
                      )
                    );
                  })()}
                {startISO &&
                  endISO &&
                  new Date(endISO) <= new Date(startISO) && (
                    <div
                      style={{
                        marginTop: 10,
                        background: C.redDim,
                        border: `1px solid ${C.red}44`,
                        borderRadius: 7,
                        padding: '8px 12px',
                        color: C.red,
                        fontFamily: F,
                        fontSize: 12,
                      }}
                    >
                      ⚠️ End date must be after start date
                    </div>
                  )}
              </div>

              <div>
                <label style={{ ...LBL, marginBottom: 12 }}>Project Type</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    [
                      'business',
                      '🏢',
                      'Business',
                      'For a company or organization',
                    ],
                    ['customer', '👤', 'Customer', 'For an individual client'],
                  ].map(([v, ic, l, sub]) => (
                    <div
                      key={v}
                      onClick={() => setProjType(v)}
                      style={{
                        flex: 1,
                        border: `2px solid ${
                          projType === v
                            ? v === 'business'
                              ? C.purple
                              : C.blue
                            : C.border
                        }`,
                        borderRadius: 12,
                        padding: '16px 18px',
                        cursor: 'pointer',
                        background:
                          projType === v
                            ? v === 'business'
                              ? C.purpleDim
                              : C.blueDim
                            : 'transparent',
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{ic}</div>
                      <div
                        style={{
                          color: C.text,
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          color: C.muted,
                          fontFamily: F,
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        {sub}
                      </div>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${
                            projType === v
                              ? v === 'business'
                                ? C.purple
                                : C.blue
                              : C.border
                          }`,
                          background:
                            projType === v
                              ? v === 'business'
                                ? C.purple
                                : C.blue
                              : 'transparent',
                          marginTop: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          color: '#000',
                          fontWeight: 700,
                        }}
                      >
                        {projType === v && '✓'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Contacts ── */}
          {step === 3 && (
            <div style={{ paddingBottom: 4 }}>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                Add one or more contacts related to this project. The first
                contact will be used as the primary client.
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {contacts.map((c, ci) => (
                  <div
                    key={c.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: '16px 18px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 13,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: C.accentDim,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: C.accent,
                            fontFamily: F,
                            fontWeight: 700,
                            fontSize: 10,
                          }}
                        >
                          {ci + 1}
                        </div>
                        <span
                          style={{
                            color: C.text,
                            fontFamily: F,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {ci === 0 ? 'Primary Contact' : 'Contact ' + (ci + 1)}
                        </span>
                        {ci === 0 && (
                          <span
                            style={{
                              background: C.greenDim,
                              color: C.green,
                              fontSize: 10,
                              fontWeight: 700,
                              fontFamily: F,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            Primary
                          </span>
                        )}
                      </div>
                      {ci > 0 && (
                        <button
                          onClick={() => removeContact(c.id)}
                          style={{
                            background: 'transparent',
                            color: C.red,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>Contact Name *</label>
                          <input
                            style={INP}
                            placeholder="Full name"
                            value={c.name}
                            onChange={(e) =>
                              updateContact(c.id, 'name', e.target.value)
                            }
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>
                            Company{' '}
                            <span style={{ fontWeight: 400 }}>(optional)</span>
                          </label>
                          <input
                            style={INP}
                            placeholder="Company name"
                            value={c.company}
                            onChange={(e) =>
                              updateContact(c.id, 'company', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>Phone Number</label>
                          <input
                            style={INP}
                            placeholder="+971 50 000 0000"
                            value={c.phone}
                            onChange={(e) =>
                              updateContact(c.id, 'phone', e.target.value)
                            }
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={LBL}>Email</label>
                          <input
                            style={INP}
                            placeholder="name@example.com"
                            value={c.email}
                            onChange={(e) =>
                              updateContact(c.id, 'email', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={LBL}>Role / Relationship</label>
                        <select
                          value={c.role}
                          onChange={(e) =>
                            updateContact(c.id, 'role', e.target.value)
                          }
                          style={{ ...INP, cursor: 'pointer' }}
                        >
                          {CONTACT_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addContact}
                style={{
                  width: '100%',
                  marginTop: 12,
                  background: 'transparent',
                  color: C.accent,
                  border: `1px dashed ${C.accent}55`,
                  padding: '11px 0',
                  borderRadius: 9,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                }}
              >
                + Add Another Contact
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 28px',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
          }}
        >
          <button
            onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '11px 20px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {step < 3 ? (
              <button
                onClick={goNext}
                style={{
                  background: C.accent,
                  color: '#000',
                  border: 'none',
                  padding: '11px 28px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleCreate}
                style={{
                  background: C.green,
                  color: '#fff',
                  border: 'none',
                  padding: '11px 28px',
                  borderRadius: 8,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                🏗 Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Projects List ─────────────────────────────────────────────────────────────
function ProjectsList({
  onSelect,
  allProjects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) {
  const [showNew, setShowNew] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [confirmPatch, setConfirmPatch] = useState(null); // {proj, patch}
  const [confirmDelete, setConfirmDelete] = useState(null); // project to delete
  const handleCreate = (proj) => {
    onAddProject(proj);
    setShowNew(false);
    onSelect(proj);
  };
  return (
    <div>
      {showNew && (
        <NewProjectModal
          onConfirm={handleCreate}
          onCancel={() => setShowNew(false)}
        />
      )}
      {editingProj && (
        <EditProjectModal
          project={editingProj}
          onConfirm={(patch) => {
            setEditingProj(null);
            setConfirmPatch({ proj: editingProj, patch });
          }}
          onCancel={() => setEditingProj(null)}
        />
      )}
      {confirmPatch && (
        <ConfirmDialog
          title="Save Project Changes?"
          message={`Are you sure you want to apply these changes to "${confirmPatch.proj.name}"?`}
          confirmLabel="Yes, Save Changes"
          variant="edit"
          onConfirm={async () => {
            await onUpdateProject(confirmPatch.proj.id, confirmPatch.patch);
            setConfirmPatch(null);
          }}
          onCancel={() => setConfirmPatch(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Project?"
          message={`Are you sure you want to permanently delete "${confirmDelete.name}"? All related invoices, payments, plans, tasks and team assignments for this project will also be removed. This action cannot be undone.`}
          confirmLabel="Yes, Delete Project"
          variant="delete"
          onConfirm={async () => {
            await onDeleteProject(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.red}33`,
              borderRadius: 9,
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: C.redDim,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🏗
              </div>
              <div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {confirmDelete.name}
                </div>
                <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
                  {confirmDelete.client?.name} · {confirmDelete.location || ''}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge status={confirmDelete.status} />
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 20,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Projects
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            {allProjects.length} projects total
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          🏗 + New Project
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allProjects.map((p) => (
          <div
            key={p.id}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '18px 24px',
              transition: 'all .18s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.accent + '66';
              e.currentTarget.style.background = C.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.background = C.card;
            }}
          >
            <div onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom:
                    p.status !== 'quoting' && p.progress > 0 ? 14 : 0,
                  gap: 12,
                }}
              >
                {/* Left: name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 3,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {p.name}
                    </div>
                    {p.projType && (
                      <span
                        style={{
                          background:
                            p.projType === 'business' ? C.purpleDim : C.blueDim,
                          color: p.projType === 'business' ? C.purple : C.blue,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: F,
                        }}
                      >
                        {p.projType === 'business'
                          ? '🏢 Business'
                          : '👤 Customer'}
                      </span>
                    )}
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
                    {p.client.name} · {p.location || p.address} · Due:{' '}
                    {p.dueFmt} · {p.phase}
                  </div>
                  {p.desc && (
                    <div
                      style={{
                        color: C.muted,
                        fontFamily: F,
                        fontSize: 11,
                        marginTop: 3,
                        fontStyle: 'italic',
                      }}
                    >
                      {p.desc.slice(0, 80)}
                      {p.desc.length > 80 ? '…' : ''}
                    </div>
                  )}
                </div>
                {/* Right: value + status + edit icon — all on one line */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  {p.value > 0 && (
                    <span
                      style={{
                        color: C.accent,
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      ${p.value.toLocaleString()}
                    </span>
                  )}
                  <Badge status={p.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProj(p);
                    }}
                    title="Edit project"
                    style={{
                      background: 'transparent',
                      color: C.muted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all .15s',
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = C.accent;
                      e.currentTarget.style.borderColor = C.accent + '66';
                      e.currentTarget.style.background = C.accentDim;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = C.muted;
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(p);
                    }}
                    title="Delete project"
                    style={{
                      background: 'transparent',
                      color: C.muted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all .15s',
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = C.red;
                      e.currentTarget.style.borderColor = C.red + '66';
                      e.currentTarget.style.background = C.redDim;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = C.muted;
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    🗑️
                  </button>
                  <span style={{ color: C.muted, fontSize: 18, lineHeight: 1 }}>
                    ›
                  </span>
                </div>
              </div>
              {(() => {
                const pct = calcProgress(p);
                const days = daysRemaining(p);
                const overdue =
                  days !== null && days < 0 && p.status !== 'completed';
                return pct > 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{ color: C.muted, fontFamily: F, fontSize: 11 }}
                      >
                        {p.phase}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {days !== null && (
                          <span
                            style={{
                              color: overdue
                                ? C.red
                                : days <= 7
                                ? C.accent
                                : C.green,
                              fontFamily: F,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {p.status === 'completed'
                              ? 'Done'
                              : overdue
                              ? `${Math.abs(days)}d overdue`
                              : `${days}d left`}
                          </span>
                        )}
                        <span
                          style={{
                            color:
                              p.status === 'completed'
                                ? C.green
                                : overdue
                                ? C.red
                                : C.accent,
                            fontFamily: F,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <Bar
                      pct={pct}
                      color={
                        p.status === 'completed'
                          ? C.green
                          : overdue
                          ? C.red
                          : C.accent
                      }
                    />
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
// ─── Dashboard widget types ───────────────────────────────────────────────────
const WIDGET_TYPES = [
  { id: 'projects', label: 'Project Progress', icon: '🏗' },
  { id: 'invoices', label: 'Recent Invoices', icon: '🧾' },
  { id: 'payments', label: 'Recent Payments', icon: '💰' },
  { id: 'tasks', label: 'Upcoming Tasks', icon: '✅' },
  { id: 'activity', label: 'Activity Log', icon: '📋' },
  { id: 'calendar', label: 'Upcoming Events', icon: '📅' },
];

function DashWidget({
  widgetId,
  type,
  allProjects,
  allInvoices,
  payments,
  tasks,
  globalLog,
  onSelect,
  onChangeType,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const wt = WIDGET_TYPES.find((w) => w.id === type) || WIDGET_TYPES[0];

  const renderContent = () => {
    if (type === 'projects')
      return (
        <div>
          {allProjects.filter((p) => p.status === 'active').length === 0 && (
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 12,
                padding: '12px 0',
              }}
            >
              No active projects
            </div>
          )}
          {allProjects
            .filter((p) => p.status === 'active')
            .map((p) => {
              const pct = calcProgress(p);
              const days = daysRemaining(p);
              const ov = days !== null && days < 0;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelect && onSelect(p)}
                  style={{
                    marginBottom: 12,
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 8,
                    transition: 'background .15s',
                    border: `1px solid ${C.border}22`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.surface)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        color: C.text,
                        fontFamily: F,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        color: ov ? C.red : C.muted,
                        fontFamily: F,
                        fontSize: 11,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <Bar
                    pct={pct}
                    color={
                      ov ? C.red : p.status === 'completed' ? C.green : C.accent
                    }
                  />
                  <div
                    style={{
                      color: C.muted,
                      fontFamily: F,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {p.phase} · Due: {p.dueFmt}
                    {ov ? <span style={{ color: C.red }}> ⚠ Overdue</span> : ''}
                  </div>
                </div>
              );
            })}
        </div>
      );
    if (type === 'invoices')
      return (
        <div>
          {allInvoices.slice(0, 5).map((inv) => {
            const st =
              INV_ST.find((s) => s.v === (inv.status || inv.invoiceStatus)) ||
              INV_ST[0];
            return (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.border}22`,
                }}
              >
                <div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {inv.id || inv.invId}
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    {inv.project || inv.client || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    ${Number(inv.amount || 0).toLocaleString()}
                  </div>
                  <span
                    style={{
                      background: st.c + '22',
                      color: st.c,
                      padding: '2px 7px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: F,
                    }}
                  >
                    {st.l}
                  </span>
                </div>
              </div>
            );
          })}
          {allInvoices.length === 0 && (
            <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
              No invoices yet
            </div>
          )}
        </div>
      );
    if (type === 'payments')
      return (
        <div>
          {payments
            .slice(-5)
            .reverse()
            .map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.border}22`,
                }}
              >
                <div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {p.project}
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    {p.dateFmt} · {p.method}
                  </div>
                </div>
                <div
                  style={{
                    color: C.green,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  ${p.amount.toLocaleString()}
                </div>
              </div>
            ))}
          {payments.length === 0 && (
            <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
              No payments yet
            </div>
          )}
        </div>
      );
    if (type === 'tasks')
      return (
        <div>
          {tasks
            .filter((t) => t.status === 'pending')
            .slice(0, 5)
            .map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.border}22`,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: C.accent,
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {t.title}
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    {t.member} · {t.project}
                  </div>
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontFamily: F,
                    fontSize: 10,
                    flexShrink: 0,
                  }}
                >
                  {t.date}
                </div>
              </div>
            ))}
          {tasks.filter((t) => t.status === 'pending').length === 0 && (
            <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
              No pending tasks
            </div>
          )}
        </div>
      );
    if (type === 'activity')
      return (
        <div>
          {globalLog.slice(0, 6).map((e) => (
            <div
              key={e.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: `1px solid ${C.border}22`,
              }}
            >
              <div style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>
                {e.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {e.action}
                </div>
                <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                  {e.user} · {e.time}
                </div>
              </div>
            </div>
          ))}
          {globalLog.length === 0 && (
            <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
              No activity yet
            </div>
          )}
        </div>
      );
    if (type === 'calendar')
      return (
        <div>
          {allInvoices
            .filter((i) => i.due && i.status !== 'paid')
            .slice(0, 3)
            .map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.border}22`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: C.accentDim,
                    border: `1px solid ${C.accentMid}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      color: C.accent,
                      fontFamily: F,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {inv.dueFmt?.split(' ')[0] || ''}
                  </div>
                  <div
                    style={{
                      color: C.accent,
                      fontFamily: F,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {inv.dueFmt?.split(' ')[1] || ''}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {inv.id || inv.invId} due
                  </div>
                  <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                    {inv.project} · ${Number(inv.amount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          {allInvoices.filter((i) => i.due && i.status !== 'paid').length ===
            0 && (
            <div style={{ color: C.muted, fontFamily: F, fontSize: 12 }}>
              No upcoming events
            </div>
          )}
        </div>
      );
    return null;
  };

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '18px 22px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 16 }}>{wt.icon}</span>
          <span
            style={{
              color: C.text,
              fontFamily: F,
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {wt.label}
          </span>
        </div>
        <button
          onClick={() => setShowPicker((p) => !p)}
          title="Change widget"
          style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: '3px 9px',
            color: C.muted,
            fontFamily: F,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          ⚙ Customize
        </button>
      </div>
      {showPicker && (
        <div
          style={{
            position: 'absolute',
            top: 54,
            right: 18,
            zIndex: 200,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,.35)',
            minWidth: 200,
          }}
        >
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 10,
              fontWeight: 700,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            Choose Widget
          </div>
          {WIDGET_TYPES.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                onChangeType(w.id);
                setShowPicker(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 7,
                background: type === w.id ? C.accentDim : 'transparent',
                border: 'none',
                color: type === w.id ? C.accent : C.text,
                fontFamily: F,
                fontSize: 12,
                fontWeight: type === w.id ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 2,
              }}
            >
              <span>{w.icon}</span>
              {w.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>{renderContent()}</div>
    </div>
  );
}

function Dashboard({
  onSelect,
  allProjects = [],
  allInvoices = [],
  payments = [],
  tasks = [],
  globalLog = [],
}) {
  const [widget1, setWidget1] = useState(() => {
    try {
      return localStorage.getItem('bf_w1') || 'projects';
    } catch {
      return 'projects';
    }
  });
  const [widget2, setWidget2] = useState(() => {
    try {
      return localStorage.getItem('bf_w2') || 'invoices';
    } catch {
      return 'invoices';
    }
  });

  const setW1 = (t) => {
    setWidget1(t);
    try {
      localStorage.setItem('bf_w1', t);
    } catch {}
  };
  const setW2 = (t) => {
    setWidget2(t);
    try {
      localStorage.setItem('bf_w2', t);
    } catch {}
  };

  const activeCount = allProjects.filter((p) => p.status === 'active').length;
  const outstanding = allInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + Number(i.amount || 0), 0);
  const onSite = 2; // static demo value

  const now = new Date();
  const h = now.getHours();
  const gr =
    h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const dayName = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            color: C.muted,
            fontFamily: F,
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          {dayName}
        </div>
        <h2
          style={{
            color: C.text,
            fontFamily: F,
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
          }}
        >
          {gr}, Jordan 👷
        </h2>
      </div>
      {/* Stats row */}
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}
      >
        {[
          ['Active Projects', activeCount, 'Currently in progress', C.blue],
          [
            'Revenue (This Month)',
            '$' +
              Math.round(
                payments
                  .filter((p) => {
                    if (!p.date) return false;
                    const d = new Date(p.date + 'T12:00:00');
                    return (
                      d.getMonth() === now.getMonth() &&
                      d.getFullYear() === now.getFullYear()
                    );
                  })
                  .reduce((s, p) => s + p.amount, 0) / 1000
              ) +
              'k',
            'Payments received',
            C.green,
          ],
          [
            'Outstanding',
            '$' + Math.round(outstanding / 1000) + 'k',
            `${
              allInvoices.filter((i) => i.status !== 'paid').length
            } unpaid invoices`,
            C.accent,
          ],
          ['Team On Site', onSite, 'Today', C.purple],
        ].map(([l, v, s, c]) => (
          <div
            key={l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '18px 22px',
              flex: 1,
              minWidth: 130,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontSize: 11,
                fontFamily: F,
                marginBottom: 6,
              }}
            >
              {l}
            </div>
            <div
              style={{
                color: c,
                fontSize: 26,
                fontFamily: F,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {v}
            </div>
            <div
              style={{
                color: C.muted,
                fontSize: 12,
                fontFamily: F,
                marginTop: 4,
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>
      {/* Customizable widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <DashWidget
          widgetId="w1"
          type={widget1}
          allProjects={allProjects}
          allInvoices={allInvoices}
          payments={payments}
          tasks={tasks}
          globalLog={globalLog}
          onSelect={onSelect}
          onChangeType={setW1}
        />
        <DashWidget
          widgetId="w2"
          type={widget2}
          allProjects={allProjects}
          allInvoices={allInvoices}
          payments={payments}
          tasks={tasks}
          globalLog={globalLog}
          onSelect={onSelect}
          onChangeType={setW2}
        />
      </div>
    </div>
  );
}

// ─── Global Invoices state hook (dynamic + static merged) ─────────────────────
function useGlobalInvoices() {
  const [dynInv, setDynInv] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await storage.get('invoices:global');
      if (!alive) return;
      setDynInv(r ? JSON.parse(r.value) : []);
    })();
    return () => {
      alive = false;
    };
  }, []);
  const save = async (next) => {
    setDynInv(next);
    await storage.set('invoices:global', JSON.stringify(next));
  };
  const allInvoices = useMemo(
    () => [
      ...ALL_INV_STATIC.map((i) => ({ ...i, _static: true })),
      ...(dynInv || []),
    ],
    [dynInv]
  );
  return {
    allInvoices,
    ready: dynInv !== null,
    addInvoice: (inv) => save([...(dynInv || []), inv]),
    updateInvoice: (id, patch) =>
      save((dynInv || []).map((i) => (i.id === id ? { ...i, ...patch } : i))),
    removeInvoice: (id) => save((dynInv || []).filter((i) => i.id !== id)),
  };
}

function EditInvoiceModal({ invoice, allProjects, onConfirm, onCancel }) {
  const [project, setProject] = useState(invoice.project || '');
  const [client, setClient] = useState(invoice.client || '');
  const [desc, setDesc] = useState(invoice.desc || '');
  const [amount, setAmount] = useState(String(invoice.amount || ''));
  const [due, setDue] = useState(invoice.due || '');
  const [status, setStatus] = useState(
    invoice.status || invoice.invoiceStatus || 'pending'
  );
  const [err, setErr] = useState('');

  const submit = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setErr('Amount is required');
      return;
    }
    const fmt = due
      ? new Date(due + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';
    onConfirm({
      project,
      client,
      desc,
      amount: parseFloat(amount),
      due,
      dueFmt: fmt,
      status,
      invoiceStatus: status,
    });
  };

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          width: 480,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                color: C.text,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              ✏️ Edit Invoice
            </div>
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {invoice.id || invoice.invId}
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        {err && (
          <div
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}44`,
              borderRadius: 7,
              padding: '9px 12px',
              color: C.red,
              fontFamily: F,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            ⚠ {err}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <label style={LBL}>Project</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              <option value="">— Select Project —</option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>Client / Company</label>
            <input
              style={INP}
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Client name"
            />
          </div>
          <div>
            <label style={LBL}>Description</label>
            <textarea
              style={{ ...INP, resize: 'none' }}
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Invoice description"
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Amount *</label>
              <input
                style={INP}
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErr('');
                }}
                placeholder="0.00"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Due Date</label>
              <input
                style={{ ...INP, colorScheme: 'dark' }}
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={LBL}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {INV_ST.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setStatus(s.v)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    border:
                      status === s.v
                        ? `2px solid ${s.c}`
                        : `1px solid ${C.border}`,
                    background: status === s.v ? s.c + '22' : 'transparent',
                    color: status === s.v ? s.c : C.muted,
                    transition: 'all .15s',
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            onClick={submit}
            style={{
              flex: 1,
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '12px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✓ Save Changes
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '12px 18px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function AddGlobalInvoiceModal({ allProjects, onConfirm, onCancel }) {
  const [project, setProject] = useState(allProjects[0]?.name || '');
  const [client, setClient] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [due, setDue] = useState('');
  const [status, setStatus] = useState('pending');
  const [err, setErr] = useState('');

  useEffect(() => {
    const p = allProjects.find((p) => p.name === project);
    if (p && p.client) setClient(p.client.company || p.client.name || '');
  }, [project, allProjects]);

  const submit = () => {
    if (!project) {
      setErr('Project is required');
      return;
    }
    if (!amount || isNaN(parseFloat(amount))) {
      setErr('Amount is required');
      return;
    }
    const fmt = due
      ? new Date(due + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';
    const maxId = Math.max(
      0,
      ...[...ALL_INV_STATIC].map((i) => parseInt(i.id.replace(/\D/g, '')) || 0)
    );
    onConfirm({
      id: `INV-${String(maxId + Math.floor(Math.random() * 10) + 1).padStart(
        3,
        '0'
      )}`,
      project,
      client,
      desc,
      amount: parseFloat(amount),
      due,
      dueFmt: fmt,
      status,
      invoiceStatus: status,
    });
  };

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          width: 480,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              color: C.text,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            🧾 New Invoice
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        {err && (
          <div
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}44`,
              borderRadius: 7,
              padding: '9px 12px',
              color: C.red,
              fontFamily: F,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            ⚠ {err}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <label style={LBL}>Project *</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              <option value="">— Select Project —</option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LBL}>Client / Company</label>
            <input
              style={INP}
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Auto-filled from project"
            />
          </div>
          <div>
            <label style={LBL}>Description</label>
            <textarea
              style={{ ...INP, resize: 'none' }}
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What is this invoice for?"
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Amount *</label>
              <input
                style={INP}
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErr('');
                }}
                placeholder="0.00"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LBL}>Due Date</label>
              <input
                style={{ ...INP, colorScheme: 'dark' }}
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={LBL}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {INV_ST.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setStatus(s.v)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    border:
                      status === s.v
                        ? `2px solid ${s.c}`
                        : `1px solid ${C.border}`,
                    background: status === s.v ? s.c + '22' : 'transparent',
                    color: status === s.v ? s.c : C.muted,
                    transition: 'all .15s',
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            onClick={submit}
            style={{
              flex: 1,
              background: C.accent,
              color: '#000',
              border: 'none',
              padding: '12px 0',
              borderRadius: 8,
              fontFamily: F,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✓ Add Invoice
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '12px 18px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function InvoicingPage({
  allProjects = [],
  allInvoices = [],
  addInvoice,
  updateInvoice,
  removeInvoice,
}) {
  const ready = allInvoices !== undefined;
  const [projFilter, setProjFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmEdit, setConfirmEdit] = useState(null); // {invoice, patch}

  const filtered = useMemo(
    () =>
      allInvoices.filter((inv) => {
        if (projFilter !== 'all' && inv.project !== projFilter) return false;
        if (clientFilter !== 'all' && inv.client !== clientFilter) return false;
        return true;
      }),
    [allInvoices, projFilter, clientFilter]
  );

  const projects = useMemo(
    () => [...new Set(allInvoices.map((i) => i.project).filter(Boolean))],
    [allInvoices]
  );
  const clients = useMemo(
    () => [...new Set(allInvoices.map((i) => i.client).filter(Boolean))],
    [allInvoices]
  );

  const outstanding = filtered
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + Number(i.amount || 0), 0);
  const overdue = filtered
    .filter((i) => i.status === 'overdue')
    .reduce((s, i) => s + Number(i.amount || 0), 0);
  const paid = filtered
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  const cycleStatus = async (inv) => {
    if (inv._static) return; // static invoices can't be mutated
    const next =
      { pending: 'paid', paid: 'overdue', overdue: 'pending' }[
        inv.status || inv.invoiceStatus
      ] || 'pending';
    await updateInvoice(inv.id, { status: next, invoiceStatus: next });
  };

  if (!ready)
    return (
      <div
        style={{
          color: C.muted,
          fontFamily: F,
          padding: '40px 0',
          textAlign: 'center',
        }}
      >
        Loading…
      </div>
    );

  return (
    <div>
      {showAdd && (
        <AddGlobalInvoiceModal
          allProjects={allProjects}
          onConfirm={async (inv) => {
            await addInvoice(inv);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <EditInvoiceModal
          invoice={editing}
          allProjects={allProjects}
          onConfirm={(patch) => setConfirmEdit({ invoice: editing, patch })}
          onCancel={() => setEditing(null)}
        />
      )}
      {confirmEdit && (
        <ConfirmDialog
          title="Save Changes?"
          message="Are you sure you want to apply these changes to this invoice?"
          confirmLabel="Yes, Save"
          variant="edit"
          onConfirm={async () => {
            await updateInvoice(confirmEdit.invoice.id, confirmEdit.patch);
            setConfirmEdit(null);
            setEditing(null);
          }}
          onCancel={() => setConfirmEdit(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: C.accent, fontFamily: F, fontWeight: 700 }}>
              {confirmEdit.invoice.id || confirmEdit.invoice.invId}
            </span>
            <span style={{ color: C.text, fontFamily: F, fontWeight: 700 }}>
              $
              {Number(
                confirmEdit.patch.amount || confirmEdit.invoice.amount || 0
              ).toLocaleString()}
            </span>
          </div>
        </ConfirmDialog>
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Invoice?"
          message={`Are you sure you want to delete invoice "${
            confirmDelete.id || confirmDelete.invId
          }"? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          variant="delete"
          onConfirm={async () => {
            await removeInvoice(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: C.accent, fontFamily: F, fontWeight: 700 }}>
              {confirmDelete.id || confirmDelete.invId}
            </span>
            <span style={{ color: C.text, fontFamily: F, fontWeight: 700 }}>
              ${Number(confirmDelete.amount || 0).toLocaleString()}
            </span>
          </div>
        </ConfirmDialog>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 22,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            🧾 Invoices
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            All invoices across every project
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '11px 22px',
            borderRadius: 9,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + New Invoice
        </button>
      </div>

      {/* Stats */}
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}
      >
        {[
          [
            'Outstanding',
            '$' + (outstanding / 1000).toFixed(0) + 'k',
            `${filtered.filter((i) => i.status !== 'paid').length} invoices`,
            C.blue,
          ],
          [
            'Overdue',
            '$' + (overdue / 1000).toFixed(0) + 'k',
            'Needs follow-up',
            C.red,
          ],
          [
            'Collected',
            '$' + (paid / 1000).toFixed(0) + 'k',
            `${filtered.filter((i) => i.status === 'paid').length} paid`,
            C.green,
          ],
          ['Total Invoices', filtered.length, 'All statuses', C.purple],
        ].map(([l, v, s, c]) => (
          <div
            key={l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '18px 22px',
              flex: 1,
              minWidth: 130,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontSize: 11,
                fontFamily: F,
                marginBottom: 5,
              }}
            >
              {l}
            </div>
            <div
              style={{
                color: c,
                fontSize: 26,
                fontFamily: F,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {v}
            </div>
            <div
              style={{
                color: C.muted,
                fontSize: 12,
                fontFamily: F,
                marginTop: 4,
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <select
          value={projFilter}
          onChange={(e) => setProjFilter(e.target.value)}
          style={{
            ...INP,
            width: 'auto',
            padding: '9px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{
            ...INP,
            width: 'auto',
            padding: '9px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <option value="all">All Clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(projFilter !== 'all' || clientFilter !== 'all') && (
          <button
            onClick={() => {
              setProjFilter('all');
              setClientFilter('all');
            }}
            style={{
              background: C.surface,
              color: C.muted,
              border: `1px solid ${C.border}`,
              padding: '9px 14px',
              borderRadius: 8,
              fontFamily: F,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ✕ Clear
          </button>
        )}
        <span
          style={{
            marginLeft: 'auto',
            color: C.muted,
            fontFamily: F,
            fontSize: 12,
            alignSelf: 'center',
          }}
        >
          {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: C.muted,
              fontFamily: F,
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>No invoices
            match your filters
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: F,
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  background: C.surface,
                }}
              >
                {[
                  'Invoice #',
                  'Project',
                  'Client',
                  'Amount',
                  'Due',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: C.muted,
                      fontWeight: 700,
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => {
                const st =
                  INV_ST.find(
                    (s) => s.v === (inv.status || inv.invoiceStatus)
                  ) || INV_ST[0];
                return (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1
                          ? `1px solid ${C.border}22`
                          : 'none',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.surface)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <td
                      style={{
                        color: C.accent,
                        padding: '14px 16px',
                        fontWeight: 700,
                      }}
                    >
                      {inv.id || inv.invId}
                    </td>
                    <td
                      style={{
                        color: C.text,
                        padding: '14px 16px',
                        fontWeight: 600,
                      }}
                    >
                      {inv.project || '—'}
                    </td>
                    <td style={{ color: C.muted, padding: '14px 16px' }}>
                      {inv.client || '—'}
                    </td>
                    <td
                      style={{
                        color: C.text,
                        padding: '14px 16px',
                        fontWeight: 700,
                      }}
                    >
                      ${Number(inv.amount || 0).toLocaleString()}
                    </td>
                    <td
                      style={{
                        color:
                          (inv.status || inv.invoiceStatus) === 'overdue'
                            ? C.red
                            : C.muted,
                        padding: '14px 16px',
                      }}
                    >
                      {inv.dueFmt || inv.dueDate || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => !inv._static && cycleStatus(inv)}
                        title={
                          inv._static
                            ? 'Static invoice'
                            : 'Click to cycle status'
                        }
                        style={{
                          background: st.c + '22',
                          color: st.c,
                          border: `1px solid ${st.c}55`,
                          padding: '4px 10px',
                          borderRadius: 5,
                          fontFamily: F,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: inv._static ? 'default' : 'pointer',
                        }}
                      >
                        {st.l}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!inv._static && (
                          <button
                            onClick={() => setEditing(inv)}
                            style={{
                              background: C.blueDim,
                              color: C.blue,
                              border: `1px solid ${C.blue}33`,
                              padding: '5px 10px',
                              borderRadius: 5,
                              fontFamily: F,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Edit
                          </button>
                        )}
                        {!inv._static && (
                          <button
                            onClick={() => setConfirmDelete(inv)}
                            style={{
                              background: C.redDim,
                              color: C.red,
                              border: `1px solid ${C.red}33`,
                              padding: '5px 10px',
                              borderRadius: 5,
                              fontFamily: F,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🗑 Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TeamGlobal({ allProjects = [], onLog }) {
  // Collect ALL members from every project (including seeds) – refresh on mount
  const [liveMembers, setLiveMembers] = useState([]);
  const [version, setVersion] = useState(0); // bump to force refresh
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmEditMember, setConfirmEditMember] = useState(null);
  const [confirmDelMember, setConfirmDelMember] = useState(null);
  const [projFilter, setProjFilter] = useState('all');

  const refresh = () => setVersion((v) => v + 1);

  useEffect(() => {
    let alive = true;
    (async () => {
      const allIds = [
        ...PROJECTS.map((p) => p.id),
        ...allProjects
          .filter((p) => !PROJECTS.find((s) => s.id === p.id))
          .map((p) => p.id),
      ];
      const allM = [];
      for (const id of allIds) {
        try {
          const r = await storage.get(`team:${id}`);
          const proj = [...PROJECTS, ...allProjects].find((p) => p.id === id);
          const pname = proj?.name || `Project ${id}`;
          const members = r ? JSON.parse(r.value) : PROJ_CREW_SEED[id] || [];
          members.forEach((m) =>
            allM.push({ ...m, projId: id, projectName: pname })
          );
        } catch {}
      }
      if (alive) setLiveMembers(allM);
    })();
    return () => {
      alive = false;
    };
  }, [allProjects, version]);

  // Write member update back to the project's team storage key
  const saveToProject = async (projId, updater) => {
    const key = `team:${projId}`;
    const r = await storage.get(key);
    const current = r ? JSON.parse(r.value) : PROJ_CREW_SEED[projId] || [];
    const next = updater(current);
    await storage.set(key, JSON.stringify(next));
  };

  const handleAddMember = async (m) => {
    if (!m.projId) {
      alert('Please select a project for this member.');
      return;
    }
    await saveToProject(m.projId, (cur) => [
      ...cur,
      { ...m, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ]);
    if (onLog)
      onLog({
        id: Date.now(),
        action: `${m.name} added to team`,
        detail: m.projectName || '',
        user: 'Jordan Blake',
        time: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        icon: '👷',
      });
    refresh();
    setShowAddModal(false);
  };

  const handleEditMember = async (patch) => {
    const { projId, id } = editingMember;
    await saveToProject(projId, (cur) =>
      cur.map((m) =>
        m.id === id
          ? {
              ...m,
              ...patch,
              init: patch.name
                ? patch.name
                    .trim()
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : m.init,
            }
          : m
      )
    );
    if (onLog)
      onLog({
        id: Date.now(),
        action: `${editingMember.name} updated`,
        detail: editingMember.projectName || '',
        user: 'Jordan Blake',
        time: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        icon: 'Edit',
      });
    refresh();
    setEditingMember(null);
    setConfirmEditMember(null);
  };

  const handleDeleteMember = async () => {
    const { projId, id, name, projectName } = confirmDelMember;
    await saveToProject(projId, (cur) => cur.filter((m) => m.id !== id));
    if (onLog)
      onLog({
        id: Date.now(),
        action: `${name} removed from team`,
        detail: projectName || '',
        user: 'Jordan Blake',
        time: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        icon: 'Del',
      });
    refresh();
    setConfirmDelMember(null);
  };

  const filtered =
    projFilter === 'all'
      ? liveMembers
      : liveMembers.filter((m) => String(m.projId) === projFilter);
  const onSite = liveMembers.filter((m) => m.status === 'on-site').length;
  const scheduled = liveMembers.filter((m) => m.status === 'scheduled').length;

  return (
    <div>
      {/* Add Member Modal */}
      {showAddModal && (
        <Overlay onClose={() => setShowAddModal(false)}>
          <TeamGlobalAddModal
            allProjects={allProjects}
            onConfirm={handleAddMember}
            onCancel={() => setShowAddModal(false)}
          />
        </Overlay>
      )}
      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          allProjects={allProjects}
          onConfirm={(patch) => {
            setConfirmEditMember({ patch });
            setEditingMember(null);
          }}
          onCancel={() => setEditingMember(null)}
        />
      )}
      {confirmEditMember && (
        <ConfirmDialog
          title="Save Member Changes?"
          message="Are you sure you want to apply these changes?"
          confirmLabel="Yes, Save"
          variant="edit"
          onConfirm={() => handleEditMember(confirmEditMember.patch)}
          onCancel={() => setConfirmEditMember(null)}
        />
      )}
      {confirmDelMember && (
        <ConfirmDialog
          title="Remove Team Member?"
          message={`Are you sure you want to remove ${confirmDelMember.name} from ${confirmDelMember.projectName}? This action cannot be undone.`}
          confirmLabel="Yes, Remove"
          variant="delete"
          onConfirm={handleDeleteMember}
          onCancel={() => setConfirmDelMember(null)}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: (confirmDelMember.color || C.blue) + '22',
                border: `2px solid ${confirmDelMember.color || C.blue}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: confirmDelMember.color || C.blue,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {confirmDelMember.init}
            </div>
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {confirmDelMember.name}
              </div>
              <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                {confirmDelMember.role} · {confirmDelMember.projectName}
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              color: C.text,
              fontSize: 20,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
            }}
          >
            👥 Team & Scheduling
          </h2>
          <div
            style={{
              color: C.muted,
              fontFamily: F,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            {liveMembers.length} members across all projects
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 9,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          + Add Member
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}
      >
        {[
          ['Total Members', liveMembers.length, C.blue],
          ['On Site', onSite, C.green],
          ['Scheduled', scheduled, C.purple],
          ['Projects', allProjects.length, C.accent],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '16px 20px',
              flex: 1,
              minWidth: 110,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: F,
                fontSize: 11,
                marginBottom: 5,
              }}
            >
              {l}
            </div>
            <div
              style={{
                color: c,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div
        style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}
      >
        <select
          value={projFilter}
          onChange={(e) => setProjFilter(e.target.value)}
          style={{
            ...INP,
            width: 'auto',
            padding: '8px 14px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Projects</option>
          {allProjects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        <span
          style={{
            color: C.muted,
            fontFamily: F,
            fontSize: 12,
            alignSelf: 'center',
            marginLeft: 'auto',
          }}
        >
          {filtered.length} member{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Members list */}
      {filtered.length === 0 && (
        <div
          style={{
            background: C.card,
            border: `2px dashed ${C.border}`,
            borderRadius: 12,
            padding: '48px 20px',
            textAlign: 'center',
            color: C.muted,
            fontFamily: F,
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>👷</div>No team
          members yet — click <strong>+ Add Member</strong> to get started
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((m) => (
          <div
            key={`${m.projId}-${m.id}`}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              transition: 'border-color .18s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = C.accent + '55')
            }
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: (m.color || C.blue) + '22',
                border: `2px solid ${m.color || C.blue}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: m.color || C.blue,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {m.init}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    color: C.text,
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {m.name}
                </span>
                <Badge status={m.type || 'employee'} />
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: F,
                  fontSize: 12,
                  display: 'flex',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <span>🔨 {m.role}</span>
                {m.phone && <span>📞 {m.phone}</span>}
                {m.email && <span>✉️ {m.email}</span>}
                <span style={{ color: C.accent }}>🏗 {m.projectName}</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                alignItems: 'flex-end',
                flexShrink: 0,
              }}
            >
              <Badge status={m.status || 'on-site'} />
              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  onClick={() => setEditingMember(m)}
                  style={{
                    background: C.blueDim,
                    color: C.blue,
                    border: `1px solid ${C.blue}33`,
                    padding: '4px 10px',
                    borderRadius: 5,
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setConfirmDelMember(m)}
                  style={{
                    background: 'transparent',
                    color: C.red,
                    border: `1px solid ${C.red}33`,
                    padding: '4px 9px',
                    borderRadius: 5,
                    fontFamily: F,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add Member Modal for global Team section
function TeamGlobalAddModal({ allProjects, onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [projId, setProjId] = useState(allProjects[0]?.id || 1);
  const [status, setStatus] = useState('on-site');
  const [err, setErr] = useState('');
  const proj = allProjects.find((p) => p.id === projId);
  const submit = () => {
    if (!name.trim()) {
      setErr('Name is required');
      return;
    }
    const init = name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const colors = [C.blue, C.purple, C.green, C.accent, '#f43f5e', '#06b6d4'];
    onConfirm({
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim(),
      status,
      projId,
      projectName: proj?.name || '',
      init,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: 'employee',
    });
  };
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 28,
        width: 460,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <span
          style={{
            color: C.text,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 17,
          }}
        >
          👷 Add Team Member
        </span>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: C.muted,
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
      {err && (
        <div
          style={{
            background: C.redDim,
            border: `1px solid ${C.red}44`,
            borderRadius: 7,
            padding: '9px 12px',
            color: C.red,
            fontFamily: F,
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          ⚠ {err}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 2 }}>
            <label style={LBL}>Name *</label>
            <input
              style={INP}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr('');
              }}
              placeholder="Full name"
            />
          </div>
          <div style={{ flex: 2 }}>
            <label style={LBL}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ ...INP, cursor: 'pointer' }}
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={LBL}>Phone</label>
            <input
              style={INP}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 000 0000"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={LBL}>Email</label>
            <input
              style={INP}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
        </div>
        <div>
          <label style={LBL}>Assign to Project</label>
          <select
            value={projId}
            onChange={(e) => setProjId(Number(e.target.value))}
            style={{ ...INP, cursor: 'pointer' }}
          >
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={LBL}>Status</label>
          <div style={{ display: 'flex', gap: 7 }}>
            {['on-site', 'scheduled', 'remote'].map((s) => {
              const sm = SM[s] || {};
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 700,
                    border:
                      status === s
                        ? `2px solid ${sm.color || C.blue}`
                        : `1px solid ${C.border}`,
                    background:
                      status === s ? sm.bg || C.blueDim : 'transparent',
                    color: status === s ? sm.color || C.blue : C.muted,
                  }}
                >
                  {sm.label || s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button
          onClick={submit}
          style={{
            flex: 1,
            background: C.accent,
            color: '#000',
            border: 'none',
            padding: '12px 0',
            borderRadius: 8,
            fontFamily: F,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          ✓ Add Member
        </button>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            color: C.muted,
            border: `1px solid ${C.border}`,
            padding: '12px 16px',
            borderRadius: 8,
            fontFamily: F,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Price Tracking Page ───────────────────────────────────────────────────────
const MATERIALS = [
  {
    id: 'steel',
    name: 'Structural Steel',
    unit: 'per tonne',
    icon: '🔩',
    color: '#94a3b8',
    base: 780,
    seed: [770, 775, 768, 780, 792, 785, 780],
    desc: 'Hot-rolled structural sections (I-beams, channels)',
  },
  {
    id: 'concrete',
    name: 'Ready-Mix Concrete',
    unit: 'per m³',
    icon: '🏗',
    color: '#a78bfa',
    base: 95,
    seed: [90, 92, 91, 93, 96, 94, 95],
    desc: 'C30 standard grade, delivered to site',
  },
  {
    id: 'cement',
    name: 'Portland Cement',
    unit: 'per 50 kg bag',
    icon: '🪨',
    color: '#f59e0b',
    base: 28,
    seed: [27, 27.5, 28, 27.8, 28.5, 28, 28],
    desc: 'OPC Grade 42.5, bulk & bagged',
  },
  {
    id: 'copper',
    name: 'Copper',
    unit: 'per tonne',
    icon: '🔶',
    color: '#f97316',
    base: 9400,
    seed: [9100, 9250, 9200, 9400, 9500, 9450, 9400],
    desc: 'Copper cathode, LME grade A',
  },
  {
    id: 'aluminum',
    name: 'Aluminum',
    unit: 'per tonne',
    icon: '⬜',
    color: '#38bdf8',
    base: 2450,
    seed: [2350, 2380, 2400, 2420, 2460, 2450, 2450],
    desc: 'Primary aluminum ingot, LME',
  },
  {
    id: 'lumber',
    name: 'Construction Lumber',
    unit: 'per m³',
    icon: '🪵',
    color: '#84cc16',
    base: 420,
    seed: [400, 408, 410, 415, 425, 420, 420],
    desc: 'Structural softwood, graded timber',
  },
];

// Generates realistic-looking price history from a seed
function genHistory(mat, days = 30) {
  const pts = [];
  let price = mat.seed[0];
  const volatility = mat.base * 0.012;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    // use seed for last 7, then jitter backwards
    if (i < 7) {
      const si = 6 - i;
      price = mat.seed[si] + Math.sin(si * 1.7) * volatility * 0.3;
    } else {
      price += (Math.random() - 0.48) * volatility;
      price = Math.max(price, mat.base * 0.82);
    }
    pts.push({ label, price: Math.round(price * 100) / 100 });
  }
  return pts;
}

function SparkLine({ data, color, width = 220, height = 52 }) {
  if (!data || data.length < 2) return null;
  const prices = data.map((d) => d.price);
  const mn = Math.min(...prices),
    mx = Math.max(...prices);
  const range = mx - mn || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.price - mn) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');
  const areaBot = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    return `${x},${height}`;
  });
  const areaPath = `M ${pts
    .split(' ')
    .map((p, i) => (i === 0 ? `${p}` : `L${p}`))
    .join(' ')} L${areaBot[areaBot.length - 1]} L${areaBot[0]} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient
          id={`sg-${color.replace('#', '')}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* latest dot */}
      {(() => {
        const last = pts.split(' ').at(-1).split(',');
        return (
          <circle
            cx={last[0]}
            cy={last[1]}
            r="3.5"
            fill={color}
            stroke="#1e2333"
            strokeWidth="2"
          />
        );
      })()}
    </svg>
  );
}

function PriceCard({ mat, history, aiAnalysis, onAnalyse, analysing }) {
  const [expanded, setExpanded] = useState(false);
  const latest = history[history.length - 1]?.price || mat.base;
  const prev = history[history.length - 8]?.price || mat.base; // ~1 week ago
  const prev1 = history[history.length - 2]?.price || mat.base; // yesterday
  const dayChg = latest - prev1;
  const dayPct = (dayChg / prev1) * 100;
  const wkChg = latest - prev;
  const wkPct = (wkChg / prev) * 100;
  const up = dayChg >= 0;
  const trendColor = Math.abs(dayPct) < 0.3 ? '#7a849e' : up ? C.green : C.red;

  return (
    <div
      style={{
        background: '#1e2333',
        border: `1px solid ${expanded ? mat.color + '55' : '#2a3045'}`,
        borderRadius: 14,
        padding: '20px 22px',
        transition: 'border-color .2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: mat.color + '22',
            border: `1px solid ${mat.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {mat.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#e8eaf0',
              fontFamily: F,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {mat.name}
          </div>
          <div
            style={{
              color: '#7a849e',
              fontFamily: F,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            {mat.desc}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              color: '#e8eaf0',
              fontFamily: F,
              fontWeight: 700,
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            $
            {latest.toLocaleString('en-US', {
              minimumFractionDigits: latest < 100 ? 2 : 0,
              maximumFractionDigits: latest < 100 ? 2 : 0,
            })}
          </div>
          <div
            style={{
              color: '#7a849e',
              fontFamily: F,
              fontSize: 10,
              marginTop: 2,
            }}
          >
            {mat.unit}
          </div>
        </div>
      </div>

      {/* Spark + changes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <SparkLine data={history} color={mat.color} width={200} height={52} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            flexShrink: 0,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#7a849e', fontFamily: F, fontSize: 10 }}>
              24h
            </span>
            <span
              style={{
                color: trendColor,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {up ? '▲' : '▼'} {Math.abs(dayPct).toFixed(2)}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#7a849e', fontFamily: F, fontSize: 10 }}>
              7d
            </span>
            <span
              style={{
                color: wkChg >= 0 ? '#22c55e' : '#ef4444',
                fontFamily: F,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {wkChg >= 0 ? '▲' : '▼'} {Math.abs(wkPct).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 30-day range bar */}
      {(() => {
        const mn = Math.min(...history.map((d) => d.price)),
          mx = Math.max(...history.map((d) => d.price));
        const pct = ((latest - mn) / (mx - mn || 1)) * 100;
        return (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <span style={{ color: '#7a849e', fontFamily: F, fontSize: 10 }}>
                30d Low $
                {mn.toLocaleString('en-US', {
                  maximumFractionDigits: latest < 100 ? 2 : 0,
                })}
              </span>
              <span style={{ color: '#7a849e', fontFamily: F, fontSize: 10 }}>
                30d High $
                {mx.toLocaleString('en-US', {
                  maximumFractionDigits: latest < 100 ? 2 : 0,
                })}
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: '#2a3045',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: `linear-gradient(90deg,${mat.color}99,${mat.color})`,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        );
      })()}

      {/* AI analysis toggle */}
      <div>
        <button
          onClick={() => {
            if (!aiAnalysis && !analysing) onAnalyse(mat.id);
            setExpanded((v) => !v);
          }}
          style={{
            background: 'transparent',
            color: analysing ? '#a78bfa' : '#7a849e',
            border: `1px solid ${analysing ? '#a78bfa44' : '#2a3045'}`,
            borderRadius: 6,
            padding: '6px 14px',
            fontFamily: F,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a78bfa';
            e.currentTarget.style.borderColor = '#a78bfa44';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = analysing ? '#a78bfa' : '#7a849e';
            e.currentTarget.style.borderColor = analysing
              ? '#a78bfa44'
              : '#2a3045';
          }}
        >
          {analysing ? (
            <>
              <div
                style={{
                  width: 10,
                  height: 10,
                  border: '2px solid #a78bfa',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin .7s linear infinite',
                }}
              />
              Analysing…
            </>
          ) : (
            <>🤖 {expanded && aiAnalysis ? 'Hide' : 'AI Buying Insight'}</>
          )}
        </button>
        {expanded && aiAnalysis && (
          <div
            style={{
              marginTop: 10,
              background: '#181c27',
              border: '1px solid #a78bfa33',
              borderRadius: 8,
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                color: '#a78bfa',
                fontFamily: F,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              🤖 AI Buying Insight — {mat.name}
            </div>
            <div
              style={{
                color: '#c4cae0',
                fontFamily: F,
                fontSize: 12,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {aiAnalysis}
            </div>
          </div>
        )}
      </div>

      {/* Last updated */}
      <div
        style={{ color: '#7a849e', fontFamily: F, fontSize: 10, marginTop: -8 }}
      >
        Updated{' '}
        {new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}

function PriceTrackingPage() {
  const [histories] = useState(() => {
    const h = {};
    MATERIALS.forEach((m) => {
      h[m.id] = genHistory(m, 30);
    });
    return h;
  });
  const [analyses, setAnalyses] = useState({});
  const [analysing, setAnalysing] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedView, setSelectedView] = useState('grid'); // grid | table

  const requestAnalysis = async (matId) => {
    setAnalysing((p) => ({ ...p, [matId]: true }));
    const mat = MATERIALS.find((m) => m.id === matId);
    const hist = histories[matId];
    const latest = hist[hist.length - 1].price;
    const prev7 = hist[hist.length - 8].price;
    const wkChg = (((latest - prev7) / prev7) * 100).toFixed(2);
    const mn = Math.min(...hist.map((d) => d.price)).toFixed(2);
    const mx = Math.max(...hist.map((d) => d.price)).toFixed(2);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are a construction procurement advisor. Analyse this material price data and give a concise buying recommendation (3–5 sentences):

Material: ${mat.name} (${mat.unit})
Current price: $${latest.toLocaleString()}
7-day change: ${wkChg}%
30-day low: $${mn} | 30-day high: $${mx}
Context: GCC construction market (UAE/Saudi Arabia focus)

Provide: 1) Market trend assessment, 2) Whether to buy now / wait / stockpile, 3) One practical tip for contractors. Be direct and specific. No markdown headers.`,
            },
          ],
        }),
      });
      const data = await res.json();
      const txt =
        data.content
          ?.filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('') || 'Analysis unavailable.';
      setAnalyses((p) => ({ ...p, [matId]: txt }));
    } catch (e) {
      setAnalyses((p) => ({
        ...p,
        [matId]:
          'Unable to load AI analysis. Check your connection and try again.',
      }));
    }
    setAnalysing((p) => ({ ...p, [matId]: false }));
  };

  // Overall market sentiment
  const sentiments = MATERIALS.map((m) => {
    const h = histories[m.id];
    const l = h[h.length - 1].price,
      p = h[h.length - 2].price;
    return l >= p ? 1 : -1;
  });
  const bullCount = sentiments.filter((s) => s > 0).length;

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              color: '#e8eaf0',
              fontSize: 22,
              fontFamily: F,
              fontWeight: 700,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            📈 Material Price Tracking
          </h2>
          <div
            style={{
              color: '#7a849e',
              fontFamily: F,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Live construction material prices for the GCC market · Updated{' '}
            {lastRefresh.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Market sentiment pill */}
          <div
            style={{
              background: bullCount >= 3 ? '#22c55e1a' : '#ef44441a',
              border: `1px solid ${bullCount >= 3 ? '#22c55e44' : '#ef444444'}`,
              borderRadius: 8,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <span style={{ fontSize: 14 }}>{bullCount >= 3 ? '📈' : '📉'}</span>
            <span
              style={{
                color: bullCount >= 3 ? '#22c55e' : '#ef4444',
                fontFamily: F,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {bullCount >= 3 ? 'Market Rising' : 'Market Declining'}
            </span>
            <span style={{ color: '#7a849e', fontFamily: F, fontSize: 11 }}>
              {bullCount}/{MATERIALS.length} up today
            </span>
          </div>
          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              background: '#181c27',
              border: '1px solid #2a3045',
              borderRadius: 7,
              padding: 3,
              gap: 2,
            }}
          >
            {[
              ['grid', '⊞ Cards'],
              ['table', '☰ Table'],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setSelectedView(v)}
                style={{
                  background: selectedView === v ? '#f59e0b1a' : 'transparent',
                  color: selectedView === v ? '#f59e0b' : '#7a849e',
                  border:
                    selectedView === v
                      ? '1px solid #f59e0b44'
                      : '1px solid transparent',
                  borderRadius: 5,
                  padding: '6px 14px',
                  fontFamily: F,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={() => setLastRefresh(new Date())}
            style={{
              background: 'transparent',
              color: '#7a849e',
              border: '1px solid #2a3045',
              borderRadius: 7,
              padding: '7px 14px',
              fontFamily: F,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e8eaf0';
              e.currentTarget.style.borderColor = '#f59e0b44';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#7a849e';
              e.currentTarget.style.borderColor = '#2a3045';
            }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* Summary stats strip */}
      <div
        style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}
      >
        {MATERIALS.map((m) => {
          const h = histories[m.id];
          const l = h[h.length - 1].price,
            p = h[h.length - 2].price;
          const chg = ((l - p) / p) * 100;
          return (
            <div
              key={m.id}
              style={{
                flex: 1,
                minWidth: 100,
                background: '#1e2333',
                border: `1px solid ${chg >= 0 ? '#22c55e22' : '#ef444422'}`,
                borderRadius: 9,
                padding: '10px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                <span
                  style={{
                    color: '#7a849e',
                    fontFamily: F,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {m.name.split(' ')[0].toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  color: '#e8eaf0',
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                $
                {l.toLocaleString('en-US', {
                  maximumFractionDigits: l < 100 ? 2 : 0,
                })}
              </div>
              <div
                style={{
                  color: chg >= 0 ? '#22c55e' : '#ef4444',
                  fontFamily: F,
                  fontSize: 11,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {chg >= 0 ? '▲' : '▼'}
                {Math.abs(chg).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid view */}
      {selectedView === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
            gap: 16,
          }}
        >
          {MATERIALS.map((m) => (
            <PriceCard
              key={m.id}
              mat={m}
              history={histories[m.id]}
              aiAnalysis={analyses[m.id]}
              onAnalyse={requestAnalysis}
              analysing={!!analysing[m.id]}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {selectedView === 'table' && (
        <div
          style={{
            background: '#1e2333',
            border: '1px solid #2a3045',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: F,
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#181c27',
                  borderBottom: '1px solid #2a3045',
                }}
              >
                {[
                  'Material',
                  'Current Price',
                  '24h Change',
                  '7d Change',
                  '30d Low',
                  '30d High',
                  'Trend',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: '#7a849e',
                      fontWeight: 700,
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATERIALS.map((m, mi) => {
                const h = histories[m.id];
                const l = h[h.length - 1].price,
                  p1 = h[h.length - 2].price,
                  p7 = h[h.length - 8].price;
                const mn = Math.min(...h.map((d) => d.price)),
                  mx = Math.max(...h.map((d) => d.price));
                const d1 = ((l - p1) / p1) * 100,
                  d7 = ((l - p7) / p7) * 100;
                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom:
                        mi < MATERIALS.length - 1
                          ? '1px solid #2a304522'
                          : 'none',
                    }}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 7,
                            background: m.color + '22',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        >
                          {m.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              color: '#e8eaf0',
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {m.name}
                          </div>
                          <div
                            style={{
                              color: '#7a849e',
                              fontSize: 10,
                              marginTop: 1,
                            }}
                          >
                            {m.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: '#e8eaf0',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      $
                      {l.toLocaleString('en-US', {
                        minimumFractionDigits: l < 100 ? 2 : 0,
                        maximumFractionDigits: l < 100 ? 2 : 0,
                      })}
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: d1 >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                      }}
                    >
                      {d1 >= 0 ? '▲' : '▼'}
                      {Math.abs(d1).toFixed(2)}%
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: d7 >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                      }}
                    >
                      {d7 >= 0 ? '▲' : '▼'}
                      {Math.abs(d7).toFixed(2)}%
                    </td>
                    <td style={{ padding: '13px 16px', color: '#7a849e' }}>
                      $
                      {mn.toLocaleString('en-US', {
                        maximumFractionDigits: l < 100 ? 2 : 0,
                      })}
                    </td>
                    <td style={{ padding: '13px 16px', color: '#7a849e' }}>
                      $
                      {mx.toLocaleString('en-US', {
                        maximumFractionDigits: l < 100 ? 2 : 0,
                      })}
                    </td>
                    <td style={{ padding: '13px 16px', minWidth: 160 }}>
                      <SparkLine
                        data={h.slice(-14)}
                        color={m.color}
                        width={140}
                        height={36}
                      />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <button
                        onClick={() => {
                          requestAnalysis(m.id);
                        }}
                        disabled={!!analysing[m.id]}
                        style={{
                          background: '#a78bfa1a',
                          color: '#a78bfa',
                          border: '1px solid #a78bfa33',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontFamily: F,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: analysing[m.id] ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {analysing[m.id] ? '…' : '🤖 Analyse'}
                      </button>
                      {analyses[m.id] && (
                        <div
                          style={{
                            marginTop: 8,
                            background: '#181c27',
                            border: '1px solid #a78bfa22',
                            borderRadius: 7,
                            padding: '8px 10px',
                            maxWidth: 260,
                          }}
                        >
                          <div
                            style={{
                              color: '#c4cae0',
                              fontFamily: F,
                              fontSize: 11,
                              lineHeight: 1.6,
                            }}
                          >
                            {analyses[m.id].slice(0, 220)}
                            {analyses[m.id].length > 220 ? '…' : ''}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer note */}
      <div
        style={{
          marginTop: 20,
          padding: '12px 16px',
          background: '#1e2333',
          border: '1px solid #2a3045',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>ℹ️</span>
        <span style={{ color: '#7a849e', fontFamily: F, fontSize: 11 }}>
          Prices are indicative market data for the GCC construction sector.
          Verify current rates with your suppliers before making purchasing
          decisions. AI insights are advisory only.
        </span>
      </div>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'projects', label: 'Projects', icon: '🏗' },

  { id: 'invoicing', label: 'Invoices', icon: '💳' },
  { id: 'payments', label: 'Payments', icon: '💰' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'tenders', label: 'Tenders', icon: '📦' },
  { id: 'reports', label: 'Report Generator', icon: '📊' },
  { id: 'prices', label: 'Price Tracking', icon: '📈' },
];

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

function AppInner() {
  const { theme, isDark, toggleTheme } = useTheme();
  ThemeRef.current = theme;
  const [tab, setTab] = useState('projects');
  const [project, setProject] = useState(null);
  const [subView, setSubView] = useState('list');
  const [teamLog, setTeamLog] = useState([]);
  const { tasks, addTask, updateTask, removeTask } = useTasks();
  const { allProjects, addProject, updateProject, deleteProject } =
    useProjects();
  const { log: globalLog, push: pushGlobal } = useGlobalLog();
  const { payments, addPayment, removePayment, updatePayment } = usePayments();
  // ── Lifted global invoices so ALL sections share one source of truth ──
  const {
    allInvoices,
    ready: invReady,
    addInvoice,
    updateInvoice,
    removeInvoice,
  } = useGlobalInvoices();

  const goToDetail = (p) => {
    setProject(p);
    setSubView('detail');
    setTab('projects');
  };
  const goToTeam = () => setSubView('team');
  const teamBack = (dest) => {
    if (dest === 'projects') {
      setSubView('list');
      setProject(null);
    } else setSubView('detail');
  };
  const detailBack = () => {
    setSubView('list');
    setProject(null);
  };
  const switchTab = (id) => {
    setTab(id);
    if (id !== 'projects') {
      setProject(null);
      setSubView('list');
    }
  };
  const handleTeamLog = (action, icon, projName) => {
    const entry = {
      id: Date.now(),
      action,
      detail: projName || action,
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon,
    };
    setTeamLog((prev) => [entry, ...prev]);
    pushGlobal(entry);
  };

  // Wrapped addPayment that also logs to global log
  const handleAddPayment = async (p) => {
    addPayment(p);
    await pushGlobal({
      id: Date.now(),
      action: `Payment $${Number(p.amount).toLocaleString()} recorded`,
      detail: p.project,
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: '💰',
    });
  };
  const handleUpdatePayment = async (id, patch) => {
    updatePayment(id, patch);
    await pushGlobal({
      id: Date.now(),
      action: `Payment $${Number(patch.amount || 0).toLocaleString()} updated`,
      detail: patch.project || '',
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: 'Edit',
    });
  };
  const handleRemovePayment = async (id) => {
    const p = payments.find((x) => x.id === id);
    removePayment(id);
    if (p)
      await pushGlobal({
        id: Date.now(),
        action: `Payment $${Number(p.amount || 0).toLocaleString()} deleted`,
        detail: p.project || '',
        user: 'Jordan Blake',
        time: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        icon: 'Del',
      });
  };
  // Wrapped addInvoice that also logs to global log
  const handleAddInvoice = async (inv) => {
    await addInvoice(inv);
    await pushGlobal({
      id: Date.now(),
      action: `Invoice ${inv.invId || inv.id} added`,
      detail: `${inv.project || ''} · $${Number(
        inv.amount || 0
      ).toLocaleString()}`,
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: '🧾',
    });
  };
  const handleUpdateInvoice = async (id, patch) => {
    await updateInvoice(id, patch);
    await pushGlobal({
      id: Date.now(),
      action: `Invoice ${id} edited`,
      detail: patch.project || '',
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: 'Edit',
    });
  };
  const handleRemoveInvoice = async (id) => {
    await removeInvoice(id);
    await pushGlobal({
      id: Date.now(),
      action: `Invoice ${id} deleted`,
      detail: '',
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: 'Del',
    });
  };

  const handleAddProject = async (proj) => {
    addProject(proj);
    await pushGlobal({
      id: Date.now(),
      action: `Project "${proj.name}" created`,
      detail: proj.name,
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: '🏗',
    });
  };
  const handleUpdateProject = async (id, patch) => {
    await updateProject(id, patch);
    const p = allProjects.find((x) => x.id === id);
    await pushGlobal({
      id: Date.now(),
      action: `Project "${p?.name || id}" updated`,
      detail: p?.name || '',
      user: 'Jordan Blake',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: 'Edit',
    });
  };

  const handleDeleteProject = async (proj) => {
    const ts = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    // 1. Remove all payments linked to this project
    const linkedPayments = payments.filter(
      (p) => p.projId === proj.id || p.project === proj.name
    );
    for (const p of linkedPayments) {
      removePayment(p.id);
    }
    // 2. Remove all dynamic invoices linked to this project
    const linkedInvoices = allInvoices.filter(
      (i) => !i._static && (i.projId === proj.id || i.project === proj.name)
    );
    for (const i of linkedInvoices) {
      await removeInvoice(i.id);
    }
    // 3. Remove tasks linked to this project
    const linkedTasks = tasks.filter(
      (t) => t.projId === proj.id || t.project === proj.name
    );
    for (const t of linkedTasks) {
      removeTask(t.id);
    }
    // 4. Delete the project itself
    await deleteProject(proj.id);
    // 5. If we're currently viewing this project, go back to list
    if (project && project.id === proj.id) {
      setProject(null);
      setSubView('list');
    }
    // 6. Log the deletion
    await pushGlobal({
      id: Date.now(),
      action: `Project "${proj.name}" deleted`,
      detail: proj.name,
      user: 'Jordan Blake',
      time: ts,
      icon: 'Del',
    });
  };

  const projectMilestoneEvents = useMemo(() => {
    const evts = [];
    allProjects.forEach((p) => {
      if (p.startDateISO)
        evts.push({
          id: `pstart-${p.id}`,
          type: 'project',
          date: p.startDateISO,
          title: `${p.name} starts`,
          subtitle: p.client?.name || '',
          color: C.green,
          detail: p,
        });
      if (p.due)
        evts.push({
          id: `pend-${p.id}`,
          type: 'project',
          date: p.due,
          title: `${p.name} due`,
          subtitle: p.client?.name || '',
          color: C.purple,
          detail: p,
        });
    });
    return evts;
  }, [allProjects, theme]);

  const screen = () => {
    if (tab === 'projects') {
      if (subView === 'team' && project)
        return (
          <TeamPage
            project={project}
            onBack={teamBack}
            onAddToLog={handleTeamLog}
            tasks={tasks}
            updateTask={updateTask}
          />
        );
      if (subView === 'detail' && project)
        return (
          <ProjectPage
            project={project}
            onBack={detailBack}
            onOpenTeam={goToTeam}
            extraLog={[
              ...teamLog,
              ...globalLog.filter((e) => e.detail === project.name),
            ]}
            payments={payments}
            addPayment={handleAddPayment}
            updatePayment={handleUpdatePayment}
            removePayment={handleRemovePayment}
            allProjects={allProjects}
            allInvoices={allInvoices}
            addInvoice={handleAddInvoice}
            onUpdateProject={async (id, patch) => {
              await handleUpdateProject(id, patch);
              setProject((p) => ({ ...p, ...patch }));
            }}
            onLog={pushGlobal}
          />
        );
      return (
        <ProjectsList
          onSelect={goToDetail}
          allProjects={allProjects}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />
      );
    }
    if (tab === 'dashboard')
      return (
        <Dashboard
          onSelect={goToDetail}
          allProjects={allProjects}
          allInvoices={allInvoices}
          payments={payments}
          tasks={tasks}
          globalLog={globalLog}
        />
      );
    if (tab === 'invoicing')
      return (
        <InvoicingPage
          allProjects={allProjects}
          allInvoices={allInvoices}
          addInvoice={handleAddInvoice}
          updateInvoice={handleUpdateInvoice}
          removeInvoice={handleRemoveInvoice}
        />
      );
    if (tab === 'team')
      return <TeamGlobal allProjects={allProjects} onLog={pushGlobal} />;
    if (tab === 'calendar')
      return (
        <CalendarPage
          allInvoices={allInvoices}
          tasks={tasks}
          onAddTask={addTask}
          projectEvents={projectMilestoneEvents}
          payments={payments}
          allProjects={allProjects}
        />
      );
    if (tab === 'tasks')
      return (
        <TasksPage
          tasks={tasks}
          addTask={addTask}
          updateTask={updateTask}
          removeTask={removeTask}
          allProjects={allProjects}
        />
      );
    if (tab === 'tenders') return <TendersPage allProjects={allProjects} />;
    if (tab === 'payments')
      return (
        <PaymentsPage
          payments={payments}
          allProjects={allProjects}
          addPayment={handleAddPayment}
          allInvoices={allInvoices}
          removePayment={handleRemovePayment}
          updatePayment={handleUpdatePayment}
        />
      );
    if (tab === 'reports')
      return <ReportPage tasks={tasks} allProjects={allProjects} />;
    if (tab === 'prices') return <PriceTrackingPage />;
    return (
      <div
        style={{
          color: C.muted,
          fontFamily: F,
          fontSize: 14,
          padding: '40px 0',
          textAlign: 'center',
        }}
      >
        🚧 Coming soon…
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: C.bg,
        fontFamily: F,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${
          isDark ? '#2a3045' : '#c8cdd8'
        };border-radius:3px}
        select option{background:${theme.card};color:${theme.text}}
        input[type="date"]{color-scheme:${isDark ? 'dark' : 'light'}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
      `}</style>

      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '22px 18px 18px',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: C.accent,
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                BuildFlow
              </div>
              <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                Pro Plan
              </div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => switchTab(n.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 3,
                background: tab === n.id ? C.accentDim : 'transparent',
                border:
                  tab === n.id
                    ? `1px solid ${C.accentMid}`
                    : '1px solid transparent',
                color: tab === n.id ? C.accent : C.muted,
                fontFamily: F,
                fontSize: 13,
                fontWeight: tab === n.id ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .15s',
              }}
            >
              <Icon
                d={ICONS[n.iconKey]}
                size={15}
                stroke={tab === n.id ? C.accent : C.muted}
              />
              {n.label}
            </button>
          ))}
        </nav>
        <div
          style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}` }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              background: C.accentDim,
              border: `1px solid ${C.accentMid}`,
              cursor: 'pointer',
              marginBottom: 12,
              transition: 'all .2s',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</span>
            <span
              style={{
                color: C.accent,
                fontFamily: F,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: C.blueDim,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.blue,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              JB
            </div>
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Jordan Blake
              </div>
              <div style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>
                Owner
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 30px' }}>
        {screen()}
      </div>
    </div>
  );
}
