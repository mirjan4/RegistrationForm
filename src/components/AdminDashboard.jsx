import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Use relative path to ensure it always works on any Vercel URL
const API_URL = '/api';

// --- SVG Icons ---
const Icon = ({ d, size=20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{d}</svg>
);
const IUsers = ({s=20}) => <Icon size={s} d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>}/>;
const ICheck = ({s=20}) => <Icon size={s} d={<><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}/>;
const ICircle = ({s=20}) => <Icon size={s} d={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}/>;
const ISearch = ({s=20}) => <Icon size={s} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const IUpload = ({s=20}) => <Icon size={s} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></>}/>;
const IDownload = ({s=20}) => <Icon size={s} d={<><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29"/></>}/>;
const ITrash = ({s=18}) => <Icon size={s} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></>}/>;
const ILogout = ({s=18}) => <Icon size={s} d={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>}/>;
const IRefresh = ({s=18}) => <Icon size={s} d={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>}/>;
const IFile = ({s=48}) => <Icon size={s} d={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>}/>;
const IPlus = ({s=18}) => <Icon size={s} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>;
const IClose = ({s=18}) => <Icon size={s} d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}/>;
const IMenu = ({s=22}) => <Icon size={s} d={<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}/>;

// --- Toast ---
const ToastCtx = React.createContext(null);
const useToast = () => React.useContext(ToastCtx);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type='info') => {
    const id = Date.now();
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  return (
    <ToastCtx.Provider value={{ success: m=>add(m,'success'), error: m=>add(m,'error'), info: m=>add(m,'info') }}>
      {children}
      <div style={{position:'fixed',top:16,right:16,zIndex:9999,display:'flex',flexDirection:'column',gap:8,maxWidth:'calc(100vw - 32px)'}}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding:'11px 18px', borderRadius:12, fontSize:13, fontWeight:600,
            background:t.type==='success'?'rgba(52,211,153,0.12)':t.type==='error'?'rgba(248,113,113,0.12)':'rgba(96,165,250,0.12)',
            border:`1px solid ${t.type==='success'?'rgba(52,211,153,0.25)':t.type==='error'?'rgba(248,113,113,0.25)':'rgba(96,165,250,0.25)'}`,
            color:t.type==='success'?'#6ee7b7':t.type==='error'?'#fca5a5':'#93c5fd',
            backdropFilter:'blur(12px)', boxShadow:'0 8px 24px rgba(0,0,0,0.3)',
            display:'flex',alignItems:'center',gap:8,
            animation:'slideIn 0.25s ease',
          }}>
            {t.type==='success'?'✓':t.type==='error'?'✕':'ℹ'} {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

// --- Confirm Dialog ---
const ConfirmDialog = ({ msg, onConfirm, onCancel }) => (
  <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)'}}>
    <div style={{background:'rgba(8,22,60,0.95)',border:'1px solid rgba(80,130,220,0.2)',borderRadius:20,padding:'28px 28px',maxWidth:340,width:'100%',boxShadow:'0 32px 80px rgba(0,0,0,0.5)'}}>
      <p style={{color:'rgba(180,210,255,0.9)',fontSize:15,fontWeight:500,marginBottom:24,lineHeight:1.6}}>{msg}</p>
      <div style={{display:'flex',gap:10}}>
        <button onClick={onCancel} style={{flex:1,padding:'10px',background:'rgba(30,50,120,0.3)',border:'1px solid rgba(80,130,220,0.15)',borderRadius:12,color:'rgba(140,175,255,0.7)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Syne,sans-serif'}}>Cancel</button>
        <button onClick={onConfirm} style={{flex:1,padding:'10px',background:'rgba(180,30,30,0.2)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:12,color:'#fca5a5',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Syne,sans-serif'}}>Delete</button>
      </div>
    </div>
  </div>
);

// --- Main ---
const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ idNumber:'', name:'', phone:'' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({ total: 0, registered: 0, notRegistered: 0 });
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/members`),
        axios.get(`${API_URL}/stats`)
      ]);
      setMembers(membersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.idNumber?.includes(search) ||
    m.phone?.includes(search)
  );

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/members/${id}`);
      toast.success('Member deleted');
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/members`, newMember);
      toast.success('Member added!');
      setShowAddModal(false);
      setNewMember({ idNumber:'', name:'', phone:'' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await axios.post(`${API_URL}/admin/upload`, formData);
      toast.success(data.message);
      fetchData();
    } catch (err) {
      toast.error('CSV Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const exportCSV = () => {
    const rows = ['ID Number,Name,Phone,Status,Time', ...members.map(m =>
      `${m.idNumber},${m.name},${m.phone},${m.status},${m.registrationTime || '-'}`)];
    const blob = new Blob([rows.join('\n')], { type:'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download:'Members_Report.csv' });
    a.click();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{margin:0;background:#040d1a;}
        .dash{min-height:100vh;background:#040d1a;font-family:'DM Sans',sans-serif;color:#e8edf8;position:relative;overflow-x:hidden;}
        .blob1{position:fixed;top:-150px;left:-150px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(14,80,160,0.3) 0%,transparent 70%);pointer-events:none;z-index:0;}
        .blob2{position:fixed;bottom:-80px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(0,130,180,0.18) 0%,transparent 70%);pointer-events:none;z-index:0;}
        .grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:56px 56px;}
        .inner{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:24px 16px 60px;}
        
        /* Header */
        .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;gap:12px;}
        .header-left h1{font-family:'Syne',sans-serif;font-size:clamp(18px,4vw,26px);font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#fff 0%,#93c5fd 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .header-left p{font-size:12px;color:rgba(130,165,220,0.5);margin-top:2px;letter-spacing:0.05em;}
        .header-right{display:flex;gap:8px;align-items:center;}
        .icon-btn{padding:9px;background:rgba(15,35,80,0.5);border:1px solid rgba(80,130,220,0.15);border-radius:12px;color:rgba(140,175,255,0.7);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
        .icon-btn:hover{background:rgba(30,60,140,0.5);color:#93c5fd;}
        .logout-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;background:rgba(180,30,30,0.08);border:1px solid rgba(248,113,113,0.15);border-radius:12px;color:#fca5a5;cursor:pointer;font-size:13px;font-weight:600;font-family:'Syne',sans-serif;letter-spacing:0.05em;transition:all 0.2s;}
        .logout-btn:hover{background:rgba(180,30,30,0.15);}
        
        /* Stats */
        .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
        @media(max-width:560px){.stats-grid{grid-template-columns:1fr;}}
        .stat-card{background:rgba(8,22,60,0.6);border:1px solid rgba(80,130,220,0.12);border-radius:20px;padding:20px;backdrop-filter:blur(12px);animation:fadeUp 0.4s ease both;display:flex;align-items:center;gap:14px;}
        .stat-card:nth-child(1){animation-delay:0.05s}
        .stat-card:nth-child(2){animation-delay:0.1s}
        .stat-card:nth-child(3){animation-delay:0.15s}
        .stat-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .stat-label{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(120,160,220,0.5);font-weight:700;font-family:'Syne',sans-serif;margin-bottom:4px;}
        .stat-val{font-family:'Syne',sans-serif;font-size:clamp(24px,5vw,34px);font-weight:800;line-height:1;}
        
        /* Controls */
        .controls{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;align-items:center;}
        .search-wrap{flex:1;min-width:200px;position:relative;}
        .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(100,140,210,0.4);pointer-events:none;display:flex;}
        .search-input{width:100%;padding:11px 14px 11px 42px;background:rgba(10,25,65,0.5);border:1px solid rgba(80,130,220,0.15);border-radius:14px;color:#e8edf8;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.2s;}
        .search-input::placeholder{color:rgba(130,165,220,0.25);}
        .search-input:focus{border-color:rgba(96,165,250,0.4);background:rgba(15,40,100,0.5);box-shadow:0 0 0 3px rgba(96,165,250,0.08);}
        .ctrl-btns{display:flex;flex-wrap:wrap;gap:8px;}
        .ctrl-btn{display:flex;align-items:center;gap:7px;padding:10px 16px;background:rgba(10,25,65,0.5);border:1px solid rgba(80,130,220,0.15);border-radius:14px;color:rgba(150,190,255,0.7);font-size:12px;font-weight:700;font-family:'Syne',sans-serif;letter-spacing:0.06em;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .ctrl-btn:hover{background:rgba(25,60,150,0.4);color:#93c5fd;border-color:rgba(96,165,250,0.3);}
        .ctrl-btn.primary{background:linear-gradient(135deg,rgba(29,91,199,0.6),rgba(14,143,212,0.6));border-color:rgba(96,165,250,0.3);color:#fff;}
        .ctrl-btn.primary:hover{background:linear-gradient(135deg,rgba(37,99,235,0.7),rgba(14,165,233,0.7));}
        
        /* Table card */
        .table-card{background:rgba(6,18,50,0.7);border:1px solid rgba(80,130,220,0.1);border-radius:22px;overflow:hidden;backdrop-filter:blur(16px);box-shadow:0 24px 60px rgba(0,10,40,0.4);}
        .table-header-bar{padding:16px 20px;background:rgba(12,30,80,0.5);border-bottom:1px solid rgba(80,130,220,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
        .table-title{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(130,170,255,0.6);}
        .table-count{font-size:11px;color:rgba(100,140,200,0.4);font-weight:600;}
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
        table{width:100%;border-collapse:collapse;min-width:580px;}
        thead tr{background:rgba(12,30,80,0.4);border-bottom:1px solid rgba(80,130,220,0.08);}
        th{padding:12px 16px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(110,150,210,0.45);font-weight:700;font-family:'Syne',sans-serif;white-space:nowrap;}
        td{padding:13px 16px;border-bottom:1px solid rgba(80,130,220,0.05);font-size:13px;vertical-align:middle;}
        tbody tr:last-child td{border-bottom:none;}
        tbody tr:hover{background:rgba(20,50,120,0.12);}
        .td-id{font-family:monospace;font-weight:700;color:#fbbf24;font-size:14px;}
        .td-name{font-weight:600;color:#d4e4ff;}
        .td-phone{color:rgba(150,185,255,0.5);font-size:12px;font-family:monospace;}
        .td-time{color:rgba(120,155,210,0.4);font-size:11px;}
        .badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:'Syne',sans-serif;}
        .badge.registered{background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);color:#34d399;}
        .badge.pending{background:rgba(80,100,160,0.15);border:1px solid rgba(80,130,220,0.1);color:rgba(130,165,220,0.5);}
        .del-btn{padding:7px;background:transparent;border:none;color:rgba(130,160,210,0.25);cursor:pointer;border-radius:9px;display:flex;align-items:center;transition:all 0.2s;}
        .del-btn:hover{background:rgba(180,30,30,0.12);color:#fca5a5;}
        .empty-row td{padding:48px 20px;}
        .empty-inner{display:flex;flex-direction:column;align-items:center;gap:12px;color:rgba(100,130,190,0.25);}
        .empty-inner p{font-size:14px;font-weight:600;}
        
        /* Footer accent */
        .table-footer{height:3px;background:linear-gradient(90deg,transparent,#1e5bcd,#38bdf8,#1e5bcd,transparent);animation:gradientShift 4s ease infinite;background-size:200% 100%;}
        
        /* Modal */
        .modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,5,20,0.7);backdrop-filter:blur(8px);}
        .modal{background:rgba(6,18,55,0.97);border:1px solid rgba(80,130,220,0.2);border-radius:24px;padding:32px 28px;width:100%;max-width:420px;box-shadow:0 32px 80px rgba(0,5,30,0.6);animation:fadeUp 0.3s ease;}
        .modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#d4e4ff;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;}
        .modal-close{padding:6px;background:rgba(30,60,140,0.3);border:1px solid rgba(80,130,220,0.15);border-radius:9px;color:rgba(130,165,220,0.6);cursor:pointer;display:flex;align-items:center;transition:all 0.2s;}
        .modal-close:hover{color:#93c5fd;background:rgba(30,70,180,0.4);}
        .form-group{margin-bottom:16px;}
        .form-label{display:block;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(120,160,220,0.5);font-weight:700;font-family:'Syne',sans-serif;margin-bottom:7px;}
        .form-input{width:100%;padding:12px 16px;background:rgba(12,30,80,0.5);border:1px solid rgba(80,130,220,0.15);border-radius:12px;color:#e8edf8;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.2s;}
        .form-input::placeholder{color:rgba(130,165,220,0.2);}
        .form-input:focus{border-color:rgba(96,165,250,0.4);background:rgba(15,40,100,0.5);}
        .modal-actions{display:flex;gap:10px;margin-top:24px;}
        .modal-cancel{flex:1;padding:12px;background:rgba(20,45,110,0.3);border:1px solid rgba(80,130,220,0.15);border-radius:12px;color:rgba(140,175,255,0.6);font-size:13px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;letter-spacing:0.05em;transition:all 0.2s;}
        .modal-cancel:hover{background:rgba(30,65,160,0.4);}
        .modal-submit{flex:1;padding:12px;background:linear-gradient(135deg,#1d5bc7,#0e8fd4);border:none;border-radius:12px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;letter-spacing:0.06em;transition:all 0.2s;box-shadow:0 6px 20px rgba(29,91,199,0.3);}
        .modal-submit:hover{background:linear-gradient(135deg,#2563eb,#0ea5e9);}

        /* Mobile responsive tweaks */
        @media(max-width:480px){
          .inner{padding:16px 12px 48px;}
          .header{margin-bottom:20px;}
          .ctrl-btns{width:100%;}
          .ctrl-btn{flex:1;justify-content:center;padding:10px 10px;font-size:11px;}
          th,td{padding:10px 12px;}
        }
        @media(max-width:360px){
          .ctrl-btn span{display:none;}
        }
      `}</style>

      <div className="dash">
        <div className="blob1"/>
        <div className="blob2"/>
        <div className="grid-bg"/>

        {/* Confirm Delete */}
        {confirmDelete && (
          <ConfirmDialog
            msg="Are you sure you want to delete this member? This action cannot be undone."
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-title">
                Add New Member
                <button className="modal-close" onClick={() => setShowAddModal(false)}><IClose s={16}/></button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="form-group">
                  <label className="form-label">ID Number</label>
                  <input required className="form-input" placeholder="e.g. 1006" value={newMember.idNumber} onChange={e => setNewMember({...newMember, idNumber:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input required className="form-input" placeholder="Member full name" value={newMember.name} onChange={e => setNewMember({...newMember, name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input required className="form-input" placeholder="+91 XXXXX XXXXX" value={newMember.phone} onChange={e => setNewMember({...newMember, phone:e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="modal-submit">Add Member</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="inner">
          {/* Header */}
          <div className="header">
            <div className="header-left">
              <h1>Admin Dashboard</h1>
              <p>Attendance & Member Verification Control</p>
            </div>
            <div className="header-right">
              <button className="icon-btn" onClick={() => {}} title="Refresh" style={{animation: loading ? 'spin 1s linear infinite' : 'none'}}>
                <IRefresh s={17}/>
              </button>
              <button className="logout-btn">
                <ILogout s={16}/> <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{background:'rgba(29,91,199,0.15)',border:'1px solid rgba(96,165,250,0.2)'}}>
                <IUsers s={22} style={{color:'#60a5fa'}}/>
              </div>
              <div>
                <div className="stat-label">Total Members</div>
                <div className="stat-val" style={{color:'#e8edf8'}}>{stats.total}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.2)'}}>
                <ICheck s={22} style={{color:'#34d399'}}/>
              </div>
              <div>
                <div className="stat-label">Registered</div>
                <div className="stat-val" style={{color:'#34d399'}}>{stats.registered}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.2)'}}>
                <ICircle s={22} style={{color:'#fbbf24'}}/>
              </div>
              <div>
                <div className="stat-label">Pending</div>
                <div className="stat-val" style={{color:'#fbbf24'}}>{stats.notRegistered}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <div className="search-wrap">
              <div className="search-icon"><ISearch s={17}/></div>
              <input className="search-input" type="text" placeholder="Search by ID, Name or Phone…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="ctrl-btns">
              <button className="ctrl-btn" onClick={() => setShowAddModal(true)}>
                <IPlus s={15}/> <span>Add Member</span>
              </button>
              <button className="ctrl-btn" onClick={() => {
                const csv = "ID,Name,Phone\n1001,Example Name,9876543210";
                const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})), download:'template.csv'});
                a.click();
              }}>
                <IDownload s={15}/> <span>Template</span>
              </button>
              <label className="ctrl-btn primary" style={{cursor:'pointer'}}>
                <IUpload s={15}/> <span>{uploading ? 'Uploading…' : 'Upload CSV'}</span>
                <input type="file" accept=".csv" style={{display:'none'}} onChange={handleFileUpload} disabled={uploading} />
              </label>
              <button className="ctrl-btn" onClick={exportCSV}>
                <IDownload s={15}/> <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-header-bar">
              <span className="table-title">Member Registry</span>
              <span className="table-count">{filteredMembers.length} of {members.length} members</span>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Reg. Time</th>
                    <th style={{textAlign:'center'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(m => (
                    <tr key={m._id}>
                      <td className="td-id">#{m.idNumber}</td>
                      <td className="td-name">{m.name}</td>
                      <td className="td-phone">{m.phone}</td>
                      <td>
                        <span className={`badge ${m.status === 'Registered' ? 'registered' : 'pending'}`}>
                          {m.status === 'Registered' ? '● ' : '○ '}{m.status}
                        </span>
                      </td>
                      <td className="td-time">
                        {m.registrationTime ? new Date(m.registrationTime).toLocaleString('en-IN', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}
                      </td>
                      <td style={{textAlign:'center'}}>
                        <button className="del-btn" onClick={() => setConfirmDelete(m._id)} title="Delete">
                          <ITrash s={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr className="empty-row">
                      <td colSpan="6">
                        <div className="empty-inner">
                          <IFile s={40}/>
                          <p>No members found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer"/>
          </div>
        </div>
      </div>
    </>
  );
};

export default function App() {
  return <ToastProvider><AdminDashboard /></ToastProvider>;
}