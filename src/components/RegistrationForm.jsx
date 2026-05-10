import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, User, Phone, Map, Send, Loader2 } from 'lucide-react';

let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

const RegistrationForm = () => {
  const [idSearch, setIdSearch] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, registered: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/stats`);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setMember(null);
    setLoading(true);

    try {
      const { data } = await axios.get(`${API_URL}/search/${idSearch}`);
      setMember(data);
    } catch (err) {
      setError(err.response?.data?.message || 'ID not found.');
      toast.error('Member not found');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/confirm`, { idNumber: member.idNumber });
      toast.success('Registration Confirmed!');
      setIsSubmitted(true);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-4xl mb-12 text-[10px] uppercase tracking-widest text-white/60 font-bold">
        <div className="flex items-center gap-2"><span>@markazonline</span></div>
        <div className="flex items-center gap-2"><span>www.markaz.in</span></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center mb-10"
      >
        <div className="mb-10 w-full max-w-md mx-auto overflow-hidden rounded-[2rem] shadow-2xl border border-white/10 relative group">
          <img src="/IMG-20260427-WA0047.jpg" alt="Event Poster" className="w-full h-auto object-contain" />
        </div>
      </motion.div>

      {isSubmitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-card rounded-3xl p-10 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <User className="text-green-400" size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase italic">Confirmed!</h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Thank you, <span className="text-purple-300 font-bold">{member?.name}</span>! Your attendance has been successfully recorded.
          </p>
          <button onClick={() => { setIsSubmitted(false); setMember(null); setIdSearch(''); }} className="btn-primary">Verify Another</button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-card rounded-3xl p-8 mb-16">
          {!member ? (
            <>
              <h2 className="text-xl font-bold mb-6 text-center uppercase tracking-widest">Verify Your ID</h2>
              <form onSubmit={handleSearch} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-medium mb-1.5 ml-1 text-purple-100 uppercase tracking-widest">Enter ID Number</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1001"
                      className="form-input pl-11"
                      value={idSearch}
                      onChange={(e) => setIdSearch(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs text-center font-bold">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary mt-4 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Verify ID</>}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h2 className="text-2xl font-black mb-6 uppercase">Is this you?</h2>
              <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 text-left space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs uppercase">Name</span>
                  <span className="font-bold text-purple-200">{member.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs uppercase">Phone</span>
                  <span className="font-mono text-purple-200">{member.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase">ID Number</span>
                  <span className="font-bold text-[#fbbf24]">{member.idNumber}</span>
                </div>
              </div>
              {member.status === 'Registered' ? (
                <div className="p-4 bg-orange-500/20 rounded-xl border border-orange-500/30 text-orange-300 text-sm font-bold mb-6">
                  ⚠️ This ID is already registered.
                </div>
              ) : (
                <button onClick={handleConfirm} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Registration'}
                </button>
              )}
              <button onClick={() => setMember(null)} className="mt-4 text-xs text-white/40 hover:text-white transition-colors underline">Not you? Search again</button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12">
        <div className="glass-card p-4 rounded-2xl text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Live Attendance</p>
          <p className="text-2xl font-black text-purple-300">{stats.registered || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total Members</p>
          <p className="text-2xl font-black text-white/80">{stats.total || 0}</p>
        </div>
      </div>

      <footer className="w-full max-w-2xl text-center space-y-4 pb-12">
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">
          Exclusive Event for Pre-Registered Members
        </div>
      </footer>
    </div>
  );
};

export default RegistrationForm;
