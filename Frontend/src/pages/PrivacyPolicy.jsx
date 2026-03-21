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
    alert('Privacy Report: To report a privacy concern or request data access, please contact us at sajaljn0@gmail.com or call +91 79740 47116');
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
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-x-hidden relative selection:bg-teal-500/10 font-sans">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[600px] sm:w-[800px] lg:w-[1000px] h-[600px] sm:h-[800px] lg:h-[1000px] bg-teal-100/30 -top-40 -left-40" />
        <GlowOrb className="w-[500px] sm:w-[700px] lg:w-[800px] h-[500px] sm:h-[700px] lg:h-[800px] bg-indigo-50/20 top-1/2 left-1/2 -translate-x-1/2" />
        <GlowOrb className="w-[500px] sm:w-[700px] lg:w-[900px] h-[500px] sm:h-[700px] lg:h-[900px] bg-sky-100/30 -bottom-40 -right-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-20 pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-12 md:pb-16 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 sm:gap-8 md:gap-12 lg:gap-20">

          {/* Left: Title */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="flex-1"
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-lg flex items-center justify-center text-teal-600 border border-white relative overflow-hidden group flex-shrink-0">
                <MdSecurity className="text-base sm:text-xl md:text-3xl relative z-10" />
                <div className="absolute inset-0 bg-teal-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.6em] text-teal-600 uppercase">
                Privacy Protocol
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-none mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-slate-900">
              PROTECT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500 italic">
                LEGACY.
              </span>
            </h1>

            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 italic">
              <div className="h-px w-10 sm:w-14 md:w-20 bg-teal-500/30 flex-shrink-0" />
              <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-xl font-medium leading-snug">
                Securing the architectural DNA of your luxury spaces.
              </p>
            </div>
          </motion.div>

          {/* Right: Compliance badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0"
          >
            <div className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/80 backdrop-blur-xl rounded-full border border-white shadow-xl flex items-center gap-2 sm:gap-3 md:gap-4">
              <MdUpdate className="text-teal-500 text-sm sm:text-base md:text-xl flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase text-slate-400 whitespace-nowrap">
                Compliance Sync: JAN 2026
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Privacy Pillars ── */}
      <section className="relative z-20 pb-12 sm:pb-16 md:pb-24 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 3-col pillar cards: stack on mobile, 3-col on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-8 sm:mb-12 md:mb-16 lg:mb-24">
          {pillars.map((pillar, idx) =>
            idx === 1 ? (
              // Dark featured card
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-900 rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] p-6 sm:p-8 md:p-10 lg:p-12 text-white relative shadow-2xl overflow-hidden group border-2 sm:border-4 border-slate-900 hover:border-teal-500/30 transition-all duration-700"
              >
                <div className="absolute top-0 right-0 p-6 sm:p-7 md:p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                  <MdVerifiedUser className="text-6xl sm:text-7xl md:text-8xl lg:text-[120px]" />
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 md:mb-8 lg:mb-10 text-teal-400 text-xl sm:text-2xl md:text-3xl">
                  <pillar.icon />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-black mb-2 sm:mb-3 md:mb-4 tracking-tight uppercase leading-none">
                  {pillar.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-xs md:text-sm font-medium leading-relaxed mb-5 md:mb-8 lg:mb-10">
                  {pillar.desc}
                </p>
                <div className="pt-3 sm:pt-4 md:pt-5 lg:pt-6 border-t border-white/10 text-[9px] sm:text-[10px] font-black tracking-widest text-teal-400 uppercase">
                  {pillar.detail}
                </div>
              </motion.div>
            ) : (
              // Light card
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/40 backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] p-6 sm:p-8 md:p-10 lg:p-12 border border-white shadow-sm hover:shadow-2xl hover:shadow-teal-100/30 group transition-all duration-700"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 md:mb-8 lg:mb-10 text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-teal-500/20 text-xl sm:text-2xl md:text-3xl">
                  <pillar.icon />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-black text-slate-900 mb-2 sm:mb-3 md:mb-4 tracking-tight uppercase leading-none">
                  {pillar.title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-xs md:text-sm font-medium leading-relaxed mb-5 md:mb-8 lg:mb-10">
                  {pillar.desc}
                </p>
                <div className="pt-3 sm:pt-4 md:pt-5 lg:pt-6 border-t border-slate-100 text-[9px] sm:text-[10px] font-black tracking-widest text-slate-400 uppercase group-hover:text-teal-600 transition-colors">
                  {pillar.detail}
                </div>
              </motion.div>
            )
          )}
        </div>

        {/* ── Detailed Core Panel ── */}
        {/* Stack on mobile/tablet, side-by-side on lg+ */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8 lg:gap-16">

          {/* Main content block */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-teal-50/50 rounded-bl-[2rem] sm:rounded-bl-[3rem] md:rounded-bl-[4rem] lg:rounded-bl-[5rem] flex items-center justify-center opacity-40">
                <MdAutoAwesome className="text-2xl sm:text-3xl md:text-4xl text-teal-500" />
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-slate-900 mb-6 sm:mb-8 md:mb-10 lg:mb-12 tracking-tighter uppercase relative z-10 leading-tight">
                THE DETAILED{' '}
                <br className="hidden sm:block" />
                <span className="text-teal-600 underline decoration-teal-500/20 underline-offset-4 md:underline-offset-8">
                  FOUNDATION.
                </span>
              </h2>

              <div className="space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-10 relative z-10">

                {/* Item 1 */}
                <div className="group flex items-start gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-500">
                    <MdFingerprint className="text-sm sm:text-base md:text-xl" />
                  </div>
                  <div>
                    <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black tracking-widest text-slate-300 uppercase mb-1 sm:mb-2 md:mb-3 lg:mb-4 group-hover:text-indigo-500 transition-colors">
                      Digital Fingerprints
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed font-medium">
                      'Cookies' optimize the visual payload of your curation interaction.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="group flex items-start gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-500">
                    <MdVpnLock className="text-sm sm:text-base md:text-xl" />
                  </div>
                  <div>
                    <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black tracking-widest text-slate-300 uppercase mb-1 sm:mb-2 md:mb-3 lg:mb-4 group-hover:text-teal-500 transition-colors">
                      External Nodes
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed font-medium">
                      Protocols confined to Singhai mainframe security standards.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Side card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-sky-500 p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] text-white shadow-xl shadow-indigo-200 ring-4 sm:ring-4 md:ring-6 lg:ring-8 ring-white/20 h-full flex flex-col">
              <MdVpnLock className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl mb-4 sm:mb-5 md:mb-6 lg:mb-8" />
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-2 sm:mb-3 md:mb-4 lg:mb-6 tracking-tight leading-none uppercase">
                Global Shield
              </h3>
              <p className="text-white/80 text-xs sm:text-sm md:text-sm font-medium leading-relaxed mb-5 sm:mb-6 md:mb-8 lg:mb-10 flex-1">
                Synchronized with global data protection architectures.
              </p>
              <button
                onClick={handleReportClick}
                className="w-full py-3 sm:py-3.5 md:py-4 bg-white text-indigo-600 rounded-xl md:rounded-2xl font-black text-[10px] sm:text-xs tracking-widest uppercase hover:shadow-lg hover:bg-indigo-50 transition-all active:scale-95 cursor-pointer"
              >
                Report Privacy Concern
              </button>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;