import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "./lib/supabase.js";
import { loadUserData, syncFlips, syncPortfolio, syncUserCards } from "./lib/db.js";
import {
  TrendingUp, TrendingDown, Upload, Camera, ArrowRight, ArrowLeft,
  Check, Plus, X, CreditCard, BarChart3, Home, Edit3,
  Copy, Search, ChevronRight, Receipt, Trash2, Flame, CheckCircle2,
  Archive, Settings, Shield, Download, AlertTriangle, ExternalLink,
  Percent, DollarSign, User, Database, Bell, RefreshCw, Palette,
  PiggyBank, Coins, Star, HelpCircle, MessageSquare, Sparkles,
  FileText, CameraOff, Clock, Undo2, Info, Link2, ChevronDown, ChevronUp,
  FolderInput, Zap, Award, Lock, Unlock, CheckCircle, Loader, EyeOff,
  ArrowUpDown, SortAsc, SlidersHorizontal, Mail, Repeat, PlayCircle, LogOut,
} from "lucide-react";

// ==================== THEMES ====================
const THEMES = {
  "stockback-dark": {
    label: "Stockback Dark", family: "Stockback",
    fontStack: "'Plus Jakarta Sans', -apple-system, sans-serif",
    vars: {
      "--bg-deep": "#0a0e14", "--bg-0": "#10151d", "--bg-1": "#161c27",
      "--bg-2": "#1c2431", "--surface": "#232c3c",
      "--border": "rgba(200, 220, 255, 0.08)", "--border-strong": "rgba(200, 220, 255, 0.14)",
      "--accent": "#4c8bf5", "--accent-light": "#6ba3ff", "--accent-soft": "rgba(76, 139, 245, 0.12)",
      "--gold": "#d9b368",
      "--text-1": "#e8ecf4", "--text-2": "#a3abbd", "--text-3": "#6a7489", "--text-4": "#4a5266",
      "--green": "#2ee089", "--red": "#ff5f6d",
    },
  },
  "stockback-light": {
    label: "Stockback Light", family: "Stockback",
    fontStack: "'Plus Jakarta Sans', -apple-system, sans-serif",
    vars: {
      "--bg-deep": "#f5f6f8", "--bg-0": "#ffffff", "--bg-1": "#f3f5f8",
      "--bg-2": "#e8ecf2", "--surface": "#dde2ea",
      "--border": "rgba(20, 30, 50, 0.08)", "--border-strong": "rgba(20, 30, 50, 0.16)",
      "--accent": "#2a6fe8", "--accent-light": "#4c8bf5", "--accent-soft": "rgba(42, 111, 232, 0.1)",
      "--gold": "#a87f2c",
      "--text-1": "#0f1521", "--text-2": "#4a556b", "--text-3": "#7e8699", "--text-4": "#b0b7c4",
      "--green": "#13a35a", "--red": "#d8384c",
    },
  },
  "ibkr": {
    label: "Interactive Brokers", family: "Brokerage",
    fontStack: "'IBM Plex Sans', 'Inter', sans-serif",
    vars: {
      "--bg-deep": "#0e0e0e", "--bg-0": "#151515", "--bg-1": "#1e1e1e",
      "--bg-2": "#282828", "--surface": "#333333",
      "--border": "rgba(255, 255, 255, 0.08)", "--border-strong": "rgba(255, 255, 255, 0.18)",
      "--accent": "#d81b0c", "--accent-light": "#ef3d2e", "--accent-soft": "rgba(216, 27, 12, 0.12)",
      "--gold": "#e8b923",
      "--text-1": "#f5f5f5", "--text-2": "#a8a8a8", "--text-3": "#767676", "--text-4": "#4a4a4a",
      "--green": "#00b050", "--red": "#e53935",
    },
  },
  "sofi": {
    label: "SoFi", family: "Brokerage",
    fontStack: "'Work Sans', 'Inter', sans-serif",
    vars: {
      "--bg-deep": "#eef1f8", "--bg-0": "#ffffff", "--bg-1": "#f5f7fb",
      "--bg-2": "#e8ecf4", "--surface": "#d8dfea",
      "--border": "rgba(32, 23, 71, 0.08)", "--border-strong": "rgba(32, 23, 71, 0.2)",
      "--accent": "#00a2c7", "--accent-light": "#2dc6f2", "--accent-soft": "rgba(0, 162, 199, 0.1)",
      "--gold": "#c28625",
      "--text-1": "#201747", "--text-2": "#5a557a", "--text-3": "#8a85a6", "--text-4": "#b8b4ce",
      "--green": "#00a870", "--red": "#e02f3c",
    },
  },
  "robinhood": {
    label: "Robinhood", family: "Brokerage",
    fontStack: "'Inter', -apple-system, sans-serif",
    vars: {
      "--bg-deep": "#000000", "--bg-0": "#0b0b0b", "--bg-1": "#141414",
      "--bg-2": "#1e1e1e", "--surface": "#282828",
      "--border": "rgba(255, 255, 255, 0.06)", "--border-strong": "rgba(255, 255, 255, 0.16)",
      "--accent": "#00c805", "--accent-light": "#2ae02f", "--accent-soft": "rgba(0, 200, 5, 0.1)",
      "--gold": "#ffd15c",
      "--text-1": "#ffffff", "--text-2": "#9e9e9e", "--text-3": "#6d6d6d", "--text-4": "#444444",
      "--green": "#00c805", "--red": "#ff3232",
    },
  },
  "public": {
    label: "Public", family: "Brokerage",
    fontStack: "'Fraunces', 'Georgia', serif",
    vars: {
      "--bg-deep": "#0a0f18", "--bg-0": "#0d1421", "--bg-1": "#141b2c",
      "--bg-2": "#1c2438", "--surface": "#262f45",
      "--border": "rgba(231, 223, 213, 0.08)", "--border-strong": "rgba(231, 223, 213, 0.2)",
      "--accent": "#e7dfd5", "--accent-light": "#f5ecdf", "--accent-soft": "rgba(231, 223, 213, 0.1)",
      "--gold": "#d4b876",
      "--text-1": "#e7dfd5", "--text-2": "#a8a18f", "--text-3": "#76705f", "--text-4": "#4a463a",
      "--green": "#00a656", "--red": "#ef4b5a",
    },
  },
  "fidelity": {
    label: "Fidelity", family: "Brokerage",
    fontStack: "'Roboto', 'Arial', sans-serif",
    vars: {
      "--bg-deep": "#edf0f2", "--bg-0": "#ffffff", "--bg-1": "#f4f6f8",
      "--bg-2": "#e8ecf0", "--surface": "#dce2e8",
      "--border": "rgba(54, 135, 39, 0.08)", "--border-strong": "rgba(54, 135, 39, 0.2)",
      "--accent": "#368727", "--accent-light": "#4ca53d", "--accent-soft": "rgba(54, 135, 39, 0.08)",
      "--gold": "#d48b00",
      "--text-1": "#0f2f4a", "--text-2": "#4a5e75", "--text-3": "#7c8a9c", "--text-4": "#b0b8c4",
      "--green": "#368727", "--red": "#c83232",
    },
  },
  "schwab": {
    label: "Charles Schwab", family: "Brokerage",
    fontStack: "'Roboto', 'Arial', sans-serif",
    vars: {
      "--bg-deep": "#eef3f8", "--bg-0": "#ffffff", "--bg-1": "#f3f6fa",
      "--bg-2": "#e6edf4", "--surface": "#d8e2ec",
      "--border": "rgba(0, 160, 223, 0.1)", "--border-strong": "rgba(0, 160, 223, 0.22)",
      "--accent": "#00a0df", "--accent-light": "#2fb5e8", "--accent-soft": "rgba(0, 160, 223, 0.08)",
      "--gold": "#c2850e",
      "--text-1": "#0a2845", "--text-2": "#47607e", "--text-3": "#7a8ca4", "--text-4": "#b0bac8",
      "--green": "#00a24b", "--red": "#d73030",
    },
  },
  "webull": {
    label: "Webull", family: "Brokerage",
    fontStack: "'Roboto', 'Arial', sans-serif",
    vars: {
      "--bg-deep": "#000000", "--bg-0": "#0a0a0a", "--bg-1": "#141414",
      "--bg-2": "#1e1e1e", "--surface": "#2a2a2a",
      "--border": "rgba(0, 67, 233, 0.1)", "--border-strong": "rgba(0, 67, 233, 0.28)",
      "--accent": "#0043e9", "--accent-light": "#2b66ff", "--accent-soft": "rgba(0, 67, 233, 0.14)",
      "--gold": "#f5a623",
      "--text-1": "#ffffff", "--text-2": "#a0a6b0", "--text-3": "#6e737b", "--text-4": "#454852",
      "--green": "#00c853", "--red": "#ff3344",
    },
  },
  "cashapp": {
    label: "Cash App Investing", family: "Brokerage",
    fontStack: "'Inter', sans-serif",
    vars: {
      "--bg-deep": "#000000", "--bg-0": "#000000", "--bg-1": "#0a0a0a",
      "--bg-2": "#151515", "--surface": "#1f1f1f",
      "--border": "rgba(0, 214, 50, 0.1)", "--border-strong": "rgba(0, 214, 50, 0.3)",
      "--accent": "#00d632", "--accent-light": "#2ff05c", "--accent-soft": "rgba(0, 214, 50, 0.1)",
      "--gold": "#ffd666",
      "--text-1": "#ffffff", "--text-2": "#a0a0a0", "--text-3": "#6e6e6e", "--text-4": "#454545",
      "--green": "#00d632", "--red": "#ff3d5a",
    },
  },
  "merrill": {
    label: "Merrill Edge", family: "Brokerage",
    fontStack: "'Georgia', serif",
    vars: {
      "--bg-deep": "#f0ebe0", "--bg-0": "#fdfbf6", "--bg-1": "#f5f1e8",
      "--bg-2": "#ebe4d4", "--surface": "#ddd3bf",
      "--border": "rgba(109, 47, 31, 0.1)", "--border-strong": "rgba(109, 47, 31, 0.24)",
      "--accent": "#6d2f1f", "--accent-light": "#8e3f2a", "--accent-soft": "rgba(109, 47, 31, 0.08)",
      "--gold": "#b8860b",
      "--text-1": "#1e1a14", "--text-2": "#4f4a3e", "--text-3": "#85816f", "--text-4": "#b8b3a0",
      "--green": "#2d7a3d", "--red": "#b02c2c",
    },
  },
  "coinbase": {
    label: "Coinbase", family: "Brokerage",
    fontStack: "'Inter', sans-serif",
    vars: {
      "--bg-deep": "#ffffff", "--bg-0": "#ffffff", "--bg-1": "#f7f8fa",
      "--bg-2": "#eef0f3", "--surface": "#dde1e6",
      "--border": "rgba(10, 11, 13, 0.08)", "--border-strong": "rgba(10, 11, 13, 0.2)",
      "--accent": "#0052ff", "--accent-light": "#2b6bff", "--accent-soft": "rgba(0, 82, 255, 0.08)",
      "--gold": "#f9a138",
      "--text-1": "#0a0b0d", "--text-2": "#444a55", "--text-3": "#7c8493", "--text-4": "#b3b9c2",
      "--green": "#05b169", "--red": "#cf202f",
    },
  },
  "capitalone": {
    label: "Capital One Investing", family: "Brokerage",
    fontStack: "'Inter', sans-serif",
    vars: {
      "--bg-deep": "#00253f", "--bg-0": "#003057", "--bg-1": "#0a3d6a",
      "--bg-2": "#14497e", "--surface": "#1f5992",
      "--border": "rgba(255, 255, 255, 0.08)", "--border-strong": "rgba(255, 255, 255, 0.18)",
      "--accent": "#d22630", "--accent-light": "#ed3a45", "--accent-soft": "rgba(210, 38, 48, 0.14)",
      "--gold": "#f7a533",
      "--text-1": "#ffffff", "--text-2": "#b8c8d8", "--text-3": "#8098b0", "--text-4": "#546a82",
      "--green": "#4fd491", "--red": "#ff5a66",
    },
  },
};

const STOCKBACK_DARK_VARS = THEMES["stockback-dark"].vars;

const applyTheme = (themeId) => {
  const t = THEMES[themeId];
  if (!t) return;
  const root = document.documentElement;
  Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.setProperty("--font-stack", t.fontStack);
  // Match the <body> background to theme so it bleeds edge-to-edge
  document.body.style.background = t.vars["--bg-0"];
};

// ==================== FONT / GLOBAL STYLE ====================
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@300;400;450;500;600;700&family=JetBrains+Mono:wght@400;500&family=Roboto:wght@400;500;700&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg-0, #05080d); transition: background 0.3s; }

    @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .ticker-track { animation: ticker-scroll 38s linear infinite; }

    /* Smooth cross-fade when cycling themes on the welcome screen */
    html.theme-cycling .sb-root,
    html.theme-cycling .sb-root * {
      transition: background-color 600ms ease, background 600ms ease,
                  color 600ms ease, border-color 600ms ease !important;
    }

    .sb-root {
      font-family: var(--font-stack, 'Plus Jakarta Sans', -apple-system, sans-serif);
      color: var(--text-1);
      -webkit-font-smoothing: antialiased;
    }
    .sb-display { font-family: 'Fraunces', serif; letter-spacing: -0.015em; font-weight: 500; font-variation-settings: "opsz" 80; }
    .sb-mono { font-family: 'JetBrains Mono', 'SF Mono', monospace; letter-spacing: -0.02em; }
    .sb-num { font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
    .sb-brand { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; font-weight: 700; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .fade-in { animation: fadeIn 0.3s ease forwards; }

    @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .slide-up { animation: slideUp 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.05) forwards; }

    @keyframes pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .pop { animation: pop 0.25s ease forwards; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .slide-down { animation: slideDown 0.3s cubic-bezier(0.2, 0.9, 0.3, 1) forwards; }

    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .shimmer { animation: shimmer 1.6s ease-in-out infinite; }

    @keyframes undo-progress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
    .undo-progress-bar { animation: undo-progress linear forwards; transform-origin: left; }

    @keyframes glow-pulse {
      0%, 100% { text-shadow: 0 0 24px rgba(217, 179, 104, 0.45), 0 0 12px rgba(217, 179, 104, 0.25); }
      50%      { text-shadow: 0 0 40px rgba(217, 179, 104, 0.8),  0 0 20px rgba(217, 179, 104, 0.5); }
    }
    .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }

    @keyframes cta-pulse {
      0%, 100% { box-shadow: 0 10px 28px rgba(76, 139, 245, 0.35), 0 0 0 0 rgba(76, 139, 245, 0.5); }
      50%      { box-shadow: 0 14px 36px rgba(76, 139, 245, 0.55), 0 0 0 8px rgba(76, 139, 245, 0); }
    }
    .cta-pulse { animation: cta-pulse 2.2s ease-in-out infinite; }

    .soft-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .soft-scroll::-webkit-scrollbar-thumb { background: var(--text-4); border-radius: 999px; }
    .soft-scroll::-webkit-scrollbar-track { background: transparent; }

    input, select, textarea { font-family: inherit; }
    input::placeholder, textarea::placeholder { color: var(--text-4); }
    button { user-select: none; }

    .chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 9px; background: var(--bg-2);
      border: 1px solid var(--border); border-radius: 999px;
      font-size: 10.5px; color: var(--text-2);
    }

    .color-shuffle {
      display: inline-block;
      font-style: italic;
      transition: color 0.9s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'Fraunces', serif;
    }

    .demo-pill {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 1px 6px; border-radius: 999px;
      background: rgba(217, 179, 104, 0.18);
      border: 1px solid rgba(217, 179, 104, 0.35);
      color: var(--gold);
      font-size: 8.5px; font-weight: 700; letter-spacing: 0.06em;
      text-transform: uppercase; white-space: nowrap;
    }
  `}</style>
);

// ==================== CARD CATALOG ====================
const CARD_CATALOG = [
  { id: "amex-gold", issuer: "American Express", name: "Gold Card", shortName: "Amex Gold", popular: true, brandStyle: { bg: "linear-gradient(135deg, #d4af6a 0%, #b8924f 50%, #9e7a3e 100%)", logo: "AMEX", accent: "#fff8e7" }, defaultRewards: [{ category: "Dining", rate: 4 }, { category: "Groceries", rate: 4 }, { category: "Flights", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "amex-plat", issuer: "American Express", name: "Platinum Card", shortName: "Amex Platinum", popular: true, brandStyle: { bg: "linear-gradient(135deg, #d8dce2 0%, #a8aeb9 50%, #7e8693 100%)", logo: "AMEX", accent: "#1a1d24" }, defaultRewards: [{ category: "Flights", rate: 5 }, { category: "Hotels", rate: 5 }, { category: "Everything else", rate: 1 }] },
  { id: "amex-green", issuer: "American Express", name: "Green Card", shortName: "Amex Green", brandStyle: { bg: "linear-gradient(135deg, #2d5c3e 0%, #1f4329 50%, #122c18 100%)", logo: "AMEX", accent: "#fff" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Dining", rate: 3 }, { category: "Transit", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "amex-blue", issuer: "American Express", name: "Blue Cash Preferred", shortName: "Amex Blue Cash Preferred", brandStyle: { bg: "linear-gradient(135deg, #2c5fa3 0%, #1e4480 50%, #132d57 100%)", logo: "AMEX", accent: "#e8f1ff" }, defaultRewards: [{ category: "Groceries", rate: 6 }, { category: "Streaming", rate: 6 }, { category: "Gas", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "amex-blue-everyday", issuer: "American Express", name: "Blue Cash Everyday", shortName: "Amex Blue Cash Everyday", brandStyle: { bg: "linear-gradient(135deg, #5a85c2 0%, #3a669e 50%, #24497c 100%)", logo: "AMEX", accent: "#fff" }, defaultRewards: [{ category: "Groceries", rate: 3 }, { category: "Gas", rate: 3 }, { category: "Shopping", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "amex-cash-mag", issuer: "American Express", name: "Cash Magnet", shortName: "Amex Cash Magnet", brandStyle: { bg: "linear-gradient(135deg, #40566e 0%, #2c3d50 50%, #1c2938 100%)", logo: "AMEX", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 1.5 }] },
  { id: "amex-biz-gold", issuer: "American Express", name: "Business Gold", shortName: "Amex Business Gold", brandStyle: { bg: "linear-gradient(135deg, #c4a456 0%, #a88943 50%, #826a31 100%)", logo: "AMEX", accent: "#fff" }, defaultRewards: [{ category: "Top category", rate: 4 }, { category: "Everything else", rate: 1 }] },
  { id: "delta-gold", issuer: "American Express", name: "Delta SkyMiles Gold", shortName: "Delta SkyMiles Gold", brandStyle: { bg: "linear-gradient(135deg, #e3ab4a 0%, #ba8528 50%, #8e6315 100%)", logo: "DELTA", accent: "#fff" }, defaultRewards: [{ category: "Travel", rate: 2 }, { category: "Dining", rate: 2 }, { category: "Groceries", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "delta-plat", issuer: "American Express", name: "Delta SkyMiles Platinum", shortName: "Delta SkyMiles Platinum", brandStyle: { bg: "linear-gradient(135deg, #b8b8c0 0%, #909098 50%, #686870 100%)", logo: "DELTA", accent: "#fff" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Hotels", rate: 3 }, { category: "Dining", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "hilton-honors", issuer: "American Express", name: "Hilton Honors", shortName: "Hilton Honors Amex", brandStyle: { bg: "linear-gradient(135deg, #1d4a85 0%, #13335e 50%, #0b2040 100%)", logo: "HILTON", accent: "#fff" }, defaultRewards: [{ category: "Hotels", rate: 7 }, { category: "Dining", rate: 5 }, { category: "Everything else", rate: 3 }] },
  { id: "hilton-aspire", issuer: "American Express", name: "Hilton Honors Aspire", shortName: "Hilton Aspire", brandStyle: { bg: "linear-gradient(135deg, #0a1f3f 0%, #051226 50%, #000812 100%)", logo: "HILTON", accent: "#d4a86a" }, defaultRewards: [{ category: "Hotels", rate: 14 }, { category: "Flights", rate: 7 }, { category: "Everything else", rate: 3 }] },
  { id: "marriott-brilliant", issuer: "American Express", name: "Marriott Bonvoy Brilliant", shortName: "Marriott Brilliant Amex", brandStyle: { bg: "linear-gradient(135deg, #3a2a1a 0%, #26180c 50%, #150a04 100%)", logo: "MARRIOTT", accent: "#d4a86a" }, defaultRewards: [{ category: "Hotels", rate: 6 }, { category: "Dining", rate: 3 }, { category: "Flights", rate: 3 }, { category: "Everything else", rate: 2 }] },
  { id: "chase-sapphire-p", issuer: "Chase", name: "Sapphire Preferred", shortName: "Chase Sapphire Preferred", popular: true, brandStyle: { bg: "linear-gradient(135deg, #1e4080 0%, #152d5c 50%, #0a1a3c 100%)", logo: "CHASE", accent: "#d4e4ff" }, defaultRewards: [{ category: "Dining", rate: 3 }, { category: "Travel", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "chase-sapphire-r", issuer: "Chase", name: "Sapphire Reserve", shortName: "Chase Sapphire Reserve", brandStyle: { bg: "linear-gradient(135deg, #0f1f3c 0%, #081329 50%, #020818 100%)", logo: "CHASE", accent: "#d4a86a" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Dining", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "chase-freedom-u", issuer: "Chase", name: "Freedom Unlimited", shortName: "Chase Freedom Unlimited", popular: true, brandStyle: { bg: "linear-gradient(135deg, #2e6fb8 0%, #1f568f 50%, #143d66 100%)", logo: "CHASE", accent: "#fff" }, defaultRewards: [{ category: "Dining", rate: 3 }, { category: "Shopping", rate: 3 }, { category: "Everything else", rate: 1.5 }] },
  { id: "chase-freedom-f", issuer: "Chase", name: "Freedom Flex", shortName: "Chase Freedom Flex", brandStyle: { bg: "linear-gradient(135deg, #4080c9 0%, #2e6fb8 50%, #1f568f 100%)", logo: "CHASE", accent: "#fff" }, defaultRewards: [{ category: "Rotating", rate: 5 }, { category: "Dining", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "chase-freedom-rise", issuer: "Chase", name: "Freedom Rise", shortName: "Chase Freedom Rise", brandStyle: { bg: "linear-gradient(135deg, #5a90cc 0%, #3d7ab8 50%, #2a639a 100%)", logo: "CHASE", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 1.5 }] },
  { id: "chase-ink-cash", issuer: "Chase", name: "Ink Business Cash", shortName: "Chase Ink Business Cash", brandStyle: { bg: "linear-gradient(135deg, #17579c 0%, #0f3e73 50%, #082848 100%)", logo: "CHASE INK", accent: "#fff" }, defaultRewards: [{ category: "Office", rate: 5 }, { category: "Internet", rate: 5 }, { category: "Gas", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "chase-ink-pref", issuer: "Chase", name: "Ink Business Preferred", shortName: "Chase Ink Preferred", brandStyle: { bg: "linear-gradient(135deg, #0d2b52 0%, #081c38 50%, #03101f 100%)", logo: "CHASE INK", accent: "#d4a86a" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Shipping", rate: 3 }, { category: "Internet", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "united-explorer", issuer: "Chase", name: "United Explorer", shortName: "United Explorer", brandStyle: { bg: "linear-gradient(135deg, #002244 0%, #001630 50%, #000814 100%)", logo: "UNITED", accent: "#b0b8c4" }, defaultRewards: [{ category: "Travel", rate: 2 }, { category: "Dining", rate: 2 }, { category: "Hotels", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "united-quest", issuer: "Chase", name: "United Quest", shortName: "United Quest", brandStyle: { bg: "linear-gradient(135deg, #1b3a5a 0%, #0f2640 50%, #061628 100%)", logo: "UNITED", accent: "#e6f0ff" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Dining", rate: 2 }, { category: "Streaming", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "southwest-rr", issuer: "Chase", name: "Southwest Rapid Rewards Plus", shortName: "Southwest Rapid Rewards", brandStyle: { bg: "linear-gradient(135deg, #304cb2 0%, #1e3380 50%, #122056 100%)", logo: "SOUTHWEST", accent: "#ffbf27" }, defaultRewards: [{ category: "Travel", rate: 2 }, { category: "Transit", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "marriott-bonvoy", issuer: "Chase", name: "Marriott Bonvoy Boundless", shortName: "Marriott Bonvoy", brandStyle: { bg: "linear-gradient(135deg, #8a1a2c 0%, #600f1c 50%, #3d0812 100%)", logo: "MARRIOTT", accent: "#fff" }, defaultRewards: [{ category: "Hotels", rate: 6 }, { category: "Everything else", rate: 2 }] },
  { id: "ihg-premier", issuer: "Chase", name: "IHG Premier", shortName: "IHG Premier", brandStyle: { bg: "linear-gradient(135deg, #004d7a 0%, #003858 50%, #00243a 100%)", logo: "IHG", accent: "#fff" }, defaultRewards: [{ category: "Hotels", rate: 10 }, { category: "Dining", rate: 4 }, { category: "Travel", rate: 3 }, { category: "Everything else", rate: 2 }] },
  { id: "amazon-prime", issuer: "Chase", name: "Amazon Prime Visa", shortName: "Amazon Prime Visa", brandStyle: { bg: "linear-gradient(135deg, #232f3e 0%, #131a24 50%, #07090e 100%)", logo: "AMAZON", accent: "#ff9900" }, defaultRewards: [{ category: "Shopping", rate: 5 }, { category: "Dining", rate: 2 }, { category: "Gas", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "citi-double", issuer: "Citi", name: "Double Cash", shortName: "Citi Double Cash", popular: true, brandStyle: { bg: "linear-gradient(135deg, #b23a3a 0%, #8f2a2a 50%, #6a1c1c 100%)", logo: "CITI", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 2 }] },
  { id: "citi-custom", issuer: "Citi", name: "Custom Cash", shortName: "Citi Custom Cash", brandStyle: { bg: "linear-gradient(135deg, #942828 0%, #6b1c1c 50%, #471212 100%)", logo: "CITI", accent: "#fff" }, defaultRewards: [{ category: "Top spending", rate: 5 }, { category: "Everything else", rate: 1 }] },
  { id: "citi-premier", issuer: "Citi", name: "Premier", shortName: "Citi Premier", brandStyle: { bg: "linear-gradient(135deg, #1a2842 0%, #0f1a30 50%, #060c1c 100%)", logo: "CITI", accent: "#d4a86a" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Dining", rate: 3 }, { category: "Groceries", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "citi-strata", issuer: "Citi", name: "Strata Premier", shortName: "Citi Strata Premier", brandStyle: { bg: "linear-gradient(135deg, #192642 0%, #0d1728 50%, #040914 100%)", logo: "CITI", accent: "#c8d4e8" }, defaultRewards: [{ category: "Hotels", rate: 10 }, { category: "Travel", rate: 3 }, { category: "Dining", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "aa-aviator", issuer: "Citi", name: "AAdvantage Aviator Red", shortName: "American Airlines Aviator", brandStyle: { bg: "linear-gradient(135deg, #3a3f48 0%, #25292f 50%, #14171c 100%)", logo: "AA", accent: "#d4d9e0" }, defaultRewards: [{ category: "Travel", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "aa-executive", issuer: "Citi", name: "AAdvantage Executive", shortName: "AA Executive", brandStyle: { bg: "linear-gradient(135deg, #1f232a 0%, #13171d 50%, #080b10 100%)", logo: "AA", accent: "#c4c9d0" }, defaultRewards: [{ category: "Travel", rate: 4 }, { category: "Hotels", rate: 10 }, { category: "Everything else", rate: 1 }] },
  { id: "costco-anywhere", issuer: "Citi", name: "Costco Anywhere Visa", shortName: "Costco Anywhere Visa", brandStyle: { bg: "linear-gradient(135deg, #e31837 0%, #b01128 50%, #7d0b1c 100%)", logo: "COSTCO", accent: "#fff" }, defaultRewards: [{ category: "Gas", rate: 4 }, { category: "Dining", rate: 3 }, { category: "Travel", rate: 3 }, { category: "Groceries", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "bestbuy", issuer: "Citi", name: "Best Buy Visa", shortName: "Best Buy Credit Card", brandStyle: { bg: "linear-gradient(135deg, #003b64 0%, #002847 50%, #00172a 100%)", logo: "BEST BUY", accent: "#fff200" }, defaultRewards: [{ category: "Shopping", rate: 5 }, { category: "Gas", rate: 3 }, { category: "Dining", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "discover-it", issuer: "Discover", name: "it Cash Back", shortName: "Discover it Cash Back", popular: true, brandStyle: { bg: "linear-gradient(135deg, #e08a3e 0%, #c07028 50%, #9a5720 100%)", logo: "DISCOVER", accent: "#fff" }, defaultRewards: [{ category: "Rotating", rate: 5 }, { category: "Everything else", rate: 1 }] },
  { id: "discover-miles", issuer: "Discover", name: "it Miles", shortName: "Discover it Miles", brandStyle: { bg: "linear-gradient(135deg, #5a6a7e 0%, #3d4a5c 50%, #26303e 100%)", logo: "DISCOVER", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 1.5 }] },
  { id: "discover-chrome", issuer: "Discover", name: "it Chrome", shortName: "Discover it Chrome", brandStyle: { bg: "linear-gradient(135deg, #a8afb9 0%, #888f9a 50%, #656c78 100%)", logo: "DISCOVER", accent: "#fff" }, defaultRewards: [{ category: "Gas", rate: 2 }, { category: "Dining", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "capital-venture", issuer: "Capital One", name: "Venture", shortName: "Capital One Venture", brandStyle: { bg: "linear-gradient(135deg, #6b7a92 0%, #4d5a72 50%, #323d52 100%)", logo: "CAPITAL ONE", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 2 }] },
  { id: "capital-venture-x", issuer: "Capital One", name: "Venture X", shortName: "Capital One Venture X", brandStyle: { bg: "linear-gradient(135deg, #3a4a63 0%, #2a3649 50%, #1b2434 100%)", logo: "CAPITAL ONE", accent: "#d9b368" }, defaultRewards: [{ category: "Travel", rate: 10 }, { category: "Dining", rate: 5 }, { category: "Everything else", rate: 2 }] },
  { id: "capital-savor", issuer: "Capital One", name: "Savor", shortName: "Capital One Savor", brandStyle: { bg: "linear-gradient(135deg, #a02d4e 0%, #7a2038 50%, #561624 100%)", logo: "CAPITAL ONE", accent: "#fff" }, defaultRewards: [{ category: "Dining", rate: 4 }, { category: "Entertainment", rate: 4 }, { category: "Groceries", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "capital-savorone", issuer: "Capital One", name: "SavorOne", shortName: "Capital One SavorOne", brandStyle: { bg: "linear-gradient(135deg, #b0385a 0%, #8a2a46 50%, #631c32 100%)", logo: "CAPITAL ONE", accent: "#fff" }, defaultRewards: [{ category: "Dining", rate: 3 }, { category: "Entertainment", rate: 3 }, { category: "Groceries", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "capital-quicksilver", issuer: "Capital One", name: "Quicksilver", shortName: "Capital One Quicksilver", brandStyle: { bg: "linear-gradient(135deg, #9ea6b5 0%, #747c8c 50%, #4d5564 100%)", logo: "CAPITAL ONE", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 1.5 }] },
  { id: "capital-spark", issuer: "Capital One", name: "Spark Cash Plus", shortName: "Capital One Spark Cash", brandStyle: { bg: "linear-gradient(135deg, #5c6a80 0%, #3f4d63 50%, #26334a 100%)", logo: "CAPITAL ONE", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 2 }] },
  { id: "walmart-mc", issuer: "Capital One", name: "Walmart Rewards Mastercard", shortName: "Walmart Rewards", brandStyle: { bg: "linear-gradient(135deg, #0071ce 0%, #005399 50%, #003766 100%)", logo: "WALMART", accent: "#ffc220" }, defaultRewards: [{ category: "Shopping", rate: 5 }, { category: "Dining", rate: 2 }, { category: "Travel", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "wells-active", issuer: "Wells Fargo", name: "Active Cash", shortName: "Wells Fargo Active Cash", brandStyle: { bg: "linear-gradient(135deg, #c41e2e 0%, #9a1725 50%, #6e101a 100%)", logo: "WELLS FARGO", accent: "#f7d878" }, defaultRewards: [{ category: "Everything", rate: 2 }] },
  { id: "wells-autograph", issuer: "Wells Fargo", name: "Autograph", shortName: "Wells Fargo Autograph", brandStyle: { bg: "linear-gradient(135deg, #8a1823 0%, #62111b 50%, #3d0a11 100%)", logo: "WELLS FARGO", accent: "#f7d878" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Dining", rate: 3 }, { category: "Gas", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "wells-attune", issuer: "Wells Fargo", name: "Attune", shortName: "Wells Fargo Attune", brandStyle: { bg: "linear-gradient(135deg, #b02c37 0%, #8a202a 50%, #63151d 100%)", logo: "WELLS FARGO", accent: "#fff" }, defaultRewards: [{ category: "Entertainment", rate: 4 }, { category: "Dining", rate: 4 }, { category: "Everything else", rate: 1 }] },
  { id: "bilt", issuer: "Wells Fargo", name: "Bilt Mastercard", shortName: "Bilt Rewards", brandStyle: { bg: "linear-gradient(135deg, #1e1e1e 0%, #0e0e0e 50%, #000 100%)", logo: "BILT", accent: "#fff" }, defaultRewards: [{ category: "Rent", rate: 1 }, { category: "Dining", rate: 3 }, { category: "Travel", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "boa-customized", issuer: "Bank of America", name: "Customized Cash Rewards", shortName: "BoA Customized Cash", brandStyle: { bg: "linear-gradient(135deg, #be2e3a 0%, #941f28 50%, #6a141a 100%)", logo: "BANK OF AMERICA", accent: "#fff" }, defaultRewards: [{ category: "Choice", rate: 3 }, { category: "Groceries", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "boa-travel", issuer: "Bank of America", name: "Travel Rewards", shortName: "BoA Travel Rewards", brandStyle: { bg: "linear-gradient(135deg, #8c2029 0%, #62151c 50%, #3d0c11 100%)", logo: "BANK OF AMERICA", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 1.5 }] },
  { id: "boa-premium", issuer: "Bank of America", name: "Premium Rewards", shortName: "BoA Premium Rewards", brandStyle: { bg: "linear-gradient(135deg, #5c1015 0%, #3d0a0e 50%, #1f0607 100%)", logo: "BANK OF AMERICA", accent: "#d4a86a" }, defaultRewards: [{ category: "Travel", rate: 2 }, { category: "Dining", rate: 2 }, { category: "Everything else", rate: 1.5 }] },
  { id: "boa-unlimited", issuer: "Bank of America", name: "Unlimited Cash Rewards", shortName: "BoA Unlimited Cash", brandStyle: { bg: "linear-gradient(135deg, #a82632 0%, #801b25 50%, #551118 100%)", logo: "BANK OF AMERICA", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 1.5 }] },
  { id: "usbank-alt", issuer: "U.S. Bank", name: "Altitude Go", shortName: "US Bank Altitude Go", brandStyle: { bg: "linear-gradient(135deg, #1f4b8f 0%, #163866 50%, #0d2545 100%)", logo: "U.S. BANK", accent: "#fff" }, defaultRewards: [{ category: "Dining", rate: 4 }, { category: "Groceries", rate: 2 }, { category: "Gas", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "usbank-reserve", issuer: "U.S. Bank", name: "Altitude Reserve", shortName: "US Bank Altitude Reserve", brandStyle: { bg: "linear-gradient(135deg, #0e2448 0%, #081734 50%, #030a1d 100%)", logo: "U.S. BANK", accent: "#d4a86a" }, defaultRewards: [{ category: "Travel", rate: 3 }, { category: "Mobile wallet", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "usbank-cash-plus", issuer: "U.S. Bank", name: "Cash+ Visa", shortName: "US Bank Cash+", brandStyle: { bg: "linear-gradient(135deg, #2a5d9e 0%, #1d4477 50%, #11304f 100%)", logo: "U.S. BANK", accent: "#fff" }, defaultRewards: [{ category: "Choice", rate: 5 }, { category: "Choice 2", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "apple-card", issuer: "Apple", name: "Apple Card", shortName: "Apple Card", popular: true, brandStyle: { bg: "linear-gradient(135deg, #e8e9ec 0%, #c4c7cf 50%, #9ea2ad 100%)", logo: "", accent: "#1a1d24" }, defaultRewards: [{ category: "Shopping", rate: 3 }, { category: "Apple Pay", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "robinhood-gold", issuer: "Robinhood", name: "Gold Card", shortName: "Robinhood Gold Card", brandStyle: { bg: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #000 100%)", logo: "ROBINHOOD", accent: "#c2f570" }, defaultRewards: [{ category: "Everything", rate: 3 }] },
  { id: "sofi-credit", issuer: "SoFi", name: "Credit Card", shortName: "SoFi Credit Card", brandStyle: { bg: "linear-gradient(135deg, #0c1a2e 0%, #081122 50%, #030811 100%)", logo: "SOFI", accent: "#14e7d1" }, defaultRewards: [{ category: "Everything", rate: 2.2 }] },
  { id: "venmo-card", issuer: "Venmo", name: "Venmo Credit Card", shortName: "Venmo Credit Card", brandStyle: { bg: "linear-gradient(135deg, #008cff 0%, #006ccc 50%, #004f99 100%)", logo: "VENMO", accent: "#fff" }, defaultRewards: [{ category: "Top category", rate: 3 }, { category: "Second", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "paypal-cashback", issuer: "PayPal", name: "Cashback Mastercard", shortName: "PayPal Cashback", brandStyle: { bg: "linear-gradient(135deg, #003087 0%, #001f5c 50%, #00113a 100%)", logo: "PAYPAL", accent: "#009cde" }, defaultRewards: [{ category: "PayPal", rate: 3 }, { category: "Everything else", rate: 2 }] },
  { id: "fidelity-rewards", issuer: "Fidelity", name: "Rewards Visa", shortName: "Fidelity Rewards Visa", brandStyle: { bg: "linear-gradient(135deg, #0e5a2c 0%, #074020 50%, #032914 100%)", logo: "FIDELITY", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 2 }] },
  { id: "cashapp-card", issuer: "Cash App", name: "Cash Card", shortName: "Cash App Card", brandStyle: { bg: "linear-gradient(135deg, #00d632 0%, #009825 50%, #006818 100%)", logo: "CASH APP", accent: "#000" }, defaultRewards: [{ category: "Boosts", rate: 10 }, { category: "Everything else", rate: 0 }] },
  { id: "coinbase-card", issuer: "Coinbase", name: "Coinbase Card", shortName: "Coinbase Card", brandStyle: { bg: "linear-gradient(135deg, #0052ff 0%, #003ccc 50%, #002799 100%)", logo: "COINBASE", accent: "#fff" }, defaultRewards: [{ category: "Crypto rewards", rate: 4 }, { category: "Everything else", rate: 1 }] },
  { id: "target-redcard", issuer: "TD Bank", name: "Target RedCard", shortName: "Target RedCard", brandStyle: { bg: "linear-gradient(135deg, #cc0000 0%, #990000 50%, #660000 100%)", logo: "TARGET", accent: "#fff" }, defaultRewards: [{ category: "Shopping", rate: 5 }] },
  { id: "uber-visa", issuer: "Barclays", name: "Uber Visa", shortName: "Uber Credit Card", brandStyle: { bg: "linear-gradient(135deg, #000 0%, #0a0a0a 50%, #1a1a1a 100%)", logo: "UBER", accent: "#fff" }, defaultRewards: [{ category: "Travel", rate: 5 }, { category: "Dining", rate: 3 }, { category: "Hotels", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "jetblue-plus", issuer: "Barclays", name: "JetBlue Plus", shortName: "JetBlue Plus", brandStyle: { bg: "linear-gradient(135deg, #0f3a66 0%, #0a2848 50%, #051830 100%)", logo: "JETBLUE", accent: "#fff" }, defaultRewards: [{ category: "Travel", rate: 6 }, { category: "Dining", rate: 2 }, { category: "Groceries", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "aaa-daily", issuer: "Comenity", name: "AAA Daily Advantage", shortName: "AAA Daily Advantage", brandStyle: { bg: "linear-gradient(135deg, #c0142f 0%, #9a0e26 50%, #6a091c 100%)", logo: "AAA", accent: "#fff" }, defaultRewards: [{ category: "Groceries", rate: 5 }, { category: "Gas", rate: 3 }, { category: "Everything else", rate: 1 }] },
  { id: "pnc-cash", issuer: "PNC", name: "Cash Rewards Visa", shortName: "PNC Cash Rewards", brandStyle: { bg: "linear-gradient(135deg, #ff6600 0%, #cc5200 50%, #993d00 100%)", logo: "PNC", accent: "#fff" }, defaultRewards: [{ category: "Gas", rate: 4 }, { category: "Dining", rate: 3 }, { category: "Groceries", rate: 2 }, { category: "Everything else", rate: 1 }] },
  { id: "synchrony-premier", issuer: "Synchrony", name: "Premier World", shortName: "Synchrony Premier", brandStyle: { bg: "linear-gradient(135deg, #7a2e3f 0%, #5a2030 50%, #3a1420 100%)", logo: "SYNCHRONY", accent: "#fff" }, defaultRewards: [{ category: "Everything", rate: 2 }] },
];

// ==================== MERCHANT → TICKER ====================
const MERCHANT_LOOKUP = [
  { match: /apple\.com|apple store|itunes|app store|apple pay/i, ticker: "AAPL", category: "Shopping", confidence: 0.98 },
  { match: /amazon|amzn|whole foods/i, ticker: "AMZN", category: "Shopping", confidence: 0.98 },
  { match: /google|youtube premium|google storage|google one/i, ticker: "GOOG", category: "Subscriptions", confidence: 0.95 },
  { match: /microsoft|xbox|msft/i, ticker: "MSFT", category: "Subscriptions", confidence: 0.95 },
  { match: /meta|facebook|instagram ads/i, ticker: "META", category: "Subscriptions", confidence: 0.9 },
  { match: /netflix/i, ticker: "NFLX", category: "Streaming", confidence: 0.99 },
  { match: /spotify/i, ticker: "SPOT", category: "Streaming", confidence: 0.99 },
  { match: /disney\+|disney plus|hulu|espn\+/i, ticker: "DIS", category: "Streaming", confidence: 0.96 },
  { match: /paramount\+|paramount plus|cbs all/i, ticker: "PARA", category: "Streaming", confidence: 0.9 },
  { match: /warner|hbo max|max\.com|discovery\+/i, ticker: "WBD", category: "Streaming", confidence: 0.88 },
  { match: /peloton/i, ticker: "PTON", category: "Subscriptions", confidence: 0.97 },
  { match: /starbucks|sbux/i, ticker: "SBUX", category: "Dining", confidence: 0.99 },
  { match: /chipotle|cmg/i, ticker: "CMG", category: "Dining", confidence: 0.99 },
  { match: /mcdonald|mcd/i, ticker: "MCD", category: "Dining", confidence: 0.99 },
  { match: /domino|dpz/i, ticker: "DPZ", category: "Dining", confidence: 0.97 },
  { match: /dutch bros|bros\./i, ticker: "BROS", category: "Dining", confidence: 0.93 },
  { match: /yum|taco bell|pizza hut|kfc/i, ticker: "YUM", category: "Dining", confidence: 0.9 },
  { match: /cava/i, ticker: "CAVA", category: "Dining", confidence: 0.95 },
  { match: /shake shack|shak/i, ticker: "SHAK", category: "Dining", confidence: 0.95 },
  { match: /uber eats|ubereats/i, ticker: "UBER", category: "Dining", confidence: 0.98 },
  { match: /uber(?!\s*eats)|uber trip/i, ticker: "UBER", category: "Travel", confidence: 0.97 },
  { match: /lyft/i, ticker: "LYFT", category: "Travel", confidence: 0.97 },
  { match: /doordash|dash\b/i, ticker: "DASH", category: "Dining", confidence: 0.85 },
  { match: /grubhub/i, ticker: null, category: "Dining", confidence: 0.2 },
  { match: /instacart|cart\*/i, ticker: "CART", category: "Groceries", confidence: 0.85 },
  { match: /target|tgt/i, ticker: "TGT", category: "Shopping", confidence: 0.98 },
  { match: /costco/i, ticker: "COST", category: "Groceries", confidence: 0.99 },
  { match: /walmart|wm supercenter|wmt/i, ticker: "WMT", category: "Groceries", confidence: 0.96 },
  { match: /nike/i, ticker: "NKE", category: "Shopping", confidence: 0.98 },
  { match: /lululemon|lulu\b/i, ticker: "LULU", category: "Shopping", confidence: 0.97 },
  { match: /best buy|bby/i, ticker: "BBY", category: "Shopping", confidence: 0.97 },
  { match: /home depot|hd\b/i, ticker: "HD", category: "Shopping", confidence: 0.97 },
  { match: /lowes|lowe's/i, ticker: "LOW", category: "Shopping", confidence: 0.97 },
  { match: /tj maxx|tjmaxx|marshalls|home goods|homegoods/i, ticker: "TJX", category: "Shopping", confidence: 0.9 },
  { match: /ross stores|ross dress/i, ticker: "ROST", category: "Shopping", confidence: 0.92 },
  { match: /ulta\b/i, ticker: "ULTA", category: "Shopping", confidence: 0.95 },
  { match: /sephora/i, ticker: null, category: "Shopping", confidence: 0.3 },
  { match: /hilton|hlt\b/i, ticker: "HLT", category: "Hotels", confidence: 0.96 },
  { match: /marriott|mar\b/i, ticker: "MAR", category: "Hotels", confidence: 0.96 },
  { match: /hyatt/i, ticker: "H", category: "Hotels", confidence: 0.93 },
  { match: /airbnb/i, ticker: "ABNB", category: "Hotels", confidence: 0.97 },
  { match: /booking\.com/i, ticker: "BKNG", category: "Hotels", confidence: 0.95 },
  { match: /expedia/i, ticker: "EXPE", category: "Travel", confidence: 0.95 },
  { match: /delta\b|delta air/i, ticker: "DAL", category: "Travel", confidence: 0.97 },
  { match: /united airlines|united air/i, ticker: "UAL", category: "Travel", confidence: 0.97 },
  { match: /american air|aa\.com/i, ticker: "AAL", category: "Travel", confidence: 0.95 },
  { match: /southwest|swa\b/i, ticker: "LUV", category: "Travel", confidence: 0.95 },
  { match: /jetblue/i, ticker: "JBLU", category: "Travel", confidence: 0.96 },
  { match: /alaska air/i, ticker: "ALK", category: "Travel", confidence: 0.95 },
  { match: /chevron/i, ticker: "CVX", category: "Gas", confidence: 0.95 },
  { match: /exxon|mobil\b/i, ticker: "XOM", category: "Gas", confidence: 0.95 },
  { match: /shell oil|shell gas/i, ticker: "SHEL", category: "Gas", confidence: 0.9 },
  { match: /paypal(?!.*donate)/i, ticker: "PYPL", category: "Shopping", confidence: 0.8 },
  { match: /coinbase/i, ticker: "COIN", category: "Shopping", confidence: 0.9 },
  { match: /robinhood/i, ticker: "HOOD", category: "Shopping", confidence: 0.9 },
];

const lookupMerchant = (desc) => {
  for (const entry of MERCHANT_LOOKUP) {
    if (entry.match.test(desc)) {
      return { ticker: entry.ticker, category: entry.category, confidence: entry.confidence };
    }
  }
  return null;
};

const suggestTickers = (desc) => {
  const d = desc.toLowerCase();
  const buckets = [];
  if (/food|eat|restaurant|grill|cafe|diner/i.test(d)) buckets.push("CMG", "SBUX", "MCD");
  if (/delivery|online|order/i.test(d)) buckets.push("DASH", "UBER");
  if (/beauty|cosmetic|salon/i.test(d)) buckets.push("ULTA", "EL");
  if (/fit|gym|athletic|sport/i.test(d)) buckets.push("LULU", "NKE", "PTON");
  if (/stream|music|tv/i.test(d)) buckets.push("NFLX", "SPOT", "DIS");
  if (/travel|trip|tour/i.test(d)) buckets.push("BKNG", "EXPE", "ABNB");
  if (buckets.length === 0) buckets.push("AMZN", "AAPL", "WMT");
  return Array.from(new Set(buckets)).slice(0, 3);
};

const BRAND_COLORS = {
  AAPL: "#1d1d1f", AMZN: "#ff9900", SBUX: "#006241", COST: "#e31837",
  NKE: "#fa5400", CMG: "#ac2318", TGT: "#cc0000", UBER: "#000000",
  DIS: "#113366", GOOG: "#4285f4", META: "#1877f2", WMT: "#0071ce",
  MCD: "#ffc72c", SPOT: "#1db954", NFLX: "#e50914", MSFT: "#00a4ef",
  HLT: "#104c97", MAR: "#a50034", DAL: "#c8102e", PTON: "#000000",
  DASH: "#ef3340", LYFT: "#ff00bf", LULU: "#d71921", ABNB: "#ff5a5f",
  CAVA: "#c0392b", SHAK: "#46b749", BROS: "#1473c6", CART: "#43b02a",
  BBY: "#0046be", HD: "#f96302", LOW: "#004990", TJX: "#e1261d",
  ROST: "#e32630", ULTA: "#e82f7d", BKNG: "#003580", EXPE: "#ffc72c",
  UAL: "#002244", AAL: "#c8102e", LUV: "#304cb2", JBLU: "#0f3a66", ALK: "#005977",
  CVX: "#0054a4", XOM: "#ff0000", SHEL: "#ffcb05",
  PYPL: "#003087", COIN: "#0052ff", HOOD: "#00c805",
  DPZ: "#006491", YUM: "#c8102e", PARA: "#0064ff", WBD: "#000000", H: "#002150",
};
const getBrandColor = (ticker) => BRAND_COLORS[ticker] || "#d9b368";

// Pick readable text color for a hex background using luminance
const readableTextColor = (hex) => {
  const h = (hex || "#888").replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) || 100;
  const g = parseInt(h.slice(2, 4), 16) || 100;
  const b = parseInt(h.slice(4, 6), 16) || 100;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 140 ? "#111" : "#fff";
};

// Small illustrated credit card used on the "Add card" buttons.
// `variant` controls the accent band color: 'catalog' = white on accent bg, 'custom' = accent on bg.
const MiniCardIllustration = ({ variant = "catalog" }) => {
  const isCatalog = variant === "catalog";
  const bodyFill = isCatalog ? "rgba(255,255,255,0.18)" : "var(--bg-2)";
  const stripeFill = isCatalog ? "rgba(255,255,255,0.35)" : "var(--accent)";
  const chipFill = isCatalog ? "rgba(255,255,255,0.9)" : "var(--gold)";
  const dotFill = isCatalog ? "rgba(255,255,255,0.6)" : "var(--text-3)";
  const borderFill = isCatalog ? "rgba(255,255,255,0.5)" : "var(--border-strong)";
  return (
    <svg viewBox="0 0 70 44" width="70" height="44" style={{ display: "block" }}>
      <rect x="1" y="1" width="68" height="42" rx="6" fill={bodyFill} stroke={borderFill} strokeWidth="1" />
      <rect x="6" y="16" width="10" height="8" rx="1.5" fill={chipFill} />
      <rect x="1" y="8" width="68" height="5" fill={stripeFill} />
      <circle cx="58" cy="31" r="4" fill={dotFill} opacity="0.9" />
      <circle cx="63" cy="31" r="4" fill={dotFill} opacity="0.5" />
    </svg>
  );
};

// Merchant brand tile: first letter of merchant name on their brand color (falls back to ticker color)
const BrandTile = ({ merchant, ticker, size = 40 }) => {
  const color = getBrandColor(ticker);
  const letter = (merchant || ticker || "?").trim().charAt(0).toUpperCase();
  const textColor = readableTextColor(color);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.3,
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: textColor,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: size * 0.46, fontWeight: 800, letterSpacing: "-0.03em",
      flexShrink: 0,
      boxShadow: `0 4px 10px ${color}33`,
    }}>{letter}</div>
  );
};

const SHUFFLE_COLORS = [
  "#e31837", "#c4c7cf", "#ff9900", "#006241", "#fa5400",
  "#cc0000", "#ac2318", "#1877f2", "#1db954", "#d9b368",
];

const STORAGE_KEY = "stockback-state-v1";
const loadPersistedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.isDemoMode) return null;
    return parsed;
  } catch { return null; }
};

// ==================== DEMO DATA ====================
const DEMO_FLIPS = [
  { id: "d1", ticker: "AAPL", merchant: "Apple Store", category: "Shopping", cardId: "apple-card", confidence: 0.98,
    purchases: [{ date: "Mar 03", desc: "APPLE.COM/BILL", amount: 19.99 }, { date: "Mar 11", desc: "APPLE STORE #R234", amount: 1299.00 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d2", ticker: "AMZN", merchant: "Amazon", category: "Shopping", cardId: "chase-freedom-u", confidence: 0.99,
    purchases: [{ date: "Mar 02", desc: "AMZN MKTPLACE", amount: 43.21 }, { date: "Mar 07", desc: "AMAZON PRIME", amount: 14.99 }, { date: "Mar 14", desc: "AMZN MKTPLACE", amount: 287.40 }, { date: "Mar 22", desc: "AMAZON.COM", amount: 501.72 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d3", ticker: "SBUX", merchant: "Starbucks", category: "Dining", cardId: "amex-gold", confidence: 0.99,
    purchases: [{ date: "Mar 04", desc: "STARBUCKS #44812", amount: 8.75 }, { date: "Mar 09", desc: "STARBUCKS #44812", amount: 12.40 }, { date: "Mar 13", desc: "STARBUCKS #22045", amount: 9.65 }, { date: "Mar 18", desc: "STARBUCKS #44812", amount: 11.20 }, { date: "Mar 24", desc: "STARBUCKS #44812", amount: 10.50 }, { date: "Mar 27", desc: "STARBUCKS #44812", amount: 8.75 }, { date: "Mar 30", desc: "STARBUCKS APP RELOAD", amount: 63.55 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d4", ticker: "COST", merchant: "Costco Wholesale", category: "Groceries", cardId: "amex-blue", confidence: 0.98,
    purchases: [{ date: "Mar 06", desc: "COSTCO WHSE #0412", amount: 212.33 }, { date: "Mar 20", desc: "COSTCO WHSE #0412", amount: 200.22 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d5", ticker: "NKE", merchant: "Nike", category: "Shopping", cardId: "citi-double", confidence: 0.96,
    purchases: [{ date: "Mar 15", desc: "NIKE.COM", amount: 289.00 }], flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d6", ticker: "CMG", merchant: "Chipotle", category: "Dining", cardId: "amex-gold", confidence: 0.99,
    purchases: [{ date: "Mar 05", desc: "CHIPOTLE #1021", amount: 17.40 }, { date: "Mar 12", desc: "CHIPOTLE #1021", amount: 18.90 }, { date: "Mar 19", desc: "CHIPOTLE #2204", amount: 16.50 }, { date: "Mar 26", desc: "CHIPOTLE #1021", amount: 16.80 }, { date: "Mar 31", desc: "CHIPOTLE #1021", amount: 16.80 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d7", ticker: "SPOT", merchant: "Spotify", category: "Streaming", cardId: "amex-blue", confidence: 0.99,
    purchases: [{ date: "Mar 05", desc: "SPOTIFY PREMIUM", amount: 11.99 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d8", ticker: "NFLX", merchant: "Netflix", category: "Streaming", cardId: "amex-blue", confidence: 0.99,
    purchases: [{ date: "Mar 14", desc: "NETFLIX.COM", amount: 22.99 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
  { id: "d9", ticker: "UBER", merchant: "Uber", category: "Travel", cardId: "chase-sapphire-p", confidence: 0.96,
    purchases: [{ date: "Mar 02", desc: "UBER TRIP", amount: 24.50 }, { date: "Mar 10", desc: "UBER TRIP", amount: 31.20 }, { date: "Mar 25", desc: "UBER TRIP", amount: 48.00 }, { date: "Mar 28", desc: "UBER TRIP", amount: 40.00 }],
    flipped: false, done: false, statementId: "stmt-2026-03" },
];

const DEMO_UNASSIGNED = [
  { id: "u1", merchant: "SQ *MERCHANT ABC", rawDesc: "SQ *MERCHANT ABC #42", category: "Shopping", amount: 28.40, date: "Mar 17", cardId: "amex-gold", statementId: "stmt-2026-03", confidence: 0.2, suggestions: ["AMZN", "AAPL", "WMT"] },
  { id: "u2", merchant: "WWW.SP*SHOPFRONT", rawDesc: "WWW.SP*SHOPFRONT 888-88", category: "Shopping", amount: 86.15, date: "Mar 22", cardId: "chase-freedom-u", statementId: "stmt-2026-03", confidence: 0.3, suggestions: ["SHOP", "AMZN", "ETSY"] },
];

const DEMO_PORTFOLIO = [
  { ticker: "AAPL", currentPrice: 243.8, dayChangePct: 1.24, dayChangeDollar: 2.14,
    buys: [
      { date: "Oct 12, 2025", pricePerShare: 195.4, cashbackAmount: 42.20, cardId: "apple-card", category: "Shopping", rate: 3 },
      { date: "Dec 08, 2025", pricePerShare: 208.3, cashbackAmount: 38.50, cardId: "apple-card", category: "Shopping", rate: 3 },
      { date: "Feb 14, 2026", pricePerShare: 221.5, cashbackAmount: 76.12, cardId: "apple-card", category: "Shopping", rate: 3 },
    ] },
  { ticker: "AMZN", currentPrice: 186.8, dayChangePct: 0.48, dayChangeDollar: 0.49,
    buys: [
      { date: "Nov 20, 2025", pricePerShare: 165.4, cashbackAmount: 32.80, cardId: "chase-freedom-u", category: "Shopping", rate: 1.5 },
      { date: "Feb 14, 2026", pricePerShare: 178.2, cashbackAmount: 65.53, cardId: "chase-freedom-u", category: "Shopping", rate: 1.5 },
    ] },
  { ticker: "SBUX", currentPrice: 91.85, dayChangePct: -0.62, dayChangeDollar: -0.25,
    buys: [{ date: "Jan 20, 2026", pricePerShare: 94.6, cashbackAmount: 42.10, cardId: "amex-gold", category: "Dining", rate: 4 }] },
  { ticker: "COST", currentPrice: 1010.7, dayChangePct: 0.92, dayChangeDollar: 2.14,
    buys: [
      { date: "Oct 28, 2025", pricePerShare: 875.2, cashbackAmount: 82.40, cardId: "amex-blue", category: "Groceries", rate: 6 },
      { date: "Jan 20, 2026", pricePerShare: 912.4, cashbackAmount: 129.50, cardId: "amex-blue", category: "Groceries", rate: 6 },
    ] },
  { ticker: "NKE", currentPrice: 71.1, dayChangePct: -1.85, dayChangeDollar: -1.13,
    buys: [{ date: "Dec 12, 2025", pricePerShare: 78.4, cashbackAmount: 67.50, cardId: "citi-double", category: "Everything", rate: 2 }] },
];

// ==================== UTILITIES ====================
const sumPurchases = (d) => d.purchases.reduce((a, b) => a + b.amount, 0);

const rateForCategory = (card, category) => {
  if (!card?.rewards || card.rewards.length === 0) return 1;
  const exact = card.rewards.find((r) => r.category.toLowerCase() === category.toLowerCase());
  if (exact) return exact.rate;
  const catLower = category.toLowerCase();
  const partial = card.rewards.find((r) => {
    const rLower = r.category.toLowerCase();
    if (rLower.length < 4 || catLower.length < 4) return false;
    return rLower.includes(catLower) || catLower.includes(rLower);
  });
  if (partial) return partial.rate;
  const fb = card.rewards.find((r) => /everything|all|flat/i.test(r.category));
  return fb ? fb.rate : 1;
};

const cashbackFor = (d, cardsMap) => {
  const card = cardsMap[d.cardId];
  if (!card) return sumPurchases(d) * 0.01;
  return sumPurchases(d) * (rateForCategory(card, d.category) / 100);
};

const seededRand = (seed) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x); };

const deriveHoldingStats = (h) => {
  const totalInvested = h.buys.reduce((a, b) => a + b.cashbackAmount, 0);
  const shares = h.buys.reduce((a, b) => a + (b.cashbackAmount / b.pricePerShare), 0);
  const avgPrice = shares > 0 ? totalInvested / shares : 0;
  const currentValue = shares * h.currentPrice;
  const gain = currentValue - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
  const firstBuy = h.buys[0];
  return { totalInvested, shares, avgPrice, currentValue, gain, gainPct, firstBuyDate: firstBuy?.date || "—", firstBuyPrice: firstBuy?.pricePerShare || 0 };
};

const computeMerchantSpending = (flips) => {
  const map = {};
  flips.forEach((f) => { map[f.ticker] = (map[f.ticker] || 0) + sumPurchases(f); });
  return map;
};

const deriveStatements = (flips, unassigned) => {
  const stmtMap = {};
  [...flips, ...unassigned].forEach((item) => {
    if (!item.statementId) return;
    if (!stmtMap[item.statementId]) {
      stmtMap[item.statementId] = { id: item.statementId, cardId: item.cardId, purchaseCount: 0 };
    }
    const count = (item.purchases?.length || 1);
    stmtMap[item.statementId].purchaseCount += count;
  });
  return Object.values(stmtMap).map((s) => {
    const m = s.id.match(/stmt-(\d{4})-(\d{2})/);
    let month = s.id, uploadedAt = "—";
    if (m) {
      const [, yr, mo] = m;
      const dateObj = new Date(parseInt(yr), parseInt(mo) - 1);
      month = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const upDate = new Date(parseInt(yr), parseInt(mo), 3);
      uploadedAt = upDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }
    return { ...s, month, uploadedAt };
  }).sort((a, b) => b.id.localeCompare(a.id));
};

// ==================== BROKERS ====================
const BROKER_PRESETS = [
  { id: "yahoo", name: "Yahoo Finance", connectable: false, url: (t) => `https://finance.yahoo.com/quote/${t}/` },
  { id: "ibkr", name: "Interactive Brokers", connectable: true, url: (t) => `https://www.interactivebrokers.com/portal/#/quote/${t}` },
  { id: "robinhood", name: "Robinhood", connectable: true, url: (t) => `https://robinhood.com/stocks/${t}` },
  { id: "alpaca", name: "Alpaca", connectable: true, url: (t) => `https://app.alpaca.markets/paper/dashboard/overview` },
  { id: "fidelity", name: "Fidelity", connectable: false, url: (t) => `https://digital.fidelity.com/prgw/digital/research/quote/dashboard/summary?symbol=${t}` },
  { id: "schwab", name: "Charles Schwab", connectable: false, url: (t) => `https://client.schwab.com/app/research/#/stocks/${t}` },
  { id: "sofi", name: "SoFi Invest", connectable: false, url: (t) => `https://www.sofi.com/invest/stocks/${t}/` },
  { id: "public", name: "Public", connectable: true, url: (t) => `https://public.com/stocks/${t}` },
  { id: "webull", name: "Webull", connectable: true, url: (t) => `https://www.webull.com/quote/nasdaq-${t.toLowerCase()}` },
  { id: "cashapp", name: "Cash App Investing", connectable: true, url: (t) => `https://cash.app/investing/stocks/${t}` },
  { id: "merrill", name: "Merrill Edge", connectable: false, url: (t) => `https://www.ml.com/research/quote.html?symbol=${t}` },
  { id: "etrade", name: "E*TRADE", connectable: true, url: (t) => `https://us.etrade.com/etx/mkt/quotes?symbol=${t}` },
  { id: "tastytrade", name: "tastytrade", connectable: true, url: (t) => `https://trade.tastytrade.com/index.html#/quote/${t}` },
  { id: "coinbase", name: "Coinbase", connectable: true, url: (t) => `https://www.coinbase.com/price/${t.toLowerCase()}` },
];

// Broker visual identities: primary color + 1-2 letter monogram
const BROKER_BRAND = {
  yahoo:      { color: "#720e9e", mono: "Y!",  textColor: "#fff" },
  ibkr:       { color: "#d81b0c", mono: "IB",  textColor: "#fff" },
  robinhood:  { color: "#00c805", mono: "RH",  textColor: "#000" },
  alpaca:     { color: "#ffd43b", mono: "AL",  textColor: "#000" },
  fidelity:   { color: "#368727", mono: "F",   textColor: "#fff" },
  schwab:     { color: "#00a0df", mono: "CS",  textColor: "#fff" },
  sofi:       { color: "#0046d1", mono: "SF",  textColor: "#fff" },
  public:     { color: "#000000", mono: "P",   textColor: "#fff" },
  webull:     { color: "#0043e9", mono: "W",   textColor: "#fff" },
  cashapp:    { color: "#00d632", mono: "$",   textColor: "#000" },
  merrill:    { color: "#6d2f1f", mono: "ME",  textColor: "#fff" },
  etrade:     { color: "#6633cc", mono: "E*",  textColor: "#fff" },
  tastytrade: { color: "#ff6b00", mono: "tt",  textColor: "#fff" },
  coinbase:   { color: "#0052ff", mono: "CB",  textColor: "#fff" },
};

const BrokerLogo = ({ brokerId, size = 36 }) => {
  const brand = BROKER_BRAND[brokerId] || { color: "#555", mono: (brokerId || "?").slice(0, 2).toUpperCase(), textColor: "#fff" };
  const fontSize = brand.mono.length >= 3 ? size * 0.26 : brand.mono.length === 2 ? size * 0.36 : size * 0.48;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: brand.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: brand.textColor,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize, fontWeight: 800, letterSpacing: "-0.04em",
      flexShrink: 0,
      boxShadow: `0 4px 10px ${brand.color}44`,
    }}>{brand.mono}</div>
  );
};

const REDEMPTION_TYPES = {
  cash:   { label: "Cash",                value: 1.00, note: "direct statement credit" },
  MR:     { label: "Amex Points (MR)",    value: 1.00, note: "1¢ baseline, up to 2¢ via partners" },
  UR:     { label: "Chase Points (UR)",   value: 1.00, note: "1¢ cash, 1.25¢ w/ Sapphire Preferred" },
  URplus: { label: "Chase UR (Sapphire)", value: 1.25, note: "worth 25% more at redemption" },
  TY:     { label: "Citi ThankYou",       value: 1.00, note: "1¢ baseline" },
  miles:  { label: "Travel Miles",        value: 1.00, note: "1¢ baseline, up to 1.5¢ via transfer" },
  crypto: { label: "Crypto Rewards",      value: 1.00, note: "paid in crypto at market rate" },
};

const inferRedemption = (card) => {
  const key = (card.id || "").toLowerCase();
  if (key.startsWith("amex-gold") || key.startsWith("amex-plat") || key.startsWith("amex-green") || key.startsWith("amex-biz") || key.startsWith("delta-") || key.startsWith("hilton-") || key.startsWith("marriott-brilliant")) return "MR";
  if (key === "chase-sapphire-p" || key === "chase-sapphire-r") return "URplus";
  if (key.startsWith("chase-") || key.startsWith("united-") || key.startsWith("southwest-") || key.startsWith("marriott-") || key.startsWith("ihg-")) return "UR";
  if (key === "citi-premier" || key === "citi-custom" || key === "citi-strata") return "TY";
  if (key.startsWith("capital-venture") || key === "aa-aviator" || key === "aa-executive" || key === "uber-visa" || key === "jetblue-plus") return "miles";
  if (key === "coinbase-card") return "crypto";
  return "cash";
};

const collectSeededCardIds = (flips, portfolio, unassigned) => {
  const ids = new Set();
  flips.forEach((f) => f.cardId && ids.add(f.cardId));
  unassigned.forEach((u) => u.cardId && ids.add(u.cardId));
  portfolio.forEach((h) => h.buys.forEach((b) => b.cardId && ids.add(b.cardId)));
  return Array.from(ids);
};
const cardFromCatalog = (cardId) => {
  const c = CARD_CATALOG.find((x) => x.id === cardId);
  return c ? { ...c, rewards: [...c.defaultRewards] } : null;
};

// Seed prices used only for pre-loaded DEMO flips so the demo experience works without a network.
// User-initiated assignments never use this — they go through resolveTicker() → Yahoo.
const TICKER_PRICE_ESTIMATE = {
  AAPL: 243.8, AMZN: 186.8, SBUX: 91.85, COST: 1010.7, NKE: 71.1,
  CMG: 54.2, TGT: 145.3, UBER: 82.4, DIS: 112.5, MCD: 298.7,
  SPOT: 540.2, NFLX: 968.4, HLT: 262.1, MAR: 278.5, DAL: 62.8,
  DASH: 186.2, PTON: 7.4, GOOG: 182.6, META: 618.3, WMT: 95.5,
  MSFT: 438.2, V: 322.1, MA: 522.8, JPM: 266.4,
  BKNG: 4820, ABNB: 132.4, EXPE: 175.3, H: 156.2,
  UAL: 97.8, AAL: 14.2, LUV: 32.1, JBLU: 6.8, ALK: 61.5,
  CVX: 158.2, XOM: 118.4, SHEL: 68.7, HOOD: 42.5, COIN: 273.1,
  LULU: 305.2, BBY: 87.4, HD: 412.8, LOW: 266.1, TJX: 122.5, ROST: 152.3, ULTA: 380.4,
  CART: 46.8, LYFT: 17.2, DPZ: 468.2, YUM: 135.1, CAVA: 122.8, SHAK: 138.4, BROS: 84.2, PYPL: 79.8,
  PARA: 12.4, WBD: 10.8,
};
const seedPriceFor = (t) => TICKER_PRICE_ESTIMATE[t] || null;

// In-memory cache so we only hit Yahoo once per ticker per session.
const _priceCache = {};
// In-memory cache for merchant-name → Yahoo search results within a session.
const _searchCache = {};

const MANUAL_FLIP_CATEGORIES = [
  "Dining / Restaurants",
  "Groceries",
  "Gas",
  "Travel (flights, hotels)",
  "Transit (rideshare, subway, parking)",
  "Streaming",
  "Entertainment (concerts, events)",
  "Online shopping",
  "Department stores",
  "Drugstores",
  "Wholesale clubs (Costco, Sam's)",
  "Utilities",
  "Phone / Internet",
  "Fitness",
  "Subscriptions",
  "Everything else",
];

// Attempt to fetch real quote from Yahoo Finance. CORS may block this in some environments —
// we return null on any failure (never fabricate).
async function fetchYahooQuote(ticker) {
  const key = (ticker || "").toUpperCase().trim();
  if (!key) return null;
  if (_priceCache[key] !== undefined) return _priceCache[key];
  try {
    const res = await fetch(`/api/yahoo?endpoint=chart&q=${encodeURIComponent(key)}`);
    if (res.ok) {
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      if (meta && typeof meta.regularMarketPrice === "number") {
        const out = {
          ticker: key,
          name: meta.longName || meta.shortName || key,
          price: +meta.regularMarketPrice.toFixed(2),
          prevClose: +(meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice).toFixed(2),
          currency: meta.currency || "USD",
        };
        _priceCache[key] = out;
        return out;
      }
    }
  } catch (_) { /* fall through */ }
  _priceCache[key] = null;
  return null;
}

// Resolve a free-text query (ticker symbol OR merchant/company name) via Yahoo search.
// Returns {ticker, name, price, ...} or null. Never fabricates.
async function resolveTicker(query) {
  const q = (query || "").trim();
  if (!q) return null;
  const upper = q.toUpperCase();
  // First: try it as an exact ticker.
  const direct = await fetchYahooQuote(upper);
  if (direct) return direct;
  // Second: try Yahoo search-autocomplete to map a company name to a ticker.
  try {
    const res = await fetch(`/api/yahoo?endpoint=search&q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      const hit = (data?.quotes || []).find((h) => h?.symbol && (h.quoteType === "EQUITY" || h.quoteType === "ETF"));
      if (hit?.symbol) {
        const resolved = await fetchYahooQuote(hit.symbol);
        if (resolved) return resolved;
      }
    }
  } catch (_) { /* fall through */ }
  return null;
}

const driftPrices = (portfolio) => portfolio.map((h) => {
  const delta = (Math.random() - 0.5) * 0.006;
  return { ...h, currentPrice: +(h.currentPrice * (1 + delta)).toFixed(2) };
});

// ==================== SHARED SMALL COMPONENTS ====================
const RedemptionBadge = ({ card, size = "sm" }) => {
  const [showInfo, setShowInfo] = useState(false);
  if (!card) return null;
  const type = inferRedemption(card);
  if (type === "cash") return null;
  const info = REDEMPTION_TYPES[type];
  const isSmall = size === "sm";
  return (
    <>
      <button onClick={(e) => { e.stopPropagation(); setShowInfo(true); }} style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        padding: isSmall ? "1px 6px" : "2px 8px",
        background: "rgba(217, 179, 104, 0.14)",
        border: "1px solid rgba(217, 179, 104, 0.35)",
        borderRadius: 999,
        fontSize: isSmall ? 8.5 : 10, fontWeight: 700,
        color: "var(--gold)", letterSpacing: "0.02em", whiteSpace: "nowrap",
        cursor: "pointer", fontFamily: "inherit",
      }}>
        <Award size={isSmall ? 8 : 9} />
        {type === "URplus" ? "UR+" : type}
      </button>
      {showInfo && (
        <RedemptionInfoSheet type={type} info={info} card={card} onClose={() => setShowInfo(false)} />
      )}
    </>
  );
};

const RedemptionInfoSheet = ({ type, info, card, onClose }) => {
  const allTypes = [
    { code: "MR",     label: "Amex Membership Rewards", baseline: "1¢ per point",   upside: "Up to 2¢ via airline/hotel transfer partners (ANA, Hyatt)" },
    { code: "UR",     label: "Chase Ultimate Rewards",  baseline: "1¢ cash back",   upside: "1.25¢ via Sapphire Preferred travel portal" },
    { code: "UR+",    label: "Chase UR (Reserve)",      baseline: "1.5¢ travel portal", upside: "Up to 2¢+ via Hyatt, United, and airline transfers" },
    { code: "TY",     label: "Citi ThankYou Points",    baseline: "1¢ baseline",    upside: "Higher value via select airline transfer partners" },
    { code: "Miles",  label: "Travel Miles",            baseline: "1¢ baseline",    upside: "Up to 1.5¢+ on sweet-spot award redemptions" },
    { code: "Crypto", label: "Crypto Rewards",          baseline: "Paid in crypto", upside: "Value tracks crypto market, not a fixed cent value" },
  ];
  const currentCode = type === "URplus" ? "UR+" : type;
  return (
    <BottomSheet onClose={onClose} title={`${currentCode} — ${info.label}`}>
      <div style={{ padding: "16px 22px 24px" }}>
        <div style={{
          padding: "16px 16px", borderRadius: 14, marginBottom: 14,
          background: "linear-gradient(135deg, rgba(217, 179, 104, 0.18) 0%, rgba(217, 179, 104, 0.06) 100%)",
          border: "1px solid rgba(217, 179, 104, 0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              padding: "4px 10px", borderRadius: 999,
              background: "var(--gold)", color: "#1a1a1a",
              fontSize: 12, fontWeight: 800, letterSpacing: "0.03em",
            }}>{currentCode}</div>
            <div style={{ fontSize: 13.5, color: "var(--text-1)", fontWeight: 600 }}>{info.label}</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
            Earned on your <b style={{ color: "var(--text-1)" }}>{card?.shortName || card?.name || "card"}</b>. Stockback converts each point to its cash-floor value before placing your flip.
          </div>
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          All redemption types
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allTypes.map((r) => {
            const isCurrent = r.code === currentCode;
            return (
              <div key={r.code} style={{
                padding: "10px 12px", borderRadius: 11,
                background: isCurrent ? "rgba(217, 179, 104, 0.1)" : "var(--bg-1)",
                border: isCurrent ? "1px solid var(--gold)" : "1px solid var(--border)",
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 999,
                  background: isCurrent ? "var(--gold)" : "rgba(217, 179, 104, 0.15)",
                  color: isCurrent ? "#1a1a1a" : "var(--gold)",
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.03em",
                  flexShrink: 0, minWidth: 46, textAlign: "center",
                }}>{r.code}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 2, lineHeight: 1.4 }}>
                    <b>{r.baseline}</b> · {r.upside}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 14, padding: "10px 12px", borderRadius: 10,
          background: "var(--bg-1)", fontSize: 10.5, color: "var(--text-3)", lineHeight: 1.5,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <Info size={11} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>Stockback always shows the <b style={{ color: "var(--text-1)" }}>conservative cash floor</b>. Actual redemption value may be higher if you transfer points strategically.</div>
        </div>
      </div>
    </BottomSheet>
  );
};

const RedemptionExplainer = ({ card }) => {
  if (!card) return null;
  const type = inferRedemption(card);
  if (type === "cash") return null;
  const info = REDEMPTION_TYPES[type];
  return (
    <div style={{
      fontSize: 10, color: "var(--text-3)", lineHeight: 1.4, marginTop: 4,
      display: "flex", alignItems: "flex-start", gap: 4,
    }}>
      <Info size={9} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>Paid as <b style={{ color: "var(--gold)" }}>{info.label}</b> — {info.note}. Cash value shown.</span>
    </div>
  );
};

const DemoPill = ({ tooltip }) => (
  <span className="demo-pill" title={tooltip || "Simulated in this demo"}>
    <EyeOff size={8} strokeWidth={2.5} /> Demo
  </span>
);

const TickerBadge = ({ ticker, size = 44, radius = 13, showCopyHint = false, onClick }) => {
  const [copied, setCopied] = useState(false);
  const [hovering, setHovering] = useState(false);
  const handle = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(ticker).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    if (onClick) onClick(e);
  };
  const color = getBrandColor(ticker);
  const fontSize = ticker.length >= 5 ? size * 0.22 : ticker.length >= 4 ? size * 0.26 : size * 0.3;
  return (
    <button
      onClick={handle}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      title={`Tap to copy ${ticker}`}
      style={{
        width: size, height: size, borderRadius: radius,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize, fontWeight: 700, color: "#ffffff",
        letterSpacing: "-0.03em", flexShrink: 0,
        boxShadow: `0 4px 12px ${color}44`,
        border: "none", cursor: "pointer", padding: 0,
        position: "relative", overflow: "hidden",
        transition: "transform 0.15s",
      }}>
      {copied ? <Check size={size * 0.4} color="#fff" strokeWidth={3} /> : ticker}
      {(hovering || showCopyHint) && !copied && (
        <div style={{
          position: "absolute", bottom: 2, right: 2,
          width: size * 0.3, height: size * 0.3, borderRadius: 999,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Copy size={size * 0.18} color="#fff" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
};

// ==================== LOGO ====================
const StockbackLogo = ({ size = 40, color }) => {
  const lineColor = color || "var(--green)";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id={`cardGrad-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`chartFill-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(6, 20) rotate(-6 26 14)">
        <rect x="0" y="0" width="52" height="32" rx="5" fill={`url(#cardGrad-${size})`} />
        <rect x="5" y="7" width="7" height="5.5" rx="1" fill="var(--gold)" opacity="0.9" />
        <rect x="5" y="22" width="24" height="1.5" rx="0.5" fill="#fff" opacity="0.3" />
        <rect x="5" y="25" width="14" height="1.2" rx="0.5" fill="#fff" opacity="0.25" />
      </g>
      <path d="M4 52 L14 44 L22 48 L32 36 L42 40 L56 14"
            stroke={lineColor} strokeWidth="3" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 52 L14 44 L22 48 L32 36 L42 40 L56 14 L56 58 L4 58 Z"
            fill={`url(#chartFill-${size})`} opacity="0.8" />
      <path d="M56 14 L48 14 M56 14 L56 22"
            stroke={lineColor} strokeWidth="3" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="55" cy="9" r="4" fill={lineColor} />
      <text x="55" y="11.5" fontSize="5.5" fontWeight="800" fill="#fff"
            fontFamily="'Plus Jakarta Sans', sans-serif" textAnchor="middle">$</text>
    </svg>
  );
};

// ==================== TICKER BANNER ====================
const TickerBanner = ({ items }) => {
  if (!items || !items.length) return null;
  const content = [...items, ...items]; // doubled for seamless scroll loop
  const NYSE_MUTED = "#888888", NYSE_YELLOW = "#ffd740";
  return (
    <div style={{
      background: "#000000", borderBottom: "1px solid #222",
      overflow: "hidden", position: "relative", padding: "9px 0 8px",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 5, left: 14,
        fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em",
        color: NYSE_YELLOW, display: "flex", alignItems: "center", gap: 6,
        zIndex: 2, textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 999, background: NYSE_YELLOW }} />
        NYSE
      </div>
      <div className="ticker-track" style={{
        display: "flex", gap: 28, whiteSpace: "nowrap",
        marginTop: 14, width: "max-content",
      }}>
        {content.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5,
            fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "#ffffff", fontWeight: 700 }}>{it.ticker}</span>
            {Number.isFinite(it.amount) && it.amount > 0 && (
              <span style={{ color: "#c4c4c4", fontSize: 11 }}>${it.amount.toFixed(2)}</span>
            )}
            {Number.isFinite(it.change) && (
              <span style={{ color: NYSE_MUTED, fontSize: 10.5, fontWeight: 600 }}>
                {it.change >= 0 ? "▲" : "▼"} {Math.abs(it.change).toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== SHELL ====================
// Theme fills the entire viewport. 420px column of content, no rounded frame, no gradient.
const Shell = ({ children, showTicker, tickerItems, activeTab, onTabChange, showNav, onOpenSettings, settingsActive }) => (
  <div className="sb-root" style={{
    minHeight: "100vh",
    background: "var(--bg-0)",
    display: "flex", justifyContent: "center",
    color: "var(--text-1)",
  }}>
    <div style={{
      width: "100%", maxWidth: 420,
      background: "var(--bg-0)",
      display: "flex", flexDirection: "column",
      minHeight: "100vh",
      position: "relative",
      borderLeft: "1px solid var(--border)",
      borderRight: "1px solid var(--border)",
    }}>
      {showTicker && <TickerBanner items={tickerItems} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", minHeight: 0 }}>
        {children}
      </div>
      {showNav && <BottomNav active={activeTab} onChange={onTabChange} onOpenSettings={onOpenSettings} settingsActive={settingsActive} />}
    </div>
  </div>
);

const BottomNav = ({ active, onChange, onOpenSettings, settingsActive }) => {
  const tabs = [
    { id: "home", label: "Flip", icon: Repeat },
    { id: "portfolio", label: "Portfolio", icon: BarChart3 },
    { id: "statements", label: "Statements", icon: FileText },
    { id: "cards", label: "Cards", icon: CreditCard },
  ];
  return (
    <div style={{
      padding: "10px 10px 20px", background: "var(--bg-deep)",
      borderTop: "1px solid var(--border)",
      display: "flex", gap: 4, alignItems: "center",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = active === t.id && !settingsActive;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              flex: 1, border: "none",
              background: "transparent",
              color: on ? "var(--accent-light)" : "var(--text-3)",
              padding: "8px 0 6px", borderRadius: 14, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: on ? 700 : 500, transition: "all 0.2s",
              position: "relative",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: on ? "var(--accent-soft)" : "transparent",
                border: on ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                <Icon size={17} strokeWidth={on ? 2.4 : 1.8}
                  color={on ? "var(--accent-light)" : "var(--text-3)"} />
              </div>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={onOpenSettings} style={{
        border: "none",
        background: settingsActive ? "var(--accent-soft)" : "transparent",
        color: settingsActive ? "var(--accent-light)" : "var(--text-2)",
        width: 40, height: 40,
        borderRadius: 999, cursor: "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: settingsActive ? "1.5px solid var(--accent)" : "1.5px solid transparent",
        transition: "all 0.2s",
      }}><Settings size={17} strokeWidth={settingsActive ? 2.2 : 1.8} /></button>
    </div>
  );
};

// ==================== WELCOME ====================
// Google/Apple = simulated sign-in (demo pill). Continue without account = REAL empty app.
// "Try in demo mode" = small text link below that seeds the full demo data.
const Welcome = ({ onContinue, onSignIn, onDemoMode }) => {
  return (
    <div className="fade-in" style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: "48px 28px 28px", justifyContent: "space-between",
      minHeight: 0,
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <StockbackLogo size={48} color="#ffffff" />
          <div className="sb-brand" style={{ fontSize: 22, color: "var(--text-1)" }}>Stockback</div>
        </div>

        <h1 className="sb-display" style={{
          fontSize: 42, lineHeight: 1.05, margin: 0, marginBottom: 16,
          color: "var(--text-1)", fontWeight: 500,
        }}>
          Make your cashback<br />make{" "}
          <span className="color-shuffle" style={{ color: "var(--accent)" }}>cashback</span>.
        </h1>

        <p style={{
          fontSize: 13.5, lineHeight: 1.55, color: "var(--text-2)",
          margin: 0, marginBottom: 28, maxWidth: 340,
        }}>
          Reinvest every penny your cards earn you. Stockback turns your cashback into
          fractional shares of the companies you already spend with — so your rewards earn rewards of their own.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { n: "01", t: "Link your cards", d: "Or skip and just browse" },
            { n: "02", t: "Upload a statement", d: "AI matches each purchase to a ticker" },
            { n: "03", t: "Flip into shares", d: "Your cashback keeps earning cashback" },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "center",
              padding: "13px 16px", background: "var(--bg-1)", borderRadius: 14,
            }}>
              <div className="sb-mono" style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 500 }}>{s.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 1 }}>{s.t}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => onSignIn("google")} style={{
            flex: 1, padding: "12px 10px",
            background: "#ffffff", color: "#1a1a1a",
            border: "1px solid var(--border-strong)", borderRadius: 12,
            fontSize: 12.5, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <GoogleLogo /> Google
          </button>
          <button onClick={() => onSignIn("apple")} style={{
            flex: 1, padding: "12px 10px",
            background: "#000000", color: "#ffffff",
            border: "1px solid var(--border-strong)", borderRadius: 12,
            fontSize: 12.5, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <AppleLogo /> Apple
          </button>
        </div>
        <button onClick={onContinue} style={{
          width: "100%", padding: "14px 20px",
          background: "transparent", border: "1px solid var(--border-strong)",
          color: "var(--text-1)", borderRadius: 12,
          fontSize: 13, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginBottom: 10,
        }}>
          Continue without account <ArrowRight size={14} />
        </button>
        <div style={{ textAlign: "center" }}>
          <button onClick={onDemoMode} style={{
            background: "transparent", border: "none",
            color: "var(--gold)", fontSize: 11.5, fontWeight: 500,
            cursor: "pointer", textDecoration: "underline",
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "6px 10px",
          }}>
            <PlayCircle size={12} /> Try in demo mode
          </button>
          <div style={{ fontSize: 9.5, color: "var(--text-4)", marginTop: 2 }}>
            Pre-filled with sample data
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const AppleLogo = () => (
  <svg width="14" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// ==================== STEP HEADER ====================
const StepHeader = ({ step, total, title, subtitle, onBack, onSkip, skipLabel }) => (
  <div style={{ padding: "26px 26px 14px", flexShrink: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <button onClick={onBack} style={{
        border: "none", background: "var(--bg-1)", color: "var(--text-2)",
        width: 34, height: 34, borderRadius: 10, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}><ArrowLeft size={15} /></button>
      {total > 0 && (
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i < step ? 20 : 6, height: 3, borderRadius: 999,
              background: i < step ? "var(--accent)" : "var(--text-4)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      )}
      {onSkip ? (
        <button onClick={onSkip} style={{
          border: "none", background: "transparent", color: "var(--text-2)",
          fontSize: 13.5, fontWeight: 500, cursor: "pointer", padding: "10px 16px",
        }}>{skipLabel || "Skip"}</button>
      ) : <div style={{ width: 34 }} />}
    </div>
    <h2 style={{ fontSize: 26, color: "var(--text-1)", margin: 0, marginBottom: 6, fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>{subtitle}</p>}
  </div>
);

// ==================== CARD VISUAL ====================
const CardVisual = ({ card, showRewards = true, size = "full" }) => {
  const style = card.brandStyle || { bg: "linear-gradient(135deg, #505a70 0%, #252d3d 100%)", logo: "", accent: "#d9b368" };
  const isCompact = size === "compact";
  return (
    <div style={{
      width: "100%", minHeight: isCompact ? 130 : 180, borderRadius: isCompact ? 14 : 18,
      background: style.bg,
      padding: isCompact ? "14px 16px" : "18px 20px",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}>
      <div style={{
        position: "absolute", right: -40, top: -40,
        width: 180, height: 180, borderRadius: 999,
        background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", left: -30, bottom: -30,
        width: 140, height: 140, borderRadius: 999,
        background: "radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 70%)",
      }} />
      {/* Top-right: Stockback app logo in the card's accent color */}
      <div style={{
        position: "absolute", top: isCompact ? 14 : 18, right: isCompact ? 16 : 20,
        opacity: 0.95,
      }}>
        <StockbackLogo size={isCompact ? 20 : 26} color={style.accent || "#ffffff"} />
      </div>
      <div>
        <div style={{
          fontSize: isCompact ? 8.5 : 9.5, fontWeight: 700, letterSpacing: "0.15em",
          color: style.accent || "rgba(255,255,255,0.85)",
          opacity: 0.9, textTransform: "uppercase",
        }}>{style.logo || card.issuer}</div>
        <div style={{
          fontSize: isCompact ? 15 : 20, fontWeight: 500, color: style.accent || "white",
          marginTop: 4, letterSpacing: "-0.02em",
        }}>{card.name}</div>
      </div>
      {showRewards && card.rewards && card.rewards.length > 0 && !isCompact && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "8px 0 10px", maxWidth: "85%" }}>
          {card.rewards.slice(0, 4).map((r, i) => (
            <div key={i} style={{
              padding: "4px 9px", borderRadius: 6,
              background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
              fontSize: 9.5, fontWeight: 500, color: style.accent || "white",
              letterSpacing: "-0.01em",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <span className="sb-mono" style={{ fontWeight: 700 }}>{r.rate}%</span>
              <span>{r.category.length > 18 ? r.category.slice(0, 16) + "…" : r.category}</span>
            </div>
          ))}
        </div>
      )}
      {/* Bottom-right area intentionally empty — was redundant with top-left issuer label */}
    </div>
  );
};

// ==================== CARD PICKER ====================
const CardPicker = ({ onNext, onSkip, onBack, selected, setSelected, userCards, setUserCards }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const popularCards = CARD_CATALOG.filter((c) => c.popular);

  const removeCard = (id) => {
    setUserCards((cs) => cs.filter((c) => c.id !== id));
    setSelected((s) => s.filter((x) => x !== id));
  };

  const addCard = (card) => {
    const newCard = card.rewards ? card : { ...card, rewards: card.defaultRewards };
    if (!userCards.find((x) => x.id === newCard.id)) {
      setUserCards((cs) => [...cs, newCard]);
    }
    setSelected((s) => s.includes(newCard.id) ? s : [...s, newCard.id]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <StepHeader step={1} total={2} title="Which cards do you use?"
        subtitle={`Tap a popular card or search ${CARD_CATALOG.length}+ options. You can edit rewards anytime.`}
        onBack={onBack} onSkip={onSkip} skipLabel="Skip & browse" />
      <div className="soft-scroll" style={{ flex: 1, padding: "6px 22px 20px", overflowY: "auto", minHeight: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.04em" }}>
          Popular
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {popularCards.map((c) => {
            const isSelected = selected.includes(c.id);
            const isAdded = userCards.find((x) => x.id === c.id);
            return (
              <button key={c.id} onClick={() => isAdded ? setSelected((s) => s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id]) : addCard(c)} style={{
                border: "none", padding: 0, background: "transparent",
                cursor: "pointer", position: "relative",
                borderRadius: 14, overflow: "visible",
                transition: "transform 0.15s",
              }}>
                <CardVisual card={c.rewards ? c : { ...c, rewards: c.defaultRewards }} size="compact" />
                {isSelected && (
                  <div style={{
                    position: "absolute", top: -6, right: -6,
                    width: 26, height: 26, borderRadius: 999,
                    background: "var(--accent)",
                    border: "2.5px solid var(--bg-0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                  }}>
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setShowAddModal(true)} style={{
            width: "100%", padding: "18px 16px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 14, textAlign: "left",
            boxShadow: "0 6px 16px rgba(76, 139, 245, 0.3)",
            overflow: "hidden", position: "relative",
          }}>
            <MiniCardIllustration variant="catalog" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 2 }}>Add a card</div>
              <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.3 }}>Search {CARD_CATALOG.length}+ cards or create a custom one</div>
            </div>
            <ArrowRight size={18} color="#fff" strokeWidth={2.3} />
          </button>
        </div>

        {userCards.length > 0 && (
          <>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Your cards
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {userCards.map((c) => {
                const on = selected.includes(c.id);
                return (
                  <div key={c.id} onClick={() => setSelected((s) => s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id])} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px 10px 10px", borderRadius: 14,
                    background: on ? "var(--accent-soft)" : "var(--bg-1)",
                    border: on ? "1px solid var(--accent)" : "1px solid transparent",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <div style={{ width: 42, height: 28, flexShrink: 0, borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ width: "100%", height: "100%", background: c.brandStyle?.bg || "var(--bg-2)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 500, marginBottom: 1 }}>{c.shortName}</div>
                      <div className="sb-mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                        {c.rewards.length === 0 ? "no rewards" : `${c.rewards[0].rate}% ${c.rewards[0].category}`}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeCard(c.id); }} style={{
                      border: "none", background: "transparent", color: "var(--text-4)",
                      cursor: "pointer", padding: 6, borderRadius: 8,
                    }}><X size={14} /></button>
                    {on && (
                      <div style={{
                        width: 20, height: 20, borderRadius: 999, background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}><Check size={12} color="white" strokeWidth={3} /></div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "12px 22px 22px", flexShrink: 0 }}>
        <button onClick={onNext} disabled={selected.length === 0} style={{
          width: "100%", padding: "15px 20px",
          background: selected.length === 0 ? "var(--bg-1)" : "var(--accent)",
          color: selected.length === 0 ? "var(--text-4)" : "#fff",
          border: "none", borderRadius: 14,
          fontSize: 14, fontWeight: 500,
          cursor: selected.length === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
        }}>
          Continue {selected.length > 0 && `(${selected.length})`}
          {selected.length > 0 && <ArrowRight size={14} />}
        </button>
      </div>

      {showAddModal && (
        <AddCardModal existing={userCards} onClose={() => setShowAddModal(false)}
          onAdd={(card) => { addCard(card); setShowAddModal(false); }}
          onOpenCustom={() => { setShowAddModal(false); setShowCustom(true); }} />
      )}
      {showCustom && (
        <CustomCardModal onClose={() => setShowCustom(false)}
          onAdd={(card) => { addCard(card); setShowCustom(false); }} />
      )}
    </div>
  );
};

// ==================== BOTTOM SHEET + FORM HELPERS ====================
// The BottomSheet now uses position: fixed with inset:0 and a constrained inner column,
// so when opened from a full-width Settings panel it still displays correctly.
const BottomSheet = ({ onClose, title, children, maxHeight = "90vh" }) => (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
    zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center",
  }} onClick={onClose}>
    <div className="slide-up" onClick={(e) => e.stopPropagation()} style={{
      width: "100%", maxWidth: 420, maxHeight,
      background: "var(--bg-0)",
      borderTopLeftRadius: 22, borderTopRightRadius: 22,
      display: "flex", flexDirection: "column",
      borderTop: "1px solid var(--border-strong)",
      overflow: "hidden",
    }}>
      {title && (
        <div style={{
          padding: "18px 22px 14px", flexShrink: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 19, color: "var(--text-1)", fontWeight: 600, letterSpacing: "-0.015em" }}>{title}</div>
          <button onClick={onClose} style={{
            border: "none", background: "var(--bg-1)", width: 30, height: 30,
            borderRadius: 999, color: "var(--text-2)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={14} /></button>
        </div>
      )}
      {children}
    </div>
  </div>
);

// Centered dialog for alerts and short interactions (not bottom-anchored like BottomSheet)
const CenteredModal = ({ onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
    zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
  }} onClick={onClose}>
    <div className="pop" onClick={(e) => e.stopPropagation()} style={{
      width: "100%", maxWidth: 340,
      background: "var(--bg-0)", borderRadius: 18,
      border: "1px solid var(--border-strong)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      overflow: "hidden",
    }}>
      {children}
    </div>
  </div>
);

const InvalidTickerModal = ({ query, reason, onClose }) => (
  <CenteredModal onClose={onClose}>
    <div style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 12, right: 12,
        width: 28, height: 28, borderRadius: 999,
        background: "var(--bg-1)", border: "none", color: "var(--text-2)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      }}><X size={13} /></button>
      <div style={{
        width: 52, height: 52, borderRadius: 999, marginTop: 6, marginBottom: 12,
        background: "rgba(255, 95, 109, 0.12)", border: "1px solid rgba(255, 95, 109, 0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <AlertTriangle size={22} color="var(--red)" strokeWidth={2.2} />
      </div>
      <div style={{ fontSize: 16, color: "var(--text-1)", fontWeight: 700, marginBottom: 6, letterSpacing: "-0.01em" }}>
        Couldn't find <span className="sb-mono">{query}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 16 }}>
        {reason || `We couldn't match "${query}" to a real ticker on Yahoo Finance. Try a different ticker symbol or the full company name.`}
      </div>
      <button onClick={onClose} style={{
        width: "100%", padding: "12px", borderRadius: 12,
        background: "var(--accent)", color: "#fff", border: "none",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}>OK</button>
    </div>
  </CenteredModal>
);

const LabeledInput = ({ label, placeholder, value, onChange }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>{label}</div>
    <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 14px", borderRadius: 12,
      background: "var(--bg-1)", border: "1px solid var(--border)",
      color: "var(--text-1)", fontSize: 13, outline: "none",
    }} />
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>{label}</div>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 14px", borderRadius: 12,
      background: "var(--bg-1)", border: "1px solid var(--border)",
      color: "var(--text-1)", fontSize: 13, outline: "none",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23a3abbd' fill='none' stroke-width='1.5'/></svg>\")",
      backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
    }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const RewardEditor = ({ rewards, setRewards }) => {
  const updateReward = (i, field, val) => setRewards((r) => r.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  const addReward = () => setRewards((r) => [...r, { category: "", rate: "" }]);
  const removeReward = (i) => setRewards((r) => r.filter((_, idx) => idx !== i));
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        {rewards.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input placeholder="Category (e.g. Dining)" value={r.category} onChange={(e) => updateReward(i, "category", e.target.value)} style={{
              flex: 1, padding: "11px 13px", borderRadius: 10,
              background: "var(--bg-1)", border: "1px solid var(--border)",
              color: "var(--text-1)", fontSize: 12.5, outline: "none",
            }} />
            <div style={{ position: "relative" }}>
              <input placeholder="3" value={r.rate} onChange={(e) => updateReward(i, "rate", e.target.value)} className="sb-mono" style={{
                width: 64, padding: "11px 22px 11px 13px", borderRadius: 10,
                background: "var(--bg-1)", border: "1px solid var(--border)",
                color: "var(--text-1)", fontSize: 12.5, outline: "none",
              }} />
              <span className="sb-mono" style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                color: "var(--gold)", fontSize: 11,
              }}>%</span>
            </div>
            {rewards.length > 1 && (
              <button onClick={() => removeReward(i)} style={{
                border: "none", background: "transparent", color: "var(--text-4)",
                cursor: "pointer", padding: 4,
              }}><X size={14} /></button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addReward} style={{
        width: "100%", padding: "10px",
        borderRadius: 10, border: "1px dashed var(--text-4)",
        background: "transparent", color: "var(--text-2)",
        fontSize: 12, fontWeight: 500, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}><Plus size={12} /> Add category</button>
    </>
  );
};

// ==================== ADD CARD MODAL ====================
const AddCardModal = ({ onClose, onAdd, existing, onOpenCustom }) => {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(null);
  const [rewards, setRewards] = useState([{ category: "", rate: "" }]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CARD_CATALOG;
    return CARD_CATALOG.filter((c) =>
      c.shortName.toLowerCase().includes(q) ||
      c.issuer.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  }, [search]);

  const selectCatalog = (c) => {
    setPicked(c);
    setRewards(c.defaultRewards.length > 0 ? c.defaultRewards.map((r) => ({ ...r })) : [{ category: "", rate: "" }]);
  };

  const save = () => {
    if (!picked) return;
    const cleanRewards = rewards.filter((r) => r.category && r.rate !== "").map((r) => ({ category: r.category, rate: parseFloat(r.rate) || 0 }));
    if (existing.find((x) => x.id === picked.id)) { onClose(); return; }
    onAdd({ ...picked, rewards: cleanRewards });
  };

  return (
    <BottomSheet onClose={onClose} title={picked ? picked.shortName : "Search cards"}>
      {!picked && (
        <>
          <div style={{ padding: "12px 22px 10px", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 13px", borderRadius: 12, background: "var(--bg-1)",
            }}>
              <Search size={14} color="var(--text-3)" />
              <input placeholder={`Search ${CARD_CATALOG.length} cards...`} value={search} onChange={(e) => setSearch(e.target.value)} style={{
                flex: 1, background: "transparent", border: "none",
                color: "var(--text-1)", fontSize: 13, outline: "none",
              }} autoFocus />
            </div>
          </div>
          <div className="soft-scroll" style={{
            flex: 1, overflow: "auto", padding: "4px 22px 20px",
            display: "flex", flexDirection: "column", gap: 5,
          }}>
            {filtered.map((c) => (
              <button key={c.id} onClick={() => selectCatalog(c)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                background: "transparent", border: "1px solid var(--border)",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}>
                <div style={{ width: 38, height: 26, borderRadius: 5, background: c.brandStyle.bg, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 500 }}>{c.shortName}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{c.issuer}{c.popular ? " · Popular" : ""}</div>
                </div>
                <ChevronRight size={14} color="var(--text-4)" />
              </button>
            ))}
            {onOpenCustom && (
              <div style={{
                marginTop: 14, padding: "14px 14px",
                borderRadius: 12, background: "var(--bg-1)",
                border: "1px dashed var(--border-strong)",
                display: "flex", alignItems: "center", gap: 11,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "var(--accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}><CreditCard size={15} color="var(--accent-light)" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>Can't find your card?</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}>Add it manually with your reward categories</div>
                </div>
                <button onClick={onOpenCustom} style={{
                  padding: "7px 12px", borderRadius: 8,
                  background: "var(--accent)", color: "#fff", border: "none",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>Add manually</button>
              </div>
            )}
          </div>
        </>
      )}

      {picked && (
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "16px 22px 24px" }}>
          <div style={{ marginBottom: 16 }}>
            <CardVisual card={{ ...picked, rewards: rewards.filter((r) => r.category && r.rate !== "") }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-2)", marginBottom: 10 }}>
            Reward categories
          </div>
          <RewardEditor rewards={rewards} setRewards={setRewards} />
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={() => setPicked(null)} style={{
              padding: "13px 18px", borderRadius: 12,
              border: "1px solid var(--border-strong)", background: "transparent",
              color: "var(--text-2)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
            }}>← Back</button>
            <button onClick={save} style={{
              flex: 1, padding: "13px", background: "var(--accent)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>Save card</button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

// ==================== CUSTOM CARD MODAL ====================
const CustomCardModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [rewards, setRewards] = useState([{ category: "", rate: "" }]);
  const [bgColor, setBgColor] = useState("#3a4356");

  const previewCard = {
    issuer: issuer || "Custom",
    name: name || "My Card",
    shortName: name || "Custom card",
    brandStyle: {
      bg: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 50%, ${bgColor}aa 100%)`,
      logo: (issuer || "Custom").toUpperCase().slice(0, 14),
      accent: "#fff",
    },
    rewards: rewards.filter((r) => r.category && r.rate !== ""),
  };

  const save = () => {
    if (!name.trim()) return;
    const cleanRewards = rewards.filter((r) => r.category && r.rate !== "").map((r) => ({ category: r.category, rate: parseFloat(r.rate) || 0 }));
    onAdd({
      id: `custom-${Date.now()}`,
      issuer: issuer || "Custom",
      name, shortName: name,
      brandStyle: previewCard.brandStyle,
      rewards: cleanRewards,
    });
  };

  const colors = ["#3a4356", "#1e4080", "#006241", "#8a1823", "#c47a00", "#4d3079", "#0c5e5a"];

  return (
    <BottomSheet onClose={onClose} title="Create a custom card">
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "16px 22px 24px" }}>
        <div style={{ marginBottom: 16 }}><CardVisual card={previewCard} /></div>
        <LabeledInput label="Card name" placeholder="e.g. My Rewards Card" value={name} onChange={setName} />
        <LabeledInput label="Issuer (optional)" placeholder="Bank or issuer" value={issuer} onChange={setIssuer} />
        <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>Card color</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {colors.map((c) => (
            <button key={c} onClick={() => setBgColor(c)} style={{
              width: 28, height: 28, borderRadius: 8,
              background: c, border: bgColor === c ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer", padding: 0,
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-2)", marginBottom: 10 }}>Reward categories</div>
        <RewardEditor rewards={rewards} setRewards={setRewards} />
        <button onClick={save} disabled={!name.trim()} style={{
          width: "100%", padding: "13px", marginTop: 18,
          background: name.trim() ? "var(--accent)" : "var(--bg-1)",
          color: name.trim() ? "#fff" : "var(--text-4)",
          border: "none", borderRadius: 12, fontSize: 13, fontWeight: 500,
          cursor: name.trim() ? "pointer" : "default",
        }}>Create card</button>
      </div>
    </BottomSheet>
  );
};

// ==================== STATEMENT UPLOAD ====================
// Camera/PDF buttons always clickable. If camera permission hasn't been granted,
// clicking it will RE-TRY the permission request — not grey it out.
const StatementUpload = ({ onNext, onSkip, onBack, permissions, setPermissions, isDemoMode = false }) => {
  const [step, setStep] = useState(permissions.requested ? "method" : "permissions");

  const tryNotifications = async () => {
    try {
      if ("Notification" in window) {
        const result = await Notification.requestPermission();
        return result === "granted";
      }
    } catch (e) {}
    return false;
  };

  const tryCamera = async () => {
    try {
      if (navigator.permissions) {
        const status = await navigator.permissions.query({ name: "camera" });
        if (status.state === "granted") return true;
        if (status.state === "denied") return false;
        // "prompt": fall through to getUserMedia to trigger the browser permission dialog
      }
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        return true;
      }
    } catch (e) {}
    return false;
  };

  const grantAll = async () => {
    const [notif, cam] = await Promise.all([tryNotifications(), tryCamera()]);
    setPermissions({ notifications: notif, camera: cam, requested: true });
    setStep("method");
  };
  const denyAll = () => {
    setPermissions({ notifications: false, camera: false, requested: true });
    setStep("method");
  };

  // When user taps camera option without permission, ask for it
  const [cameraDenied, setCameraDenied] = useState(false);

  const handleCameraClick = async () => {
    if (!permissions.camera) {
      const cam = await tryCamera();
      if (cam) {
        setPermissions({ ...permissions, camera: true });
        onNext();
      } else {
        setCameraDenied(true);
      }
    } else {
      onNext();
    }
  };

  if (step === "permissions") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <StepHeader step={2} total={2} title="Quick permissions" subtitle="We need these to upload statements and send you reminders."
          onBack={onBack} onSkip={onSkip} skipLabel="Skip & browse" />
        <div className="soft-scroll" style={{ flex: 1, padding: "18px 26px", display: "flex", flexDirection: "column", gap: 10, overflow: "auto", minHeight: 0 }}>
          <PermissionCard icon={Camera} title="Camera access"
            desc="Used only to photograph paper statements. Photos are deleted from your device immediately after processing." />
          <PermissionCard icon={Bell} title="Monthly reminders"
            desc="We'll nudge you once a month when your statement closes so your cashback doesn't pile up." />
          <div style={{
            marginTop: 12, padding: "12px 14px", borderRadius: 12,
            background: "var(--bg-1)", border: "1px solid var(--border)",
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <CameraOff size={14} color="var(--gold)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--text-1)" }}>Photos are never saved.</b> After we read the statement, the photo is wiped.
            </div>
          </div>
          {isDemoMode && <div style={{ marginTop: 2 }}><DemoPill tooltip="Permissions are requested via real browser APIs" /></div>}
        </div>
        <div style={{ padding: "12px 26px 22px", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={denyAll} style={{
            flex: 1, padding: "13px", borderRadius: 12,
            border: "1px solid var(--border-strong)", background: "transparent",
            color: "var(--text-2)", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>Not now</button>
          <button onClick={grantAll} style={{
            flex: 1, padding: "13px", borderRadius: 12,
            background: "var(--accent)", color: "#fff",
            border: "none",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>Allow both</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <StepHeader step={2} total={2} title="Upload your statement"
        subtitle="AI reads each line and maps it to a ticker. Ambiguous items go to an Unassigned queue you can resolve."
        onBack={onBack} onSkip={onSkip} skipLabel="Skip & browse" />
      <div className="soft-scroll" style={{ flex: 1, padding: "18px 26px", display: "flex", flexDirection: "column", gap: 10, overflow: "auto", minHeight: 0 }}>
        <UploadOption icon={FileText} title="Upload a PDF" desc="Statement file from your bank or email" onClick={onNext} demo />
        <UploadOption icon={Camera} title="Take a photo"
          desc={permissions.camera ? "Camera ready" : "Tap to request camera"}
          onClick={handleCameraClick} demo />
        {cameraDenied && (
          <div style={{
            padding: "10px 12px", borderRadius: 10,
            background: "rgba(255,95,109,0.08)", border: "1px solid rgba(255,95,109,0.2)",
            fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5,
          }}>
            <b style={{ color: "var(--red)" }}>Camera access denied.</b> Re-enable it in your browser's site settings, then try again.
          </div>
        )}
        {(!permissions.camera || !permissions.notifications) && (
          <button onClick={() => setStep("permissions")} style={{
            marginTop: 2, padding: "9px 12px", borderRadius: 10,
            background: "transparent", border: "1px dashed var(--text-4)",
            color: "var(--text-2)", fontSize: 11.5, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}><Unlock size={12} /> Update permissions</button>
        )}
        <div style={{
          marginTop: 22, padding: 18, borderRadius: 14,
          background: "var(--bg-1)", border: "1px solid var(--border)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 600, color: "var(--gold)", marginBottom: 8, letterSpacing: "0.02em",
          }}><Sparkles size={11} /> HOW AI MATCHING WORKS</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--text-2)" }}>
            We parse each transaction and match the merchant to a ticker — Starbucks → SBUX, Netflix → NFLX. Parent-company lookup handles cases like Old Navy → GAP. Anything genuinely ambiguous goes to <b style={{ color: "var(--text-1)" }}>Unassigned</b> with 2-3 suggestions.
          </div>
        </div>
      </div>
    </div>
  );
};

const PermissionCard = ({ icon: Icon, title, desc }) => (
  <div style={{
    padding: "16px 16px", borderRadius: 14,
    background: "var(--bg-1)", border: "1px solid var(--border)",
    display: "flex", gap: 14, alignItems: "flex-start",
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 12,
      background: "var(--accent-soft)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={17} color="var(--accent-light)" />
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.55 }}>{desc}</div>
    </div>
  </div>
);

const UploadOption = ({ icon: Icon, title, desc, onClick, demo }) => (
  <button onClick={onClick} style={{
    border: "1px solid var(--border)", background: "var(--bg-1)",
    borderRadius: 16, padding: "16px 16px",
    cursor: "pointer",
    display: "flex", alignItems: "center", gap: 14, textAlign: "left",
    transition: "all 0.2s",
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: "var(--accent-soft)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={18} color="var(--accent-light)" />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-1)", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
        {title} {demo && <DemoPill />}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{desc}</div>
    </div>
    <ArrowRight size={15} color="var(--text-4)" />
  </button>
);

// ==================== FLIP TAB ====================
const FlipTab = ({ flips, setFlips, unassigned, setUnassigned, cardsMap, onOpenItem, onOpenManualAdd, onShowToast, userCards, portfolio, setPortfolio, connectedBrokers, broker }) => {
  const active = flips.filter((d) => !d.done);
  const done = flips.filter((d) => d.done);
  const totalCashback = active.reduce((a, b) => a + cashbackFor(b, cardsMap), 0);
  const selectedFlipAmt = active.filter((d) => d.flipped).reduce((a, b) => a + cashbackFor(b, cardsMap), 0);
  const remaining = totalCashback - selectedFlipAmt;
  const selectedCount = active.filter((d) => d.flipped).length;
  const totalFlippedThisCycle = done.reduce((a, b) => a + cashbackFor(b, cardsMap), 0);
  const empty = active.length === 0 && unassigned.length === 0;
  const allSelected = active.length > 0 && selectedCount === active.length;
  const [placing, setPlacing] = useState(false);
  const [invalidTicker, setInvalidTicker] = useState(null); // { query, reason } when resolution fails

  const selectAll = () => setFlips((arr) => arr.map((d) => (!d.done && active.find((a) => a.id === d.id)) ? { ...d, flipped: true } : d));
  const deselectAll = () => setFlips((arr) => arr.map((d) => (!d.done) ? { ...d, flipped: false } : d));

  const activeBroker = BROKER_PRESETS.find((b) => b.id === broker);
  const activeBrokerConnected = activeBroker?.connectable && !!connectedBrokers?.[broker];
  const activeBrokerName = activeBroker?.name || "your broker";

  const finalize = () => {
    const selected = active.filter((d) => d.flipped);
    if (selected.length === 0 || placing) return;
    const flipsSnap = flips;
    const portfolioSnap = portfolio;

    const doFinalize = () => {
      const today = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      const nextPortfolio = [...portfolio];
      selected.forEach((d) => {
        const card = cardsMap[d.cardId];
        const rate = card ? rateForCategory(card, d.category) : 1;
        const cashbackAmount = cashbackFor(d, cardsMap);
        const existingIdx = nextPortfolio.findIndex((h) => h.ticker === d.ticker);
        // Price priority: resolved from Yahoo at assignment time > pre-seeded demo price > skip
        const priceNow = existingIdx >= 0
          ? nextPortfolio[existingIdx].currentPrice
          : (d.resolvedPrice || seedPriceFor(d.ticker));
        if (!priceNow) return; // should never happen — assignment would have blocked
        const newBuy = {
          date: today,
          pricePerShare: priceNow,
          cashbackAmount, cardId: d.cardId, category: d.category, rate,
        };
        if (existingIdx >= 0) {
          nextPortfolio[existingIdx] = { ...nextPortfolio[existingIdx], buys: [...nextPortfolio[existingIdx].buys, newBuy] };
        } else {
          nextPortfolio.push({ ticker: d.ticker, currentPrice: priceNow, dayChangePct: 0, dayChangeDollar: 0, buys: [newBuy] });
        }
      });
      setPortfolio(nextPortfolio);
      setFlips((arr) => arr.map((d) => d.flipped && !d.done ? { ...d, done: true } : d));
      const total = selected.reduce((a, b) => a + cashbackFor(b, cardsMap), 0);
      onShowToast({
        label: activeBrokerConnected
          ? `Placed $${total.toFixed(2)} at ${activeBrokerName}`
          : `Invested $${total.toFixed(2)} across ${selected.length} ticker${selected.length !== 1 ? "s" : ""}`,
        onUndo: () => { setFlips(flipsSnap); setPortfolio(portfolioSnap); },
      });
    };

    if (activeBrokerConnected) {
      setPlacing(true);
      setTimeout(() => { doFinalize(); setPlacing(false); }, 1600);
    } else {
      doFinalize();
    }
  };

  const toggleFlip = (id) => setFlips((arr) => arr.map((d) => d.id === id ? { ...d, flipped: !d.flipped } : d));
  const deleteFlip = (id) => {
    const target = flips.find((d) => d.id === id);
    if (!target) return;
    setFlips((arr) => arr.filter((d) => d.id !== id));
    onShowToast({
      label: `Deleted ${target.merchant}`,
      onUndo: () => setFlips((arr) => arr.find((d) => d.id === id) ? arr : [target, ...arr]),
    });
  };

  return (
    <div style={{ flex: 1, overflow: "auto", position: "relative", minHeight: 0 }} className="soft-scroll">
      {placing && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 400,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div className="pop" style={{
            background: "var(--bg-0)", border: "1px solid var(--border-strong)",
            borderRadius: 18, padding: "24px 28px",
            maxWidth: 300, textAlign: "center",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 999,
                border: "3px solid var(--bg-2)",
                borderTopColor: "var(--accent)",
                animation: "spin 0.9s linear infinite",
              }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              Placing orders at {activeBrokerName}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>
              {selectedCount} fractional order{selectedCount !== 1 ? "s" : ""} · ${selectedFlipAmt.toFixed(2)}
            </div>
            <DemoPill tooltip="Simulated" />
          </div>
        </div>
      )}

      <div style={{ padding: "24px 22px 18px" }}>
        {/* Top meta row: label pill left, flipped-this-cycle stat right */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 999,
            background: selectedCount > 0 ? "rgba(0, 200, 5, 0.12)" : "var(--bg-1)",
            border: selectedCount > 0 ? "1px solid rgba(0, 200, 5, 0.35)" : "1px solid var(--border)",
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
            color: selectedCount > 0 ? "#00c805" : "var(--text-3)",
          }}>
            {selectedCount > 0 ? <><Zap size={10} strokeWidth={2.8} /> Ready to flip</> : <><Repeat size={10} strokeWidth={2.2} /> Available</>}
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end",
          }}>
            <div className="sb-num" style={{ fontSize: 11.5, color: "var(--green)", fontWeight: 700 }}>
              ${totalFlippedThisCycle.toFixed(2)}
            </div>
            <div style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: "0.03em" }}>
              already flipped
            </div>
          </div>
        </div>

        {/* Hero number */}
        <div
          className={selectedCount > 0 ? "glow-pulse" : undefined}
          style={{
            display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4,
          }}>
          <span style={{
            fontSize: 22, fontWeight: 600, color: "var(--text-3)",
            letterSpacing: "-0.02em", lineHeight: 1,
          }}>$</span>
          <span className="sb-num" style={{
            fontSize: 52, lineHeight: 0.95,
            fontWeight: 700, letterSpacing: "-0.03em",
            color: selectedCount > 0 ? "#00c805" : "var(--text-1)",
            transition: "color 0.3s",
          }}>
            {selectedCount > 0 ? selectedFlipAmt.toFixed(2) : remaining.toFixed(2)}
          </span>
        </div>

        {/* Sub-line */}
        <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
          {selectedCount > 0 ? (
            <>
              <span style={{ color: "#00c805", fontWeight: 700 }}>{selectedCount} selected</span>
              {" · "}<span className="sb-num">${remaining.toFixed(2)}</span> still available
            </>
          ) : (
            <>
              <span className="sb-num">{active.filter((d) => !d.flipped).length}</span>
              {` ticker${active.filter((d) => !d.flipped).length !== 1 ? "s" : ""} waiting`}
              {unassigned.length > 0 && (
                <>
                  {" · "}<span style={{ color: "var(--gold)", fontWeight: 700 }}>{unassigned.length} unassigned</span>
                </>
              )}
            </>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <BrandSegmentedBar flips={active} cardsMap={cardsMap} total={totalCashback} />
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 8,
            fontSize: 10.5, color: "var(--text-3)",
          }}>
            <span className="sb-num" style={{ color: "#00c805", fontWeight: 600 }}>${selectedFlipAmt.toFixed(2)} selected</span>
            <span className="sb-num">${totalCashback.toFixed(2)} total</span>
          </div>
        </div>

        <button onClick={onOpenManualAdd} style={{
          marginTop: 14, width: "100%",
          border: "1px solid var(--border-strong)",
          background: "var(--bg-1)",
          color: "var(--text-1)", padding: "11px 14px", borderRadius: 12,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 11,
          textAlign: "left",
          transition: "all 0.15s",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "var(--accent-soft)",
            border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Plus size={16} color="var(--accent-light)" strokeWidth={2.4} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" }}>Add manual flip</div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}>Log a charge without uploading a statement</div>
          </div>
          <ArrowRight size={14} color="var(--text-3)" />
        </button>
      </div>

      {unassigned.length > 0 && (
        <UnassignedSection items={unassigned} cardsMap={cardsMap}
          onResolve={async (item, ticker) => {
            const unassignedSnap = unassigned;
            const flipsSnap = flips;
            const resolved = await resolveTicker(ticker);
            if (!resolved) {
              setInvalidTicker({
                query: ticker.toUpperCase(),
                reason: `We couldn't verify "${ticker}" against live market data on Yahoo Finance. It may be an invalid symbol, or the connection to Yahoo was blocked in this environment.`,
              });
              return;
            }
            setUnassigned((arr) => arr.filter((x) => x.id !== item.id));
            setFlips((arr) => [{
              id: `resolved-${item.id}`, ticker: resolved.ticker, merchant: item.merchant,
              category: item.category, cardId: item.cardId, confidence: 1,
              purchases: [{ date: item.date, desc: item.rawDesc, amount: item.amount }],
              flipped: false, done: false, statementId: item.statementId,
              resolvedPrice: resolved.price, resolvedName: resolved.name,
            }, ...arr]);
            onShowToast({
              label: `Assigned ${item.merchant} → ${resolved.ticker} @ $${resolved.price.toFixed(2)}`,
              onUndo: () => { setUnassigned(unassignedSnap); setFlips(flipsSnap); },
            });
          }}
          onIgnore={(item) => {
            setUnassigned((arr) => arr.filter((x) => x.id !== item.id));
            onShowToast({ label: `Ignored ${item.merchant}`, onUndo: () => setUnassigned((arr) => [item, ...arr]) });
          }}
          onDelete={(item) => {
            setUnassigned((arr) => arr.filter((x) => x.id !== item.id));
            onShowToast({ label: `Deleted ${item.merchant}`, onUndo: () => setUnassigned((arr) => [item, ...arr]) });
          }}
        />
      )}

      {invalidTicker && (
        <InvalidTickerModal
          query={invalidTicker.query}
          reason={invalidTicker.reason}
          onClose={() => setInvalidTicker(null)}
        />
      )}

      {selectedCount > 0 && (
        <div className="pop" style={{ margin: "4px 20px 18px" }}>
          <button onClick={finalize} className="cta-pulse" style={{
            width: "100%", padding: "18px 20px", borderRadius: 18,
            background: "linear-gradient(135deg, #00c805 0%, #00e617 100%)",
            border: "none", cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center", gap: 14, textAlign: "left",
            boxShadow: "0 10px 28px rgba(0, 200, 5, 0.38)",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              position: "relative",
            }}>
              {activeBrokerConnected ? <Zap size={22} color="#fff" strokeWidth={2.5} /> : <Repeat size={22} color="#fff" strokeWidth={2.5} />}
              <div style={{
                position: "absolute", top: -5, right: -5,
                minWidth: 22, height: 22, borderRadius: 999,
                background: "#fff", color: "#00a804",
                fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 6px", border: "2px solid #00c805",
              }}>{selectedCount}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, color: "#fff", fontWeight: 700, marginBottom: 2, letterSpacing: "-0.01em" }}>
                {activeBrokerConnected ? `Place & Flip $${selectedFlipAmt.toFixed(2)}` : `Flip $${selectedFlipAmt.toFixed(2)} now`}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", lineHeight: 1.3 }}>
                {activeBrokerConnected
                  ? `Auto-sync to ${activeBrokerName}`
                  : `Tap after placing in ${activeBroker?.connectable ? activeBrokerName : "your broker"}`}
              </div>
            </div>
            <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {empty && (
        <div style={{
          margin: "10px 22px 24px", padding: "30px 20px",
          borderRadius: 16, background: "var(--bg-1)",
          border: "1px dashed var(--text-4)", textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>Nothing to flip yet</div>
          <div style={{ fontSize: 13, color: "var(--text-1)", marginBottom: 6, lineHeight: 1.4 }}>Upload a statement or add a manual purchase to get started.</div>
        </div>
      )}

      {active.length > 0 && (
        <div style={{
          padding: "0 22px 6px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Pending · {active.length}
          </div>
          <button onClick={allSelected ? deselectAll : selectAll} style={{
            padding: "5px 10px", borderRadius: 8,
            background: allSelected ? "var(--accent-soft)" : "transparent",
            border: allSelected ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
            color: allSelected ? "var(--accent-light)" : "var(--text-2)",
            fontSize: 10.5, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {allSelected ? <><Check size={11} /> Deselect all</> : <>Select all ({active.length})</>}
          </button>
        </div>
      )}

      <div style={{ padding: "6px 18px 28px" }}>
        {active.map((d) => (
          <FlipRow key={d.id} item={d}
            card={cardsMap[d.cardId]}
            cashback={cashbackFor(d, cardsMap)}
            totalSpent={sumPurchases(d)}
            purchaseCount={d.purchases.length}
            onToggle={() => toggleFlip(d.id)}
            onOpen={() => onOpenItem(d.id)}
            onDelete={() => deleteFlip(d.id)}
          />
        ))}
      </div>
    </div>
  );
};

const UnassignedSection = ({ items, cardsMap, onResolve, onIgnore, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ margin: "0 22px 14px" }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", border: "none",
        background: "linear-gradient(135deg, rgba(217, 179, 104, 0.18) 0%, rgba(217, 179, 104, 0.06) 100%)",
        borderLeft: "3px solid var(--gold)",
        borderRadius: 14,
        padding: "14px 14px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          border: "1.5px dashed var(--text-4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          fontSize: 15, fontWeight: 700, lineHeight: 1,
          color: "var(--text-3)",
        }}>?</div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 13.5, color: "var(--text-1)", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Unassigned · {items.length}
          </div>
        </div>
        {expanded ? <ChevronUp size={16} color="var(--gold)" /> : <ChevronDown size={16} color="var(--gold)" />}
      </button>
      {expanded && (
        <div className="pop" style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it) => (
            <UnassignedRow key={it.id} item={it} card={cardsMap[it.cardId]}
              onAssign={(ticker) => onResolve(it, ticker)}
              onIgnore={() => onIgnore(it)}
              onDelete={() => onDelete(it)} />
          ))}
        </div>
      )}
    </div>
  );
};

const UnassignedRow = ({ item, card, onAssign, onIgnore, onDelete }) => {
  const [custom, setCustom] = useState("");
  const [resolving, setResolving] = useState(false);
  const doAssign = async (ticker) => {
    if (resolving) return;
    setResolving(true);
    try { await onAssign(ticker); } finally { setResolving(false); }
  };
  return (
    <div style={{
      padding: "14px 14px", borderRadius: 14,
      background: "var(--bg-1)",
      border: "1px solid var(--border-strong)",
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, rgba(217, 179, 104, 0.25) 0%, rgba(217, 179, 104, 0.08) 100%)",
          border: "1px dashed var(--gold)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          color: "var(--gold)",
        }}>
          <Sparkles size={16} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, color: "var(--text-1)", fontWeight: 600, marginBottom: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.merchant}</div>
          <div className="sb-num" style={{ fontSize: 11, color: "var(--text-3)" }}>
            {item.date} · ${item.amount.toFixed(2)} · {card?.shortName || "—"}
          </div>
        </div>
        {/* Subtle icon-only secondary actions — tucked in the corner */}
        <div style={{ display: "flex", gap: 3 }}>
          <button onClick={onIgnore} title="Ignore" style={{
            width: 30, height: 30, border: "none",
            background: "var(--bg-2)", color: "var(--text-3)",
            borderRadius: 8, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><EyeOff size={13} /></button>
          <button onClick={onDelete} title="Delete" style={{
            width: 30, height: 30, border: "none",
            background: "var(--bg-2)", color: "var(--red)",
            borderRadius: 8, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><Trash2 size={13} /></button>
        </div>
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--gold)", marginBottom: 9, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
        <Sparkles size={10} /> Pick a match
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 11, opacity: resolving ? 0.55 : 1, pointerEvents: resolving ? "none" : "auto" }}>
        {item.suggestions.map((s) => {
          const brandColor = getBrandColor(s);
          const textColor = readableTextColor(brandColor);
          return (
            <button key={s} onClick={() => doAssign(s)} style={{
              padding: "8px 12px 8px 8px", borderRadius: 999,
              background: brandColor,
              border: "none",
              color: textColor,
              cursor: "pointer",
              fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em",
              display: "flex", alignItems: "center", gap: 7,
              transition: "transform 0.1s, box-shadow 0.15s",
              boxShadow: `0 4px 10px ${brandColor}55`,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: textColor, fontSize: 10, fontWeight: 800,
              }}>{s.charAt(0)}</div>
              {s}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input placeholder="Or type a ticker or company..." value={custom}
          onChange={(e) => setCustom(e.target.value.toUpperCase())}
          disabled={resolving}
          style={{
            flex: 1, padding: "10px 12px", borderRadius: 10,
            background: "var(--bg-2)", border: "1px solid var(--border)",
            color: "var(--text-1)", fontSize: 12, outline: "none",
            opacity: resolving ? 0.55 : 1,
          }} />
        <button onClick={() => { if (custom.trim()) doAssign(custom.trim()); }}
          disabled={!custom.trim() || resolving}
          style={{
            padding: "10px 16px", borderRadius: 10,
            background: (custom.trim() && !resolving) ? "var(--accent)" : "var(--bg-2)",
            color: (custom.trim() && !resolving) ? "#fff" : "var(--text-4)",
            border: "none", cursor: (custom.trim() && !resolving) ? "pointer" : "default",
            fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 5, minWidth: 82, justifyContent: "center",
          }}>
          {resolving ? (
            <div style={{
              width: 12, height: 12, borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              animation: "spin 0.7s linear infinite",
            }} />
          ) : (
            <><Check size={12} /> Assign</>
          )}
        </button>
      </div>
    </div>
  );
};

const BrandSegmentedBar = ({ flips, cardsMap, total }) => {
  if (total <= 0) return <div style={{ height: 10, background: "var(--bg-1)", borderRadius: 999 }} />;
  const all = flips.map((d) => ({
    ticker: d.ticker, cashback: cashbackFor(d, cardsMap),
    flipped: d.flipped, color: getBrandColor(d.ticker),
  })).sort((a, b) => b.cashback - a.cashback);
  let segments = all;
  if (all.length > 7) {
    const top = all.slice(0, 6);
    const rest = all.slice(6);
    segments = [...top, {
      ticker: `+${rest.length}`,
      cashback: rest.reduce((a, b) => a + b.cashback, 0),
      flipped: rest.some((r) => r.flipped),
      color: "var(--text-3)",
    }];
  }
  return (
    <div style={{
      height: 10, background: "var(--bg-2)", borderRadius: 999,
      overflow: "hidden", display: "flex",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
    }}>
      {segments.map((s, i) => {
        const pct = (s.cashback / total) * 100;
        if (pct === 0) return null;
        return (
          <div key={s.ticker} title={`${s.ticker}: ${pct.toFixed(1)}%`} style={{
            width: `${pct}%`, height: "100%",
            background: s.flipped ? s.color : `${s.color}55`,
            transition: "all 0.3s",
            borderRight: i < segments.length - 1 ? "1px solid rgba(0,0,0,0.2)" : "none",
          }} />
        );
      })}
    </div>
  );
};

// ==================== FLIP ROW + CHART HELPERS ====================
const FlipRow = ({ item, card, cashback, totalSpent, purchaseCount, onToggle, onOpen, onDelete }) => {
  const redemption = card ? inferRedemption(card) : "cash";
  const isPoints = redemption !== "cash";
  return (
    <div style={{
      padding: "12px 14px", marginBottom: 8, borderRadius: 14,
      background: item.flipped ? "var(--accent-soft)" : "var(--bg-1)",
      border: item.flipped ? "1px solid var(--accent)" : "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: 12,
      transition: "all 0.2s",
    }}>
      <BrandTile merchant={item.merchant} ticker={item.ticker} size={40} />
      <button onClick={onOpen} style={{
        flex: 1, minWidth: 0, background: "transparent", border: "none",
        textAlign: "left", cursor: "pointer", padding: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {item.merchant}
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
            background: `${getBrandColor(item.ticker)}22`,
            color: getBrandColor(item.ticker),
            letterSpacing: "0.02em",
          }}>{item.ticker}</span>
        </div>
        <div className="sb-mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
          ${totalSpent.toFixed(2)} · {purchaseCount} {purchaseCount === 1 ? "charge" : "charges"} · {card?.shortName?.slice(0, 14) || "—"}
        </div>
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <div className="sb-mono" style={{
          fontSize: 13, color: isPoints ? "var(--gold)" : "var(--green)",
          fontWeight: 600,
        }}>${cashback.toFixed(2)}</div>
        {isPoints && <RedemptionBadge card={card} size="sm" />}
      </div>
      <button onClick={onToggle} style={{
        width: 30, height: 30, borderRadius: 10,
        background: item.flipped ? "var(--accent)" : "transparent",
        border: item.flipped ? "none" : "1.5px solid var(--text-4)",
        cursor: "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {item.flipped && <Check size={16} color="#fff" strokeWidth={3} />}
      </button>
      <button onClick={onDelete} title="Delete" style={{
        width: 26, height: 26, borderRadius: 8,
        background: "transparent",
        border: "1px solid var(--border-strong)",
        color: "var(--text-3)",
        cursor: "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        <X size={13} strokeWidth={2.2} />
      </button>
    </div>
  );
};

const RANGES = [
  { id: "1D", label: "1D", months: 0.033 },
  { id: "1W", label: "1W", months: 0.25 },
  { id: "1M", label: "1M", months: 1 },
  { id: "3M", label: "3M", months: 3 },
  { id: "1Y", label: "1Y", months: 12 },
  { id: "ALL", label: "ALL", months: 24 },
];

const parseBuyDate = (s) => {
  if (!s || typeof s !== "string") return new Date();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return new Date();
};

const getRangeBounds = (range, buys) => {
  const now = new Date();
  const sortedBuys = [...buys].sort((a, b) => parseBuyDate(a.date) - parseBuyDate(b.date));
  const earliest = sortedBuys.length > 0 ? parseBuyDate(sortedBuys[0].date) : new Date(now - 365 * 86400000);
  if (range === "ALL") return { start: earliest, end: now };
  const cfg = RANGES.find((r) => r.id === range);
  const start = new Date(now.getTime() - cfg.months * 30 * 86400000);
  return { start, end: now };
};

// Generates chart samples with buys anchored at their actual prices.
const generateChartFromBuys = (ticker, currentPrice, buys, range) => {
  const { start, end } = getRangeBounds(range, buys);
  const startMs = start.getTime(), endMs = end.getTime();
  const totalSpan = endMs - startMs;
  const sampleCount = 60;
  const sortedBuys = [...buys]
    .map((b) => ({ ...b, ms: parseBuyDate(b.date).getTime() }))
    .filter((b) => b.ms >= startMs && b.ms <= endMs)
    .sort((a, b) => a.ms - b.ms);

  const anchors = [];
  if (sortedBuys.length > 0) {
    anchors.push({ ms: startMs, price: sortedBuys[0].pricePerShare });
  } else {
    anchors.push({ ms: startMs, price: currentPrice * 0.94 });
  }
  sortedBuys.forEach((b) => anchors.push({ ms: b.ms, price: b.pricePerShare }));
  anchors.push({ ms: endMs, price: currentPrice });

  const uniqueAnchors = [];
  anchors.forEach((a) => {
    const last = uniqueAnchors[uniqueAnchors.length - 1];
    if (last && Math.abs(last.ms - a.ms) < 60000) return;
    uniqueAnchors.push(a);
  });

  const seed = ticker.charCodeAt(0) * 31 + (ticker.charCodeAt(1) || 0);
  const points = [];
  for (let i = 0; i < sampleCount; i++) {
    const t = i / (sampleCount - 1);
    const ms = startMs + t * totalSpan;
    let upper = uniqueAnchors.findIndex((a) => a.ms >= ms);
    if (upper === -1) upper = uniqueAnchors.length - 1;
    if (upper === 0) upper = 1;
    const lower = upper - 1;
    const a1 = uniqueAnchors[lower], a2 = uniqueAnchors[upper];
    const spanRatio = a2.ms === a1.ms ? 0 : (ms - a1.ms) / (a2.ms - a1.ms);
    const basePrice = a1.price + (a2.price - a1.price) * spanRatio;
    const noise = (seededRand(seed + i * 3.7) - 0.5) * (currentPrice * 0.018);
    points.push({ ms, price: Math.max(0.01, basePrice + noise) });
  }
  const buyMarkers = sortedBuys.map((b) => {
    const t = (b.ms - startMs) / totalSpan;
    return { t, price: b.pricePerShare, buy: b };
  });
  return { points, buyMarkers, start, end };
};

// Aggregates total portfolio value over time by summing per-holding value at each sample timestamp.
// Uses the same anchor-based interpolation as generateChartFromBuys, but combined across holdings.
const generatePortfolioChart = (portfolio, range) => {
  if (!portfolio || portfolio.length === 0) return { points: [], start: new Date(), end: new Date() };

  // Find the earliest buy across all holdings to bound ALL
  const allBuys = portfolio.flatMap((h) => h.buys);
  const { start, end } = getRangeBounds(range, allBuys);
  const startMs = start.getTime(), endMs = end.getTime();
  const totalSpan = Math.max(1, endMs - startMs);
  const sampleCount = 60;

  // Per-holding price curve sampled at the same timestamps
  const holdingCurves = portfolio.map((h) => {
    const seed = h.ticker.charCodeAt(0) * 31 + (h.ticker.charCodeAt(1) || 0);
    const sortedBuys = [...h.buys]
      .map((b) => ({ ...b, ms: parseBuyDate(b.date).getTime() }))
      .sort((a, b) => a.ms - b.ms);
    // Build price anchors
    const anchors = [];
    if (sortedBuys.length > 0) anchors.push({ ms: startMs, price: sortedBuys[0].pricePerShare });
    else anchors.push({ ms: startMs, price: h.currentPrice * 0.94 });
    sortedBuys.forEach((b) => anchors.push({ ms: b.ms, price: b.pricePerShare }));
    anchors.push({ ms: endMs, price: h.currentPrice });
    const uniqueAnchors = [];
    anchors.forEach((a) => {
      const last = uniqueAnchors[uniqueAnchors.length - 1];
      if (last && Math.abs(last.ms - a.ms) < 60000) return;
      uniqueAnchors.push(a);
    });
    return { h, seed, sortedBuys, uniqueAnchors };
  });

  const points = [];
  for (let i = 0; i < sampleCount; i++) {
    const t = i / (sampleCount - 1);
    const ms = startMs + t * totalSpan;
    let totalValue = 0;
    holdingCurves.forEach(({ h, seed, sortedBuys, uniqueAnchors }) => {
      // Shares OWNED at this point in time = sum of buys with buy.ms <= ms
      const sharesAtT = sortedBuys
        .filter((b) => b.ms <= ms)
        .reduce((acc, b) => acc + b.cashbackAmount / b.pricePerShare, 0);
      if (sharesAtT === 0) return;
      // Interpolate price at ms
      let upper = uniqueAnchors.findIndex((a) => a.ms >= ms);
      if (upper === -1) upper = uniqueAnchors.length - 1;
      if (upper === 0) upper = 1;
      const lower = upper - 1;
      const a1 = uniqueAnchors[lower], a2 = uniqueAnchors[upper];
      const spanRatio = a2.ms === a1.ms ? 0 : (ms - a1.ms) / (a2.ms - a1.ms);
      const basePrice = a1.price + (a2.price - a1.price) * spanRatio;
      const noise = (seededRand(seed + i * 3.7) - 0.5) * (h.currentPrice * 0.012);
      const price = Math.max(0.01, basePrice + noise);
      totalValue += sharesAtT * price;
    });
    points.push({ ms, price: totalValue });
  }
  return { points, start, end };
};

const MicroChart = ({ points, buyMarkers = [], positive = true, height = 90, showMarkers = false }) => {
  if (!points || points.length === 0) return null;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const rng = max - min || 1;
  const w = 320;
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: height - 10 - ((p.price - min) / rng) * (height - 20),
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const fillD = `${pathD} L ${w} ${height} L 0 ${height} Z`;
  const color = positive ? "var(--green)" : "var(--red)";
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`mc-${positive ? "u" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#mc-${positive ? "u" : "d"})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      {showMarkers && buyMarkers.map((m, i) => {
        const x = m.t * w;
        const y = height - 10 - ((m.price - min) / rng) * (height - 20);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill="var(--gold)" stroke="var(--bg-0)" strokeWidth="2" />
            <circle cx={x} cy={y} r="2" fill="var(--bg-0)" />
          </g>
        );
      })}
    </svg>
  );
};

// Interactive chart: hover (mouse) + drag (touch) to scrub. Shows vertical line + date/price tooltip.
const InteractiveChart = ({ points, positive = true, height = 140, onScrub, defaultLabel }) => {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const w = 340;
  if (!points || points.length === 0) return null;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const rng = max - min || 1;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: height - 14 - ((p.price - min) / rng) * (height - 28),
    price: p.price,
    ms: p.ms,
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const fillD = `${pathD} L ${w} ${height} L 0 ${height} Z`;
  const color = positive ? "var(--green)" : "var(--red)";

  const handleMove = (clientX) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * w;
    const clamped = Math.max(0, Math.min(w, relX));
    const idx = Math.round((clamped / w) * (points.length - 1));
    setHoverIdx(idx);
    if (onScrub) onScrub(points[idx]);
  };
  const handleEnd = () => {
    setHoverIdx(null);
    if (onScrub) onScrub(null);
  };

  const scrub = hoverIdx !== null ? coords[hoverIdx] : null;
  const dateFormatter = (ms) => {
    const d = new Date(ms);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  };

  return (
    <div style={{ position: "relative", touchAction: "none", userSelect: "none" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${height}`}
        width="100%" height={height}
        preserveAspectRatio="none"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
        onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
        onTouchEnd={handleEnd}
      >
        <defs>
          <linearGradient id={`ic-fill-${positive ? "u" : "d"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#ic-fill-${positive ? "u" : "d"})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {scrub && (
          <g>
            <line x1={scrub.x} y1="0" x2={scrub.x} y2={height}
                  stroke="var(--text-2)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <circle cx={scrub.x} cy={scrub.y} r="6" fill={color} stroke="var(--bg-0)" strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {scrub && (
        <div style={{
          position: "absolute",
          top: 4,
          left: `${(scrub.x / w) * 100}%`,
          transform: `translateX(${scrub.x < w * 0.25 ? "0" : scrub.x > w * 0.75 ? "-100%" : "-50%"})`,
          pointerEvents: "none",
          background: "var(--bg-deep)",
          border: "1px solid var(--border-strong)",
          borderRadius: 8,
          padding: "6px 10px",
          minWidth: 100,
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        }}>
          <div className="sb-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.15 }}>
            ${scrub.price.toFixed(2)}
          </div>
          <div className="sb-mono" style={{ fontSize: 9.5, color: "var(--text-3)", marginTop: 1 }}>
            {dateFormatter(scrub.ms)}
          </div>
        </div>
      )}
    </div>
  );
};

const RangeTabs = ({ active, onChange }) => (
  <div style={{ display: "flex", gap: 4, padding: "4px", background: "var(--bg-1)", borderRadius: 10 }}>
    {RANGES.map((r) => (
      <button key={r.id} onClick={() => onChange(r.id)} style={{
        flex: 1, padding: "6px 4px", borderRadius: 8,
        background: active === r.id ? "var(--bg-2)" : "transparent",
        border: "none",
        color: active === r.id ? "var(--text-1)" : "var(--text-3)",
        fontSize: 10.5, fontWeight: 600, cursor: "pointer",
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em",
      }}>{r.label}</button>
    ))}
  </div>
);

// ==================== PURCHASE DETAIL ====================
const PurchaseDetail = ({ item, card, cardsMap, userCards, onClose, onUpdate, onDelete }) => {
  const [editCard, setEditCard] = useState(false);
  const [editCategory, setEditCategory] = useState(false);
  const totalSpent = sumPurchases(item);
  const cashback = cashbackFor(item, cardsMap);
  const rate = card ? rateForCategory(card, item.category) : 1;
  const redemption = card ? inferRedemption(card) : "cash";
  const isPoints = redemption !== "cash";

  const reassign = (newCardId) => {
    onUpdate({ ...item, cardId: newCardId });
    setEditCard(false);
  };
  const setCategory = (cat) => {
    onUpdate({ ...item, category: cat });
    setEditCategory(false);
  };

  const allCategories = useMemo(() => {
    const s = new Set();
    userCards.forEach((c) => c.rewards.forEach((r) => s.add(r.category)));
    return Array.from(s);
  }, [userCards]);

  return (
    <BottomSheet onClose={onClose} title={`${item.merchant} → ${item.ticker}`}>
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "16px 22px 24px" }}>
        <div style={{
          padding: "16px 18px", borderRadius: 14, marginBottom: 14,
          background: `linear-gradient(135deg, ${getBrandColor(item.ticker)}22, ${getBrandColor(item.ticker)}08)`,
          border: `1px solid ${getBrandColor(item.ticker)}44`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <TickerBadge ticker={item.ticker} size={50} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>Cashback earned</div>
            <div className="sb-mono" style={{ fontSize: 22, color: "var(--text-1)", fontWeight: 600, letterSpacing: "-0.02em" }}>
              ${cashback.toFixed(2)}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 2 }}>
              {rate}% on ${totalSpent.toFixed(2)} · {item.category}
            </div>
            {isPoints && <div style={{ marginTop: 4 }}><RedemptionExplainer card={card} /></div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setEditCard(true)} style={{
            padding: "11px 14px", borderRadius: 12,
            background: "var(--bg-1)", border: "1px solid var(--border)",
            color: "var(--text-1)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <CreditCard size={14} color="var(--text-2)" />
            <div style={{ flex: 1, textAlign: "left", fontSize: 12 }}>
              <div style={{ color: "var(--text-3)", fontSize: 10, marginBottom: 1 }}>Card</div>
              <div style={{ color: "var(--text-1)" }}>{card?.shortName || "—"}</div>
            </div>
            <Edit3 size={12} color="var(--text-3)" />
          </button>
          <button onClick={() => setEditCategory(true)} style={{
            padding: "11px 14px", borderRadius: 12,
            background: "var(--bg-1)", border: "1px solid var(--border)",
            color: "var(--text-1)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Percent size={14} color="var(--text-2)" />
            <div style={{ flex: 1, textAlign: "left", fontSize: 12 }}>
              <div style={{ color: "var(--text-3)", fontSize: 10, marginBottom: 1 }}>Category</div>
              <div style={{ color: "var(--text-1)" }}>{item.category}</div>
            </div>
            <Edit3 size={12} color="var(--text-3)" />
          </button>
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Purchases ({item.purchases.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
          {item.purchases.map((p, i) => (
            <div key={i} style={{
              padding: "10px 12px", borderRadius: 10,
              background: "var(--bg-1)",
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 11.5,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-1)", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.desc}
                </div>
                <div className="sb-mono" style={{ fontSize: 9.5, color: "var(--text-3)" }}>{p.date}</div>
              </div>
              <div className="sb-mono" style={{ fontWeight: 600, color: "var(--text-1)" }}>
                ${p.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { onDelete(item.id); onClose(); }} style={{
          width: "100%", padding: "11px", borderRadius: 12,
          background: "transparent", border: "1px solid var(--red)",
          color: "var(--red)", fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}><Trash2 size={12} /> Delete flip</button>
      </div>

      {editCard && (
        <BottomSheet onClose={() => setEditCard(false)} title="Reassign to card">
          <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "12px 22px 24px", display: "flex", flexDirection: "column", gap: 6 }}>
            {userCards.map((c) => (
              <button key={c.id} onClick={() => reassign(c.id)} style={{
                padding: "12px 14px", borderRadius: 12,
                background: c.id === item.cardId ? "var(--accent-soft)" : "var(--bg-1)",
                border: c.id === item.cardId ? "1px solid var(--accent)" : "1px solid var(--border)",
                color: "var(--text-1)", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 34, height: 22, borderRadius: 4, background: c.brandStyle.bg }} />
                <div style={{ flex: 1, fontSize: 12.5 }}>{c.shortName}</div>
                {c.id === item.cardId && <Check size={14} color="var(--accent-light)" />}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {editCategory && (
        <BottomSheet onClose={() => setEditCategory(false)} title="Change category">
          <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "12px 22px 24px", display: "flex", flexDirection: "column", gap: 6 }}>
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: "12px 14px", borderRadius: 12,
                background: cat === item.category ? "var(--accent-soft)" : "var(--bg-1)",
                border: cat === item.category ? "1px solid var(--accent)" : "1px solid var(--border)",
                color: "var(--text-1)", cursor: "pointer", textAlign: "left",
                fontSize: 12.5, fontWeight: 500,
              }}>{cat}</button>
            ))}
          </div>
        </BottomSheet>
      )}
    </BottomSheet>
  );
};

// ==================== MANUAL FLIP MODAL ====================
const ManualFlipModal = ({ userCards, onClose, onSubmit, onInvalidTicker, onGoToCards, defaultCardId }) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [cardId, setCardId] = useState(defaultCardId || userCards[0]?.id || "");
  const [ticker, setTicker] = useState("");
  const [category, setCategory] = useState("");
  const [suggested, setSuggested] = useState(null);       // merchant → ticker suggestion
  const [merchantSuggestion, setMerchantSuggestion] = useState(null); // ticker → merchant name
  const [resolving, setResolving] = useState(false);
  const merchantRef = useRef(merchant);
  useEffect(() => { merchantRef.current = merchant; }, [merchant]);

  // Merchant → ticker: hardcoded table first, then Yahoo search fallback (debounced 400ms)
  useEffect(() => {
    if (merchant.length < 3) { setSuggested(null); return; }
    const hit = lookupMerchant(merchant);
    if (hit && hit.ticker && hit.confidence >= 0.7) {
      setSuggested({ ticker: hit.ticker, category: hit.category, confidence: hit.confidence });
      return;
    }
    setSuggested(null);
    const key = merchant.toLowerCase();
    if (_searchCache[key] !== undefined) { setSuggested(_searchCache[key]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yahoo?endpoint=search&q=${encodeURIComponent(merchant)}`);
        if (res.ok) {
          const data = await res.json();
          const found = (data?.quotes || []).find((h) => h?.symbol && (h.quoteType === "EQUITY" || h.quoteType === "ETF"));
          if (found?.symbol) {
            const suggestion = { ticker: found.symbol, name: found.shortname || found.longname || found.symbol, fromYahoo: true };
            _searchCache[key] = suggestion;
            setSuggested(suggestion);
          } else {
            _searchCache[key] = null;
          }
        }
      } catch (_) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [merchant]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ticker → merchant name: auto-fill if merchant empty, suggest if it differs (debounced 400ms)
  useEffect(() => {
    const tkr = ticker.trim().toUpperCase();
    if (!/^[A-Z]{2,5}$/.test(tkr)) { setMerchantSuggestion(null); return; }
    const timer = setTimeout(async () => {
      try {
        const result = await fetchYahooQuote(tkr);
        if (result?.name && result.name !== tkr) {
          const cur = merchantRef.current.trim();
          if (!cur) {
            setMerchant(result.name);
          } else if (cur.toLowerCase() !== result.name.toLowerCase()) {
            setMerchantSuggestion(result.name);
          }
        }
      } catch (_) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  const card = userCards.find((c) => c.id === cardId);

  const allCategories = useMemo(() => {
    return MANUAL_FLIP_CATEGORIES.map((cat) => {
      if (!card) return { value: cat, label: cat };
      const r = rateForCategory(card, cat);
      return { value: cat, label: r > 1 ? `${cat} — ${r}% back` : cat };
    });
  }, [card]);
  const parsedAmt = parseFloat(amount) || 0;
  const rate = card ? rateForCategory(card, category || "Everything") : 1;
  const estCashback = parsedAmt * (rate / 100);
  const ready = merchant.trim() && ticker.trim() && parsedAmt > 0 && cardId;

  const submit = async () => {
    if (!ready || resolving) return;
    setResolving(true);
    const tkr = ticker.trim().toUpperCase();
    const resolved = await resolveTicker(tkr);
    setResolving(false);
    if (!resolved) {
      if (onInvalidTicker) onInvalidTicker({
        query: tkr,
        reason: `We couldn't verify "${tkr}" against live market data on Yahoo Finance. It may be an invalid symbol, or the connection was blocked.`,
      });
      return;
    }
    onSubmit({
      id: `manual-${Date.now()}`,
      ticker: resolved.ticker,
      merchant: merchant.trim(),
      category: category || "Everything",
      cardId, confidence: 1,
      purchases: [{
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        desc: merchant.trim().toUpperCase(),
        amount: parsedAmt,
      }],
      flipped: false, done: false, statementId: null,
      resolvedPrice: resolved.price, resolvedName: resolved.name,
    });
  };

  if (userCards.length === 0) {
    return (
      <BottomSheet onClose={onClose} title="Add manual flip">
        <div style={{ padding: "36px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CreditCard size={38} color="var(--text-3)" style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>No cards added yet</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.5 }}>Add a credit card first so we can calculate your cashback rate.</div>
          <button onClick={onGoToCards} style={{
            padding: "11px 28px", borderRadius: 12, border: "none",
            background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Add a card</button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet onClose={onClose} title="Add manual flip">
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 22px 24px" }}>
        <LabeledInput label="Merchant" placeholder="e.g. Starbucks, Apple, Chipotle" value={merchant} onChange={(v) => { setMerchant(v); setMerchantSuggestion(null); }} />
        {suggested && (
          <div style={{
            padding: "9px 12px", borderRadius: 10, marginBottom: 12,
            background: "var(--accent-soft)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Sparkles size={13} color="var(--accent-light)" />
            <div style={{ flex: 1, fontSize: 11, color: "var(--text-1)" }}>
              Ticker: <b>{suggested.ticker}</b>{suggested.category ? ` (${suggested.category})` : suggested.name ? ` — ${suggested.name}` : ""}
            </div>
            <button onClick={() => { setTicker(suggested.ticker); if (suggested.category) setCategory(suggested.category); setSuggested(null); }} style={{
              padding: "4px 8px", borderRadius: 7, border: "none",
              background: "var(--accent)", color: "#fff", fontSize: 10.5, fontWeight: 500, cursor: "pointer",
            }}>Use</button>
          </div>
        )}
        <LabeledInput label="Amount ($)" placeholder="0.00" value={amount} onChange={setAmount} />
        <LabeledInput label="Ticker" placeholder="e.g. SBUX" value={ticker} onChange={(v) => { setTicker(v.toUpperCase()); setMerchantSuggestion(null); }} />
        {merchantSuggestion && (
          <div style={{
            padding: "9px 12px", borderRadius: 10, marginBottom: 12,
            background: "var(--accent-soft)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Sparkles size={13} color="var(--accent-light)" />
            <div style={{ flex: 1, fontSize: 11, color: "var(--text-1)" }}>
              Merchant: <b>{merchantSuggestion}</b>
            </div>
            <button onClick={() => { setMerchant(merchantSuggestion); setMerchantSuggestion(null); }} style={{
              padding: "4px 8px", borderRadius: 7, border: "none",
              background: "var(--accent)", color: "#fff", fontSize: 10.5, fontWeight: 500, cursor: "pointer",
            }}>Use</button>
          </div>
        )}
        <SelectInput label="Card" value={cardId} onChange={setCardId}
          options={userCards.map((c) => ({ value: c.id, label: c.shortName }))} />
        <SelectInput label="Category" value={category} onChange={setCategory}
          options={[{ value: "", label: "Select category..." }, ...allCategories]} />
        {parsedAmt > 0 && card && (
          <div style={{
            padding: "10px 12px", borderRadius: 10, marginTop: 4, marginBottom: 14,
            background: "var(--bg-1)", border: "1px solid var(--border)",
            fontSize: 11.5, color: "var(--text-2)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>Estimated cashback at {rate}%</span>
            <span className="sb-mono" style={{ color: "var(--green)", fontWeight: 600 }}>${estCashback.toFixed(2)}</span>
          </div>
        )}
        <button onClick={submit} disabled={!ready || resolving} style={{
          width: "100%", padding: "13px", marginTop: 6,
          background: (ready && !resolving) ? "var(--accent)" : "var(--bg-1)",
          color: (ready && !resolving) ? "#fff" : "var(--text-4)",
          border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600,
          cursor: (ready && !resolving) ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {resolving ? (
            <><div style={{
              width: 13, height: 13, borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              animation: "spin 0.7s linear infinite",
            }} /> Verifying ticker…</>
          ) : "Add flip"}
        </button>
      </div>
    </BottomSheet>
  );
};

// ==================== PORTFOLIO TAB ====================
const PortfolioTab = ({ portfolio, onOpenTicker, connectedBrokers, broker }) => {
  const [showAllPositions, setShowAllPositions] = useState(false);
  const [moverSort, setMoverSort] = useState("weight");
  const [portfolioRange, setPortfolioRange] = useState("1Y");
  const [scrubbedPoint, setScrubbedPoint] = useState(null);

  const holdingsData = portfolio.map((h) => {
    const s = deriveHoldingStats(h);
    return { h, ...s };
  });

  const totalInvested = holdingsData.reduce((a, b) => a + b.totalInvested, 0);
  const totalValue = holdingsData.reduce((a, b) => a + b.currentValue, 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const portfolioChart = useMemo(
    () => generatePortfolioChart(portfolio, portfolioRange),
    [portfolio.length, portfolio.map((h) => h.currentPrice).join(","), portfolioRange]
  );

  // Display value: scrubbed value OR live total
  const displayValue = scrubbedPoint ? scrubbedPoint.price : totalValue;
  const displayDate = scrubbedPoint
    ? new Date(scrubbedPoint.ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Today";

  const moverSorters = {
    pct:    (a, b) => b.h.dayChangePct - a.h.dayChangePct,
    dollar: (a, b) => (b.h.dayChangeDollar * b.shares) - (a.h.dayChangeDollar * a.shares),
    alpha:  (a, b) => a.h.ticker.localeCompare(b.h.ticker),
    weight: (a, b) => b.currentValue - a.currentValue,
  };
  const sortedMovers = [...holdingsData].sort(moverSorters[moverSort]);

  const activeBroker = BROKER_PRESETS.find((b) => b.id === broker);
  const activeBrokerConnected = activeBroker?.connectable && !!connectedBrokers?.[broker];

  if (portfolio.length === 0) {
    return (
      <div style={{ flex: 1, padding: "28px 22px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <PiggyBank size={42} color="var(--text-3)" />
        <div style={{ fontSize: 17, color: "var(--text-1)", marginTop: 14, fontWeight: 500 }}>No positions yet</div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 6, maxWidth: 260, lineHeight: 1.5 }}>
          Flip some cashback into shares from the Flip tab and they'll appear here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: "auto", minHeight: 0 }} className="soft-scroll">
      <div style={{ padding: "24px 22px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <StockbackLogo size={22} color={totalGain >= 0 ? "var(--green)" : "var(--red)"} />
            <div style={{ fontSize: 11.5, color: "var(--text-2)", fontWeight: 500 }}>
              {scrubbedPoint ? "Portfolio value" : "Portfolio value"}
            </div>
          </div>
        </div>
        <div className="sb-mono" style={{
          fontSize: 40, color: "var(--text-1)", lineHeight: 1,
          fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 6,
          transition: "color 0.15s",
        }}>
          ${displayValue.toFixed(2)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          {totalGain >= 0 ? <TrendingUp size={13} color="var(--green)" /> : <TrendingDown size={13} color="var(--red)" />}
          <span className="sb-mono" style={{ color: totalGain >= 0 ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
            {totalGain >= 0 ? "+" : ""}${totalGain.toFixed(2)} ({totalGain >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}%)
          </span>
          <span style={{ color: "var(--text-3)", fontSize: 11, marginLeft: 4 }}>· {displayDate}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, lineHeight: 1.4 }}>
          Your cashback is earning cashback. <b style={{ color: "var(--text-1)" }}>${totalInvested.toFixed(2)}</b> grown to <b style={{ color: "var(--green)" }}>${totalValue.toFixed(2)}</b>.
        </div>

        {/* Portfolio chart */}
        {portfolioChart.points.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              background: "var(--bg-1)", borderRadius: 14,
              padding: "14px 10px 10px", border: "1px solid var(--border)",
              position: "relative",
            }}>
              <InteractiveChart
                points={portfolioChart.points}
                positive={totalGain >= 0}
                height={140}
                onScrub={setScrubbedPoint}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <RangeTabs active={portfolioRange} onChange={setPortfolioRange} />
            </div>
            <div style={{ fontSize: 9.5, color: "var(--text-4)", textAlign: "center", marginTop: 6 }}>
              Tap or drag chart to scrub
            </div>
          </div>
        )}

        {activeBrokerConnected && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 10,
            background: "var(--accent-soft)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <CheckCircle2 size={12} color="var(--accent-light)" />
            <div style={{ fontSize: 11, color: "var(--text-1)", flex: 1 }}>
              Auto-sync via <b>{activeBroker.name}</b>
            </div>
            <DemoPill tooltip="Auto-sync is simulated" />
          </div>
        )}
      </div>

      <div style={{ padding: "16px 22px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Positions · {holdingsData.length}
          </div>
          <select value={moverSort} onChange={(e) => setMoverSort(e.target.value)} className="sb-mono" style={{
            padding: "5px 24px 5px 10px", borderRadius: 8,
            background: "var(--bg-1)", border: "1px solid var(--border)",
            color: "var(--text-2)", fontSize: 10.5, outline: "none",
            appearance: "none",
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'><path d='M1 1l3 3 3-3' stroke='%23a3abbd' fill='none' stroke-width='1.5'/></svg>\")",
            backgroundRepeat: "no-repeat", backgroundPosition: "right 7px center", cursor: "pointer",
          }}>
            <option value="weight">Position size</option>
            <option value="pct">% change</option>
            <option value="dollar">$ change</option>
            <option value="alpha">Ticker A-Z</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(showAllPositions ? sortedMovers : sortedMovers.slice(0, 20)).map((d) => (
            <MoverRow key={d.h.ticker} data={d} onClick={() => onOpenTicker(d.h.ticker)} />
          ))}
        </div>
        {holdingsData.length > 20 && (
          <button onClick={() => setShowAllPositions(!showAllPositions)} style={{
            width: "100%", padding: "11px 14px", borderRadius: 12, marginTop: 10,
            background: "transparent", border: "1px solid var(--border-strong)",
            color: "var(--text-2)", fontSize: 12, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {showAllPositions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showAllPositions ? "Show top 20" : `View all ${holdingsData.length} positions`}
          </button>
        )}
      </div>
    </div>
  );
};

const MoverRow = ({ data, onClick }) => {
  const { h, currentValue, shares } = data;
  const positive = h.dayChangePct >= 0;
  const dollarChange = h.dayChangeDollar * shares;
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "11px 12px", borderRadius: 12,
      background: "var(--bg-1)", border: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: 11,
      cursor: "pointer", textAlign: "left",
    }}>
      <BrandTile merchant={h.ticker} ticker={h.ticker} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 600 }}>{h.ticker}</div>
        <div className="sb-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>${currentValue.toFixed(2)}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="sb-mono" style={{ fontSize: 13, color: positive ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
          {positive ? "+" : ""}{h.dayChangePct.toFixed(2)}%
        </div>
        <div className="sb-mono" style={{ fontSize: 11, color: "var(--text-4)" }}>
          {positive ? "+" : ""}${dollarChange.toFixed(2)}
        </div>
      </div>
    </button>
  );
};

// ==================== TICKER DETAIL MODAL ====================
const TickerDetailModal = ({ ticker, holding, onClose, onBrokerClick, broker, connectedBrokers }) => {
  const [range, setRange] = useState("1Y");
  const [showAllBuys, setShowAllBuys] = useState(false);
  const stats = deriveHoldingStats(holding);
  const positive = stats.gain >= 0;
  const chart = useMemo(() => generateChartFromBuys(ticker, holding.currentPrice, holding.buys, range), [ticker, holding.currentPrice, holding.buys.length, range]);
  const activeBroker = BROKER_PRESETS.find((b) => b.id === broker);
  const sortedBuys = [...holding.buys].sort((a, b) => parseBuyDate(b.date) - parseBuyDate(a.date));
  const displayBuys = showAllBuys ? sortedBuys : sortedBuys.slice(0, 3);

  return (
    <BottomSheet onClose={onClose} title={`${ticker} · $${holding.currentPrice.toFixed(2)}`}>
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <TickerBadge ticker={ticker} size={48} radius={13} />
          <div style={{ flex: 1 }}>
            <div className="sb-mono" style={{ fontSize: 20, color: "var(--text-1)", fontWeight: 600 }}>
              ${stats.currentValue.toFixed(2)}
            </div>
            <div className="sb-mono" style={{
              fontSize: 11, color: positive ? "var(--green)" : "var(--red)", fontWeight: 500,
            }}>
              {positive ? "+" : ""}${stats.gain.toFixed(2)} ({positive ? "+" : ""}{stats.gainPct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 10, background: "var(--bg-1)", borderRadius: 14, padding: "12px 12px 10px" }}>
          <MicroChart points={chart.points} buyMarkers={chart.buyMarkers} positive={positive} height={140} showMarkers={true} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <RangeTabs active={range} onChange={setRange} />
          {chart.buyMarkers.length > 0 && (
            <div style={{ fontSize: 9.5, color: "var(--text-3)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--gold)" }} />
              Gold dots mark your flips
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          <StatTile label="Shares" value={stats.shares.toFixed(4)} />
          <StatTile label="Avg cost" value={`$${stats.avgPrice.toFixed(2)}`} />
          <StatTile label="Cashback in" value={`$${stats.totalInvested.toFixed(2)}`} />
          <StatTile label="Today" value={`${holding.dayChangePct >= 0 ? "+" : ""}${holding.dayChangePct.toFixed(2)}%`}
            valueColor={holding.dayChangePct >= 0 ? "var(--green)" : "var(--red)"} />
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Buys · {holding.buys.length}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
          {displayBuys.map((b, i) => (
            <div key={i} style={{
              padding: "9px 12px", borderRadius: 10,
              background: "var(--bg-1)",
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 11,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: 999, background: "var(--gold)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sb-mono" style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 12 }}>{b.date}</div>
                <div className="sb-mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                  ${b.cashbackAmount.toFixed(2)} @ ${b.pricePerShare.toFixed(2)} · {b.rate}% {b.category}
                </div>
              </div>
              <div className="sb-mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>
                {(b.cashbackAmount / b.pricePerShare).toFixed(5)} shares
              </div>
            </div>
          ))}
        </div>
        {sortedBuys.length > 3 && (
          <button onClick={() => setShowAllBuys(!showAllBuys)} style={{
            width: "100%", padding: "9px 12px", borderRadius: 10, marginBottom: 14,
            background: "transparent", border: "1px solid var(--border-strong)",
            color: "var(--text-2)", fontSize: 11, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            {showAllBuys ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showAllBuys ? "Show fewer" : `Show all ${sortedBuys.length} buys`}
          </button>
        )}

        <button onClick={() => onBrokerClick(ticker)} style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: "var(--accent)", color: "#fff", border: "none",
          fontSize: 12.5, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        }}>
          <ExternalLink size={13} /> View on {activeBroker?.name || "broker"}
        </button>
      </div>
    </BottomSheet>
  );
};

const StatTile = ({ label, value, valueColor }) => (
  <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg-1)", border: "1px solid var(--border)" }}>
    <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div className="sb-mono" style={{ fontSize: 15, color: valueColor || "var(--text-1)", fontWeight: 700, letterSpacing: "-0.01em" }}>{value}</div>
  </div>
);

// ==================== CARDS TAB ====================
const CardsTab = ({ userCards, setUserCards, flips, setFlips, merchantSpending, onShowToast }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [removingCard, setRemovingCard] = useState(null);

  const flipsByCard = useMemo(() => {
    const m = {};
    flips.forEach((f) => { m[f.cardId] = (m[f.cardId] || 0) + 1; });
    return m;
  }, [flips]);

  const reassignFromCard = (cardId, targetCardId) => {
    if (!targetCardId) return;
    setFlips((arr) => arr.map((f) => f.cardId === cardId ? { ...f, cardId: targetCardId } : f));
  };

  if (userCards.length === 0) {
    return (
      <div style={{ flex: 1, overflow: "auto", padding: "26px 22px", minHeight: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Your cards
        </div>
        <div style={{ padding: "30px 18px", borderRadius: 14, background: "var(--bg-1)", border: "1px dashed var(--text-4)", textAlign: "center" }}>
          <CreditCard size={30} color="var(--text-3)" style={{ margin: "0 auto 10px", display: "block" }} />
          <div style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>No cards added yet</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, marginBottom: 14 }}>
            Add a card to start tracking cashback.
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            padding: "10px 14px", borderRadius: 10,
            background: "var(--accent)", color: "#fff",
            border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer",
          }}>+ Add a card</button>
        </div>
        {showAdd && <AddCardModal existing={userCards} onClose={() => setShowAdd(false)}
          onAdd={(c) => { setUserCards((cs) => [...cs, c]); setShowAdd(false); }} />}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: "auto", minHeight: 0 }} className="soft-scroll">
      <div style={{ padding: "26px 22px 8px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Your cards · {userCards.length}
        </div>
      </div>
      <div style={{ padding: "0 22px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {userCards.map((c) => {
          const type = inferRedemption(c);
          return (
            <div key={c.id} style={{ position: "relative" }}>
              <button onClick={() => setEditingCard(c)} style={{
                width: "100%", padding: 0, border: "none", background: "transparent",
                cursor: "pointer", borderRadius: 16, overflow: "hidden",
              }}>
                <CardVisual card={c} />
              </button>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginTop: 6, padding: "0 4px",
              }}>
                <div style={{ flex: 1, fontSize: 10.5, color: "var(--text-3)" }}>
                  {flipsByCard[c.id] ? `${flipsByCard[c.id]} flip${flipsByCard[c.id] !== 1 ? "s" : ""}` : "No flips yet"}
                </div>
                {type !== "cash" && <RedemptionBadge card={c} size="sm" />}
                <button onClick={() => setRemovingCard(c)} style={{
                  border: "none", background: "transparent", color: "var(--text-4)",
                  padding: "3px 6px", borderRadius: 6, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 3, fontSize: 10,
                }}>
                  <Trash2 size={10} /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "10px 22px 28px" }}>
        <button onClick={() => setShowAdd(true)} style={{
          width: "100%", padding: "18px 16px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 14,
          textAlign: "left",
          boxShadow: "0 6px 16px rgba(76, 139, 245, 0.3)",
          overflow: "hidden", position: "relative",
        }}>
          <MiniCardIllustration variant="catalog" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 2 }}>Add a card</div>
            <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.3 }}>Search the catalog — add manually if not found</div>
          </div>
          <ArrowRight size={18} color="#fff" strokeWidth={2.3} />
        </button>
      </div>

      {showAdd && <AddCardModal existing={userCards} onClose={() => setShowAdd(false)}
        onAdd={(c) => { setUserCards((cs) => [...cs, c]); setShowAdd(false); }}
        onOpenCustom={() => { setShowAdd(false); setShowCustom(true); }} />}
      {showCustom && <CustomCardModal onClose={() => setShowCustom(false)}
        onAdd={(c) => { setUserCards((cs) => [...cs, c]); setShowCustom(false); }} />}
      {editingCard && <EditCardModal card={editingCard} merchantSpending={merchantSpending}
        onClose={() => setEditingCard(null)}
        onSave={(updated) => { setUserCards((cs) => cs.map((c) => c.id === updated.id ? updated : c)); setEditingCard(null); }} />}
      {removingCard && <RemoveCardModal card={removingCard} otherCards={userCards.filter((c) => c.id !== removingCard.id)}
        flipCount={flipsByCard[removingCard.id] || 0}
        onClose={() => setRemovingCard(null)}
        onConfirm={(reassignTo) => {
          const snap = { cards: userCards, flips };
          if (reassignTo && flipsByCard[removingCard.id]) {
            reassignFromCard(removingCard.id, reassignTo);
          }
          setUserCards((cs) => cs.filter((c) => c.id !== removingCard.id));
          onShowToast({
            label: `Removed ${removingCard.shortName}`,
            onUndo: () => { setUserCards(snap.cards); setFlips(snap.flips); },
          });
          setRemovingCard(null);
        }} />}
    </div>
  );
};

const EditCardModal = ({ card, merchantSpending, onClose, onSave }) => {
  const [name, setName] = useState(card.name);
  const [rewards, setRewards] = useState(card.rewards.map((r) => ({ ...r })));
  const save = () => {
    const clean = rewards.filter((r) => r.category && r.rate !== "").map((r) => ({ category: r.category, rate: parseFloat(r.rate) || 0 }));
    onSave({ ...card, name, shortName: name, rewards: clean });
  };
  return (
    <BottomSheet onClose={onClose} title={`Edit ${card.shortName}`}>
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 22px 24px" }}>
        <div style={{ marginBottom: 16 }}>
          <CardVisual card={{ ...card, name, rewards: rewards.filter((r) => r.category && r.rate !== "") }} />
        </div>
        <LabeledInput label="Card name" placeholder="Card name" value={name} onChange={setName} />
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-2)", marginBottom: 10 }}>Reward categories</div>
        <RewardEditor rewards={rewards} setRewards={setRewards} />
        <button onClick={save} style={{
          width: "100%", padding: "13px", marginTop: 18,
          background: "var(--accent)", color: "#fff",
          border: "none", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}>Save changes</button>
      </div>
    </BottomSheet>
  );
};

const RemoveCardModal = ({ card, otherCards, flipCount, onClose, onConfirm }) => {
  const [reassignTo, setReassignTo] = useState(otherCards[0]?.id || "");
  return (
    <BottomSheet onClose={onClose} title={`Remove ${card.shortName}?`}>
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 22px 24px" }}>
        <div style={{
          padding: "12px 14px", borderRadius: 12, marginBottom: 14,
          background: "rgba(255, 95, 109, 0.08)", border: "1px solid rgba(255, 95, 109, 0.25)",
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <AlertTriangle size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 11.5, color: "var(--text-1)", lineHeight: 1.5 }}>
            {flipCount > 0 ? `${flipCount} flip${flipCount !== 1 ? "s" : ""} use this card. Pick a replacement or they'll be orphaned.` : "This card has no flips."}
          </div>
        </div>
        {flipCount > 0 && otherCards.length > 0 && (
          <SelectInput label="Reassign flips to" value={reassignTo} onChange={setReassignTo}
            options={otherCards.map((c) => ({ value: c.id, label: c.shortName }))} />
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px", borderRadius: 12,
            border: "1px solid var(--border-strong)", background: "transparent",
            color: "var(--text-2)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => onConfirm(flipCount > 0 ? reassignTo : null)} style={{
            flex: 1, padding: "13px",
            background: "var(--red)", color: "#fff",
            border: "none", borderRadius: 12,
            fontSize: 12.5, fontWeight: 500, cursor: "pointer",
          }}>Remove card</button>
        </div>
      </div>
    </BottomSheet>
  );
};

// ==================== STATEMENTS TAB ====================
const StatementsTab = ({ statements, cardsMap, userCards, flips, setFlips, unassigned, setUnassigned, onShowToast }) => {
  const [showReminder, setShowReminder] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingStmt, setDeletingStmt] = useState(null); // statement object to delete
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  const deleteStatement = (stmt) => {
    const flipsSnap = flips;
    const unassignedSnap = unassigned;
    setFlips((arr) => arr.filter((f) => f.statementId !== stmt.id));
    setUnassigned((arr) => arr.filter((u) => u.statementId !== stmt.id));
    onShowToast({
      label: `Deleted ${stmt.month} statement`,
      onUndo: () => { setFlips(flipsSnap); setUnassigned(unassignedSnap); },
    });
    setDeletingStmt(null);
  };

  const deleteAllStatements = () => {
    const flipsSnap = flips;
    const unassignedSnap = unassigned;
    // Keep only items with no statementId (manual flips)
    setFlips((arr) => arr.filter((f) => !f.statementId));
    setUnassigned((arr) => arr.filter((u) => !u.statementId));
    onShowToast({
      label: `Deleted all ${statements.length} statements`,
      onUndo: () => { setFlips(flipsSnap); setUnassigned(unassignedSnap); },
    });
    setShowDeleteAll(false);
  };

  // Simulated statement-parse: generates 3-4 new flips + 1 unassigned for the chosen card
  const simulateUpload = (cardId) => {
    const flipsSnap = flips;
    const unassignedSnap = unassigned;
    const now = new Date();
    const yr = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const stmtId = `stmt-${yr}-${mo}-${Date.now().toString(36)}`;

    // Sample simulated charges — randomly pick a handful of merchants
    const merchantPool = [
      { merchant: "Amazon", ticker: "AMZN", category: "Shopping", desc: "AMAZON.COM", confidence: 0.98, amt: 42.80 + Math.random() * 60 },
      { merchant: "Starbucks", ticker: "SBUX", category: "Dining", desc: "STARBUCKS #44812", confidence: 0.99, amt: 8.75 + Math.random() * 6 },
      { merchant: "Uber", ticker: "UBER", category: "Travel", desc: "UBER TRIP", confidence: 0.97, amt: 18.50 + Math.random() * 25 },
      { merchant: "Target", ticker: "TGT", category: "Shopping", desc: "TARGET #2204", confidence: 0.96, amt: 52.30 + Math.random() * 40 },
      { merchant: "Chipotle", ticker: "CMG", category: "Dining", desc: "CHIPOTLE #1021", confidence: 0.99, amt: 14.80 + Math.random() * 6 },
      { merchant: "Apple Store", ticker: "AAPL", category: "Shopping", desc: "APPLE.COM/BILL", confidence: 0.98, amt: 9.99 + Math.random() * 80 },
    ];
    const shuffled = [...merchantPool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3 + Math.floor(Math.random() * 2));

    const today = now.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const newFlips = picked.map((m, i) => ({
      id: `upload-${stmtId}-${i}`,
      ticker: m.ticker, merchant: m.merchant, category: m.category,
      cardId, confidence: m.confidence,
      purchases: [{ date: today, desc: m.desc, amount: +m.amt.toFixed(2) }],
      flipped: false, done: false, statementId: stmtId,
    }));

    // One simulated unassigned
    const newUnassigned = [{
      id: `upload-un-${stmtId}`,
      merchant: "SQ *UNKNOWN VENDOR",
      rawDesc: "SQ *UNKNOWN VENDOR #77",
      category: "Shopping",
      amount: +(22 + Math.random() * 30).toFixed(2),
      date: today,
      cardId,
      statementId: stmtId,
      confidence: 0.25,
      suggestions: ["AMZN", "SHOP", "ETSY"],
    }];

    setFlips((arr) => [...newFlips, ...arr]);
    setUnassigned((arr) => [...newUnassigned, ...arr]);
    setShowUpload(false);

    onShowToast({
      label: `Parsed ${picked.length} charges + 1 unassigned`,
      onUndo: () => { setFlips(flipsSnap); setUnassigned(unassignedSnap); },
    });
  };

  const UploadButton = ({ variant }) => (
    <button onClick={() => setShowUpload(true)} style={{
      width: "100%", padding: variant === "hero" ? "14px 16px" : "12px 14px",
      borderRadius: 14,
      background: variant === "hero" ? "var(--accent)" : "var(--bg-1)",
      border: variant === "hero" ? "none" : "1px dashed var(--text-4)",
      color: variant === "hero" ? "#fff" : "var(--accent-light)",
      fontSize: 13, fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
      marginBottom: 14,
    }}>
      <Upload size={14} /> Upload a statement
    </button>
  );

  if (statements.length === 0) {
    return (
      <>
        <div style={{ flex: 1, padding: "28px 22px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 0 }}>
          <FileText size={42} color="var(--text-3)" />
          <div style={{ fontSize: 17, color: "var(--text-1)", marginTop: 14, fontWeight: 500 }}>No statements yet</div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 6, marginBottom: 18, maxWidth: 260, lineHeight: 1.5 }}>
            Upload a PDF or photo and we'll parse every charge into flips automatically.
          </div>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <UploadButton variant="hero" />
          </div>
        </div>
        {showUpload && (
          <StatementUploadSheet userCards={userCards} onClose={() => setShowUpload(false)} onUpload={simulateUpload} />
        )}
      </>
    );
  }

  const lastStmt = statements[0];
  const lastUpload = lastStmt?.uploadedAt && lastStmt.uploadedAt !== "—"
    ? new Date(lastStmt.uploadedAt)
    : null;
  const now = new Date();
  const daysSince = lastUpload ? Math.floor((now - lastUpload) / (1000 * 60 * 60 * 24)) : 99;
  const needsReminder = daysSince >= 25 && showReminder;

  return (
    <>
      <div style={{ flex: 1, overflow: "auto", padding: "26px 22px 28px", minHeight: 0 }} className="soft-scroll">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Statements · {statements.length}
          </div>
          <button onClick={() => setShowDeleteAll(true)} style={{
            padding: "5px 10px", borderRadius: 8,
            background: "transparent", border: "1px solid var(--border-strong)",
            color: "var(--red)", fontSize: 10.5, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <Trash2 size={11} /> Delete all
          </button>
        </div>

        <UploadButton variant="hero" />

        {needsReminder && (
          <div style={{
            padding: "12px 14px", marginBottom: 12, borderRadius: 14,
            background: "rgba(217, 179, 104, 0.08)",
            border: "1px solid var(--gold)",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <Bell size={14} color="var(--gold)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, fontSize: 11.5, color: "var(--text-1)", lineHeight: 1.5 }}>
              <b>Time to upload</b> — it's been {daysSince} days since your last statement. Don't let flips pile up.
            </div>
            <button onClick={() => setShowReminder(false)} style={{
              border: "none", background: "transparent", color: "var(--text-3)",
              cursor: "pointer", padding: 2,
            }}><X size={12} /></button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {statements.map((s) => (
            <div key={s.id} style={{
              padding: "14px 14px", borderRadius: 14,
              background: "var(--bg-1)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: "var(--accent-soft)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}><FileText size={16} color="var(--accent-light)" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 600 }}>{s.month}</div>
                <div className="sb-num" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                  {cardsMap[s.cardId]?.shortName || "—"} · {s.purchaseCount} charge{s.purchaseCount !== 1 ? "s" : ""} · {s.uploadedAt}
                </div>
              </div>
              <button onClick={() => setDeletingStmt(s)} title="Delete statement" style={{
                width: 32, height: 32, border: "none",
                background: "transparent", color: "var(--text-3)",
                borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </div>
      {showUpload && (
        <StatementUploadSheet userCards={userCards} onClose={() => setShowUpload(false)} onUpload={simulateUpload} />
      )}
      {deletingStmt && (
        <BottomSheet onClose={() => setDeletingStmt(null)} title={`Delete ${deletingStmt.month}?`}>
          <div style={{ padding: "18px 22px 24px" }}>
            <div style={{
              padding: "13px 14px", borderRadius: 12, marginBottom: 14,
              background: "rgba(255, 95, 109, 0.08)", border: "1px solid rgba(255, 95, 109, 0.25)",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <AlertTriangle size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.55 }}>
                Removes all {deletingStmt.purchaseCount} charge{deletingStmt.purchaseCount !== 1 ? "s" : ""} from this statement — including pending flips and unassigned items. Already-flipped positions stay in your portfolio. You can undo this.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeletingStmt(null)} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                background: "transparent", border: "1px solid var(--border-strong)",
                color: "var(--text-2)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={() => deleteStatement(deletingStmt)} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                background: "var(--red)", color: "#fff",
                border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}>Delete statement</button>
            </div>
          </div>
        </BottomSheet>
      )}
      {showDeleteAll && (
        <BottomSheet onClose={() => setShowDeleteAll(false)} title="Delete all statements?">
          <div style={{ padding: "18px 22px 24px" }}>
            <div style={{
              padding: "13px 14px", borderRadius: 12, marginBottom: 14,
              background: "rgba(255, 95, 109, 0.08)", border: "1px solid rgba(255, 95, 109, 0.25)",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <AlertTriangle size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.55 }}>
                Removes all {statements.length} statements and their {flips.filter((f) => f.statementId).length + unassigned.filter((u) => u.statementId).length} pending flips/unassigned items. Manual flips and already-flipped portfolio positions stay. You can undo this.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDeleteAll(false)} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                background: "transparent", border: "1px solid var(--border-strong)",
                color: "var(--text-2)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={deleteAllStatements} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                background: "var(--red)", color: "#fff",
                border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}>Delete all</button>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
};

// Simplified statement upload sheet for in-app reuse (the full StatementUpload component is used during onboarding).
const StatementUploadSheet = ({ userCards, onClose, onUpload }) => {
  const [selectedCardId, setSelectedCardId] = useState(userCards[0]?.id || "");
  const [method, setMethod] = useState(null); // null | 'pdf' | 'camera'
  const [parsing, setParsing] = useState(false);

  const startUpload = (kind) => {
    if (!selectedCardId) return;
    setMethod(kind);
    setParsing(true);
    // Simulate parsing animation
    setTimeout(() => onUpload(selectedCardId), 1400);
  };

  return (
    <BottomSheet onClose={onClose} title="Upload statement" maxHeight="85vh">
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 22px 24px" }}>
        {!parsing ? (
          <>
            {userCards.length === 0 ? (
              <div style={{ padding: "20px 14px", borderRadius: 12, background: "var(--bg-1)", border: "1px dashed var(--text-4)", textAlign: "center" }}>
                <div style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 500 }}>No cards yet</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Add a card first so we know which rewards rates to apply.</div>
              </div>
            ) : (
              <>
                <SelectInput label="Which card is this statement from?" value={selectedCardId} onChange={setSelectedCardId}
                  options={userCards.map((c) => ({ value: c.id, label: c.shortName }))} />

                <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)", marginTop: 6, marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Choose a method
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <UploadOption icon={FileText} title="Upload a PDF" desc="Statement file from your bank or email" onClick={() => startUpload("pdf")} demo />
                  <UploadOption icon={Camera} title="Take a photo" desc="Works best on mobile" onClick={() => startUpload("camera")} demo />
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ padding: "32px 14px 28px", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              border: "3px solid var(--bg-2)",
              borderTopColor: "var(--accent)",
              animation: "spin 0.9s linear infinite",
              margin: "0 auto 18px",
            }} />
            <div style={{
              fontSize: 16, color: "var(--text-1)", fontWeight: 700,
              letterSpacing: "-0.015em", marginBottom: 6,
            }}>
              {method === "pdf" ? "Parsing your statement" : "Reading your photo"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20, lineHeight: 1.5 }}>
              {method === "pdf"
                ? "Extracting transactions and matching merchants to tickers via Yahoo Finance."
                : "Running OCR on the image and matching merchants."}
            </div>
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              maxWidth: 280, margin: "0 auto", textAlign: "left",
            }}>
              {[
                { label: "Reading file", active: true },
                { label: "Extracting transactions", active: true },
                { label: "Matching merchants to tickers", active: false },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: "var(--bg-1)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 12, color: "var(--text-1)", fontWeight: 500,
                }}>
                  {s.active ? (
                    <div style={{
                      width: 14, height: 14, borderRadius: 999,
                      border: "2px solid var(--bg-2)", borderTopColor: "var(--accent-light)",
                      animation: "spin 0.8s linear infinite",
                      flexShrink: 0,
                    }} />
                  ) : (
                    <div style={{
                      width: 14, height: 14, borderRadius: 999,
                      background: "var(--bg-2)", flexShrink: 0,
                    }} />
                  )}
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

// ==================== SETTINGS SCREEN ====================
// SettingsTab is a FULL SCREEN that renders inside the content area like any other tab.
// It has its own sub-view system (theme / brokers / data / help / delete / feedback / connect)
// that push and pop via internal state — NOT as BottomSheet overlays.
// When user closes Settings (back arrow), onClose returns them to their last active tab.
const SettingsTab = ({
  themeId, setThemeId, broker, setBroker, connectedBrokers, setConnectedBrokers,
  onDeleteAccount, onClearData, onExitDemo, isDemoMode, onClose, onShowToast, onSignOut,
  supabaseUser, onSignIn, onDeleteSignedInAccount,
}) => {
  const [view, setView] = useState("main");
  const [brokerPickerOpen, setBrokerPickerOpen] = useState(false);
  // sub-views: main | theme | brokers | connect | data | help | delete | feedback | account | permissions

  // Hooks MUST be at top level — never inside conditional branches
  const [cameraStatus, setCameraStatus] = useState("unknown");
  const [notifStatus, setNotifStatus] = useState("unknown");
  useEffect(() => {
    if (view !== "permissions") return;
    const check = async () => {
      if (!navigator.permissions) return;
      try {
        const cam = await navigator.permissions.query({ name: "camera" });
        setCameraStatus(cam.state);
        const notif = await navigator.permissions.query({ name: "notifications" });
        setNotifStatus(notif.state);
      } catch (_) {}
    };
    check();
  }, [view]);

  const groupedThemes = useMemo(() => {
    const g = { Stockback: [], Brokerage: [] };
    Object.entries(THEMES).forEach(([id, t]) => {
      (g[t.family] || (g[t.family] = [])).push({ id, ...t });
    });
    return g;
  }, []);

  const goBack = () => { if (view === "main") onClose(); else setView("main"); };

  const Header = ({ title }) => (
    <div style={{
      padding: "16px 18px 12px", flexShrink: 0,
      display: "flex", alignItems: "center", gap: 10,
      borderBottom: "1px solid var(--border)",
    }}>
      <button onClick={goBack} style={{
        border: "none", background: "var(--bg-1)", color: "var(--text-2)",
        width: 32, height: 32, borderRadius: 10, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}><ArrowLeft size={14} /></button>
      <div style={{ fontSize: 16, color: "var(--text-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
    </div>
  );

  // Main settings index
  if (view === "main") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
        <Header title="Settings" />
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "16px 18px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Sign-in upgrade banner for guest / demo users */}
          {!supabaseUser && (
            <div style={{
              padding: "16px", borderRadius: 14, marginBottom: 4,
              background: "linear-gradient(135deg, var(--accent-soft) 0%, var(--bg-1) 100%)",
              border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 3 }}>
                Sign in to save your work
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.4 }}>
                Sync cards, flips, and portfolio across devices.
              </div>
              <button onClick={() => onSignIn?.("google")} style={{
                width: "100%", padding: "11px",
                background: "#ffffff", color: "#1a1a1a",
                border: "1px solid var(--border-strong)", borderRadius: 10,
                fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}><GoogleLogo /> Sign in with Google</button>
            </div>
          )}
          <SettingsRow icon={Palette} label="Theme" value={THEMES[themeId].label} onClick={() => setView("theme")} />
          <SettingsRow icon={Link2} label="Broker"
            value={BROKER_PRESETS.find((b) => b.id === broker)?.name || "Yahoo Finance"}
            onClick={() => setView("brokers")} />
          <SettingsRow icon={Database} label="Data" value={isDemoMode ? "Demo mode" : "Your data"} onClick={() => setView("data")} />
          <SettingsRow icon={Shield} label="Permissions" onClick={() => setView("permissions")} />
          <SettingsRow icon={MessageSquare} label="Send feedback" onClick={() => setView("feedback")} />
          <SettingsRow icon={HelpCircle} label="Help & About" onClick={() => setView("help")} />
          {supabaseUser && (
            <SettingsRow icon={User} label="Account" value={supabaseUser.email} onClick={() => setView("account")} />
          )}
          <SettingsRow icon={Trash2} label="Delete" danger onClick={() => setView("delete")} />
          <div style={{ fontSize: 10, color: "var(--text-4)", textAlign: "center", marginTop: 20, padding: "0 20px", lineHeight: 1.5 }}>
            <b style={{ color: "var(--text-3)" }}>Stockback</b> — design concept. No real accounts or trades. All flows are illustrative.
          </div>
        </div>
      </div>
    );
  }

  // Theme sub-view — tapping a theme applies it LIVE to the entire app including this screen
  if (view === "theme") {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
        background: "var(--bg-0)",
      }}>
        <Header title="Theme" />
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 18px 40px" }}>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 14, lineHeight: 1.5 }}>
            Each theme changes the app's colors AND typography. Tap to preview live — everything updates instantly.
          </div>
          {Object.entries(groupedThemes).map(([family, list]) => (
            <div key={family} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {family}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {list.map((t) => (
                  <ThemePreviewCard key={t.id} theme={t} active={themeId === t.id} onClick={() => setThemeId(t.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Brokers sub-view — searchable dropdown, selected broker shown inline with connect/disconnect
  if (view === "brokers") {
    const activeBroker = BROKER_PRESETS.find((b) => b.id === broker) || BROKER_PRESETS[0];
    const isActiveConnected = activeBroker.connectable && !!connectedBrokers?.[activeBroker.id];
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
        <Header title="Broker" />
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 18px 40px" }}>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 14, lineHeight: 1.5 }}>
            Pick where to view tickers. Some brokers support OAuth auto-sync to place your flips automatically.
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Selected broker
          </div>

          <button onClick={() => setBrokerPickerOpen(true)} style={{
            width: "100%", padding: "14px 16px", borderRadius: 14, marginBottom: 10,
            background: "var(--bg-1)", border: "1px solid var(--border-strong)",
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left",
          }}>
            <BrokerLogo brokerId={activeBroker.id} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>{activeBroker.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
                {activeBroker.connectable
                  ? (isActiveConnected
                      ? <><CheckCircle2 size={9} color="var(--green)" /> Connected · auto-sync on</>
                      : "Auto-sync available")
                  : "View-only (no API support)"}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-3)" />
          </button>

          {activeBroker.connectable && !isActiveConnected && (
            <button onClick={() => setView(`connect:${activeBroker.id}`)} style={{
              width: "100%", padding: "13px", borderRadius: 12,
              background: "var(--accent)", color: "#fff", border: "none",
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}><Link2 size={13} /> Connect to {activeBroker.name}</button>
          )}
          {activeBroker.connectable && isActiveConnected && (
            <button onClick={() => {
              setConnectedBrokers((m) => { const n = { ...m }; delete n[activeBroker.id]; return n; });
              onShowToast({
                label: `Disconnected ${activeBroker.name}`,
                onUndo: () => setConnectedBrokers((m) => ({ ...m, [activeBroker.id]: { connectedAt: new Date().toISOString() } })),
              });
            }} style={{
              width: "100%", padding: "13px", borderRadius: 12,
              background: "transparent", border: "1px solid var(--border-strong)",
              color: "var(--text-2)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}><Unlock size={13} /> Disconnect</button>
          )}
          {!activeBroker.connectable && (
            <div style={{
              padding: "11px 13px", borderRadius: 10,
              background: "var(--bg-1)", border: "1px solid var(--border)",
              fontSize: 10.5, color: "var(--text-3)", lineHeight: 1.5,
              display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <Info size={12} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>Flip buttons will deep-link into {activeBroker.name}'s web app. You'll manually confirm the purchase there.</div>
            </div>
          )}
        </div>

        {brokerPickerOpen && (
          <BrokerPickerSheet
            brokers={BROKER_PRESETS}
            current={broker}
            connectedBrokers={connectedBrokers}
            onPick={(id) => { setBroker(id); setBrokerPickerOpen(false); }}
            onClose={() => setBrokerPickerOpen(false)}
          />
        )}
      </div>
    );
  }

  // Connect broker sub-view (inline OAuth consent — NO production preamble)
  if (view.startsWith("connect:")) {
    const brokerId = view.split(":")[1];
    const brk = BROKER_PRESETS.find((b) => b.id === brokerId);
    if (!brk) return null;
    return <BrokerConnectScreen broker={brk} isDemoMode={isDemoMode} onBack={() => setView("brokers")}
      onConnect={() => {
        setConnectedBrokers((m) => ({ ...m, [brokerId]: { connectedAt: new Date().toISOString() } }));
        setBroker(brokerId);
        setView("brokers");
        onShowToast({ label: `Connected to ${brk.name}`, onUndo: () => setConnectedBrokers((m) => { const n = { ...m }; delete n[brokerId]; return n; }) });
      }} />;
  }

  // Data sub-view
  if (view === "data") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
        <Header title="Data" />
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 18px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            padding: "14px 16px", borderRadius: 14,
            background: isDemoMode
              ? "linear-gradient(135deg, rgba(217, 179, 104, 0.14) 0%, rgba(217, 179, 104, 0.04) 100%)"
              : "var(--bg-1)",
            border: isDemoMode ? "1px solid var(--gold)" : "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              {isDemoMode && <EyeOff size={12} color="var(--gold)" />}
              {isDemoMode ? "You're in demo mode" : "Your session data"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.55 }}>
              {isDemoMode
                ? "Your flips, portfolio, and statements are pre-filled demo data — no real broker or card is connected. Exit demo to sign in and start with your real cards."
                : "Nothing is saved to a server. Everything lives in this browser session and is wiped on refresh."}
            </div>
          </div>

          {isDemoMode && onExitDemo && (
            <button onClick={onExitDemo} style={{
              padding: "14px 16px", borderRadius: 14, marginTop: 2,
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
              border: "none", color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 11, textAlign: "left",
              boxShadow: "0 6px 16px rgba(76, 139, 245, 0.28)",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}><ArrowRight size={16} color="#fff" strokeWidth={2.6} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>Exit demo mode</div>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 1 }}>Sign in with Google or Apple to start fresh</div>
              </div>
            </button>
          )}

          {isDemoMode && (
            <button onClick={onClearData} style={{
              padding: "12px 14px", borderRadius: 12,
              background: "transparent", border: "1px solid var(--border-strong)",
              color: "var(--text-1)", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}><RefreshCw size={13} /> Clear demo flips, portfolio &amp; statements</button>
          )}

          <div style={{
            padding: "12px 14px", borderRadius: 12, marginTop: 8,
            background: "var(--bg-1)",
            fontSize: 10.5, color: "var(--text-3)", lineHeight: 1.5,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <Shield size={13} color="var(--gold)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>Stockback would never sell your spending data. In production: zero-knowledge ledger, export/delete anytime.</div>
          </div>
        </div>
      </div>
    );
  }

  // Feedback sub-view
  if (view === "feedback") {
    return <FeedbackScreen onBack={() => setView("main")} onSent={() => {
      setView("main");
      onShowToast({ label: "Feedback sent — thanks!", onUndo: null });
    }} />;
  }

  // Help sub-view
  if (view === "help") {
    return <HelpScreen onBack={() => setView("main")} />;
  }

  // Account sub-view (signed-in users only)
  if (view === "account") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
        <Header title="Account" />
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 18px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--bg-1)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Signed in as</div>
            <div style={{ fontSize: 13.5, color: "var(--text-1)", fontWeight: 500 }}>{supabaseUser?.email}</div>
          </div>
          <button onClick={onSignOut} style={{
            padding: "13px", borderRadius: 12, marginTop: 6,
            background: "transparent", border: "1px solid var(--border-strong)",
            color: "var(--text-1)", fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}><LogOut size={14} /> Sign out</button>
          <button onClick={onDeleteSignedInAccount} style={{
            padding: "13px", borderRadius: 12,
            background: "transparent", border: "1px solid rgba(255, 95, 109, 0.4)",
            color: "var(--red)", fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}><Trash2 size={14} /> Delete account</button>
          <div style={{ fontSize: 11, color: "var(--text-4)", lineHeight: 1.5, textAlign: "center", marginTop: 4, padding: "0 10px" }}>
            Deleting removes all your cards, flips, and portfolio data from Stockback servers.
          </div>
        </div>
      </div>
    );
  }

  // Permissions sub-view
  if (view === "permissions") {
    const requestCamera = async () => {
      if (!navigator.permissions) return;
      try { const s = await navigator.permissions.query({ name: "camera" }); setCameraStatus(s.state); } catch (_) {}
    };
    const requestNotif = async () => {
      try {
        if ("Notification" in window) {
          const result = await Notification.requestPermission();
          setNotifStatus(result === "granted" ? "granted" : result === "denied" ? "denied" : "prompt");
        }
      } catch (_) {}
    };
    const StatusLabel = ({ status }) => (
      <div style={{
        fontSize: 11, fontWeight: status === "granted" || status === "denied" ? 500 : 400,
        color: status === "granted" ? "var(--green)" : status === "denied" ? "var(--red)" : "var(--text-3)",
      }}>
        {status === "granted" ? "Allowed" : status === "denied" ? "Denied" : "Not requested"}
      </div>
    );
    const PermRow = ({ icon: Icon, label, status, onRequest }) => (
      <div style={{ padding: "16px", borderRadius: 14, background: "var(--bg-1)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={17} color="var(--accent-light)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 2 }}>{label}</div>
            <StatusLabel status={status} />
          </div>
        </div>
        {status === "prompt" || status === "unknown" ? (
          <button onClick={onRequest} style={{ padding: "10px", borderRadius: 10, background: "var(--accent-soft)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Request access</button>
        ) : status === "denied" ? (
          <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
            Access was denied. Re-enable it in your browser's site settings.
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>Manage in browser site settings.</div>
        )}
      </div>
    );
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
        <Header title="Permissions" />
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 18px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
          <PermRow icon={Camera} label="Camera" status={cameraStatus} onRequest={requestCamera} />
          <PermRow icon={Bell} label="Notifications" status={notifStatus} onRequest={requestNotif} />
        </div>
      </div>
    );
  }

  // Delete sub-view
  if (view === "delete") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
        <Header title="Delete" />
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 18px 40px" }}>
          <div style={{
            padding: "14px 16px", borderRadius: 14, marginBottom: 14,
            background: "rgba(255, 95, 109, 0.08)", border: "1px solid rgba(255, 95, 109, 0.25)",
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <AlertTriangle size={15} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.55 }}>
              Wipes all cards, flips, portfolio, statements, and broker connections. You'll be returned to the Welcome screen. You'll have a few seconds to undo.
            </div>
          </div>
          <button onClick={onDeleteAccount} style={{
            width: "100%", padding: "13px",
            background: "var(--red)", color: "#fff",
            border: "none", borderRadius: 12,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Delete</button>
        </div>
      </div>
    );
  }

  return null;
};

// ==================== BROKER PICKER SHEET ====================
const BrokerPickerSheet = ({ brokers, current, connectedBrokers, onPick, onClose }) => {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.toLowerCase().trim();
    if (!qq) return brokers;
    return brokers.filter((b) => b.name.toLowerCase().includes(qq));
  }, [q, brokers]);
  return (
    <BottomSheet onClose={onClose} title="Choose broker">
      <div style={{ padding: "12px 18px 8px", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10, background: "var(--bg-1)",
          border: "1px solid var(--border)",
        }}>
          <Search size={13} color="var(--text-3)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${brokers.length} brokers...`} autoFocus style={{
            flex: 1, background: "transparent", border: "none",
            color: "var(--text-1)", fontSize: 12.5, outline: "none",
          }} />
          {q && (
            <button onClick={() => setQ("")} style={{
              border: "none", background: "transparent", color: "var(--text-4)",
              cursor: "pointer", padding: 2, display: "flex",
            }}><X size={12} /></button>
          )}
        </div>
      </div>
      <div className="soft-scroll" style={{
        flex: 1, overflow: "auto", padding: "6px 18px 20px",
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {filtered.length === 0 && (
          <div style={{
            padding: "20px", textAlign: "center",
            fontSize: 11.5, color: "var(--text-3)",
          }}>No brokers match "{q}".</div>
        )}
        {filtered.map((b) => {
          const isCurrent = b.id === current;
          const isConnected = b.connectable && !!connectedBrokers?.[b.id];
          return (
            <button key={b.id} onClick={() => onPick(b.id)} style={{
              padding: "11px 12px", borderRadius: 10,
              background: isCurrent ? "var(--accent-soft)" : "transparent",
              border: isCurrent ? "1px solid var(--accent)" : "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", textAlign: "left",
            }}>
              <BrokerLogo brokerId={b.id} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 500, marginBottom: 1 }}>{b.name}</div>
                <div style={{ fontSize: 9.5, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
                  {b.connectable
                    ? (isConnected
                        ? <><CheckCircle2 size={8} color="var(--green)" /> Connected</>
                        : "Auto-sync available")
                    : "View-only"}
                </div>
              </div>
              {isCurrent && <Check size={14} color="var(--accent-light)" />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};

const SettingsRow = ({ icon: Icon, label, value, onClick, danger }) => (
  <button onClick={onClick} style={{
    padding: "12px 14px", borderRadius: 12,
    background: "var(--bg-1)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", gap: 12,
    cursor: "pointer", width: "100%", textAlign: "left",
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: danger ? "rgba(255, 95, 109, 0.12)" : "var(--bg-2)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}><Icon size={14} color={danger ? "var(--red)" : "var(--text-2)"} /></div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12.5, color: danger ? "var(--red)" : "var(--text-1)", fontWeight: 500 }}>{label}</div>
      {value && <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}>{value}</div>}
    </div>
    <ChevronRight size={14} color="var(--text-4)" />
  </button>
);

// Simple 3-swatch theme preview card
const ThemePreviewCard = ({ theme, active, onClick }) => {
  const v = theme.vars;
  return (
    <button onClick={onClick} style={{
      padding: 0, borderRadius: 14, overflow: "hidden",
      background: "var(--bg-1)",
      border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
      cursor: "pointer", textAlign: "left",
      display: "flex", flexDirection: "column",
      boxShadow: active ? "0 4px 14px rgba(76, 139, 245, 0.25)" : "none",
      transition: "all 0.15s",
    }}>
      {/* Mini app mockup using this theme's palette */}
      <div style={{
        background: v["--bg-0"],
        padding: "10px 10px 8px",
        borderBottom: `1px solid ${v["--border"] || "rgba(255,255,255,0.06)"}`,
        // Lock mockup font to the theme's own font so the preview reflects the real look
        fontFamily: theme.fontStack,
      }}>
        {/* Mock hero row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontSize: 7, fontWeight: 500, color: v["--text-2"], opacity: 0.9 }}>Portfolio</div>
          <div style={{
            width: 16, height: 5, borderRadius: 2,
            background: v["--accent"], opacity: 0.8,
          }} />
        </div>
        <div style={{
          fontSize: 16, fontWeight: 700, color: v["--text-1"],
          letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 5,
        }}>
          $1,247
        </div>
        {/* Mini change row */}
        <div style={{ fontSize: 7, color: v["--green"], fontWeight: 600, marginBottom: 6 }}>
          +$43.12 (+3.59%)
        </div>
        {/* Mock chart area */}
        <div style={{
          height: 18, borderRadius: 4, marginBottom: 6,
          background: `linear-gradient(180deg, ${v["--green"]}22 0%, transparent 100%)`,
          position: "relative",
          overflow: "hidden",
        }}>
          <svg viewBox="0 0 100 18" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
            <path d="M 0 14 L 18 10 L 36 12 L 55 6 L 75 8 L 100 3"
              fill="none" stroke={v["--green"]} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Mock row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 5px", borderRadius: 4,
          background: v["--bg-1"],
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: 3,
            background: v["--accent"],
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, width: "60%", background: v["--text-1"], borderRadius: 1, opacity: 0.9 }} />
            <div style={{ height: 2, width: "35%", background: v["--text-3"], borderRadius: 1, marginTop: 2, opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: 6, color: v["--green"], fontWeight: 700 }}>+2%</div>
        </div>
      </div>
      {/* Label footer — stays in Stockback font so the browsing experience is stable */}
      <div style={{
        padding: "8px 10px", display: "flex", alignItems: "center", gap: 5,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "var(--bg-1)",
      }}>
        {active && <Check size={11} color="var(--accent-light)" />}
        <div style={{ fontSize: 11, color: "var(--text-1)", fontWeight: 600, lineHeight: 1.15, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {theme.label}
        </div>
      </div>
    </button>
  );
};

// ==================== BROKER CONNECT SCREEN ====================
// Inline (NOT a BottomSheet) — fills the Settings screen.
// No "In production Stockback would…" preamble. Straight to OAuth consent.
// Demo pill only shown when in demo mode or when broker is clearly a sim.
const BrokerConnectScreen = ({ broker, isDemoMode, onBack, onConnect }) => {
  const [stage, setStage] = useState("pre"); // pre | loading
  const [agreed, setAgreed] = useState(false);
  const scopes = [
    { icon: BarChart3, label: "Read your portfolio positions" },
    { icon: Repeat, label: "Place fractional share orders" },
    { icon: DollarSign, label: "Read cash balance" },
  ];

  const connect = () => {
    if (!agreed) return;
    setStage("loading");
    setTimeout(() => onConnect(), 1400);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
      <div style={{
        padding: "16px 18px 12px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid var(--border)",
      }}>
        <button onClick={onBack} style={{
          border: "none", background: "var(--bg-1)", color: "var(--text-2)",
          width: 32, height: 32, borderRadius: 10, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ArrowLeft size={14} /></button>
        <div style={{ fontSize: 16, color: "var(--text-1)", fontWeight: 600 }}>Connect to {broker.name}</div>
      </div>

      {stage === "pre" && (
        <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "20px 22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <BrokerLogo brokerId={broker.id} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: "var(--text-1)", fontWeight: 600, marginBottom: 3 }}>{broker.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>
                Link your account so Stockback can place your flips automatically.
              </div>
            </div>
          </div>

          <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Stockback will request permission to:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {scopes.map((s, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 10,
                background: "var(--bg-1)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <s.icon size={14} color="var(--accent-light)" />
                <div style={{ fontSize: 11.5, color: "var(--text-1)", flex: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: "11px 12px", borderRadius: 10, marginBottom: 14,
            background: "var(--bg-1)",
            fontSize: 10.5, color: "var(--text-3)", lineHeight: 1.5,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <Shield size={12} color="var(--gold)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>Revoke access anytime from {broker.name}'s settings. Stockback never sees your password or takes funds out.</div>
          </div>

          <label style={{
            display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 16, cursor: "pointer",
            padding: "10px 12px", borderRadius: 10, background: agreed ? "var(--accent-soft)" : "transparent",
            border: agreed ? "1px solid var(--accent)" : "1px solid var(--border)",
          }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
            <div style={{ fontSize: 11, color: "var(--text-1)", lineHeight: 1.45 }}>
              I authorize Stockback to place fractional share orders at {broker.name} on my behalf.
            </div>
          </label>

          <button onClick={connect} disabled={!agreed} style={{
            width: "100%", padding: "14px",
            background: agreed ? "var(--accent)" : "var(--bg-1)",
            color: agreed ? "#fff" : "var(--text-4)",
            border: "none", borderRadius: 12,
            fontSize: 13, fontWeight: 600, cursor: agreed ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            marginBottom: 10,
          }}><Link2 size={14} /> Connect to {broker.name}</button>

          <div style={{ textAlign: "center" }}>
            <DemoPill tooltip="OAuth is simulated here — real sign-in needs a production server" />
          </div>
        </div>
      )}

      {stage === "loading" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 22px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 999,
            border: "3px solid var(--bg-2)",
            borderTopColor: "var(--accent)",
            animation: "spin 0.9s linear infinite",
            marginBottom: 14,
          }} />
          <div style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>Connecting to {broker.name}…</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Authorizing scopes</div>
        </div>
      )}
    </div>
  );
};

// ==================== FEEDBACK SCREEN ====================
const FeedbackScreen = ({ onBack, onSent }) => {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const submit = () => {
    if (!msg.trim() || sending) return;
    setSending(true);
    setTimeout(() => { setSending(false); onSent(); }, 900);
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
      <div style={{
        padding: "16px 18px 12px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid var(--border)",
      }}>
        <button onClick={onBack} style={{
          border: "none", background: "var(--bg-1)", color: "var(--text-2)",
          width: 32, height: 32, borderRadius: 10, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ArrowLeft size={14} /></button>
        <div style={{ fontSize: 16, color: "var(--text-1)", fontWeight: 600 }}>Send Feedback</div>
      </div>
      <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "18px 20px 24px" }}>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, lineHeight: 1.5 }}>
          What's broken, missing, or not great? Bug reports, design suggestions, feature requests — all welcome.
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={6} placeholder="What's on your mind?" style={{
          width: "100%", padding: "12px 14px", borderRadius: 12,
          background: "var(--bg-1)", border: "1px solid var(--border)",
          color: "var(--text-1)", fontSize: 13, outline: "none",
          resize: "vertical", minHeight: 120, fontFamily: "inherit",
        }} />
        <button onClick={submit} disabled={!msg.trim() || sending} style={{
          width: "100%", padding: "13px", marginTop: 14,
          background: msg.trim() && !sending ? "var(--accent)" : "var(--bg-1)",
          color: msg.trim() && !sending ? "#fff" : "var(--text-4)",
          border: "none", borderRadius: 12,
          fontSize: 13, fontWeight: 500,
          cursor: msg.trim() && !sending ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {sending ? <><Loader size={14} style={{ animation: "spin 0.9s linear infinite" }} /> Sending…</> : <><Mail size={13} /> Send</>}
        </button>
        <div style={{ fontSize: 10, color: "var(--text-4)", marginTop: 8, textAlign: "center" }}>
          Sent to feedback@stockback.app
        </div>
      </div>
    </div>
  );
};

// ==================== HELP SCREEN ====================
const HelpScreen = ({ onBack }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--bg-0)" }}>
    <div style={{
      padding: "16px 18px 12px", flexShrink: 0,
      display: "flex", alignItems: "center", gap: 10,
      borderBottom: "1px solid var(--border)",
    }}>
      <button onClick={onBack} style={{
        border: "none", background: "var(--bg-1)", color: "var(--text-2)",
        width: 32, height: 32, borderRadius: 10, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}><ArrowLeft size={14} /></button>
      <div style={{ fontSize: 16, color: "var(--text-1)", fontWeight: 600 }}>Help &amp; About</div>
    </div>
    <div className="soft-scroll" style={{ flex: 1, overflow: "auto", padding: "18px 20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
      <HelpBlock title="What is Stockback?" body="Reinvest your credit card cashback into fractional shares of the merchants you already spend at. Earn 4% at Starbucks? That cash becomes SBUX shares." />
      <HelpBlock title="How does the AI matching work?" body="We parse each statement line and regex-match the merchant to a ticker. Parent-company lookups handle chains (Old Navy → GAP). Anything ambiguous goes to an Unassigned queue with AI suggestions you approve." />
      <HelpBlock title="What's 'available to flip'?" body="The total cashback you've earned this statement cycle that hasn't been invested yet. You pick which ones to flip. Each flip becomes a buy order at your chosen broker." />
      <div style={{ padding: "13px 15px", borderRadius: 12, background: "var(--bg-1)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 600, marginBottom: 8 }}>What do the gold chips mean?</div>
        <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 10 }}>
          Your card pays in a specific currency. Points aren't always worth 1¢ — some issuers let you transfer to airlines or hotels at higher value. The cash value shown in Stockback is always the conservative floor.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { code: "MR",     label: "Amex Membership Rewards", value: "1¢ base · up to 2¢ via airline/hotel transfers" },
            { code: "UR",     label: "Chase Ultimate Rewards",  value: "1¢ cash back · 1.25¢ via Sapphire Preferred" },
            { code: "UR+",    label: "Chase UR (Reserve)",      value: "1.5¢ via Sapphire Reserve travel portal" },
            { code: "TY",     label: "Citi ThankYou Points",    value: "1¢ base · higher via select airline transfers" },
            { code: "Miles",  label: "Travel Miles",            value: "1¢ base · up to 1.5¢ on sweet-spot redemptions" },
            { code: "Crypto", label: "Crypto Rewards",          value: "Paid in BTC/ETH at live market rate" },
          ].map((r) => (
            <div key={r.code} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 9px", borderRadius: 8, background: "var(--bg-2)" }}>
              <span style={{
                padding: "2px 7px", borderRadius: 999,
                background: "rgba(217, 179, 104, 0.15)", border: "1px solid rgba(217, 179, 104, 0.35)",
                color: "var(--gold)", fontSize: 10, fontWeight: 700,
                flexShrink: 0, minWidth: 44, textAlign: "center",
              }}>{r.code}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "var(--text-1)", fontWeight: 500 }}>{r.label}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}>{r.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HelpBlock title="Is my data stored?" body="No. Everything lives in this browser session only. There's no server, no account, no tracking. Refreshing the page wipes state." />
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-1)", fontSize: 10.5, color: "var(--text-3)", lineHeight: 1.5, marginTop: 6 }}>
        Stockback · Design concept · Not affiliated with any card issuer or broker.
      </div>
    </div>
  </div>
);
const HelpBlock = ({ title, body }) => (
  <div style={{ padding: "13px 15px", borderRadius: 12, background: "var(--bg-1)", border: "1px solid var(--border)" }}>
    <div style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 600, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.55 }}>{body}</div>
  </div>
);

// ==================== TOAST STACK ====================
// Multiple toasts stack vertically from top. Each has its own timer + undo button + progress bar.
const ToastStack = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed", top: 20, left: 0, right: 0,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 16px", gap: 8,
      zIndex: 900, pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const id = setTimeout(onDismiss, 5200);
    return () => clearTimeout(id);
  }, [toast.id]);

  return (
    <div className="slide-down" style={{
      width: "100%", maxWidth: 388, pointerEvents: "auto",
      background: "var(--bg-1)",
      border: "1px solid var(--border-strong)",
      borderRadius: 14,
      boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 12px 12px 14px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <CheckCircle2 size={15} color="var(--green)" style={{ flexShrink: 0 }} />
        <div style={{
          flex: 1, fontSize: 12.5, fontWeight: 500, color: "var(--text-1)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{toast.label}</div>
        {toast.onUndo && (
          <button onClick={() => { toast.onUndo(); onDismiss(); }} style={{
            padding: "6px 12px", borderRadius: 8,
            background: "var(--accent)", color: "#fff",
            border: "none", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
          }}><Undo2 size={11} /> Undo</button>
        )}
        <button onClick={onDismiss} style={{
          border: "none", background: "transparent", color: "var(--text-3)",
          cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><X size={13} /></button>
      </div>
      <div style={{ height: 2.5, background: "var(--bg-2)", overflow: "hidden" }}>
        <div className="undo-progress-bar" style={{
          height: "100%", background: "var(--accent)",
          animationDuration: "5.2s",
        }} />
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
export default function Stockback() {
  const [screen, setScreen] = useState(() => loadPersistedState()?.screen ?? "welcome"); // welcome | cards | upload | app
  const [activeTab, setActiveTab] = useState(() => loadPersistedState()?.activeTab ?? "home"); // home | portfolio | statements | cards | settings
  const [lastNonSettingsTab, setLastNonSettingsTab] = useState("home");

  const [themeId, setThemeId] = useState(() => loadPersistedState()?.themeId ?? "stockback-dark");
  const [broker, setBroker] = useState(() => loadPersistedState()?.broker ?? "yahoo");
  const [connectedBrokers, setConnectedBrokers] = useState(() => loadPersistedState()?.connectedBrokers ?? {});

  const [userCards, setUserCards] = useState(() => loadPersistedState()?.userCards ?? []);
  const [selectedCards, setSelectedCards] = useState(() => loadPersistedState()?.selectedCards ?? []);

  const [flips, setFlips] = useState(() => loadPersistedState()?.flips ?? []);
  const [unassigned, setUnassigned] = useState(() => loadPersistedState()?.unassigned ?? []);
  const [portfolio, setPortfolio] = useState(() => loadPersistedState()?.portfolio ?? []);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const dbLoaded = useRef(false); // true after loadUserData() has populated state
  // Per-effect flags: skip the first sync fire after a load (state is stale at that point)
  const firstSyncAfterLoad = useRef({ flips: false, portfolio: false, cards: false });
  const themeBeforeWelcome = useRef(null);

  const [openedItemId, setOpenedItemId] = useState(null);
  const [openedTicker, setOpenedTicker] = useState(null);
  const [showManualFlip, setShowManualFlip] = useState(false);
  const [manualFlipDefaultCardId, setManualFlipDefaultCardId] = useState(null);
  const returnToFlipAfterCards = useRef(false);
  const [invalidTickerMain, setInvalidTickerMain] = useState(null); // { query, reason }
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((t) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((arr) => [...arr.slice(-4), { ...t, id }]); // keep max 5 stacked
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const [permissions, setPermissions] = useState({ notifications: false, camera: false, requested: false });

  useEffect(() => { applyTheme(themeId); }, [themeId]);

  // Cycle through all themes while the welcome screen is active; restore on exit
  useEffect(() => {
    if (screen !== "welcome") return;
    document.documentElement.classList.add("theme-cycling");
    themeBeforeWelcome.current = themeId;
    setThemeId("stockback-dark");
    const themeKeys = Object.keys(THEMES);
    let idx = 0; // start at stockback-dark (index 0)
    const id = setInterval(() => {
      idx = (idx + 1) % themeKeys.length;
      setThemeId(themeKeys[idx]);
    }, 5000);
    return () => {
      document.documentElement.classList.remove("theme-cycling");
      clearInterval(id);
      if (themeBeforeWelcome.current !== null) {
        setThemeId(themeBeforeWelcome.current);
        themeBeforeWelcome.current = null;
      }
    };
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Supabase auth: restore existing session on mount and listen for future changes
  useEffect(() => {
    const populateFromDb = (user) => {
      setSupabaseUser(user);
      setIsDemoMode(false);
      dbLoaded.current = false;
      // Immediately clear stale/demo data so no previous session bleeds through
      // while the DB load is in-flight. Sync effects are blocked by dbLoaded=false.
      setFlips([]);
      setPortfolio([]);
      setUserCards([]);
      loadUserData().then(({ flips: dbFlips, portfolio: dbPortfolio, userCards: dbCards }) => {
        setFlips(dbFlips);
        setPortfolio(dbPortfolio);
        setUserCards(dbCards);
        firstSyncAfterLoad.current = { flips: true, portfolio: true, cards: true };
        dbLoaded.current = true;
        // Route based on freshly-loaded cards, not stale state
        setScreen((s) => {
          if (dbCards.length === 0) return "cards"; // first-time user: show picker
          if (s === "app") return "app";            // already in app: stay
          return "app";                             // welcome / upload / etc: go to app
        });
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user) { populateFromDb(user); }
      else { setSupabaseUser(null); }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      if (event === "SIGNED_IN" && user) {
        // Clear transient UI state so we don't restore a stale screen/tab from localStorage
        setSelectedCards([]);
        setActiveTab("home");
        populateFromDb(user);
      }
      if (event === "SIGNED_OUT") {
        dbLoaded.current = false;
        setSupabaseUser(null);
        setScreen("welcome");
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (portfolio.length === 0) return;
    const id = setInterval(() => setPortfolio((p) => driftPrices(p)), 8000);
    return () => clearInterval(id);
  }, [portfolio.length]);

  // Track last non-settings tab so gear returns to it on close
  useEffect(() => {
    if (activeTab !== "settings") setLastNonSettingsTab(activeTab);
  }, [activeTab]);

  // Persist state on every relevant change
  // • Demo mode  → skip entirely (always resets)
  // • Signed in  → preferences only; DB is source of truth for data arrays
  // • Guest mode → save everything so data survives refresh
  useEffect(() => {
    if (isDemoMode) return;
    try {
      if (supabaseUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          screen,
          activeTab,
          themeId,
          broker,
          connectedBrokers,
          selectedCards,
          unassigned,
        }));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          screen,
          activeTab,
          themeId,
          broker,
          connectedBrokers,
          selectedCards,
          unassigned,
          userCards,
          flips,
          portfolio,
        }));
      }
    } catch (_) { /* storage full or unavailable — ignore */ }
  }, [isDemoMode, supabaseUser, screen, activeTab, themeId, broker, connectedBrokers, userCards, selectedCards, flips, unassigned, portfolio]);

  // Debounced DB sync for signed-in users (skip until dbLoaded to avoid overwriting with empty state)
  const syncFlipsTimer = useRef(null);
  useEffect(() => {
    if (!supabaseUser || !dbLoaded.current) return;
    if (firstSyncAfterLoad.current.flips) { firstSyncAfterLoad.current.flips = false; return; }
    clearTimeout(syncFlipsTimer.current);
    syncFlipsTimer.current = setTimeout(() => syncFlips(flips), 1500);
    return () => clearTimeout(syncFlipsTimer.current);
  }, [flips, supabaseUser]);

  const syncPortfolioTimer = useRef(null);
  useEffect(() => {
    if (!supabaseUser || !dbLoaded.current) return;
    if (firstSyncAfterLoad.current.portfolio) { firstSyncAfterLoad.current.portfolio = false; return; }
    clearTimeout(syncPortfolioTimer.current);
    syncPortfolioTimer.current = setTimeout(() => syncPortfolio(portfolio), 1500);
    return () => clearTimeout(syncPortfolioTimer.current);
  }, [portfolio, supabaseUser]);

  const syncCardsTimer = useRef(null);
  useEffect(() => {
    if (!supabaseUser || !dbLoaded.current) return;
    if (firstSyncAfterLoad.current.cards) { firstSyncAfterLoad.current.cards = false; return; }
    clearTimeout(syncCardsTimer.current);
    syncCardsTimer.current = setTimeout(() => syncUserCards(userCards), 1500);
    return () => clearTimeout(syncCardsTimer.current);
  }, [userCards, supabaseUser]);

  const cardsMap = useMemo(() => {
    const m = {};
    userCards.forEach((c) => { m[c.id] = c; });
    return m;
  }, [userCards]);

  const statements = useMemo(() => deriveStatements(flips, unassigned), [flips, unassigned]);

  const merchantSpending = useMemo(() => computeMerchantSpending(flips), [flips]);

  const tickerItems = useMemo(() => {
    return portfolio.slice(0, 8).map((h) => ({
      ticker: h.ticker,
      amount: (h.currentPrice ?? 0) * h.shares,
      change: h.dayChangePct ?? 0,
    }));
  }, [portfolio]);

  // === Sign-in paths ===
  const handleSignIn = async (provider) => {
    if (provider === "google") {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      // Browser redirects to Google; onAuthStateChange handles the return
    } else if (provider === "apple") {
      pushToast({ label: "Apple Sign In coming soon" });
    }
  };
  const handleContinue = () => {
    setIsDemoMode(false);
    setFlips([]); setUnassigned([]); setPortfolio([]);
    setScreen("cards");
  };
  const handleDemoMode = () => {
    setIsDemoMode(true);
    setFlips(DEMO_FLIPS);
    setUnassigned(DEMO_UNASSIGNED);
    setPortfolio(DEMO_PORTFOLIO);
    // Auto-pick the cards referenced by demo data so merchants have cardsMap entries
    const seededIds = collectSeededCardIds(DEMO_FLIPS, DEMO_PORTFOLIO, DEMO_UNASSIGNED);
    const seededCards = seededIds.map(cardFromCatalog).filter(Boolean);
    setUserCards(seededCards);
    setSelectedCards(seededIds);
    setScreen("app");
    setActiveTab("home");
  };

  const openItem = (id) => setOpenedItemId(id);
  const openedItem = openedItemId ? flips.find((d) => d.id === openedItemId) : null;
  const openedHolding = openedTicker ? portfolio.find((h) => h.ticker === openedTicker) : null;

  const handleBrokerClick = (ticker) => {
    const b = BROKER_PRESETS.find((x) => x.id === broker);
    if (b && b.url) window.open(b.url(ticker), "_blank", "noopener");
  };

  const handleClearDemoData = () => {
    const snap = { flips, unassigned, portfolio };
    setFlips([]); setUnassigned([]); setPortfolio([]);
    pushToast({ label: "Demo data cleared", onUndo: () => {
      setFlips(snap.flips); setUnassigned(snap.unassigned); setPortfolio(snap.portfolio);
    }});
  };

  const handleDeleteAccount = () => {
    // Snapshot all state so Undo can fully restore
    const snap = {
      userCards, selectedCards, flips, unassigned, portfolio,
      connectedBrokers, isDemoMode, permissions,
      screen, activeTab,
    };
    setUserCards([]); setSelectedCards([]); setFlips([]); setUnassigned([]); setPortfolio([]);
    setConnectedBrokers({}); setIsDemoMode(false); setOpenedItemId(null); setOpenedTicker(null);
    setPermissions({ notifications: false, camera: false, requested: false });
    setThemeId("stockback-dark");
    localStorage.removeItem(STORAGE_KEY);
    setScreen("welcome"); setActiveTab("home");
    setTimeout(() => pushToast({
      label: "Account deleted",
      onUndo: () => {
        setUserCards(snap.userCards);
        setSelectedCards(snap.selectedCards);
        setFlips(snap.flips);
        setUnassigned(snap.unassigned);
        setPortfolio(snap.portfolio);
        setConnectedBrokers(snap.connectedBrokers);
        setIsDemoMode(snap.isDemoMode);
        setPermissions(snap.permissions);
        setScreen(snap.screen);
        setActiveTab(snap.activeTab);
      },
    }), 200);
  };

  const handleSignOut = () => {
    setUserCards([]); setSelectedCards([]); setFlips([]); setUnassigned([]); setPortfolio([]);
    setConnectedBrokers({}); setIsDemoMode(false); setOpenedItemId(null); setOpenedTicker(null);
    setPermissions({ notifications: false, camera: false, requested: false });
    setThemeId("stockback-dark");
    setActiveTab("home");
    localStorage.removeItem(STORAGE_KEY);
    dbLoaded.current = false;
    setScreen("welcome");
    supabase.auth.signOut(); // fires SIGNED_OUT → setSupabaseUser(null)
  };

  const handleDeleteSignedInAccount = async () => {
    if (!window.confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await Promise.all([
        supabase.from("flips").delete().eq("user_id", user.id),
        supabase.from("portfolio_holdings").delete().eq("user_id", user.id),
        supabase.from("user_cards").delete().eq("user_id", user.id),
      ]);
    }
    handleSignOut();
  };

  const handleOpenSettings = () => setActiveTab("settings");
  const handleCloseSettings = () => setActiveTab(lastNonSettingsTab);

  // === Welcome ===
  if (screen === "welcome") {
    return (
      <>
        <FontLoader />
        <Shell showTicker={false} showNav={false}>
          <Welcome onContinue={handleContinue} onSignIn={handleSignIn} onDemoMode={handleDemoMode} />
        </Shell>
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // === Card picker ===
  if (screen === "cards") {
    return (
      <>
        <FontLoader />
        <Shell showTicker={false} showNav={false}>
          <CardPicker
            selected={selectedCards} setSelected={setSelectedCards}
            userCards={userCards} setUserCards={setUserCards}
            onBack={() => {
              returnToFlipAfterCards.current = false;
              setScreen("welcome");
            }}
            onSkip={() => {
              returnToFlipAfterCards.current = false;
              setScreen("upload");
            }}
            onNext={() => {
              if (returnToFlipAfterCards.current) {
                returnToFlipAfterCards.current = false;
                const lastSelected = selectedCards[selectedCards.length - 1] || null;
                setManualFlipDefaultCardId(lastSelected);
                setScreen("app");
                setShowManualFlip(true);
              } else {
                setScreen("upload");
              }
            }}
          />
        </Shell>
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // === Upload ===
  if (screen === "upload") {
    return (
      <>
        <FontLoader />
        <Shell showTicker={false} showNav={false}>
          <StatementUpload
            permissions={permissions} setPermissions={setPermissions}
            isDemoMode={isDemoMode}
            onBack={() => setScreen("cards")}
            onSkip={() => { setScreen("app"); setActiveTab("home"); }}
            onNext={() => { setScreen("app"); setActiveTab("home"); }}
          />
        </Shell>
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // === Main app ===
  return (
    <>
      <FontLoader />
      <Shell showTicker={portfolio.length > 0} tickerItems={tickerItems} showNav={true}
        activeTab={activeTab} onTabChange={setActiveTab}
        onOpenSettings={handleOpenSettings} settingsActive={activeTab === "settings"}>

        {activeTab === "home" && (
          <FlipTab flips={flips} setFlips={setFlips}
            unassigned={unassigned} setUnassigned={setUnassigned}
            cardsMap={cardsMap}
            userCards={userCards}
            portfolio={portfolio} setPortfolio={setPortfolio}
            connectedBrokers={connectedBrokers} broker={broker}
            onOpenItem={openItem}
            onOpenManualAdd={() => setShowManualFlip(true)}
            onShowToast={pushToast}
          />
        )}

        {activeTab === "portfolio" && (
          <PortfolioTab portfolio={portfolio}
            connectedBrokers={connectedBrokers} broker={broker}
            onOpenTicker={(t) => setOpenedTicker(t)} />
        )}

        {activeTab === "statements" && (
          <StatementsTab statements={statements} cardsMap={cardsMap}
            userCards={userCards}
            flips={flips} setFlips={setFlips}
            unassigned={unassigned} setUnassigned={setUnassigned}
            onShowToast={pushToast} />
        )}

        {activeTab === "cards" && (
          <CardsTab userCards={userCards} setUserCards={setUserCards}
            flips={flips} setFlips={setFlips}
            merchantSpending={merchantSpending}
            onShowToast={pushToast} />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            themeId={themeId} setThemeId={setThemeId}
            broker={broker} setBroker={setBroker}
            connectedBrokers={connectedBrokers} setConnectedBrokers={setConnectedBrokers}
            onDeleteAccount={handleDeleteAccount}
            onClearData={handleClearDemoData}
            onExitDemo={() => {
              setIsDemoMode(false);
              setFlips([]);
              setUnassigned([]);
              setPortfolio([]);
              setUserCards([]);
              setConnectedBrokers({});
              setActiveTab("home");
              setScreen("welcome");
            }}
            isDemoMode={isDemoMode}
            onClose={handleCloseSettings}
            onShowToast={pushToast}
            onSignOut={supabaseUser ? handleSignOut : undefined}
            supabaseUser={supabaseUser}
            onSignIn={handleSignIn}
            onDeleteSignedInAccount={supabaseUser ? handleDeleteSignedInAccount : undefined}
          />
        )}
      </Shell>

      {openedItem && (
        <PurchaseDetail
          item={openedItem}
          card={cardsMap[openedItem.cardId]}
          cardsMap={cardsMap}
          userCards={userCards}
          onClose={() => setOpenedItemId(null)}
          onUpdate={(upd) => setFlips((arr) => arr.map((d) => d.id === upd.id ? upd : d))}
          onDelete={(id) => {
            const target = flips.find((d) => d.id === id);
            if (!target) return;
            setFlips((arr) => arr.filter((d) => d.id !== id));
            pushToast({ label: `Deleted ${target.merchant}`, onUndo: () => setFlips((arr) => [target, ...arr]) });
          }}
        />
      )}

      {openedHolding && (
        <TickerDetailModal
          ticker={openedTicker}
          holding={openedHolding}
          onClose={() => setOpenedTicker(null)}
          onBrokerClick={handleBrokerClick}
          broker={broker}
          connectedBrokers={connectedBrokers}
        />
      )}

      {showManualFlip && (
        <ManualFlipModal
          userCards={userCards}
          defaultCardId={manualFlipDefaultCardId}
          onClose={() => { setShowManualFlip(false); setManualFlipDefaultCardId(null); }}
          onGoToCards={() => {
            setShowManualFlip(false);
            setManualFlipDefaultCardId(null);
            returnToFlipAfterCards.current = true;
            setScreen("cards");
          }}
          onInvalidTicker={(info) => setInvalidTickerMain(info)}
          onSubmit={(newFlip) => {
            setFlips((arr) => [newFlip, ...arr]);
            setShowManualFlip(false);
            setManualFlipDefaultCardId(null);
            pushToast({ label: `Added ${newFlip.merchant} → ${newFlip.ticker} @ $${newFlip.resolvedPrice.toFixed(2)}`, onUndo: () => setFlips((arr) => arr.filter((d) => d.id !== newFlip.id)) });
          }}
        />
      )}

      {invalidTickerMain && (
        <InvalidTickerModal
          query={invalidTickerMain.query}
          reason={invalidTickerMain.reason}
          onClose={() => setInvalidTickerMain(null)}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
