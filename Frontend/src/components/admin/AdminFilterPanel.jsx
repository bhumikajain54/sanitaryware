/**
 * Reusable Admin Filter Panel Component
 * Provides a consistent filter UI across all admin pages
 */

import React from 'react';
import { MdClose } from 'react-icons/md';

const AdminFilterPanel = ({
  showFilters,
  filters,
  filterConfig,
  activeFilterCount,
  activeFilters,
  onFilterChange,
  onClearFilters,
  resultsCount = 0,
  className = ''
}) => {
  if (!showFilters) return null;

  return (
    <div className={`bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl p-4 mb-6 animate-fadeIn ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[var(--admin-text-primary)] uppercase tracking-wider">
            Filters
          </h3>
          <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
            Showing {resultsCount} Results
          </span>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilters.map(({ key, displayValue, label }) => (
                <span
                  key={key}
                  className="text-[9px] px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full font-bold inline-flex items-center gap-1"
                >
                  {label}: {displayValue}
                  <button
                    onClick={() => onFilterChange(key, '')}
                    className="hover:text-teal-900 dark:hover:text-teal-100"
                  >
                    <MdClose className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-teal-600 hover:text-teal-700 font-bold uppercase tracking-wider underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(filterConfig).map(([key, config]) => (
          <div key={key}>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {config.label}
            </label>
            
            {config.type === 'select' || config.type === 'exact' || config.type === 'range' || config.type === 'boolean' ? (
              <select
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="w-full px-3 py-2 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl outline-none text-sm font-medium text-[var(--admin-text-primary)]"
              >
                <option value="">{config.placeholder || `All ${config.label}`}</option>
                {config.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : config.type === 'text' || config.type === 'contains' ? (
              <input
                type="text"
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
                placeholder={config.placeholder || `Filter by ${config.label}`}
                className="w-full px-3 py-2 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl outline-none text-sm font-medium text-[var(--admin-text-primary)]"
              />
            ) : config.type === 'date' ? (
              <input
                type="date"
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="w-full px-3 py-2 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl outline-none text-sm font-medium text-[var(--admin-text-primary)]"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFilterPanel;
