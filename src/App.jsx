// @ts-nocheck
import { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react'
import { initDb, dbProjects, dbInvoices, dbPayments, dbTasks, dbTeam, dbTenders, dbLog, dbProfiles, dbNotes, mapInvoice, mapPayment, mapTask, mapProject, mapMember, mapTender, mapLog } from './db.js'


import React from 'react';

// ─── SVG Icon System ───────────────────────────────────────────────────────────
const Icon = ({ d, size=16, stroke="#7a849e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const ICONS = {
  dashboard:  "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  projects:   "M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5",
  estimates:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  invoicing:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-6 4h4",
  payments:   "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  team:       "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 4v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  calendar:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  tasks:      "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  tenders:    "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 7l8-4 8 4",
  reports:    "M18 20V10M12 20V4M6 20v-6",
  prices:     "M3 17l4-8 4 4 4-6 4 10M3 21h18",
};


const Ic = {
  Edit:    ({size=14,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Delete:  ({size=14,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Close:   ({size=14,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={style}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:   ({size=14,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:    ({size=14,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={style}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  File:    ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Image:   ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Attach:  ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  Bot:     ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  Folder:  ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Plan:    ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Phone:   ({size=14,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Email:   ({size=14,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Warning: ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Receipt: ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/><line x1="11" y1="16" x2="8" y2="16"/></svg>,
  Photo:   ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Note:    ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  // ── Nav icons ─────────────────────────────────────────────────────────────────
  Dashboard: ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Projects:  ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5"/></svg>,
  Invoices:  ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  Payments:  ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Team:      ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Calendar:  ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Tasks:     ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Tenders:   ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  Reports:   ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Prices:    ({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Accountant:({size=16,color="currentColor",style={}})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/><line x1="11" y1="16" x2="8" y2="16"/></svg>,
};

// ─── Storage wrapper ───────────────────────────────────────────────────────────
const storage = {
  get: async (key) => { try { const v = localStorage.getItem(key); return v ? { value: v } : null; } catch(_){ return null; } },
  set: async (key, val) => { try { localStorage.setItem(key, val); } catch(_){} },
};

// ─── Theme tokens ──────────────────────────────────────────────────────────────
const DARK_THEME = {
  bg:"#0f1117", surface:"#181c27", card:"#1e2333", border:"#2a3045",
  accent:"#f59e0b", accentDim:"#f59e0b1a", accentMid:"#f59e0b44",
  text:"#e8eaf0", muted:"#7a849e",
  green:"#22c55e", greenDim:"#22c55e1a",
  red:"#ef4444",   redDim:"#ef44441a",
  blue:"#3b82f6",  blueDim:"#3b82f61a",
  purple:"#a78bfa",purpleDim:"#a78bfa1a",
  overlay:"rgba(10,12,20,0.82)",
  isDark:true,
};
const LIGHT_THEME = {
  bg:"#f0f2f7", surface:"#ffffff", card:"#ffffff", border:"#dde1eb",
  accent:"#d97706", accentDim:"#d977061a", accentMid:"#d9770644",
  text:"#111827", muted:"#6b7280",
  green:"#16a34a", greenDim:"#16a34a1a",
  red:"#dc2626",   redDim:"#dc26261a",
  blue:"#2563eb",  blueDim:"#2563eb1a",
  purple:"#7c3aed",purpleDim:"#7c3aed1a",
  overlay:"rgba(17,24,39,0.6)",
  isDark:false,
};

// Mutable ref so non-component helpers (SM, INP, LBL) can always read current theme
const ThemeRef = { current: DARK_THEME };
// C is a proxy that always reads from ThemeRef — works everywhere
const C = new Proxy({}, { get:(_,k)=>ThemeRef.current[k] });

// ─── Shared input / label style helpers ───────────────────────────────────────
// These are functions so they always read the live C proxy value at render time.
// Usage: style={INP()} or style={{ ...INP(), extraProp:val }}
const INP = () => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  padding: "9px 12px",
  color: C.text,
  fontFamily: F,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
});
const LBL = () => ({
  color: C.muted,
  fontFamily: F,
  fontSize: 11,
  fontWeight: 700,
  display: "block",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});
const SM = {
  "on-site":  { color:"#22c55e", bg:"#22c55e1a", label:"On Site"   },
  "remote":   { color:"#3b82f6", bg:"#3b82f61a", label:"Remote"    },
  "off":      { color:"#7a849e", bg:"#7a849e1a", label:"Off"        },
  "pending":  { color:"#f59e0b", bg:"#f59e0b1a", label:"Pending"   },
  "done":     { color:"#22c55e", bg:"#22c55e1a", label:"Done"       },
  "active":   { color:"#22c55e", bg:"#22c55e1a", label:"Active"     },
  "quoting":  { color:"#3b82f6", bg:"#3b82f61a", label:"Quoting"   },
  "completed":{ color:"#7a849e", bg:"#7a849e1a", label:"Completed" },
  "paid":     { color:"#22c55e", bg:"#22c55e1a", label:"Paid"       },
  "overdue":  { color:"#ef4444", bg:"#ef44441a", label:"Overdue"   },
};

const ThemeCtx = React.createContext({ theme:DARK_THEME, toggleTheme:()=>{} });
function useTheme(){ return React.useContext(ThemeCtx); }

function ThemeProvider({ children }){
  const [isDark,setIsDark]=useState(()=>{
    try{ const s=localStorage.getItem("bf_theme"); return s?s==="dark":true; }catch{ return true; }
  });
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  // keep ThemeRef in sync so C proxy works in non-hook contexts
  ThemeRef.current = theme;
  const toggleTheme=()=>{
    const next=!isDark; setIsDark(next);
    try{ localStorage.setItem("bf_theme",next?"dark":"light"); }catch{}
  };
  return <ThemeCtx.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeCtx.Provider>;
}

// ─── Global Currency System ───────────────────────────────────────────────────
const CURRENCIES = ["AED","USD","SAR","EUR","GBP","QAR","KWD","BHD","OMR"];
const CUR_SYMBOLS = { AED:"AED",USD:"$",SAR:"SAR",EUR:"€",GBP:"£",QAR:"QAR",KWD:"KWD",BHD:"BHD",OMR:"OMR" };
const CurrencyCtx = React.createContext({ currency:"AED", setCurrency:()=>{} });
function useCurrencyCtx(){ return React.useContext(CurrencyCtx); }
function CurrencyProvider({ children }){
  const [currency,setCurrencyState] = React.useState(()=>{
    try{ return localStorage.getItem("bf:currency")||"AED"; }catch{ return "AED"; }
  });
  const setCurrency=(c)=>{ setCurrencyState(c); try{ localStorage.setItem("bf:currency",c); }catch{} };
  return <CurrencyCtx.Provider value={{ currency,setCurrency }}>{children}</CurrencyCtx.Provider>;
}
// Format a number with any currency — prefix symbol or code based on region
function fmtCur(n, cur="AED", dec=2){
  const s = CUR_SYMBOLS[cur]||cur;
  const v = Number(n||0).toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});
  return ["$","€","£"].includes(s) ? s+v : s+" "+v;
}
function fmtCurS(n, cur="AED"){ return fmtCur(n, cur, 0); }

// Unified invoice number generator — always sequential across the whole system
function nextInvId(allInvoices=[]){
  const max = Math.max(0, ...allInvoices.map(i=>{
    return parseInt(String(i.id||i.invId||"").replace(/[^0-9]/g,""))||0;
  }));
  return "INV-"+String(max+1).padStart(3,"0");
}

const F = `'Inter','Segoe UI',sans-serif`;
const ROLES = ["Site Manager","Project Manager","Engineer","Architect","Foreman","Electrician","Plumber","Carpenter","Mason","Welder","Surveyor","Safety Officer","Supervisor","Quantity Surveyor","Laborer","Driver","Other"];

// ─── SLabel: section label component used in report & tender panels ───────────
const SLabel = ({ children }) => (
  <div style={{ color:C.muted, fontFamily:F, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
    {children}
  </div>
);

// ─── Static Data ───────────────────────────────────────────────────────────────
const PROJECTS = [];
const PROJ_INV = {};
const ALL_INV_STATIC = [];
const PROJ_CREW_SEED = {};
const PROJ_LOGS_SEED = {};
const PROJ_NOTES_SEED = {};
const TASKS_SEED = [];
const TENDERS_SEED = [];

// ─── Global Utility Functions ──────────────────────────────────────────────────

/** Days in a given month (0-indexed month) */
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/** 0-indexed weekday (0=Sun) of the 1st of the month */
const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

/** True if date string `d` falls between ISO strings `from` and `to` (inclusive) */
const inRange = (d, from, to) => {
  if (!d) return false;
  try { return d >= from && d <= to; } catch { return false; }
};

/** Format bytes as human-readable string */
const fmtBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/** Format ISO date string as "Jan 1, 2025" — safe, never throws */
const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
  catch { return iso; }
};

/** How many days remain until project.due (null if no due date) */
const daysRemaining = (project) => {
  if (!project?.due) return null;
  try {
    const due = new Date(project.due + 'T12:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((due - now) / (1000 * 60 * 60 * 24));
  } catch { return null; }
};

/** Project progress: use stored progress or derive from status */
const calcProgress = (project) => {
  if (project?.progress != null && project.progress >= 0) return Number(project.progress) || 0;
  const map = { quoting:0, active:45, 'on-hold':30, completed:100 };
  return map[project?.status] ?? 0;
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_LONG  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


// ─── Context ──────────────────────────────────────────────────────────────────
const CompanyCtx = React.createContext(null);
const useCompany = () => useContext(CompanyCtx);

// ─── Polling interval for real-time sync (ms) ─────────────────────────────────
const POLL_MS = 15000;

// ─── useFiles: kept for legacy plan/photo uploads (localStorage only) ─────────
function useFiles(key){
  const [files,setFiles]=useState([]); const [ready,setReady]=useState(false);
  useEffect(()=>{ let alive=true; (async()=>{ try{ const r=await storage.get(key); if(alive)setFiles(r?JSON.parse(r.value):[]); }catch(_){ if(alive)setFiles([]); } if(alive)setReady(true); })(); return()=>{alive=false;};  },[key]);
  const persist=async(next)=>{ setFiles(next); await storage.set(key,JSON.stringify(next)); };
  return{ files,ready, add:f=>persist([...files,f]), remove:id=>persist(files.filter(f=>f.id!==id)), update:(id,p)=>persist(files.map(f=>f.id===id?{...f,...p}:f)) };
}

// ─── useTeam: Supabase-backed per-project team members ───────────────────────
function useTeam(projectId){
  const cid = useCompany();
  const [members,setMembers]=useState(null);
  const load=useCallback(async()=>{
    if(!cid||!projectId) return;
    const {data,error}=await dbTeam.getByProject(projectId);
    if(!error&&data) setMembers(data.map(mapMember));
  },[cid,projectId]);
  useEffect(()=>{ load(); const t=setInterval(load,POLL_MS); return()=>clearInterval(t); },[load]);
  return{
    members:members||[], ready:members!==null,
    addMember:   async(m)=>{ await dbTeam.add(m,projectId); load(); },
    removeMember:async(id)=>{ await dbTeam.delete(id); load(); },
    updateMember:async(id,patch)=>{ await dbTeam.update(id,patch); load(); },
  };
}

// ─── useTasks: Supabase-backed tasks ─────────────────────────────────────────
function useTasks(){
  const cid = useCompany();
  const [tasks,setTasks]=useState(null);
  const load=useCallback(async()=>{
    if(!cid) return;
    const {data,error}=await dbTasks.getAll();
    if(!error&&data) setTasks(data.map(mapTask));
  },[cid]);
  useEffect(()=>{ load(); const t=setInterval(load,POLL_MS); return()=>clearInterval(t); },[load]);
  return{
    tasks:tasks||[], ready:tasks!==null,
    addTask:   async(t)=>{ await dbTasks.add(t); load(); },
    removeTask:async(id)=>{ await dbTasks.delete(id); load(); },
    updateTask:async(id,p)=>{ await dbTasks.update(id,p); load(); },
  };
}

// ─── useTenders: Supabase-backed tenders ─────────────────────────────────────
function useTenders(){
  const cid = useCompany();
  const [tenders,setTenders]=useState(null);
  const load=useCallback(async()=>{
    if(!cid) return;
    const {data,error}=await dbTenders.getAll();
    if(!error&&data) setTenders(data.map(mapTender));
  },[cid]);
  useEffect(()=>{ load(); const t=setInterval(load,POLL_MS); return()=>clearInterval(t); },[load]);
  return{
    tenders:tenders||[], ready:tenders!==null,
    addTender:  async(t)=>{ await dbTenders.add(t); load(); },
    removeTender:async(id)=>{ await dbTenders.delete(id); load(); },
    addOffer:   async(tid,o)=>{ const ten=tenders?.find(t=>t.id===tid); if(ten){ await dbTenders.update(tid,{offers:[...ten.offers,o]}); load(); } },
    removeOffer:async(tid,oid)=>{ const ten=tenders?.find(t=>t.id===tid); if(ten){ await dbTenders.update(tid,{offers:ten.offers.filter(o=>o.id!==oid)}); load(); } },
  };
}

// ─── usePayments: Supabase-backed payments ───────────────────────────────────
function usePayments(){
  const cid = useCompany();
  const [payments,setPayments]=useState(null);
  const load=useCallback(async()=>{
    if(!cid) return;
    const {data,error}=await dbPayments.getAll();
    if(!error&&data) setPayments(data.map(mapPayment));
  },[cid]);
  useEffect(()=>{ load(); const t=setInterval(load,POLL_MS); return()=>clearInterval(t); },[load]);
  return{
    payments:payments||[], ready:payments!==null,
    addPayment:   async(p)=>{ await dbPayments.add(p); load(); },
    removePayment:async(id)=>{ await dbPayments.delete(id); load(); },
    updatePayment:async(id,patch)=>{ await dbPayments.update(id,patch); load(); },
  };
}

// ─── useProjects: Supabase-backed projects ───────────────────────────────────
function useProjects(){
  const cid = useCompany();
  const [projects,setProjects]=useState(null);
  const load=useCallback(async()=>{
    if(!cid) return;
    const {data,error}=await dbProjects.getAll();
    if(!error&&data) setProjects(data.map(mapProject));
  },[cid]);
  useEffect(()=>{ load(); const t=setInterval(load,POLL_MS); return()=>clearInterval(t); },[load]);
  return{
    allProjects:projects||[], extraProjects:projects||[], ready:projects!==null,
    addProject:   async(p)=>{ await dbProjects.add(p); load(); },
    updateProject:async(id,patch)=>{ await dbProjects.update(id,patch); load(); },
    deleteProject:async(id)=>{ await dbProjects.delete(id); load(); },
  };
}

// ─── useGlobalLog: Supabase-backed activity log ──────────────────────────────
function useGlobalLog(){
  const cid = useCompany();
  const [log,setLog]=useState(null);
  const load=useCallback(async()=>{
    if(!cid) return;
    const {data,error}=await dbLog.getRecent();
    if(!error&&data) setLog(data.map(mapLog));
  },[cid]);
  useEffect(()=>{ load(); const t=setInterval(load,POLL_MS); return()=>clearInterval(t); },[load]);
  const push=async(entry)=>{ await dbLog.push(entry.action||'',entry.detail||'',entry.icon||'●'); load(); };
  return{ log:log||[], push };
}

// ─── useAllMembers: all team members across all projects ─────────────────────
function useAllMembers(allProjects=[]){
  const cid = useCompany();
  const [members,setMembers]=useState([]);
  const [version,setVersion]=useState(0);
  const refresh=()=>setVersion(v=>v+1);
  useEffect(()=>{
    if(!cid) return;
    let alive=true;
    (async()=>{
      const {data,error}=await dbTeam.getAll();
      if(!error&&data&&alive){
        const seen=new Map();
        data.map(mapMember).forEach(m=>seen.set(m.name,m));
        setMembers([...seen.values()]);
      }
    })();
    return()=>{alive=false;};
  },[cid,allProjects,version]);
  return{ members, refresh };
}

// ─── DropZone ──────────────────────────────────────────────────────────────────
function DropZone({ onFiles,busy,label }){
  const [drag,setDrag]=useState(false); const ref=useRef();
  return(
    <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=Array.from(e.dataTransfer.files);if(f.length)onFiles(f);}}
      style={{ border:`2px dashed ${drag?C.accent:C.border}`,borderRadius:10,padding:"16px 20px",textAlign:"center",cursor:"pointer",background:drag?C.accentDim:"transparent",transition:"all .2s" }}>
      <div style={{ fontSize:22,marginBottom:4 }}>{busy?"...":"+"}</div>
      <div style={{ color:busy?C.accent:C.muted,fontFamily:F,fontSize:12 }}>{busy?"Uploading…":label||"Drop files here or click to browse"}</div>
      <input ref={ref} type="file" multiple style={{ display:"none" }} onChange={e=>{const f=Array.from(e.target.files);if(f.length)onFiles(f);e.target.value="";}}/>
    </div>
  );
}

// ─── Core UI Primitives ────────────────────────────────────────────────────────

/** Full-screen overlay backdrop. Click outside or press Esc to close. */
function Overlay({ children, onClose }){
  React.useEffect(()=>{
    const fn=(e)=>{ if(e.key==="Escape") onClose?.(); };
    window.addEventListener("keydown",fn);
    return()=>window.removeEventListener("keydown",fn);
  },[onClose]);
  return(
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose?.(); }}
      style={{ position:"fixed",inset:0,background:C.overlay,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",overflowY:"auto",padding:"20px 16px" }}>
      {children}
    </div>
  );
}

/** Reusable confirmation dialog */
function ConfirmDialog({ title,message,children,onConfirm,onCancel,confirmLabel="Confirm",variant="delete" }){
  const color = variant==="delete"?C.red : variant==="edit"?C.blue : C.accent;
  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:32,width:420,maxWidth:"95vw" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:10,background:color+"1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>
            {variant==="delete"?"🗑️":variant==="edit"?"✏️":"⚠️"}
          </div>
          <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>{title}</div>
        </div>
        {message&&<div style={{ color:C.muted,fontFamily:F,fontSize:13,lineHeight:1.6,marginBottom:16 }}>{message}</div>}
        {children&&<div style={{ marginBottom:16 }}>{children}</div>}
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"9px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ background:color,color:"#fff",border:"none",padding:"9px 20px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>{confirmLabel}</button>
        </div>
      </div>
    </Overlay>
  );
}

/** Coloured status badge pill */
function Badge({ status }){
  const map={
    "active":    {bg:C.greenDim,  color:C.green,  label:"Active"},
    "completed": {bg:C.surface,   color:C.muted,  label:"Completed"},
    "on-hold":   {bg:C.accentDim, color:C.accent, label:"On Hold"},
    "quoting":   {bg:C.blueDim,   color:C.blue,   label:"Quoting"},
    "on-site":   {bg:C.greenDim,  color:C.green,  label:"On Site"},
    "remote":    {bg:C.blueDim,   color:C.blue,   label:"Remote"},
    "pending":   {bg:C.accentDim, color:C.accent, label:"Pending"},
    "done":      {bg:C.greenDim,  color:C.green,  label:"Done"},
    "paid":      {bg:C.greenDim,  color:C.green,  label:"Paid"},
    "overdue":   {bg:C.redDim,    color:C.red,    label:"Overdue"},
    "draft":     {bg:C.surface,   color:C.muted,  label:"Draft"},
    "plan":      {bg:C.blueDim,   color:C.blue,   label:"Plan"},
    "contract":  {bg:C.purpleDim, color:C.purple, label:"Contract"},
    "receipt":   {bg:C.greenDim,  color:C.green,  label:"Receipt"},
  };
  const s=map[status]||{bg:C.surface,color:C.muted,label:status||"—"};
  return(
    <span style={{ background:s.bg,color:s.color,border:`1px solid ${s.color}33`,padding:"2px 8px",borderRadius:5,fontFamily:F,fontSize:11,fontWeight:700,whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
}

/** Horizontal progress bar */
function Bar({ pct=0, color }){
  const c = color||C.accent;
  const clamped = Math.max(0,Math.min(100,Number(pct)||0));
  return(
    <div style={{ height:6,borderRadius:4,background:C.border,overflow:"hidden" }}>
      <div style={{ height:"100%",width:`${clamped}%`,background:c,borderRadius:4,transition:"width .4s ease" }}/>
    </div>
  );
}

/** Inline panel form wrapper used inside project detail panels */
function InlineFormShell({ header,accent,saveLabel="Save",onSave,onCancel,err,saving,children }){
  return(
    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",marginBottom:16 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
        <span style={{ color:accent||C.accent,fontFamily:F,fontWeight:700,fontSize:15 }}>{header}</span>
        <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",lineHeight:1 }}>✕</button>
      </div>
      {children}
      {err&&<div style={{ color:C.red,fontFamily:F,fontSize:12,marginTop:10 }}>{err}</div>}
      <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"8px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
        <button onClick={onSave} disabled={saving} style={{ background:saving?"transparent":accent||C.accent,color:saving?accent||C.accent:"#000",border:saving?`1px solid ${accent||C.accent}44`:"none",padding:"8px 20px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>
          {saving?"Saving…":saveLabel}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SHARED DESIGN SYSTEM ─────────────────────────────────────────────────────
// These primitives govern ALL buttons, tables, cards, and empty states.
// Never write inline button styles in page components — use these.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * RowBtn — small action button for use inside table rows.
 * type: "edit" | "delete" | "view" | "receipt"
 */
function RowBtn({ type, onClick, children }){
  const cfg = {
    edit:    { bg:()=>C.blueDim,       color:()=>C.blue,  border:()=>`1px solid ${C.blue}44`,  label:"Edit",   icon:"✏️" },
    delete:  { bg:()=>"transparent",   color:()=>C.red,   border:()=>`1px solid ${C.red}33`,   label:"Delete", icon:null },
    view:    { bg:()=>"transparent",   color:()=>C.blue,  border:()=>`1px solid ${C.blue}33`,  label:"View",   icon:null },
    receipt: { bg:()=>C.greenDim,      color:()=>C.green, border:()=>`1px solid ${C.green}44`, label:"Receipt",icon:null },
  }[type]||{ bg:()=>C.surface, color:()=>C.muted, border:()=>`1px solid ${C.border}`, label:"", icon:null };
  return(
    <button onClick={onClick}
      style={{ background:cfg.bg(), color:cfg.color(), border:cfg.border(),
        padding:"4px 10px", borderRadius:6, fontFamily:F, fontSize:11, fontWeight:700,
        cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
      {cfg.icon&&<span style={{fontSize:10,lineHeight:1}}>{cfg.icon}</span>}
      {children||cfg.label}
    </button>
  );
}

/** Wrapper div that spaces a group of RowBtns consistently */
function RowActions({ children }){
  return <div style={{ display:"flex", gap:5, alignItems:"center" }}>{children}</div>;
}

/**
 * Btn — full-size button for page headers and modals.
 * variant: "primary" | "secondary" | "danger" | "success"
 */
function Btn({ onClick, disabled, variant="primary", color, size="md", children, style:xs={} }){
  const pad   = size==="sm"?"7px 14px":size==="lg"?"12px 28px":"10px 22px";
  const fs    = size==="sm"?12:size==="lg"?14:13;
  const bases = {
    primary:   ()=>({ background:color||C.accent,   color:"#000",    border:"none" }),
    secondary: ()=>({ background:C.surface,         color:C.text,    border:`1px solid ${C.border}` }),
    danger:    ()=>({ background:C.redDim,          color:C.red,     border:`1px solid ${C.red}33`  }),
    success:   ()=>({ background:C.green,           color:"#fff",    border:"none" }),
    ghost:     ()=>({ background:"transparent",     color:C.muted,   border:`1px solid ${C.border}` }),
  };
  const base = (bases[variant]||bases.primary)();
  const disabledStyle = disabled ? { background:"transparent", color:(color||C.accent), border:`1px solid ${(color||C.accent)}44` } : {};
  return(
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...disabledStyle, padding:pad, borderRadius:9, fontFamily:F, fontWeight:700,
        fontSize:fs, cursor:disabled?"default":"pointer", display:"inline-flex", alignItems:"center",
        gap:7, whiteSpace:"nowrap", ...xs }}>
      {children}
    </button>
  );
}

/** Metric stat card used in page header stat rows */
function StatCard({ label, value, sub, color }){
  return(
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"18px 22px", flex:1, minWidth:130 }}>
      <div style={{ color:C.muted, fontSize:11, fontFamily:F, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{label}</div>
      <div style={{ color:color||C.text, fontSize:26, fontFamily:F, fontWeight:700, lineHeight:1 }}>{value}</div>
      {sub&&<div style={{ color:C.muted, fontSize:12, fontFamily:F, marginTop:5 }}>{sub}</div>}
    </div>
  );
}

/** Consistent page-level header: title + subtitle + optional action button */
function PageHeader({ icon, title, subtitle, action }){
  return(
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
      <div>
        <h2 style={{ color:C.text, fontSize:22, fontFamily:F, fontWeight:700, margin:0 }}>{icon&&`${icon} `}{title}</h2>
        {subtitle&&<div style={{ color:C.muted, fontFamily:F, fontSize:12, marginTop:3 }}>{subtitle}</div>}
      </div>
      {action&&<div>{action}</div>}
    </div>
  );
}

/** Consistent empty state for tables and lists */
function EmptyState({ icon="📭", title="Nothing here yet", sub, style:xs={} }){
  return(
    <div style={{ padding:"52px 20px", textAlign:"center", color:C.muted, fontFamily:F, ...xs }}>
      {icon&&<div style={{ fontSize:36, marginBottom:10 }}>{icon}</div>}
      <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{title}</div>
      {sub&&<div style={{ fontSize:12 }}>{sub}</div>}
    </div>
  );
}

/** Standard table header cell style (use as style={TH()}) */
const TH = (extra={}) => ({ color:C.muted, fontWeight:700, padding:"12px 16px", textAlign:"left", fontSize:12, fontFamily:F, ...extra });

/** Standard table data cell style */
const TD = (extra={}) => ({ padding:"13px 16px", fontFamily:F, fontSize:13, ...extra });

/** Human-readable invoice number: prefers inv_id / invId over raw UUID */
const fmtInvId = (inv) => {
  const id = inv?.invId || inv?.iid || inv?.inv_id || inv?.id || "";
  // If it looks like a UUID (8-4-4-4-12 hex), fall back to "INV-???"
  if(/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(id)) return "INV-???";
  return id || "—";
};

/** Resolve a stored invRef to a human-readable invoice number */
const resolveInvRef = (invRef, allInvoices=[]) => {
  if(!invRef) return "—";
  // If it already looks human-readable (INV-xxx), return it
  if(!/^[0-9a-f]{8}-/i.test(invRef)) return invRef;
  // It's a UUID — look up the invoice
  const inv = allInvoices.find(i => i.id === invRef || i.invId === invRef);
  return inv ? fmtInvId(inv) : invRef;
};

// ═══════════════════════════════════════════════════════════════════════════════

// ─── Modals ────────────────────────────────────────────────────────────────────
function ContactModal({ client,onClose }){
  return(
    <Overlay onClose={onClose}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:360 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>Client Contact</span>
          <button onClick={onClose} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:14,paddingBottom:18,marginBottom:18,borderBottom:`1px solid ${C.border}` }}>
          <div style={{ width:52,height:52,borderRadius:"50%",background:C.accentDim,border:`2px solid ${C.accentMid}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,fontFamily:F,fontWeight:800,fontSize:18,flexShrink:0 }}>{client.initials}</div>
          <div><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>{client.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{client.company}</div></div>
        </div>
        {[["📞","Phone",client.phone],["✉️","Email",client.email]].map(([icon,lbl,val])=>(
          <div key={lbl} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
            <div style={{ width:36,height:36,background:C.surface,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{icon}</div>
            <div><div style={{ color:C.muted,fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8 }}>{lbl}</div><div style={{ color:C.text,fontFamily:F,fontSize:13,fontWeight:600,marginTop:2 }}>{val}</div></div>
          </div>
        ))}
        <div style={{ display:"flex",gap:8,marginTop:18 }}>
          <a href={`tel:${client.phone}`} style={{ flex:1,background:C.accent,color:"#000",padding:"10px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,textDecoration:"none",textAlign:"center" }}>Call</a>
          <a href={`mailto:${client.email}`} style={{ flex:1,background:C.surface,color:C.text,border:`1px solid ${C.border}`,padding:"10px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,textDecoration:"none",textAlign:"center" }}>Email</a>
        </div>
      </div>
    </Overlay>
  );
}

const INV_ST=[{ v:"pending",l:"Pending",c:C.accent },{ v:"paid",l:"Paid",c:C.green },{ v:"overdue",l:"Overdue",c:C.red }];

// AI Invoice extraction helper
async function aiExtractInvoice(file){
  if(!file.dataUrl) return null;
  const isImg = file.dataUrl.startsWith("data:image");
  const isPdf = file.name?.toLowerCase().endsWith(".pdf");
  try {
    const msgContent = isImg
      ? [{ type:"image", source:{ type:"base64", media_type: file.dataUrl.split(";")[0].split(":")[1], data: file.dataUrl.split(",")[1] }},
         { type:"text", text:'Extract invoice data from this image. Return ONLY valid JSON with fields: supplierName, invoiceNumber, invoiceDate (YYYY-MM-DD), dueDate (YYYY-MM-DD), amount (number), currency, description. Use null for missing fields.' }]
      : [{ type:"text", text:`Extract invoice data from this document named "${file.name}". Return ONLY valid JSON with fields: supplierName, invoiceNumber, invoiceDate (YYYY-MM-DD), dueDate (YYYY-MM-DD), amount (number), currency, description. Use null for missing fields.` }];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:500, messages:[{ role:"user", content:msgContent }] })
    });
    const data = await res.json();
    const text = data.content?.find(b=>b.type==="text")?.text||"";
    const clean = text.replace(/```json|```/g,"").trim();
    return JSON.parse(clean);
  } catch(e){ return null; }
}

function InvModal({ pending,onConfirm,onCancel }){
  const [step,setStep]=useState("upload"); // upload | review
  const [extracting,setExtracting]=useState(false);
  const [supplier,setSupplier]=useState("");const [invNum,setInvNum]=useState("");
  const [invDate,setInvDate]=useState("");const [dueDate,setDueDate]=useState("");
  const [amount,setAmount]=useState("");const [currency,setCurrency]=useState("USD");
  const [desc,setDesc]=useState("");const [status,setStatus]=useState("pending");
  const [aiNote,setAiNote]=useState("");

  useEffect(()=>{
    if(!pending) return;
    setStep("upload"); setSupplier(""); setInvNum(""); setInvDate(""); setDueDate(""); setAmount(""); setCurrency("USD"); setDesc(""); setStatus("pending"); setAiNote("");
  },[pending]);

  const runExtract=async()=>{
    setExtracting(true); setAiNote("");
    const result = await aiExtractInvoice(pending);
    if(result){
      if(result.supplierName) setSupplier(result.supplierName);
      if(result.invoiceNumber) setInvNum(result.invoiceNumber);
      if(result.invoiceDate) setInvDate(result.invoiceDate);
      if(result.dueDate) setDueDate(result.dueDate);
      if(result.amount) setAmount(String(result.amount));
      if(result.currency) setCurrency(result.currency);
      if(result.description) setDesc(result.description);
      setAiNote("OK AI extracted data from your file — please review and correct if needed.");
    } else {
      setAiNote("⚠️ Could not extract data automatically. Please fill in the fields manually.");
    }
    setStep("review"); setExtracting(false);
  };

  if(!pending)return null;
  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,width:500,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"22px 26px 0",flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>🧾 Add Invoice</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{pending.name}</div>
            </div>
            <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button>
          </div>
          {/* Steps */}
          <div style={{ display:"flex",gap:0,marginBottom:20 }}>
            {[["1","Upload"],["2","Review & Save"]].map(([n,l],i)=>{
              const done=step==="review"&&i===0; const active=(step==="upload"&&i===0)||(step==="review"&&i===1);
              return(<div key={n} style={{ display:"flex",alignItems:"center",flex:i===0?0:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:24,height:24,borderRadius:"50%",background:done?C.green:active?C.accent:C.border,color:done||active?"#000":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:700,fontSize:11,flexShrink:0 }}>{done?"✓":n}</div>
                  <span style={{ color:active?C.text:done?C.green:C.muted,fontFamily:F,fontSize:12,fontWeight:active?700:400 }}>{l}</span>
                </div>
                {i===0&&<div style={{ flex:1,height:2,background:done?C.green:C.border,borderRadius:1,margin:"0 10px" }}/>}
              </div>);
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:"0 26px" }}>
          {step==="upload"&&(
            <div style={{ paddingBottom:8 }}>
              <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"28px 20px",textAlign:"center",marginBottom:16 }}>
                <div style={{ fontSize:40,marginBottom:10 }}>🧾</div>
                <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15,marginBottom:6 }}>{pending.name}</div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{pending.size?(pending.size/1024).toFixed(1)+" KB":""}</div>
                {pending.dataUrl?.startsWith("data:image")&&<img src={pending.dataUrl} alt="" style={{ maxWidth:"100%",maxHeight:180,objectFit:"contain",borderRadius:8,marginTop:12,border:`1px solid ${C.border}` }}/>}
              </div>
              <div style={{ background:"linear-gradient(135deg,#a78bfa08,#3b82f608)",border:`1px solid ${C.purple}33`,borderRadius:10,padding:"16px 18px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                  <span style={{ fontSize:18 }}>🤖</span>
                  <span style={{ color:C.purple,fontFamily:F,fontWeight:700,fontSize:13 }}>AI Invoice Extraction</span>
                </div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:12,lineHeight:1.6 }}>Click below to automatically extract supplier name, invoice number, dates, amount, and description from your file.</div>
              </div>
            </div>
          )}

          {step==="review"&&(
            <div style={{ paddingBottom:8 }}>
              {aiNote&&<div style={{ background:aiNote.startsWith("OK")?C.greenDim:C.accentDim,border:`1px solid ${aiNote.startsWith("OK")?C.green+"44":C.accent+"44"}`,borderRadius:8,padding:"9px 13px",color:aiNote.startsWith("OK")?C.green:C.accent,fontFamily:F,fontSize:12,marginBottom:16 }}>{aiNote}</div>}
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div style={{ display:"flex",gap:12 }}>
                  <div style={{ flex:2 }}><label style={LBL()}>Supplier / Company Name</label><input style={INP()} value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="e.g. Gulf Steel Co."/></div>
                  <div style={{ flex:1 }}><label style={LBL()}>Invoice #</label><input style={INP()} value={invNum} onChange={e=>setInvNum(e.target.value)} placeholder="INV-001"/></div>
                </div>
                <div style={{ display:"flex",gap:12 }}>
                  <div style={{ flex:1 }}><label style={LBL()}>Invoice Date</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={invDate} onChange={e=>setInvDate(e.target.value)}/></div>
                  <div style={{ flex:1 }}><label style={LBL()}>Due Date</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></div>
                </div>
                <div style={{ display:"flex",gap:12 }}>
                  <div style={{ flex:2 }}><label style={LBL()}>Total Amount</label><input style={INP()} type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/></div>
                  <div style={{ flex:1 }}><label style={LBL()}>Currency</label>
                    <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                      {["USD","AED","SAR","EUR","GBP","QAR","KWD"].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={LBL()}>Description</label><textarea style={{ ...INP(),resize:"none" }} rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Invoice summary or scope"/></div>
                <div><label style={LBL()}>Status</label>
                  <div style={{ display:"flex",gap:8 }}>{INV_ST.map(s=><button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${s.c}`:`1px solid ${C.border}`,background:status===s.v?s.c+"22":"transparent",color:status===s.v?s.c:C.muted }}>{s.l}</button>)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"18px 26px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",gap:10 }}>
          {step==="upload"
            ?<>
              <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
              <button onClick={runExtract} disabled={extracting} style={{ background:C.purple,color:"#fff",border:"none",padding:"11px 28px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,opacity:extracting?.7:1 }}>
                {extracting?<><div style={{ width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Extracting…</>:<>🤖 Extract with AI</>}
              </button>
            </>
            :<>
              <button onClick={()=>setStep("upload")} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>← Back</button>
              <button onClick={()=>onConfirm({status,desc:desc||invNum||"Invoice",amount,due:dueDate,supplier,invNum,invDate,currency})} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 28px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>✓ Save Invoice</button>
            </>
          }
        </div>
      </div>
    </Overlay>
  );
}

function FilePreviewModal({ file,onClose }){
  if(!file)return null;
  const dataUrl = file.dataUrl||"";
  const name    = file.name||"Document";
  const isImg   = dataUrl.startsWith("data:image");
  const isPdf   = dataUrl.startsWith("data:application/pdf") || name.toLowerCase().endsWith(".pdf");
  const canInline = isImg||isPdf;
  const ext     = name.split(".").pop().toLowerCase();
  const typeLabel = isPdf?"PDF":isImg?"Image":ext.toUpperCase()||"Document";

  return(
    <Overlay onClose={onClose}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",width:760,maxWidth:"95vw",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.55)" }}>

        {/* ── Header bar ── */}
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0 }}>
          <div style={{ width:36,height:36,background:isPdf?C.redDim:isImg?C.blueDim:C.accentDim,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
            {isPdf?"PDF":isImg?"IMG":"FILE"}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{name}</div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:1 }}>{typeLabel}{file.size?" · "+fmtBytes(file.size):""}</div>
          </div>
          {dataUrl&&(
            <a href={dataUrl} download={name}
              style={{ background:C.accentDim,color:C.accent,border:`1px solid ${C.accentMid}`,padding:"7px 15px",borderRadius:7,fontFamily:F,fontWeight:700,fontSize:12,textDecoration:"none",flexShrink:0,display:"flex",alignItems:"center",gap:5 }}>
              ↓ Download
            </a>
          )}
          <button onClick={onClose} style={{ background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",flexShrink:0,lineHeight:1,padding:4 }}>✕</button>
        </div>

        {/* ── Preview body ── */}
        <div style={{ flex:1,overflow:"auto",background:C.bg,display:"flex",alignItems:canInline?"flex-start":"center",justifyContent:"center",minHeight:320 }}>
          {isImg&&(
            <div style={{ padding:16,width:"100%",boxSizing:"border-box" }}>
              <img src={dataUrl} alt={name}
                style={{ maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",display:"block",margin:"0 auto",borderRadius:8,border:`1px solid ${C.border}` }}/>
            </div>
          )}
          {isPdf&&dataUrl&&(
            <iframe src={dataUrl} title={name}
              style={{ width:"100%",height:"100%",minHeight:520,border:"none",display:"block" }}/>
          )}
          {!canInline&&(
            <div style={{ textAlign:"center",padding:"48px 32px" }}>
              
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16,marginBottom:8 }}>{name}</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:13,marginBottom:28,lineHeight:1.6 }}>
                This file type ({typeLabel}) can't be previewed in the browser.<br/>Use the Download button above to open it.
              </div>
              {dataUrl&&(
                <a href={dataUrl} download={name}
                  style={{ background:C.accent,color:"#000",padding:"12px 32px",borderRadius:9,fontFamily:F,fontWeight:700,fontSize:14,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:7 }}>
                  ↓ Download to Open
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </Overlay>
  );
}

function AddMemberModal({ project,onConfirm,onCancel }){
  const [name,setName]=useState("");const [role,setRole]=useState(ROLES[0]);const [projId,setProjId]=useState(project.id);
  const [phone,setPhone]=useState("");const [email,setEmail]=useState("");const [status,setStatus]=useState("on-site");const [err,setErr]=useState("");
  const submit=()=>{
    if(!name.trim()){setErr("Name is required");return;} if(!phone.trim()){setErr("Phone is required");return;}
    const color=MCOLORS[Math.floor(Math.random()*MCOLORS.length)];
    const init=name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    onConfirm({ id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:name.trim(),role,projId,phone:phone.trim(),email:email.trim(),status,color,init,type:"employee" });
  };
  const ST=[{v:"on-site",l:"On Site"},{v:"remote",l:"Remote"}];
  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:460,maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}><span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>Add Team Member</span><button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button></div>
        {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"8px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:14 }}>{err}</div>}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div><label style={LBL()}>Full Name *</label><input style={INP()} placeholder="e.g. John Smith" value={name} onChange={e=>{setName(e.target.value);setErr("");}}/></div>
          <div><label style={LBL()}>Role *</label><select value={role} onChange={e=>setRole(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
          <div><label style={LBL()}>Project</label><select value={projId||""} onChange={e=>setProjId(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>{(allProjects||[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label style={LBL()}>Phone *</label><input style={INP()} placeholder="+971 50 000 0000" value={phone} onChange={e=>{setPhone(e.target.value);setErr("");}}/></div>
          <div><label style={LBL()}>Email (optional)</label><input style={INP()} placeholder="name@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div><label style={LBL()}>Status</label><div style={{ display:"flex",gap:8 }}>{ST.map(s=><button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${C.green}`:`1px solid ${C.border}`,background:status===s.v?C.greenDim:"transparent",color:status===s.v?C.green:C.muted }}>{s.l}</button>)}</div></div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:22 }}>
          <button onClick={submit} style={{ flex:1,background:C.accent,color:"#000",border:"none",padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Add Member</button>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"12px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </Overlay>
  );
}

function AddTaskModal({ onConfirm,onCancel,allMembers,allProjects=[] }){
  const [title,setTitle]=useState("");const [desc,setDesc]=useState("");
  const [member,setMember]=useState(allMembers[0]?.name||"");
  const [projId,setProjId]=useState(allProjects[0]?.id||"");
  const [date,setDate]=useState("");const [err,setErr]=useState("");
  // Also allow typing a custom member name if not in list
  const [customMember,setCustomMember]=useState(false);
  const submit=()=>{
    if(!title.trim()){setErr("Task title is required");return;}
    if(!member.trim()){setErr("Team member is required");return;}
    if(!date){setErr("Date is required");return;}
    const proj=allProjects.find(p=>p.id===projId);
    onConfirm({ id:`t${Date.now()}`,title:title.trim(),desc:desc.trim(),member:member.trim(),project:proj?.name||"",date,projId,status:"pending" });
  };
  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:460,maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>Assign Task</span>
          <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}><Ic.Close size={14} color={C.muted}/></button>
        </div>
        {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"8px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:14 }}>{err}</div>}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div><label style={LBL()}>Task Title *</label><input style={INP()} placeholder="e.g. Site Inspection" value={title} onChange={e=>{setTitle(e.target.value);setErr("");}}/></div>
          <div><label style={LBL()}>Description</label><textarea style={{ ...INP(),resize:"none" }} rows={2} placeholder="What needs to be done?" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
              <label style={LBL()}>Assigned Member *</label>
              <button onClick={()=>setCustomMember(!customMember)} style={{ background:"transparent",border:"none",color:C.blue,fontFamily:F,fontSize:11,cursor:"pointer" }}>
                {customMember?"Pick from list":"Type manually"}
              </button>
            </div>
            {customMember
              ? <input style={INP()} placeholder="Enter name manually" value={member} onChange={e=>setMember(e.target.value)}/>
              : <select value={member} onChange={e=>setMember(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                  <option value="">— Select member —</option>
                  {allMembers.map(m=><option key={m.id||m.name} value={m.name}>{m.name}{m.role?` — ${m.role}`:""}</option>)}
                </select>
            }
          </div>
          <div><label style={LBL()}>Project</label>
            <select value={projId} onChange={e=>setProjId(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              <option value="">— No project —</option>
              {allProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label style={LBL()}>Due Date *</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={date} onChange={e=>{setDate(e.target.value);setErr("");}}/></div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:22 }}>
          <button onClick={submit} style={{ flex:1,background:C.accent,color:"#000",border:"none",padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>Assign Task</button>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"12px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Add Invoice Form Modal (form-first, doc upload inside) ───────────────────
function AddInvoiceFormModal({ project, onConfirm, onCancel, allInvoices=[] }){
  // Sequential numbering from the live global invoice list
  const nextId=()=>nextInvId(allInvoices);
  const [supplier,setSupplier]=useState("");const [invNum,setInvNum]=useState("");
  const [invDate,setInvDate]=useState("");const [dueDate,setDueDate]=useState("");
  const [amount,setAmount]=useState("");const [currency,setCurrency]=useState("AED");
  const [desc,setDesc]=useState("");const [status,setStatus]=useState("pending");
  const [docFile,setDocFile]=useState(null);
  const [aiRunning,setAiRunning]=useState(false);const [aiNote,setAiNote]=useState("");
  const [err,setErr]=useState("");
  const fileRef=useRef();

  const handleDocFile=async(raw)=>{
    if(!raw)return;
    const du=raw.size<5*1024*1024?await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);}):null;
    setDocFile({name:raw.name,size:raw.size,dataUrl:du});
    if(du){
      setAiRunning(true); setAiNote("🤖 Reading document with AI…");
      const result=await aiExtractInvoice({name:raw.name,size:raw.size,dataUrl:du});
      if(result){
        if(result.supplierName&&!supplier)setSupplier(result.supplierName);
        if(result.invoiceNumber&&!invNum)setInvNum(result.invoiceNumber);
        if(result.invoiceDate&&!invDate)setInvDate(result.invoiceDate);
        if(result.dueDate&&!dueDate)setDueDate(result.dueDate);
        if(result.amount&&!amount)setAmount(String(result.amount));
        if(result.currency)setCurrency(result.currency);
        if(result.description&&!desc)setDesc(result.description);
        setAiNote("OK AI extracted data — review and correct if needed");
      } else { setAiNote("ℹ️ AI could not extract data — please fill in fields manually"); }
      setAiRunning(false);
    }
  };

  const submit=()=>{
    if(!amount||isNaN(parseFloat(amount))){setErr("Invoice amount is required");return;}
    const fmt=dueDate?new Date(dueDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";
    const id=invNum.trim()||nextId();
    onConfirm({ id:`${Date.now()}`,invId:id,name:docFile?.name||`${id}.pdf`,size:docFile?.size||0,dataUrl:docFile?.dataUrl||null,icon:"🧾",invoiceStatus:status,desc:desc||id,amount:parseFloat(amount),dueDate:fmt,dueDateISO:dueDate,uploadedAt:new Date().toLocaleDateString(),supplier:supplier||"—",invDate:invDate||"—",currency });
  };

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:600,maxHeight:"93vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        {/* Header */}
        <div style={{ padding:"22px 28px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18 }}>🧾 Add Invoice</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{project.name}</div>
            </div>
            <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer" }}>✕</button>
          </div>
        </div>
        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:"22px 28px" }}>
          {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 14px",color:C.red,fontFamily:F,fontSize:12,marginBottom:16 }}>⚠ {err}</div>}
          <div style={{ display:"flex",flexDirection:"column",gap:15 }}>
            {/* Supplier + Invoice # */}
            <div style={{ display:"flex",gap:14 }}>
              <div style={{ flex:2 }}><label style={LBL()}>Supplier / Company</label><input style={INP()} value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="e.g. Gulf Steel Co."/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Invoice #</label><input style={INP()} value={invNum} onChange={e=>setInvNum(e.target.value)} placeholder="INV-001"/></div>
            </div>
            {/* Dates */}
            <div style={{ display:"flex",gap:14 }}>
              <div style={{ flex:1 }}><label style={LBL()}>Invoice Date</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={invDate} onChange={e=>setInvDate(e.target.value)}/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Due Date</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></div>
            </div>
            {/* Amount + Currency */}
            <div style={{ display:"flex",gap:14 }}>
              <div style={{ flex:2 }}><label style={LBL()}>Amount *</label><input style={INP()} type="number" value={amount} onChange={e=>{setAmount(e.target.value);setErr("");}} placeholder="0.00"/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Currency</label>
                <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                  {["AED","USD","SAR","EUR","GBP","QAR","KWD"].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {/* Description */}
            <div><label style={LBL()}>Description</label><textarea style={{ ...INP(),resize:"none" }} rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Scope or summary of this invoice"/></div>
            {/* Status */}
            <div><label style={LBL()}>Status</label>
              <div style={{ display:"flex",gap:8 }}>
                {INV_ST.map(s=><button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${s.c}`:`1px solid ${C.border}`,background:status===s.v?s.c+"22":"transparent",color:status===s.v?s.c:C.muted,transition:"all .15s" }}>{s.l}</button>)}
              </div>
            </div>
            {/* Document upload */}
            <div>
              <label style={LBL()}>Attach Document <span style={{color:C.muted,fontWeight:400}}>(PDF, image, screenshot — optional)</span></label>
              {docFile
                ?<div style={{ background:C.surface,border:`1px solid ${C.green}44`,borderRadius:10,padding:"14px 16px" }}>
                    {aiRunning&&<div style={{ color:C.purple,fontFamily:F,fontSize:12,marginBottom:8,display:"flex",alignItems:"center",gap:8 }}><div style={{ width:12,height:12,border:"2px solid",borderColor:C.purple,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Extracting with AI…</div>}
                    {aiNote&&!aiRunning&&<div style={{ color:aiNote.startsWith("OK")?C.green:C.muted,fontFamily:F,fontSize:11,marginBottom:10,padding:"8px 10px",background:aiNote.startsWith("OK")?C.greenDim:C.surface,borderRadius:6,border:`1px solid ${aiNote.startsWith("OK")?C.green+"33":C.border}` }}>{aiNote}</div>}
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:42,height:42,background:C.card,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{docFile.dataUrl?.startsWith("data:image")?"🖼️":"📄"}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{docFile.name}</div>
                        <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:2 }}>{docFile.size?(docFile.size/1024).toFixed(1)+" KB":""}</div>
                      </div>
                      <button onClick={()=>{setDocFile(null);setAiNote("");}} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,borderRadius:6,padding:"4px 8px",fontFamily:F,fontSize:12,cursor:"pointer" }}>Remove</button>
                    </div>
                    {docFile.dataUrl?.startsWith("data:image")&&<img src={docFile.dataUrl} alt="" style={{ maxWidth:"100%",maxHeight:180,objectFit:"contain",borderRadius:8,marginTop:12,border:`1px solid ${C.border}` }}/>}
                  </div>
                :<div onClick={()=>fileRef.current.click()}
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.accentDim;}}
                    onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}
                    onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";const f=e.dataTransfer.files[0];if(f)handleDocFile(f);}}
                    style={{ border:`2px dashed ${C.border}`,borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer",transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"88";e.currentTarget.style.background=C.accentDim;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                    <div style={{ fontSize:32,marginBottom:8 }}>📎</div>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13,marginBottom:4 }}>Drop document or click to browse</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>PDF · Images · Screenshots · Word docs · Any format</div>
                    <div style={{ color:C.purple,fontFamily:F,fontSize:11,marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>🤖 AI will auto-extract invoice data from your file</div>
                  </div>
              }
              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.doc,.docx,.xls,.xlsx,.txt,.csv" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handleDocFile(f);e.target.value="";}}/>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:"18px 28px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={submit} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 32px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Save Invoice</button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Module Panels ─────────────────────────────────────────────────────────────
function InvoicesPanel({ project, onActivity, onAddGlobalInvoice, onRemoveGlobalInvoice, onUpdateGlobalInvoice, allInvoices=[] }){
  // ─── SINGLE SOURCE OF TRUTH: global store only (no useFiles for invoices) ───
  const [preview,setPreview]     = useState(null);
  const [mode,setMode]           = useState("list"); // "list" | "add" | "edit"
  const [editTarget,setEditTarget] = useState(null); // invoice being edited
  const [confirmDel,setConfirmDel] = useState(null);
  const [saving,setSaving]       = useState(false);
  const [formErr,setFormErr]     = useState("");
  // shared form fields (used for both add and edit)
  const [supplier,setSupplier]   = useState("");
  const [invNum,setInvNum]       = useState("");
  const [invDate,setInvDate]     = useState("");
  const [dueDate,setDueDate]     = useState("");
  const [amount,setAmount]       = useState("");
  const [currency,setCurrency]   = useState("AED");
  const [desc,setDesc]           = useState("");
  const [status,setStatus]       = useState("pending");
  const [docFile,setDocFile]     = useState(null);
  const [aiRunning,setAiRunning] = useState(false);
  const [aiNote,setAiNote]       = useState("");
  const fileRef = useRef();

  // ─── All invoices for this project — global store is the single source ────
  const rows = useMemo(()=>
    allInvoices
      .filter(i => i.projId===project.id || i.project===project.name)
      .map(i => ({
        ...i,
        st:  i.status||i.invoiceStatus||"pending",
        dd:  i.dueFmt||i.dueDate||"—",
        iid: i.invId||i.id,
      })),
    [allInvoices, project.id, project.name]
  );

  const resetForm = () => {
    setSupplier(""); setInvNum(""); setInvDate(""); setDueDate("");
    setAmount(""); setCurrency("AED"); setDesc(""); setStatus("pending");
    setDocFile(null); setAiRunning(false); setAiNote(""); setFormErr(""); setSaving(false);
  };

  const openAdd = () => { resetForm(); setEditTarget(null); setMode("add"); };

  const openEdit = (row) => {
    resetForm();
    setEditTarget(row);
    setSupplier(row.supplier||"");
    setInvNum(row.invId||row.id||"");
    setInvDate(row.invDate||row.invoiceDate||"");
    setDueDate(row.due||row.dueDateISO||"");
    setAmount(String(row.amount||""));
    setCurrency(row.currency||"AED");
    setDesc(row.desc||"");
    setStatus(row.st||"pending");
    setDocFile(row.dataUrl ? {name:row.name||"document",size:row.size||0,dataUrl:row.dataUrl} : null);
    setMode("edit");
  };

  // ─── AI document extraction ────────────────────────────────────────────────
  const handleDoc = async (raw) => {
    if(!raw) return;
    const du = raw.size<5*1024*1024 ? await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);}) : null;
    setDocFile({name:raw.name,size:raw.size,dataUrl:du});
    if(du){
      setAiRunning(true); setAiNote("Reading with AI…");
      const res = await aiExtractInvoice({name:raw.name,size:raw.size,dataUrl:du});
      if(res){
        if(res.supplierName  && !supplier) setSupplier(res.supplierName);
        if(res.invoiceNumber && !invNum)   setInvNum(res.invoiceNumber);
        if(res.invoiceDate   && !invDate)  setInvDate(res.invoiceDate);
        if(res.dueDate       && !dueDate)  setDueDate(res.dueDate);
        if(res.amount        && !amount)   setAmount(String(res.amount));
        if(res.currency)                   setCurrency(res.currency);
        if(res.description   && !desc)     setDesc(res.description);
        setAiNote("AI extracted — review below");
      } else setAiNote("Couldn't extract — fill manually");
      setAiRunning(false);
    }
  };

  // ─── Add submit ────────────────────────────────────────────────────────────
  const submitAdd = async () => {
    if(saving) return;
    if(!amount||isNaN(parseFloat(amount))){ setFormErr("Invoice amount is required"); return; }
    setSaving(true);
    try{
      const fmt = dueDate ? new Date(dueDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
      const invId = invNum.trim() || nextInvId(allInvoices);
      const invObj = {
        id: String(Date.now()), invId,
        name: docFile?.name||`${invId}.pdf`, size: docFile?.size||0,
        dataUrl: docFile?.dataUrl||null, icon: "receipt",
        invoiceStatus:status, status,
        desc: desc||invId,
        amount: parseFloat(amount), dueDate:fmt, dueDateISO:dueDate,
        due: dueDate, dueFmt:fmt,
        uploadedAt: new Date().toLocaleDateString(),
        supplier: supplier.trim()||"—", invDate: invDate||"—", currency,
        project: project.name,
        client: project.client?.company||project.client?.name||"",
        projId: project.id,
      };
      if(onAddGlobalInvoice) await onAddGlobalInvoice(invObj);
      if(onActivity) onActivity("Invoice "+invId+" added","inv");
      setMode("list");
    } catch(e){ setFormErr("Save failed: "+e.message); }
    finally{ setSaving(false); }
  };

  // ─── Edit submit ───────────────────────────────────────────────────────────
  const submitEdit = async () => {
    if(saving) return;
    if(!amount||isNaN(parseFloat(amount))){ setFormErr("Amount is required"); return; }
    setSaving(true);
    try{
      const fmt = dueDate ? new Date(dueDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
      const displayId = invNum.trim()||editTarget.invId||editTarget.id;
      const patch = {
        invId: displayId,
        supplier: supplier.trim()||"—",
        invDate: invDate||"—",
        due: dueDate, dueFmt:fmt, dueDate:fmt, dueDateISO:dueDate,
        amount: parseFloat(amount), currency,
        desc, status, invoiceStatus:status,
        ...(docFile ? {dataUrl:docFile.dataUrl,name:docFile.name,size:docFile.size} : {}),
      };
      if(onUpdateGlobalInvoice) await onUpdateGlobalInvoice(editTarget.id, patch);
      if(onActivity) onActivity("Invoice "+displayId+" updated","edit");
      setMode("list"); setEditTarget(null);
    } catch(e){ setFormErr("Save failed: "+e.message); }
    finally{ setSaving(false); }
  };

  // ─── Status cycle — always via global update ───────────────────────────────
  const cycle = async (row) => {
    const idx = INV_ST.findIndex(s=>s.v===row.st);
    const nextSt = INV_ST[(idx+1)%INV_ST.length].v;
    if(onUpdateGlobalInvoice) await onUpdateGlobalInvoice(row.id, {status:nextSt,invoiceStatus:nextSt});
  };

  // ─── Shared doc attachment widget ──────────────────────────────────────────
  const DocZone = () => docFile
    ? <div style={{ background:C.surface,border:`1px solid ${C.green}44`,borderRadius:9,padding:"12px 14px" }}>
        {aiRunning&&<div style={{ color:C.purple,fontFamily:F,fontSize:11,marginBottom:8,display:"flex",alignItems:"center",gap:7 }}><div style={{ width:10,height:10,border:"2px solid",borderColor:C.purple,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Extracting…</div>}
        {aiNote&&!aiRunning&&<div style={{ color:aiNote.startsWith("AI")?C.green:C.muted,fontFamily:F,fontSize:11,marginBottom:8,padding:"6px 9px",background:aiNote.startsWith("AI")?C.greenDim:"transparent",borderRadius:5 }}>{aiNote}</div>}
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,background:C.card,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            {docFile.dataUrl?.startsWith("data:image")?<Ic.Image size={18} color={C.muted}/>:<Ic.File size={18} color={C.muted}/>}
          </div>
          <div style={{ flex:1,minWidth:0 }}><div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{docFile.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:10 }}>{docFile.size?(docFile.size/1024).toFixed(1)+" KB":""}</div></div>
          <button onClick={()=>{setDocFile(null);setAiNote("");}} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,borderRadius:5,padding:"3px 8px",fontFamily:F,fontSize:11,cursor:"pointer" }}>Remove</button>
        </div>
        {docFile.dataUrl?.startsWith("data:image")&&<img src={docFile.dataUrl} alt="" style={{ maxWidth:"100%",maxHeight:120,objectFit:"contain",borderRadius:7,marginTop:8,border:`1px solid ${C.border}` }}/>}
      </div>
    : <div onClick={()=>fileRef.current?.click()}
        onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.accentDim;}}
        onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}
        onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";const f=e.dataTransfer.files[0];if(f)handleDoc(f);}}
        style={{ border:`2px dashed ${C.border}`,borderRadius:9,padding:"16px",textAlign:"center",cursor:"pointer",transition:"all .2s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"88";e.currentTarget.style.background=C.accentDim;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
        <div style={{ marginBottom:5 }}><Ic.Attach size={22} color={C.muted}/></div>
        <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,marginBottom:2 }}>Drop file or click to browse</div>
        <div style={{ color:C.purple,fontFamily:F,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}><Ic.Bot size={12} color={C.purple}/> AI will auto-extract invoice data</div>
      </div>;

  // ─── Shared form body ──────────────────────────────────────────────────────
  const FormBody = () => (<>
    <div style={{ display:"flex",gap:12 }}>
      <div style={{ flex:2 }}><label style={LBL()}>Supplier / Company</label><input style={INP()} value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="e.g. Gulf Steel Co."/></div>
      <div style={{ flex:1 }}><label style={LBL()}>Invoice #</label><input style={INP()} value={invNum} onChange={e=>setInvNum(e.target.value)} placeholder="INV-001"/></div>
    </div>
    <div style={{ display:"flex",gap:12 }}>
      <div style={{ flex:1 }}><label style={LBL()}>Invoice Date</label><input style={{...INP(),colorScheme:"dark"}} type="date" value={invDate} onChange={e=>setInvDate(e.target.value)}/></div>
      <div style={{ flex:1 }}><label style={LBL()}>Due Date</label><input style={{...INP(),colorScheme:"dark"}} type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></div>
    </div>
    <div style={{ display:"flex",gap:12 }}>
      <div style={{ flex:2 }}><label style={LBL()}>Amount *</label><input style={INP()} type="number" value={amount} onChange={e=>{setAmount(e.target.value);setFormErr("");}} placeholder="0.00"/></div>
      <div style={{ flex:1 }}><label style={LBL()}>Currency</label><select value={currency} onChange={e=>setCurrency(e.target.value)} style={{...INP(),cursor:"pointer"}}>{["AED","USD","SAR","EUR","GBP","QAR","KWD"].map(c=><option key={c}>{c}</option>)}</select></div>
    </div>
    <div><label style={LBL()}>Description / Notes</label><textarea style={{...INP(),resize:"none"}} rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Scope or summary"/></div>
    <div><label style={LBL()}>Status</label>
      <div style={{ display:"flex",gap:7 }}>{INV_ST.map(s=><button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,padding:"8px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${s.c}`:`1px solid ${C.border}`,background:status===s.v?s.c+"22":"transparent",color:status===s.v?s.c:C.muted }}>{s.l}</button>)}</div>
    </div>
    <div>
      <label style={LBL()}>Document <span style={{color:C.muted,fontWeight:400}}>(optional — AI auto-extracts)</span></label>
      <DocZone/>
      <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handleDoc(f);e.target.value="";}}/>
    </div>
  </>);

  return(
    <div>
      {preview&&<FilePreviewModal file={preview} onClose={()=>setPreview(null)}/>}

      {confirmDel&&(
        <ConfirmDialog title="Delete Invoice?"
          message={`Delete invoice "${confirmDel.iid}"? This cannot be undone.`}
          confirmLabel="Yes, Delete" variant="delete"
          onConfirm={async()=>{
            if(onRemoveGlobalInvoice) await onRemoveGlobalInvoice(confirmDel.id);
            if(onActivity) onActivity("Invoice "+confirmDel.iid+" deleted","del");
            setConfirmDel(null);
          }}
          onCancel={()=>setConfirmDel(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ color:C.accent,fontFamily:F,fontWeight:700,fontSize:13 }}>{confirmDel.iid}</span>
            <span style={{ color:C.text,fontFamily:F,fontWeight:700 }}>{confirmDel.amount?`$${Number(confirmDel.amount).toLocaleString()}`:"—"}</span>
          </div>
        </ConfirmDialog>
      )}

      {/* Invoice table */}
      {mode==="list"&&rows.length>0&&(
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",marginBottom:14 }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:12 }}>
            <thead><tr style={{ background:C.bg,borderBottom:`1px solid ${C.border}` }}>
              {["Invoice #","Supplier","Amount","Due Date","Status",""].map(h=><th key={h} style={TH({padding:"9px 12px",fontSize:11})}>{h}</th>)}
            </tr></thead>
            <tbody>{rows.map((row,i)=>{ const st=INV_ST.find(s=>s.v===row.st)||INV_ST[0]; return(
              <tr key={row.id} style={{ borderBottom:i<rows.length-1?`1px solid ${C.border}22`:"none",transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={TD({color:C.accent,fontWeight:700,fontSize:11,whiteSpace:"nowrap",padding:"9px 12px"})}>{fmtInvId(row)}</td>
                <td style={TD({color:C.text,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:11,padding:"9px 12px"})}>{row.supplier||row.desc||"—"}</td>
                <td style={TD({color:C.text,fontWeight:700,whiteSpace:"nowrap",padding:"9px 12px"})}>{row.amount?`$${Number(row.amount).toLocaleString()}`:"—"}</td>
                <td style={TD({color:row.st==="overdue"?C.red:C.muted,fontSize:11,whiteSpace:"nowrap",padding:"9px 12px"})}>{row.dd||"—"}</td>
                <td style={TD({padding:"9px 12px"})}><button onClick={()=>cycle(row)} style={{ background:st.c+"22",color:st.c,border:`1px solid ${st.c}55`,padding:"3px 9px",borderRadius:5,fontFamily:F,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>{st.l}</button></td>
                <td style={TD({padding:"9px 12px"})}>
                  <RowActions>
                    {row.dataUrl&&<RowBtn type="view" onClick={()=>setPreview(row)}>View</RowBtn>}
                    <RowBtn type="edit" onClick={()=>openEdit(row)}>Edit</RowBtn>
                    <RowBtn type="delete" onClick={()=>setConfirmDel(row)}>Delete</RowBtn>
                  </RowActions>
                </td>
              </tr>);})}
            </tbody>
          </table>
        </div>
      )}
      {mode==="list"&&rows.length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"10px 0",marginBottom:12 }}>No invoices yet — add your first one below.</div>}

      {/* Add form */}
      {mode==="add"&&(
        <InlineFormShell header="New Invoice" accent={C.accent} saveLabel="Save Invoice" onSave={submitAdd} onCancel={()=>{setMode("list");resetForm();}} err={formErr} saving={saving}>
          <FormBody/>
        </InlineFormShell>
      )}

      {/* Edit form */}
      {mode==="edit"&&(
        <InlineFormShell header={`Edit Invoice — ${editTarget?.invId||editTarget?.id||""}`} accent={C.blue} saveLabel="Save Changes" onSave={submitEdit} onCancel={()=>{setMode("list");setEditTarget(null);resetForm();}} err={formErr} saving={saving}>
          <FormBody/>
        </InlineFormShell>
      )}

      {/* Add button */}
      {mode==="list"&&(
        <Btn variant="primary" onClick={openAdd}><Ic.Plus size={13} color="#000"/> Add Invoice</Btn>
      )}
    </div>
  );
}


function AddPlanFormModal({ project, onConfirm, onCancel }){
  const [title,setTitle]   = useState("");
  const [cat,setCat]       = useState("drawing");
  const [notes,setNotes]   = useState("");
  const [docFile,setDocFile] = useState(null);
  const [err,setErr]       = useState("");
  const fileRef            = useRef();
  const PLAN_CATS=[{v:"drawing",l:"Drawing",icon:"DWG"},{v:"electrical",l:"Electrical",icon:"ELC"},{v:"plumbing",l:"Plumbing",icon:"PLB"},{v:"structural",l:"Structural",icon:"STR"},{v:"cad",l:"CAD File",icon:"CAD"},{v:"permit",l:"Permit / Legal",icon:"PRM"},{v:"other",l:"Other",icon:"DOC"}];

  const handleDocFile=async(raw)=>{
    if(!raw)return;
    const du=raw.size<6*1024*1024?await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);}):null;
    setDocFile({name:raw.name,size:raw.size,dataUrl:du});
    if(!title)setTitle(raw.name.replace(/\.[^.]+$/,"").replace(/[_-]/g," "));
  };

  const submit=()=>{
    if(!docFile){setErr("Please upload a file");return;}
    const chosenCat=PLAN_CATS.find(c=>c.v===cat)||PLAN_CATS[0];
    onConfirm({ id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:docFile.name,displayTitle:title||docFile.name,size:docFile.size,dataUrl:docFile.dataUrl,icon:chosenCat.icon,badgeStatus:cat,notes:notes.trim(),uploadedAt:new Date().toLocaleDateString() });
  };

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:580,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18 }}>📐 Add Plan / Document</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{project.name}</div>
            </div>
            <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer" }}>✕</button>
          </div>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"22px 28px" }}>
          {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 14px",color:C.red,fontFamily:F,fontSize:12,marginBottom:16 }}>⚠ {err}</div>}
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {/* File upload first — primary action */}
            <div>
              <label style={LBL()}>Upload Document *</label>
              {docFile
                ?<div style={{ background:C.surface,border:`1px solid ${C.green}44`,borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      {docFile.dataUrl?.startsWith("data:image")
                        ?<img src={docFile.dataUrl} alt="" style={{ width:52,height:52,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`,flexShrink:0 }}/>
                        :<div style={{ width:52,height:52,background:C.card,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0 }}>📄</div>
                      }
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ color:C.green,fontFamily:F,fontWeight:700,fontSize:13 }}>✓ File uploaded</div>
                        <div style={{ color:C.text,fontFamily:F,fontSize:12,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{docFile.name}</div>
                        <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:1 }}>{docFile.size?(docFile.size/1024).toFixed(1)+" KB":""}</div>
                      </div>
                      <button onClick={()=>setDocFile(null)} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,borderRadius:6,padding:"4px 8px",fontFamily:F,fontSize:12,cursor:"pointer" }}>Remove</button>
                    </div>
                  </div>
                :<div onClick={()=>fileRef.current.click()}
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.background=C.blueDim;}}
                    onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}
                    onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";const f=e.dataTransfer.files[0];if(f){handleDocFile(f);setErr("");}}}
                    style={{ border:`2px dashed ${C.border}`,borderRadius:12,padding:"36px 20px",textAlign:"center",cursor:"pointer",transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue+"88";e.currentTarget.style.background=C.blueDim;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                    <div style={{ fontSize:38,marginBottom:10 }}>📁</div>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:14,marginBottom:5 }}>Drop file here or click to browse</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>PDF · CAD (.dwg .dxf) · Images · Word · Excel · Any format</div>
                  </div>
              }
              <input ref={fileRef} type="file" accept="*" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f){handleDocFile(f);setErr("");}e.target.value="";}}/>
            </div>
            {/* Title */}
            <div><label style={LBL()}>Document Title</label><input style={INP()} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Foundation Layout v3"/></div>
            {/* Category */}
            <div><label style={LBL()}>Document Type</label>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {PLAN_CATS.map(c=>(
                  <button key={c.v} onClick={()=>setCat(c.v)} style={{ padding:"7px 14px",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:cat===c.v?`2px solid ${C.blue}`:`1px solid ${C.border}`,background:cat===c.v?C.blueDim:"transparent",color:cat===c.v?C.blue:C.muted,transition:"all .15s",display:"flex",alignItems:"center",gap:5 }}>{c.icon} {c.l}</button>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div><label style={LBL()}>Notes <span style={{color:C.muted,fontWeight:400}}>(optional)</span></label>
              <textarea style={{ ...INP(),resize:"none" }} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Version info, revision notes, instructions…"/>
            </div>
          </div>
        </div>
        <div style={{ padding:"18px 28px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={submit} style={{ background:C.blue,color:"#fff",border:"none",padding:"11px 32px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>📐 Save Document</button>
        </div>
      </div>
    </Overlay>
  );
}

function PlansPanel({ project,onActivity }){
  const { files,ready,add,remove } = useFiles(`plans:${project.id}`);
  const [preview,setPreview] = useState(null);
  const [showAdd,setShowAdd] = useState(false);
  const [confirmDelete,setConfirmDelete] = useState(null); // file to delete
  // inline form state
  const [planTitle,setPlanTitle]=useState(""); const [planCat,setPlanCat]=useState("drawing");
  const [planNotes,setPlanNotes]=useState(""); const [planFile,setPlanFile]=useState(null);
  const [planErr,setPlanErr]=useState("");
  const planFileRef=useRef();
  const PLAN_CATS=[{v:"drawing",l:"Drawing",icon:"DWG"},{v:"electrical",l:"Electrical",icon:"ELC"},{v:"plumbing",l:"Plumbing",icon:"PLB"},{v:"structural",l:"Structural",icon:"STR"},{v:"cad",l:"CAD File",icon:"CAD"},{v:"permit",l:"Permit",icon:"PRM"},{v:"other",l:"Other",icon:"DOC"}];

  const handlePlanFile=async(raw)=>{
    if(!raw)return;
    const du=raw.size<6*1024*1024?await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);}):null;
    setPlanFile({name:raw.name,size:raw.size,dataUrl:du});
    if(!planTitle)setPlanTitle(raw.name.replace(/\.[^.]+$/,"").replace(/[_-]/g," "));
    setPlanErr("");
  };

  const submitPlan=async()=>{
    if(!planFile){setPlanErr("Please upload a file");return;}
    const chosenCat=PLAN_CATS.find(c=>c.v===planCat)||PLAN_CATS[0];
    await add({ id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:planFile.name,displayTitle:planTitle||planFile.name,size:planFile.size,dataUrl:planFile.dataUrl,icon:chosenCat.icon,badgeStatus:planCat,notes:planNotes.trim(),uploadedAt:new Date().toLocaleDateString() });
    onActivity("Plan uploaded","📐"); setShowAdd(false);
  };

  if(!ready)return <div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"16px 0",textAlign:"center" }}>Loading…</div>;
  return(
    <div>
      {preview&&<FilePreviewModal file={preview} onClose={()=>setPreview(null)}/>}
      {confirmDelete&&(
        <ConfirmDialog
          title="Delete Document?"
          message={`Are you sure you want to delete "${confirmDelete.displayTitle||confirmDelete.name}"? This action cannot be undone.`}
          confirmLabel="Yes, Delete" variant="delete"
          onConfirm={()=>{ remove(confirmDelete.id); setConfirmDelete(null); onActivity("Document deleted","🗑️"); }}
          onCancel={()=>setConfirmDelete(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:11,fontWeight:700,color:C.accent,background:C.accentDim,padding:"3px 6px",borderRadius:4 }}>{confirmDelete.icon||"DOC"}</span>
            <div><div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13 }}>{confirmDelete.displayTitle||confirmDelete.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{fmtBytes(confirmDelete.size)}</div></div>
          </div>
        </ConfirmDialog>
      )}
      {!showAdd&&files.length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"10px 0",marginBottom:12 }}>No documents yet — add your first plan or file</div>}
      {!showAdd&&files.length>0&&(
        <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:14 }}>{files.map(f=>(
          <div key={f.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
            {f.dataUrl?.startsWith("data:image")?<img src={f.dataUrl} alt="" style={{ width:40,height:40,objectFit:"cover",borderRadius:5,border:`1px solid ${C.border}`,flexShrink:0 }}/>:<div style={{ width:40,height:40,background:C.card,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{f.icon||"📄"}</div>}
            <div style={{ flex:1,minWidth:0 }}><div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{f.displayTitle||f.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:10,marginTop:2 }}>{fmtBytes(f.size)} · {f.uploadedAt}{f.notes&&<span> · {f.notes.slice(0,40)}</span>}</div></div>
            <Badge status={f.badgeStatus}/>
            <RowBtn type="view" onClick={()=>setPreview(f)}>View</RowBtn>
            <RowBtn type="delete" onClick={()=>setConfirmDelete(f)}>Delete</RowBtn>
          </div>
        ))}</div>
      )}
      {showAdd
        ?<InlineFormShell header="📐 Add Plan / Document" accent={C.blue} saveLabel="📐 Save Document" onSave={submitPlan} onCancel={()=>setShowAdd(false)} err={planErr}>
            {/* File upload */}
            <div>
              <label style={LBL()}>Upload File *</label>
              {planFile
                ?<div style={{ background:C.surface,border:`1px solid ${C.green}44`,borderRadius:9,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}>
                    {planFile.dataUrl?.startsWith("data:image")?<img src={planFile.dataUrl} alt="" style={{ width:40,height:40,objectFit:"cover",borderRadius:6,flexShrink:0 }}/>:<div style={{ width:40,height:40,background:C.card,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>📄</div>}
                    <div style={{ flex:1,minWidth:0 }}><div style={{ color:C.green,fontFamily:F,fontWeight:700,fontSize:12 }}>✓ File ready</div><div style={{ color:C.text,fontFamily:F,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{planFile.name}</div></div>
                    <button onClick={()=>setPlanFile(null)} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,borderRadius:5,padding:"3px 8px",fontFamily:F,fontSize:11,cursor:"pointer" }}>Remove</button>
                  </div>
                :<div onClick={()=>planFileRef.current.click()} onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.background=C.blueDim;}} onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}} onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";const f=e.dataTransfer.files[0];if(f)handlePlanFile(f);}} style={{ border:`2px dashed ${C.border}`,borderRadius:9,padding:"22px",textAlign:"center",cursor:"pointer",transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue+"88";e.currentTarget.style.background=C.blueDim;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                    <div style={{ fontSize:28,marginBottom:7 }}>📁</div>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,marginBottom:3 }}>Drop file or click to browse</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>PDF · CAD · Images · Word · Excel · Any format</div>
                  </div>
              }
              <input ref={planFileRef} type="file" accept="*" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handlePlanFile(f);e.target.value="";}}/>
            </div>
            <div><label style={LBL()}>Document Title</label><input style={INP()} value={planTitle} onChange={e=>setPlanTitle(e.target.value)} placeholder="e.g. Foundation Layout v3"/></div>
            <div><label style={LBL()}>Document Type</label>
              <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                {PLAN_CATS.map(c=><button key={c.v} onClick={()=>setPlanCat(c.v)} style={{ padding:"7px 12px",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:700,border:planCat===c.v?`2px solid ${C.blue}`:`1px solid ${C.border}`,background:planCat===c.v?C.blueDim:"transparent",color:planCat===c.v?C.blue:C.muted,display:"flex",alignItems:"center",gap:4 }}>{c.icon} {c.l}</button>)}
              </div>
            </div>
            <div><label style={LBL()}>Notes <span style={{color:C.muted,fontWeight:400}}>(optional)</span></label><textarea style={{ ...INP(),resize:"none" }} rows={2} value={planNotes} onChange={e=>setPlanNotes(e.target.value)} placeholder="Version info, revision notes…"/></div>
          </InlineFormShell>
        :<button onClick={()=>{ setPlanTitle("");setPlanCat("drawing");setPlanNotes("");setPlanFile(null);setPlanErr("");setShowAdd(true); }} style={{ background:C.blue,color:"#fff",border:"none",padding:"10px 22px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7 }}>📐 + Add Plan / Document</button>
      }
    </div>
  );
}

function TeamPanel({ project,onOpenTeamPage }){
  const { members,ready,addMember }=useTeam(project.id);
  const [showAdd,setShowAdd]=useState(false);
  const [tmName,setTmName]=useState(""); const [tmRole,setTmRole]=useState(ROLES[0]);
  const [tmPhone,setTmPhone]=useState(""); const [tmStatus,setTmStatus]=useState("on-site");
  const [tmErr,setTmErr]=useState("");
  const MCOLORS_LIST=[C.blue,C.purple,C.green,C.accent,"#f43f5e","#06b6d4","#84cc16"];

  const submitMember=async()=>{
    if(!tmName.trim()){setTmErr("Name is required");return;}
    if(!tmPhone.trim()){setTmErr("Phone is required");return;}
    const color=MCOLORS_LIST[Math.floor(Math.random()*MCOLORS_LIST.length)];
    const init=tmName.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    await addMember({ id:`m${Date.now()}`,name:tmName.trim(),role:tmRole,phone:tmPhone.trim(),status:tmStatus,color,init,projId:project.id,projectName:project.name,type:"employee" });
    setShowAdd(false);
  };

  if(!ready)return <div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"14px 0",textAlign:"center" }}>Loading…</div>;
  return(
    <div>
      {!showAdd&&members.length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"12px 0",textAlign:"center" }}>No team members yet</div>}
      {!showAdd&&members.length>0&&(
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:12 }}>
          {members.slice(0,4).map(m=>(
            <div key={m.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:34,height:34,borderRadius:"50%",background:(m.color||C.blue)+"22",border:`2px solid ${(m.color||C.blue)}44`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color||C.blue,fontFamily:F,fontWeight:700,fontSize:12,flexShrink:0 }}>{m.init}</div>
              <div style={{ flex:1,minWidth:0 }}><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>{m.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:1 }}>{m.role}</div></div>
              <Badge status={m.status||"on-site"}/>
            </div>
          ))}
          {members.length>4&&<div style={{ color:C.muted,fontFamily:F,fontSize:11,textAlign:"center",padding:"4px 0" }}>+{members.length-4} more</div>}
        </div>
      )}
      {showAdd
        ?<InlineFormShell header="👷 Add Team Member" accent={C.green} saveLabel="Add Member" onSave={submitMember} onCancel={()=>setShowAdd(false)} err={tmErr}>
            <div><label style={LBL()}>Full Name *</label><input style={INP()} value={tmName} onChange={e=>{setTmName(e.target.value);setTmErr("");}} placeholder="e.g. Marcus Webb"/></div>
            <div><label style={LBL()}>Role</label>
              <select value={tmRole} onChange={e=>setTmRole(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                {ROLES.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div><label style={LBL()}>Phone *</label><input style={INP()} value={tmPhone} onChange={e=>{setTmPhone(e.target.value);setTmErr("");}} placeholder="+971 50 000 0000"/></div>
            <div><label style={LBL()}>Status</label>
              <div style={{ display:"flex",gap:7 }}>
                {[{v:"on-site",l:"On Site"},{v:"remote",l:"Remote"}].map(s=>{const sm=SM[s.v]||{};return(<button key={s.v} onClick={()=>setTmStatus(s.v)} style={{ flex:1,padding:"8px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:tmStatus===s.v?`2px solid ${sm.color||C.green}`:`1px solid ${C.border}`,background:tmStatus===s.v?(sm.bg||C.greenDim):"transparent",color:tmStatus===s.v?(sm.color||C.green):C.muted }}>{s.l}</button>);})}
              </div>
            </div>
          </InlineFormShell>
        :<div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>{ setTmName("");setTmRole(ROLES[0]);setTmPhone("");setTmStatus("on-site");setTmErr("");setShowAdd(true); }} style={{ background:C.green,color:"#fff",border:"none",padding:"9px 18px",borderRadius:7,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>👷 + Add Member</button>
            <button onClick={onOpenTeamPage} style={{ background:"transparent",color:C.text,border:`1px solid ${C.border}`,padding:"9px 16px",borderRadius:7,fontFamily:F,fontWeight:600,fontSize:13,cursor:"pointer" }}>Full Team →</button>
          </div>
      }
    </div>
  );
}

function ModCard({ icon,title,sub,color,dim,children }){
  const [open,setOpen]=useState(false);
  return(
    <div style={{ background:C.card,border:`1px solid ${open?color+"66":C.border}`,borderRadius:12,overflow:"hidden",transition:"border-color .2s" }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ padding:"20px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,background:open?color+"0d":"transparent",userSelect:"none" }}>
        <div style={{ width:52,height:52,borderRadius:13,background:dim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{icon}</div>
        <div style={{ flex:1 }}><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>{title}</div><div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{sub}</div></div>
        <span style={{ color:open?color:C.muted,fontSize:20,transform:open?"rotate(90deg)":"none",transition:"transform .25s" }}>›</span>
      </div>
      {open&&<div style={{ padding:"0 22px 20px",borderTop:`1px solid ${C.border}22`,paddingTop:16 }}>{children}</div>}
    </div>
  );
}

// ─── Team Page ─────────────────────────────────────────────────────────────────
// ─── Edit Member Modal ─────────────────────────────────────────────────────────
function EditMemberModal({ member, allProjects, onConfirm, onCancel }){
  const [name,  setName]   = useState(member.name||"");
  const [role,  setRole]   = useState(member.role||ROLES[0]);
  const [phone, setPhone]  = useState(member.phone||"");
  const [email, setEmail]  = useState(member.email||"");
  const [projId,setProjId] = useState(member.projId||allProjects[0]?.id);
  const [status,setStatus] = useState(member.status||"on-site");
  const [type,  setType]   = useState(member.type||"employee");
  const [err,   setErr]    = useState("");

  const submit=()=>{
    if(!name.trim()){ setErr("Name is required"); return; }
    if(!phone.trim()){ setErr("Phone number is required"); return; }
    const newProj=allProjects.find(p=>p.id===projId)||allProjects.find(p=>p.id===member.projId);
    onConfirm({ name:name.trim(), role, phone:phone.trim(), email:email.trim(), projId, projectName:newProj?.name||"", status, type });
  };

  const ST=[{v:"on-site",l:"On Site"},{v:"remote",l:"Remote"}];
  const TY=[{v:"employee",l:"Employee"},{v:"subcontractor",l:"Subcontractor"}];

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:480,maxHeight:"90vh",overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <div>
            <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>✏️ Edit Team Member</div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>Update information for <strong style={{color:C.accent}}>{member.name}</strong></div>
          </div>
          <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button>
        </div>

        {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"9px 14px",color:C.red,fontFamily:F,fontSize:12,marginBottom:16 }}>⚠ {err}</div>}

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {/* Name */}
          <div>
            <label style={LBL()}>Full Name *</label>
            <input style={INP()} value={name} onChange={e=>{setName(e.target.value);setErr("");}} placeholder="e.g. Marcus Webb"/>
          </div>

          {/* Role */}
          <div>
            <label style={LBL()}>Profession / Role *</label>
            <select value={role} onChange={e=>setRole(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Phone + Email */}
          <div style={{ display:"flex",gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={LBL()}>Phone Number *</label>
              <input style={INP()} value={phone} onChange={e=>{setPhone(e.target.value);setErr("");}} placeholder="+971 50 000 0000"/>
            </div>
            <div style={{ flex:1 }}>
              <label style={LBL()}>Email <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
              <input style={INP()} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/>
            </div>
          </div>

          {/* Assigned Project */}
          <div>
            <label style={LBL()}>Assigned Project</label>
            <select value={projId} onChange={e=>setProjId(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              {allProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={LBL()}>Status</label>
            <div style={{ display:"flex",gap:8 }}>
              {ST.map(s=>(
                <button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${C.green}`:`1px solid ${C.border}`,background:status===s.v?C.greenDim:"transparent",color:status===s.v?C.green:C.muted,transition:"all .15s" }}>{s.l}</button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label style={LBL()}>Type</label>
            <div style={{ display:"flex",gap:8 }}>
              {TY.map(t=>(
                <button key={t.v} onClick={()=>setType(t.v)} style={{ flex:1,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:type===t.v?`2px solid ${C.blue}`:`1px solid ${C.border}`,background:type===t.v?C.blueDim:"transparent",color:type===t.v?C.blue:C.muted,transition:"all .15s" }}>{t.l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex",gap:10,marginTop:24 }}>
          <button onClick={submit} style={{ flex:1,background:C.accent,color:"#000",border:"none",padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Save Changes</button>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"12px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ member, taskCount, onConfirm, onCancel }){
  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.red}44`,borderRadius:16,padding:32,width:420 }}>
        {/* Icon */}
        <div style={{ width:56,height:56,borderRadius:"50%",background:C.redDim,border:`2px solid ${C.red}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 20px" }}>🗑️</div>

        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18,marginBottom:8 }}>Remove Team Member?</div>
          <div style={{ color:C.muted,fontFamily:F,fontSize:13,lineHeight:1.6 }}>
            You are about to remove <strong style={{color:C.text}}>{member.name}</strong> ({member.role}) from this project.
            {taskCount>0&&<span style={{display:"block",marginTop:8,color:C.accent}}>⚠️ They have <strong>{taskCount} assigned task{taskCount!==1?"s":""}</strong> that will be unassigned.</span>}
          </div>
        </div>

        {/* Member preview */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 18px",marginBottom:22,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ width:42,height:42,borderRadius:"50%",background:(member.color||C.blue)+"22",border:`2px solid ${(member.color||C.blue)}55`,display:"flex",alignItems:"center",justifyContent:"center",color:member.color||C.blue,fontFamily:F,fontWeight:700,fontSize:14,flexShrink:0 }}>{member.init}</div>
          <div>
            <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{member.name}</div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{member.role} · {member.status}</div>
          </div>
        </div>

        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,background:"transparent",color:C.text,border:`1px solid ${C.border}`,padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:600,fontSize:13,cursor:"pointer" }}>Keep Member</button>
          <button onClick={onConfirm} style={{ flex:1,background:C.red,color:"#fff",border:"none",padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>Yes, Remove</button>
        </div>
      </div>
    </Overlay>
  );
}

function TeamPage({ project,onBack,onAddToLog,tasks=[],updateTask }){
  const { members,ready,addMember,removeMember,updateMember }=useTeam(project.id);
  const { allProjects }=useProjects();
  const [showAdd,setShowAdd]   = useState(false);
  const [editing,setEditing]   = useState(null);
  const [deleting,setDeleting] = useState(null);
  const [confirmEditData,setConfirmEditData] = useState(null); // {member, patch}

  const taskCountFor=(name)=>tasks.filter(t=>t.member===name).length;

  const handleAdd=async(m)=>{
    await addMember(m);
    onAddToLog(`${m.name} added to team`,"👷");
    setShowAdd(false);
  };

  const handleEditConfirm=async(patch)=>{
    const oldName=editing.name;
    await updateMember(editing.id, patch);
    if(updateTask && patch.name && patch.name!==oldName){
      tasks.filter(t=>t.member===oldName).forEach(t=>updateTask(t.id,{ member:patch.name }));
    }
    onAddToLog(`${oldName}${patch.name!==oldName?" → "+patch.name:""} updated`,"✏️");
    setEditing(null);
    setConfirmEditData(null);
  };

  const handleDeleteConfirm=async()=>{
    const m=deleting;
    await removeMember(m.id);
    if(updateTask){
      tasks.filter(t=>t.member===m.name).forEach(t=>updateTask(t.id,{ member:"Unassigned" }));
    }
    onAddToLog(`${m.name} removed from team`,"🗑️");
    setDeleting(null);
  };

  return(
    <div>
      {showAdd  && <AddMemberModal project={project} onConfirm={handleAdd} onCancel={()=>setShowAdd(false)}/>}
      {editing  && <EditMemberModal member={editing} allProjects={allProjects}
          onConfirm={patch=>{ setConfirmEditData({member:editing,patch}); setEditing(null); }}
          onCancel={()=>setEditing(null)}/>}
      {confirmEditData&&(
        <ConfirmDialog
          title="Save Member Changes?"
          message="Are you sure you want to apply these changes to this team member?"
          confirmLabel="Yes, Save" variant="edit"
          onConfirm={()=>handleEditConfirm(confirmEditData.patch)}
          onCancel={()=>setConfirmEditData(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:(confirmEditData.member.color||C.blue)+"22",border:`2px solid ${(confirmEditData.member.color||C.blue)}44`,display:"flex",alignItems:"center",justifyContent:"center",color:confirmEditData.member.color||C.blue,fontFamily:F,fontWeight:700,fontSize:13,flexShrink:0 }}>{confirmEditData.member.init}</div>
            <div><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>{confirmEditData.member.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{confirmEditData.patch.name&&confirmEditData.patch.name!==confirmEditData.member.name?`Rename to "${confirmEditData.patch.name}"`:confirmEditData.member.role}</div></div>
          </div>
        </ConfirmDialog>
      )}
      {deleting && (
        <ConfirmDialog
          title="Remove Team Member?"
          message={`Are you sure you want to remove ${deleting.name} (${deleting.role}) from this project? This action cannot be undone.${taskCountFor(deleting.name)>0?" They have "+taskCountFor(deleting.name)+" assigned task(s) that will be unassigned.":""}`}
          confirmLabel="Yes, Remove" variant="delete"
          onConfirm={handleDeleteConfirm}
          onCancel={()=>setDeleting(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:42,height:42,borderRadius:"50%",background:(deleting.color||C.blue)+"22",border:`2px solid ${(deleting.color||C.blue)}55`,display:"flex",alignItems:"center",justifyContent:"center",color:deleting.color||C.blue,fontFamily:F,fontWeight:700,fontSize:14,flexShrink:0 }}>{deleting.init}</div>
            <div><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{deleting.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{deleting.role} · {deleting.status}</div></div>
          </div>
        </ConfirmDialog>
      )}

      {/* Breadcrumb */}
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:22 }}>
        <button onClick={()=>onBack("projects")} style={{ background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"6px 14px",borderRadius:7,fontFamily:F,fontSize:12,cursor:"pointer" }}>Projects</button>
        <span style={{ color:C.border,fontSize:14 }}>›</span>
        <button onClick={()=>onBack("detail")} style={{ background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"6px 14px",borderRadius:7,fontFamily:F,fontSize:12,cursor:"pointer" }}>{project.name}</button>
        <span style={{ color:C.border,fontSize:14 }}>›</span>
        <span style={{ color:C.accent,fontFamily:F,fontSize:13,fontWeight:700 }}>Team</span>
      </div>

      {/* Project header */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"24px 28px",marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
              <div style={{ width:4,height:26,background:C.green,borderRadius:2 }}/>
              <h1 style={{ color:C.text,fontFamily:F,fontSize:22,fontWeight:700,margin:0 }}>{project.name}</h1>
              <Badge status={project.status}/>
            </div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:13,marginLeft:14 }}>📍 {project.address}</div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 22px",borderRadius:9,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>+ Add Member</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap" }}>
        {[["Total",members.length,C.blue],["On Site",members.filter(m=>m.status==="on-site").length,C.green],["Remote",members.filter(m=>m.status==="remote").length,C.accent]].map(([l,v,c])=>(
          <div key={l} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 20px",flex:1,minWidth:100 }}>
            <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginBottom:5 }}>{l}</div>
            <div style={{ color:c,fontFamily:F,fontWeight:700,fontSize:28,lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Members list */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 24px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>👷 Project Team</span>
          <span style={{ background:C.greenDim,color:C.green,padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:700,fontFamily:F }}>{members.length} members</span>
        </div>

        {!ready&&<div style={{ color:C.muted,fontFamily:F,fontSize:13,padding:"24px 0",textAlign:"center" }}>Loading…</div>}

        {ready&&members.length===0&&(
          <div style={{ border:`2px dashed ${C.border}`,borderRadius:10,padding:"40px 20px",textAlign:"center",color:C.muted,fontFamily:F,fontSize:13 }}>
            <div style={{ fontSize:36,marginBottom:10 }}>👷</div>No members yet — click <strong>+ Add Member</strong> to get started
          </div>
        )}

        {ready&&members.length>0&&(
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {members.map(m=>{
              const tc=taskCountFor(m.name);
              return(
                <div key={m.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,transition:"border-color .18s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent+"55"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>

                  {/* Avatar */}
                  <div style={{ width:46,height:46,borderRadius:"50%",background:(m.color||C.blue)+"22",border:`2px solid ${(m.color||C.blue)}55`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color||C.blue,fontFamily:F,fontWeight:700,fontSize:15,flexShrink:0 }}>{m.init}</div>

                  {/* Info */}
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15 }}>{m.name}</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3,display:"flex",gap:14,flexWrap:"wrap" }}>
                      <span>🔨 {m.role}</span>
                      {m.phone&&<span>📞 {m.phone}</span>}
                      {m.email&&<span>✉️ {m.email}</span>}
                      {tc>0&&<span style={{ color:C.blue }}>{tc} task{tc!==1?"s":""}</span>}
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end",flexShrink:0 }}>
                    <Badge status={m.type||"employee"}/>
                    <Badge status={m.status||"on-site"}/>
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex",gap:8,flexShrink:0 }}>
                    <button onClick={()=>setEditing(m)} style={{ background:C.blueDim,color:C.blue,border:`1px solid ${C.blue}44`,padding:"7px 14px",borderRadius:7,fontFamily:F,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background=C.blue;e.currentTarget.style.color="#fff";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=C.blueDim;e.currentTarget.style.color=C.blue;}}>
                      ✏️ Edit
                    </button>
                    <button onClick={()=>setDeleting(m)} style={{ background:C.redDim,color:C.red,border:`1px solid ${C.red}44`,padding:"7px 14px",borderRadius:7,fontFamily:F,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background=C.red;e.currentTarget.style.color="#fff";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=C.redDim;e.currentTarget.style.color=C.red;}}>
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
function TasksPage({ tasks,addTask,updateTask,removeTask,allProjects=[] }){
  const { members:allMembers }=useAllMembers(allProjects);
  const [showAdd,setShowAdd]=useState(false);
  const [filter,setFilter]=useState("all");
  const [projFilter,setProjFilter]=useState("all");

  const filtered=useMemo(()=>tasks.filter(t=>{
    if(filter==="pending"&&t.status!=="pending")return false;
    if(filter==="done"&&t.status!=="done")return false;
    if(projFilter!=="all"&&String(t.projId)!==projFilter)return false;
    return true;
  }),[tasks,filter,projFilter]);

  const byMember=useMemo(()=>{
    const m={};
    filtered.forEach(t=>{ if(!m[t.member])m[t.member]=[]; m[t.member].push(t); });
    return m;
  },[filtered]);

  return(
    <div>
      {showAdd&&<AddTaskModal onConfirm={t=>{addTask(t);setShowAdd(false);}} onCancel={()=>setShowAdd(false)} allMembers={allMembers} allProjects={allProjects}/>}

      <PageHeader icon="✅" title="Task Management" subtitle="Assign and track work across your team"
        action={<Btn variant="primary" onClick={()=>setShowAdd(true)}>+ Assign Task</Btn>}/>

      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap" }}>
        <StatCard label="Total"     value={tasks.length}                                          sub="all tasks"   color={C.blue}/>
        <StatCard label="Pending"   value={tasks.filter(t=>t.status==="pending").length}          sub="in progress" color={C.accent}/>
        <StatCard label="Completed" value={tasks.filter(t=>t.status==="done").length}             sub="done"        color={C.green}/>
      </div>

      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
        <div style={{ display:"flex",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:4,gap:3 }}>
          {[["all","All"],["pending","Pending"],["done","Done"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ background:filter===v?C.accentDim:"transparent",color:filter===v?C.accent:C.muted,border:filter===v?`1px solid ${C.accentMid}`:"1px solid transparent",borderRadius:6,padding:"7px 14px",fontFamily:F,fontSize:12,fontWeight:700,cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        <select value={projFilter} onChange={e=>setProjFilter(e.target.value)} style={{ ...INP(),width:"auto",padding:"7px 14px",borderRadius:9,cursor:"pointer" }}>
          <option value="all">All Projects</option>
          {allProjects.map(p=><option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>
      </div>

      {Object.keys(byMember).length===0&&<div style={{ background:C.card,border:`2px dashed ${C.border}`,borderRadius:12,padding:"48px 20px",textAlign:"center",color:C.muted,fontFamily:F }}>No tasks match your filters</div>}

      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {Object.entries(byMember).map(([member,mtasks])=>{
          const mInfo=allMembers.find(m=>m.name===member);
          const col=mInfo?.color||C.blue;
          const init=member.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
          return(
            <div key={member} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
              <div style={{ padding:"14px 20px",background:col+"0d",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:col+"22",border:`2px solid ${col}55`,display:"flex",alignItems:"center",justifyContent:"center",color:col,fontFamily:F,fontWeight:700,fontSize:13,flexShrink:0 }}>{init}</div>
                <div><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{member}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{mInfo?.role||""} · {mtasks.length} task{mtasks.length!==1?"s":""}</div></div>
              </div>
              <div style={{ padding:"12px 16px",display:"flex",flexDirection:"column",gap:8 }}>
                {mtasks.map(t=>(
                  <div key={t.id} style={{ background:C.surface,border:`1px solid ${t.status==="done"?C.green+"44":C.border}`,borderRadius:9,padding:"12px 16px",display:"flex",alignItems:"center",gap:14,opacity:t.status==="done"?.7:1 }}>
                    <button onClick={()=>updateTask(t.id,{status:t.status==="done"?"pending":"done"})} style={{ width:22,height:22,borderRadius:"50%",border:`2px solid ${t.status==="done"?C.green:C.border}`,background:t.status==="done"?C.green:"transparent",color:"#000",fontSize:12,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>{t.status==="done"&&"✓"}</button>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13,textDecoration:t.status==="done"?"line-through":"none" }}>{t.title}</div>
                      {t.desc&&<div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:2 }}>{t.desc}</div>}
                      <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:4,display:"flex",gap:10 }}><span>{t.project}</span><span>{t.date}</span></div>
                    </div>
                    <Badge status={t.status}/>
                    <RowBtn type="delete" onClick={()=>removeTask(t.id)}>Delete</RowBtn>
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
async function aiExtractOffer(file){
  if(!file.dataUrl) return null;
  const isImg = file.dataUrl.startsWith("data:image");
  try {
    const msgContent = isImg
      ? [{ type:"image", source:{ type:"base64", media_type: file.dataUrl.split(";")[0].split(":")[1], data: file.dataUrl.split(",")[1] }},
         { type:"text", text:'Extract supplier offer details from this image. Return ONLY valid JSON with fields: supplier (string), quantity (string e.g. "500 units"), unitPrice (number), price (number total), delivery (string e.g. "10 days"), quality (string), validity (string), notes (string). Use null for missing fields.' }]
      : [{ type:"text", text:`Extract supplier offer from this document: "${file.name}". Return ONLY valid JSON with fields: supplier, quantity (e.g. "500 units"), unitPrice (number), price (number total), delivery (e.g. "10 days"), quality, validity, notes. Use null for missing fields.` }];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:400, messages:[{ role:"user", content:msgContent }] })
    });
    const data = await res.json();
    const text = data.content?.find(b=>b.type==="text")?.text||"";
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  } catch(e){ return null; }
}

// ─── Upload Offer Modal (AI-powered) ──────────────────────────────────────────
function UploadOfferModal({ tenderId, onConfirm, onCancel }){
  const [step,setStep]=useState("drop"); // drop | extracting | review
  const [file,setFile]=useState(null);
  const [supplier,setSupplier]=useState("");
  const [quantity,setQuantity]=useState("");
  const [unitPrice,setUnitPrice]=useState("");
  const [price,setPrice]=useState("");
  const [delivery,setDelivery]=useState("");
  const [quality,setQuality]=useState("");
  const [validity,setValidity]=useState("");
  const [notes,setNotes]=useState("");
  const [aiNote,setAiNote]=useState("");
  const dropRef=useRef();

  const handleFile=async(raw)=>{
    let du=null;
    if(raw.size<5*1024*1024){ du=await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);}); }
    const f={name:raw.name,size:raw.size,dataUrl:du};
    setFile(f); setStep("extracting");
    const result = await aiExtractOffer(f);
    if(result){
      if(result.supplier)  setSupplier(result.supplier);
      if(result.quantity)  setQuantity(String(result.quantity||''));
      if(result.unitPrice) setUnitPrice(String(result.unitPrice));
      if(result.price)     setPrice(String(result.price));
      if(result.delivery)  setDelivery(result.delivery);
      if(result.quality)   setQuality(result.quality);
      if(result.validity)  setValidity(result.validity);
      if(result.notes)     setNotes(result.notes);
      setAiNote("OK AI extracted data — review and edit before saving.");
    } else {
      setAiNote("⚠️ Could not auto-extract. Please fill in the details manually.");
    }
    setStep("review");
  };

  const save=()=>{
    onConfirm({ id:`o${Date.now()}`, supplier:supplier.trim()||"Unknown", quantity:quantity.trim(), unitPrice:parseFloat(unitPrice)||null, price:parseFloat(price)||0, delivery:delivery.trim(), quality:quality.trim(), validity:validity.trim(), notes:notes.trim(), fileName:file?.name });
  };

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,width:520,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"22px 26px 0",flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>📤 Upload Supplier Offer</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>Upload any document, image or screenshot</div>
            </div>
            <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button>
          </div>
          {/* Step indicators */}
          <div style={{ display:"flex",gap:0,marginBottom:20 }}>
            {[["1","Upload"],["2","AI Extract"],["3","Review & Save"]].map(([n,l],i)=>{
              const done=(step==="extracting"&&i===0)||(step==="review"&&i<=1);
              const active=(step==="drop"&&i===0)||(step==="extracting"&&i===1)||(step==="review"&&i===2);
              return(<div key={n} style={{ display:"flex",alignItems:"center",flex:i<2?0:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:24,height:24,borderRadius:"50%",background:done?C.green:active?C.accent:C.border,color:done||active?"#000":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:700,fontSize:11,flexShrink:0,transition:"all .2s" }}>{done?"✓":n}</div>
                  <span style={{ color:active?C.text:done?C.green:C.muted,fontFamily:F,fontSize:12,fontWeight:active?700:400,whiteSpace:"nowrap" }}>{l}</span>
                </div>
                {i<2&&<div style={{ width:20,height:2,background:done?C.green:C.border,borderRadius:1,margin:"0 8px",flexShrink:0 }}/>}
              </div>);
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:"0 26px" }}>
          {/* Step: drop */}
          {step==="drop"&&(
            <div style={{ paddingBottom:8 }}>
              <div onClick={()=>dropRef.current.click()} onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
                style={{ border:`2px dashed ${C.accent}55`,borderRadius:12,padding:"44px 20px",textAlign:"center",cursor:"pointer",background:C.accentDim,transition:"all .2s",marginBottom:16 }}>
                <div style={{ fontSize:40,marginBottom:10 }}>📎</div>
                <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15,marginBottom:6 }}>Drop offer document here</div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginBottom:12 }}>PDF · Images · Screenshots · Word docs</div>
                <div style={{ display:"inline-block",background:C.accent,color:"#000",padding:"9px 22px",borderRadius:7,fontFamily:F,fontWeight:700,fontSize:13 }}>Browse Files</div>
                <input ref={dropRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handleFile(f);e.target.value="";}}/>
              </div>
              <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px" }}>
                <div style={{ color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8 }}>Supported formats</div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {["📄 PDF","🖼️ Images","📧 Email screenshots","💬 Message screenshots","📝 Word docs"].map(t=>(
                    <span key={t} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:"3px 9px",color:C.muted,fontFamily:F,fontSize:11 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: extracting */}
          {step==="extracting"&&(
            <div style={{ paddingBottom:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 0" }}>
              <div style={{ width:60,height:60,borderRadius:"50%",background:C.purpleDim,border:`2px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16 }}>🤖</div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16,marginBottom:8 }}>Analysing document…</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:13,marginBottom:20 }}>Extracting supplier, price, delivery & specs</div>
              <div style={{ display:"flex",gap:6 }}>
                {[0,1,2].map(i=><div key={i} style={{ width:8,height:8,borderRadius:"50%",background:C.purple,animation:`bounce .9s ${i*0.2}s infinite` }}/>)}
              </div>
            </div>
          )}

          {/* Step: review */}
          {step==="review"&&(
            <div style={{ paddingBottom:8 }}>
              {aiNote&&<div style={{ background:aiNote.startsWith("OK")?C.greenDim:C.accentDim,border:`1px solid ${aiNote.startsWith("OK")?C.green+"44":C.accent+"44"}`,borderRadius:8,padding:"9px 13px",color:aiNote.startsWith("OK")?C.green:C.accent,fontFamily:F,fontSize:12,marginBottom:14 }}>{aiNote}</div>}
              {file&&<div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:18 }}>{file.dataUrl?.startsWith("data:image")?"🖼️":"📄"}</span>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{file.name}</div>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:10,marginTop:1 }}>{file.size?(file.size/1024).toFixed(1)+" KB":""}</div>
                </div>
                {file.dataUrl?.startsWith("data:image")&&<img src={file.dataUrl} alt="" style={{ width:44,height:44,objectFit:"cover",borderRadius:4,border:`1px solid ${C.border}` }}/>}
              </div>}
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div><label style={LBL()}>Supplier / Company Name *</label><input style={INP()} value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="e.g. Gulf Steel Co."/></div>
                <div style={{ display:"flex",gap:12 }}>
                  <div style={{ flex:1 }}><label style={LBL()}>Quantity</label><input style={INP()} value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="e.g. 500 tonnes"/></div>
                  <div style={{ flex:1 }}><label style={LBL()}>Unit Price</label><input style={INP()} type="number" value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} placeholder="0.00"/></div>
                  <div style={{ flex:1 }}><label style={LBL()}>Total Price *</label><input style={INP()} type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00"/></div>
                </div>
                <div style={{ display:"flex",gap:12 }}>
                  <div style={{ flex:1 }}><label style={LBL()}>Delivery Time</label><input style={INP()} value={delivery} onChange={e=>setDelivery(e.target.value)} placeholder="e.g. 10 days"/></div>
                  <div style={{ flex:1 }}><label style={LBL()}>Offer Validity</label><input style={INP()} value={validity} onChange={e=>setValidity(e.target.value)} placeholder="e.g. 30 days"/></div>
                </div>
                <div><label style={LBL()}>Quality / Specifications</label><input style={INP()} value={quality} onChange={e=>setQuality(e.target.value)} placeholder="e.g. High – ISO certified"/></div>
                <div><label style={LBL()}>Notes</label><textarea style={{ ...INP(),resize:"none" }} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Conditions, inclusions, exclusions…"/></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"18px 26px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",gap:10 }}>
          {step==="drop"&&<button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>}
          {step==="review"&&<>
            <button onClick={()=>{setStep("drop");setFile(null);}} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>← Upload Another</button>
            <button onClick={save} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 28px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>✓ Save Offer</button>
          </>}
        </div>
      </div>
    </Overlay>
  );
}

// ─── TENDERS PAGE ──────────────────────────────────────────────────────────────
function TendersPage({ allProjects=[] }){
  const { tenders,ready,addTender,removeTender,addOffer,removeOffer }=useTenders();
  const [showAddMat,setShowAddMat]=useState(false);
  const [addingOffer,setAddingOffer]=useState(null);
  const [analyses,setAnalyses]=useState({});
  const [analysing,setAnalysing]=useState(null);
  const [expanded,setExpanded]=useState({});
  const [confirmDelTender,setConfirmDelTender]=useState(null);
  const [confirmDelOffer,setConfirmDelOffer]=useState(null);
  const [mName,setMName]=useState("");const [mProj,setMProj]=useState(allProjects[0]?.id||"");const [mDesc,setMDesc]=useState("");const [mErr,setMErr]=useState("");


  const submitMat=()=>{ if(!mName.trim()){setMErr("Name required");return;} addTender({ id:`ten${Date.now()}`,name:mName.trim(),projId:mProj,project:allProjects.find(p=>p.id===mProj)?.name||"",desc:mDesc.trim(),offers:[] }); setMName("");setMDesc("");setShowAddMat(false); };


  const runAnalysis=(tender)=>{
    setAnalysing(tender.id);
    setTimeout(()=>{
      const offers=[...tender.offers]; if(offers.length===0){setAnalysing(null);return;}
      const minP=Math.min(...offers.map(o=>o.price));const maxP=Math.max(...offers.map(o=>o.price));
      const qualKeywords=["premium","high","iso","certified","en-","bs ","grade a"];
      const scored=offers.map(o=>{
        const priceScore=(maxP-o.price)/(maxP-minP||1)*40;
        const qualScore=qualKeywords.filter(k=>o.quality.toLowerCase().includes(k)).length*8;
        const delivDays=parseInt(o.delivery)||99;
        const delivScore=Math.max(0,30-(delivDays-3));
        const total=priceScore+qualScore+delivScore;
        return{ ...o,priceScore,qualScore,delivScore,total };
      });
      const sorted=[...scored].sort((a,b)=>b.total-a.total);
      const ranked=sorted.map((o,i)=>({...o,rank:i+1}));
      const best=ranked[0];
      const priceRange=`$${minP.toLocaleString()} – $${maxP.toLocaleString()}`;
      const analysis={
        summary:`${offers.length} offers received for "${tender.name}". Prices range from ${priceRange}. Delivery times vary between ${Math.min(...offers.map(o=>parseInt(o.delivery)||99))} and ${Math.max(...offers.map(o=>parseInt(o.delivery)||99))} days. Quality levels range from standard to ${offers.some(o=>o.quality.toLowerCase().includes("premium"))?"premium-grade certified":"high-grade material"}.`,
        recommendation:`${best.supplier} offers the best overall value — scoring highest across price competitiveness, quality, and delivery speed. ${best.quality.toLowerCase().includes("certified")||best.quality.toLowerCase().includes("iso")||best.quality.toLowerCase().includes("premium")?"Their certified material quality reduces risk of rework or structural issues.":"Their offering balances cost and reliability well."} Delivery in ${best.delivery} keeps the project timeline on track. ${ranked.length>1?`The next-best option is ${ranked[1].supplier} at $${ranked[1].price.toLocaleString()}, which scores lower due to ${ranked[1].delivery>best.delivery?"longer delivery time":"slightly lower quality rating"}.`:""}`,
        ranked,
      };
      setAnalyses(prev=>({...prev,[tender.id]:analysis}));
      setAnalysing(null);
    },1400);
  };

  if(!ready)return <div style={{ color:C.muted,fontFamily:F,padding:40,textAlign:"center" }}>Loading…</div>;

  return(
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {confirmDelTender&&(
        <ConfirmDialog title="Delete Tender?"
          message={`Delete "${confirmDelTender.name}" and all its offers? This cannot be undone.`}
          confirmLabel="Yes, Delete" variant="delete"
          onConfirm={()=>{ removeTender(confirmDelTender.id); setConfirmDelTender(null); }}
          onCancel={()=>setConfirmDelTender(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ color:C.accent,fontFamily:F,fontWeight:700 }}>{confirmDelTender.name}</span>
            <span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{confirmDelTender.offers?.length||0} offer{confirmDelTender.offers?.length!==1?"s":""}</span>
          </div>
        </ConfirmDialog>
      )}
      {confirmDelOffer&&(
        <ConfirmDialog title="Remove Offer?"
          message={`Remove this offer from "${confirmDelOffer.tenderName}"?`}
          confirmLabel="Yes, Remove" variant="delete"
          onConfirm={()=>{ removeOffer(confirmDelOffer.tenderId,confirmDelOffer.offerId); setConfirmDelOffer(null); }}
          onCancel={()=>setConfirmDelOffer(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ color:C.text,fontFamily:F,fontWeight:600 }}>{confirmDelOffer.supplierName||"Supplier"}</span>
            {confirmDelOffer.price&&<span style={{ color:C.accent,fontFamily:F,fontWeight:700 }}>${Number(confirmDelOffer.price).toLocaleString()}</span>}
          </div>
        </ConfirmDialog>
      )}

      {showAddMat&&(
        <Overlay onClose={()=>setShowAddMat(false)}>
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:460 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>Add Material / Good</span><button onClick={()=>setShowAddMat(false)} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button></div>
            {mErr&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"8px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:14 }}>{mErr}</div>}
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div><label style={LBL()}>Material / Good Name *</label><input style={INP()} placeholder="e.g. Structural Steel Beams" value={mName} onChange={e=>{setMName(e.target.value);setMErr("");}}/></div>
              <div><label style={LBL()}>Associated Project</label><select value={mProj} onChange={e=>setMProj(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>{allProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label style={LBL()}>Description (optional)</label><textarea style={{ ...INP(),resize:"none" }} rows={2} placeholder="Specifications, quantity…" value={mDesc} onChange={e=>setMDesc(e.target.value)}/></div>
            </div>
            <div style={{ display:"flex",gap:10,marginTop:22 }}>
              <button onClick={submitMat} style={{ flex:1,background:C.accent,color:"#000",border:"none",padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Add Material</button>
              <button onClick={()=>setShowAddMat(false)} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"12px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </Overlay>
      )}

          {addingOffer&&<UploadOfferModal tenderId={addingOffer} onConfirm={o=>{addOffer(addingOffer,o);setAddingOffer(null);}} onCancel={()=>setAddingOffer(null)}/>}

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div><h2 style={{ color:C.text,fontSize:22,fontFamily:F,fontWeight:700,margin:0 }}>Tenders</h2><div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>Procurement offers for materials & goods</div></div>
        <button onClick={()=>setShowAddMat(true)} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 22px",borderRadius:9,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>+ Add Material</button>
      </div>

      {tenders.length===0&&<div style={{ background:C.card,border:`2px dashed ${C.border}`,borderRadius:14,padding:"60px 20px",textAlign:"center",color:C.muted,fontFamily:F }}><div style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:6 }}>No tenders yet</div><div style={{ fontSize:13 }}>Add a material to start collecting supplier offers</div></div>}

      <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
        {tenders.map(tender=>{
          const open=!!expanded[tender.id];
          const analysis=analyses[tender.id];
          const isAnalysing=analysing===tender.id;
          return(
            <div key={tender.id} style={{ background:C.card,border:`1px solid ${open?C.accent+"55":C.border}`,borderRadius:14,overflow:"hidden",transition:"border-color .2s" }}>
              <div onClick={()=>setExpanded(p=>({...p,[tender.id]:!open}))} style={{ padding:"18px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,background:open?C.accentDim:"transparent",userSelect:"none" }}>
                <div style={{ width:48,height:48,borderRadius:12,background:C.accentDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.accent,flexShrink:0 }}>MAT</div>
                <div style={{ flex:1 }}><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>{tender.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{tender.project} · {tender.offers.length} offer{tender.offers.length!==1?"s":""}  {tender.desc&&`· ${tender.desc}`}</div></div>
                <span style={{ color:open?C.accent:C.muted,fontSize:20,transform:open?"rotate(90deg)":"none",transition:"transform .25s" }}>›</span>
                <button onClick={e=>{e.stopPropagation();setConfirmDelTender(tender);}} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,padding:"4px 10px",borderRadius:6,fontFamily:F,fontSize:11,fontWeight:700,cursor:"pointer" }}>Delete</button>
              </div>

              {open&&<div style={{ padding:"0 22px 22px",borderTop:`1px solid ${C.border}22` }}>
                {tender.offers.length===0?<div style={{ textAlign:"center",padding:"28px 0",color:C.muted,fontFamily:F,fontSize:13 }}>No offers yet — add one below</div>:(
                  <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,overflow:"auto",margin:"16px 0 14px" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:12 }}>
                      <thead><tr style={{ background:C.bg,borderBottom:`1px solid ${C.border}` }}>{["Rank","Supplier","Qty","Unit Price","Total","Quality","Delivery",""].map(h=><th key={h} style={{ color:C.muted,fontWeight:700,padding:"8px 12px",textAlign:"left",fontSize:11,whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                      <tbody>{tender.offers.map((o,i)=>{
                        const rank=analysis?.ranked?.find(r=>r.id===o.id)?.rank;
                        const rankColors={1:C.green,2:C.accent,3:C.muted};
                        return(
                          <tr key={o.id} style={{ borderBottom:i<tender.offers.length-1?`1px solid ${C.border}22`:"none",background:rank===1?C.green+"06":"transparent" }}>
                            <td style={{ padding:"10px 12px" }}>{rank?<span style={{ background:rankColors[rank]||"#fff1",color:rankColors[rank]||"#aaa",borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700 }}>#{rank}</span>:<span style={{ color:C.muted,fontSize:11 }}>—</span>}</td>
                            <td style={{ color:C.text,padding:"10px 12px",fontWeight:700 }}>{o.supplier}{rank===1&&<span style={{ marginLeft:6,fontSize:10 }}>⭐</span>}</td>
                            <td style={{ color:C.muted,padding:"10px 12px",fontSize:11 }}>{o.quantity||"—"}</td>
                            <td style={{ color:C.muted,padding:"10px 12px",fontSize:11 }}>{o.unitPrice?`$${Number(o.unitPrice).toLocaleString()}`:"—"}</td>
                            <td style={{ color:C.accent,padding:"10px 12px",fontWeight:700 }}>${Number(o.price).toLocaleString()}</td>
                            <td style={{ color:C.text,padding:"10px 12px",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{o.quality||"—"}</td>
                            <td style={{ color:C.muted,padding:"10px 12px",whiteSpace:"nowrap" }}>{o.delivery||"—"}</td>
                            <td style={{ color:C.muted,padding:"10px 12px",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{o.notes||"—"}</td>
                            <td style={{ padding:"10px 12px" }}><RowBtn type="delete" onClick={()=>setConfirmDelOffer({tenderId:tender.id,offerId:o.id,tenderName:tender.name,supplierName:o.supplier,price:o.price})}>Delete</RowBtn></td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                )}

                <div style={{ display:"flex",gap:10,marginBottom:analysis?16:0 }}>
                  <Btn variant="secondary" onClick={()=>setAddingOffer(tender.id)}>+ Add Offer</Btn>
                  {tender.offers.length>=2&&(
                    <Btn variant="ghost" disabled={isAnalysing} onClick={()=>runAnalysis(tender)}
                      style={{ color:isAnalysing?C.purple:"#fff", background:isAnalysing?"transparent":C.purple, border:`1px solid ${C.purple}44` }}>
                      {isAnalysing?<><div style={{ width:13,height:13,border:`2px solid ${C.purple}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Analysing…</>:"🤖 AI Analysis"}
                    </Btn>
                  )}
                </div>

                {analysis&&(
                  <div style={{ background:"linear-gradient(135deg,#a78bfa08,#3b82f608)",border:`1px solid ${C.purple}33`,borderRadius:12,padding:"20px 22px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
                      <div style={{ width:30,height:30,borderRadius:8,background:C.purpleDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🤖</div>
                      <span style={{ color:C.purple,fontFamily:F,fontWeight:700,fontSize:15 }}>AI Analysis</span>
                      <span style={{ color:C.muted,fontFamily:F,fontSize:11,marginLeft:"auto" }}>Scored on price, quality & delivery</span>
                    </div>

                    <div style={{ marginBottom:14 }}>
                      <SLabel>Summary</SLabel>
                      <div style={{ color:C.text,fontFamily:F,fontSize:13,lineHeight:1.65 }}>{analysis.summary}</div>
                    </div>

                    <div style={{ marginBottom:16 }}>
                      <SLabel>Rankings</SLabel>
                      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                        {analysis.ranked.map(r=>{
                          const medal=r.rank===1?"🥇":r.rank===2?"🥈":"🥉";
                          const bc=r.rank===1?C.green:r.rank===2?C.accent:C.muted;
                          return(
                            <div key={r.id} style={{ display:"flex",alignItems:"center",gap:12,background:r.rank===1?C.green+"0d":C.surface,border:`1px solid ${r.rank===1?C.green+"44":C.border}`,borderRadius:9,padding:"12px 16px" }}>
                              <span style={{ fontSize:20,flexShrink:0 }}>{medal}</span>
                              <div style={{ flex:1,minWidth:0 }}>
                                <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{r.supplier}{r.rank===1&&<span style={{ color:C.green,fontSize:11,fontWeight:600,marginLeft:8 }}>Best Pick</span>}</div>
                                <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:2,display:"flex",gap:12,flexWrap:"wrap" }}>
                                  <span style={{ color:C.accent,fontWeight:700 }}>${r.price.toLocaleString()}</span>
                                  <span>{r.quality}</span>
                                  <span>🚚 {r.delivery}</span>
                                </div>
                              </div>
                              <div style={{ display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end",flexShrink:0 }}>
                                {[["Price",r.priceScore,40],["Quality",r.qualScore,40],["Delivery",r.delivScore,30]].map(([lbl,val,max])=>(
                                  <div key={lbl} style={{ display:"flex",alignItems:"center",gap:6 }}>
                                    <span style={{ color:C.muted,fontFamily:F,fontSize:9,width:44,textAlign:"right" }}>{lbl}</span>
                                    <div style={{ width:60,height:4,background:C.border,borderRadius:2,overflow:"hidden" }}><div style={{ width:`${Math.min(100,(val/max)*100)}%`,height:"100%",background:bc,borderRadius:2 }}/></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ background:C.green+"0d",border:`1px solid ${C.green}33`,borderRadius:9,padding:"14px 18px" }}>
                      <div style={{ color:C.green,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:6 }}>Recommendation</div>
                      <div style={{ color:C.text,fontFamily:F,fontSize:13,lineHeight:1.65 }}>{analysis.recommendation}</div>
                    </div>
                  </div>
                )}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Payments Page ─────────────────────────────────────────────────────────────
const PAYMENT_METHODS = ["Bank Transfer","Cash","Cheque","Card","Online Transfer","Other"];

function AddPaymentModal({ allProjects, allInvoices, onConfirm, onCancel }){
  const [projId,setProjId]  = useState(allProjects[0]?.id||null);
  const [amount,setAmount]  = useState("");
  const [date,setDate]      = useState("");
  const [method,setMethod]  = useState(PAYMENT_METHODS[0]);
  const [invRef,setInvRef]  = useState("");
  const [notes,setNotes]    = useState("");
  const [receipt,setReceipt]= useState(null);
  const [err,setErr]        = useState("");
  const fileRef             = useRef();

  const proj = allProjects.find(p=>p.id===projId);
  const projInvoices = allInvoices.filter(i=>i.projId===projId||i.project===proj?.name);

  const handleFile=async(raw)=>{
    if(raw.size>5*1024*1024){ setErr("File too large (max 5MB)"); return; }
    const du=await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);});
    setReceipt({ name:raw.name, size:raw.size, dataUrl:du });
  };

  const submit=()=>{
    if(!amount||isNaN(parseFloat(amount))){ setErr("Payment amount is required"); return; }
    if(!date){ setErr("Payment date is required"); return; }
    const fmtDate=d=>new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    onConfirm({
      id:`pay-${Date.now()}`,
      projId, project:proj?.name||"",
      amount:parseFloat(amount),
      date, dateFmt:fmtDate(date),
      method, invRef:invRef||null,
      notes:notes.trim(),
      receipt:receipt||null,
      recordedAt:new Date().toLocaleDateString(),
    });
  };

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:600,maxHeight:"93vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18 }}>💰 Record Payment</div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>Record a payment received from the client</div>
          </div>
          <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"22px 28px" }}>
        {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"9px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:14 }}>⚠ {err}</div>}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div><label style={LBL()}>Project</label>
            <select value={projId} onChange={e=>setProjId(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              {allProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display:"flex",gap:12 }}>
            <div style={{ flex:1 }}><label style={LBL()}>Amount *</label><input style={INP()} type="number" placeholder="0.00" value={amount} onChange={e=>{setAmount(e.target.value);setErr("");}}/></div>
            <div style={{ flex:1 }}><label style={LBL()}>Payment Date *</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={date} onChange={e=>{setDate(e.target.value);setErr("");}}/></div>
          </div>
          <div><label style={LBL()}>Payment Method</label>
            <select value={method} onChange={e=>setMethod(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              {PAYMENT_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div><label style={LBL()}>Related Invoice <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
            <select value={invRef} onChange={e=>setInvRef(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              <option value="">— None —</option>
              {projInvoices.map(i=><option key={i.id||i.invId} value={fmtInvId(i)}>{fmtInvId(i)} · ${Number(i.amount).toLocaleString()}</option>)}
            </select>
          </div>
          <div><label style={LBL()}>Notes <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
            <textarea style={{ ...INP(),resize:"none" }} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Reference number, comments…"/>
          </div>
          {/* Receipt / document upload */}
          <div>
            <label style={LBL()}>Attach Receipt / Document <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
            {receipt
              ?<div style={{ background:C.surface,border:`1px solid ${C.green}44`,borderRadius:10,padding:"14px 16px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:42,height:42,background:C.card,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{receipt.dataUrl?.startsWith("data:image")?"🖼️":"📄"}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ color:C.green,fontFamily:F,fontWeight:700,fontSize:12 }}>✓ File attached</div>
                      <div style={{ color:C.text,fontFamily:F,fontSize:11,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{receipt.name}</div>
                    </div>
                    <button onClick={()=>setReceipt(null)} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,borderRadius:6,padding:"4px 8px",fontFamily:F,fontSize:12,cursor:"pointer" }}>Remove</button>
                  </div>
                  {receipt.dataUrl?.startsWith("data:image")&&<img src={receipt.dataUrl} alt="" style={{ maxWidth:"100%",maxHeight:180,objectFit:"contain",borderRadius:8,marginTop:10,border:`1px solid ${C.border}` }}/>}
                </div>
              :<div onClick={()=>fileRef.current.click()}
                  onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.green;e.currentTarget.style.background=C.greenDim;}}
                  onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}
                  onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
                  style={{ border:`2px dashed ${C.border}`,borderRadius:10,padding:"24px 20px",textAlign:"center",cursor:"pointer",transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green+"88";e.currentTarget.style.background=C.greenDim;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                  <div style={{ fontSize:28,marginBottom:7 }}>📎</div>
                  <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13,marginBottom:3 }}>Drop receipt or click to browse</div>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>PDF · Images · Screenshots · Any format</div>
                </div>
            }
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.doc,.docx" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handleFile(f);e.target.value="";}}/>
          </div>
        </div>
        </div>
        <div style={{ padding:"18px 28px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={submit} style={{ background:C.green,color:"#fff",border:"none",padding:"11px 32px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>💰 Save Payment</button>
        </div>
      </div>
    </Overlay>
  );
}


// ─── EditPaymentModal ─────────────────────────────────────────────────────────
function EditPaymentModal({ payment, allProjects, allInvoices, onConfirm, onCancel }){
  const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";
  const [projId,setProjId]  = useState(payment.projId||allProjects[0]?.id||null);
  const [amount,setAmount]  = useState(String(payment.amount||""));
  const [date,setDate]      = useState(payment.date||"");
  const [method,setMethod]  = useState(payment.method||PAYMENT_METHODS[0]);
  const [invRef,setInvRef]  = useState(payment.invRef||"");
  const [notes,setNotes]    = useState(payment.notes||"");
  const [receipt,setReceipt]= useState(payment.receipt||null);
  const [err,setErr]        = useState("");
  const fileRef             = useRef();

  const proj = allProjects.find(p=>p.id===projId)||allProjects[0];
  const projInvoices = allInvoices.filter(i=>i.projId===projId||i.project===proj?.name);

  const handleFile=async(raw)=>{
    if(raw.size>5*1024*1024){ setErr("File too large (max 5MB)"); return; }
    const du=await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);});
    setReceipt({ name:raw.name, size:raw.size, dataUrl:du });
  };

  const submit=()=>{
    if(!amount||isNaN(parseFloat(amount))){ setErr("Payment amount is required"); return; }
    if(!date){ setErr("Payment date is required"); return; }
    onConfirm({
      ...payment,
      projId, project:proj?.name||payment.project||"",
      amount:parseFloat(amount), date, dateFmt:fmtDate(date),
      method, invRef:invRef||null, notes:notes.trim(), receipt:receipt||null,
    });
  };

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:600,maxHeight:"93vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18 }}>✏️ Edit Payment</div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>Update payment information</div>
          </div>
          <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"22px 28px" }}>
          {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"9px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:14 }}>⚠ {err}</div>}
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div><label style={LBL()}>Project</label>
              <select value={projId} onChange={e=>setProjId(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                {allProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display:"flex",gap:12 }}>
              <div style={{ flex:1 }}><label style={LBL()}>Amount *</label><input style={INP()} type="number" placeholder="0.00" value={amount} onChange={e=>{setAmount(e.target.value);setErr("");}}/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Payment Date *</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={date} onChange={e=>{setDate(e.target.value);setErr("");}}/></div>
            </div>
            <div><label style={LBL()}>Payment Method</label>
              <select value={method} onChange={e=>setMethod(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                {PAYMENT_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div><label style={LBL()}>Related Invoice <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
              <select value={invRef} onChange={e=>setInvRef(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                <option value="">— None —</option>
                {projInvoices.map(i=><option key={i.id||i.invId} value={fmtInvId(i)}>{fmtInvId(i)} · ${Number(i.amount).toLocaleString()}</option>)}
              </select>
            </div>
            <div><label style={LBL()}>Notes <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
              <textarea style={{ ...INP(),resize:"none" }} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Reference number, comments…"/>
            </div>
            <div>
              <label style={LBL()}>Receipt / Document <span style={{fontWeight:400,color:C.muted}}>(optional — replace existing)</span></label>
              {receipt
                ?<div style={{ background:C.surface,border:`1px solid ${C.green}44`,borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:42,height:42,background:C.card,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{receipt.dataUrl?.startsWith("data:image")?"🖼️":"📄"}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ color:C.green,fontFamily:F,fontWeight:700,fontSize:12 }}>✓ Attached</div>
                        <div style={{ color:C.text,fontFamily:F,fontSize:11,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{receipt.name}</div>
                      </div>
                      <button onClick={()=>setReceipt(null)} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,borderRadius:6,padding:"4px 8px",fontFamily:F,fontSize:12,cursor:"pointer" }}>Remove</button>
                    </div>
                    {receipt.dataUrl?.startsWith("data:image")&&<img src={receipt.dataUrl} alt="" style={{ maxWidth:"100%",maxHeight:160,objectFit:"contain",borderRadius:8,marginTop:10,border:`1px solid ${C.border}` }}/>}
                  </div>
                :<div onClick={()=>fileRef.current.click()}
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.green;e.currentTarget.style.background=C.greenDim;}}
                    onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}
                    onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
                    style={{ border:`2px dashed ${C.border}`,borderRadius:10,padding:"22px 20px",textAlign:"center",cursor:"pointer",transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green+"88";e.currentTarget.style.background=C.greenDim;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                    <div style={{ fontSize:28,marginBottom:6 }}>📎</div>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,marginBottom:2 }}>Drop file or click to browse</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>PDF · Images · Screenshots</div>
                  </div>
              }
              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.doc,.docx" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handleFile(f);e.target.value="";}}/>
            </div>
          </div>
        </div>
        <div style={{ padding:"18px 28px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={submit} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 32px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Save Changes</button>
        </div>
      </div>
    </Overlay>
  );
}
function PayReceiptBtn({ receipt }){
  const [show,setShow]=useState(false);
  return(<>
    {show&&<FilePreviewModal file={receipt} onClose={()=>setShow(false)}/>}
    <button onClick={()=>setShow(true)} style={{ background:"transparent",color:C.blue,border:`1px solid ${C.blue}33`,padding:"2px 8px",borderRadius:4,fontFamily:F,fontSize:11,cursor:"pointer" }}>View</button>
  </>);
}
// Payments panel inside project detail
function PaymentsPanel({ project, payments, addPayment, updatePayment, removePayment, allProjects, allInvoices, onActivity }){
  const [showAdd,setShowAdd]=useState(false);
  const [editingPayment,setEditingPayment]=useState(null);
  const [confirmEditPay,setConfirmEditPay]=useState(null);
  const [confirmDeletePay,setConfirmDeletePay]=useState(null);
  const projPayments=payments.filter(p=>p.projId===project.id||p.project===project.name);
  const total=projPayments.reduce((s,p)=>s+p.amount,0);
  // inline form state
  const [payAmount,setPayAmount]=useState(""); const [payDate,setPayDate]=useState("");
  const [payMethod,setPayMethod]=useState(PAYMENT_METHODS[0]); const [payInvRef,setPayInvRef]=useState("");
  const [payNotes,setPayNotes]=useState(""); const [payReceipt,setPayReceipt]=useState(null);
  const [payErr,setPayErr]=useState("");
  const payFileRef=useRef();

  const projInvoices=useMemo(()=>allInvoices.filter(i=>i.projId===project.id||i.project===project.name),[allInvoices,project]);

  const handlePayFile=async(raw)=>{
    if(raw.size>5*1024*1024){setPayErr("File too large (max 5MB)");return;}
    const du=await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);});
    setPayReceipt({name:raw.name,size:raw.size,dataUrl:du});
  };

  const [paySaving,setPaySaving]=useState(false);
  const submitPay=async()=>{
    if(paySaving) return;
    if(!payAmount||isNaN(parseFloat(payAmount))){setPayErr("Payment amount is required");return;}
    if(!payDate){setPayErr("Payment date is required");return;}
    setPaySaving(true);
    try{
      const fmtD=d=>new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
      const payObj={ id:`pay-${Date.now()}`,projId:project.id,project:project.name,amount:parseFloat(payAmount),date:payDate,dateFmt:fmtD(payDate),method:payMethod,invRef:payInvRef||null,notes:payNotes.trim(),receipt:payReceipt||null,recordedAt:new Date().toLocaleDateString() };
      await Promise.resolve(addPayment(payObj));
      if(onActivity) onActivity(`Payment $${parseFloat(payAmount).toLocaleString()} recorded`,"💰");
      setPayAmount(""); setPayDate(""); setPayMethod(PAYMENT_METHODS[0]);
      setPayInvRef(""); setPayNotes(""); setPayReceipt(null); setPayErr("");
      setShowAdd(false);
    } catch(e){
      setPayErr("Save failed: "+e.message);
    } finally {
      setPaySaving(false);
    }
  };

  return(
    <div>
      {editingPayment&&(
        <EditPaymentModal payment={editingPayment} allProjects={allProjects} allInvoices={allInvoices}
          onConfirm={patch=>{ setEditingPayment(null); setConfirmEditPay({id:editingPayment.id,patch}); }}
          onCancel={()=>setEditingPayment(null)}/>
      )}
      {confirmEditPay&&(
        <ConfirmDialog title="Save Payment Changes?" message="Are you sure you want to apply these changes to this payment?"
          confirmLabel="Yes, Save" variant="edit"
          onConfirm={()=>{ updatePayment&&updatePayment(confirmEditPay.id,confirmEditPay.patch); onActivity&&onActivity(`Payment $${confirmEditPay.patch.amount?.toLocaleString()} updated`,"✏️"); setConfirmEditPay(null); }}
          onCancel={()=>setConfirmEditPay(null)}/>
      )}
      {confirmDeletePay&&(
        <ConfirmDialog title="Delete Payment?" message={`Are you sure you want to delete this payment of $${Number(confirmDeletePay.amount||0).toLocaleString()}? This action cannot be undone.`}
          confirmLabel="Yes, Delete" variant="delete"
          onConfirm={()=>{ removePayment&&removePayment(confirmDeletePay.id); onActivity&&onActivity(`Payment $${confirmDeletePay.amount?.toLocaleString()} deleted`,"🗑️"); setConfirmDeletePay(null); }}
          onCancel={()=>setConfirmDeletePay(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ color:C.muted,fontFamily:F,fontSize:13 }}>{confirmDeletePay.dateFmt}</span>
            <span style={{ color:C.green,fontFamily:F,fontWeight:700 }}>${Number(confirmDeletePay.amount||0).toLocaleString()}</span>
          </div>
        </ConfirmDialog>
      )}
      {projPayments.length>0&&!showAdd&&(
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",marginBottom:14 }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:12 }}>
            <thead><tr style={{ background:C.bg,borderBottom:`1px solid ${C.border}` }}>
              {["Date","Amount","Method","Invoice","Notes","Actions"].map(h=><th key={h} style={{ color:C.muted,fontWeight:700,padding:"8px 12px",textAlign:"left",fontSize:11 }}>{h}</th>)}
            </tr></thead>
            <tbody>{projPayments.map((p,i)=>(
              <tr key={p.id} style={{ borderBottom:i<projPayments.length-1?`1px solid ${C.border}22`:"none" }}>
                <td style={{ color:C.muted,padding:"9px 12px" }}>{p.dateFmt}</td>
                <td style={{ color:C.green,padding:"9px 12px",fontWeight:700 }}>${p.amount.toLocaleString()}</td>
                <td style={{ color:C.muted,padding:"9px 12px" }}>{p.method}</td>
                <td style={TD({color:C.accent,fontWeight:600,fontSize:11,padding:"9px 12px"})}>{resolveInvRef(p.invRef,allInvoices)}</td>
                <td style={{ color:C.muted,padding:"9px 12px",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.notes||"—"}</td>
                <td style={{ padding:"9px 12px" }}>
                  <RowActions>
                    {p.receipt&&<PayReceiptBtn receipt={p.receipt}/>}
                    <RowBtn type="edit" onClick={()=>setEditingPayment(p)}>Edit</RowBtn>
                    <RowBtn type="delete" onClick={()=>setConfirmDeletePay(p)}>Delete</RowBtn>
                  </RowActions>
                </td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ padding:"8px 14px",borderTop:`1px solid ${C.border}22`,display:"flex",justifyContent:"flex-end",gap:4 }}>
            <span style={{ color:C.muted,fontFamily:F,fontSize:11 }}>Total received:</span>
            <span style={{ color:C.green,fontFamily:F,fontWeight:700,fontSize:12 }}>${total.toLocaleString()}</span>
          </div>
        </div>
      )}
      {projPayments.length===0&&!showAdd&&<div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"10px 0",marginBottom:12 }}>No payments recorded yet</div>}
      {showAdd
        ?<InlineFormShell header="Record Payment" accent={C.green} saveLabel="Save Payment" onSave={submitPay} onCancel={()=>setShowAdd(false)} err={payErr} saving={paySaving}>
            <div style={{ display:"flex",gap:12 }}>
              <div style={{ flex:1 }}><label style={LBL()}>Amount *</label><input style={INP()} type="number" placeholder="0.00" value={payAmount} onChange={e=>{setPayAmount(e.target.value);setPayErr("");}}/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Payment Date *</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={payDate} onChange={e=>{setPayDate(e.target.value);setPayErr("");}}/></div>
            </div>
            <div><label style={LBL()}>Payment Method</label>
              <select value={payMethod} onChange={e=>setPayMethod(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label style={LBL()}>Related Invoice <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
              <select value={payInvRef} onChange={e=>setPayInvRef(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                <option value="">— None —</option>
                {projInvoices.map(i=><option key={i.id||i.invId} value={fmtInvId(i)}>{fmtInvId(i)} · ${Number(i.amount).toLocaleString()}</option>)}
              </select>
            </div>
            <div><label style={LBL()}>Notes <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label><textarea style={{ ...INP(),resize:"none" }} rows={2} value={payNotes} onChange={e=>setPayNotes(e.target.value)} placeholder="Reference number, comments…"/></div>
            <div>
              <label style={LBL()}>Attach Receipt <span style={{fontWeight:400,color:C.muted}}>(optional)</span></label>
              {payReceipt
                ?<div style={{ background:C.surface,border:`1px solid ${C.green}44`,borderRadius:9,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:34,height:34,background:C.card,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{payReceipt.dataUrl?.startsWith("data:image")?"🖼️":"📄"}</div>
                    <div style={{ flex:1,minWidth:0 }}><div style={{ color:C.green,fontFamily:F,fontWeight:700,fontSize:12 }}>✓ Attached</div><div style={{ color:C.text,fontFamily:F,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{payReceipt.name}</div></div>
                    <button onClick={()=>setPayReceipt(null)} style={{ background:"transparent",color:C.red,border:`1px solid ${C.red}33`,borderRadius:5,padding:"3px 8px",fontFamily:F,fontSize:11,cursor:"pointer" }}>Remove</button>
                  </div>
                :<div onClick={()=>payFileRef.current.click()} onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.green;e.currentTarget.style.background=C.greenDim;}} onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}} onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";const f=e.dataTransfer.files[0];if(f)handlePayFile(f);}} style={{ border:`2px dashed ${C.border}`,borderRadius:9,padding:"18px",textAlign:"center",cursor:"pointer",transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green+"88";e.currentTarget.style.background=C.greenDim;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                    <div style={{ fontSize:22,marginBottom:5 }}>📎</div>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,marginBottom:2 }}>Drop receipt or click to browse</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>PDF · Images · Screenshots</div>
                  </div>
              }
              <input ref={payFileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.doc,.docx" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handlePayFile(f);e.target.value="";}}/>
            </div>
          </InlineFormShell>
        :<Btn variant="success" onClick={()=>{ setPayAmount("");setPayDate("");setPayMethod(PAYMENT_METHODS[0]);setPayInvRef("");setPayNotes("");setPayReceipt(null);setPayErr("");setShowAdd(true); }}>+ Record Payment</Btn>
      }
    </div>
  );
}

// Global payments page
function PaymentsPage({ payments, allProjects, addPayment, allInvoices, removePayment, updatePayment }){
  const [projFilter,setProjFilter]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [editingPayment,setEditingPayment]=useState(null);
  const [confirmEditPay,setConfirmEditPay]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);

  const filtered=useMemo(()=>payments.filter(p=>{
    if(projFilter!=="all"&&String(p.projId)!==projFilter)return false;
    return true;
  }),[payments,projFilter]);

  const total=payments.reduce((s,p)=>s+p.amount,0);
  const thisMonth=payments.filter(p=>{ if(!p.date)return false; const d=new Date(p.date+"T12:00:00"); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).reduce((s,p)=>s+p.amount,0);

  return(
    <div>
      {showAdd&&<AddPaymentModal allProjects={allProjects} allInvoices={allInvoices} onConfirm={p=>{addPayment(p);setShowAdd(false);}} onCancel={()=>setShowAdd(false)}/>}
      {editingPayment&&(
        <EditPaymentModal payment={editingPayment} allProjects={allProjects} allInvoices={allInvoices}
          onConfirm={patch=>{ setEditingPayment(null); setConfirmEditPay({id:editingPayment.id,patch}); }}
          onCancel={()=>setEditingPayment(null)}/>
      )}
      {confirmEditPay&&(
        <ConfirmDialog title="Save Payment Changes?" message="Are you sure you want to apply these changes to this payment?"
          confirmLabel="Yes, Save" variant="edit"
          onConfirm={()=>{ updatePayment&&updatePayment(confirmEditPay.id,confirmEditPay.patch); setConfirmEditPay(null); }}
          onCancel={()=>setConfirmEditPay(null)}/>
      )}
      {confirmDelete&&(
        <ConfirmDialog
          title="Delete Payment?"
          message={`Are you sure you want to delete this payment of $${Number(confirmDelete.amount||0).toLocaleString()}? This action cannot be undone.`}
          confirmLabel="Yes, Delete" variant="delete"
          onConfirm={()=>{ if(removePayment)removePayment(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={()=>setConfirmDelete(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ color:C.muted,fontFamily:F,fontSize:13 }}>{confirmDelete.project} · {confirmDelete.dateFmt}</span>
            <span style={{ color:C.green,fontFamily:F,fontWeight:700 }}>${Number(confirmDelete.amount||0).toLocaleString()}</span>
          </div>
        </ConfirmDialog>
      )}
      <PageHeader icon="💳" title="Payments" subtitle="Track all client payments across projects"
        action={<Btn variant="success" size="md" onClick={()=>setShowAdd(true)}>+ Record Payment</Btn>}/>
      <div style={{ display:"flex",gap:12,marginBottom:24,flexWrap:"wrap" }}>
        <StatCard label="Total Received"  value={"$"+total.toLocaleString()}         sub={`${payments.length} transactions`} color={C.green}/>
        <StatCard label="This Month"      value={"$"+thisMonth.toLocaleString()}      sub="current month"                     color={C.blue}/>
        <StatCard label="Transactions"    value={payments.length}                     sub="all time"                          color={C.purple}/>
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
        <select value={projFilter} onChange={e=>setProjFilter(e.target.value)} style={{ ...INP(),width:"auto",padding:"8px 14px",borderRadius:8,cursor:"pointer" }}>
          <option value="all">All Projects</option>
          {allProjects.map(p=><option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>
      </div>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
        {filtered.length===0
          ?<EmptyState icon="💰" title="No payments recorded yet" sub="Record your first payment above"/>
          :<table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:13 }}>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}`,background:C.surface }}>
              {["Date","Project","Amount","Method","Invoice Ref","Notes","Receipt",""].map(h=><th key={h} style={TH()}>{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map((p,i)=>(
              <tr key={p.id} style={{ borderBottom:i<filtered.length-1?`1px solid ${C.border}22`:"none",transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={TD({color:C.muted})}>{p.dateFmt}</td>
                <td style={TD({color:C.text,fontWeight:600})}>{p.project}</td>
                <td style={TD({color:C.green,fontWeight:700})}>${p.amount.toLocaleString()}</td>
                <td style={TD({color:C.muted})}>{p.method}</td>
                <td style={TD({color:C.accent,fontWeight:700,fontSize:12})}>{resolveInvRef(p.invRef,allInvoices)}</td>
                <td style={TD({color:C.muted,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"})}>{p.notes||"—"}</td>
                <td style={TD()}>{p.receipt?<PayReceiptBtn receipt={p.receipt}/>:"—"}</td>
                <td style={TD()}>
                  <RowActions>
                    <RowBtn type="edit" onClick={()=>setEditingPayment(p)}>Edit</RowBtn>
                    <RowBtn type="delete" onClick={()=>setConfirmDelete(p)}>Delete</RowBtn>
                  </RowActions>
                </td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  );
}

// ─── REPORT GENERATOR ─────────────────────────────────────────────────────────
function ReportPage({ tasks, allProjects, allInvoices }){
  const [projId,setProjId]=useState(null);
  const [from,setFrom]=useState("2025-01-01");
  const [to,setTo]=useState("2025-12-31");
  const [report,setReport]=useState(null);
  const [generating,setGen]=useState(false);

  // Set default project once list loads
  useEffect(()=>{ if(!projId && allProjects?.length) setProjId(allProjects[0].id); },[allProjects]);

  const fmtD=(d)=>{ try{ return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }catch{return d;} };

  const generate=()=>{
    setGen(true);
    setTimeout(()=>{
      const project=(allProjects||[]).find(p=>p.id===projId);
      if(!project){ setGen(false); return; }
      const invoices=(allInvoices||[]).filter(i=>(i.projId===projId||i.project===project?.name)&&inRange(i.due,from,to));
      const ptasks=(tasks||[]).filter(t=>t.projId===projId&&inRange(t.date,from,to));
      const totalInv=invoices.reduce((s,i)=>s+Number(i.amount||0),0);
      const paidInv=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);
      setReport({ project,invoices,logs:[],notes:[],tasks:ptasks,totalInv,paidInv,members:[],from,to });
      setGen(false);
    },600);
  };

  return(
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.rpt{animation:fadeUp .3s ease}`}</style>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div><h2 style={{ color:C.text,fontSize:22,fontFamily:F,fontWeight:700,margin:0 }}>Report Generator</h2><div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>Generate a summary of any project for a selected time period</div></div>
      </div>

      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"24px 28px",marginBottom:24 }}>
        <SLabel>Report Configuration</SLabel>
        <div style={{ display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end" }}>
          <div style={{ flex:2,minWidth:200 }}><label style={LBL()}>Project</label><select value={projId||""} onChange={e=>{setProjId(e.target.value);setReport(null);}} style={{ ...INP(),cursor:"pointer" }}>{(allProjects||[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div style={{ flex:1,minWidth:140 }}><label style={LBL()}>From</label><input type="date" value={from} onChange={e=>{setFrom(e.target.value);setReport(null);}} style={{ ...INP(),colorScheme:"dark" }}/></div>
          <div style={{ flex:1,minWidth:140 }}><label style={LBL()}>To</label><input type="date" value={to} onChange={e=>{setTo(e.target.value);setReport(null);}} style={{ ...INP(),colorScheme:"dark" }}/></div>
          <button onClick={generate} disabled={generating} style={{ background:generating?"transparent":C.accent,color:generating?C.accent:"#000",border:generating?`1px solid ${C.accent}44`:"none",padding:"10px 28px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8,flexShrink:0,height:40 }}>
            {generating?<><div style={{ width:15,height:15,border:"2px solid #f59e0b44",borderTopColor:C.accent,borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Generating…</>:"Generate Report"}
          </button>
        </div>
      </div>

      {!report&&!generating&&(
        <div style={{ background:C.card,border:`2px dashed ${C.border}`,borderRadius:14,padding:"60px 20px",textAlign:"center",color:C.muted,fontFamily:F }}>
          
          <div style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:6 }}>No report generated yet</div>
          <div style={{ fontSize:13 }}>Select a project and date range, then click Generate Report</div>
        </div>
      )}

      {report&&(
        <div style={{ display:"flex",flexDirection:"column",gap:16 }} className="rpt">
          {/* Cover */}
          <div style={{ background:`linear-gradient(135deg,${C.accent}18,${C.blue}10)`,border:`1px solid ${C.accent}44`,borderRadius:16,padding:"28px 32px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12 }}>
              <div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>Project Report</div>
                <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:24 }}>{report.project.name}</div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:13,marginTop:4 }}>📍 {report.project.address}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase" }}>Reporting Period</div>
                <div style={{ color:C.accent,fontFamily:F,fontWeight:700,fontSize:15,marginTop:4 }}>{fmtD(report.from)} – {fmtD(report.to)}</div>
                <div style={{ marginTop:6 }}><Badge status={report.project.status}/></div>
              </div>
            </div>
            <div style={{ display:"flex",gap:24,marginTop:22,flexWrap:"wrap" }}>
              {[["Phase",report.project.phase],["Progress",report.project.progress+"%"],["Contract Value","$"+report.project.value.toLocaleString()],["Client",report.project.client?.name||report.project.client?.company||"—"],["Due",report.project.dueFmt]].map(([k,v])=>(
                <div key={k}><div style={{ color:C.muted,fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>{k}</div><div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:14,marginTop:3 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ marginTop:16 }}><Bar pct={report.project.progress} color={report.project.status==="completed"?C.green:C.accent}/></div>
          </div>

          {/* Stats */}
          <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
            {[["Invoices in Period",report.invoices.length,C.blue],["Total Billed","$"+report.totalInv.toLocaleString(),C.accent],["Collected","$"+report.paidInv.toLocaleString(),C.green],["Outstanding","$"+(report.totalInv-report.paidInv).toLocaleString(),C.red],["Tasks",report.tasks.length,C.purple],["Team",report.members.length,C.green]].map(([l,v,c])=>(
              <div key={l} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 18px",flex:1,minWidth:100 }}><div style={{ color:C.muted,fontFamily:F,fontSize:10,marginBottom:5,fontWeight:600 }}>{l}</div><div style={{ color:c,fontFamily:F,fontWeight:700,fontSize:20,lineHeight:1 }}>{v}</div></div>
            ))}
          </div>

          {/* Invoices */}
          {report.invoices.length>0&&(
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px" }}>
              <SLabel>🧾 Invoices in Period</SLabel>
              <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:13 }}>
                <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>{["Invoice","Description","Amount","Due","Status"].map(h=><th key={h} style={{ color:C.muted,fontSize:11,fontWeight:700,padding:"7px 10px",textAlign:"left" }}>{h}</th>)}</tr></thead>
                <tbody>{report.invoices.map((inv,i)=>(
                  <tr key={inv.id} style={{ borderBottom:i<report.invoices.length-1?`1px solid ${C.border}22`:"none" }}>
                    <td style={{ color:C.accent,padding:"10px",fontWeight:700 }}>{inv.id}</td>
                    <td style={{ color:C.text,padding:"10px" }}>{inv.desc}</td>
                    <td style={{ color:C.text,padding:"10px",fontWeight:700 }}>${inv.amount.toLocaleString()}</td>
                    <td style={{ color:C.muted,padding:"10px" }}>{inv.dueFmt}</td>
                    <td style={{ padding:"10px" }}><Badge status={inv.status}/></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {report.invoices.length===0&&<div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",color:C.muted,fontFamily:F,fontSize:13 }}>🧾 No invoices in this period.</div>}

          {/* Tasks */}
          {report.tasks.length>0&&(
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px" }}>
              <SLabel>Tasks in Period</SLabel>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {report.tasks.map(t=>(
                  <div key={t.id} style={{ display:"flex",alignItems:"center",gap:12,background:C.surface,borderRadius:8,padding:"10px 14px" }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:t.status==="done"?C.green:C.accent,flexShrink:0 }}/>
                    <div style={{ flex:1 }}><span style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13 }}>{t.title}</span>{t.desc&&<span style={{ color:C.muted,fontFamily:F,fontSize:11,marginLeft:8 }}>{t.desc}</span>}</div>
                    <span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>👤 {t.member}</span>
                    <span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>📅 {t.date}</span>
                    <Badge status={t.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {report.notes.length>0&&(
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px" }}>
              <SLabel>📝 Notes & Updates</SLabel>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {report.notes.map(n=>(
                  <div key={n.id} style={{ borderLeft:`3px solid ${C.accent}`,paddingLeft:14,paddingTop:4,paddingBottom:4 }}>
                    <div style={{ color:C.text,fontFamily:F,fontSize:13,lineHeight:1.6 }}>{n.text}</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:4 }}>{n.author} · {n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {report.members.length>0&&(
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px" }}>
              <SLabel>👷 Team</SLabel>
              <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
                {report.members.map(m=>(
                  <div key={m.id} style={{ display:"flex",alignItems:"center",gap:10,background:C.surface,borderRadius:8,padding:"10px 14px" }}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:(m.color||C.blue)+"22",border:`2px solid ${(m.color||C.blue)}44`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color||C.blue,fontFamily:F,fontWeight:700,fontSize:12 }}>{m.init}</div>
                    <div><div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13 }}>{m.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{m.role}</div></div>
                    <Badge status={m.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          {report.logs.length>0&&(
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px" }}>
              <SLabel>🕐 Activity Log</SLabel>
              <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                {report.logs.map(e=>(
                  <div key={e.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"8px 12px",background:C.surface,borderRadius:7 }}>
                    <div style={{ width:30,height:30,background:C.card,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{e.icon}</div>
                    <div style={{ flex:1 }}><span style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13 }}>{e.action}</span><span style={{ color:C.muted,fontFamily:F,fontSize:12,marginLeft:10 }}>{e.detail}</span></div>
                    <span style={{ color:C.muted,fontFamily:F,fontSize:11,whiteSpace:"nowrap" }}>{e.user} · {e.time}</span>
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
function CalendarPage({ allInvoices,tasks,onAddTask,projectEvents=[],payments=[],allProjects=[] }){
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear());const [month,setMonth]=useState(today.getMonth());
  const [view,setView]=useState("month");const [filter,setFilter]=useState("all");const [sel,setSel]=useState(null);
  const [showAddTask,setShowAddTask]=useState(false);
  const [dayDate,setDayDate]=useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`);
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const { members:allMembers }=useAllMembers(allProjects);
  const [weekOffset,setWeekOffset]=useState(0);
  const weekStart=useMemo(()=>{ const ws=new Date(year,month,1); ws.setDate(ws.getDate()-ws.getDay()+weekOffset*7); return ws; },[year,month,weekOffset]);
  const weekDays=useMemo(()=>Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d; }),[weekStart]);
  const fmtDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const invEvents=useMemo(()=>allInvoices.filter(i=>i.due).map(i=>({ id:`inv-${i.id}`,type:"invoice",date:i.due,title:`${i.id} due`,subtitle:`${i.project||""} · $${Number(i.amount||0).toLocaleString()}`,color:i.status==="overdue"?C.red:i.status==="paid"?C.green:C.accent,detail:i })),[allInvoices]);
  const taskEvents=useMemo(()=>tasks.map(t=>({ id:`task-${t.id}`,type:"task",date:t.date,title:t.title,subtitle:`${t.member} · ${t.project}`,color:t.status==="done"?C.green:C.blue,detail:t })),[tasks]);
  const paymentEvents=useMemo(()=>payments.filter(p=>p.date).map(p=>({ id:`pay-${p.id}`,type:"payment",date:p.date,title:`${p.project}`,subtitle:`$${Number(p.amount||0).toLocaleString()} · ${p.method}`,color:"#10b981",detail:p })),[payments]);
  const allEvents=useMemo(()=>{
    if(filter==="invoices") return invEvents;
    if(filter==="team")     return taskEvents;
    if(filter==="projects") return projectEvents;
    if(filter==="payments") return paymentEvents;
    return [...invEvents,...taskEvents,...projectEvents,...paymentEvents];
  },[filter,invEvents,taskEvents,projectEvents,paymentEvents]);
  const eventsOn=d=>allEvents.filter(e=>e.date===d);

  const days=daysInMonth(year,month);const firstDay=firstDayOfMonth(year,month);
  const grid=Array.from({length:firstDay+days},(_,i)=>i<firstDay?null:i-firstDay+1);
  while(grid.length%7!==0)grid.push(null);
  const fmt=d=>`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const prevM=()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextM=()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  return(
    <div>
      {showAddTask&&<AddTaskModal onConfirm={t=>{onAddTask(t);setShowAddTask(false);}} onCancel={()=>setShowAddTask(false)} allMembers={allMembers} allProjects={allProjects}/>}
      {sel&&(
        <Overlay onClose={()=>setSel(null)}>
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:28,width:380 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:12,height:12,borderRadius:"50%",background:sel.color }}/><span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>{sel.title}</span></div>
              <button onClick={()=>setSel(null)} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ background:C.surface,borderRadius:8,padding:"14px 16px" }}>
              {sel.type==="invoice"
                ?[["Invoice",sel.detail.id||sel.detail.invId],["Project",sel.detail.project||"—"],["Description",sel.detail.desc||"—"],["Amount",`$${Number(sel.detail.amount||0).toLocaleString()}`],["Due",sel.detail.dueFmt||sel.detail.due||"—"],["Status",sel.detail.status||sel.detail.invoiceStatus||"—"]].map(([k,v])=><div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}><span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{k}</span><span style={{ color:C.text,fontFamily:F,fontSize:12,fontWeight:600 }}>{v}</span></div>)
                :sel.type==="payment"
                ?[["Project",sel.detail.project||"—"],["Amount",`$${Number(sel.detail.amount||0).toLocaleString()}`],["Date",sel.detail.dateFmt||sel.detail.date||"—"],["Method",sel.detail.method||"—"],["Invoice Ref",sel.detail.invRef||"—"],["Notes",sel.detail.notes||"—"]].map(([k,v])=><div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}><span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{k}</span><span style={{ color:k==="Amount"?C.green:C.text,fontFamily:F,fontSize:12,fontWeight:600,maxWidth:"60%",textAlign:"right" }}>{v}</span></div>)
                :sel.type==="project"
                ?[["Project",sel.detail.name],["Client",sel.detail.client?.name||"—"],["Phase",sel.detail.phase||"—"],["Start",sel.detail.startDate||"—"],["Due",sel.detail.dueFmt||"—"],["Status",sel.detail.status||"—"],["Type",sel.detail.projType==="business"?"🏢 Business":sel.detail.projType==="customer"?"👤 Customer":"—"]].map(([k,v])=><div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}><span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{k}</span><span style={{ color:C.text,fontFamily:F,fontSize:12,fontWeight:600,maxWidth:"60%",textAlign:"right" }}>{v}</span></div>)
                :[["Task",sel.detail.title],["Member",sel.detail.member],["Project",sel.detail.project],["Date",sel.detail.date],["Status",sel.detail.status||"pending"],["Description",sel.detail.desc||"—"]].map(([k,v])=><div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}><span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{k}</span><span style={{ color:C.text,fontFamily:F,fontSize:12,fontWeight:600,maxWidth:"60%",textAlign:"right" }}>{v}</span></div>)
              }
            </div>
          </div>
        </Overlay>
      )}

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12 }}>
        <div><h2 style={{ color:C.text,fontSize:22,fontFamily:F,fontWeight:700,margin:0 }}>Calendar</h2><div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>Project deadlines, invoices & team tasks</div></div>
        <button onClick={()=>setShowAddTask(true)} style={{ background:C.accent,color:"#000",border:"none",padding:"10px 20px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>+ Add Task</button>
      </div>

      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
        <div style={{ display:"flex",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:4,gap:3 }}>
          {[["all","All"],["invoices","Invoices"],["team","Tasks"],["projects","Projects"],["payments","💰 Payments"]].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} style={{ background:filter===v?C.accentDim:"transparent",color:filter===v?C.accent:C.muted,border:filter===v?`1px solid ${C.accentMid}`:"1px solid transparent",borderRadius:6,padding:"7px 14px",fontFamily:F,fontSize:12,fontWeight:700,cursor:"pointer" }}>{l}</button>)}
        </div>
        <div style={{ display:"flex",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:4,gap:3 }}>
          {[["month","Month"],["week","Week"],["day","Day"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{ background:view===v?C.blueDim:"transparent",color:view===v?C.blue:C.muted,border:view===v?`1px solid ${C.blue}44`:"1px solid transparent",borderRadius:6,padding:"7px 14px",fontFamily:F,fontSize:12,fontWeight:700,cursor:"pointer" }}>{l}</button>)}
        </div>
        {view!=="day"&&<div style={{ display:"flex",alignItems:"center",gap:10,marginLeft:"auto" }}>
          <button onClick={view==="week"?()=>setWeekOffset(o=>o-1):prevM} style={{ background:C.surface,border:`1px solid ${C.border}`,color:C.text,width:32,height:32,borderRadius:7,cursor:"pointer",fontSize:16 }}>‹</button>
          <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15,minWidth:160,textAlign:"center" }}>{view==="week"?`${weekDays[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${weekDays[6].toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`:`${MONTHS[month]} ${year}`}</span>
          <button onClick={view==="week"?()=>setWeekOffset(o=>o+1):nextM} style={{ background:C.surface,border:`1px solid ${C.border}`,color:C.text,width:32,height:32,borderRadius:7,cursor:"pointer",fontSize:16 }}>›</button>
        </div>}
      </div>

      {view==="month"&&(
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:`1px solid ${C.border}` }}>
            {DAYS_SHORT.map(d=><div key={d} style={{ padding:"10px 0",textAlign:"center",color:C.muted,fontFamily:F,fontSize:11,fontWeight:700 }}>{d}</div>)}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)" }}>
            {grid.map((day,i)=>{ const ds=day?fmt(day):null;const evs=ds?eventsOn(ds):[];const isToday=ds===todayStr; return(
              <div key={i} style={{ minHeight:90,padding:"8px 6px",borderRight:i%7!==6?`1px solid ${C.border}22`:"none",borderBottom:i<grid.length-7?`1px solid ${C.border}22`:"none" }}>
                {day&&<><div style={{ width:26,height:26,borderRadius:"50%",background:isToday?C.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:isToday?"#000":C.muted,fontFamily:F,fontSize:12,fontWeight:isToday?700:400,marginBottom:4 }}>{day}</div>
                {evs.slice(0,3).map(ev=><div key={ev.id} onClick={()=>setSel(ev)} style={{ background:ev.color+"22",border:`1px solid ${ev.color}44`,borderRadius:3,padding:"2px 5px",fontSize:10,fontFamily:F,fontWeight:600,color:ev.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer",marginBottom:2 }}>{ev.type==="invoice"?"INV":ev.type==="project"?"PRJ":ev.type==="payment"?"PAY":"TSK"} {ev.title}</div>)}
                {evs.length>3&&<div style={{ fontSize:10,color:C.muted,fontFamily:F }}>+{evs.length-3}</div>}</>}
              </div>
            );})}
          </div>
        </div>
      )}

      {view==="week"&&(
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:`1px solid ${C.border}` }}>
            {weekDays.map((d,i)=>{ const ds=fmtDate(d);const isToday=ds===todayStr; return(
              <div key={i} style={{ padding:"12px 8px",textAlign:"center",borderRight:i<6?`1px solid ${C.border}22`:"none" }}>
                <div style={{ color:C.muted,fontFamily:F,fontSize:11,fontWeight:700 }}>{DAYS_SHORT[d.getDay()]}</div>
                <div style={{ width:30,height:30,borderRadius:"50%",background:isToday?C.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:isToday?"#000":C.text,fontFamily:F,fontSize:14,fontWeight:700,margin:"4px auto 0" }}>{d.getDate()}</div>
              </div>
            );})}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",minHeight:280 }}>
            {weekDays.map((d,i)=>{ const evs=eventsOn(fmtDate(d)); return(
              <div key={i} style={{ padding:"8px 6px",borderRight:i<6?`1px solid ${C.border}22`:"none",minHeight:200 }}>
                {evs.map(ev=><div key={ev.id} onClick={()=>setSel(ev)} style={{ background:ev.color+"22",border:`1px solid ${ev.color}44`,borderRadius:5,padding:"5px 7px",fontSize:11,fontFamily:F,fontWeight:600,color:ev.color,marginBottom:5,cursor:"pointer" }}><div style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.type==="invoice"?"INV":ev.type==="project"?"PRJ":ev.type==="payment"?"PAY":"TSK"} {ev.title}</div><div style={{ color:ev.color+"99",fontSize:10,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.subtitle}</div></div>)}
              </div>
            );})}
          </div>
        </div>
      )}

      {view==="day"&&(
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
            <input type="date" value={dayDate} onChange={e=>setDayDate(e.target.value)} style={{ ...INP(),width:"auto",colorScheme:"dark" }}/>
            {dayDate&&<span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15 }}>{new Date(dayDate+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>}
          </div>
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 24px" }}>
            {eventsOn(dayDate).length===0?<div style={{ textAlign:"center",padding:"40px 0",color:C.muted,fontFamily:F,fontSize:13 }}>No events on this day</div>:
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {eventsOn(dayDate).map(ev=>(
                  <div key={ev.id} onClick={()=>setSel(ev)} style={{ background:ev.color+"15",border:`1px solid ${ev.color}44`,borderRadius:10,padding:"14px 18px",cursor:"pointer" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:10,height:10,borderRadius:"50%",background:ev.color }}/><span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{ev.title}</span><span style={{ color:C.muted,fontFamily:F,fontSize:11,marginLeft:"auto" }}>{ev.type==="invoice"?"Invoice":ev.type==="project"?"Project Milestone":ev.type==="payment"?"Payment Received":"Team Task"}</span></div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:5,marginLeft:20 }}>{ev.subtitle}</div>
                  </div>
                ))}
              </div>}
          </div>
        </div>
      )}

      <div style={{ display:"flex",gap:16,marginTop:14,flexWrap:"wrap" }}>
        {[["Invoice Due",C.accent],["Overdue",C.red],["Paid",C.green],["Team Task",C.blue],["Done Task",C.green],["Project Start",C.green],["Project Due",C.purple],["Payment Received","#10b981"]].map(([l,c])=>(
          <div key={l} style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:10,height:10,borderRadius:"50%",background:c }}/><span style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{l}</span></div>
        ))}
      </div>
    </div>
  );
}

// ─── Project Detail ────────────────────────────────────────────────────────────
// ─── Module Order hook ────────────────────────────────────────────────────────
const DEFAULT_MODULE_ORDER = ["invoices","payments","plans","team"];

function useModuleOrder(projectId){
  const key = `moduleorder:${projectId}`;
  const [order,setOrder] = useState(null);
  useEffect(()=>{ let alive=true; (async()=>{ const r=await storage.get(key); if(!alive)return; setOrder(r?JSON.parse(r.value):DEFAULT_MODULE_ORDER); })(); return()=>{alive=false;}; },[key]);
  const save = async(next)=>{ setOrder(next); await storage.set(key,JSON.stringify(next)); };
  return { order:order||DEFAULT_MODULE_ORDER, ready:order!==null, setOrder:save };
}

// ─── Draggable Module Card ─────────────────────────────────────────────────────
function DraggableModCard({ id, icon, title, sub, color, dim, children, onDragStart, onDragOver, onDrop, isDragOver }){
  const [open,setOpen] = useState(false);
  const [dragging,setDragging] = useState(false);
  return(
    <div
      draggable
      onDragStart={e=>{ setDragging(true); onDragStart(id); e.dataTransfer.effectAllowed="move"; }}
      onDragEnd={()=>{ setDragging(false); }}
      onDragOver={e=>{ e.preventDefault(); onDragOver(id); }}
      onDrop={e=>{ e.preventDefault(); onDrop(id); }}
      style={{
        background:C.card,
        border:`2px solid ${isDragOver?C.accent:open?color+"66":C.border}`,
        borderRadius:14,
        /* NO overflow:hidden — content must never be clipped */
        transition:"border-color .2s, box-shadow .2s, opacity .2s, transform .2s",
        opacity:dragging?0.45:1,
        transform:dragging?"scale(0.98)":"scale(1)",
        boxShadow:isDragOver?`0 0 0 3px ${C.accent}33`:"none",
        cursor:"default",
        width:"100%",
        boxSizing:"border-box",
      }}
    >
      {/* Header row — click to expand */}
      <div
        onClick={()=>setOpen(v=>!v)}
        style={{
          padding:"20px 24px", cursor:"pointer", display:"flex", alignItems:"center",
          gap:16, background:open?color+"0d":"transparent", userSelect:"none",
          borderRadius: open ? "14px 14px 0 0" : 14,
        }}
      >
        {/* drag handle */}
        <div
          draggable={false}
          title="Drag to reorder"
          onMouseDown={e=>e.stopPropagation()}
          style={{ display:"flex",flexDirection:"column",gap:3,cursor:"grab",flexShrink:0,padding:"4px 2px",opacity:.4 }}
          onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".4"}
        >
          {[0,1,2].map(i=><div key={i} style={{ width:16,height:2,background:C.muted,borderRadius:1 }}/>)}
        </div>
        <div style={{ width:54,height:54,borderRadius:13,background:dim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{icon}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>{title}</div>
          <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{sub}</div>
        </div>
        <span style={{ color:open?color:C.muted,fontSize:20,transform:open?"rotate(90deg)":"none",transition:"transform .25s",flexShrink:0 }}>›</span>
      </div>

      {/* Content — fully visible, no height cap, no overflow clip */}
      {open&&(
        <div style={{ padding:"18px 24px 24px",borderTop:`1px solid ${C.border}33` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Photo Comments ───────────────────────────────────────────────────────────
function usePhotoComments(projectId){
  const key=`photocomments:${projectId}`;
  const [map,setMap]=useState(null);
  useEffect(()=>{ let alive=true; (async()=>{ const r=await storage.get(key); if(alive)setMap(r?JSON.parse(r.value):{}); })(); return()=>{alive=false;}; },[key]);
  const save=async(next)=>{ setMap(next); await storage.set(key,JSON.stringify(next)); };
  const addComment=(photoId,text,author)=>{
    const c={ id:`c${Date.now()}`,text:text.trim(),author:author||"Jordan Blake",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}) };
    const next={...(map||{}),[photoId]:[...((map||{})[photoId]||[]),c]};
    save(next);
  };
  const editComment=(photoId,commentId,text)=>{
    const next={...(map||{}),[photoId]:((map||{})[photoId]||[]).map(c=>c.id===commentId?{...c,text:text.trim(),edited:true}:c)};
    save(next);
  };
  const deleteComment=(photoId,commentId)=>{
    const next={...(map||{}),[photoId]:((map||{})[photoId]||[]).filter(c=>c.id!==commentId)};
    save(next);
  };
  const getComments=(photoId)=>(map||{})[photoId]||[];
  return{ ready:map!==null, addComment, editComment, deleteComment, getComments };
}

// Photo lightbox + comment panel
function PhotoCommentModal({ photo, comments, onAddComment, onEditComment, onDeleteComment, onClose }){
  const [text,setText]=useState("");
  const [editingId,setEditingId]=useState(null);
  const [editText,setEditText]=useState("");
  const textRef=useRef();

  const submit=()=>{
    if(!text.trim())return;
    onAddComment(photo.id,text);
    setText("");
  };

  const startEdit=(c)=>{ setEditingId(c.id); setEditText(c.text); };
  const saveEdit=()=>{ if(!editText.trim())return; onEditComment(photo.id,editingId,editText); setEditingId(null); setEditText(""); };
  const cancelEdit=()=>{ setEditingId(null); setEditText(""); };

  return(
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(5,7,15,.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ display:"flex",gap:0,width:"min(960px,100%)",maxHeight:"92vh",borderRadius:16,overflow:"hidden",background:C.card,border:`1px solid ${C.border}`,boxShadow:"0 32px 80px rgba(0,0,0,.7)" }}>

        {/* Left: photo */}
        <div style={{ flex:1,minWidth:0,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",minHeight:300 }}>
          <img src={photo.dataUrl} alt={photo.name} style={{ maxWidth:"100%",maxHeight:"92vh",objectFit:"contain",display:"block" }}/>
          <button onClick={onClose} style={{ position:"absolute",top:12,right:12,background:"rgba(0,0,0,.6)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}>✕</button>
          <div style={{ position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,.7))",padding:"16px 18px" }}>
            <div style={{ color:"#fff",fontFamily:F,fontWeight:600,fontSize:13 }}>{photo.name.replace(/\.[^.]+$/,"")}</div>
            <div style={{ color:"rgba(255,255,255,.55)",fontFamily:F,fontSize:11,marginTop:2 }}>Uploaded {photo.uploadedAt}</div>
          </div>
        </div>

        {/* Right: comments panel */}
        <div style={{ width:300,flexShrink:0,display:"flex",flexDirection:"column",background:C.card,borderLeft:`1px solid ${C.border}` }}>
          {/* Header */}
          <div style={{ padding:"16px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0 }}>
            <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>💬 Comments</div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:2 }}>{comments.length} comment{comments.length!==1?"s":""}</div>
          </div>

          {/* Comment list */}
          <div style={{ flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10 }}>
            {comments.length===0&&(
              <div style={{ textAlign:"center",padding:"30px 10px",color:C.muted,fontFamily:F,fontSize:12 }}>
                <div style={{ fontSize:28,marginBottom:8 }}>💬</div>
                No comments yet — add the first one below
              </div>
            )}
            {comments.map(c=>(
              <div key={c.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 12px" }}>
                {editingId===c.id
                  ?<div>
                    <textarea autoFocus value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();saveEdit();} if(e.key==="Escape")cancelEdit(); }}
                      rows={3} style={{ ...INP(),resize:"none",fontSize:12,lineHeight:1.5,marginBottom:8 }}/>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={saveEdit} style={{ flex:1,background:C.green,color:"#fff",border:"none",padding:"6px 0",borderRadius:5,fontFamily:F,fontWeight:700,fontSize:11,cursor:"pointer" }}>✓ Save</button>
                      <button onClick={cancelEdit} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"6px 10px",borderRadius:5,fontFamily:F,fontSize:11,cursor:"pointer" }}>Cancel</button>
                    </div>
                  </div>
                  :<div>
                    <div style={{ color:C.text,fontFamily:F,fontSize:12,lineHeight:1.55,marginBottom:7,whiteSpace:"pre-wrap",wordBreak:"break-word" }}>{c.text}{c.edited&&<span style={{ color:C.muted,fontSize:10,marginLeft:5 }}>(edited)</span>}</div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <div style={{ color:C.accent,fontFamily:F,fontSize:10,fontWeight:700 }}>{c.author}</div>
                        <div style={{ color:C.muted,fontFamily:F,fontSize:10,marginTop:1 }}>{c.time}</div>
                      </div>
                      <div style={{ display:"flex",gap:4 }}>
                        <RowBtn type="edit" onClick={()=>startEdit(c)}>Edit</RowBtn>
                        <RowBtn type="delete" onClick={()=>onDeleteComment(photo.id,c.id)}>Delete</RowBtn>
                      </div>
                    </div>
                  </div>
                }
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div style={{ padding:"12px 14px",borderTop:`1px solid ${C.border}`,flexShrink:0 }}>
            <textarea ref={textRef} value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();} }}
              placeholder="Write a comment… (Enter to send)" rows={3}
              style={{ ...INP(),resize:"none",fontSize:12,lineHeight:1.5,marginBottom:8 }}/>
            <button onClick={submit} disabled={!text.trim()} style={{ width:"100%",background:text.trim()?C.accent:C.border,color:text.trim()?"#000":C.muted,border:"none",padding:"9px 0",borderRadius:7,fontFamily:F,fontWeight:700,fontSize:12,cursor:text.trim()?"pointer":"default",transition:"all .15s" }}>💬 Add Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Single photo card with thumbnail + comment preview
function PhotoCard({ photo, comments, onOpen, onDelete }){
  const topComment=comments[comments.length-1];
  return(
    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column",transition:"border-color .18s,box-shadow .18s" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"66";e.currentTarget.style.boxShadow=`0 4px 16px rgba(0,0,0,.18)`;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none";}}>

      {/* Thumbnail */}
      <div onClick={()=>onOpen(photo)} style={{ position:"relative",aspectRatio:"4/3",cursor:"pointer",overflow:"hidden",background:"#000" }}>
        <img src={photo.dataUrl} alt={photo.name} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform .25s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
        {/* overlay buttons */}
        <div style={{ position:"absolute",top:6,right:6,display:"flex",gap:5,opacity:0,transition:"opacity .18s" }} className="photo-actions">
          <button onClick={e=>{e.stopPropagation();onOpen(photo);}} style={{ background:"rgba(0,0,0,.65)",color:"#fff",border:"none",borderRadius:5,width:28,height:28,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }} title="View & comment">💬</button>
          <button onClick={e=>{e.stopPropagation();onDelete(photo.id);}} style={{ background:"rgba(200,50,50,.8)",color:"#fff",border:"none",borderRadius:5,width:28,height:28,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }} title="Delete">×</button>
        </div>
        {/* comment count badge */}
        {comments.length>0&&(
          <div style={{ position:"absolute",bottom:6,right:7,background:"rgba(0,0,0,.7)",color:"#fff",borderRadius:99,padding:"2px 7px",fontFamily:F,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:3 }}>
            💬 {comments.length}
          </div>
        )}
      </div>

      {/* Caption + latest comment */}
      <div style={{ padding:"10px 12px",flex:1 }} onClick={()=>onOpen(photo)}>
        <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:topComment?6:0,cursor:"pointer" }}
          title={photo.name.replace(/\.[^.]+$/,"")}>
          {photo.name.replace(/\.[^.]+$/,"")}
        </div>
        {topComment&&(
          <div style={{ background:C.card,borderRadius:6,padding:"6px 8px",borderLeft:`3px solid ${C.accent}` }}>
            <div style={{ color:C.muted,fontFamily:F,fontSize:10,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{topComment.text}</div>
            <div style={{ color:C.accent,fontFamily:F,fontSize:9,fontWeight:700,marginTop:4 }}>{topComment.author} · {topComment.time}</div>
          </div>
        )}
        {!topComment&&(
          <div style={{ color:C.muted,fontFamily:F,fontSize:10,fontStyle:"italic",cursor:"pointer" }}>Click to add a comment</div>
        )}
      </div>
    </div>
  );
}

// ─── Project Detail Page ───────────────────────────────────────────────────────
function ProjectPage({ project,onBack,onOpenTeam,extraLog=[],payments=[],addPayment,updatePayment,removePayment,allProjects=[],allInvoices=[],addInvoice,removeGlobalInvoice,updateGlobalInvoice,onUpdateProject,onLog }){ 
  const [contactOpen,setContactOpen] = useState(false);
  const [editingProject,setEditingProject] = useState(false);
  const [confirmProjectPatch,setConfirmProjectPatch] = useState(null);
  const [noteText,setNoteText]       = useState("");
  const [notes,setNotes]             = useState([]);
  const [log,setLog]                 = useState([]);
  const photoRef                     = useRef();
  const dragOver                     = useRef(null);
  const dragItem                     = useRef(null);

  const { files:photos,add:addPhoto,remove:removePhoto } = useFiles(`photos:${project.id}`);
  const { ready:commentsReady, addComment, editComment, deleteComment, getComments } = usePhotoComments(project.id);
  const [lightboxPhoto,setLightboxPhoto] = useState(null);
  const { order:moduleOrder, setOrder:setModuleOrder } = useModuleOrder(project.id);
  const [dragOverId,setDragOverId] = useState(null);

  const pushLog  = (action,icon,proj)=>{
    const entry={ id:Date.now(),action,detail:proj||project.name,user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon };
    setLog(prev=>[entry,...prev]);
    if(onLog) onLog(entry);
  };
  const mergedLog= useMemo(()=>[...extraLog.filter(e=>!log.find(l=>l.id===e.id)),...log].sort((a,b)=>(b.id||0)-(a.id||0)),[extraLog,log]);
  const saveNote = ()=>{ if(!noteText.trim())return; const n={id:Date.now(),text:noteText.trim(),author:profile?.full_name||"User",time:new Date().toLocaleDateString()}; setNotes(p=>[n,...p]); pushLog("Note added","📝"); setNoteText(""); };
  const uploadPhotos = files=>Array.from(files).forEach(f=>{ const rd=new FileReader(); rd.onload=async e=>{ await addPhoto({id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:f.name,size:f.size,dataUrl:e.target.result,uploadedAt:new Date().toLocaleDateString()}); pushLog("Photo uploaded","📷"); }; rd.readAsDataURL(f); });
  const projectPayments = useMemo(()=>payments.filter(p=>p.projId===project.id||p.project===project.name),[payments,project]);
  const handleAddPayment= async(p)=>{ addPayment&&addPayment(p); pushLog(`Payment $${p.amount.toLocaleString()} recorded`,"PAY"); };

  // Drag handlers
  const handleDragStart = id => { dragItem.current=id; };
  const handleDragOver  = id => { if(id!==dragItem.current){ setDragOverId(id); dragOver.current=id; } };
  const handleDrop      = id => {
    if(!dragItem.current||dragItem.current===id) return;
    const next=[...moduleOrder];
    const from=next.indexOf(dragItem.current);
    const to  =next.indexOf(id);
    if(from<0||to<0) return;
    next.splice(from,1); next.splice(to,0,dragItem.current);
    setModuleOrder(next);
    dragItem.current=null; dragOver.current=null; setDragOverId(null);
  };

  // Live counts for module subtitles
  const { files:invFiles }=useFiles(`inv:${project.id}`);
  const { files:planFiles }=useFiles(`plans:${project.id}`);
  const { members:teamMembers }=useTeam(project.id);
  // invCount: all invoices for this project in the global store + local files not yet in global
  const _allProjInv=allInvoices.filter(i=>i.projId===project.id||i.project===project.name);
  const _globalIds=new Set(_allProjInv.map(i=>i.id));
  const _localOnly=invFiles.filter(f=>!_globalIds.has(f.id));
  const invCount=_allProjInv.length+_localOnly.length;
  const payCount=projectPayments.length;
  const planCount=planFiles.length;
  const teamCount=(teamMembers||[]).length;

  // Module definitions — rendered in persisted order
  const MODULE_DEFS = {
    invoices: { icon:<Ic.Receipt size={22} color={C.accent}/>, title:"Invoices",  color:C.accent, dim:C.accentDim, sub:`${invCount} invoice${invCount!==1?"s":""}`, content:<InvoicesPanel project={project} onActivity={pushLog} onAddGlobalInvoice={addInvoice} onUpdateGlobalInvoice={updateGlobalInvoice} onRemoveGlobalInvoice={removeGlobalInvoice} allInvoices={allInvoices}/> },
    payments: { icon:"💰", title:"Payments",  color:C.green,  dim:C.greenDim,  sub:`${payCount} payment${payCount!==1?"s":""}`, content:<PaymentsPanel project={project} payments={projectPayments} addPayment={handleAddPayment} updatePayment={updatePayment} removePayment={removePayment} allProjects={allProjects} allInvoices={allInvoices} onActivity={pushLog}/> },
    plans:    { icon:"📐", title:"Plans",     color:C.blue,   dim:C.blueDim,   sub:`${planCount} document${planCount!==1?"s":""}`, content:<PlansPanel project={project} onActivity={pushLog}/> },
    team:     { icon:"👷", title:"Team",      color:C.green,  dim:C.greenDim,  sub:`${teamCount} member${teamCount!==1?"s":""}`, content:<TeamPanel  project={project} onOpenTeamPage={onOpenTeam}/> },
  };

  return(
    <div>
      {contactOpen&&<ContactModal client={project.client} onClose={()=>setContactOpen(false)}/>}
      {editingProject&&<EditProjectModal project={project} onConfirm={patch=>{ setEditingProject(false); setConfirmProjectPatch(patch); }} onCancel={()=>setEditingProject(false)}/>}
      {confirmProjectPatch&&(
        <ConfirmDialog
          title="Save Project Changes?"
          message="Are you sure you want to apply these changes to this project?"
          confirmLabel="Yes, Save Changes" variant="edit"
          onConfirm={()=>{ onUpdateProject&&onUpdateProject(project.id,confirmProjectPatch); setConfirmProjectPatch(null); }}
          onCancel={()=>setConfirmProjectPatch(null)}/>
      )}

      {/* Back button */}
      <button onClick={onBack} style={{ background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"7px 16px",borderRadius:7,fontFamily:F,fontSize:13,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,marginBottom:20 }} onMouseEnter={e=>{e.currentTarget.style.color=C.text;}} onMouseLeave={e=>{e.currentTarget.style.color=C.muted;}}>← Back to Projects</button>

      {/* Top outer row: main content + narrow activity log */}
      <div style={{ display:"flex",gap:16,alignItems:"flex-start" }}>

        {/* ── Left: header + modules + photos + notes ── */}
        <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:18 }}>

          {/* Header card */}
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"26px 30px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap" }}>
                  <div style={{ width:4,height:28,background:C.accent,borderRadius:2,flexShrink:0 }}/>
                  <h1 style={{ color:C.text,fontFamily:F,fontSize:22,fontWeight:700,margin:0 }}>{project.name}</h1>
                  <Badge status={project.status}/>
                  {project.projType&&<span style={{ background:project.projType==="business"?C.purpleDim:C.blueDim,color:project.projType==="business"?C.purple:C.blue,padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:700,fontFamily:F }}>{project.projType==="business"?"🏢 Business":"👤 Customer"}</span>}
                </div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:13,marginLeft:14 }}>📍 {project.address}</div>
                {project.desc&&<div style={{ color:C.muted,fontFamily:F,fontSize:12,marginLeft:14,marginTop:6,fontStyle:"italic",lineHeight:1.55 }}>{project.desc}</div>}
              </div>
              <div style={{ display:"flex",gap:12,alignItems:"center",flexShrink:0,flexWrap:"wrap" }}>
                <div><div style={{ color:C.muted,fontFamily:F,fontSize:10,fontWeight:700 }}>CONTRACT VALUE</div><div style={{ color:C.accent,fontFamily:F,fontWeight:700,fontSize:20 }}>${project.value.toLocaleString()}</div></div>
                <Btn variant="primary" size="lg" onClick={()=>setContactOpen(true)}>👤 Contact</Btn>
                <Btn variant="secondary" size="lg" onClick={()=>setEditingProject(true)}>✏️ Edit Project</Btn>
              </div>
            </div>
            {project.status!=="quoting"&&(
              <div style={{ marginTop:20,paddingTop:18,borderTop:`1px solid ${C.border}` }}>
                {(()=>{
                  const pct=calcProgress(project);
                  const days=daysRemaining(project);
                  const overdue=days!==null&&days<0&&project.status!=="completed";
                  return(
                    <>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8 }}>
                        <div style={{ display:"flex",gap:22,flexWrap:"wrap" }}>
                          {[["Phase",project.phase],["Started",project.startDate||project.startDateFmt||"—"],["Due",project.dueFmt]].map(([k,v])=>(
                            <div key={k}><div style={{ color:C.muted,fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase" }}>{k}</div><div style={{ color:C.text,fontFamily:F,fontSize:13,fontWeight:600,marginTop:2 }}>{v}</div></div>
                          ))}
                          {days!==null&&(
                            <div><div style={{ color:C.muted,fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase" }}>Remaining</div>
                              <div style={{ color:overdue?C.red:days<=7?C.accent:C.green,fontFamily:F,fontSize:13,fontWeight:700,marginTop:2 }}>
                                {project.status==="completed"?"Done":overdue?`${Math.abs(days)}d overdue`:`${days}d left`}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>Timeline Progress</span>
                          <span style={{ color:project.status==="completed"?C.green:overdue?C.red:C.accent,fontFamily:F,fontWeight:700,fontSize:18 }}>{pct}%</span>
                        </div>
                      </div>
                      <Bar pct={pct} color={project.status==="completed"?C.green:overdue?C.red:C.accent}/>
                    </>
                  );
                })()}
              </div>
            )}
            {project.contacts&&project.contacts.length>0&&(
              <div style={{ marginTop:20,paddingTop:18,borderTop:`1px solid ${C.border}` }}>
                <div style={{ color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:12 }}>Project Contacts</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
                  {project.contacts.map((ct,i)=>(
                    <div key={ct.id||i} style={{ background:C.surface,border:`1px solid ${i===0?C.green+"44":C.border}`,borderRadius:9,padding:"12px 16px",minWidth:200,flex:"1 1 180px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                        <div style={{ width:28,height:28,borderRadius:"50%",background:i===0?C.green+"22":C.accentDim,border:`2px solid ${i===0?C.green+"44":C.accentMid}`,display:"flex",alignItems:"center",justifyContent:"center",color:i===0?C.green:C.accent,fontFamily:F,fontWeight:700,fontSize:10,flexShrink:0 }}>{ct.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?"}</div>
                        <div><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>{ct.name}</div>{ct.company&&<div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{ct.company}</div>}</div>
                        <span style={{ marginLeft:"auto",background:i===0?C.greenDim:C.accentDim,color:i===0?C.green:C.accent,padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,fontFamily:F }}>{ct.role}</span>
                      </div>
                      <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                        {ct.phone&&<a href={`tel:${ct.phone}`} style={{ color:C.muted,fontFamily:F,fontSize:11,textDecoration:"none",display:"flex",alignItems:"center",gap:4 }}>📞 {ct.phone}</a>}
                        {ct.email&&<a href={`mailto:${ct.email}`} style={{ color:C.muted,fontFamily:F,fontSize:11,textDecoration:"none",display:"flex",alignItems:"center",gap:4 }}>✉️ {ct.email}</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Draggable module cards */}
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <span style={{ color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8 }}>Project Modules</span>
              <span style={{ color:C.muted,fontFamily:F,fontSize:10,opacity:.6 }}>— drag to reorder</span>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {moduleOrder.filter(id=>MODULE_DEFS[id]).map(id=>{
                const m=MODULE_DEFS[id];
                return(
                  <DraggableModCard
                    key={id} id={id}
                    icon={m.icon} title={m.title} sub={m.sub} color={m.color} dim={m.dim}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragOver={dragOverId===id}
                  >{m.content}</DraggableModCard>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px" }}>
            {/* Lightbox */}
            {lightboxPhoto&&(
              <PhotoCommentModal
                photo={lightboxPhoto}
                comments={getComments(lightboxPhoto.id)}
                onAddComment={addComment}
                onEditComment={editComment}
                onDeleteComment={deleteComment}
                onClose={()=>setLightboxPhoto(null)}
              />
            )}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15 }}>📷 Photos</span>
                <span style={{ background:C.surface,color:C.muted,border:`1px solid ${C.border}`,borderRadius:99,padding:"2px 9px",fontSize:10,fontFamily:F,fontWeight:700 }}>{photos.length}</span>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ color:C.muted,fontFamily:F,fontSize:10 }}>Click a photo to comment</span>
                <button onClick={()=>photoRef.current.click()} style={{ background:C.accentDim,color:C.accent,border:`1px solid ${C.accentMid}`,padding:"7px 14px",borderRadius:6,fontFamily:F,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>📷 Upload</button>
                <input ref={photoRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>uploadPhotos(e.target.files)}/>
              </div>
            </div>
            {/* CSS for photo action buttons hover */}
            <style>{".photo-card:hover .photo-actions { opacity: 1 !important; }"}</style>
            {photos.length===0
              ?<div onClick={()=>photoRef.current.click()} style={{ border:`2px dashed ${C.border}`,borderRadius:10,padding:"44px 20px",textAlign:"center",cursor:"pointer",color:C.muted,fontFamily:F,fontSize:13,transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"88";e.currentTarget.style.color=C.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}><div style={{ fontSize:36,marginBottom:10 }}>📷</div>No photos yet — click to upload</div>
              :<div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14 }}>
                {photos.map(p=>(
                  <div key={p.id} className="photo-card">
                    <PhotoCard
                      photo={p}
                      comments={getComments(p.id)}
                      onOpen={setLightboxPhoto}
                      onDelete={id=>{ removePhoto(id); if(lightboxPhoto?.id===id)setLightboxPhoto(null); }}
                    />
                  </div>
                ))}
                {/* Upload tile */}
                <div onClick={()=>photoRef.current.click()} style={{ borderRadius:10,border:`2px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:6,color:C.muted,fontFamily:F,fontSize:12,padding:"20px 0",minHeight:160,transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"88";e.currentTarget.style.color=C.accent;e.currentTarget.style.background=C.accentDim;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;e.currentTarget.style.background="transparent";}}><span style={{ fontSize:24,lineHeight:1 }}>+</span><span>Add Photo</span></div>
              </div>
            }
          </div>
        </div>

        {/* ── Right: activity log + notes ── */}
        <div style={{ width:220,flexShrink:0,display:"flex",flexDirection:"column",gap:14,position:"sticky",top:16,alignSelf:"flex-start",maxHeight:"calc(100vh - 32px)",overflowY:"auto" }}>

          {/* Notes panel */}
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 16px",display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>📝 Notes</span>
              <span style={{ background:C.accentDim,color:C.accent,padding:"1px 6px",borderRadius:99,fontSize:10,fontWeight:700 }}>{notes.length}</span>
            </div>
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")saveNote();}} placeholder="Write a note…" rows={3} style={{ resize:"none",background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",fontSize:12,color:C.text,fontFamily:F,lineHeight:1.5,outline:"none",width:"100%",boxSizing:"border-box" }}/>
            <button onClick={saveNote} style={{ background:C.accent,color:"#000",border:"none",padding:"7px 0",borderRadius:6,fontFamily:F,fontWeight:700,fontSize:12,cursor:"pointer" }}>Save</button>
            <div style={{ display:"flex",flexDirection:"column",gap:8,maxHeight:280,overflowY:"auto" }}>
              {notes.length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:11,textAlign:"center",padding:"8px 0" }}>No notes yet</div>}
              {notes.map(n=>(
                <div key={n.id} style={{ background:C.surface,borderRadius:7,padding:"8px 10px",borderLeft:`3px solid ${C.accent}` }}>
                  <div style={{ color:C.text,fontSize:11,fontFamily:F,lineHeight:1.5,marginBottom:3 }}>{n.text}</div>
                  <div style={{ color:C.muted,fontSize:10,fontFamily:F }}>{n.author} · {n.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden" }}>
            <div style={{ padding:"13px 14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
              <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:12 }}>Activity</span>
              <span style={{ background:C.accentDim,color:C.accent,borderRadius:99,fontSize:10,fontWeight:700,padding:"1px 7px" }}>{mergedLog.length}</span>
            </div>
            <div>
              {mergedLog.map((e,i)=>(
                <div key={e.id} style={{ display:"flex",gap:8,padding:"10px 12px",borderBottom:i<mergedLog.length-1?`1px solid ${C.border}22`:"none",alignItems:"flex-start" }}>
                  <div style={{ width:26,height:26,background:C.surface,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,marginTop:1 }}>{e.icon}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:11,lineHeight:1.3 }}>{e.action}</div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:10,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.detail}</div>
                    <div style={{ color:"#5a6480",fontSize:9,fontFamily:F,marginTop:3 }}>{e.user} · {e.time}</div>
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
function EditProjectModal({ project, onConfirm, onCancel }){
  const [name,setName]         = useState(project.name||"");
  const [address,setAddress]   = useState(project.address||"");
  const [desc,setDesc]         = useState(project.desc||"");
  const [startISO,setStartISO] = useState(project.startDateISO||"");
  const [endISO,setEndISO]     = useState(project.due||"");
  const [projType,setProjType] = useState(project.projType||"business");
  const [value,setValue]       = useState(String(project.value||""));
  const [phase,setPhase]       = useState(project.phase||"");
  const [status,setStatus]     = useState(project.status||"active");
  const [contacts,setContacts] = useState(project.contacts?.length ? project.contacts : [emptyContact()]);
  const [step,setStep]         = useState(1);
  const [err,setErr]           = useState("");

  const updateContact=(id,field,val)=>setContacts(cs=>cs.map(c=>c.id===id?{...c,[field]:val}:c));
  const addContact=()=>setContacts(cs=>[...cs,emptyContact()]);
  const removeContact=(id)=>setContacts(cs=>cs.filter(c=>c.id!==id));
  const fmtD=(iso)=>{ if(!iso)return"—"; try{ return new Date(iso+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }catch{return iso;} };

  const goNext=()=>{
    if(step===1){
      if(!name.trim()){setErr("Project name is required");return;}
      if(!address.trim()){setErr("Project address is required");return;}
      setErr(""); setStep(2);
    } else if(step===2){ setErr(""); setStep(3); }
  };

  const handleSave=()=>{
    const validContacts=contacts.filter(c=>c.name.trim());
    const primaryClient=validContacts[0]||project.client||{name:"Unassigned",company:"",phone:"",email:"",initials:"?"};
    const initials=primaryClient.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";
    onConfirm({
      name:name.trim(), address:address.trim(), desc:desc.trim(),
      startDateISO:startISO, due:endISO,
      startDate:fmtD(startISO), dueFmt:fmtD(endISO),
      projType, status, phase:phase||project.phase||"Active",
      value:parseFloat(value)||project.value||0,
      location:address.trim().split(",")[0]||"",
      client:{ name:primaryClient.name, company:primaryClient.company||"", phone:primaryClient.phone||"", email:primaryClient.email||"", initials },
      contacts:validContacts,
    });
  };

  const PROJ_STATUSES=[{v:"active",l:"Active",c:C.green},{v:"quoting",l:"Quoting",c:C.blue},{v:"on-hold",l:"On Hold",c:C.accent},{v:"completed",l:"Completed",c:C.purple}];
  const PHASES=["Quoting","Planning","Foundation","Framing","Electrical","Plumbing","Finishing","Completed"];
  const STEPS=[["1","Project Info"],["2","Timeline & Type"],["3","Contacts"]];

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:600,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        {/* Header */}
        <div style={{ padding:"24px 28px 0",flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18 }}>✏️ Edit Project</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>Update information for <strong style={{color:C.accent}}>{project.name}</strong></div>
            </div>
            <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",lineHeight:1 }}>✕</button>
          </div>
          <div style={{ display:"flex",gap:0,marginBottom:24 }}>
            {STEPS.map(([n,l],i)=>{
              const active=step===i+1; const done=step>i+1;
              return(
                <div key={n} style={{ display:"flex",alignItems:"center",flex:1 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flex:1 }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:done?C.green:active?C.accent:C.border,color:done||active?"#000":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:700,fontSize:12,flexShrink:0,transition:"all .2s" }}>{done?"✓":n}</div>
                    <span style={{ color:active?C.text:done?C.green:C.muted,fontFamily:F,fontSize:12,fontWeight:active?700:500,transition:"color .2s" }}>{l}</span>
                  </div>
                  {i<STEPS.length-1&&<div style={{ width:24,height:2,background:done?C.green:C.border,borderRadius:1,margin:"0 8px",flexShrink:0,transition:"background .2s" }}/>}
                </div>
              );
            })}
          </div>
        </div>
        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:"0 28px" }}>
          {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 14px",color:C.red,fontFamily:F,fontSize:12,marginBottom:16 }}>{err}</div>}

          {/* Step 1 */}
          {step===1&&(
            <div style={{ display:"flex",flexDirection:"column",gap:15,paddingBottom:4 }}>
              <div><label style={LBL()}>Project Name *</label><input style={INP()} value={name} onChange={e=>{setName(e.target.value);setErr("");}}/></div>
              <div><label style={LBL()}>Project Address *</label><input style={INP()} value={address} onChange={e=>{setAddress(e.target.value);setErr("");}}/></div>
              <div><label style={LBL()}>Description <span style={{color:C.muted,fontWeight:400}}>(optional)</span></label>
                <textarea style={{ ...INP(),resize:"none",lineHeight:1.55 }} rows={3} value={desc} onChange={e=>setDesc(e.target.value)}/></div>
              <div style={{ display:"flex",gap:12 }}>
                <div style={{ flex:1 }}><label style={LBL()}>Contract Value</label>
                  <input style={INP()} type="number" value={value} onChange={e=>setValue(e.target.value)} placeholder="0.00"/>
                </div>
                <div style={{ flex:1 }}><label style={LBL()}>Current Phase</label>
                  <select value={phase} onChange={e=>setPhase(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                    {PHASES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={LBL()}>Project Status</label>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {PROJ_STATUSES.map(s=>(
                    <button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,minWidth:90,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${s.c}`:`1px solid ${C.border}`,background:status===s.v?s.c+"22":"transparent",color:status===s.v?s.c:C.muted,transition:"all .15s" }}>{s.l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step===2&&(
            <div style={{ display:"flex",flexDirection:"column",gap:20,paddingBottom:4 }}>
              <div>
                <label style={{ ...LBL(),marginBottom:12 }}>Project Timeline</label>
                <div style={{ display:"flex",gap:14 }}>
                  <div style={{ flex:1 }}><label style={LBL()}>Starting Date</label><input type="date" value={startISO} onChange={e=>setStartISO(e.target.value)} style={{ ...INP(),colorScheme:"dark" }}/></div>
                  <div style={{ flex:1 }}><label style={LBL()}>Expected Finish Date</label><input type="date" value={endISO} onChange={e=>setEndISO(e.target.value)} style={{ ...INP(),colorScheme:"dark" }}/></div>
                </div>
                {startISO&&endISO&&(()=>{
                  const diff=Math.round((new Date(endISO)-new Date(startISO))/(1000*60*60*24));
                  const weeks=Math.round(diff/7);
                  return diff>0&&<div style={{ marginTop:10,background:C.green+"0d",border:`1px solid ${C.green}33`,borderRadius:7,padding:"8px 12px",color:C.green,fontFamily:F,fontSize:12 }}>Duration: <strong>{diff} days</strong> ({weeks} weeks)</div>;
                })()}
                {startISO&&endISO&&new Date(endISO)<=new Date(startISO)&&<div style={{ marginTop:10,background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"8px 12px",color:C.red,fontFamily:F,fontSize:12 }}>⚠️ End date must be after start date</div>}
              </div>
              <div>
                <label style={{ ...LBL(),marginBottom:12 }}>Project Type</label>
                <div style={{ display:"flex",gap:12 }}>
                  {[["business","🏢","Business","For a company or organization"],["customer","👤","Customer","For an individual client"]].map(([v,ic,l,sub])=>(
                    <div key={v} onClick={()=>setProjType(v)} style={{ flex:1,border:`2px solid ${projType===v?v==="business"?C.purple:C.blue:C.border}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",background:projType===v?v==="business"?C.purpleDim:C.blueDim:"transparent",transition:"all .15s" }}>
                      <div style={{ fontSize:24,marginBottom:8 }}>{ic}</div>
                      <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{l}</div>
                      <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>{sub}</div>
                      <div style={{ width:16,height:16,borderRadius:"50%",border:`2px solid ${projType===v?v==="business"?C.purple:C.blue:C.border}`,background:projType===v?v==="business"?C.purple:C.blue:"transparent",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",fontWeight:700 }}>{projType===v&&"✓"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Contacts */}
          {step===3&&(
            <div style={{ paddingBottom:4 }}>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginBottom:16 }}>Update the contacts for this project. The first contact is the primary client.</div>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {contacts.map((c,ci)=>(
                  <div key={c.id} style={{ background:C.surface,border:`1px solid ${ci===0?C.green+"44":C.border}`,borderRadius:12,padding:"16px 18px",position:"relative" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:22,height:22,borderRadius:"50%",background:C.accentDim,display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,fontFamily:F,fontWeight:700,fontSize:10 }}>{ci+1}</div>
                        <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>{ci===0?"Primary Contact":"Contact "+(ci+1)}</span>
                        {ci===0&&<span style={{ background:C.greenDim,color:C.green,fontSize:10,fontWeight:700,fontFamily:F,padding:"2px 8px",borderRadius:4 }}>Primary</span>}
                      </div>
                      {ci>0&&<button onClick={()=>removeContact(c.id)} style={{ background:C.redDim,color:C.red,border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:F,fontWeight:700 }}>Remove</button>}
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
                      <div style={{ display:"flex",gap:12 }}>
                        <div style={{ flex:1 }}><label style={LBL()}>Full Name</label><input style={INP()} value={c.name} onChange={e=>updateContact(c.id,"name",e.target.value)} placeholder="Contact name"/></div>
                        <div style={{ flex:1 }}><label style={LBL()}>Role</label>
                          <select value={c.role} onChange={e=>updateContact(c.id,"role",e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                            {CONTACT_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                      <div><label style={LBL()}>Company / Organisation</label><input style={INP()} value={c.company} onChange={e=>updateContact(c.id,"company",e.target.value)} placeholder="Company name (optional)"/></div>
                      <div style={{ display:"flex",gap:12 }}>
                        <div style={{ flex:1 }}><label style={LBL()}>Phone</label><input style={INP()} value={c.phone} onChange={e=>updateContact(c.id,"phone",e.target.value)} placeholder="+971 50 000 0000"/></div>
                        <div style={{ flex:1 }}><label style={LBL()}>Email</label><input style={INP()} value={c.email} onChange={e=>updateContact(c.id,"email",e.target.value)} placeholder="email@example.com"/></div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addContact} style={{ background:"transparent",color:C.accent,border:`1px dashed ${C.accent}66`,borderRadius:8,padding:"10px 0",fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer",width:"100%" }}>+ Add Another Contact</button>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ padding:"18px 28px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",gap:10 }}>
          {step>1
            ?<button onClick={()=>{setErr("");setStep(s=>s-1);}} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>← Back</button>
            :<button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
          }
          {step<3
            ?<button onClick={goNext} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 32px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>Next →</button>
            :<button onClick={handleSave} style={{ background:C.green,color:"#fff",border:"none",padding:"11px 32px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>✓ Save Changes</button>
          }
        </div>
      </div>
    </Overlay>
  );
}

// ─── New Project Modal ─────────────────────────────────────────────────────────
const CONTACT_ROLES=["Client","Site Manager","Project Manager","Architect","Structural Engineer","Supplier","Subcontractor","Investor","Legal Advisor","Other"];

const emptyContact=()=>({ id:`c${Date.now()}-${Math.random().toString(36).slice(2)}`, name:"", company:"", phone:"", email:"", role:"Client" });

function NewProjectModal({ onConfirm, onCancel }){
  const [name,setName]=useState("");
  const [address,setAddress]=useState("");
  const [desc,setDesc]=useState("");
  const [startISO,setStartISO]=useState("");
  const [endISO,setEndISO]=useState("");
  const [projType,setProjType]=useState("business");
  const [contacts,setContacts]=useState([emptyContact()]);
  const [step,setStep]=useState(1); // 1=info, 2=timeline&type, 3=contacts
  const [err,setErr]=useState("");

  const updateContact=(id,field,val)=>setContacts(cs=>cs.map(c=>c.id===id?{...c,[field]:val}:c));
  const addContact=()=>setContacts(cs=>[...cs,emptyContact()]);
  const removeContact=(id)=>setContacts(cs=>cs.filter(c=>c.id!==id));

  const fmtD=(iso)=>{ if(!iso)return"—"; try{ return new Date(iso+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }catch{return iso;} };

  const goNext=()=>{
    if(step===1){
      if(!name.trim()){setErr("Project name is required");return;}
      if(!address.trim()){setErr("Project address is required");return;}
      setErr(""); setStep(2);
    } else if(step===2){
      setErr(""); setStep(3);
    }
  };

  const handleCreate=()=>{
    const validContacts=contacts.filter(c=>c.name.trim());
    const primaryClient=validContacts[0]||{ name:"Unassigned", company:"", phone:"", email:"", initials:"?" };
    const initials=primaryClient.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";
    const newId=Date.now();
    const proj={
      id:newId, name:name.trim(), address:address.trim(), desc:desc.trim(),
      startDateISO:startISO, due:endISO,
      startDate:fmtD(startISO), dueFmt:fmtD(endISO),
      projType, status:"quoting", progress:0, phase:"Quoting",
      value:0, location:address.trim().split(",")[0]||"",
      client:{ name:primaryClient.name, company:primaryClient.company||"", phone:primaryClient.phone||"", email:primaryClient.email||"", initials },
      contacts:validContacts,
    };
    onConfirm(proj);
  };

  const STEPS=[["1","Project Info"],["2","Timeline & Type"],["3","Contacts"]];

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:580,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        {/* Header */}
        <div style={{ padding:"24px 28px 0",flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18 }}>🏗 New Project</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>Fill in the details to create your project</div>
            </div>
            <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",lineHeight:1 }}>✕</button>
          </div>
          {/* Step indicators */}
          <div style={{ display:"flex",gap:0,marginBottom:24 }}>
            {STEPS.map(([n,l],i)=>{
              const active=step===i+1; const done=step>i+1;
              return(
                <div key={n} style={{ display:"flex",alignItems:"center",flex:1 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flex:1 }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:done?C.green:active?C.accent:C.border,color:done||active?"#000":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:700,fontSize:12,flexShrink:0,transition:"all .2s" }}>{done?"✓":n}</div>
                    <span style={{ color:active?C.text:done?C.green:C.muted,fontFamily:F,fontSize:12,fontWeight:active?700:500,transition:"color .2s" }}>{l}</span>
                  </div>
                  {i<STEPS.length-1&&<div style={{ width:24,height:2,background:done?C.green:C.border,borderRadius:1,margin:"0 8px",flexShrink:0,transition:"background .2s" }}/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:"0 28px" }}>
          {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 14px",color:C.red,fontFamily:F,fontSize:12,marginBottom:16 }}>{err}</div>}

          {/* ── Step 1: Project Info ── */}
          {step===1&&(
            <div style={{ display:"flex",flexDirection:"column",gap:16,paddingBottom:4 }}>
              <div>
                <label style={LBL()}>Project Name *</label>
                <input style={INP()} placeholder="e.g. Riverside Townhomes Phase 2" value={name} onChange={e=>{setName(e.target.value);setErr("");}}/>
              </div>
              <div>
                <label style={LBL()}>Project Address *</label>
                <input style={INP()} placeholder="Full address including city, country" value={address} onChange={e=>{setAddress(e.target.value);setErr("");}}/>
              </div>
              <div>
                <label style={LBL()}>Project Description <span style={{ color:C.muted,fontWeight:400 }}>(optional)</span></label>
                <textarea style={{ ...INP(),resize:"none",lineHeight:1.55 }} rows={3} placeholder="Brief overview of scope, objectives, or special requirements…" value={desc} onChange={e=>setDesc(e.target.value)}/>
              </div>
            </div>
          )}

          {/* ── Step 2: Timeline & Type ── */}
          {step===2&&(
            <div style={{ display:"flex",flexDirection:"column",gap:20,paddingBottom:4 }}>
              <div>
                <label style={{ ...LBL(),marginBottom:12 }}>Project Timeline</label>
                <div style={{ display:"flex",gap:14 }}>
                  <div style={{ flex:1 }}>
                    <label style={LBL()}>Starting Date</label>
                    <input type="date" value={startISO} onChange={e=>setStartISO(e.target.value)} style={{ ...INP(),colorScheme:"dark" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={LBL()}>Expected Finish Date</label>
                    <input type="date" value={endISO} onChange={e=>setEndISO(e.target.value)} style={{ ...INP(),colorScheme:"dark" }}/>
                  </div>
                </div>
                {startISO&&endISO&&(()=>{
                  const diff=Math.round((new Date(endISO)-new Date(startISO))/(1000*60*60*24));
                  const weeks=Math.round(diff/7);
                  return diff>0&&<div style={{ marginTop:10,background:C.green+"0d",border:`1px solid ${C.green}33`,borderRadius:7,padding:"8px 12px",color:C.green,fontFamily:F,fontSize:12 }}>📅 Project duration: <strong>{diff} days</strong> ({weeks} weeks)</div>;
                })()}
                {startISO&&endISO&&new Date(endISO)<=new Date(startISO)&&<div style={{ marginTop:10,background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"8px 12px",color:C.red,fontFamily:F,fontSize:12 }}>⚠️ End date must be after start date</div>}
              </div>

              <div>
                <label style={{ ...LBL(),marginBottom:12 }}>Project Type</label>
                <div style={{ display:"flex",gap:12 }}>
                  {[["business","🏢","Business","For a company or organization"],["customer","👤","Customer","For an individual client"]].map(([v,ic,l,sub])=>(
                    <div key={v} onClick={()=>setProjType(v)} style={{ flex:1,border:`2px solid ${projType===v?v==="business"?C.purple:C.blue:C.border}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",background:projType===v?v==="business"?C.purpleDim:C.blueDim:"transparent",transition:"all .15s" }}>
                      <div style={{ fontSize:24,marginBottom:8 }}>{ic}</div>
                      <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{l}</div>
                      <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>{sub}</div>
                      <div style={{ width:16,height:16,borderRadius:"50%",border:`2px solid ${projType===v?v==="business"?C.purple:C.blue:C.border}`,background:projType===v?v==="business"?C.purple:C.blue:"transparent",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",fontWeight:700 }}>{projType===v&&"✓"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Contacts ── */}
          {step===3&&(
            <div style={{ paddingBottom:4 }}>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginBottom:16 }}>Add one or more contacts related to this project. The first contact will be used as the primary client.</div>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {contacts.map((c,ci)=>(
                  <div key={c.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",position:"relative" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:22,height:22,borderRadius:"50%",background:C.accentDim,display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,fontFamily:F,fontWeight:700,fontSize:10 }}>{ci+1}</div>
                        <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>{ci===0?"Primary Contact":"Contact "+(ci+1)}</span>
                        {ci===0&&<span style={{ background:C.greenDim,color:C.green,fontSize:10,fontWeight:700,fontFamily:F,padding:"2px 8px",borderRadius:4 }}>Primary</span>}
                      </div>
                      {ci>0&&<button onClick={()=>removeContact(c.id)} style={{ background:"transparent",color:C.red,border:"none",cursor:"pointer",fontSize:16,lineHeight:1 }}>✕</button>}
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                      <div style={{ display:"flex",gap:10 }}>
                        <div style={{ flex:1 }}><label style={LBL()}>Contact Name *</label><input style={INP()} placeholder="Full name" value={c.name} onChange={e=>updateContact(c.id,"name",e.target.value)}/></div>
                        <div style={{ flex:1 }}><label style={LBL()}>Company <span style={{ fontWeight:400 }}>(optional)</span></label><input style={INP()} placeholder="Company name" value={c.company} onChange={e=>updateContact(c.id,"company",e.target.value)}/></div>
                      </div>
                      <div style={{ display:"flex",gap:10 }}>
                        <div style={{ flex:1 }}><label style={LBL()}>Phone Number</label><input style={INP()} placeholder="+971 50 000 0000" value={c.phone} onChange={e=>updateContact(c.id,"phone",e.target.value)}/></div>
                        <div style={{ flex:1 }}><label style={LBL()}>Email</label><input style={INP()} placeholder="name@example.com" value={c.email} onChange={e=>updateContact(c.id,"email",e.target.value)}/></div>
                      </div>
                      <div style={{ flex:1 }}><label style={LBL()}>Role / Relationship</label>
                        <select value={c.role} onChange={e=>updateContact(c.id,"role",e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                          {CONTACT_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addContact} style={{ width:"100%",marginTop:12,background:"transparent",color:C.accent,border:`1px dashed ${C.accent}55`,padding:"11px 0",borderRadius:9,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
                + Add Another Contact
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"20px 28px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,gap:10 }}>
          <button onClick={step===1?onCancel:()=>setStep(s=>s-1)} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>
            {step===1?"Cancel":"← Back"}
          </button>
          <div style={{ display:"flex",gap:10 }}>
            {step<3
              ?<button onClick={goNext} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 28px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>Continue →</button>
              :<button onClick={handleCreate} style={{ background:C.green,color:"#fff",border:"none",padding:"11px 28px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:7 }}>🏗 Create Project</button>
            }
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Projects List ─────────────────────────────────────────────────────────────
function ProjectsList({ onSelect, allProjects, onAddProject, onUpdateProject, onDeleteProject }){
  const [showNew,setShowNew]=useState(false);
  const [editingProj,setEditingProj]=useState(null);
  const [confirmPatch,setConfirmPatch]=useState(null); // {proj, patch}
  const [confirmDelete,setConfirmDelete]=useState(null); // project to delete
  const handleCreate=async(proj)=>{ await onAddProject(proj); setShowNew(false); onSelect(proj); };
  return(
    <div>
      {showNew&&<NewProjectModal onConfirm={handleCreate} onCancel={()=>setShowNew(false)}/>}
      {editingProj&&<EditProjectModal project={editingProj}
        onConfirm={patch=>{ setEditingProj(null); setConfirmPatch({proj:editingProj,patch}); }}
        onCancel={()=>setEditingProj(null)}/>}
      {confirmPatch&&(
        <ConfirmDialog
          title="Save Project Changes?"
          message={`Are you sure you want to apply these changes to "${confirmPatch.proj.name}"?`}
          confirmLabel="Yes, Save Changes" variant="edit"
          onConfirm={async()=>{ await onUpdateProject(confirmPatch.proj.id,confirmPatch.patch); setConfirmPatch(null); }}
          onCancel={()=>setConfirmPatch(null)}/>
      )}
      {confirmDelete&&(
        <ConfirmDialog
          title="Delete Project?"
          message={`Are you sure you want to permanently delete "${confirmDelete.name}"? All related invoices, payments, plans, tasks and team assignments for this project will also be removed. This action cannot be undone.`}
          confirmLabel="Yes, Delete Project" variant="delete"
          onConfirm={async()=>{ await onDeleteProject(confirmDelete); setConfirmDelete(null); }}
          onCancel={()=>setConfirmDelete(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.red}33`,borderRadius:9,padding:"12px 16px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:36,height:36,background:C.redDim,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🏗</div>
              <div>
                <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:14 }}>{confirmDelete.name}</div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{confirmDelete.client?.name} · {confirmDelete.location||""}</div>
              </div>
              <div style={{ marginLeft:"auto" }}><Badge status={confirmDelete.status}/></div>
            </div>
          </div>
        </ConfirmDialog>
      )}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div>
          <h2 style={{ color:C.text,fontSize:20,fontFamily:F,fontWeight:700,margin:0 }}>Projects</h2>
          <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>{allProjects.length} projects total</div>
        </div>
        <button onClick={()=>setShowNew(true)} style={{ background:C.accent,color:"#000",border:"none",padding:"10px 20px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7 }}>🏗 + New Project</button>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {allProjects.map(p=>(
          <div key={p.id} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 24px",transition:"all .18s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"66";e.currentTarget.style.background=C.surface;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
            <div onClick={()=>onSelect(p)} style={{ cursor:"pointer" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:p.status!=="quoting"&&p.progress>0?14:0,gap:12 }}>
                {/* Left: name + meta */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap" }}>
                    <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:16 }}>{p.name}</div>
                    {p.projType&&<span style={{ background:p.projType==="business"?C.purpleDim:C.blueDim,color:p.projType==="business"?C.purple:C.blue,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,fontFamily:F }}>{p.projType==="business"?"🏢 Business":"👤 Customer"}</span>}
                  </div>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{p.client.name} · {p.location||p.address} · Due: {p.dueFmt} · {p.phase}</div>
                  {p.desc&&<div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:3,fontStyle:"italic" }}>{p.desc.slice(0,80)}{p.desc.length>80?"…":""}</div>}
                </div>
                {/* Right: value + status + edit icon — all on one line */}
                <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                  {p.value>0&&<span style={{ color:C.accent,fontFamily:F,fontWeight:700,fontSize:15 }}>${p.value.toLocaleString()}</span>}
                  <Badge status={p.status}/>
                  <button
                    onClick={e=>{e.stopPropagation();setEditingProj(p);}}
                    title="Edit project"
                    style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",flexShrink:0,transition:"all .15s",lineHeight:1 }}
                    onMouseEnter={e=>{e.currentTarget.style.color=C.accent;e.currentTarget.style.borderColor=C.accent+"66";e.currentTarget.style.background=C.accentDim;}}
                    onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                    ✏️
                  </button>
                  <button
                    onClick={e=>{e.stopPropagation();setConfirmDelete(p);}}
                    title="Delete project"
                    style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",flexShrink:0,transition:"all .15s",lineHeight:1 }}
                    onMouseEnter={e=>{e.currentTarget.style.color=C.red;e.currentTarget.style.borderColor=C.red+"66";e.currentTarget.style.background=C.redDim;}}
                    onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
                    🗑️
                  </button>
                  <span style={{ color:C.muted,fontSize:18,lineHeight:1 }}>›</span>
                </div>
              </div>
              {(()=>{
                const pct=calcProgress(p);
                const days=daysRemaining(p);
                const overdue=days!==null&&days<0&&p.status!=="completed";
                return pct>0?(
                  <div style={{ marginTop:10 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                      <span style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{p.phase}</span>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        {days!==null&&<span style={{ color:overdue?C.red:days<=7?C.accent:C.green,fontFamily:F,fontSize:11,fontWeight:700 }}>{p.status==="completed"?"Done":overdue?`${Math.abs(days)}d overdue`:`${days}d left`}</span>}
                        <span style={{ color:p.status==="completed"?C.green:overdue?C.red:C.accent,fontFamily:F,fontWeight:700,fontSize:12 }}>{pct}%</span>
                      </div>
                    </div>
                    <Bar pct={pct} color={p.status==="completed"?C.green:overdue?C.red:C.accent}/>
                  </div>
                ):null;
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
  { id:"projects",   label:"Project Progress",    icon:"🏗" },
  { id:"invoices",   label:"Recent Invoices",     icon:"🧾" },
  { id:"payments",   label:"Recent Payments",     icon:"💰" },
  { id:"tasks",      label:"Upcoming Tasks",      icon:"✅" },
  { id:"activity",   label:"Activity Log",        icon:"📋" },
  { id:"calendar",   label:"Upcoming Events",     icon:"📅" },
];

function DashWidget({ widgetId, type, allProjects, allInvoices, payments, tasks, globalLog, onSelect, onChangeType }){
  const [showPicker,setShowPicker]=useState(false);
  const wt=WIDGET_TYPES.find(w=>w.id===type)||WIDGET_TYPES[0];

  const renderContent=()=>{
    if(type==="projects") return(
      <div>
        {allProjects.filter(p=>p.status==="active").length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"12px 0" }}>No active projects</div>}
        {allProjects.filter(p=>p.status==="active").map(p=>{
          const pct=calcProgress(p); const days=daysRemaining(p); const ov=days!==null&&days<0;
          return(
            <div key={p.id} onClick={()=>onSelect&&onSelect(p)} style={{ marginBottom:12,cursor:"pointer",padding:"10px 12px",borderRadius:8,transition:"background .15s",border:`1px solid ${C.border}22` }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ color:C.text,fontFamily:F,fontSize:13,fontWeight:600 }}>{p.name}</span>
                <span style={{ color:ov?C.red:C.muted,fontFamily:F,fontSize:11 }}>{pct}%</span>
              </div>
              <Bar pct={pct} color={ov?C.red:p.status==="completed"?C.green:C.accent}/>
              <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:4 }}>{p.phase} · Due: {p.dueFmt}{ov?<span style={{color:C.red}}> ⚠ Overdue</span>:""}</div>
            </div>
          );
        })}
      </div>
    );
    if(type==="invoices") return(
      <div>
        {allInvoices.slice(0,5).map(inv=>{
          const st=INV_ST.find(s=>s.v===(inv.status||inv.invoiceStatus))||INV_ST[0];
          return(
            <div key={inv.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}22` }}>
              <div><div style={{ color:C.text,fontFamily:F,fontSize:12,fontWeight:600 }}>{inv.id||inv.invId}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{inv.project||inv.client||"—"}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>${Number(inv.amount||0).toLocaleString()}</div><span style={{ background:st.c+"22",color:st.c,padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,fontFamily:F }}>{st.l}</span></div>
            </div>
          );
        })}
        {allInvoices.length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>No invoices yet</div>}
      </div>
    );
    if(type==="payments") return(
      <div>
        {payments.slice(-5).reverse().map(p=>(
          <div key={p.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}22` }}>
            <div><div style={{ color:C.text,fontFamily:F,fontSize:12,fontWeight:600 }}>{p.project}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{p.dateFmt} · {p.method}</div></div>
            <div style={{ color:C.green,fontFamily:F,fontWeight:700,fontSize:13 }}>${p.amount.toLocaleString()}</div>
          </div>
        ))}
        {payments.length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>No payments yet</div>}
      </div>
    );
    if(type==="tasks") return(
      <div>
        {tasks.filter(t=>t.status==="pending").slice(0,5).map(t=>(
          <div key={t.id} style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}22` }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:C.accent,marginTop:5,flexShrink:0 }}/>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:C.text,fontFamily:F,fontSize:12,fontWeight:600 }}>{t.title}</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{t.member} · {t.project}</div>
            </div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:10,flexShrink:0 }}>{t.date}</div>
          </div>
        ))}
        {tasks.filter(t=>t.status==="pending").length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>No pending tasks</div>}
      </div>
    );
    if(type==="activity") return(
      <div>
        {globalLog.slice(0,6).map(e=>(
          <div key={e.id} style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}22` }}>
            <div style={{ fontSize:16,flexShrink:0,lineHeight:1.3 }}>{e.icon}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:C.text,fontFamily:F,fontSize:12,fontWeight:600 }}>{e.action}</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{e.user} · {e.time}</div>
            </div>
          </div>
        ))}
        {globalLog.length===0&&<div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>No activity yet</div>}
      </div>
    );
    if(type==="calendar") return(()=>{
      const now=new Date(); now.setHours(0,0,0,0);
      // Combine upcoming invoices + tasks + project milestones into one timeline
      const events=[];
      allInvoices.filter(i=>i.due&&(i.status||i.invoiceStatus)!=="paid").forEach(inv=>{
        const d=new Date(inv.due+"T00:00:00"); if(isNaN(d))return;
        events.push({ id:inv.id,date:d,icon:"🧾",label:`Invoice ${inv.id||inv.invId}`,sub:inv.project+` · $${Number(inv.amount||0).toLocaleString()}`,color:C.accent });
      });
      tasks.filter(t=>t.date&&t.status!=="done").forEach(t=>{
        const d=new Date(t.date+"T00:00:00"); if(isNaN(d))return;
        events.push({ id:"t"+t.id,date:d,icon:"✅",label:t.title,sub:t.member+" · "+t.project,color:C.blue });
      });
      allProjects.forEach(p=>{
        if(p.due){ const d=new Date(p.due+"T00:00:00"); if(!isNaN(d)&&d>=now) events.push({ id:"pd"+p.id,date:d,icon:"🏗",label:p.name+" due",sub:p.client?.name||"",color:C.purple }); }
      });
      events.sort((a,b)=>a.date-b.date);
      const upcoming=events.slice(0,6);
      if(upcoming.length===0) return <div style={{ color:C.muted,fontFamily:F,fontSize:12,padding:"8px 0" }}>No upcoming events</div>;
      return(
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {upcoming.map(ev=>{
            const mon=ev.date.toLocaleDateString("en-US",{month:"short"});
            const day=ev.date.toLocaleDateString("en-US",{day:"numeric"});
            const isPast=ev.date<now;
            return(
              <div key={ev.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,background:C.surface,border:`1px solid ${C.border}` }}>
                {/* Date badge — fixed min-width so text never overflows */}
                <div style={{ minWidth:46,width:46,background:ev.color+"18",border:`1px solid ${ev.color}44`,borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"5px 4px",flexShrink:0 }}>
                  <div style={{ color:ev.color,fontFamily:F,fontSize:10,fontWeight:700,lineHeight:1,whiteSpace:"nowrap",textTransform:"uppercase" }}>{mon}</div>
                  <div style={{ color:ev.color,fontFamily:F,fontSize:16,fontWeight:800,lineHeight:1.1,marginTop:1 }}>{day}</div>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                    <span style={{ fontSize:11 }}>{ev.icon}</span>
                    <div style={{ color:isPast?C.red:C.text,fontFamily:F,fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.label}</div>
                  </div>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    })();
    return null;
  };

  return(
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 22px",position:"relative" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
          <span style={{ fontSize:16 }}>{wt.icon}</span>
          <span style={{ color:C.text,fontFamily:F,fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>{wt.label}</span>
        </div>
        <button onClick={()=>setShowPicker(p=>!p)} title="Change widget" style={{ background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 9px",color:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>⚙ Customize</button>
      </div>
      {showPicker&&(
        <div style={{ position:"absolute",top:54,right:18,zIndex:200,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",boxShadow:"0 8px 32px rgba(0,0,0,.35)",minWidth:200 }}>
          <div style={{ color:C.muted,fontFamily:F,fontSize:10,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:.6 }}>Choose Widget</div>
          {WIDGET_TYPES.map(w=>(
            <button key={w.id} onClick={()=>{ onChangeType(w.id); setShowPicker(false); }}
              style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:7,background:type===w.id?C.accentDim:"transparent",border:"none",color:type===w.id?C.accent:C.text,fontFamily:F,fontSize:12,fontWeight:type===w.id?700:500,cursor:"pointer",textAlign:"left",marginBottom:2 }}>
              <span>{w.icon}</span>{w.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ maxHeight:280,overflowY:"auto" }}>{renderContent()}</div>
    </div>
  );
}

function Dashboard({ onSelect, allProjects=[], allInvoices=[], payments=[], tasks=[], globalLog=[] }){
  const [widget1,setWidget1]=useState(()=>{ try{ return localStorage.getItem("bf_w1")||"projects"; }catch{ return "projects"; } });
  const [widget2,setWidget2]=useState(()=>{ try{ return localStorage.getItem("bf_w2")||"invoices"; }catch{ return "invoices"; } });

  const setW1=t=>{ setWidget1(t); try{ localStorage.setItem("bf_w1",t); }catch{} };
  const setW2=t=>{ setWidget2(t); try{ localStorage.setItem("bf_w2",t); }catch{} };

  const activeCount=allProjects.filter(p=>p.status==="active").length;
  const outstanding=allInvoices.filter(i=>i.status!=="paid").reduce((s,i)=>s+Number(i.amount||0),0);
  const onSite=2; // static demo value

  const now=new Date();
  const h=now.getHours(); const gr=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  const dayName=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  return(
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginBottom:4 }}>{dayName}</div>
        <h2 style={{ color:C.text,fontFamily:F,fontSize:24,fontWeight:700,margin:0 }}>{gr}, Jordan 👷</h2>
      </div>
      {/* Stats row */}
      <div style={{ display:"flex",gap:12,marginBottom:24,flexWrap:"wrap" }}>
        {[
          ["Active Projects",activeCount,"Currently in progress",C.blue],
          ["Revenue (This Month)","$"+Math.round(payments.filter(p=>{ if(!p.date)return false; const d=new Date(p.date+"T12:00:00"); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear(); }).reduce((s,p)=>s+p.amount,0)/1000)+"k","Payments received",C.green],
          ["Outstanding","$"+Math.round(outstanding/1000)+"k",`${allInvoices.filter(i=>i.status!=="paid").length} unpaid invoices`,C.accent],
          ["Team On Site",onSite,"Today",C.purple],
        ].map(([l,v,s,c])=>(
          <div key={l} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 22px",flex:1,minWidth:130 }}>
            <div style={{ color:C.muted,fontSize:11,fontFamily:F,marginBottom:6 }}>{l}</div>
            <div style={{ color:c,fontSize:26,fontFamily:F,fontWeight:700,lineHeight:1 }}>{v}</div>
            <div style={{ color:C.muted,fontSize:12,fontFamily:F,marginTop:4 }}>{s}</div>
          </div>
        ))}
      </div>
      {/* Customizable widgets */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <DashWidget widgetId="w1" type={widget1} allProjects={allProjects} allInvoices={allInvoices} payments={payments} tasks={tasks} globalLog={globalLog} onSelect={onSelect} onChangeType={setW1}/>
        <DashWidget widgetId="w2" type={widget2} allProjects={allProjects} allInvoices={allInvoices} payments={payments} tasks={tasks} globalLog={globalLog} onSelect={onSelect} onChangeType={setW2}/>
      </div>
    </div>
  );
}

// ─── Global Invoices state hook ───────────────────────────────────────────────
// ALL invoices live in a single dynamic store (localStorage "invoices:global").
// On first load we seed ALL_INV_STATIC so those rows are fully manageable
// (editable, deletable) just like any user-created invoice.
// There are NO permanently protected invoices; the _static flag is gone.
function useGlobalInvoices(){
  const cid = useCompany();
  const [allInvoices,setAllInvoices]=useState(null);
  const load=useCallback(async()=>{
    if(!cid) return;
    const {data,error}=await dbInvoices.getAll();
    if(!error&&data) setAllInvoices(data.map(mapInvoice));
  },[cid]);
  useEffect(()=>{ load(); const t=setInterval(load,POLL_MS); return()=>clearInterval(t); },[load]);
  return{
    allInvoices:allInvoices||[], ready:allInvoices!==null,
    addInvoice:   async(inv)=>{ await dbInvoices.add(inv); load(); },
    updateInvoice:async(id,patch)=>{ await dbInvoices.update(id,patch); load(); },
    removeInvoice:async(id)=>{ await dbInvoices.delete(id); load(); },
  };
}

function EditInvoiceModal({ invoice, allProjects, onConfirm, onCancel }){
  const [project,setProject]   = useState(invoice.project||"");
  const [client,setClient]     = useState(invoice.client||"");
  const [desc,setDesc]         = useState(invoice.desc||"");
  const [amount,setAmount]     = useState(String(invoice.amount||""));
  const [due,setDue]           = useState(invoice.due||"");
  const [status,setStatus]     = useState(invoice.status||invoice.invoiceStatus||"pending");
  const [err,setErr]           = useState("");

  const submit=()=>{
    if(!amount||isNaN(parseFloat(amount))){ setErr("Amount is required"); return; }
    const fmt=due?new Date(due+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";
    onConfirm({ project, client, desc, amount:parseFloat(amount), due, dueFmt:fmt, status, invoiceStatus:status });
  };

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:480 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div>
            <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>✏️ Edit Invoice</div>
            <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>{invoice.id||invoice.invId}</div>
          </div>
          <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button>
        </div>
        {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"9px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:14 }}>⚠ {err}</div>}
        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          <div><label style={LBL()}>Project</label>
            <select value={project} onChange={e=>setProject(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              <option value="">— Select Project —</option>
              {allProjects.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div><label style={LBL()}>Client / Company</label><input style={INP()} value={client} onChange={e=>setClient(e.target.value)} placeholder="Client name"/></div>
          <div><label style={LBL()}>Description</label><textarea style={{ ...INP(),resize:"none" }} rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Invoice description"/></div>
          <div style={{ display:"flex",gap:12 }}>
            <div style={{ flex:1 }}><label style={LBL()}>Amount *</label><input style={INP()} type="number" value={amount} onChange={e=>{setAmount(e.target.value);setErr("");}} placeholder="0.00"/></div>
            <div style={{ flex:1 }}><label style={LBL()}>Due Date</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={due} onChange={e=>setDue(e.target.value)}/></div>
          </div>
          <div><label style={LBL()}>Status</label>
            <div style={{ display:"flex",gap:8 }}>
              {INV_ST.map(s=><button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${s.c}`:`1px solid ${C.border}`,background:status===s.v?s.c+"22":"transparent",color:status===s.v?s.c:C.muted,transition:"all .15s" }}>{s.l}</button>)}
            </div>
          </div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:22 }}>
          <button onClick={submit} style={{ flex:1,background:C.accent,color:"#000",border:"none",padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Save Changes</button>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"12px 18px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </Overlay>
  );
}

function AddGlobalInvoiceModal({ allProjects, allInvoices=[], onConfirm, onCancel }){
  const { currency:gCur } = useCurrencyCtx();
  const [project,setProject]    = useState(allProjects[0]?.name||"");
  const [client,setClient]      = useState("");
  const [supplier,setSupplier]  = useState("");
  const [desc,setDesc]          = useState("");
  const [amount,setAmount]      = useState("");
  const [currency,setCurrency]  = useState(gCur);
  const [invNum,setInvNum]      = useState(()=>nextInvId(allInvoices));
  const [invDate,setInvDate]    = useState("");
  const [due,setDue]            = useState("");
  const [status,setStatus]      = useState("pending");
  const [docFile,setDocFile]    = useState(null);
  const [aiRunning,setAiRunning]= useState(false);
  const [aiNote,setAiNote]      = useState("");
  const [err,setErr]            = useState("");
  const fileRef                 = useRef();

  useEffect(()=>{ const p=allProjects.find(p=>p.name===project); if(p&&p.client)setClient(p.client.company||p.client.name||""); },[project,allProjects]);
  // refresh suggested invoice# whenever allInvoices grows
  useEffect(()=>{ if(!invNum||invNum===nextInvId(allInvoices.slice(0,-1))) setInvNum(nextInvId(allInvoices)); },[allInvoices]);

  const handleFile=async(raw)=>{
    if(raw.size>5*1024*1024){ setErr("File too large (max 5 MB)"); return; }
    const du=await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(raw);});
    const f={name:raw.name,size:raw.size,dataUrl:du};
    setDocFile(f); setAiRunning(true); setAiNote("🤖 Reading with AI…"); setErr("");
    const res=await aiExtractInvoice(f);
    if(res){
      if(res.supplierName&&!supplier) setSupplier(res.supplierName);
      if(res.invoiceNumber)           setInvNum(res.invoiceNumber);
      if(res.invoiceDate&&!invDate)   setInvDate(res.invoiceDate);
      if(res.dueDate&&!due)           setDue(res.dueDate);
      if(res.amount&&!amount)         setAmount(String(res.amount));
      if(res.currency)                setCurrency(res.currency);
      if(res.description&&!desc)      setDesc(res.description);
      setAiNote("✅ AI extracted — review and edit below");
    } else { setAiNote("⚠️ Could not extract — fill in manually"); }
    setAiRunning(false);
  };

  const submit=()=>{
    if(!project){ setErr("Project is required"); return; }
    if(!amount||isNaN(parseFloat(amount))){ setErr("Amount is required"); return; }
    const fmt=due?new Date(due+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";
    const id=invNum||nextInvId(allInvoices);
    const proj=allProjects.find(p=>p.name===project);
    onConfirm({ id, invId:id, project, client:client||supplier||"", supplier:supplier||client||"",
      desc, amount:parseFloat(amount), due, dueFmt:fmt, status, invoiceStatus:status,
      currency, invDate:invDate||"—", projId:proj?.id||null,
      dataUrl:docFile?.dataUrl||null, name:docFile?.name||`${id}.pdf` });
  };

  return(
    <Overlay onClose={onCancel}>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,width:560,maxHeight:"93vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        {/* Header */}
        <div style={{ padding:"22px 28px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18 }}>🧾 New Invoice</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:2 }}>
                Auto number: <span style={{ color:C.accent,fontWeight:700 }}>{invNum}</span>
              </div>
            </div>
            <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer" }}>✕</button>
          </div>
        </div>
        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:"20px 28px" }}>
          {/* ── Upload zone ── */}
          <div onClick={()=>!aiRunning&&fileRef.current.click()}
            onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
            style={{ border:`2px dashed ${docFile?C.green+"55":C.accent+"44"}`,borderRadius:10,padding:"16px 18px",textAlign:"center",cursor:aiRunning?"default":"pointer",background:docFile?C.greenDim:C.accentDim,marginBottom:14,transition:"all .2s" }}>
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f)handleFile(f);e.target.value="";}}/>
            {aiRunning
              ? <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <div style={{ width:14,height:14,border:"2px solid",borderColor:C.purple,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>
                  <span style={{ color:C.purple,fontFamily:F,fontSize:13,fontWeight:600 }}>AI extracting data…</span>
                </div>
              : docFile
              ? <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <span style={{ fontSize:16 }}>📄</span>
                  <span style={{ color:C.green,fontFamily:F,fontSize:12,fontWeight:600 }}>{docFile.name}</span>
                  <button onClick={e=>{e.stopPropagation();setDocFile(null);setAiNote("");}} style={{ background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:14 }}>✕</button>
                </div>
              : <div>
                  <div style={{ color:C.text,fontFamily:F,fontWeight:600,fontSize:13,marginBottom:2 }}>
                    📎 Upload Invoice PDF or Image <span style={{ color:C.muted,fontWeight:400 }}>(optional)</span>
                  </div>
                  <div style={{ color:C.purple,fontFamily:F,fontSize:11 }}>🤖 AI will auto-fill fields from your file</div>
                </div>
            }
          </div>
          {aiNote&&<div style={{ background:aiNote.startsWith("OK")?C.greenDim:aiNote.startsWith("🤖")?C.purpleDim:C.accentDim,border:`1px solid ${aiNote.startsWith("OK")?C.green+"44":aiNote.startsWith("🤖")?C.purple+"44":C.accent+"44"}`,borderRadius:7,padding:"8px 12px",color:aiNote.startsWith("OK")?C.green:aiNote.startsWith("🤖")?C.purple:C.accent,fontFamily:F,fontSize:12,marginBottom:12 }}>{aiNote}</div>}
          {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"9px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:12 }}>⚠ {err}</div>}

          <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
            {/* Invoice # + Date */}
            <div style={{ display:"flex",gap:12 }}>
              <div style={{ flex:1 }}><label style={LBL()}>Invoice # *</label><input style={INP()} value={invNum} onChange={e=>setInvNum(e.target.value)} placeholder="INV-001"/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Invoice Date</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={invDate} onChange={e=>setInvDate(e.target.value)}/></div>
            </div>
            {/* Project */}
            <div><label style={LBL()}>Project *</label>
              <select value={project} onChange={e=>setProject(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                <option value="">— Select Project —</option>
                {allProjects.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            {/* Supplier + Client */}
            <div style={{ display:"flex",gap:12 }}>
              <div style={{ flex:1 }}><label style={LBL()}>Supplier / Company</label><input style={INP()} value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="e.g. Gulf Steel Co."/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Client</label><input style={INP()} value={client} onChange={e=>setClient(e.target.value)} placeholder="Auto-filled from project"/></div>
            </div>
            {/* Description */}
            <div><label style={LBL()}>Description</label><textarea style={{ ...INP(),resize:"none" }} rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What is this invoice for?"/></div>
            {/* Amount + Currency + Due */}
            <div style={{ display:"flex",gap:12 }}>
              <div style={{ flex:2 }}><label style={LBL()}>Amount *</label><input style={INP()} type="number" value={amount} onChange={e=>{setAmount(e.target.value);setErr("");}} placeholder="0.00"/></div>
              <div style={{ flex:1 }}><label style={LBL()}>Currency</label>
                <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
                  {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex:1.5 }}><label style={LBL()}>Due Date</label><input style={{ ...INP(),colorScheme:"dark" }} type="date" value={due} onChange={e=>setDue(e.target.value)}/></div>
            </div>
            {/* Status */}
            <div><label style={LBL()}>Status</label>
              <div style={{ display:"flex",gap:8 }}>
                {INV_ST.map(s=><button key={s.v} onClick={()=>setStatus(s.v)} style={{ flex:1,padding:"9px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,border:status===s.v?`2px solid ${s.c}`:`1px solid ${C.border}`,background:status===s.v?s.c+"22":"transparent",color:status===s.v?s.c:C.muted,transition:"all .15s" }}>{s.l}</button>)}
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:"18px 28px",borderTop:`1px solid ${C.border}`,flexShrink:0,display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"11px 20px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={submit} style={{ background:C.accent,color:"#000",border:"none",padding:"11px 32px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Save Invoice</button>
        </div>
      </div>
    </Overlay>
  );
}

function InvoicingPage({ allProjects=[], allInvoices=[], addInvoice, updateInvoice, removeInvoice }){
  const ready=allInvoices!==undefined;
  const [projFilter,setProjFilter]=useState("all");
  const [clientFilter,setClientFilter]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [editing,setEditing]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [confirmEdit,setConfirmEdit]=useState(null); // {invoice, patch}
  const [previewInv,setPreviewInv]=useState(null);

  const filtered=useMemo(()=>allInvoices.filter(inv=>{
    if(projFilter!=="all"&&inv.project!==projFilter)return false;
    if(clientFilter!=="all"&&inv.client!==clientFilter)return false;
    return true;
  }),[allInvoices,projFilter,clientFilter]);

  const projects=useMemo(()=>[...new Set(allInvoices.map(i=>i.project).filter(Boolean))],[allInvoices]);
  const clients =useMemo(()=>[...new Set(allInvoices.map(i=>i.client).filter(Boolean))]  ,[allInvoices]);

  const outstanding=filtered.filter(i=>i.status!=="paid").reduce((s,i)=>s+Number(i.amount||0),0);
  const overdue    =filtered.filter(i=>i.status==="overdue").reduce((s,i)=>s+Number(i.amount||0),0);
  const paid       =filtered.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);

  const cycleStatus=async(inv)=>{
    const next={pending:"paid",paid:"overdue",overdue:"pending"}[inv.status||inv.invoiceStatus]||"pending";
    await updateInvoice(inv.id,{status:next,invoiceStatus:next});
  };

  if(!ready)return <div style={{ color:C.muted,fontFamily:F,padding:"40px 0",textAlign:"center" }}>Loading…</div>;

  return(
    <div>
      {previewInv&&<FilePreviewModal file={previewInv} onClose={()=>setPreviewInv(null)}/>}
      {showAdd&&<AddGlobalInvoiceModal allProjects={allProjects} allInvoices={allInvoices} onConfirm={async inv=>{await addInvoice(inv);setShowAdd(false);}} onCancel={()=>setShowAdd(false)}/>}
      {editing&&<EditInvoiceModal invoice={editing} allProjects={allProjects}
        onConfirm={patch=>setConfirmEdit({invoice:editing,patch})}
        onCancel={()=>setEditing(null)}/>}
      {confirmEdit&&(
        <ConfirmDialog
          title="Save Changes?"
          message="Are you sure you want to apply these changes to this invoice?"
          confirmLabel="Yes, Save" variant="edit"
          onConfirm={async()=>{ await updateInvoice(confirmEdit.invoice.id,confirmEdit.patch); setConfirmEdit(null); setEditing(null); }}
          onCancel={()=>setConfirmEdit(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between" }}>
            <span style={{ color:C.accent,fontFamily:F,fontWeight:700 }}>{confirmEdit.invoice.id||confirmEdit.invoice.invId}</span>
            <span style={{ color:C.text,fontFamily:F,fontWeight:700 }}>${Number(confirmEdit.patch.amount||confirmEdit.invoice.amount||0).toLocaleString()}</span>
          </div>
        </ConfirmDialog>
      )}
      {confirmDelete&&(
        <ConfirmDialog
          title="Delete Invoice?"
          message={`Are you sure you want to delete invoice "${confirmDelete.id||confirmDelete.invId}"? This action cannot be undone.`}
          confirmLabel="Yes, Delete" variant="delete"
          onConfirm={async()=>{ await removeInvoice(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={()=>setConfirmDelete(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ color:C.accent,fontFamily:F,fontWeight:700 }}>{confirmDelete.id||confirmDelete.invId}</span>
            <span style={{ color:C.text,fontFamily:F,fontWeight:700 }}>${Number(confirmDelete.amount||0).toLocaleString()}</span>
          </div>
        </ConfirmDialog>
      )}

      {/* Header */}
      <PageHeader icon="🧾" title="Invoices" subtitle="All invoices across every project"
        action={<Btn variant="primary" onClick={()=>setShowAdd(true)}>+ New Invoice</Btn>}/>

      {/* Stats */}
      <div style={{ display:"flex",gap:12,marginBottom:24,flexWrap:"wrap" }}>
        <StatCard label="Outstanding"   value={"$"+(outstanding/1000).toFixed(0)+"k"}  sub={`${filtered.filter(i=>i.status!=="paid").length} invoices`}        color={C.blue}/>
        <StatCard label="Overdue"       value={"$"+(overdue/1000).toFixed(0)+"k"}       sub="Needs follow-up"                                                    color={C.red}/>
        <StatCard label="Collected"     value={"$"+(paid/1000).toFixed(0)+"k"}          sub={`${filtered.filter(i=>i.status==="paid").length} paid`}             color={C.green}/>
        <StatCard label="Total Invoices" value={filtered.length}                         sub="All statuses"                                                       color={C.purple}/>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
        <select value={projFilter} onChange={e=>setProjFilter(e.target.value)} style={{ ...INP(),width:"auto",padding:"9px 14px",borderRadius:8,cursor:"pointer",flexShrink:0 }}>
          <option value="all">All Projects</option>
          {projects.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <select value={clientFilter} onChange={e=>setClientFilter(e.target.value)} style={{ ...INP(),width:"auto",padding:"9px 14px",borderRadius:8,cursor:"pointer",flexShrink:0 }}>
          <option value="all">All Clients</option>
          {clients.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        {(projFilter!=="all"||clientFilter!=="all")&&<button onClick={()=>{setProjFilter("all");setClientFilter("all");}} style={{ background:C.surface,color:C.muted,border:`1px solid ${C.border}`,padding:"9px 14px",borderRadius:8,fontFamily:F,fontSize:12,cursor:"pointer" }}>✕ Clear</button>}
        <span style={{ marginLeft:"auto",color:C.muted,fontFamily:F,fontSize:12,alignSelf:"center" }}>{filtered.length} invoice{filtered.length!==1?"s":""}</span>
      </div>

      {/* Table */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
        {filtered.length===0
          ?<EmptyState icon="🧾" title="No invoices match your filters" sub="Try clearing your filters"/>
          :<table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:13 }}>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}`,background:C.surface }}>
              {["Invoice #","Project","Client","Amount","Due Date","Status",""].map(h=><th key={h} style={TH()}>{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map((inv,i)=>{
              const st=INV_ST.find(s=>s.v===(inv.status||inv.invoiceStatus))||INV_ST[0];
              return(
                <tr key={inv.id} style={{ borderBottom:i<filtered.length-1?`1px solid ${C.border}22`:"none",transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={TD({color:C.accent,fontWeight:700})}>{fmtInvId(inv)}</td>
                  <td style={TD({color:C.text,fontWeight:600})}>{inv.project||"—"}</td>
                  <td style={TD({color:C.muted})}>{inv.client||"—"}</td>
                  <td style={TD({color:C.text,fontWeight:700})}>${Number(inv.amount||0).toLocaleString()}</td>
                  <td style={TD({color:(inv.status||inv.invoiceStatus)==="overdue"?C.red:C.muted})}>{inv.dueFmt||inv.dueDate||"—"}</td>
                  <td style={TD()}>
                    <button onClick={()=>cycleStatus(inv)} title="Click to cycle status" style={{ background:st.c+"22",color:st.c,border:`1px solid ${st.c}55`,padding:"4px 10px",borderRadius:5,fontFamily:F,fontSize:12,fontWeight:700,cursor:"pointer" }}>{st.l}</button>
                  </td>
                  <td style={TD()}>
                    <RowActions>
                      {inv.dataUrl&&<RowBtn type="view" onClick={()=>setPreviewInv(inv)}>View</RowBtn>}
                      <RowBtn type="edit" onClick={()=>setEditing(inv)}>Edit</RowBtn>
                      <RowBtn type="delete" onClick={()=>setConfirmDelete(inv)}>Delete</RowBtn>
                    </RowActions>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        }
      </div>
    </div>
  );
}

function TeamGlobal({ allProjects=[], onLog }){
  const cid = useCompany();
  const [liveMembers,setLiveMembers]   = useState([]);
  const [sysUsers,setSysUsers]         = useState([]);
  const [version,setVersion]           = useState(0);
  const [showAddModal,setShowAddModal] = useState(false);
  const [editingMember,setEditingMember]         = useState(null);
  const [confirmEditMember,setConfirmEditMember] = useState(null);
  const [confirmDelMember,setConfirmDelMember]   = useState(null);
  const [projFilter,setProjFilter] = useState("all");
  const [activeTab,setActiveTab]   = useState("crew"); // "crew" | "users"

  const refresh = () => setVersion(v => v+1);

  // Load project team members
  useEffect(()=>{
    let alive = true;
    (async()=>{
      const {data,error} = await dbTeam.getAll();
      if(!alive) return;
      if(!error && data){
        setLiveMembers(data.map(m=>({
          ...mapMember(m),
          projectName: allProjects.find(p=>p.id===m.project_id)?.name||"Unknown Project"
        })));
      }
    })();
    return()=>{ alive=false; };
  },[allProjects,version]);

  // Load system users (profiles)
  useEffect(()=>{
    if(!cid) return;
    let alive = true;
    (async()=>{
      const {data,error} = await dbProfiles.getCompanyUsers();
      if(!alive) return;
      if(!error && data) setSysUsers(data);
    })();
    return()=>{ alive=false; };
  },[cid,version]);

  const handleEditMember=async(patch)=>{
    await dbTeam.update(editingMember.id, patch);
    if(onLog) onLog({ id:Date.now(),action:`${editingMember.name} updated`,detail:editingMember.projectName||"",user:"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"✏️" });
    refresh(); setEditingMember(null); setConfirmEditMember(null);
  };

  const handleAddMember=async(m)=>{
    await dbTeam.add(m, m.projId);
    if(onLog) onLog({ id:Date.now(),action:`${m.name} added to team`,detail:m.projectName||"",user:"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"👷" });
    setShowAddModal(false); refresh();
  };

  const handleDeleteMember=async()=>{
    const {id,name,projectName}=confirmDelMember;
    await dbTeam.delete(id);
    if(onLog) onLog({ id:Date.now(),action:`${name} removed from team`,detail:projectName||"",user:"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"🗑️" });
    refresh(); setConfirmDelMember(null);
  };

  const filtered = projFilter==="all" ? liveMembers : liveMembers.filter(m=>String(m.projId)===projFilter);
  const onSite   = liveMembers.filter(m=>m.status==="on-site").length;
  const remote   = liveMembers.filter(m=>m.status==="remote").length;

  return(
    <div>
      {showAddModal&&(
        <Overlay onClose={()=>setShowAddModal(false)}>
          <TeamGlobalAddModal allProjects={allProjects} onConfirm={handleAddMember} onCancel={()=>setShowAddModal(false)}/>
        </Overlay>
      )}
      {editingMember&&(
        <EditMemberModal member={editingMember} allProjects={allProjects}
          onConfirm={patch=>{ setConfirmEditMember({patch}); setEditingMember(null); }}
          onCancel={()=>setEditingMember(null)}/>
      )}
      {confirmEditMember&&(
        <ConfirmDialog title="Save Member Changes?" message="Are you sure you want to apply these changes?"
          confirmLabel="Yes, Save" variant="edit"
          onConfirm={()=>handleEditMember(confirmEditMember.patch)}
          onCancel={()=>setConfirmEditMember(null)}/>
      )}
      {confirmDelMember&&(
        <ConfirmDialog title="Remove Team Member?" message={`Remove ${confirmDelMember.name} from ${confirmDelMember.projectName}? This cannot be undone.`}
          confirmLabel="Yes, Remove" variant="delete"
          onConfirm={handleDeleteMember} onCancel={()=>setConfirmDelMember(null)}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:38,height:38,borderRadius:"50%",background:(confirmDelMember.color||C.blue)+"22",border:`2px solid ${(confirmDelMember.color||C.blue)}44`,display:"flex",alignItems:"center",justifyContent:"center",color:confirmDelMember.color||C.blue,fontFamily:F,fontWeight:700,fontSize:13,flexShrink:0 }}>{confirmDelMember.init}</div>
            <div><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13 }}>{confirmDelMember.name}</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{confirmDelMember.role} · {confirmDelMember.projectName}</div></div>
          </div>
        </ConfirmDialog>
      )}

      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12 }}>
        <div>
          <h2 style={{ color:C.text,fontSize:20,fontFamily:F,fontWeight:700,margin:0 }}>👥 Team & Scheduling</h2>
          <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginTop:3 }}>{liveMembers.length} crew · {sysUsers.length} system users</div>
        </div>
        {activeTab==="crew"&&<button onClick={()=>setShowAddModal(true)} style={{ background:C.accent,color:"#000",border:"none",padding:"10px 20px",borderRadius:9,fontFamily:F,fontWeight:700,fontSize:13,cursor:"pointer" }}>+ Add Member</button>}
      </div>

      {/* Stats */}
      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap" }}>
        {[["Crew Members",liveMembers.length,C.blue],["On Site",onSite,C.green],["Remote",remote,C.purple],["System Users",sysUsers.length,C.accent]].map(([l,v,c])=>(
          <div key={l} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 20px",flex:1,minWidth:110 }}>
            <div style={{ color:C.muted,fontFamily:F,fontSize:11,marginBottom:5 }}>{l}</div>
            <div style={{ color:c,fontFamily:F,fontWeight:700,fontSize:28,lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display:"flex",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:4,gap:3,marginBottom:20,width:"fit-content" }}>
        {[["crew","🔨 Project Crew"],["users","🖥 System Users"]].map(([v,l])=>(
          <button key={v} onClick={()=>setActiveTab(v)} style={{ background:activeTab===v?C.accentDim:"transparent",color:activeTab===v?C.accent:C.muted,border:activeTab===v?`1px solid ${C.accentMid}`:"1px solid transparent",borderRadius:6,padding:"8px 18px",fontFamily:F,fontSize:13,fontWeight:700,cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {/* ── PROJECT CREW TAB ── */}
      {activeTab==="crew"&&(
        <div>
          <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
            <select value={projFilter} onChange={e=>setProjFilter(e.target.value)} style={{ ...INP(),width:"auto",padding:"8px 14px",borderRadius:8,cursor:"pointer" }}>
              <option value="all">All Projects</option>
              {allProjects.map(p=><option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>
            <span style={{ color:C.muted,fontFamily:F,fontSize:12,marginLeft:"auto" }}>{filtered.length} member{filtered.length!==1?"s":""}</span>
          </div>
          {filtered.length===0&&(
            <div style={{ background:C.card,border:`2px dashed ${C.border}`,borderRadius:12,padding:"48px 20px",textAlign:"center",color:C.muted,fontFamily:F,fontSize:13 }}>
              <div style={{ fontSize:36,marginBottom:10 }}>👷</div>No crew members yet — click <strong>+ Add Member</strong> to get started
            </div>
          )}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {filtered.map(m=>(
              <div key={`${m.projId}-${m.id}`} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 22px",display:"flex",alignItems:"center",gap:16,transition:"border-color .18s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent+"55"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{ width:46,height:46,borderRadius:"50%",background:(m.color||C.blue)+"22",border:`2px solid ${(m.color||C.blue)}55`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color||C.blue,fontFamily:F,fontWeight:700,fontSize:15,flexShrink:0 }}>{m.init}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3 }}>
                    <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15 }}>{m.name}</span>
                    <Badge status={m.type||"employee"}/>
                  </div>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:12,display:"flex",gap:14,flexWrap:"wrap" }}>
                    <span>🔨 {m.role}</span>
                    {m.phone&&<span>📞 {m.phone}</span>}
                    {m.email&&<span>✉️ {m.email}</span>}
                    <span style={{ color:C.accent }}>🏗 {m.projectName}</span>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",flexShrink:0 }}>
                  <Badge status={m.status||"on-site"}/>
                  <div style={{ display:"flex",gap:5 }}>
                    <RowBtn type="edit" onClick={()=>setEditingMember(m)}>Edit</RowBtn>
                    <RowBtn type="delete" onClick={()=>setConfirmDelMember(m)}>Delete</RowBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SYSTEM USERS TAB ── */}
      {activeTab==="users"&&(
        <div>
          <div style={{ color:C.muted,fontFamily:F,fontSize:12,marginBottom:16 }}>These are the accounts that can log into BuildFlow. Managed by your administrator.</div>
          {sysUsers.length===0&&(
            <div style={{ background:C.card,border:`2px dashed ${C.border}`,borderRadius:12,padding:"48px 20px",textAlign:"center",color:C.muted,fontFamily:F,fontSize:13 }}>
              <div style={{ fontSize:36,marginBottom:10 }}>🖥</div>No system users found
            </div>
          )}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {sysUsers.map(u=>{
              const initials=(u.full_name||u.email||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
              const roleColor = u.role==="superadmin"?C.red : u.role==="admin"?C.accent : C.blue;
              const roleBg    = u.role==="superadmin"?C.redDim : u.role==="admin"?C.accentDim : C.blueDim;
              return(
                <div key={u.id} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 22px",display:"flex",alignItems:"center",gap:16 }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent+"55"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{ width:46,height:46,borderRadius:"50%",background:roleBg,border:`2px solid ${roleColor}44`,display:"flex",alignItems:"center",justifyContent:"center",color:roleColor,fontFamily:F,fontWeight:700,fontSize:15,flexShrink:0 }}>{initials}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap" }}>
                      <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15 }}>{u.full_name||"—"}</span>
                      <span style={{ background:roleBg,color:roleColor,padding:"2px 9px",borderRadius:4,fontSize:11,fontWeight:700,fontFamily:F }}>{u.role||"user"}</span>
                    </div>
                    <div style={{ color:C.muted,fontFamily:F,fontSize:12 }}>{u.email}</div>
                  </div>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:11,flexShrink:0 }}>
                    {Object.entries(u.permissions||{}).filter(([,v])=>v).map(([k])=>k).join(" · ")||"No permissions"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


// Add Member Modal for global Team section
function TeamGlobalAddModal({ allProjects, onConfirm, onCancel }){
  const [name,setName]=useState(""); const [role,setRole]=useState(ROLES[0]);
  const [phone,setPhone]=useState(""); const [email,setEmail]=useState("");
  const [projId,setProjId]=useState(allProjects[0]?.id||null);
  const [status,setStatus]=useState("on-site"); const [err,setErr]=useState("");
  const proj=allProjects.find(p=>p.id===projId);
  const submit=()=>{
    if(!name.trim()){ setErr("Name is required"); return; }
    const init=name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const colors=[C.blue,C.purple,C.green,C.accent,"#f43f5e","#06b6d4"];
    onConfirm({ name:name.trim(),role,phone:phone.trim(),email:email.trim(),status,projId,projectName:proj?.name||"",init,color:colors[Math.floor(Math.random()*colors.length)],type:"employee" });
  };
  return(
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:460 }} onClick={e=>e.stopPropagation()}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <span style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:17 }}>👷 Add Team Member</span>
        <button onClick={onCancel} style={{ background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer" }}>✕</button>
      </div>
      {err&&<div style={{ background:C.redDim,border:`1px solid ${C.red}44`,borderRadius:7,padding:"9px 12px",color:C.red,fontFamily:F,fontSize:12,marginBottom:14 }}>⚠ {err}</div>}
      <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
        <div style={{ display:"flex",gap:12 }}>
          <div style={{ flex:2 }}><label style={LBL()}>Name *</label><input style={INP()} value={name} onChange={e=>{setName(e.target.value);setErr("");}} placeholder="Full name"/></div>
          <div style={{ flex:2 }}><label style={LBL()}>Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
              {ROLES.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex",gap:12 }}>
          <div style={{ flex:1 }}><label style={LBL()}>Phone</label><input style={INP()} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+971 50 000 0000"/></div>
          <div style={{ flex:1 }}><label style={LBL()}>Email</label><input style={INP()} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></div>
        </div>
        <div><label style={LBL()}>Assign to Project</label>
          <select value={projId} onChange={e=>setProjId(e.target.value)} style={{ ...INP(),cursor:"pointer" }}>
            {allProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label style={LBL()}>Status</label>
          <div style={{ display:"flex",gap:7 }}>
            {["on-site","remote"].map(s=>{const sm=SM[s]||{};return(
              <button key={s} onClick={()=>setStatus(s)} style={{ flex:1,padding:"8px 0",borderRadius:7,cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:700,border:status===s?`2px solid ${sm.color||C.green}`:`1px solid ${C.border}`,background:status===s?(sm.bg||C.greenDim):"transparent",color:status===s?(sm.color||C.green):C.muted }}>{sm.label||s}</button>
            );})}
          </div>
        </div>
      </div>
      <div style={{ display:"flex",gap:10,marginTop:22 }}>
        <button onClick={submit} style={{ flex:1,background:C.accent,color:"#000",border:"none",padding:"12px 0",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Add Member</button>
        <button onClick={onCancel} style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"12px 16px",borderRadius:8,fontFamily:F,fontSize:13,cursor:"pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Price Tracking Page ───────────────────────────────────────────────────────
const MATERIALS = [
  { id:"steel",    name:"Structural Steel",  unit:"per tonne",   icon:"🔩", color:"#94a3b8", base:780,   seed:[770,775,768,780,792,785,780],  desc:"Hot-rolled structural sections (I-beams, channels)" },
  { id:"concrete", name:"Ready-Mix Concrete",unit:"per m³",      icon:"🏗", color:"#a78bfa", base:95,    seed:[90,92,91,93,96,94,95],         desc:"C30 standard grade, delivered to site" },
  { id:"cement",   name:"Portland Cement",   unit:"per 50 kg bag",icon:"🪨",color:"#f59e0b", base:28,    seed:[27,27.5,28,27.8,28.5,28,28],   desc:"OPC Grade 42.5, bulk & bagged" },
  { id:"copper",   name:"Copper",            unit:"per tonne",   icon:"🔶", color:"#f97316", base:9400,  seed:[9100,9250,9200,9400,9500,9450,9400], desc:"Copper cathode, LME grade A" },
  { id:"aluminum", name:"Aluminum",          unit:"per tonne",   icon:"⬜", color:"#38bdf8", base:2450,  seed:[2350,2380,2400,2420,2460,2450,2450], desc:"Primary aluminum ingot, LME" },
  { id:"lumber",   name:"Construction Lumber",unit:"per m³",     icon:"🪵", color:"#84cc16", base:420,   seed:[400,408,410,415,425,420,420],   desc:"Structural softwood, graded timber" },
];

// Generates realistic-looking price history from a seed
function genHistory(mat, days=30){
  const pts=[]; let price=mat.seed[0];
  const volatility = mat.base * 0.012;
  for(let i=days;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const label=d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
    // use seed for last 7, then jitter backwards
    if(i<7){ const si=6-i; price=mat.seed[si]+(Math.sin(si*1.7)*volatility*0.3); }
    else { price+=((Math.random()-0.48)*volatility); price=Math.max(price,mat.base*0.82); }
    pts.push({ label, price:Math.round(price*100)/100 });
  }
  return pts;
}

function SparkLine({ data, color, width=220, height=52 }){
  if(!data||data.length<2)return null;
  const prices=data.map(d=>d.price);
  const mn=Math.min(...prices),mx=Math.max(...prices);
  const range=mx-mn||1;
  const pts=data.map((d,i)=>{
    const x=(i/(data.length-1))*width;
    const y=height-((d.price-mn)/range)*(height-8)-4;
    return `${x},${y}`;
  }).join(" ");
  const areaBot=data.map((d,i)=>{ const x=(i/(data.length-1))*width; return `${x},${height}`; });
  const areaPath=`M ${pts.split(" ").map((p,i)=>i===0?`${p}`:`L${p}`).join(" ")} L${areaBot[areaBot.length-1]} L${areaBot[0]} Z`;
  return(
    <svg width={width} height={height} style={{ display:"block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {/* latest dot */}
      {(()=>{ const last=pts.split(" ").at(-1).split(","); return <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} stroke="#1e2333" strokeWidth="2"/>; })()}
    </svg>
  );
}

function PriceCard({ mat, history, aiAnalysis, onAnalyse, analysing }){
  const [expanded,setExpanded]=useState(false);
  const latest=history[history.length-1]?.price||mat.base;
  const prev=history[history.length-8]?.price||mat.base;  // ~1 week ago
  const prev1=history[history.length-2]?.price||mat.base; // yesterday
  const dayChg=latest-prev1; const dayPct=(dayChg/prev1)*100;
  const wkChg=latest-prev;   const wkPct=(wkChg/prev)*100;
  const up=dayChg>=0;
  const trendColor=Math.abs(dayPct)<0.3?"#7a849e":up?C.green:C.red;

  return(
    <div style={{ background:"#1e2333",border:`1px solid ${expanded?mat.color+"55":"#2a3045"}`,borderRadius:14,padding:"20px 22px",transition:"border-color .2s",display:"flex",flexDirection:"column",gap:14 }}>
      {/* Top row */}
      <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
        <div style={{ width:44,height:44,borderRadius:10,background:mat.color+"22",border:`1px solid ${mat.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{mat.icon}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ color:"#e8eaf0",fontFamily:F,fontWeight:700,fontSize:15 }}>{mat.name}</div>
          <div style={{ color:"#7a849e",fontFamily:F,fontSize:11,marginTop:2 }}>{mat.desc}</div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ color:"#e8eaf0",fontFamily:F,fontWeight:700,fontSize:20,lineHeight:1 }}>${latest.toLocaleString("en-US",{minimumFractionDigits:latest<100?2:0,maximumFractionDigits:latest<100?2:0})}</div>
          <div style={{ color:"#7a849e",fontFamily:F,fontSize:10,marginTop:2 }}>{mat.unit}</div>
        </div>
      </div>

      {/* Spark + changes */}
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12 }}>
        <SparkLine data={history} color={mat.color} width={200} height={52}/>
        <div style={{ display:"flex",flexDirection:"column",gap:6,flexShrink:0,alignItems:"flex-end" }}>
          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
            <span style={{ color:"#7a849e",fontFamily:F,fontSize:10 }}>24h</span>
            <span style={{ color:trendColor,fontFamily:F,fontWeight:700,fontSize:12 }}>{up?"▲":"▼"} {Math.abs(dayPct).toFixed(2)}%</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
            <span style={{ color:"#7a849e",fontFamily:F,fontSize:10 }}>7d</span>
            <span style={{ color:wkChg>=0?"#22c55e":"#ef4444",fontFamily:F,fontWeight:700,fontSize:12 }}>{wkChg>=0?"▲":"▼"} {Math.abs(wkPct).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* 30-day range bar */}
      {(()=>{ const mn=Math.min(...history.map(d=>d.price)),mx=Math.max(...history.map(d=>d.price)); const pct=((latest-mn)/(mx-mn||1))*100;
        return(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ color:"#7a849e",fontFamily:F,fontSize:10 }}>30d Low ${mn.toLocaleString("en-US",{maximumFractionDigits:latest<100?2:0})}</span>
              <span style={{ color:"#7a849e",fontFamily:F,fontSize:10 }}>30d High ${mx.toLocaleString("en-US",{maximumFractionDigits:latest<100?2:0})}</span>
            </div>
            <div style={{ height:4,background:"#2a3045",borderRadius:4,overflow:"hidden" }}>
              <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${mat.color}99,${mat.color})`,borderRadius:4 }}/>
            </div>
          </div>
        );
      })()}

      {/* AI analysis toggle */}
      <div>
        <button onClick={()=>{ if(!aiAnalysis&&!analysing)onAnalyse(mat.id); setExpanded(v=>!v); }}
          style={{ background:"transparent",color:analysing?"#a78bfa":"#7a849e",border:`1px solid ${analysing?"#a78bfa44":"#2a3045"}`,borderRadius:6,padding:"6px 14px",fontFamily:F,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all .15s" }}
          onMouseEnter={e=>{e.currentTarget.style.color="#a78bfa";e.currentTarget.style.borderColor="#a78bfa44";}}
          onMouseLeave={e=>{e.currentTarget.style.color=analysing?"#a78bfa":"#7a849e";e.currentTarget.style.borderColor=analysing?"#a78bfa44":"#2a3045";}}>
          {analysing?<><div style={{ width:10,height:10,border:"2px solid #a78bfa",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Analysing…</>:<>🤖 {expanded&&aiAnalysis?"Hide":"AI Buying Insight"}</>}
        </button>
        {expanded&&aiAnalysis&&(
          <div style={{ marginTop:10,background:"#181c27",border:"1px solid #a78bfa33",borderRadius:8,padding:"12px 14px" }}>
            <div style={{ color:"#a78bfa",fontFamily:F,fontSize:11,fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:5 }}>🤖 AI Buying Insight — {mat.name}</div>
            <div style={{ color:"#c4cae0",fontFamily:F,fontSize:12,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{aiAnalysis}</div>
          </div>
        )}
      </div>

      {/* Last updated */}
      <div style={{ color:"#7a849e",fontFamily:F,fontSize:10,marginTop:-8 }}>Updated {new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</div>
    </div>
  );
}

function PriceTrackingPage(){
  const [histories] = useState(()=>{ const h={}; MATERIALS.forEach(m=>{ h[m.id]=genHistory(m,30); }); return h; });
  const [analyses,setAnalyses] = useState({});
  const [analysing,setAnalysing] = useState({});
  const [lastRefresh,setLastRefresh] = useState(new Date());
  const [selectedView,setSelectedView] = useState("grid"); // grid | table

  const requestAnalysis=async(matId)=>{
    setAnalysing(p=>({...p,[matId]:true}));
    const mat=MATERIALS.find(m=>m.id===matId);
    const hist=histories[matId];
    const latest=hist[hist.length-1].price;
    const prev7=hist[hist.length-8].price;
    const wkChg=((latest-prev7)/prev7*100).toFixed(2);
    const mn=Math.min(...hist.map(d=>d.price)).toFixed(2);
    const mx=Math.max(...hist.map(d=>d.price)).toFixed(2);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{ method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:`You are a construction procurement advisor. Analyse this material price data and give a concise buying recommendation (3–5 sentences):

Material: ${mat.name} (${mat.unit})
Current price: $${latest.toLocaleString()}
7-day change: ${wkChg}%
30-day low: $${mn} | 30-day high: $${mx}
Context: GCC construction market (UAE/Saudi Arabia focus)

Provide: 1) Market trend assessment, 2) Whether to buy now / wait / stockpile, 3) One practical tip for contractors. Be direct and specific. No markdown headers.` }]
        })
      });
      const data=await res.json();
      const txt=data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"Analysis unavailable.";
      setAnalyses(p=>({...p,[matId]:txt}));
    }catch(e){ setAnalyses(p=>({...p,[matId]:"Unable to load AI analysis. Check your connection and try again."})); }
    setAnalysing(p=>({...p,[matId]:false}));
  };

  // Overall market sentiment
  const sentiments=MATERIALS.map(m=>{ const h=histories[m.id]; const l=h[h.length-1].price,p=h[h.length-2].price; return l>=p?1:-1; });
  const bullCount=sentiments.filter(s=>s>0).length;

  return(
    <div>
      {/* Page header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12 }}>
        <div>
          <h2 style={{ color:"#e8eaf0",fontSize:22,fontFamily:F,fontWeight:700,margin:0,display:"flex",alignItems:"center",gap:10 }}>📈 Material Price Tracking</h2>
          <div style={{ color:"#7a849e",fontFamily:F,fontSize:12,marginTop:4 }}>Live construction material prices for the GCC market · Updated {lastRefresh.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          {/* Market sentiment pill */}
          <div style={{ background:bullCount>=3?"#22c55e1a":"#ef44441a",border:`1px solid ${bullCount>=3?"#22c55e44":"#ef444444"}`,borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:7 }}>
            <span style={{ fontSize:14 }}>{bullCount>=3?"📈":"📉"}</span>
            <span style={{ color:bullCount>=3?"#22c55e":"#ef4444",fontFamily:F,fontWeight:700,fontSize:12 }}>{bullCount>=3?"Market Rising":"Market Declining"}</span>
            <span style={{ color:"#7a849e",fontFamily:F,fontSize:11 }}>{bullCount}/{MATERIALS.length} up today</span>
          </div>
          {/* View toggle */}
          <div style={{ display:"flex",background:"#181c27",border:"1px solid #2a3045",borderRadius:7,padding:3,gap:2 }}>
            {[["grid","⊞ Cards"],["table","☰ Table"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSelectedView(v)} style={{ background:selectedView===v?"#f59e0b1a":"transparent",color:selectedView===v?"#f59e0b":"#7a849e",border:selectedView===v?"1px solid #f59e0b44":"1px solid transparent",borderRadius:5,padding:"6px 14px",fontFamily:F,fontSize:12,fontWeight:700,cursor:"pointer" }}>{l}</button>
            ))}
          </div>
          <button onClick={()=>setLastRefresh(new Date())} style={{ background:"transparent",color:"#7a849e",border:"1px solid #2a3045",borderRadius:7,padding:"7px 14px",fontFamily:F,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }} onMouseEnter={e=>{e.currentTarget.style.color="#e8eaf0";e.currentTarget.style.borderColor="#f59e0b44";}} onMouseLeave={e=>{e.currentTarget.style.color="#7a849e";e.currentTarget.style.borderColor="#2a3045";}}>
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* Summary stats strip */}
      <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
        {MATERIALS.map(m=>{
          const h=histories[m.id]; const l=h[h.length-1].price,p=h[h.length-2].price; const chg=((l-p)/p*100);
          return(
            <div key={m.id} style={{ flex:1,minWidth:100,background:"#1e2333",border:`1px solid ${chg>=0?"#22c55e22":"#ef444422"}`,borderRadius:9,padding:"10px 14px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:4 }}><span style={{ fontSize:14 }}>{m.icon}</span><span style={{ color:"#7a849e",fontFamily:F,fontSize:10,fontWeight:700 }}>{m.name.split(" ")[0].toUpperCase()}</span></div>
              <div style={{ color:"#e8eaf0",fontFamily:F,fontWeight:700,fontSize:14 }}>${l.toLocaleString("en-US",{maximumFractionDigits:l<100?2:0})}</div>
              <div style={{ color:chg>=0?"#22c55e":"#ef4444",fontFamily:F,fontSize:11,fontWeight:700,marginTop:2 }}>{chg>=0?"▲":"▼"}{Math.abs(chg).toFixed(2)}%</div>
            </div>
          );
        })}
      </div>

      {/* Grid view */}
      {selectedView==="grid"&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16 }}>
          {MATERIALS.map(m=>(
            <PriceCard key={m.id} mat={m} history={histories[m.id]} aiAnalysis={analyses[m.id]} onAnalyse={requestAnalysis} analysing={!!analysing[m.id]}/>
          ))}
        </div>
      )}

      {/* Table view */}
      {selectedView==="table"&&(
        <div style={{ background:"#1e2333",border:"1px solid #2a3045",borderRadius:12,overflow:"hidden" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:13 }}>
            <thead><tr style={{ background:"#181c27",borderBottom:"1px solid #2a3045" }}>
              {["Material","Current Price","24h Change","7d Change","30d Low","30d High","Trend",""].map(h=><th key={h} style={{ color:"#7a849e",fontWeight:700,padding:"12px 16px",textAlign:"left",fontSize:11,whiteSpace:"nowrap" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {MATERIALS.map((m,mi)=>{
                const h=histories[m.id];
                const l=h[h.length-1].price, p1=h[h.length-2].price, p7=h[h.length-8].price;
                const mn=Math.min(...h.map(d=>d.price)), mx=Math.max(...h.map(d=>d.price));
                const d1=(l-p1)/p1*100, d7=(l-p7)/p7*100;
                return(
                  <tr key={m.id} style={{ borderBottom:mi<MATERIALS.length-1?"1px solid #2a304522":"none" }}>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                        <div style={{ width:32,height:32,borderRadius:7,background:m.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{m.icon}</div>
                        <div>
                          <div style={{ color:"#e8eaf0",fontWeight:600,fontSize:13 }}>{m.name}</div>
                          <div style={{ color:"#7a849e",fontSize:10,marginTop:1 }}>{m.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"13px 16px",color:"#e8eaf0",fontWeight:700,fontSize:14 }}>${l.toLocaleString("en-US",{minimumFractionDigits:l<100?2:0,maximumFractionDigits:l<100?2:0})}</td>
                    <td style={{ padding:"13px 16px",color:d1>=0?"#22c55e":"#ef4444",fontWeight:700 }}>{d1>=0?"▲":"▼"}{Math.abs(d1).toFixed(2)}%</td>
                    <td style={{ padding:"13px 16px",color:d7>=0?"#22c55e":"#ef4444",fontWeight:700 }}>{d7>=0?"▲":"▼"}{Math.abs(d7).toFixed(2)}%</td>
                    <td style={{ padding:"13px 16px",color:"#7a849e" }}>${mn.toLocaleString("en-US",{maximumFractionDigits:l<100?2:0})}</td>
                    <td style={{ padding:"13px 16px",color:"#7a849e" }}>${mx.toLocaleString("en-US",{maximumFractionDigits:l<100?2:0})}</td>
                    <td style={{ padding:"13px 16px",minWidth:160 }}><SparkLine data={h.slice(-14)} color={m.color} width={140} height={36}/></td>
                    <td style={{ padding:"13px 16px" }}>
                      <button onClick={()=>{ requestAnalysis(m.id); }} disabled={!!analysing[m.id]} style={{ background:"#a78bfa1a",color:"#a78bfa",border:"1px solid #a78bfa33",borderRadius:6,padding:"5px 12px",fontFamily:F,fontSize:11,fontWeight:700,cursor:analysing[m.id]?"not-allowed":"pointer",whiteSpace:"nowrap" }}>
                        {analysing[m.id]?"…":"🤖 Analyse"}
                      </button>
                      {analyses[m.id]&&(
                        <div style={{ marginTop:8,background:"#181c27",border:"1px solid #a78bfa22",borderRadius:7,padding:"8px 10px",maxWidth:260 }}>
                          <div style={{ color:"#c4cae0",fontFamily:F,fontSize:11,lineHeight:1.6 }}>{analyses[m.id].slice(0,220)}{analyses[m.id].length>220?"…":""}</div>
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
      <div style={{ marginTop:20,padding:"12px 16px",background:"#1e2333",border:"1px solid #2a3045",borderRadius:8,display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ fontSize:14 }}>ℹ️</span>
        <span style={{ color:"#7a849e",fontFamily:F,fontSize:11 }}>Prices are indicative market data for the GCC construction sector. Verify current rates with your suppliers before making purchasing decisions. AI insights are advisory only.</span>
      </div>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
// ─── jsPDF loader (lazy, singleton) ────────────────────────────────────────────
let _jsPDFPromise = null;
function loadJsPDF(){
  if(_jsPDFPromise) return _jsPDFPromise;
  _jsPDFPromise = new Promise((resolve, reject)=>{
    if(window.jspdf){ resolve(window.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload  = ()=> resolve(window.jspdf.jsPDF);
    s.onerror = ()=> reject(new Error("jsPDF failed to load"));
    document.head.appendChild(s);
  });
  return _jsPDFPromise;
}

// ─── PDF builder — pure jsPDF, no popups, no print dialog ────────────────────
async function generatePdfBlob(metrics, report){
  const jsPDF = await loadJsPDF();
  const doc   = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const PW=210, PH=297;                   // A4 mm
  const ML=14, MR=14, MT=0, MB=14;       // margins
  const CW = PW - ML - MR;               // content width  182 mm
  let   y  = 0;

  // ── colour palette ────────────────────────────────────────────────────────
  const NAVY  =[30,58,95];
  const BLUE  =[37,99,235];
  const GREEN =[22,163,74];
  const RED   =[220,38,38];
  const AMBER =[217,119,6];
  const PURPLE=[124,58,237];
  const LGREY =[241,245,249];
  const DGREY =[100,116,139];
  const BDARK =[30,41,59];
  const WHITE =[255,255,255];

  // ── helpers ───────────────────────────────────────────────────────────────
  const rgb=(arr)=>{ doc.setTextColor(...arr); };
  const fill=(arr)=>{ doc.setFillColor(...arr); };
  const stroke=(arr)=>{ doc.setDrawColor(...arr); };
  const _cur = metrics.currency||"AED";
  const fmt=n=>fmtCur(n, _cur);
  const fmtS=n=>fmtCurS(n, _cur);

  const newPageIfNeeded=(needed=20)=>{
    if(y+needed > PH-MB){ doc.addPage(); y=MT+8; }
  };

  const sectionTitle=(label, yPos)=>{
    doc.setFont("helvetica","bold");
    doc.setFontSize(7.5);
    rgb(DGREY);
    doc.text(label.toUpperCase(), ML, yPos);
    stroke([226,232,240]);
    doc.setLineWidth(0.3);
    doc.line(ML, yPos+1.5, ML+CW, yPos+1.5);
    return yPos + 6;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PAGE 1 HEADER — deep-navy gradient band
  // ─────────────────────────────────────────────────────────────────────────
  fill(NAVY);
  doc.rect(0,0,PW,42,"F");

  // Gradient overlay — draw lighter blue stripe
  fill([37,99,200]);
  doc.rect(PW*0.55,0,PW*0.45,42,"F");
  fill(NAVY);
  // re-draw left to mask the overlap with a soft blend
  doc.setGState && doc.setGState(new doc.GState({opacity:0}));

  // "CONFIDENTIAL FINANCIAL REPORT" eyebrow
  doc.setFont("helvetica","bold");
  doc.setFontSize(7);
  rgb([180,210,255]);
  doc.text("CONFIDENTIAL FINANCIAL REPORT", ML, 11);

  // Project name
  doc.setFontSize(18);
  doc.setFont("helvetica","bold");
  rgb(WHITE);
  const pname = metrics.project.name;
  doc.text(pname, ML, 22);

  // Sub-line
  doc.setFontSize(8.5);
  doc.setFont("helvetica","normal");
  rgb([180,210,255]);
  const client = metrics.project.client?.company||metrics.project.client?.name||"N/A";
  const loc    = metrics.project.location||"";
  const status = (metrics.project.status||"").toUpperCase();
  doc.text(`Client: ${client}   ·   ${loc}   ·   ${status}`, ML, 30);

  // Right-side meta
  doc.setFontSize(7.5);
  rgb([200,220,255]);
  doc.text("Generated", PW-MR-48, 14, {align:"left"});
  doc.setFont("helvetica","bold");
  rgb(WHITE);
  doc.text(report.generatedAt, PW-MR-48, 19, {align:"left"});
  doc.setFont("helvetica","normal");
  rgb([200,220,255]);
  doc.text("Prepared by BuildFlow AI", PW-MR-48, 24, {align:"left"});

  y = 50;

  // ─────────────────────────────────────────────────────────────────────────
  // METRIC CARDS (2 rows × 3)
  // ─────────────────────────────────────────────────────────────────────────
  y = sectionTitle("Key Financial Metrics", y);

  const cards = [
    { label:"Contract Value",       value:fmt(metrics.projectValue),    color:BLUE   },
    { label:"Total Invoiced",       value:fmt(metrics.totalInvoiced),   color:AMBER  },
    { label:"Payments Received",    value:fmt(metrics.totalReceived),   color:GREEN  },
    { label:"Outstanding Invoices", value:fmt(metrics.remainToPayInv),  color:metrics.totalOverdue>0?RED:DGREY },
    { label:"Still to Collect",     value:fmt(metrics.remainToReceive), color:PURPLE },
    { label:"Gross Profit Est.",    value:fmt(metrics.grossProfit),     color:metrics.grossProfit>=0?GREEN:RED },
  ];
  const cw=(CW-8)/3, ch=16;
  cards.forEach((card,i)=>{
    const col=i%3, row=Math.floor(i/3);
    const cx = ML + col*(cw+4);
    const cy = y  + row*(ch+4);
    fill(LGREY); stroke([226,232,240]);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx,cy,cw,ch,2,2,"FD");
    doc.setFont("helvetica","bold");
    doc.setFontSize(6.5);
    rgb(DGREY);
    doc.text(card.label.toUpperCase(), cx+4, cy+5.5);
    doc.setFontSize(9.5);
    doc.setFont("helvetica","bold");
    rgb(card.color);
    doc.text(card.value, cx+4, cy+12);
  });
  y += ch*2 + 4 + 8;

  // ─────────────────────────────────────────────────────────────────────────
  // BALANCE BAR
  // ─────────────────────────────────────────────────────────────────────────
  const balH = 18;
  fill([240,253,244]); stroke([186,230,200]);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML,y,CW,balH,2,2,"FD");

  const balItems=[
    { label:"Net Cash Position",      value:fmt(metrics.netBalance),       color:metrics.netBalance>=0?GREEN:RED,  sub:"Received − Paid Invoices" },
    { label:"Invoice Collection Rate",value:`${metrics.invoicePaidPct}%`,  color:BLUE,  sub:"of invoiced amount paid" },
    { label:"Contract Collected",     value:`${metrics.receivedPct}%`,     color:GREEN, sub:"of contract value received" },
  ];
  const bw = CW/3;
  balItems.forEach((bi,i)=>{
    const bx = ML + i*bw + bw/2;
    doc.setFont("helvetica","bold");
    doc.setFontSize(6.2);
    rgb(DGREY);
    doc.text(bi.label.toUpperCase(), bx, y+5, {align:"center"});
    doc.setFontSize(11);
    rgb(bi.color);
    doc.text(bi.value, bx, y+12, {align:"center"});
    doc.setFontSize(6);
    doc.setFont("helvetica","normal");
    rgb(DGREY);
    doc.text(bi.sub, bx, y+17, {align:"center"});
  });
  y += balH + 10;

  // ─────────────────────────────────────────────────────────────────────────
  // REVENUE vs COST side-by-side tables
  // ─────────────────────────────────────────────────────────────────────────
  newPageIfNeeded(50);
  y = sectionTitle("Financial Summary", y);

  const hw = (CW-6)/2;   // half-width
  const drawSummaryTable=(title, rows, headerColor, startX, startY)=>{
    const TH=7, RH=8;
    const tw=hw;
    // header band
    fill(headerColor); stroke([226,232,240]);
    doc.setLineWidth(0.3);
    doc.roundedRect(startX,startY,tw,TH,1,1,"FD");
    doc.setFont("helvetica","bold");
    doc.setFontSize(7);
    rgb(WHITE);
    doc.text(title.toUpperCase(), startX+4, startY+5);
    let ty=startY+TH;
    rows.forEach((row,i)=>{
      fill(i%2===0?WHITE:LGREY);
      doc.rect(startX,ty,tw,RH,"F");
      stroke([226,232,240]);
      doc.setLineWidth(0.2);
      doc.line(startX,ty+RH,startX+tw,ty+RH);
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); rgb(DGREY);
      doc.text(row[0], startX+3, ty+5.5);
      doc.setFont("helvetica","bold"); rgb(row[2]||BDARK);
      doc.text(row[1], startX+tw-3, ty+5.5,{align:"right"});
      ty+=RH;
    });
    // outer border
    stroke([226,232,240]); doc.setLineWidth(0.3);
    doc.roundedRect(startX,startY,tw,TH+RH*rows.length,1,1,"S");
    return ty;
  };

  const revRows=[
    ["Contract Value",          fmt(metrics.projectValue),    BLUE ],
    ["Payments Received",       fmt(metrics.totalReceived),   GREEN],
    ["Remaining to Collect",    fmt(metrics.remainToReceive), metrics.remainToReceive>0?AMBER:GREEN],
    ["% Collected",             metrics.receivedPct+"%",      BLUE ],
  ];
  const costRows=[
    ["Total Invoiced",          fmt(metrics.totalInvoiced),   BDARK],
    ["Paid",                    fmt(metrics.totalPaid),       GREEN],
    ["Overdue",                 fmt(metrics.totalOverdue),    metrics.totalOverdue>0?RED:DGREY],
    ["Pending",                 fmt(metrics.totalPending),    AMBER],
  ];
  const endL = drawSummaryTable("Revenue & Collections", revRows, BLUE,    ML,        y);
  const endR = drawSummaryTable("Invoices & Costs",      costRows, AMBER,  ML+hw+6,   y);
  y = Math.max(endL,endR) + 10;

  // ─────────────────────────────────────────────────────────────────────────
  // INVOICE BREAKDOWN TABLE
  // ─────────────────────────────────────────────────────────────────────────
  if(metrics.invoices.length>0){
    newPageIfNeeded(30);
    y = sectionTitle(`Invoice Breakdown  (${metrics.invoices.length} invoice${metrics.invoices.length>1?"s":""})`, y);

    const cols=[28,62,34,26,22];  // #, desc, amount, due, status
    const headers=["Invoice #","Description","Amount","Due Date","Status"];
    const TH=7,RH=7.5;

    // header
    fill(LGREY); stroke([226,232,240]); doc.setLineWidth(0.3);
    doc.rect(ML,y,CW,TH,"FD");
    doc.setFont("helvetica","bold"); doc.setFontSize(6.5); rgb(DGREY);
    let cx2=ML+2;
    headers.forEach((h,i)=>{
      doc.text(h.toUpperCase(), cx2, y+5);
      cx2+=cols[i];
    });
    y+=TH;

    metrics.invoices.forEach((inv,idx)=>{
      newPageIfNeeded(RH+4);
      const st=inv.status||inv.invoiceStatus||"pending";
      fill(idx%2===0?WHITE:LGREY); doc.rect(ML,y,CW,RH,"F");
      stroke([226,232,240]); doc.setLineWidth(0.2); doc.line(ML,y+RH,ML+CW,y+RH);

      cx2=ML+2;
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); rgb(BLUE);
      doc.text(inv.invId||String(inv.id), cx2, y+5.5); cx2+=cols[0];

      const descTxt = inv.desc||"—";
      doc.setFont("helvetica","normal"); rgb(BDARK);
      doc.text(doc.splitTextToSize(descTxt, cols[1]-3)[0], cx2, y+5.5); cx2+=cols[1];

      doc.setFont("helvetica","bold"); rgb(BDARK);
      doc.text(fmt(inv.amount), cx2+cols[2]-3, y+5.5,{align:"right"}); cx2+=cols[2];

      doc.setFont("helvetica","normal"); rgb(DGREY);
      doc.text(inv.dueFmt||inv.dueDate||"—", cx2, y+5.5); cx2+=cols[3];

      const stC={paid:GREEN,overdue:RED,pending:AMBER}[st]||DGREY;
      rgb(stC); doc.setFont("helvetica","bold"); doc.setFontSize(7);
      doc.text(st.toUpperCase(), cx2, y+5.5);
      y+=RH;
    });
    // total row
    fill(LGREY); doc.rect(ML,y,CW,TH+1,"F");
    stroke([226,232,240]); doc.setLineWidth(0.3); doc.rect(ML,y,CW,TH+1,"S");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5);
    rgb(DGREY); doc.text("TOTAL INVOICED", ML+2, y+5.5);
    rgb(AMBER);
    doc.text(fmt(metrics.totalInvoiced), ML+CW-3, y+5.5,{align:"right"});
    y += TH+1+10;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PAYMENT HISTORY TABLE
  // ─────────────────────────────────────────────────────────────────────────
  if(metrics.payments.length>0){
    newPageIfNeeded(30);
    y = sectionTitle(`Payment History  (${metrics.payments.length} payment${metrics.payments.length>1?"s":""})`, y);

    const pcols=[30,28,36,30,58];
    const pheaders=["Date","Method","Amount","Invoice Ref","Notes"];
    const TH=7, RH=7.5;

    fill(LGREY); stroke([226,232,240]); doc.setLineWidth(0.3);
    doc.rect(ML,y,CW,TH,"FD");
    doc.setFont("helvetica","bold"); doc.setFontSize(6.5); rgb(DGREY);
    let px=ML+2;
    pheaders.forEach((h,i)=>{ doc.text(h.toUpperCase(),px,y+5); px+=pcols[i]; });
    y+=TH;

    metrics.payments.forEach((p,idx)=>{
      newPageIfNeeded(RH+4);
      fill(idx%2===0?WHITE:LGREY); doc.rect(ML,y,CW,RH,"F");
      stroke([226,232,240]); doc.setLineWidth(0.2); doc.line(ML,y+RH,ML+CW,y+RH);
      px=ML+2;
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); rgb(DGREY);
      doc.text(p.dateFmt||p.date||"—", px, y+5.5); px+=pcols[0];
      rgb(BDARK); doc.text(p.method||"—", px, y+5.5); px+=pcols[1];
      doc.setFont("helvetica","bold"); rgb(GREEN);
      doc.text(fmt(p.amount), px+pcols[2]-3, y+5.5,{align:"right"}); px+=pcols[2];
      doc.setFont("helvetica","normal"); rgb(BLUE);
      doc.text(p.invRef ? resolveInvRef(p.invRef, metrics.invoices||[]) : "—", px, y+5.5); px+=pcols[3];
      rgb(DGREY);
      doc.text(doc.splitTextToSize(p.notes||"—", pcols[4]-3)[0], px, y+5.5);
      y+=RH;
    });
    // total row
    fill(LGREY); doc.rect(ML,y,CW,TH+1,"F");
    stroke([226,232,240]); doc.setLineWidth(0.3); doc.rect(ML,y,CW,TH+1,"S");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5);
    rgb(DGREY); doc.text("TOTAL RECEIVED", ML+2, y+5.5);
    rgb(GREEN);
    doc.text(fmt(metrics.totalReceived), ML+CW-3, y+5.5,{align:"right"});
    y += TH+1+10;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AI NARRATIVE
  // ─────────────────────────────────────────────────────────────────────────
  newPageIfNeeded(30);
  y = sectionTitle("Accountant's Analysis  (AI-generated)", y);

  // decorative left bar + background for first paragraph
  const paras = report.paragraphs;
  paras.forEach((para, pi)=>{
    const lines = doc.splitTextToSize(para, CW - (pi===0?8:0));
    const blockH = lines.length * 4.8 + 8;
    newPageIfNeeded(blockH+4);

    if(pi===0){
      fill([255,251,235]); stroke([253,230,138]); doc.setLineWidth(0.4);
      doc.roundedRect(ML, y, CW, blockH, 2, 2, "FD");
      fill(AMBER); doc.rect(ML, y, 2.5, blockH, "F");
      doc.setFont("helvetica","bolditalic"); doc.setFontSize(7.5); rgb(BDARK);
      doc.text(lines, ML+6, y+6, {lineHeightFactor:1.5});
    } else {
      doc.setFont("helvetica","normal"); doc.setFontSize(8); rgb(BDARK);
      doc.text(lines, ML, y+4, {lineHeightFactor:1.55});
    }
    y += blockH + 5;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DISCLAIMER BOX
  // ─────────────────────────────────────────────────────────────────────────
  newPageIfNeeded(16);
  y += 4;
  fill([255,252,232]); stroke([253,224,71]); doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, CW, 13, 2, 2, "FD");
  doc.setFont("helvetica","bold"); doc.setFontSize(7); rgb(AMBER);
  doc.text("⚠  DISCLAIMER", ML+4, y+5);
  doc.setFont("helvetica","normal"); rgb([146,64,14]);
  const disc="This report is AI-generated using BuildFlow data. For formal auditing or regulatory submission, please have it reviewed by a licensed accountant or CPA.";
  doc.text(doc.splitTextToSize(disc, CW-10), ML+4, y+10);
  y += 17;

  // ─────────────────────────────────────────────────────────────────────────
  // PAGE FOOTERS
  // ─────────────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for(let pg=1; pg<=totalPages; pg++){
    doc.setPage(pg);
    fill([248,250,252]); stroke([226,232,240]); doc.setLineWidth(0.2);
    doc.rect(0, PH-10, PW, 10, "FD");
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); rgb(DGREY);
    doc.text("BuildFlow — Confidential Financial Report", ML, PH-4);
    doc.text(`Page ${pg} of ${totalPages}`, PW-MR, PH-4, {align:"right"});
    doc.text(metrics.project.name, PW/2, PH-4, {align:"center"});
  }

  return doc.output("blob");
}

// ─── Accountant Page ───────────────────────────────────────────────────────────
function AccountantPage({ allProjects=[], allInvoices=[], payments=[] }){
  const { currency:gCur, setCurrency:setGCur } = useCurrencyCtx();
  const [projId,setProjId]    = useState(null);
  useEffect(()=>{ if(!projId && allProjects?.length) setProjId(allProjects[0].id); },[allProjects]);
  const [report,setReport]    = useState(null);
  const [generating,setGen]   = useState(false);
  const [pdfBuilding,setPdfB] = useState(false);
  const [err,setErr]          = useState("");
  const [currency,setCurrencyLocal] = useState(gCur);

  React.useEffect(()=>{
    const proj = allProjects.find(p=>p.id===projId);
    setCurrencyLocal(proj?.currency||gCur);
  },[projId, gCur]);

  const handleCurrencyChange = (c)=>{ setCurrencyLocal(c); setGCur(c); };

  const project = allProjects.find(p=>p.id===projId)||allProjects[0]||null;

  // ── Live financial metrics ──────────────────────────────────────────────
  const metrics = useMemo(()=>{
    if(!project) return null;
    const projInvoices = allInvoices.filter(i=>i.projId===project.id||i.project===project.name);
    const projPayments = payments.filter(p=>p.projId===project.id||p.project===project.name);

    const totalInvoiced  = projInvoices.reduce((s,i)=>s+Number(i.amount||0),0);
    const totalPaid      = projInvoices.filter(i=>(i.status||i.invoiceStatus)==="paid").reduce((s,i)=>s+Number(i.amount||0),0);
    const totalOverdue   = projInvoices.filter(i=>(i.status||i.invoiceStatus)==="overdue").reduce((s,i)=>s+Number(i.amount||0),0);
    const totalPending   = projInvoices.filter(i=>(i.status||i.invoiceStatus)==="pending").reduce((s,i)=>s+Number(i.amount||0),0);
    const totalReceived  = projPayments.reduce((s,p)=>s+Number(p.amount||0),0);
    const projectValue   = Number(project.value||0);
    const remainToReceive= Math.max(0, projectValue - totalReceived);
    const remainToPayInv = Math.max(0, totalInvoiced - totalPaid);
    const grossProfit    = projectValue - totalInvoiced;
    const netBalance     = totalReceived - totalPaid;

    return{
      project, projectValue, totalInvoiced, totalPaid, totalOverdue, totalPending,
      totalReceived, remainToReceive, remainToPayInv, grossProfit, netBalance,
      invoiceCount:projInvoices.length, paymentCount:projPayments.length,
      invoices:projInvoices, payments:projPayments,
      invoicePaidPct: totalInvoiced>0 ? Math.round(totalPaid/totalInvoiced*100) : 0,
      receivedPct:    projectValue>0  ? Math.round(totalReceived/projectValue*100) : 0,
    };
  },[project, allInvoices, payments]);

  // ── Generate AI narrative then auto-download PDF ────────────────────────
  const generate = async()=>{
    if(!project||!metrics){ setErr("Please select a project first."); return; }
    setGen(true); setErr(""); setReport(null);
    try{
      const prompt=`You are a professional construction accountant preparing a formal financial report for a contractor in the GCC market (UAE/Saudi Arabia).

Analyze the following financial data and write a professional Accountant's Report narrative (4-6 paragraphs). Use proper accounting language and provide a clear financial assessment.

PROJECT: ${project.name}
Client: ${project.client?.company||project.client?.name||"N/A"}
Contract Value: ${fmtCurS(metrics.projectValue, currency)}
Status: ${project.status} | Phase: ${project.phase||"N/A"}

INVOICES: Total ${fmtCurS(metrics.totalInvoiced, currency)} (${metrics.invoiceCount} invoices)
  Paid: ${fmtCurS(metrics.totalPaid, currency)} | Overdue: ${fmtCurS(metrics.totalOverdue, currency)} | Pending: ${fmtCurS(metrics.totalPending, currency)}
  Collection rate: ${metrics.invoicePaidPct}%

PAYMENTS FROM CLIENT: ${fmtCurS(metrics.totalReceived, currency)} (${metrics.paymentCount} payments)
  Remaining to collect: ${fmtCurS(metrics.remainToReceive, currency)} (${metrics.receivedPct}% collected)

FINANCIAL BALANCE:
  Gross Profit Estimate: ${fmtCurS(metrics.grossProfit, currency)}
  Net Cash Position: ${fmtCurS(metrics.netBalance, currency)}
  Outstanding invoice obligations: ${fmtCurS(metrics.remainToPayInv, currency)}

Write 5 short paragraphs — no markdown, no headers, just plain text paragraphs:
1. Executive Summary
2. Revenue & Contract Performance
3. Invoice & Cost Analysis
4. Payment Collections & Cash Flow
5. Financial Position & Recommendations
Address the contractor as "the Company". Flag overdue amounts if any.`;

      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
      });
      const data = await res.json();
      const narrative = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"Could not generate report.";
      const paragraphs = narrative.split(/\n\n+/).filter(p=>p.trim().length>0);
      const now = new Date().toLocaleString("en-US",{month:"long",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"});
      const rpt = { narrative, paragraphs, generatedAt:now };
      setReport(rpt);

      // ── Auto-generate and download the PDF immediately ──────────────────
      setPdfB(true);
      try{
        const blob = await generatePdfBlob({...metrics, currency}, rpt);
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `BuildFlow_Report_${project.name.replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url), 5000);
      }catch(pe){
        setErr("Report generated but PDF export failed. Use the Download button to retry.");
      }
      setPdfB(false);
    }catch(e){
      setErr("AI generation failed: "+e.message);
    }
    setGen(false);
  };

  // ── Manual re-download ──────────────────────────────────────────────────
  const downloadPdf = async()=>{
    if(!report||!metrics||pdfBuilding) return;
    setPdfB(true); setErr("");
    try{
      const blob = await generatePdfBlob({...metrics, currency}, report);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `BuildFlow_Report_${project.name.replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 5000);
    }catch(e){
      setErr("PDF export failed: "+e.message);
    }
    setPdfB(false);
  };

  const fmt  = n=>fmtCur(n, currency);
  const fmtS = n=>fmtCurS(n, currency);
  const busy  = generating||pdfBuilding;

  return(
    <div style={{ maxWidth:900,margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28 }}>
        <div>
          <h2 style={{ color:C.text,fontSize:22,fontFamily:F,fontWeight:800,margin:0,display:"flex",alignItems:"center",gap:10 }}>🧾 Accountant</h2>
          <div style={{ color:C.muted,fontFamily:F,fontSize:13,marginTop:4 }}>AI-powered financial reports · auto-exports as PDF</div>
        </div>
        {report&&(
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={downloadPdf} disabled={busy}
              style={{ background:busy?"transparent":C.accent,color:busy?C.accent:"#000",border:busy?`1px solid ${C.accent}44`:"none",padding:"10px 20px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:13,cursor:busy?"default":"pointer",display:"flex",alignItems:"center",gap:7 }}>
              {pdfBuilding
                ? <><div style={{ width:13,height:13,border:"2px solid",borderColor:C.accent,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Building PDF…</>
                : <>↓ Download PDF</>}
            </button>
            <button onClick={generate} disabled={busy}
              style={{ background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"10px 18px",borderRadius:8,fontFamily:F,fontSize:13,fontWeight:600,cursor:busy?"default":"pointer" }}>
              ↺ Regenerate
            </button>
          </div>
        )}
      </div>

      {/* Project selector + Currency + Generate */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 26px",marginBottom:24 }}>
        <div style={{ display:"flex",gap:16,alignItems:"flex-end",flexWrap:"wrap" }}>
          <div style={{ flex:1,minWidth:200 }}>
            <label style={{ display:"block",color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:7 }}>Select Project</label>
            <select value={projId||""} onChange={e=>{ setProjId(e.target.value); setReport(null); setErr(""); }}
              style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 14px",color:C.text,fontFamily:F,fontSize:14,fontWeight:600,cursor:"pointer",width:"100%" }}>
              {allProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ minWidth:120 }}>
            <label style={{ display:"block",color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:7 }}>Currency</label>
            <select value={currency} onChange={e=>handleCurrencyChange(e.target.value)}
              style={{ background:C.surface,border:`1px solid ${C.accent}55`,borderRadius:8,padding:"11px 14px",color:C.accent,fontFamily:F,fontSize:14,fontWeight:700,cursor:"pointer",width:"100%" }}>
              {CURRENCIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={busy||!project}
            style={{ background:busy?"transparent":C.accent,color:busy?C.accent:"#000",border:busy?`1px solid ${C.accent}44`:"none",padding:"12px 28px",borderRadius:8,fontFamily:F,fontWeight:700,fontSize:14,cursor:busy?"default":"pointer",display:"flex",alignItems:"center",gap:9,flexShrink:0,minWidth:240 }}>
            {generating
              ? <><div style={{ width:14,height:14,border:"2px solid",borderColor:C.accent,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Generating Report…</>
              : pdfBuilding
              ? <><div style={{ width:14,height:14,border:"2px solid",borderColor:C.accent,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Building PDF…</>
              : <>📊 Generate &amp; Download PDF</>}
          </button>
        </div>
        {err&&<div style={{ color:C.red,fontFamily:F,fontSize:12,marginTop:12,padding:"8px 12px",background:C.redDim,borderRadius:6 }}>⚠ {err}</div>}
      </div>

      {/* Live metrics cards */}
      {metrics&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12,marginBottom:24 }}>
          {[
            { label:"Contract Value",       value:fmtS(metrics.projectValue),    icon:"🏗", color:C.blue,   dim:C.blueDim   },
            { label:"Total Invoiced",       value:fmtS(metrics.totalInvoiced),   icon:"🧾", color:C.accent, dim:C.accentDim },
            { label:"Payments Received",    value:fmtS(metrics.totalReceived),   icon:"💰", color:C.green,  dim:C.greenDim  },
            { label:"Outstanding Invoices", value:fmtS(metrics.remainToPayInv),  icon:"⏳", color:metrics.totalOverdue>0?C.red:C.muted, dim:metrics.totalOverdue>0?C.redDim:C.surface },
            { label:"Still to Collect",     value:fmtS(metrics.remainToReceive), icon:"📥", color:C.purple, dim:C.purpleDim },
            { label:"Gross Profit Est.",    value:fmtS(metrics.grossProfit),     icon:"📈", color:metrics.grossProfit>=0?C.green:C.red, dim:metrics.grossProfit>=0?C.greenDim:C.redDim },
          ].map(card=>(
            <div key={card.label} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                <div style={{ width:30,height:30,background:card.dim,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>{card.icon}</div>
                <div style={{ color:C.muted,fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>{card.label}</div>
              </div>
              <div style={{ color:card.color,fontFamily:F,fontSize:17,fontWeight:800 }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* In-app report preview */}
      {report&&metrics&&(
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden" }}>
          {/* Report header band */}
          <div style={{ background:`linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)`,padding:"28px 32px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16 }}>
              <div>
                <div style={{ color:"rgba(180,210,255,0.9)",fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6 }}>Confidential Financial Report</div>
                <div style={{ color:"#fff",fontFamily:F,fontSize:22,fontWeight:800,marginBottom:4 }}>{metrics.project.name}</div>
                <div style={{ color:"rgba(180,210,255,0.85)",fontFamily:F,fontSize:12 }}>
                  Client: <span style={{ color:"#fff",fontWeight:600 }}>{metrics.project.client?.company||metrics.project.client?.name||"N/A"}</span>
                  &nbsp;·&nbsp;{metrics.project.location||""}
                  &nbsp;·&nbsp;<span style={{ background:"rgba(255,255,255,0.15)",padding:"1px 8px",borderRadius:10,fontWeight:700 }}>{(metrics.project.status||"").toUpperCase()}</span>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:"rgba(200,220,255,0.7)",fontFamily:F,fontSize:10,marginBottom:2 }}>Generated</div>
                <div style={{ color:"#fff",fontFamily:F,fontSize:11,fontWeight:600 }}>{report.generatedAt}</div>
                <div style={{ color:"rgba(200,220,255,0.7)",fontFamily:F,fontSize:10,marginTop:4 }}>BuildFlow AI</div>
              </div>
            </div>
          </div>

          {/* Financial summary tables */}
          <div style={{ padding:"24px 32px",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ color:C.muted,fontFamily:F,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:.7,marginBottom:14 }}>Financial Summary</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {[
                { title:"Revenue & Collections", color:C.blue, colorDim:C.blueDim, rows:[
                  ["Contract Value",       fmt(metrics.projectValue),    C.text  ],
                  ["Payments Received",    fmt(metrics.totalReceived),   C.green ],
                  ["Remaining to Collect", fmt(metrics.remainToReceive), metrics.remainToReceive>0?C.accent:C.green ],
                  ["% Collected",          metrics.receivedPct+"%",      C.blue  ],
                ]},
                { title:"Invoices & Costs", color:C.accent, colorDim:C.accentDim, rows:[
                  ["Total Invoiced", fmt(metrics.totalInvoiced), C.text  ],
                  ["Paid",          fmt(metrics.totalPaid),      C.green ],
                  ["Overdue",       fmt(metrics.totalOverdue),   metrics.totalOverdue>0?C.red:C.muted ],
                  ["Pending",       fmt(metrics.totalPending),   C.accent],
                ]},
              ].map(tbl=>(
                <div key={tbl.title} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden" }}>
                  <div style={{ background:tbl.colorDim,borderBottom:`1px solid ${C.border}`,padding:"9px 16px",color:tbl.color,fontFamily:F,fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:.5 }}>{tbl.title}</div>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:12 }}>
                    <tbody>
                      {tbl.rows.map(([label,value,color],i)=>(
                        <tr key={i} style={{ borderBottom:i<tbl.rows.length-1?`1px solid ${C.border}22`:"none" }}>
                          <td style={{ padding:"9px 16px",color:C.muted }}>{label}</td>
                          <td style={{ padding:"9px 16px",color,fontWeight:700,textAlign:"right" }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 20px",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:12 }}>
              {[
                { label:"Net Cash Position",      value:fmt(metrics.netBalance),      color:metrics.netBalance>=0?C.green:C.red, sub:"Received − Paid Invoices" },
                { label:"Invoice Collection Rate",value:metrics.invoicePaidPct+"%",   color:C.blue,  sub:"of invoiced amount paid" },
                { label:"Contract Collected",     value:metrics.receivedPct+"%",      color:C.green, sub:"of contract value received" },
              ].map(b=>(
                <div key={b.label} style={{ textAlign:"center" }}>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:4 }}>{b.label}</div>
                  <div style={{ color:b.color,fontFamily:F,fontSize:20,fontWeight:800 }}>{b.value}</div>
                  <div style={{ color:C.muted,fontFamily:F,fontSize:10,marginTop:2 }}>{b.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice table */}
          {metrics.invoices.length>0&&(
            <div style={{ padding:"20px 32px",borderBottom:`1px solid ${C.border}` }}>
              <div style={{ color:C.muted,fontFamily:F,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:.7,marginBottom:12 }}>Invoice Breakdown</div>
              <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:12 }}>
                  <thead><tr style={{ background:C.bg }}>
                    {["Invoice #","Description","Amount","Due Date","Status"].map(h=>(
                      <th key={h} style={{ color:C.muted,fontWeight:700,padding:"9px 14px",textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:.3,borderBottom:`1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {metrics.invoices.map((inv,i)=>{
                      const st=inv.status||inv.invoiceStatus||"pending";
                      const stC={paid:C.green,overdue:C.red,pending:C.accent};
                      return(
                        <tr key={inv.id||i} style={{ borderBottom:i<metrics.invoices.length-1?`1px solid ${C.border}22`:"none" }}>
                          <td style={{ color:C.accent,padding:"9px 14px",fontWeight:700 }}>{inv.invId||inv.id}</td>
                          <td style={{ color:C.text,padding:"9px 14px",maxWidth:170,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{inv.desc||"—"}</td>
                          <td style={{ color:C.text,padding:"9px 14px",fontWeight:700 }}>{fmt(inv.amount)}</td>
                          <td style={{ color:C.muted,padding:"9px 14px" }}>{inv.dueFmt||inv.dueDate||"—"}</td>
                          <td style={{ padding:"9px 14px" }}><span style={{ background:(stC[st]||C.muted)+"22",color:stC[st]||C.muted,border:`1px solid ${(stC[st]||C.muted)}44`,padding:"2px 9px",borderRadius:4,fontWeight:700,fontSize:10,textTransform:"capitalize" }}>{st}</span></td>
                        </tr>
                      );
                    })}
                    <tr style={{ background:C.bg,borderTop:`1px solid ${C.border}` }}>
                      <td colSpan={2} style={{ color:C.muted,padding:"9px 14px",fontWeight:700,fontSize:10,textTransform:"uppercase" }}>Total Invoiced</td>
                      <td style={{ color:C.accent,padding:"9px 14px",fontWeight:800,fontSize:13 }}>{fmt(metrics.totalInvoiced)}</td>
                      <td colSpan={2}/>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments table */}
          {metrics.payments.length>0&&(
            <div style={{ padding:"20px 32px",borderBottom:`1px solid ${C.border}` }}>
              <div style={{ color:C.muted,fontFamily:F,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:.7,marginBottom:12 }}>Payment History</div>
              <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:F,fontSize:12 }}>
                  <thead><tr style={{ background:C.bg }}>
                    {["Date","Method","Amount","Invoice Ref","Notes"].map(h=>(
                      <th key={h} style={{ color:C.muted,fontWeight:700,padding:"9px 14px",textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:.3,borderBottom:`1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {metrics.payments.map((p,i)=>(
                      <tr key={p.id||i} style={{ borderBottom:i<metrics.payments.length-1?`1px solid ${C.border}22`:"none" }}>
                        <td style={{ color:C.muted,padding:"9px 14px" }}>{p.dateFmt||p.date||"—"}</td>
                        <td style={{ color:C.text,padding:"9px 14px" }}>{p.method||"—"}</td>
                        <td style={{ color:C.green,padding:"9px 14px",fontWeight:700 }}>{fmt(p.amount)}</td>
                        <td style={{ color:C.accent,padding:"9px 14px",fontSize:11 }}>{resolveInvRef(p.invRef,allInvoices)}</td>
                        <td style={{ color:C.muted,padding:"9px 14px",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.notes||"—"}</td>
                      </tr>
                    ))}
                    <tr style={{ background:C.bg,borderTop:`1px solid ${C.border}` }}>
                      <td colSpan={2} style={{ color:C.muted,padding:"9px 14px",fontWeight:700,fontSize:10,textTransform:"uppercase" }}>Total Received</td>
                      <td style={{ color:C.green,padding:"9px 14px",fontWeight:800,fontSize:13 }}>{fmt(metrics.totalReceived)}</td>
                      <td colSpan={2}/>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Narrative */}
          <div style={{ padding:"24px 32px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:18 }}>
              <div style={{ width:28,height:28,background:C.purpleDim,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>🤖</div>
              <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:13,textTransform:"uppercase",letterSpacing:.5 }}>Accountant's Analysis</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:10,marginLeft:"auto" }}>AI-generated · {report.generatedAt}</div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {report.paragraphs.map((para,i)=>(
                <p key={i} style={{ color:C.text,fontFamily:F,fontSize:13,lineHeight:1.75,margin:0,
                  ...(i===0?{ background:C.surface,borderLeft:`3px solid ${C.accent}`,borderRadius:"0 6px 6px 0",padding:"12px 16px" }:{ padding:"0 2px" }) }}>
                  {para}
                </p>
              ))}
            </div>
            <div style={{ marginTop:20,padding:"11px 16px",background:C.purpleDim,borderRadius:8,display:"flex",alignItems:"center",gap:9 }}>
              <span>⚠️</span>
              <span style={{ color:C.muted,fontFamily:F,fontSize:11 }}>AI-generated using BuildFlow data. For formal auditing or regulatory submission, please have this reviewed by a licensed accountant.</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!report&&!busy&&(
        <div style={{ background:C.card,border:`2px dashed ${C.border}`,borderRadius:14,padding:"60px 40px",textAlign:"center" }}>
          <div style={{ fontSize:52,marginBottom:16 }}>📊</div>
          <div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:18,marginBottom:8 }}>Ready to Generate</div>
          <div style={{ color:C.muted,fontFamily:F,fontSize:13,maxWidth:400,margin:"0 auto",lineHeight:1.65 }}>
            Select a project and click <strong style={{ color:C.accent }}>Generate &amp; Download PDF</strong>.<br/>
            BuildFlow will analyse all financial data, generate an AI accountant's report, and automatically download a professional PDF.
          </div>
        </div>
      )}
    </div>
  );
}



const NAV=[
  { id:"dashboard",  label:"Dashboard",       IcComp: ({c})=><Ic.Dashboard size={15} color={c}/> },
  { id:"projects",   label:"Projects",        IcComp: ({c})=><Ic.Projects  size={15} color={c}/> },
  { id:"invoicing",  label:"Invoices",        IcComp: ({c})=><Ic.Invoices  size={15} color={c}/> },
  { id:"payments",   label:"Payments",        IcComp: ({c})=><Ic.Payments  size={15} color={c}/> },
  { id:"team",       label:"Team",            IcComp: ({c})=><Ic.Team      size={15} color={c}/> },
  { id:"calendar",   label:"Calendar",        IcComp: ({c})=><Ic.Calendar  size={15} color={c}/> },
  { id:"tasks",      label:"Tasks",           IcComp: ({c})=><Ic.Tasks     size={15} color={c}/> },
  { id:"tenders",    label:"Tenders",         IcComp: ({c})=><Ic.Tenders   size={15} color={c}/> },
  { id:"reports",    label:"Reports",         IcComp: ({c})=><Ic.Reports   size={15} color={c}/> },
  { id:"prices",     label:"Price Tracking",  IcComp: ({c})=><Ic.Prices    size={15} color={c}/> },
  { id:"accountant", label:"Accountant",      IcComp: ({c})=><Ic.Accountant size={15} color={c}/> },
];

export default function App({ session, profile, onLogout }){
  // Init DB synchronously so hooks have company_id on first render
  if(profile?.company_id){
    initDb(profile.company_id, session?.user?.id, profile.full_name||profile.email||'User');
  }

  if(!profile?.company_id) return (
    <div style={{ minHeight:'100vh',background:'#0f1117',display:'flex',alignItems:'center',justifyContent:'center',color:'#7a849e',fontFamily:"'Inter',sans-serif",fontSize:14 }}>
      Setting up your workspace…
    </div>
  );

  return (
    <CompanyCtx.Provider value={profile.company_id}>
      <CurrencyProvider><ThemeProvider>
        <AppInner session={session} profile={profile} onLogout={onLogout}/>
      </ThemeProvider></CurrencyProvider>
    </CompanyCtx.Provider>
  );
}

function AppInner({ session, profile, onLogout }){
  const { theme, isDark, toggleTheme } = useTheme();
  ThemeRef.current = theme;
  const [tab,setTab]=useState("projects");
  const [project,setProject]=useState(null);
  const [subView,setSubView]=useState("list");
  const [teamLog,setTeamLog]=useState([]);
  const { tasks,addTask,updateTask,removeTask }=useTasks();
  const { allProjects, addProject, updateProject, deleteProject }=useProjects();
  const { log:globalLog, push:pushGlobal }=useGlobalLog();
  const { payments,addPayment,removePayment,updatePayment }=usePayments();
  // ── Lifted global invoices so ALL sections share one source of truth ──
  const { allInvoices, ready:invReady, addInvoice, updateInvoice, removeInvoice }=useGlobalInvoices();

  const goToDetail =p=>{ setProject(p); setSubView("detail"); setTab("projects"); };
  const goToTeam   =()=>setSubView("team");
  const teamBack   =dest=>{ if(dest==="projects"){setSubView("list");setProject(null);}else setSubView("detail"); };
  const detailBack =()=>{ setSubView("list"); setProject(null); };
  const switchTab  =id=>{ setTab(id); if(id!=="projects"){setProject(null);setSubView("list");} };
  const handleTeamLog=(action,icon,projName)=>{
    const entry={ id:Date.now(),action,detail:projName||action,user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon };
    setTeamLog(prev=>[entry,...prev]);
    pushGlobal(entry);
  };

  // Wrapped addPayment that also logs to global log
  const handleAddPayment=async(p)=>{
    addPayment(p);
    await pushGlobal({ id:Date.now(),action:`Payment $${Number(p.amount).toLocaleString()} recorded`,detail:p.project,user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"💰" });
  };
  const handleUpdatePayment=async(id,patch)=>{
    updatePayment(id,patch);
    await pushGlobal({ id:Date.now(),action:`Payment $${Number(patch.amount||0).toLocaleString()} updated`,detail:patch.project||"",user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"✏️" });
  };
  const handleRemovePayment=async(id)=>{
    const p=payments.find(x=>x.id===id);
    removePayment(id);
    if(p) await pushGlobal({ id:Date.now(),action:`Payment $${Number(p.amount||0).toLocaleString()} deleted`,detail:p.project||"",user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"🗑️" });
  };
  // Wrapped addInvoice that also logs to global log
  const handleAddInvoice=async(inv)=>{
    await addInvoice(inv);
    await pushGlobal({ id:Date.now(),action:`Invoice ${inv.invId||inv.id} added`,detail:`${inv.project||""} · $${Number(inv.amount||0).toLocaleString()}`,user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"🧾" });
  };
  const handleUpdateInvoice=async(id,patch)=>{
    await updateInvoice(id,patch);
    await pushGlobal({ id:Date.now(),action:`Invoice ${id} edited`,detail:patch.project||"",user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"✏️" });
  };
  const handleRemoveInvoice=async(id)=>{
    await removeInvoice(id);
    await pushGlobal({ id:Date.now(),action:`Invoice ${id} deleted`,detail:"",user:profile?.full_name||"User",time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),icon:"🗑️" });
  };

  const handleAddProject=async(proj)=>{
    await addProject(proj);
    await pushGlobal({ id:Date.now(), action:`Project "${proj.name}" created`, detail:proj.name, user:profile?.full_name||"User", time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}), icon:"🏗" });
  };
  const handleUpdateProject=async(id,patch)=>{
    await updateProject(id,patch);
    const p=allProjects.find(x=>x.id===id);
    await pushGlobal({ id:Date.now(), action:`Project "${p?.name||id}" updated`, detail:p?.name||"", user:profile?.full_name||"User", time:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}), icon:"✏️" });
  };

  const handleDeleteProject=async(proj)=>{
    const ts=new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
    // 1. Remove all payments linked to this project
    const linkedPayments=payments.filter(p=>p.projId===proj.id||p.project===proj.name);
    for(const p of linkedPayments){ removePayment(p.id); }
    // 2. Remove all dynamic invoices linked to this project
    const linkedInvoices=allInvoices.filter(i=>i.projId===proj.id||i.project===proj.name);
    for(const i of linkedInvoices){ await removeInvoice(i.id); }
    // 3. Remove tasks linked to this project
    const linkedTasks=tasks.filter(t=>t.projId===proj.id||t.project===proj.name);
    for(const t of linkedTasks){ removeTask(t.id); }
    // 4. Delete the project itself
    await deleteProject(proj.id);
    // 5. If we're currently viewing this project, go back to list
    if(project&&project.id===proj.id){ setProject(null); setSubView("list"); }
    // 6. Log the deletion
    await pushGlobal({ id:Date.now(), action:`Project "${proj.name}" deleted`, detail:proj.name, user:profile?.full_name||"User", time:ts, icon:"🗑️" });
  };

  const projectMilestoneEvents = useMemo(()=>{
    const evts=[];
    allProjects.forEach(p=>{
      if(p.startDateISO) evts.push({ id:`pstart-${p.id}`, type:"project", date:p.startDateISO, title:`${p.name} starts`, subtitle:p.client?.name||"", color:C.green, detail:p });
      if(p.due) evts.push({ id:`pend-${p.id}`, type:"project", date:p.due, title:`${p.name} due`, subtitle:p.client?.name||"", color:C.purple, detail:p });
    });
    return evts;
  },[allProjects,theme]);

  const screen=()=>{
    if(tab==="projects"){
      if(subView==="team"&&project)   return <TeamPage project={project} onBack={teamBack} onAddToLog={handleTeamLog} tasks={tasks} updateTask={updateTask}/>;
      if(subView==="detail"&&project) return <ProjectPage project={project} onBack={detailBack} onOpenTeam={goToTeam} extraLog={[...teamLog,...globalLog.filter(e=>e.detail===project.name)]} payments={payments} addPayment={handleAddPayment} updatePayment={handleUpdatePayment} removePayment={handleRemovePayment} allProjects={allProjects} allInvoices={allInvoices} addInvoice={handleAddInvoice} removeGlobalInvoice={handleRemoveInvoice} updateGlobalInvoice={handleUpdateInvoice} onUpdateProject={async(id,patch)=>{ await handleUpdateProject(id,patch); setProject(p=>({...p,...patch})); }} onLog={pushGlobal}/>;
      return <ProjectsList onSelect={goToDetail} allProjects={allProjects} onAddProject={handleAddProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject}/>;
    }
    if(tab==="dashboard") return <Dashboard onSelect={goToDetail} allProjects={allProjects} allInvoices={allInvoices} payments={payments} tasks={tasks} globalLog={globalLog}/>;
    if(tab==="invoicing")  return <InvoicingPage allProjects={allProjects} allInvoices={allInvoices} addInvoice={handleAddInvoice} updateInvoice={handleUpdateInvoice} removeInvoice={handleRemoveInvoice}/>;
    if(tab==="team")       return <TeamGlobal allProjects={allProjects} onLog={pushGlobal}/>;
    if(tab==="calendar")   return <CalendarPage allInvoices={allInvoices} tasks={tasks} onAddTask={addTask} projectEvents={projectMilestoneEvents} payments={payments} allProjects={allProjects}/>;
    if(tab==="tasks")      return <TasksPage tasks={tasks} addTask={addTask} updateTask={updateTask} removeTask={removeTask} allProjects={allProjects}/>;
    if(tab==="tenders")    return <TendersPage allProjects={allProjects}/>;
    if(tab==="payments")   return <PaymentsPage payments={payments} allProjects={allProjects} addPayment={handleAddPayment} allInvoices={allInvoices} removePayment={handleRemovePayment} updatePayment={handleUpdatePayment}/>;
    if(tab==="reports")    return <ReportPage tasks={tasks} allProjects={allProjects} allInvoices={allInvoices}/>;
    if(tab==="prices")     return <PriceTrackingPage/>;
    if(tab==="accountant") return <AccountantPage allProjects={allProjects} allInvoices={allInvoices} payments={payments}/>;
    return <div style={{ color:C.muted,fontFamily:F,fontSize:14,padding:"40px 0",textAlign:"center" }}>Coming soon…</div>;
  };

  return(
    <div style={{ display:"flex",height:"100vh",background:C.bg,fontFamily:F,overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${isDark?"#2a3045":"#c8cdd8"};border-radius:3px}
        select option{background:${theme.card};color:${theme.text}}
        input[type="date"]{color-scheme:${isDark?"dark":"light"}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
      `}</style>

      {/* Sidebar */}
      <div style={{ width:220,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"22px 18px 18px",borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:32,height:32,background:C.accent,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5"/></svg></div>
            <div><div style={{ color:C.text,fontFamily:F,fontWeight:700,fontSize:15 }}>BuildFlow</div><div style={{ color:C.muted,fontFamily:F,fontSize:11 }}>{profile?.companies?.name||"Construction Management"}</div></div>
          </div>
        </div>
        <nav style={{ flex:1,padding:"14px 10px",overflowY:"auto" }}>
          {NAV.filter(n=>!profile||!profile.permissions||profile.permissions[n.id]!==false).map(n=>{
            const active=tab===n.id;
            const color=active?C.accent:C.muted;
            return(
              <button key={n.id} onClick={()=>switchTab(n.id)} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:8,marginBottom:2,background:active?C.accentDim:"transparent",border:active?`1px solid ${C.accentMid}`:"1px solid transparent",color,fontFamily:F,fontSize:13,fontWeight:active?700:500,cursor:"pointer",textAlign:"left",transition:"all .15s" }}>
                {n.IcComp && <n.IcComp c={color}/>}{n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:"14px 18px",borderTop:`1px solid ${C.border}` }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:8,background:C.accentDim,border:`1px solid ${C.accentMid}`,cursor:"pointer",marginBottom:12,transition:"all .2s" }} title={isDark?"Switch to Light Mode":"Switch to Dark Mode"}>
            <span style={{ fontSize:16 }}>{isDark?"☀️":"🌙"}</span>
            <span style={{ color:C.accent,fontFamily:F,fontSize:12,fontWeight:700 }}>{isDark?"Light Mode":"Dark Mode"}</span>
          </button>
          {/* User */}
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
            <div style={{ width:30,height:30,borderRadius:"50%",background:C.blueDim,display:"flex",alignItems:"center",justifyContent:"center",color:C.blue,fontFamily:F,fontWeight:700,fontSize:12,flexShrink:0 }}>
              {profile?.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?"}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:C.text,fontFamily:F,fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{profile?.full_name||profile?.email||"User"}</div>
              <div style={{ color:C.muted,fontFamily:F,fontSize:11,textTransform:"capitalize" }}>{profile?.role||"user"}</div>
            </div>
          </div>
          {/* Logout */}
          {onLogout&&<button onClick={onLogout} style={{ display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 10px",borderRadius:7,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontFamily:F,fontSize:12,cursor:"pointer",transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red+"66";e.currentTarget.style.color=C.red;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1,overflowY:"auto",padding:"28px 30px" }}>{screen()}</div>
    </div>
  );
}