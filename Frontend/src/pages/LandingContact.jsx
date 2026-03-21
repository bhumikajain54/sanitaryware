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
    name: '', email: '', phone: '', subject: '', message: '',
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

  const inputBase = "w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 lg:py-5 bg-slate-50 border border-transparent focus:border-teal-500 focus:bg-white rounded-xl md:rounded-2xl lg:rounded-3xl outline-none transition-all font-bold text-xs sm:text-sm md:text-base text-slate-800 placeholder:text-slate-300 shadow-inner";
  const labelBase = "text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 sm:ml-2 md:ml-4 block mb-1 sm:mb-1.5 md:mb-2";

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-x-hidden relative selection:bg-teal-500/10 font-sans pb-16 sm:pb-20 md:pb-24 lg:pb-32">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[500px] sm:w-[700px] lg:w-[1000px] h-[500px] sm:h-[700px] lg:h-[1000px] bg-teal-200/30 -top-40 -left-40" />
        <GlowOrb className="w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-indigo-100/40 top-1/2 right-0" />
        <GlowOrb className="w-[450px] sm:w-[650px] lg:w-[900px] h-[450px] sm:h-[650px] lg:h-[900px] bg-sky-100/30 -bottom-40 -left-20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-20 pt-8 sm:pt-12 md:pt-16 lg:pt-24 pb-8 sm:pb-12 md:pb-16 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 sm:gap-8 md:gap-12 lg:gap-20">

          {/* Left: Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex-1"
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-xl flex items-center justify-center text-teal-600 border border-white relative overflow-hidden group flex-shrink-0">
                <MdSupportAgent className="text-base sm:text-xl md:text-3xl relative z-10" />
                <div className="absolute inset-0 bg-teal-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-[0.3em] sm:tracking-[0.45em] md:tracking-[0.6em] text-teal-600 uppercase">
                Communication Terminal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-none mb-3 sm:mb-5 md:mb-6 lg:mb-10 text-slate-900">
              DIRECT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500 italic">
                LINK.
              </span>
            </h1>

            <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-lg max-w-lg font-medium leading-relaxed italic border-l-2 md:border-l-4 border-teal-500/20 pl-3 sm:pl-4 md:pl-6 lg:pl-8">
              Our expert advisory board is synchronized and ready to assist with your premium architectural requirements.
            </p>
          </motion.div>

          {/* Right: WhatsApp Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-shrink-0 self-start sm:self-end"
          >
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-2xl md:rounded-3xl lg:rounded-[3rem] border border-white shadow-2xl shadow-teal-100/30 flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-teal-500 rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-[2rem] flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl shadow-xl shadow-teal-500/30 animate-pulse flex-shrink-0">
                <MdChatBubble />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm md:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-none">
                  WHATSAPP SYNC
                </h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-teal-600 font-bold uppercase tracking-widest mt-0.5 md:mt-1">
                  Online & Ready
                </p>
                <a
                  href="https://wa.me/917974047116"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 text-[9px] sm:text-[10px] md:text-xs font-black text-indigo-600 hover:text-indigo-400 underline underline-offset-2 md:underline-offset-4 tracking-widest"
                >
                  SYNC →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Grid ── */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stack on mobile, side-by-side on lg+ */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-16">

          {/* ── Contact Info Column ── */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-8">
              <h5 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] sm:tracking-[0.4em]">
                Protocol Channels
              </h5>
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
                className="group flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-8 p-3 sm:p-4 md:p-5 lg:p-8 bg-white/40 hover:bg-white rounded-2xl sm:rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] border border-transparent hover:border-teal-500/10 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-teal-100/20"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 group-hover:rotate-12 flex-shrink-0">
                  <info.icon className="text-sm sm:text-base md:text-lg lg:text-[28px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 group-hover:text-teal-600 transition-colors truncate">
                    {info.title}
                  </h4>
                  <div className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-slate-900 tracking-tight mb-0.5 truncate">
                    {info.value}
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-medium leading-tight truncate">
                    {info.desc}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* ── Contact Form ── */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl sm:rounded-3xl md:rounded-[3rem] lg:rounded-[4rem] p-5 sm:p-6 md:p-10 lg:p-16 xl:p-20 shadow-[0_60px_150px_-20px_rgba(0,0,0,0.05)] border-2 border-white relative overflow-hidden"
            >
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-40 lg:h-40 bg-teal-50/50 rounded-bl-3xl md:rounded-bl-[4rem] lg:rounded-bl-[6rem] flex items-center justify-center opacity-40">
                <MdVerified className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-teal-500" />
              </div>

              {/* Form header */}
              <div className="mb-5 sm:mb-6 md:mb-8 relative z-10">
                <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1.5 sm:mb-2">
                  TRANSMIT{' '}
                  <span className="text-teal-600 italic">MESSAGE.</span>
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
                  Define your project parameters in our secure transmission matrix.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-8 relative z-10">

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-8">
                  <div>
                    <label className={labelBase}>Identity</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full Name"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Address (Email)</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className={inputBase}
                    />
                  </div>
                </div>

                {/* Row 2: Phone + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-8">
                  <div>
                    <label className={labelBase}>Voice (Phone)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXX XXX XXX"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Sector</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`${inputBase} appearance-none cursor-pointer`}
                    >
                      <option value="">SELECT</option>
                      <option value="Architecture">ARCHITECTURAL</option>
                      <option value="Inventory">INVENTORY</option>
                      <option value="Service">SERVICE</option>
                      <option value="Bulk">BULK</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className={labelBase}>Intel (Message)</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe project..."
                    className={`${inputBase} resize-none rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-[2rem]`}
                    style={{ rows: undefined }}
                  />
                </div>

                {/* Submit */}
                <div className="pt-1 sm:pt-2 md:pt-3 lg:pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || success}
                    className="w-full bg-slate-900 hover:bg-teal-600 text-white py-3 sm:py-3.5 md:py-4 lg:py-5 xl:py-6 rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs shadow-2xl hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 sm:gap-3 md:gap-4 active:scale-95 disabled:opacity-70 group overflow-hidden relative"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"
                        />
                      ) : success ? (
                        <motion.div
                          key="success"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 sm:gap-3"
                        >
                          <MdVerified className="text-base sm:text-lg md:text-xl lg:text-2xl" />
                          <span>TRANSMISSION COMPLETE</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 sm:gap-3 md:gap-4"
                        >
                          <MdSend className="text-sm sm:text-base md:text-lg lg:text-xl group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
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