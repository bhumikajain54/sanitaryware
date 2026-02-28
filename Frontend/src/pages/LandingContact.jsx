import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdSend, 
  MdChatBubble,
  MdSupportAgent,
  MdAutoAwesome,
  MdPublic,
  MdVerified,
  MdAccessTime
} from 'react-icons/md';

import { toast } from 'react-hot-toast';
import customerService from '../services/customerService';

const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[140px] opacity-20 animate-pulse ${className}`} />
);

const LandingContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await customerService.createContactInquiry(formData);
      setSuccess(true);
      toast.success('Message sent successfully');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MdPhone,
      title: 'VOICE CHANNEL',
      value: '+91 79740 47116',
      link: 'tel:+917974047116',
      desc: 'Active Mon-Sun, 10AM-8PM (Tue: 10AM-3PM)',
      color: 'teal'
    },
    {
      icon: MdEmail,
      title: 'DATA UPLINK',
      value: 'sajaljn0@gmail.com',
      link: 'https://mail.google.com/mail/?view=cm&fs=1&to=sajaljn0@gmail.com',
      desc: 'Expect resolution within 2-4 business hours.',
      color: 'indigo'
    },
    {
      icon: MdLocationOn,
      title: 'COMMAND CENTER',
      value: 'Balaghat, MP - 481001',
      link: 'https://www.google.com/maps/search/?api=1&query=Singhai+Traders+Maharana+Pratap+Chowk+Main+Road+Balaghat+MP+481001',
      desc: 'Maharana Pratap Chowk, Main Road.',
      color: 'sky'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-hidden relative selection:bg-teal-500/10 font-sans pb-32">
      {/* Dynamic Background Matrix */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[1000px] h-[1000px] bg-teal-200/30 -top-60 -left-60" />
        <GlowOrb className="w-[800px] h-[800px] bg-indigo-100/40 top-1/2 right-0" />
        <GlowOrb className="w-[900px] h-[900px] bg-sky-100/30 -bottom-60 -left-20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Hero Experience */}
      <section className="relative z-20 pt-24 pb-20 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:gap-20 items-end">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-teal-600 border border-white relative overflow-hidden group">
                <MdSupportAgent className="text-3xl relative z-10" />
                <div className="absolute inset-0 bg-teal-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </div>
              <span className="text-[11px] font-black tracking-[0.6em] text-teal-600 uppercase">Communication Terminal</span>
            </div>
            <h1 className="text-xl md:text-4xl lg:text-6xl font-black tracking-tighter leading-none mb-6 md:mb-10 text-slate-900">
              DIRECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500 italic">LINK.</span>
            </h1>
            <p className="text-slate-500 text-[10px] md:text-lg max-w-lg font-medium leading-relaxed italic border-l-4 border-teal-500/20 pl-4 md:pl-8">
               Our expert advisory board is synchronized and ready to assist with your premium architectural requirements.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex justify-end relative"
          >
             <div className="p-2 md:p-8 bg-white/80 backdrop-blur-2xl rounded-xl md:rounded-[3rem] border border-white shadow-2xl shadow-teal-100/30 flex items-center gap-2 md:gap-8">
                <div className="w-6 h-6 md:w-20 md:h-20 bg-teal-500 rounded-lg md:rounded-[2rem] flex items-center justify-center text-white text-[10px] md:text-4xl shadow-xl shadow-teal-500/30 animate-pulse">
                    <MdChatBubble />
                </div>
                <div>
                    <h4 className="text-[8px] md:text-xl font-black text-slate-900 tracking-tight leading-none">WHATSAPP SYNC</h4>
                    <p className="text-[5px] md:text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Online & Ready</p>
                    <a 
                        href="https://wa.me/917974047116" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block mt-1 md:mt-4 text-[6px] md:text-xs font-black text-indigo-600 hover:text-indigo-400 underline underline-offset-2 md:underline-offset-4 tracking-widest"
                    >
                        SYNC →
                    </a>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Contact Grid */}
      <section className="relative z-20 max-w-7xl mx-auto px-2 md:px-6">
        <div className="grid grid-cols-12 gap-2 md:gap-16">
          
          {/* Information Column */}
          <div className="col-span-4 space-y-2 md:space-y-6">
             <div className="px-1 md:px-4 mb-2 md:mb-8">
                <h5 className="text-[6px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol Channels</h5>
             </div>
             
             {contactInfo.map((info, idx) => (
                <motion.a
                    key={idx}
                    href={info.link}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex items-center gap-2 md:gap-8 p-2 md:p-8 bg-white/40 hover:bg-white rounded-lg md:rounded-[2.5rem] border border-transparent hover:border-teal-500/10 transition-all duration-500 block shadow-sm hover:shadow-xl hover:shadow-teal-100/20"
                >
                    <div className={`w-6 h-6 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 group-hover:rotate-12`}>
                        <info.icon className="text-[10px] md:text-[28px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[5px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 group-hover:text-teal-600 transition-colors truncate">{info.title}</h4>
                        <div className="text-[7px] md:text-lg font-black text-slate-900 tracking-tight mb-0.5 truncate">{info.value}</div>
                        <p className="hidden md:block text-[10px] text-slate-400 font-medium leading-tight">{info.desc}</p>
                    </div>
                </motion.a>
             ))}
          </div>

          {/* Form Column */}
          <div className="col-span-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl md:rounded-[4rem] p-3 md:p-20 shadow-[0_60px_150px_-20px_rgba(0,0,0,0.05)] border-2 border-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-10 h-10 md:w-40 md:h-40 bg-teal-50/50 rounded-bl-xl md:rounded-bl-[6rem] flex items-center justify-center opacity-40">
                    <MdVerified className="text-sm md:text-5xl text-teal-500" />
                </div>

                <div className="mb-8 relative z-10">
                  <h2 className="text-2xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">
                    TRANSMIT <span className="text-teal-600 italic">MESSAGE.</span>
                  </h2>
                  <p className="text-slate-400 text-xs md:text-lg font-medium">Define your project parameters in our secure transmission matrix.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-8 relative z-10">
                    <div className="grid grid-cols-2 gap-2 md:gap-8">
                        <div className="space-y-1 md:space-y-3">
                            <label className="text-[5px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-4">Identity</label>
                            <input 
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Full Name"
                                className="w-full px-2 md:px-8 py-2 md:py-5 bg-slate-50 border border-transparent focus:border-teal-500 focus:bg-white rounded-lg md:rounded-3xl outline-none transition-all font-bold text-[7px] md:text-base text-slate-800 placeholder:text-slate-300 shadow-inner"
                            />
                        </div>
                        <div className="space-y-1 md:space-y-3">
                            <label className="text-[5px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-4">Address (Email)</label>
                            <input 
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="name@domain.com"
                                className="w-full px-2 md:px-8 py-2 md:py-5 bg-slate-50 border border-transparent focus:border-teal-500 focus:bg-white rounded-lg md:rounded-3xl outline-none transition-all font-bold text-[7px] md:text-base text-slate-800 placeholder:text-slate-300 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:gap-8">
                        <div className="space-y-1 md:space-y-3">
                            <label className="text-[5px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-4">Voice (Phone)</label>
                            <input 
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+91 XXXX XXX XXX"
                                className="w-full px-2 md:px-8 py-2 md:py-5 bg-slate-50 border border-transparent focus:border-teal-500 focus:bg-white rounded-lg md:rounded-3xl outline-none transition-all font-bold text-[7px] md:text-base text-slate-800 placeholder:text-slate-300 shadow-inner"
                            />
                        </div>
                        <div className="space-y-1 md:space-y-3">
                            <label className="text-[5px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-4">Sector</label>
                            <select 
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                className="w-full px-2 md:px-8 py-2 md:py-5 bg-slate-50 border border-transparent focus:border-teal-500 focus:bg-white rounded-lg md:rounded-3xl outline-none transition-all font-bold text-[7px] md:text-base text-slate-800 appearance-none shadow-inner"
                            >
                                <option value="">SELECT</option>
                                <option value="Architecture">ARCHITECTURAL</option>
                                <option value="Inventory">INVENTORY</option>
                                <option value="Service">SERVICE</option>
                                <option value="Bulk">BULK</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1 md:space-y-3">
                        <label className="text-[5px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-4">Intel (Message)</label>
                        <textarea 
                            rows="2"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            placeholder="Describe project..."
                            className="w-full px-3 md:px-8 py-2 md:py-6 bg-slate-50 border border-transparent focus:border-teal-500 focus:bg-white rounded-xl md:rounded-[2rem] outline-none transition-all font-bold text-[7px] md:text-base text-slate-800 resize-none placeholder:text-slate-300 shadow-inner"
                        />
                    </div>

                    <div className="pt-2 md:pt-6">
                        <button 
                            type="submit"
                            disabled={isSubmitting || success}
                            className="w-full bg-slate-900 hover:bg-teal-600 text-white py-2 md:py-6 rounded-lg md:rounded-[2rem] font-black uppercase tracking-[0.3em] text-[7px] md:text-xs shadow-2xl hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 md:gap-4 active:scale-95 disabled:opacity-70 group overflow-hidden relative"
                        >
                            <AnimatePresence mode="wait">
                                {isSubmitting ? (
                                    <motion.div 
                                        key="loading"
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" 
                                    />
                                ) : success ? (
                                    <motion.div 
                                        key="success"
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <MdVerified size={24} />
                                        <span>TRANSMISSION COMPLETE</span>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="idle"
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-4"
                                    >
                                        <MdSend size={20} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                                        <span>INITIALIZE DEPLOYMENT</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </form>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default LandingContact;
