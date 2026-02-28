import { MdClose, MdMail, MdPhone, MdLocationOn, MdHistory, MdBlock, MdCheckCircle } from 'react-icons/md';

const CustomerModal = ({ customer, onClose, onToggleStatus, onViewOrders }) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-main)] w-[90vw] max-w-[320px] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-black text-[var(--admin-text-primary)] uppercase tracking-tight">
              Manage Prospect
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 italic">
              Account Control Center
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
          >
            <MdClose className="text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Profile Section */}
          <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-[var(--border-subtle)]">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-500/20 uppercase">
              {customer.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-black text-[var(--admin-text-primary)] uppercase truncate">{customer.name}</h4>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.15em] mt-0.5 whitespace-nowrap">Member Since {customer.memberSince || 'N/A'}</p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-[var(--admin-bg-secondary)] rounded-lg border border-[var(--border-subtle)] text-center">
              <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-0.5">Total Load</p>
              <p className="text-[13px] font-black text-teal-600 dark:text-teal-400">{customer.totalOrders || 0} Orders</p>
            </div>
            <div className="p-2 bg-[var(--admin-bg-secondary)] rounded-lg border border-[var(--border-subtle)] text-center">
              <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-0.5">Gross Spend</p>
              <p className="text-[13px] font-black text-rose-600 dark:text-rose-400">{customer.totalSpent || '₹0'}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Contact Metadata</label>
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 bg-[var(--admin-bg-primary)] rounded-lg border border-[var(--border-subtle)]">
                <MdMail className="text-teal-500 text-xs" />
                <span className="text-[10px] font-bold text-[var(--admin-text-secondary)] truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[var(--admin-bg-primary)] rounded-lg border border-[var(--border-subtle)]">
                <MdPhone className="text-teal-500 text-xs" />
                <span className="text-[10px] font-bold text-[var(--admin-text-secondary)] truncate">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[var(--admin-bg-primary)] rounded-lg border border-[var(--border-subtle)]">
                <MdLocationOn className="text-teal-500 text-xs" />
                <span className="text-[10px] font-bold text-[var(--admin-text-secondary)] truncate">Registered Address N/A</span>
              </div>
            </div>
          </div>

          {/* Danger Zone / Quick Actions */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <button
               onClick={() => onToggleStatus(customer.id)}
               className={`w-full py-2 px-3 flex items-center justify-between rounded-lg transition-all group ${
                 customer.status?.toLowerCase() === 'active' 
                 ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20' 
                 : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
               }`}
            >
              <div className="flex items-center gap-2">
                {customer.status?.toLowerCase() === 'active' ? <MdBlock className="text-sm" /> : <MdCheckCircle className="text-sm" />}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {customer.status?.toLowerCase() === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                </span>
              </div>
            </button>
            <button 
              onClick={() => onViewOrders(customer)}
              className="w-full py-2 px-3 flex items-center justify-between rounded-lg bg-[var(--admin-bg-primary)] text-[var(--admin-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <div className="flex items-center gap-2">
                <MdHistory className="text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest">View Order Log</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-50 dark:border-slate-600 bg-slate-50/30 dark:bg-slate-800/20">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-600 text-white text-[11px] sm:text-[12px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-all active:scale-[0.98]"
          >
            Close Control Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
