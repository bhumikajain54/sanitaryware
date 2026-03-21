import React from 'react';
import { motion } from 'framer-motion';

/* ─── Card ─── */
export const Card = ({ children, className = '', noPadding = false, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[var(--bg-card)] rounded-xl sm:rounded-2xl shadow-sm border border-[var(--border-main)] overflow-hidden transition-colors duration-300 ${className}`}
  >
    <div className={noPadding ? '' : 'p-3.5 sm:p-4 md:p-5 lg:p-6'}>
      {children}
    </div>
  </div>
);

/* ─── Badge ─── */
export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: 'bg-[var(--border-subtle)] text-[var(--text-muted)] border-[var(--border-main)]',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10  text-amber-500  border-amber-500/20',
    error: 'bg-rose-500/10   text-rose-500   border-rose-500/20',
    info: 'bg-sky-500/10    text-sky-500    border-sky-500/20',
    primary: 'bg-teal-500/10   text-teal-500   border-teal-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-semibold border ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  );
};

/* ─── StatCard ─── */
export const StatCard = ({ label, value, icon: Icon, trend, trendValue, trendColor = 'success', color = 'primary', onClick }) => {
  const colorMap = {
    primary: 'bg-teal-500/10   text-teal-500',
    blue: 'bg-blue-500/10   text-blue-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
    amber: 'bg-amber-500/10  text-amber-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  const trendColors = {
    success: 'text-emerald-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
    error: 'text-rose-500',
    primary: 'text-teal-500',
    neutral: 'text-[var(--text-muted)]',
  };

  return (
    <Card
      onClick={onClick}
      className={`hover:shadow-md transition-all duration-300 group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Text side */}
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate">
            {label}
          </p>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[26px] font-serif font-black text-[var(--text-main)] leading-tight tracking-tight">
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 flex-wrap">
              <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider ${trendColors[trendColor] || trendColors.success}`}>
                {trendValue}
              </span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight opacity-80 hidden xs:inline">
                {trend}
              </span>
            </div>
          )}
        </div>

        {/* Icon side */}
        <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl ${colorMap[color] || colorMap.primary} transition-all group-hover:rotate-6 duration-300`}>
          <Icon className="text-lg sm:text-xl md:text-2xl" />
        </div>
      </div>
    </Card>
  );
};

/* ─── Skeleton ─── */
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-[var(--border-subtle)] rounded-xl ${className}`} />
);

/* ─── TableHeader ─── */
export const TableHeader = ({ cols }) => (
  <thead className="bg-[var(--bg-app)] border-b border-[var(--border-main)]">
    <tr>
      {cols.map((col, i) => (
        <th
          key={i}
          className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-left text-[8px] sm:text-[9px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap"
        >
          {col}
        </th>
      ))}
    </tr>
  </thead>
);