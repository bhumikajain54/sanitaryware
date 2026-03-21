import { motion } from 'framer-motion';
import {
  MdLocalShipping,
  MdLocationOn,
  MdTimer,
  MdRadar,
  MdInsights,
  MdAutoAwesome,
  MdCheckCircle,
  MdShield
} from 'react-icons/md';

const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[140px] opacity-20 animate-pulse ${className}`} />
);

const ShippingInfo = () => {
  const deliveryTypes = [
    {
      icon: MdTimer,
      title: 'LOCAL EXPRESS',
      time: 'SAME-DAY DISPATCH',
      cost: 'FREE PROTOCOL',
      area: 'BALAGHAT CITY',
      description: 'Optimized doorstep delivery within the immediate city containment zone.'
    },
    {
      icon: MdRadar,
      title: 'REGIONAL PRO',
      time: '24-48 HOUR CYCLE',
      cost: 'NOMINAL SURCHARGE',
      area: 'DISTRICT WIDE',
      description: 'Reliable regional infrastructure covering all tehsils and surrounding districts.'
    }
  ];

  const features = [
    { icon: MdInsights, title: 'REAL-TIME INTEL', desc: 'Continuous satellite tracking of your premium delivery vehicle.' },
    { icon: MdAutoAwesome, title: 'AUTO UPDATES', desc: 'Instant multi-channel notifications for every milestone transition.' },
    { icon: MdShield, title: 'SECURE LOGISTICS', desc: 'Multi-layer packaging protocol to ensure product integrity.' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 overflow-x-hidden relative selection:bg-teal-500/10 font-sans">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[500px] sm:w-[700px] lg:w-[1000px] h-[500px] sm:h-[700px] lg:h-[1000px] bg-teal-200/30 -top-40 -left-40" />
        <GlowOrb className="w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-indigo-100/40 top-1/2 left-1/2 -translate-x-1/2" />
        <GlowOrb className="w-[500px] sm:w-[700px] lg:w-[900px] h-[500px] sm:h-[700px] lg:h-[900px] bg-sky-100/30 -bottom-40 -right-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-20 pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-16 md:pb-24 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 md:gap-12 lg:gap-20">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-xl flex items-center justify-center text-teal-600 border border-white flex-shrink-0">
                <MdLocalShipping className="text-base sm:text-xl md:text-3xl animate-bounce-slow" />
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-[0.35em] sm:tracking-[0.5em] md:tracking-[0.6em] text-teal-600 uppercase">
                Logistic Matrix
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-none mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-slate-900">
              SECURE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500 italic">
                TRAVEL.
              </span>
            </h1>

            <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-xl max-w-lg font-medium leading-relaxed italic border-l-2 md:border-l-4 border-teal-500/20 pl-3 sm:pl-4 md:pl-6 lg:pl-8">
              Advanced logistical protocols across the entire Balaghat infrastructure.
            </p>
          </motion.div>

          {/* Right: Image card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="w-full sm:flex-1 sm:max-w-sm md:max-w-md lg:max-w-lg"
          >
            <div className="w-full aspect-[4/3] sm:aspect-[4/4] md:aspect-[4/5] bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-2xl sm:rounded-3xl md:rounded-[3rem] lg:rounded-[4rem] overflow-hidden relative group border-2 md:border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
                alt="Premium Showroom"
                className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100"
              />
              {/* Overlay badge */}
              <div className="absolute inset-x-2 sm:inset-x-3 md:inset-x-4 lg:inset-x-6 bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 p-2.5 sm:p-3 md:p-4 lg:p-6 bg-white/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-[2.5rem] border border-white translate-y-1 group-hover:translate-y-0 transition-transform duration-700">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-teal-500 rounded-lg md:rounded-xl flex items-center justify-center text-white text-sm sm:text-base md:text-lg lg:text-xl shadow-lg shadow-teal-500/20 flex-shrink-0">
                    <MdCheckCircle />
                  </div>
                  <div>
                    <h4 className="text-[10px] sm:text-xs md:text-sm font-black text-slate-900 tracking-tight uppercase leading-none">
                      100% SECURE
                    </h4>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Insurance Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Cards + Features ── */}
      <section className="relative z-20 pb-12 sm:pb-16 md:pb-24 lg:pb-40 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Delivery Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-6 sm:gap-y-6 md:mb-10 lg:mb-20 text-center">
          {deliveryTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] lg:rounded-[3rem] p-5 sm:p-7 md:p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border-2 border-transparent hover:border-teal-500/20 transition-all duration-700"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-slate-400 group-hover:bg-teal-500 group-hover:text-white group-hover:scale-110 transition-all duration-700 group-hover:rotate-12 shadow-inner">
                <type.icon className="text-lg sm:text-xl md:text-2xl" />
              </div>

              <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-slate-900 mb-1.5 sm:mb-2 md:mb-3 tracking-tighter uppercase italic">
                {type.title}
              </h3>

              <div className="inline-block px-2.5 sm:px-3 md:px-4 py-1 sm:py-1 md:py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest mb-3 sm:mb-4 md:mb-5 lg:mb-6 uppercase">
                {type.time}
              </div>

              <p className="text-slate-500 text-xs sm:text-sm md:text-sm lg:text-base mb-4 sm:mb-5 md:mb-7 lg:mb-10 font-medium leading-relaxed max-w-[260px] mx-auto italic">
                {type.description}
              </p>

              <div className="pt-3 sm:pt-4 md:pt-6 lg:pt-8 border-t border-slate-50 flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">
                  Costing Tier
                </span>
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-teal-600 tracking-tight">
                  {type.cost}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/50 backdrop-blur-xl p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] border border-white flex flex-row sm:flex-col md:flex-row items-center text-left sm:text-center md:text-left gap-3 sm:gap-3 md:gap-5 lg:gap-8 group hover:bg-white transition-all duration-500"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-16 lg:h-16 bg-white shadow-lg rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-all duration-500">
                <feature.icon className="text-lg sm:text-xl md:text-2xl lg:text-[28px]" />
              </div>
              <div>
                <h5 className="text-[10px] sm:text-[10px] md:text-xs lg:text-sm font-black text-slate-900 tracking-wider mb-1 uppercase">
                  {feature.title}
                </h5>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-medium leading-snug">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Spatial Info Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14 md:mt-20 lg:mt-32 p-8 sm:p-10 md:p-16 lg:p-24 bg-slate-900 rounded-3xl sm:rounded-[3rem] md:rounded-[4rem] lg:rounded-[5rem] relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[100%] bg-teal-500 rounded-full blur-[150px] opacity-20 animate-pulse" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-teal-500 rounded-2xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 md:mb-8 lg:mb-10 text-white text-2xl sm:text-3xl md:text-4xl shadow-[0_20px_40px_rgba(20,184,166,0.3)]">
              <MdLocationOn />
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-4 sm:mb-5 md:mb-6 lg:mb-8 tracking-tighter uppercase leading-tight italic">
              DOMINATING THE{' '}
              <span className="text-teal-400">BALAGHAT SECTOR.</span>
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm md:text-base lg:text-xl font-medium leading-relaxed italic mb-7 sm:mb-8 md:mb-10 lg:mb-12">
              Strategic distribution network covering Gondia, Seoni, Waraseoni, Katangi, and Lanji. Our specialized heavy-carriers are standing by for specialized equipment transport.
            </p>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 md:gap-3">
              {['GONDIA', 'SEONI', 'WARASEONI', 'KATANGI'].map((city) => (
                <div
                  key={city}
                  className="bg-white/5 border border-white/10 py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black text-slate-400 tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap"
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default ShippingInfo;