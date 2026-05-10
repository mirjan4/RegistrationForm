import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// --- Icons (inline SVGs) ---
// ... (Keeping all your beautiful icons) ...

// --- Icons (inline SVGs to avoid dependency issues in preview) ---
const IconUser = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconPhone = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
  </svg>
);
const IconSend = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconCheck = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconSearch = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconLoader = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}>
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);
const IconAlert = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconUserPlus = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

// --- Toast System ---
const ToastContext = React.createContext(null);
const useToast = () => React.useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  return (
    <ToastContext.Provider value={{ success: m => add(m,'success'), error: m => add(m,'error'), info: m => add(m,'info') }}>
      {children}
      <div style={{ position:'fixed', top:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,x:60}}
              style={{
                padding:'12px 20px', borderRadius:14, fontSize:13, fontWeight:600,
                background: t.type==='success'?'rgba(52,211,153,0.15)':t.type==='error'?'rgba(248,113,113,0.15)':'rgba(96,165,250,0.15)',
                border: `1px solid ${t.type==='success'?'rgba(52,211,153,0.3)':t.type==='error'?'rgba(248,113,113,0.3)':'rgba(96,165,250,0.3)'}`,
                color: t.type==='success'?'#6ee7b7':t.type==='error'?'#fca5a5':'#93c5fd',
                backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
                display:'flex', alignItems:'center', gap:8, maxWidth:280
              }}>
              {t.type==='success'?'✓':t.type==='error'?'✕':'ℹ'} {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// --- Main Component ---
const RegistrationForm = () => {
  const [idSearch, setIdSearch] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(''); setMember(null); setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/search/${idSearch}`);
      setMember(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No member found with this ID. Please try again.');
      toast.error('Member not found');
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/confirm`, { idNumber: member.idNumber });
      toast.success('Registration Confirmed!');
      setIsSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Confirmation failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2);opacity:0} }
        @keyframes gradientShift {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { margin:0; background:#040d1a; }
        .page {
          min-height:100vh;
          background: #040d1a;
          font-family:'DM Sans', sans-serif;
          color:#e8edf8;
          position:relative;
          overflow-x:hidden;
        }
        /* Ambient blobs */
        .blob1 {
          position:fixed; top:-200px; left:-200px; width:600px; height:600px;
          border-radius:50%;
          background: radial-gradient(circle, rgba(14,80,160,0.35) 0%, transparent 70%);
          pointer-events:none; z-index:0;
        }
        .blob2 {
          position:fixed; bottom:-100px; right:-100px; width:500px; height:500px;
          border-radius:50%;
          background: radial-gradient(circle, rgba(0,160,200,0.2) 0%, transparent 70%);
          pointer-events:none; z-index:0;
        }
        .blob3 {
          position:fixed; top:40%; left:50%; transform:translateX(-50%);
          width:800px; height:400px; border-radius:50%;
          background: radial-gradient(ellipse, rgba(10,50,120,0.15) 0%, transparent 70%);
          pointer-events:none; z-index:0;
        }
        /* Grid lines overlay */
        .grid-overlay {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size:60px 60px;
        }
        .container {
          position:relative; z-index:1;
          max-width:520px;
          margin:0 auto;
          padding:40px 20px 60px;
          display:flex;
          flex-direction:column;
          align-items:center;
        }
        /* Top bar */
        .topbar {
          width:100%; display:flex; justify-content:space-between; align-items:center;
          margin-bottom:40px;
          padding:0 4px;
        }
        .topbar-link {
          font-size:10px; letter-spacing:0.2em; text-transform:uppercase;
          color:rgba(180,200,255,0.4); font-weight:600;
          font-family:'Syne',sans-serif;
        }
        /* Event card */
        .event-card {
          width:100%;
          background: linear-gradient(135deg, rgba(10,40,100,0.6) 0%, rgba(5,25,70,0.8) 50%, rgba(0,80,140,0.4) 100%);
          border: 1px solid rgba(100,160,255,0.15);
          border-radius:24px;
          overflow:hidden;
          margin-bottom:32px;
          position:relative;
          box-shadow: 0 24px 80px rgba(0,20,80,0.6), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .event-card-inner {
          padding:32px 28px;
          display:flex;
          flex-direction:column;
          align-items:center;
          text-align:center;
          gap:20px;
        }
        .event-logo-wrap {
          width:72px; height:72px;
          background: white;
          border-radius:18px;
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 8px 32px rgba(0,100,200,0.4);
          overflow:hidden;
        }
        .event-logo-wrap img { width:100%; height:100%; object-fit:contain; }
        .event-logo-placeholder {
          font-family:'Syne',sans-serif;
          font-size:22px; font-weight:800;
          color:#0e4fa0;
          letter-spacing:-1px;
        }
        .event-title {
          font-family:'Syne', sans-serif;
          font-size:28px; font-weight:800;
          line-height:1.15;
          background: linear-gradient(135deg, #ffffff 0%, #a8d4ff 60%, #60a5fa 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .event-divider {
          width:48px; height:2px;
          background: linear-gradient(90deg, transparent, rgba(100,180,255,0.5), transparent);
          border-radius:2px;
        }
        .event-meta {
          display:flex; flex-direction:column; gap:12px; width:100%;
        }
        .event-meta-item {
          display:flex; align-items:center; justify-content:center; gap:10px;
          font-size:13px; color:rgba(160,200,255,0.8);
          font-weight:500;
        }
        .event-meta-item .icon { color:rgba(96,165,250,0.7); flex-shrink:0; }
        .event-meta-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(30,80,180,0.3);
          border:1px solid rgba(100,150,255,0.2);
          border-radius:100px; padding:8px 18px;
          font-size:13px; font-weight:600;
          color:#93c5fd;
        }
        .event-meta-badge .dot {
          width:6px; height:6px; border-radius:50%;
          background:#60a5fa;
          box-shadow:0 0 8px #60a5fa;
          animation:pulse-ring 1.5s ease-out infinite;
        }
        .event-venue {
          font-size:13px; color:rgba(150,190,255,0.7);
          line-height:1.6;
        }
        .event-venue strong { color:rgba(200,225,255,0.9); }
        /* Decoration line at bottom of event card */
        .event-card-footer {
          height:3px;
          background: linear-gradient(90deg, transparent, #1e5bcd, #38bdf8, #1e5bcd, transparent);
          animation:gradientShift 4s ease infinite;
          background-size:200% 100%;
        }
        /* Form card */
        .form-card {
          width:100%;
          background: rgba(8,20,50,0.7);
          border:1px solid rgba(80,130,220,0.15);
          border-radius:24px;
          padding:32px 28px;
          backdrop-filter:blur(20px);
          box-shadow: 0 32px 80px rgba(0,10,40,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
          margin-bottom:24px;
        }
        .form-title {
          font-family:'Syne', sans-serif;
          font-size:14px; font-weight:700;
          letter-spacing:0.18em; text-transform:uppercase;
          color:rgba(150,185,255,0.7);
          text-align:center;
          margin-bottom:28px;
        }
        .input-group { margin-bottom:20px; }
        .input-label {
          display:block;
          font-size:10px; letter-spacing:0.15em; text-transform:uppercase;
          color:rgba(130,170,255,0.6); font-weight:600;
          margin-bottom:8px; padding-left:2px;
          font-family:'Syne',sans-serif;
        }
        .input-wrap {
          position:relative;
        }
        .input-icon {
          position:absolute; left:16px; top:50%; transform:translateY(-50%);
          color:rgba(100,140,220,0.5);
          display:flex; align-items:center;
          pointer-events:none;
        }
        .text-input {
          width:100%; padding:14px 16px 14px 46px;
          background:rgba(15,35,80,0.5);
          border:1px solid rgba(80,130,220,0.2);
          border-radius:14px;
          color:#e8edf8;
          font-size:15px; font-weight:500;
          font-family:'DM Sans', sans-serif;
          outline:none;
          transition:all 0.25s ease;
          letter-spacing:0.5px;
        }
        .text-input::placeholder { color:rgba(150,180,255,0.25); }
        .text-input:focus {
          border-color:rgba(96,165,250,0.5);
          background:rgba(15,40,100,0.6);
          box-shadow:0 0 0 3px rgba(96,165,250,0.1), 0 0 20px rgba(96,165,250,0.05);
        }
        .btn-primary {
          width:100%; padding:15px 24px;
          background: linear-gradient(135deg, #1d5bc7 0%, #0e8fd4 100%);
          border:none; border-radius:14px;
          color:#fff; font-size:14px; font-weight:700;
          letter-spacing:0.12em; text-transform:uppercase;
          font-family:'Syne', sans-serif;
          cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:10px;
          transition:all 0.25s ease;
          box-shadow:0 8px 32px rgba(29,91,199,0.4);
          position:relative; overflow:hidden;
        }
        .btn-primary::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          pointer-events:none;
        }
        .btn-primary:hover:not(:disabled) {
          transform:translateY(-1px);
          box-shadow:0 12px 40px rgba(29,91,199,0.5);
          background:linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
        }
        .btn-primary:active:not(:disabled) { transform:translateY(0); }
        .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .btn-secondary {
          width:100%; padding:12px 24px;
          background:rgba(20,50,120,0.3);
          border:1px solid rgba(80,130,220,0.2);
          border-radius:14px;
          color:rgba(150,185,255,0.7); font-size:13px; font-weight:600;
          letter-spacing:0.08em; text-transform:uppercase;
          font-family:'Syne', sans-serif;
          cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all 0.2s;
        }
        .btn-secondary:hover { background:rgba(30,70,160,0.4); color:rgba(180,210,255,0.9); }
        .error-box {
          display:flex; align-items:center; gap:10px;
          padding:12px 16px;
          background:rgba(180,30,30,0.1);
          border:1px solid rgba(248,113,113,0.2);
          border-radius:12px;
          color:#fca5a5; font-size:13px; font-weight:500;
          margin-bottom:16px;
        }
        /* Member card */
        .member-card {
          background:rgba(15,35,90,0.4);
          border:1px solid rgba(80,130,220,0.15);
          border-radius:16px;
          overflow:hidden;
          margin-bottom:24px;
        }
        .member-card-header {
          padding:16px 20px;
          background:rgba(20,50,130,0.3);
          border-bottom:1px solid rgba(80,130,220,0.1);
          font-size:10px; letter-spacing:0.18em; text-transform:uppercase;
          color:rgba(130,170,255,0.5); font-weight:700;
          font-family:'Syne',sans-serif;
        }
        .member-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:14px 20px;
          border-bottom:1px solid rgba(80,130,220,0.08);
        }
        .member-row:last-child { border-bottom:none; }
        .member-key { font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(120,160,220,0.5); font-weight:600; }
        .member-val { font-size:14px; font-weight:600; color:#c8dcff; }
        .member-id { color:#fbbf24; font-size:16px; font-weight:800; font-family:'Syne',sans-serif; }
        .warning-box {
          display:flex; align-items:center; gap:12px;
          padding:14px 18px;
          background:rgba(245,158,11,0.08);
          border:1px solid rgba(245,158,11,0.2);
          border-radius:14px;
          color:#fcd34d; font-size:13px; font-weight:600;
          margin-bottom:20px;
        }
        /* Success */
        .success-wrap {
          text-align:center; padding:16px 0 8px;
        }
        .success-icon {
          width:80px; height:80px; border-radius:50%;
          background:rgba(52,211,153,0.1);
          border:1px solid rgba(52,211,153,0.25);
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 24px;
          color:#34d399;
          position:relative;
        }
        .success-icon::before {
          content:''; position:absolute; inset:-8px;
          border-radius:50%; border:1px solid rgba(52,211,153,0.1);
        }
        .success-title {
          font-family:'Syne',sans-serif;
          font-size:32px; font-weight:800;
          background:linear-gradient(135deg, #34d399, #a7f3d0);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          margin-bottom:12px;
        }
        .success-sub { font-size:14px; color:rgba(160,200,255,0.6); line-height:1.7; margin-bottom:28px; }
        .success-name { color:#93c5fd; font-weight:700; }
        /* Spot reg */
        .spot-wrap {
          width:100%; text-align:center; margin-bottom:40px;
        }
        .spot-label {
          font-size:10px; letter-spacing:0.2em; text-transform:uppercase;
          color:rgba(130,165,220,0.4); font-weight:600;
          font-family:'Syne',sans-serif;
          margin-bottom:10px;
        }
        .spot-btn {
          display:inline-flex; align-items:center; gap:10px;
          padding:12px 24px;
          background:rgba(15,35,80,0.4);
          border:1px solid rgba(80,130,220,0.15);
          border-radius:14px;
          color:rgba(150,190,255,0.7); font-size:13px; font-weight:600;
          font-family:'Syne',sans-serif; letter-spacing:0.05em;
          cursor:pointer; transition:all 0.2s;
        }
        .spot-btn:hover { background:rgba(20,50,120,0.5); border-color:rgba(96,165,250,0.3); color:#93c5fd; }
        /* Footer */
        .footer {
          text-align:center;
          font-size:10px; letter-spacing:0.25em; text-transform:uppercase;
          color:rgba(100,140,200,0.3); font-weight:600;
          font-family:'Syne',sans-serif;
          padding-top:8px;
        }
        /* Step indicator */
        .steps {
          display:flex; align-items:center; gap:0;
          margin-bottom:28px;
          width:100%;
        }
        .step {
          display:flex; align-items:center; gap:8px;
          flex:1;
        }
        .step-dot {
          width:28px; height:28px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:700; flex-shrink:0;
          font-family:'Syne',sans-serif;
        }
        .step-dot.active { background:rgba(37,99,235,0.3); border:1px solid rgba(96,165,250,0.5); color:#60a5fa; }
        .step-dot.done { background:rgba(52,211,153,0.2); border:1px solid rgba(52,211,153,0.3); color:#34d399; }
        .step-dot.inactive { background:rgba(30,50,100,0.3); border:1px solid rgba(80,120,200,0.15); color:rgba(120,150,200,0.4); }
        .step-line { flex:1; height:1px; background:rgba(80,120,200,0.15); margin:0 4px; }
        .step-text { font-size:10px; letter-spacing:0.08em; text-transform:uppercase; font-family:'Syne',sans-serif; }
        .step-text.active { color:rgba(150,185,255,0.7); }
        .step-text.inactive { color:rgba(100,130,180,0.3); }
        .back-btn {
          background:none; border:none; color:rgba(130,165,220,0.5);
          font-size:12px; font-weight:500; cursor:pointer;
          display:flex; align-items:center; gap:6px;
          padding:8px 0; margin-top:12px;
          transition:color 0.2s; font-family:'DM Sans',sans-serif;
          text-decoration:underline; text-underline-offset:3px;
        }
        .back-btn:hover { color:rgba(160,200,255,0.8); }
        .hint { font-size:11px; color:rgba(110,150,220,0.4); text-align:center; margin-top:14px; }
      `}</style>

      <div className="page">
        <div className="blob1" />
        <div className="blob2" />
        <div className="blob3" />
        <div className="grid-overlay" />

        <div className="container">
          {/* Top Bar */}
          <div className="topbar">
            <span className="topbar-link">@markazonline</span>
            <span className="topbar-link">www.markaz.in</span>
          </div>

          {/* Event Info Card */}
          <motion.div className="event-card" style={{width:'100%'}}
            initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}}>
            <img src="/org.jpg" alt="Event Poster" style={{width:'100%', height:'auto', display:'block', borderRadius:'24px 24px 0 0'}} />
            <div className="event-card-footer" />
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div className="form-card" key="success"
                initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                transition={{duration:0.3}}>
                <div className="success-wrap">
                  <motion.div className="success-icon"
                    initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}}>
                    <IconCheck size={36} />
                  </motion.div>
                  <div className="success-title">Confirmed!</div>
                  <div className="success-sub">
                    Thank you, <span className="success-name">{member?.name}</span>!<br/>
                    Your attendance has been successfully recorded.
                  </div>
                  <button className="btn-primary" onClick={() => { setIsSubmitted(false); setMember(null); setIdSearch(''); }}>
                    Verify Another Member
                  </button>
                </div>
              </motion.div>
            ) : !member ? (
              <motion.div className="form-card" key="search"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
                transition={{duration:0.35, delay:0.1}}>
                {/* Steps */}
                <div className="steps">
                  <div className="step">
                    <div className="step-dot active">1</div>
                    <span className="step-text active">Verify ID</span>
                  </div>
                  <div className="step-line" />
                  <div className="step">
                    <div className="step-dot inactive">2</div>
                    <span className="step-text inactive">Confirm</span>
                  </div>
                  <div className="step-line" />
                  <div className="step">
                    <div className="step-dot inactive">✓</div>
                    <span className="step-text inactive">Done</span>
                  </div>
                </div>

                <div className="form-title">Enter Your Member ID</div>
                <form onSubmit={handleSearch}>
                  <div className="input-group">
                    <label className="input-label">ID Number</label>
                    <div className="input-wrap">
                      <div className="input-icon"><IconSearch size={17} /></div>
                      <input type="text" required placeholder="e.g. 1001"
                        className="text-input"
                        value={idSearch}
                        onChange={(e) => { setIdSearch(e.target.value); setError(''); }} />
                    </div>
                  </div>
                  {error && (
                    <div className="error-box">
                      <IconAlert size={16} /> {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <IconLoader size={18} /> : <><IconSend size={16} /> Verify ID</>}
                  </button>
                </form>
                <div className="hint">Try: 1001, 1002, or 1003 for demo</div>
              </motion.div>
            ) : (
              <motion.div className="form-card" key="confirm"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
                transition={{duration:0.35}}>
                {/* Steps */}
                <div className="steps">
                  <div className="step">
                    <div className="step-dot done">✓</div>
                    <span className="step-text active" style={{color:'rgba(52,211,153,0.6)'}}>Verified</span>
                  </div>
                  <div className="step-line" style={{background:'rgba(52,211,153,0.2)'}} />
                  <div className="step">
                    <div className="step-dot active">2</div>
                    <span className="step-text active">Confirm</span>
                  </div>
                  <div className="step-line" />
                  <div className="step">
                    <div className="step-dot inactive">✓</div>
                    <span className="step-text inactive">Done</span>
                  </div>
                </div>

                <div className="form-title">Confirm Your Details</div>

                <div className="member-card">
                  <div className="member-card-header">Member Information</div>
                  <div className="member-row">
                    <span className="member-key">Name</span>
                    <span className="member-val">{member.name}</span>
                  </div>
                  <div className="member-row">
                    <span className="member-key">Phone</span>
                    <span className="member-val" style={{fontFamily:'monospace'}}>{member.phone}</span>
                  </div>
                  <div className="member-row">
                    <span className="member-key">ID</span>
                    <span className="member-id">#{member.idNumber}</span>
                  </div>
                </div>

                {member.status === 'Registered' ? (
                  <div className="warning-box">
                    <IconAlert size={18} />
                    This ID is already registered for the event.
                  </div>
                ) : (
                  <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
                    {loading ? <IconLoader size={18} /> : <><IconCheck size={16} /> Confirm Registration</>}
                  </button>
                )}
                <div style={{textAlign:'center'}}>
                  <button className="back-btn" onClick={() => setMember(null)}>Not you? Search again</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spot Register */}
          <motion.div className="spot-wrap" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
            <div className="spot-label">Not on the pre-registered list?</div>
            <button className="spot-btn"
              onClick={() => alert('Spot Registration is available at the venue counter.')}>
              <IconUserPlus size={16} /> Spot Register at Venue
            </button>
          </motion.div>

          <div className="footer">
            Exclusive Event · Pre-Registered Members Only
          </div>
        </div>
      </div>
    </>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <RegistrationForm />
    </ToastProvider>
  );
}