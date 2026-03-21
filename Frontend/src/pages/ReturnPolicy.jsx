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
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-x-hidden relative selection:bg-indigo-500/10 font-sans">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[500px] sm:w-[650px] lg:w-[800px] h-[500px] sm:h-[650px] lg:h-[800px] bg-sky-200/40 -top-40 -right-40" />
        <GlowOrb className="w-[400px] sm:w-[500px] lg:w-[600px] h-[400px] sm:h-[500px] lg:h-[600px] bg-indigo-100/40 bottom-20 left-10" />
        <GlowOrb className="w-[450px] sm:w-[580px] lg:w-[700px] h-[450px] sm:h-[580px] lg:h-[700px] bg-teal-100/30 -bottom-40 right-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-20 pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-12 md:pb-16 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-lg flex items-center justify-center text-indigo-500 border border-white flex-shrink-0">
              <MdAssignmentReturn className="text-base sm:text-xl md:text-3xl" />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-[0.3em] sm:tracking-[0.45em] md:tracking-[0.6em] text-indigo-500 uppercase">
              Return Protocol
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-none mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-slate-900">
            REVERSE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-teal-500 to-sky-500 italic">
              FLOW.
            </span>
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-xl max-w-2xl font-medium leading-relaxed italic">
            Seamless, professional policy for your absolute satisfaction.
          </p>
        </motion.div>
      </section>

      {/* ── Main Grid ── */}
      <section className="relative z-20 pb-12 sm:pb-16 md:pb-24 lg:pb-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-6 sm:gap-8 md:gap-10 lg:gap-16">

          {/* ── Left: Guidelines + Steps ── */}
          <div className="md:col-span-7 space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16 order-2 md:order-1">

            {/* Eligibility Matrix */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                <MdVerified className="text-teal-500 text-lg sm:text-xl md:text-2xl flex-shrink-0" />
                <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">
                  Eligibility Matrix
                </h2>
              </div>

              {/* Guidelines: 1 col mobile → 1 col md+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                {guidelines.map((text, i) => (
                  <div
                    key={i}
                    className="group bg-white/40 hover:bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-transparent hover:border-teal-500/20 transition-all duration-300 flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 shadow-sm"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all">
                      <MdCheckCircle className="text-xs sm:text-sm md:text-base lg:text-[18px]" />
                    </div>
                    <span className="text-slate-600 font-bold text-xs sm:text-xs md:text-sm tracking-wide leading-snug">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step-by-Step */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                <MdLayers className="text-indigo-500 text-lg sm:text-xl md:text-2xl flex-shrink-0" />
                <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">
                  Step-by-Step Cycle
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] p-4 sm:p-5 md:p-7 lg:p-10 shadow-sm border border-slate-50 relative group overflow-hidden"
                  >
                    {/* Step number */}
                    <div className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 bg-indigo-50/50 rounded-bl-2xl md:rounded-bl-[3rem] lg:rounded-bl-[4rem] flex items-center justify-center text-indigo-200 text-xs sm:text-sm md:text-lg lg:text-3xl font-black opacity-40">
                      0{i + 1}
                    </div>
                    <h4 className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-slate-900 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-tight pr-8 sm:pr-10">
                      {step.title}
                    </h4>
                    <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Critical Info ── */}
          <div className="md:col-span-5 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-12 order-1 md:order-2">

            {/* Non-Return Card + Quick Actions: side-by-side on mobile/sm, stacked on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:gap-12">

              {/* Non-Return */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-red-50/70 p-4 sm:p-5 md:p-8 lg:p-12 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] lg:rounded-[3.5rem] border border-red-100 relative overflow-hidden"
              >
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 md:-bottom-8 md:-right-8 opacity-[0.05] rotate-12">
                  <MdError className="text-red-900 text-7xl sm:text-8xl md:text-[140px] lg:text-[200px]" />
                </div>
                <div className="relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-red-500 mb-3 sm:mb-4 md:mb-6 lg:mb-8 shadow-lg shadow-red-100 flex-shrink-0">
                    <MdError className="text-base sm:text-xl md:text-2xl lg:text-3xl" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg lg:text-2xl font-black text-red-900 mb-2 sm:mb-3 md:mb-4 lg:mb-6 tracking-tight uppercase">
                    Non-Return
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4">
                    {['Final Sale', 'Post-install', 'Severed pack', 'Expired window', 'Architect orders'].map((item, id) => (
                      <li key={id} className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-red-800 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold opacity-70">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900 p-4 sm:p-5 md:p-8 lg:p-12 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] lg:rounded-[3.5rem] text-white relative shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 sm:p-5 md:p-6 lg:p-8 opacity-10">
                  <MdAutoAwesome className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-lg lg:text-2xl font-black mb-3 sm:mb-4 md:mb-6 lg:mb-8 tracking-tight uppercase">
                  Quick Actions
                </h3>
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-4">
                  {[
                    { label: 'Manage Orders', path: '/customer/orders' },
                    { label: 'System Support', path: '/help' },
                    { label: 'Assistance Link', path: '/contact' }
                  ].map((item, idx) => (
                    <a
                      key={idx}
                      href={item.path}
                      className="group flex items-center justify-between p-2 sm:p-2.5 md:p-3.5 lg:p-5 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-2xl transition-all border border-white/5"
                    >
                      <span className="text-[9px] sm:text-[10px] md:text-xs font-black tracking-widest uppercase">
                        {item.label}
                      </span>
                      <MdArrowForward className="group-hover:translate-x-1 transition-transform text-xs sm:text-sm md:text-base flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Version badge */}
            <div className="flex justify-center pt-2 sm:pt-3 md:pt-4 lg:pt-8">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full bg-white shadow-md border border-slate-50">
                <MdSchedule className="text-teal-500 text-sm sm:text-base" />
                <span className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] sm:tracking-[0.3em] uppercase text-slate-400 whitespace-nowrap">
                  Policy Ver. 2026.1
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ReturnPolicy;