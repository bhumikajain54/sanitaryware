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
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] text-slate-800 overflow-x-hidden relative selection:bg-indigo-500/10 font-sans">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlowOrb className="w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-sky-200/40 -top-40 -left-40" />
        <GlowOrb className="w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] bg-indigo-100/40 bottom-0 left-1/2" />
        <GlowOrb className="w-[350px] sm:w-[500px] lg:w-[700px] h-[350px] sm:h-[500px] lg:h-[700px] bg-teal-100/30 -bottom-40 -right-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* ── Header ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-12 pb-6 sm:pb-8 md:pb-12 lg:pb-16">
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
              <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white shadow-lg flex items-center justify-center text-indigo-500 border border-white flex-shrink-0">
                <MdAutoAwesome className="text-sm sm:text-base md:text-xl animate-spin-slow" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] text-indigo-500 uppercase">
                Interactive Center
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-none text-slate-900">
              SOLVE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-teal-500 to-sky-500 italic">
                FASTER.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-xl font-medium leading-relaxed italic border-l-2 md:border-l-4 border-indigo-100 pl-3 sm:pl-4 md:pl-6 lg:pl-8 max-w-md flex-shrink-0"
            >
              Intelligence matrix for immediate resolution.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full sm:flex-1 sm:max-w-sm md:max-w-md lg:max-w-lg lg:ml-auto"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-indigo-500 via-teal-400 to-sky-400 rounded-xl sm:rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-1000" />
                <div className="relative bg-white/80 backdrop-blur-3xl border border-white shadow-xl rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner flex-shrink-0">
                    <MdSearch className="text-sm sm:text-base md:text-2xl" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-300 w-full font-bold text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pb-10 sm:pb-14 md:pb-20 lg:pb-32">
        <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-5 md:gap-8 lg:gap-16">

          {/* ── Category Rail ── */}
          <aside className="sm:col-span-4 md:col-span-4 lg:col-span-3">
            <div className="sticky top-4 sm:top-6 md:top-10 space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4">
              <div className="px-1 sm:px-2 md:px-4 mb-2 sm:mb-3 md:mb-6">
                <h4 className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] sm:tracking-[0.3em]">
                  Protocol
                </h4>
              </div>

              {categories.map((cat, index) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveIndex(-1);
                    }}
                    className={`w-full group flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 p-2 sm:p-2.5 md:p-3.5 lg:p-5 rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-[2rem] transition-all duration-500 border-2 ${isSelected
                      ? 'bg-white border-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.15)] lg:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)]'
                      : 'bg-transparent border-transparent hover:bg-white/50'
                      }`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isSelected
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-slate-400 group-hover:text-indigo-600'
                      }`}>
                      <cat.icon className="text-sm sm:text-base md:text-lg lg:text-2xl" />
                    </div>
                    <span className={`text-[10px] sm:text-xs md:text-xs lg:text-sm font-black tracking-widest uppercase transition-colors duration-500 text-left ${isSelected ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                      {cat.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </aside>

          {/* ── FAQ Accordion ── */}
          <main className="sm:col-span-8 md:col-span-8 lg:col-span-9">
            <div className="min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6"
                >
                  {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => {
                    const isOpen = activeIndex === index;
                    return (
                      <div key={index} className="perspective-1000">
                        <motion.div
                          className={`relative rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-[2.5rem] border-2 transition-all duration-700 overflow-hidden ${isOpen
                            ? 'bg-white border-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] lg:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]'
                            : 'bg-white/40 border-transparent hover:bg-white hover:border-white shadow-sm'
                            }`}
                        >
                          {/* Question Row */}
                          <button
                            onClick={() => setActiveIndex(isOpen ? -1 : index)}
                            className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 lg:p-10 xl:p-12 text-left group gap-2 sm:gap-3"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-5 lg:gap-10 flex-1 min-w-0">
                              <span className={`text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-500 flex-shrink-0 ${isOpen ? 'text-indigo-600' : 'text-slate-300'
                                }`}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <h3 className={`text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-black tracking-tight leading-snug transition-colors duration-300 ${isOpen ? 'text-slate-900' : 'text-slate-600 group-hover:text-indigo-700'
                                }`}>
                                {faq.question}
                              </h3>
                            </div>

                            {/* Toggle button */}
                            <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-700 border-2 ${isOpen
                              ? 'bg-indigo-600 border-indigo-600 text-white rotate-180 scale-110 shadow-lg'
                              : 'bg-transparent border-slate-100 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600'
                              }`}>
                              {isOpen
                                ? <MdRemove className="text-xs sm:text-sm md:text-base lg:text-2xl" />
                                : <MdAdd className="text-xs sm:text-sm md:text-base lg:text-2xl" />
                              }
                            </div>
                          </button>

                          {/* Answer */}
                          <motion.div
                            initial={false}
                            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 sm:px-5 md:px-8 lg:px-12 pb-4 sm:pb-5 md:pb-8 lg:pb-14 xl:pb-16 pt-0">
                              <div className="w-full h-px bg-slate-50 mb-3 sm:mb-4 md:mb-5 lg:mb-10" />
                              <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-10">
                                <div className="flex-grow">
                                  <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed font-medium max-w-2xl">
                                    {faq.answer}
                                  </p>
                                </div>
                                <div className="hidden lg:flex w-20 h-20 xl:w-28 xl:h-28 bg-indigo-50/50 rounded-3xl self-end p-4 xl:p-6 border border-indigo-100/30 items-center justify-center flex-shrink-0">
                                  <MdAutoAwesome className="text-3xl xl:text-4xl text-indigo-200" />
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
                      className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] lg:rounded-[4rem] p-8 sm:p-12 md:p-16 lg:p-24 xl:p-32 text-center shadow-xl shadow-indigo-100/20 border-2 border-white"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-indigo-50 rounded-[40%] flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-7 lg:mb-10 animate-bounce-slow">
                        <MdSearch className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-indigo-400" />
                      </div>
                      <h3 className="text-base sm:text-xl md:text-2xl lg:text-4xl font-black text-slate-900 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 tracking-tighter uppercase">
                        No Intel Found.
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm md:text-base lg:text-xl font-medium mb-4 sm:mb-5 md:mb-7 lg:mb-10">
                        The current search parameters yielded zero datasets.
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 bg-indigo-600 text-white rounded-full font-black text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
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

      <style dangerouslySetInnerHTML={{
        __html: `
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

        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
};

export default HelpFAQ;