import React from 'react';
import { motion } from 'framer-motion';

// Generic Card Component
export const Card = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-main)] overflow-hidden transition-colors duration-300 ${className}`}>
    <div className={noPadding ? "" : "p-5 md:p-6"}>
      {children}
    </div>
  </div>
);

// Badge Component
export const Badge = ({ children, variant = "neutral", className = "" }) => {
  const variants = {
    neutral: "bg-[var(--border-subtle)] text-[var(--text-muted)] border-[var(--border-main)]",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    primary: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Stat Card Component
export const StatCard = ({ label, value, icon: Icon, trend, trendValue, trendColor = "success", color = "primary", onClick }) => {
  const colorMap = {
    primary: "bg-teal-500/10 text-teal-500",
    blue: "bg-blue-500/10 text-blue-500",
    indigo: "bg-indigo-500/10 text-indigo-500",
    amber: "bg-amber-500/10 text-amber-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  const trendColors = {
    success: "text-emerald-500",
    info: "text-blue-500",
    warning: "text-amber-500",
    error: "text-rose-500",
    primary: "text-teal-500",
    neutral: "text-[var(--text-muted)]",
  };

  return (
    <Card 
      className={`hover:shadow-md transition-all duration-300 group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
          <h3 className="text-[26px] font-serif font-black text-[var(--text-main)] leading-tight tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider ${trendColors[trendColor] || trendColors.success}`}>
                {trendValue}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight opacity-80">{trend}</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colorMap[color] || colorMap.primary} transition-all group-hover:rotate-6 duration-300`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

// Skeleton Placeholder
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-[var(--border-subtle)] rounded ${className}`} />
);

// Table Row Component
export const TableHeader = ({ cols }) => (
  <thead className="bg-[var(--bg-app)] border-b border-[var(--border-main)]">
    <tr>
      {cols.map((col, i) => (
        <th key={i} className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          {col}
        </th>
      ))}
    </tr>
  </thead>
);
