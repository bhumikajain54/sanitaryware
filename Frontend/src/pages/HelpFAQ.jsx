import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdLocalShipping, 
  MdAssignmentReturn, 
  MdPayment, 
  MdSupportAgent,
  MdAdd, 
  MdRemove, 
  MdSearch,
  MdArrowBack,
  MdAutoAwesome
} from 'react-icons/md';
import { useState, useRef } from 'react';

const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[120px] opacity-20 animate-pulse ${className}`} />
);

const HelpFAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState('Shipping & Delivery');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  const categories = [
    { id: 'Shipping & Delivery', icon: MdLocalShipping, title: 'Shipping', color: 'teal' },
    { id: 'Returns & Refunds', icon: MdAssignmentReturn, title: 'Returns', color: 'indigo' },
    { id: 'Payment & Pricing', icon: MdPayment, title: 'Payments', color: 'sky' },
    { id: 'Product Support', icon: MdSupportAgent, title: 'Support', color: 'violet' },
  ];

  const faqData = {
    'Shipping & Delivery': [
      {
        question: "How long does delivery take?",
        answer: "Standard delivery usually takes 3-7 business days across India. Remote areas might take slightly longer. You'll receive a tracking number once your order is shipped."
      },
      {
        question: "Do you offer express delivery?",
        answer: "Yes, we offer express delivery in select metropolitan cities. You can choose the express shipping option at checkout if it's available for your pincode."
      },
      {
        question: "Which locations do you deliver to?",
        answer: "We deliver to over 15,000+ pincodes across India. If our courier partners service your area, we can deliver to you!"
      }
    ],
    'Returns & Refunds': [
      {
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for unused products in their original packaging. The product must be in resalable condition with all tags intact."
      },
      {
        question: "How can I request a return?",
        answer: "You can request a return directly from your account dashboard or by emailing us at support@singhaitraders.com with your order ID."
      }
    ],
    'Payment & Pricing': [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, and popular digital wallets."
      },
      {
        question: "Is cash on delivery available?",
        answer: "Yes, Cash on Delivery (COD) is available for orders below ₹10,000 in most serviceable locations."
      }
    ],
    'Product Support': [
      {
        question: "Do you provide installation services?",
        answer: "While we don't provide direct installation, we can recommend certified plumbers and technicians in your area who are familiar with our premium brands."
      },
      {
        question: "Is there a warranty on products?",
        answer: "Yes, all products carry the standard manufacturer warranty. The duration varies by brand and product category, typically ranging from 1 to 10 years."
      }
    ]
  };

  const filteredFaqs = faqData[selectedCategory].filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden relative selection:bg-indigo-500/10 font-sans">
      {/* Dynamic Visual Foundation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[800px] h-[800px] bg-sky-200/40 -top-40 -left-40" />
        <GlowOrb className="w-[600px] h-[600px] bg-indigo-100/40 bottom-0 left-1/2" />
        <GlowOrb className="w-[700px] h-[700px] bg-teal-100/30 -bottom-40 -right-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>
      
      {/* Header Section */}
      <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-6 sm:pt-8 md:pt-12 pb-8 sm:pb-12 md:pb-16">
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-1.5 sm:mb-2 md:mb-4">
              <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 rounded-lg sm:rounded-xl md:rounded-2xl bg-white shadow-md sm:shadow-lg flex items-center justify-center text-indigo-500 border border-white">
                <MdAutoAwesome className="text-[10px] sm:text-sm md:text-xl animate-spin-slow" />
              </div>
              <span className="text-[7px] sm:text-[8px] md:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] text-indigo-500 uppercase">Interactive Center</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-0 text-slate-900">
              SOLVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-teal-500 to-sky-500 italic">FASTER.</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-8 items-end">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-[9px] sm:text-xs md:text-xl font-medium leading-relaxed italic border-l-2 sm:border-l-3 md:border-l-4 border-indigo-100 pl-2 sm:pl-4 md:pl-8 max-w-md"
            >
              Intelligence matrix for immediate resolution.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="relative group max-w-md lg:ml-auto">
                <div className="absolute -inset-0.5 sm:-inset-1 md:-inset-2 bg-gradient-to-r from-indigo-500 via-teal-400 to-sky-400 rounded-lg sm:rounded-xl md:rounded-[2rem] blur-md sm:blur-lg md:blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white/80 backdrop-blur-3xl border border-white shadow-lg sm:shadow-xl md:shadow-2xl shadow-slate-200/50 rounded-lg sm:rounded-xl md:rounded-[1.5rem] p-1 sm:p-1.5 md:p-2 flex items-center gap-1.5 sm:gap-2 md:gap-4">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                    <MdSearch className="text-xs sm:text-base md:text-2xl" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-300 w-full font-bold text-[10px] sm:text-xs md:text-base"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Experience Grid */}
      <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-6 sm:pb-16 md:pb-24 lg:pb-32">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 md:gap-8 lg:gap-16">
          
          {/* Enhanced Navigation Rail */}
          <aside className="col-span-5 sm:col-span-5 md:col-span-4 transition-all">
            <div className="sticky top-6 sm:top-8 md:top-12 space-y-1.5 sm:space-y-2 md:space-y-4">
              <div className="px-0.5 sm:px-1 md:px-4 mb-1.5 sm:mb-2 md:mb-6">
                <h4 className="text-[6px] sm:text-[7px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em]">Protocol</h4>
              </div>
              {categories.map((cat, index) => {
                const isSelected = selectedCategory === cat.id;
                const colors = {
                  teal: 'indigo', // Switched branding to Indigo/Teal combo
                  indigo: 'indigo',
                  sky: 'sky',
                  violet: 'violet'
                };
                return (
                  <motion.button
                    key={index}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveIndex(-1);
                    }}
                    className={`w-full group flex items-center justify-between p-1 sm:p-2 md:p-5 rounded-md sm:rounded-lg md:rounded-[2rem] transition-all duration-500 border sm:border-2 ${
                      isSelected 
                      ? 'bg-white border-white shadow-[0_5px_15px_-3px_rgba(79,70,229,0.15)] sm:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)] md:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)]' 
                      : 'bg-transparent border-transparent hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-6">
                        <div className={`w-4 h-4 sm:w-6 sm:h-6 md:w-14 md:h-14 rounded-sm sm:rounded-md md:rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isSelected ? 'bg-indigo-600 text-white shadow-md sm:shadow-lg' : 'bg-white text-slate-400 group-hover:text-indigo-600'
                        }`}>
                        <cat.icon className="text-[8px] sm:text-xs md:text-2xl" />
                        </div>
                        <span className={`text-[7px] sm:text-[8px] md:text-sm font-black tracking-wider sm:tracking-widest uppercase transition-colors duration-500 ${
                        isSelected ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                        }`}>
                        {cat.title}
                        </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </aside>

          {/* Liquid Accordion Container */}
          <main className="col-span-7 sm:col-span-7 md:col-span-8">
            <div className="min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-2 sm:space-y-3 md:space-y-6"
                >
                  {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => {
                    const isOpen = activeIndex === index;
                    return (
                      <div key={index} className="perspective-1000">
                        <motion.div 
                          className={`relative rounded-lg sm:rounded-xl md:rounded-[2.5rem] border sm:border-2 transition-all duration-700 overflow-hidden ${
                            isOpen 
                            ? 'bg-white border-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] sm:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.05)] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]' 
                            : 'bg-white/40 border-transparent hover:bg-white hover:border-white shadow-sm'
                          }`}
                        >
                          <button
                            onClick={() => setActiveIndex(isOpen ? -1 : index)}
                            className="w-full flex items-center justify-between p-2 sm:p-4 md:p-12 text-left group"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-10">
                              <span className={`text-[5px] sm:text-[6px] md:text-[10px] font-black tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.2em] transition-all duration-500 ${isOpen ? 'text-indigo-600' : 'text-slate-300'}`}>
                                CAT-{String(index + 1).padStart(2, '0')}
                              </span>
                              <h3 className={`text-[8px] sm:text-xs md:text-2xl font-black tracking-tight leading-tight transition-colors duration-300 flex-1 ${isOpen ? 'text-slate-900' : 'text-slate-600 group-hover:text-indigo-700'}`}>
                                {faq.question}
                              </h3>
                            </div>
                            <div className={`w-4 h-4 sm:w-6 sm:h-6 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-700 border sm:border-2 ${
                              isOpen ? 'bg-indigo-600 border-indigo-600 text-white rotate-180 scale-110 shadow-md sm:shadow-lg' : 'bg-transparent border-slate-100 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600'
                            }`}>
                              {isOpen ? <MdRemove className="text-[8px] sm:text-xs md:text-2xl" /> : <MdAdd className="text-[8px] sm:text-xs md:text-2xl" />}
                            </div>
                          </button>
                          
                          <motion.div
                            initial={false}
                            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 sm:px-4 md:px-12 pb-3 sm:pb-6 md:pb-16 pt-0 ml-2 sm:ml-4 md:ml-24">
                              <div className="w-full h-px bg-slate-50 mb-2 sm:mb-4 md:mb-10" />
                              <div className="flex gap-2 sm:gap-4 md:gap-10">
                                <div className="flex-grow">
                                  <p className="text-slate-500 text-[8px] sm:text-[10px] md:text-xl leading-relaxed font-medium max-w-2xl">
                                    {faq.answer}
                                  </p>
                                </div>
                                <div className="hidden lg:block w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-indigo-50/50 rounded-xl sm:rounded-2xl md:rounded-3xl self-end p-3 sm:p-4 md:p-6 border border-indigo-100/30">
                                    <MdAutoAwesome className="text-xl sm:text-2xl md:text-4xl text-indigo-200" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    );
                  }) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="bg-white rounded-xl sm:rounded-2xl md:rounded-[4rem] p-8 sm:p-16 md:p-32 text-center shadow-lg sm:shadow-xl md:shadow-2xl shadow-indigo-100/20 border sm:border-2 border-white"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-indigo-50 rounded-[40%] flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-10 animate-bounce-slow">
                        <MdSearch className="text-2xl sm:text-3xl md:text-5xl text-indigo-400" />
                      </div>
                      <h3 className="text-lg sm:text-2xl md:text-4xl font-black text-slate-900 mb-2 sm:mb-3 md:mb-4 tracking-tighter uppercase">No Intel Found.</h3>
                      <p className="text-slate-400 text-xs sm:text-base md:text-xl font-medium mb-4 sm:mb-6 md:mb-10">The current search parameters yielded zero datasets.</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-indigo-600 text-white rounded-full font-black text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase hover:bg-indigo-700 transition-all shadow-lg sm:shadow-xl md:shadow-xl shadow-indigo-600/20 active:scale-95"
                      >
                        Reset Matrix
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>



      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }

        @keyframes pulse-fast {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-pulse-fast { animation: pulse-fast 1.5s infinite; }

        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
};

export default HelpFAQ;
