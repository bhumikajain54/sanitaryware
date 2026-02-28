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
    { icon: MdAutoAwesome, title: 'AUTOMATED UPDATES', desc: 'Instant multi-channel notifications for every milestone transition.' },
    { icon: MdShield, title: 'SECURE LOGISTICS', desc: 'Multi-layer packaging protocol to ensure product integrity.' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden relative selection:bg-teal-500/10 font-sans">
      {/* Dynamic Background Matrix */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[1000px] h-[1000px] bg-teal-200/30 -top-60 -left-60" />
        <GlowOrb className="w-[800px] h-[800px] bg-indigo-100/40 top-1/2 left-1/2 transform -translate-x-1/2" />
        <GlowOrb className="w-[900px] h-[900px] bg-sky-100/30 -bottom-60 -right-60" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Hero Experience */}
      <section className="relative z-20 pt-12 pb-20 md:pb-32 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-teal-600 border border-white">
                <MdLocalShipping className="text-3xl animate-bounce-slow" />
              </div>
              <span className="text-[11px] font-black tracking-[0.6em] text-teal-600 uppercase">Logistic Matrix</span>
            </div>
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 md:mb-8 text-slate-900">
              SECURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-500 to-sky-500 italic">TRAVEL.</span>
            </h1>
            <p className="text-slate-500 text-[10px] md:text-xl max-w-lg font-medium leading-relaxed italic border-l-2 md:border-l-4 border-teal-500/20 pl-4 md:pl-8">
              Advanced logistical protocols across the entire Balaghat infrastructure.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="flex justify-end relative"
          >
            <div className="w-full max-w-lg aspect-[4/5] bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[1.5rem] md:rounded-[4rem] overflow-hidden relative group border-2 md:border-4 border-white">
                <img 
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80" 
                    alt="Premium Showroom" 
                    className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-x-2 md:inset-x-6 bottom-2 md:bottom-6 p-2 md:p-6 bg-white/80 backdrop-blur-2xl rounded-[1rem] md:rounded-[2.5rem] border border-white translate-y-1 md:translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="w-6 h-6 md:w-12 md:h-12 bg-teal-500 rounded-lg md:rounded-xl flex items-center justify-center text-white text-[10px] md:text-xl shadow-lg shadow-teal-500/20">
                            <MdCheckCircle />
                        </div>
                        <div>
                            <h4 className="text-[8px] md:text-sm font-black text-slate-900 tracking-tight uppercase leading-none md:leading-normal">100% SECURE</h4>
                            <p className="text-[6px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden md:block">Insurance Active</p>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Card Grid */}
      <section className="relative z-20 pb-20 md:pb-40 max-w-5xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:gap-8 mb-10 md:mb-20 text-center">
          {deliveryTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative bg-white rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border-2 border-transparent hover:border-teal-500/20 transition-all duration-700"
            >
              <div className="w-8 h-8 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-8 text-slate-400 group-hover:bg-teal-500 group-hover:text-white group-hover:scale-110 transition-all duration-700 group-hover:rotate-12 shadow-inner">
                <type.icon className="text-sm md:text-2xl" />
              </div>
              <h3 className="text-xs md:text-2xl font-black text-slate-900 mb-1 md:mb-3 tracking-tighter uppercase italic">{type.title}</h3>
              <div className="inline-block px-2 py-1 md:px-4 md:py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[6px] md:text-[10px] font-black tracking-widest mb-3 md:mb-6 uppercase">
                {type.time}
              </div>
              <p className="text-slate-500 text-[8px] md:text-base mb-4 md:mb-10 font-medium leading-relaxed max-w-[240px] mx-auto italic">
                {type.description}
              </p>
              <div className="pt-4 md:pt-8 border-t border-slate-50 flex flex-col items-center">
                <span className="text-[6px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Costing Tier</span>
                <span className="text-xs md:text-lg font-black text-teal-600 tracking-tight">{type.cost}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Strips */}
        <div className="grid grid-cols-3 gap-2 md:gap-6">
            {features.map((feature, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0 }}
                    whileInView={{ opacity: 1, height: 'auto' }}
                    viewport={{ once: true }}
                    className="bg-white/50 backdrop-blur-xl p-3 md:p-8 rounded-[1rem] md:rounded-[2.5rem] border border-white flex flex-col md:flex-row items-center text-center md:text-left gap-2 md:gap-8 group hover:bg-white transition-all duration-500"
                >
                    <div className="w-8 h-8 md:w-16 md:h-16 bg-white shadow-lg rounded-lg md:rounded-2xl flex-shrink-0 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-all duration-500">
                        <feature.icon className="text-sm md:text-[28px]" />
                    </div>
                    <div>
                        <h5 className="text-[8px] md:text-sm font-black text-slate-900 tracking-wider mb-1 uppercase line-clamp-1">{feature.title}</h5>
                        <p className="text-[6px] md:text-xs text-slate-400 font-medium leading-tight hidden md:block">{feature.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Spatial Information Panel */}
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-12 lg:p-24 bg-slate-900 rounded-[5rem] relative overflow-hidden text-center"
        >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[100%] bg-teal-500 rounded-full blur-[150px] opacity-20 animate-pulse" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-10 text-white text-4xl shadow-[0_20px_40px_rgba(20,184,166,0.3)]">
                    <MdLocationOn />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-tight italic">
                    DOMINATING THE <span className="text-teal-400">BALAGHAT SECTOR.</span>
                </h2>
                <p className="text-slate-400 text-xl font-medium leading-relaxed italic mb-12">
                   Strategic distribution network covering Gondia, Seoni, Waraseoni, Katangi, and Lanji. Our specialized heavy-carriers are standing by for specialized equipment transport.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {['GONDIA', 'SEONI', 'WARASEONI', 'KATANGI'].map((city) => (
                        <div key={city} className="bg-white/5 border border-white/10 py-3 px-6 rounded-xl text-[9px] font-black text-slate-400 tracking-[0.2em] whitespace-nowrap">
                            {city}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
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
