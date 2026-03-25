import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdSync, MdSettings, MdCheckCircle, MdError, MdRefresh,
  MdCloudDone, MdHistory, MdCompareArrows, MdList,
  MdInventory, MdArrowForward, MdAccountBalanceWallet
} from 'react-icons/md';
import tallyService from '../../services/tallyService';
import toast from 'react-hot-toast';

const AdminTally = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tallyStatus, setTallyStatus] = useState({ connected: false, message: 'Checking status...' });

  useEffect(() => { checkConnection(); }, []);

  const checkConnection = async () => {
    try {
      const status = await tallyService.checkStatus();
      setTallyStatus(status);
    } catch {
      setTallyStatus({ connected: false, message: 'Tally not reachable' });
    }
  };

  const syncModules = [
    {
      title: 'Ledgers',
      desc: 'Sync customers and accounting heads',
      icon: <MdAccountBalanceWallet />,
      path: '/admin/tally/ledgers',
      bg: 'bg-teal-50',
      text: 'text-teal-600'
    },
    {
      title: 'Vouchers',
      desc: 'Create direct sales entries in Tally',
      icon: <MdCompareArrows />,
      path: '/admin/tally/vouchers',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      title: 'Inventory',
      desc: 'Fetch stock levels and item masters',
      icon: <MdInventory />,
      path: '/admin/tally/inventory',
      bg: 'bg-purple-50',
      text: 'text-purple-600'
    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans antialiased text-[#1E293B] px-4 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-7 md:py-9">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 mb-7 sm:mb-9 md:mb-12">

          {/* Title */}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00A88F] tracking-tight leading-tight">
              Tally Hub
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.18em] mt-0.5 text-[9px] sm:text-[10px] md:text-xs opacity-70">
              Enterprise Resource Planning Interface
            </p>
          </div>

          {/* Connection badge */}
          <div className={`
            flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5
            rounded-xl sm:rounded-2xl shadow-sm border flex-shrink-0 w-fit self-start xs:self-auto
            ${tallyStatus.connected
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-rose-50 border-rose-100 text-rose-600'}
          `}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tallyStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-black uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap">
              {tallyStatus.connected ? 'Connected to Tally' : 'Tally Offline'}
            </span>
            <button
              onClick={checkConnection}
              className={`ml-1 p-1 rounded-full transition-all flex-shrink-0 ${tallyStatus.connected ? 'hover:bg-emerald-100' : 'hover:bg-rose-100'}`}
            >
              <MdRefresh className={`text-sm sm:text-base ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ─── Sync Module Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {syncModules.map((module, i) => (
            <div
              key={i}
              onClick={() => navigate(module.path)}
              className="group bg-white p-5 sm:p-6 md:p-7 lg:p-8 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-teal-500/10 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Icon */}
              <div className={`
                w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 lg:w-16 lg:h-16
                rounded-xl sm:rounded-2xl ${module.bg} ${module.text}
                flex items-center justify-center
                text-2xl sm:text-2xl md:text-3xl
                mb-4 sm:mb-5 md:mb-6
                group-hover:scale-110 transition-transform flex-shrink-0
              `}>
                {module.icon}
              </div>

              {/* Text */}
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 mb-1.5 sm:mb-2 leading-tight">
                {module.title}
              </h3>
              <p className="text-slate-400 font-medium text-xs sm:text-sm leading-relaxed mb-6 sm:mb-7 md:mb-8">
                {module.desc}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-teal-600 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">
                Enter Module
                <MdArrowForward className="text-sm sm:text-base group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>

              {/* Decorative watermark */}
              <div className="absolute -bottom-4 -right-3 text-6xl sm:text-7xl md:text-8xl opacity-[0.04] text-slate-900 font-bold italic rotate-12 select-none pointer-events-none">
                {module.title}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminTally;