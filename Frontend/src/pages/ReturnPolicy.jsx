import { motion } from 'framer-motion';
import { 
  MdAssignmentReturn, 
  MdCheckCircle, 
  MdError, 
  MdSchedule, 
  MdArrowForward,
  MdAutoAwesome,
  MdVerified,
  MdLayers
} from 'react-icons/md';

const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[120px] opacity-20 animate-pulse ${className}`} />
);

const ReturnPolicy = () => {
  const steps = [
    { 
      title: 'Initiate Request', 
      description: 'Access your order portal within the 7-day eligibility window to initiate the return protocol.' 
    },
    { 
      title: 'Digital Verification', 
      description: 'Our verification matrix reviews your submission. High-resolution documentation may be requested.' 
    },
    { 
      title: 'Logistics Retrieval', 
      description: 'Synchronized pickup coordination from your registered coordinates with secure transit handling.' 
    },
    { 
      title: 'Fiscal Settlement', 
      description: 'Final inspection leads to refund processing, typically completed in 5-7 bank cycles.' 
    },
  ];

  const guidelines = [
    'Eligibility window: 7 days post-delivery.',
    'Product must remain in its pristine, uninstalled state.',
    'Containment must include all original elements and tags.',
    'Zero tolerance for signs of structural alteration.',
    'Customized architectural components are excluded.'
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-hidden relative selection:bg-indigo-500/10 font-sans">
      {/* Background Matrix */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[800px] h-[800px] bg-sky-200/40 -top-40 -right-40" />
        <GlowOrb className="w-[600px] h-[600px] bg-indigo-100/40 bottom-20 left-10" />
        <GlowOrb className="w-[700px] h-[700px] bg-teal-100/30 -bottom-40 right-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-20 pt-12 pb-10 md:pb-20 max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-left"
        >
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-10 justify-start">
              <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-white shadow-lg md:shadow-xl flex items-center justify-center text-indigo-500 border border-white">
                <MdAssignmentReturn className="text-sm md:text-3xl" />
              </div>
              <span className="text-[7px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.6em] text-indigo-500 uppercase">Return Protocol</span>
            </div>
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 md:mb-8 text-slate-900 md:-ml-2">
              REVERSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-teal-500 to-sky-500 italic">FLOW.</span>
            </h1>
            <p className="text-slate-500 text-[10px] md:text-xl max-w-2xl font-medium leading-relaxed italic md:ml-2">
               Seamless, professional policy for your absolute satisfaction.
            </p>
        </motion.div>
      </section>

      {/* Grid Content */}
      <section className="relative z-20 pb-20 md:pb-40 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-12 gap-4 md:gap-16">
          
          {/* Guidelines Side */}
          <div className="col-span-12 md:col-span-7 space-y-8 md:space-y-16 order-2 md:order-1">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
                    <MdVerified className="text-teal-500 text-sm md:text-2xl" />
                    <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tight uppercase">Eligibility Matrix</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-4">
                    {guidelines.map((text, i) => (
                        <div key={i} className="group bg-white/40 hover:bg-white p-3 md:p-6 rounded-xl md:rounded-3xl border border-transparent hover:border-teal-500/20 transition-all duration-300 flex items-center gap-2 md:gap-6 shadow-sm">
                            <div className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                <MdCheckCircle className="text-[10px] md:text-[18px]" />
                            </div>
                            <span className="text-slate-600 font-bold text-[8px] md:text-sm tracking-wide line-clamp-2 md:line-clamp-none leading-tight">{text}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <MdLayers className="text-indigo-500 text-sm md:text-2xl" />
                    <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tight uppercase">Step-by-Step Cycle</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-white rounded-xl md:rounded-[2.5rem] p-4 md:p-10 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.02)] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] border md:border-2 border-slate-50 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-8 h-8 md:w-24 md:h-24 bg-indigo-50/50 rounded-bl-xl md:rounded-bl-[4rem] flex items-center justify-center text-indigo-200 text-xs md:text-3xl font-black opacity-30">
                                0{i + 1}
                            </div>
                            <h4 className="text-[10px] md:text-lg font-black text-slate-900 mb-1 md:mb-4 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-none">{step.title}</h4>
                            <p className="text-slate-500 text-[8px] md:text-sm font-medium leading-tight md:leading-relaxed line-clamp-3 md:line-clamp-none">{step.description}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
          </div>

          {/* Critical Info Side */}
          <div className="col-span-12 md:col-span-5 space-y-6 md:space-y-12 order-1 md:order-2">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-red-50/70 p-4 md:p-12 rounded-[1.5rem] md:rounded-[3.5rem] border border-red-100 relative overflow-hidden"
                >
                    <div className="absolute -bottom-5 md:-bottom-10 -right-5 md:-right-10 opacity-[0.05] rotate-12">
                        <MdError className="text-red-900 text-6xl md:text-[200px]" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-6 h-6 md:w-14 md:h-14 bg-white rounded-lg md:rounded-2xl flex items-center justify-center text-red-500 mb-2 md:mb-8 shadow-md md:shadow-xl shadow-red-100">
                            <MdError className="text-sm md:text-32" />
                        </div>
                        <h3 className="text-[10px] md:text-2xl font-black text-red-900 mb-2 md:mb-6 tracking-tight uppercase">NON-RETVRN</h3>
                        <ul className="space-y-1 md:space-y-4">
                            {[
                            'Final Sale',
                            'Post-install',
                            'Severed pack',
                            'Expired window',
                            'Architect orders'
                            ].map((item, id) => (
                                <li key={id} className="flex items-center gap-1 md:gap-3 text-red-800 text-[7px] md:text-sm font-bold opacity-70">
                                    <div className="w-1 h-1 rounded-full bg-red-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-900 p-4 md:p-12 rounded-[1.5rem] md:rounded-[3.5rem] text-white relative shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
                        <MdAutoAwesome className="text-2xl md:text-80" />
                    </div>
                    <h3 className="text-[10px] md:text-2xl font-black mb-3 md:mb-8 tracking-tight uppercase">QUICK ACTIONS</h3>
                    <div className="space-y-2 md:space-y-4">
                        {[
                        { label: 'Manage Orders', path: '/customer/orders' },
                        { label: 'System Support', path: '/help' },
                        { label: 'Assistance Link', path: '/contact' }
                        ].map((item, idx) => (
                            <a 
                                key={idx} 
                                href={item.path} 
                                className="group flex items-center justify-between p-2 md:p-5 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-2xl transition-all border border-white/5"
                            >
                                <span className="text-[7px] md:text-xs font-black tracking-widest uppercase">{item.label}</span>
                                <MdArrowForward className="group-hover:translate-x-2 transition-transform text-[10px] md:text-base" />
                            </a>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="text-center pt-8">
                 <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white shadow-md border border-slate-50">
                    <MdSchedule className="text-teal-500" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Policy Ver. 2026.1</span>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnPolicy;
