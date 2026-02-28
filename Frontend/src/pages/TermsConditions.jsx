import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  MdGavel, 
  MdUpdate, 
  MdVerified, 
  MdMessage,
  MdArrowForward,
  MdAutoAwesome,
  MdSecurity,
  MdLayers,
  MdAdd,
  MdRemove
} from 'react-icons/md';

const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[140px] opacity-20 animate-pulse ${className}`} />
);

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState(null);
  const panelRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsidePanel = panelRef.current && !panelRef.current.contains(event.target);
      const isOutsideSidebar = sidebarRef.current && !sidebarRef.current.contains(event.target);
      
      if (isOutsidePanel && isOutsideSidebar) {
        setActiveSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sections = [
    {
      title: 'Acknowledge Acceptance',
      content: 'By accessing and utilizing the Singhai Traders digital ecosystem, you certify your alignment with the strategic protocols and legal provisions outlined in this charter.',
      icon: MdVerified
    },
    {
      title: 'Structural Precision',
      content: 'While we strive for absolute accuracy in our architectural metadata, Singhai Traders does not warrant that product descriptions are entirely error-free. Visual variance may occur due to display calibration.',
      icon: MdLayers
    },
    {
      title: 'Fiscal Parameters',
      content: 'Valuations for our premium inventory are subject to strategic adjustment without prior notification. We maintain total sovereignty over service modifications.',
      icon: MdSecurity
    },
    {
      title: 'Logistic Cycles',
      content: 'Deployment timelines are mission-critical estimates. Singhai Traders is not responsible for external disruptions or regional carrier delays beyond our containment zone.',
      icon: MdAutoAwesome
    },
    {
      title: 'Title Sovereignty',
      content: 'Every digital asset, architectural draft, and branding element on this mainframe is the exclusive property of Singhai Traders, protected by global intellectual laws.',
      icon: MdGavel
    },
    {
      title: 'Liability Containment',
      content: 'Singhai Traders shall remain insulated from any consequential or special damages resulting from the interaction with, or utilization of, these digital resources.',
      icon: MdSecurity
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-hidden relative selection:bg-indigo-500/10 font-sans">
      {/* Dynamic Foundation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[800px] h-[800px] bg-sky-200/30 -top-40 -left-20" />
        <GlowOrb className="w-[600px] h-[600px] bg-teal-100/40 bottom-20 right-0" />
        <GlowOrb className="w-[700px] h-[700px] bg-indigo-100/30 top-1/2 left-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Hero Section */}
      <header className="relative z-20 pt-12 pb-10 md:pb-20 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:gap-20 items-end">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-10">
              <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-white shadow-lg md:shadow-xl flex items-center justify-center text-indigo-600 border border-white">
                <MdGavel className="text-sm md:text-3xl" />
              </div>
              <span className="text-[7px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.6em] text-indigo-600 uppercase italic">Legal Charter</span>
            </div>
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 md:mb-8 text-slate-900">
              GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-teal-500 to-sky-500 italic">TERMS.</span>
            </h1>
            <p className="text-slate-500 text-[8px] md:text-xl max-w-xl font-medium leading-relaxed italic border-l-2 md:border-l-4 border-indigo-500/20 pl-4 md:pl-8">
               Standardized protocols for mutual integrity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-end"
          >
            <div className="px-3 md:px-10 py-2 md:py-5 bg-white shadow-xl md:shadow-2xl rounded-xl md:rounded-3xl border border-white/50 mb-2 md:mb-6 flex items-center gap-2 md:gap-6">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
                    <MdUpdate className="text-sm md:text-2xl" />
                </div>
                <div>
                    <h4 className="text-[6px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 md:mb-1">Matrix Sync</h4>
                    <p className="text-[9px] md:text-sm font-black text-slate-900 tracking-tight">JANUARY 2026</p>
                </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content Grid */}
      <main className="relative z-20 pb-20 md:pb-40 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-12 gap-4 md:gap-20">
            {/* Table of Contents Rail */}
            <aside 
                ref={sidebarRef}
                className="col-span-3 md:col-span-3 transition-all border-r border-slate-50 pr-4 md:pr-10"
            >
                <div className="sticky top-12 space-y-2 md:space-y-4">
                    <h5 className="text-[7px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4 md:mb-10 pl-2">Navigation Matrix</h5>
                    {sections.map((s, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setActiveSection(idx)}
                            className={`w-full group text-left flex flex-row items-center gap-3 md:gap-6 px-3 md:px-8 py-3 md:py-6 rounded-xl md:rounded-3xl transition-all duration-500 border-2 ${activeSection === idx ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100 -translate-y-1' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl'}`}
                        >
                            <span className={`text-[8px] md:text-xs font-black transition-colors shrink-0 ${activeSection === idx ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-500'}`}>0{idx + 1}</span>
                            <span className={`text-[7px] md:text-[11px] font-black transition-colors uppercase tracking-widest ${activeSection === idx ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900'}`}>{s.title}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Sections */}
            <motion.div 
                ref={panelRef}
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="col-span-9 md:col-span-9 space-y-4 md:space-y-6"
            >


                <AnimatePresence mode="wait">
                    {activeSection !== null && (
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-[1.5rem] md:rounded-[4.5rem] p-6 md:p-20 shadow-[0_40px_120px_-20px_rgba(79,70,229,0.08)] border border-indigo-50/50 relative overflow-hidden group"
                        >
                            {/* Background Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-indigo-50/50 rounded-bl-[4rem] md:rounded-bl-[10rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-1000 opacity-30" />
                            
                            <div className="relative z-10 flex flex-col gap-6 md:gap-14">
                                {/* Question Section - Animates first */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="flex flex-row items-center gap-4 md:gap-12"
                                >
                                    <div className="w-10 h-10 md:w-28 md:h-28 rounded-xl md:rounded-[3rem] bg-slate-900 shadow-2xl flex items-center justify-center text-white shrink-0">
                                        {sections[activeSection]?.icon && (() => {
                                            const Icon = sections[activeSection].icon;
                                            return <Icon className="text-sm md:text-5xl" />;
                                        })()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[6px] md:text-[10px] font-black tracking-[0.5em] text-indigo-500 mb-2 md:mb-5 uppercase">Legal Provision // 0{activeSection + 1}</div>
                                        <h3 className="text-[11px] md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
                                            {sections[activeSection]?.title}
                                        </h3>
                                    </div>
                                </motion.div>

                                {/* Divider Line */}
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, ease: "circIn" }}
                                    className="h-px bg-slate-100 origin-left"
                                />

                                {/* Answer Section - Animates after */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                >
                                    <p className="text-slate-500 text-[9px] md:text-3xl font-medium leading-tight md:leading-relaxed italic border-l-4 border-indigo-500/10 pl-4 md:pl-12">
                                        "{sections[activeSection]?.content}"
                                    </p>
                                </motion.div>
                            </div>

                            {/* Status Stamp */}
                            <div className="mt-8 md:mt-24 pt-6 md:pt-14 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[6px] md:text-[10px] font-black tracking-widest text-slate-300 uppercase italic">Singh Traders Mainframe // 2026</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-1 md:w-2.5 h-1 md:h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                                    <span className="text-[6px] md:text-[11px] font-black text-indigo-600 uppercase tracking-tighter">Verified Protocol</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Action */}
                <motion.div 
                    variants={item}
                    className="mt-10 md:mt-20 p-8 md:p-24 bg-slate-900 rounded-[2.5rem] md:rounded-[5rem] text-center relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-10 md:w-20 h-10 md:h-20 bg-indigo-500 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-10 text-white shadow-xl shadow-indigo-500/20">
                            <MdMessage className="text-sm md:text-[32px]" />
                        </div>
                        <h2 className="text-2xl md:text-6xl font-black text-white mb-4 md:mb-8 tracking-tighter uppercase leading-none">
                            LEGAL <span className="text-indigo-400">INQUIRIES.</span>
                        </h2>
                        <a 
                            href="/contact" 
                            className="inline-flex items-center gap-2 md:gap-4 px-5 md:px-10 py-3 md:py-5 bg-white text-slate-900 rounded-xl md:rounded-2xl font-black text-[8px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase hover:bg-indigo-400 hover:text-white transition-all active:scale-95 group"
                        >
                            Compliance Sync
                            <MdArrowForward className="group-hover:translate-x-2 transition-transform text-[10px] md:text-base" />
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtle-move {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-subtle { animation: subtle-move 3s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default TermsConditions;
