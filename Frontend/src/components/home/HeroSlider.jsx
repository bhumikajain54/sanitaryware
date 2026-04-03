import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { formatMediaUrl } from '../../utils/mediaUtils';

const HeroSlider = ({ banners = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Map backend field names if they are different (for compatibility)
  const displayBanners = banners.map(b => ({
    ...b,
    imageUrl: formatMediaUrl(b.imageUrl || b.image),
    description: b.description || b.subtitle,
    linkUrl: b.linkUrl || b.link || '/shop'
  })).filter(b => b.active !== false); // Filter out inactive ones

  useEffect(() => {
    if (displayBanners.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [displayBanners.length]);



  if (displayBanners.length === 0) {
    // Fallback Banner if data load fails
    displayBanners.push({
      id: 'default-1',
      imageUrl: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80',
      title: 'Modern Sanitary Excellence',
      description: 'Experience the finest collection of premium bath fittings and sanitary ware designed for luxury living.',
      linkUrl: '/shop',
      active: true
    });
  }

  const current = displayBanners[currentSlide];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-slate-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover object-right brightness-[0.7] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full flex items-center w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="max-w-4xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mb-8"
              >
                <span className="h-[2px] w-16 bg-teal-500 rounded-full" />
                <h2 className="text-teal-500 font-bold tracking-[0.5em] uppercase text-xs md:text-sm">
                  Premium Excellence
                </h2>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] mb-10 tracking-tighter"
              >
                {current.title?.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 !== 0 ? "text-teal-500 italic font-medium inline-block" : "inline-block"}>{word}&nbsp;</span>
                )) || ''}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg md:text-2xl text-slate-300/90 leading-relaxed font-light max-w-2xl border-l-[3px] border-teal-500/50 pl-8"
              >
                {current.description}
              </motion.p>


            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
