import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdSecurity, 
  MdVisibility, 
  MdLock, 
  MdUpdate, 
  MdVerifiedUser,
  MdFingerprint,
  MdVpnLock,
  MdAutoAwesome
} from 'react-icons/md';

const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[140px] opacity-20 animate-pulse ${className}`} />
);

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  
  const handleReportClick = () => {
    // You can customize this behavior:
    // Option 1: Navigate to contact page
    // navigate('/contact');
    
    // Option 2: Show alert (current implementation)
    alert('Privacy Report: To report a privacy concern or request data access, please contact us at sajaljn0@gmail.com or call +91 79740 47116');
    
    // Option 3: Open email client
    // window.location.href = 'mailto:sajaljn0@gmail.com?subject=Privacy Report';
  };

  const pillars = [
    {
      icon: MdVisibility,
      title: 'Collection Matrix',
      desc: 'Automated ingestion of essential parameters during account creation and transaction cycles.',
      detail: 'Name, encryption-ready email, and logistical coordinates.'
    },
    {
      icon: MdLock,
      title: 'Data Sovereignty',
      desc: 'Your dataset is deployed exclusively for order resolution and secure system optimization.',
      detail: 'Zero external propagation without explicit user authorization.'
    },
    {
      icon: MdSecurity,
      title: 'Shield Protocol',
      desc: 'Enterprise-grade encryption layers protecting every byte of your architectural data.',
      detail: 'Financial payloads are never stored on internal server infrastructure.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-hidden relative selection:bg-teal-500/10 font-sans">
      {/* Dynamic Security Foundation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[1000px] h-[1000px] bg-teal-100/30 -top-60 -left-60" />
        <GlowOrb className="w-[800px] h-[800px] bg-indigo-50/20 top-1/2 left-1/2 -translate-x-1/2" />
        <GlowOrb className="w-[900px] h-[900px] bg-sky-100/30 -bottom-60 -right-60" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Hero Experience */}
      <section className="relative z-20 pt-12 pb-10 md:pb-20 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:gap-20 items-end">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-10">
              <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-white shadow-lg md:shadow-xl flex items-center justify-center text-teal-600 border border-white relative overflow-hidden group">
                <MdSecurity className="text-sm md:text-3xl relative z-10" />
                <div className="absolute inset-0 bg-teal-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </div>
              <span className="text-[7px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.6em] text-teal-600 uppercase">Privacy Protocol</span>
            </div>
            <h1 className="text-xl md:text-4xl lg:text-6xl font-black tracking-tighter leading-none mb-4 md:mb-8 text-slate-900">
              PROTECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500 italic">LEGACY.</span>
            </h1>
            <div className="flex items-center gap-2 md:gap-6 italic">
                <div className="h-px w-10 md:w-20 bg-teal-500/30" />
                <p className="text-slate-500 text-[8px] md:text-xl font-medium leading-tight">Securing the architectural DNA of your luxury spaces.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <div className="px-3 md:px-8 py-2 md:py-4 bg-white/80 backdrop-blur-xl rounded-full border border-white shadow-lg md:shadow-xl shadow-slate-200/50 flex items-center gap-2 md:gap-4 min-w-fit">
                <MdUpdate className="text-teal-500 text-[10px] md:text-xl" />
                <span className="text-[6px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.3em] uppercase text-slate-400 whitespace-nowrap">Compliance Sync: JAN 2026</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Pillars Grid */}
      <section className="relative z-20 pb-20 md:pb-32 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-3 gap-3 md:gap-8 mb-12 md:mb-24">
          {pillars.map((pillar, idx) => (idx === 1 ? (
            <motion.div
               key={idx}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="bg-slate-900 rounded-[1.5rem] md:rounded-[3.5rem] p-4 md:p-12 text-white relative shadow-2xl overflow-hidden group border-2 md:border-4 border-slate-900 hover:border-teal-500/30 transition-all duration-700"
            >
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                    <MdVerifiedUser className="text-4xl md:text-[120px]" />
                </div>
                <div className="w-8 h-8 md:w-16 md:h-16 bg-white/10 rounded-lg md:rounded-2xl flex items-center justify-center mb-4 md:mb-10 text-teal-400 text-sm md:text-3xl">
                    <pillar.icon />
                </div>
                <h3 className="text-[10px] md:text-2xl font-black mb-1 md:mb-4 tracking-tight uppercase leading-none">{pillar.title}</h3>
                <p className="text-slate-400 text-[8px] md:text-sm font-medium leading-tight md:leading-relaxed mb-4 md:mb-10 line-clamp-3 md:line-clamp-none">{pillar.desc}</p>
                <div className="pt-3 md:pt-6 border-t border-white/10 text-[6px] md:text-[10px] font-black tracking-widest text-teal-400 uppercase hidden md:block">
                    {pillar.detail}
                </div>
            </motion.div>
          ) : (
            <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[3.5rem] p-4 md:p-12 border border-white shadow-sm hover:shadow-2xl hover:shadow-teal-100/30 group transition-all duration-700"
            >
                <div className="w-8 h-8 md:w-16 md:h-16 bg-slate-50 rounded-lg md:rounded-2xl flex items-center justify-center mb-4 md:mb-10 text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-teal-500/20">
                    <pillar.icon className="text-sm md:text-[28px]" />
                </div>
                <h3 className="text-[10px] md:text-2xl font-black text-slate-900 mb-1 md:mb-4 tracking-tight uppercase leading-none">{pillar.title}</h3>
                <p className="text-slate-500 text-[8px] md:text-sm font-medium leading-tight md:leading-relaxed mb-4 md:mb-10 line-clamp-3 md:line-clamp-none">{pillar.desc}</p>
                <div className="pt-3 md:pt-6 border-t border-slate-50 text-[6px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase group-hover:text-teal-600 transition-colors hidden md:block">
                    {pillar.detail}
                </div>
            </motion.div>
          )))}
        </div>

        {/* Detailed Core Panel */}
        <div className="grid grid-cols-12 gap-4 md:gap-16">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="col-span-8 space-y-6 md:space-y-12"
            >
                <div className="bg-white rounded-[1.5rem] md:rounded-[4rem] p-6 md:p-12 lg:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border md:border-2 border-slate-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-teal-50/50 rounded-bl-[2rem] md:rounded-bl-[5rem] flex items-center justify-center opacity-40">
                        <MdAutoAwesome className="text-xl md:text-4xl text-teal-500" />
                    </div>
                    
                    <h2 className="text-[10px] md:text-4xl font-black text-slate-900 mb-6 md:mb-12 tracking-tighter uppercase relative z-10 leading-none">THE DETAILED <br/><span className="text-teal-600 underline decoration-teal-500/20 underline-offset-4 md:underline-offset-8">FOUNDATION.</span></h2>
                    
                    <div className="space-y-6 md:space-y-10 relative z-10">
                        <div className="group flex items-start gap-3 md:gap-6">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-500">
                                <MdFingerprint className="text-xs md:text-xl" />
                            </div>
                            <div>
                                <h4 className="text-[5px] md:text-xs font-black tracking-widest text-slate-300 uppercase mb-1 md:mb-4 group-hover:text-indigo-500 transition-colors">Digital Fingerprints</h4>
                                <p className="text-slate-500 text-[6px] md:text-lg leading-tight md:leading-relaxed font-medium">
                                    'Cookies' optimize the visual payload of your curation interaction.
                                </p>
                            </div>
                        </div>

                        <div className="group flex items-start gap-3 md:gap-6">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-500">
                                <MdVpnLock className="text-xs md:text-xl" />
                            </div>
                            <div>
                                <h4 className="text-[5px] md:text-xs font-black tracking-widest text-slate-300 uppercase mb-1 md:mb-4 group-hover:text-teal-500 transition-colors">External Nodes</h4>
                                <p className="text-slate-500 text-[6px] md:text-lg leading-tight md:leading-relaxed font-medium">
                                    Protocols confined to Singhai mainframe security standards.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="col-span-4 space-y-4 md:space-y-8"
            >
                <div className="grid grid-cols-1 gap-4 md:gap-8">
                  
                    <div className="bg-gradient-to-br from-indigo-500 to-sky-500 p-6 md:p-12 rounded-[1.5rem] md:rounded-[3.5rem] text-white shadow-xl shadow-indigo-200 ring-4 md:ring-8 ring-white/20">
                        <MdVpnLock className="text-2xl md:text-5xl mb-4 md:mb-8" />
                        <h3 className="text-[8px] md:text-3xl font-black mb-3 md:mb-6 tracking-tight leading-none uppercase">Global Shield</h3>
                        <p className="text-white/80 text-[6px] md:text-sm font-medium leading-tight md:leading-relaxed mb-4 md:mb-10 line-clamp-3 md:line-clamp-none">
                            Synchronized with global data protection architectures.
                        </p>
                        <button 
                            onClick={handleReportClick}
                            className="w-full py-2 md:py-4 bg-white text-indigo-600 rounded-xl md:rounded-2xl font-black text-[5px] md:text-[10px] tracking-widest uppercase hover:shadow-lg hover:bg-indigo-50 transition-all active:scale-95 cursor-pointer"
                        >
                            Report
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
