import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, User, Phone, Map, Send, Loader2 } from 'lucide-react';

let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    place: ''
  });
  const [loading, setLoading] = useState(false);
  const [regCount, setRegCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/count`);
      setRegCount(response.data.count);
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numbers and max 10 digits
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      toast.success('Registration Successful!');
      setIsSubmitted(true);
      fetchCount(); // Update count in real-time
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
      {/* Top Header Section */}
      <div className="w-full flex justify-between items-center max-w-4xl mb-12 text-[10px] uppercase tracking-widest text-white/60 font-bold">
        <div className="flex items-center gap-2">
          <span>@markazonline</span>
        </div>
        <div className="flex items-center gap-2">
          <span>www.markaz.in</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center mb-10"
      >
        {/* Poster Image Section - Reduced size and centered */}
        <div className="mb-10 w-full max-w-md mx-auto overflow-hidden rounded-[2rem] shadow-2xl border border-white/10 relative group">
          <img 
            src="/IMG-20260427-WA0047.jpg" 
            alt="Event Poster" 
            className="w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>

      </motion.div>

      {isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-card rounded-3xl p-10 text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <User className="text-green-400" size={40} />
            </motion.div>
          </div>
          
          <h2 className="text-3xl font-black mb-4">Awesome!</h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Thank you, <span className="text-purple-300 font-bold">{formData.name}</span>! Your registration for the Annual Gathering has been successfully received.
          </p>

          <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 text-left space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-white/40">Phone:</span>
                <span className="font-mono">{formData.phone}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-white/40">Place:</span>
                <span>{formData.place}</span>
             </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ name: '', phone: '', place: '' });
            }}
            className="btn-primary flex items-center justify-center gap-2"
          >
            Register Another
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md glass-card rounded-3xl p-8 mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-widest text-sm">Join the Gathering</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 text-purple-100 uppercase tracking-wider text-[10px]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your name"
                  className="form-input pl-11"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 text-purple-100 uppercase tracking-wider text-[10px]">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit phone number"
                  className="form-input pl-11"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 text-purple-100 uppercase tracking-wider text-[10px]">Place</label>
              <div className="relative">
                <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  name="place"
                  required
                  placeholder="Where are you from?"
                  className="form-input pl-11"
                  value={formData.place}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-4 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Send size={18} />
                  Register
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
      
      {/* Footer Section matching Poster */}
      <footer className="w-full max-w-2xl text-center space-y-4 pb-12">
        <div className="flex justify-center gap-1.5">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
           ))}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium tracking-wide">Directorate of Public Relations</p>
          <h4 className="text-xl font-bold tracking-tight">Markazu Saquafathi Sunniyya</h4>
          <p className="text-[10px] text-white/60 tracking-wider uppercase">
            Karanthur P.O., Kozhikode, Keralam, India - 673571
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-bold">
           <span>+91 7025 22 00 88</span>
           <span>info@markaz.in</span>
           <span>www.markaz.in</span>
        </div>
      </footer>
    </div>
  );

};

export default RegistrationForm;
