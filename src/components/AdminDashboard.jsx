import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Search, 
  Download, 
  Trash2,
  LogOut,
  RefreshCw,
  FileText,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, registered: 0, notRegistered: 0 });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
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
      toast.error('CSV Upload failed. Ensure headers are ID, Name, Phone.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await axios.delete(`${API_URL}/admin/members/${id}`);
      toast.success('Member deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const exportCSV = () => {
    const headers = ['ID Number,Name,Phone,Status,Time'];
    const rows = members.map(m => 
      `${m.idNumber},${m.name},${m.phone},${m.status},${m.registrationTime || '-'}`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Members_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.idNumber.includes(search) ||
    m.phone.includes(search)
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ idNumber: '', name: '', phone: '' });

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/members`, newMember);
      toast.success('Member added successfully!');
      setShowAddModal(false);
      setNewMember({ idNumber: '', name: '', phone: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0720] text-white p-4 md:p-8">
      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black mb-6 uppercase italic">Add New Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 block mb-1 ml-1">ID Number</label>
                <input 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all"
                  value={newMember.idNumber}
                  onChange={(e) => setNewMember({...newMember, idNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 block mb-1 ml-1">Full Name</label>
                <input 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 block mb-1 ml-1">Phone Number</label>
                <input 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Admin Dashboard</h1>
          <p className="text-white/40 text-sm">Attendance & Member Verification Control</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/20 transition-all font-bold text-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
              <Users className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40">Total Members</p>
              <p className="text-3xl font-black">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/20">
              <CheckCircle className="text-green-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40">Registered</p>
              <p className="text-3xl font-black text-green-400">{stats.registered}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <XCircle className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40">Not Registered</p>
              <p className="text-3xl font-black text-orange-400">{stats.notRegistered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text"
            placeholder="Search by ID, Name or Phone..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-purple-500/50 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 font-bold transition-all text-purple-200"
          >
            <UserPlus size={18} /> Add Member
          </button>
          <button 
            onClick={() => {
              const csvContent = "ID,Name,Phone\n1001,John Doe,9876543210";
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'member_template.csv';
              a.click();
            }}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 font-bold transition-all text-blue-300"
          >
            <Download size={18} /> Template
          </button>
          <label className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${uploading ? 'bg-white/5 opacity-50' : 'bg-purple-600 hover:bg-purple-500'}`}>
            <Upload size={18} />
            {uploading ? 'Processing...' : 'Upload Members CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 font-bold transition-all"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-bold">ID Number</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-bold">Full Name</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-bold">Phone Number</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-bold">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-bold">Reg. Time</th>
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-purple-300">#{member.idNumber}</td>
                  <td className="px-6 py-4 font-bold">{member.name}</td>
                  <td className="px-6 py-4 text-white/60">{member.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      member.status === 'Registered' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-white/5 text-white/30 border-white/5'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-white/40">
                    {member.registrationTime ? new Date(member.registrationTime).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDelete(member._id)}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-white/20">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={48} className="opacity-10" />
                      <p className="font-bold">No members found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
