import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdSync,
  MdSettings,
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdCloudDone,
  MdHistory,
  MdCompareArrows,
  MdList,
  MdInventory,
  MdArrowForward,
  MdAccountBalanceWallet
} from 'react-icons/md';
import tallyService from '../../services/tallyService';
import toast from 'react-hot-toast';

const AdminTally = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tallyStatus, setTallyStatus] = useState({
    connected: false,
    message: 'Checking status...'
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const status = await tallyService.checkStatus();
      setTallyStatus(status);
    } catch (err) {
      setTallyStatus({ connected: false, message: 'Tally not reachable' });
    }
  };

  const syncModules = [
    {
      title: 'Ledgers',
      desc: 'Sync customers and accounting heads',
      icon: <MdAccountBalanceWallet />,
      path: '/admin/tally/ledgers',
      color: 'teal'
    },
    {
      title: 'Vouchers',
      desc: 'Create direct sales entries in Tally',
      icon: <MdCompareArrows />,
      path: '/admin/tally/vouchers',
      color: 'blue'
    },
    {
      title: 'Inventory',
      desc: 'Fetch stock levels and item masters',
      icon: <MdInventory />,
      path: '/admin/tally/inventory',
      color: 'purple'
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans antialiased text-[#1E293B] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#00A88F] tracking-tight">Tally Hub</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 text-xs opacity-70">
              Enterprise Resource Planning Interface
            </p>
          </div>
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-sm border ${
            tallyStatus.connected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}>
             <div className={`w-2 h-2 rounded-full ${tallyStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
             <span className="font-black uppercase tracking-widest text-[10px]">
                {tallyStatus.connected ? 'Connected to Tally' : 'Tally Offline'}
             </span>
             <button onClick={checkConnection} className="ml-2 hover:bg-emerald-100 p-1 rounded-full transition-all">
                <MdRefresh className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        {/* Sync Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {syncModules.map((module, i) => (
            <div 
              key={i}
              onClick={() => navigate(module.path)}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-teal-500/10 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className={`w-16 h-16 rounded-2xl bg-${module.color}-50 text-${module.color}-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">{module.title}</h3>
              <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">{module.desc}</p>
              
              <div className="flex items-center gap-2 text-teal-600 font-black uppercase tracking-widest text-[10px]">
                Enter Module <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Decorative Background */}
              <div className="absolute -bottom-4 -right-4 text-8xl opacity-5 text-slate-900 font-bold italic rotate-12">
                {module.title}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Instructions */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-6">Tally Integration Guide</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-black flex-shrink-0">1</div>
                <p className="text-slate-400 font-medium italic">Ensure TallyPrime is running and Company is loaded.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-black flex-shrink-0">2</div>
                <p className="text-slate-400 font-medium italic">Enable <span className="text-white font-bold">HTTP XML</span> in F1 → Settings → Advanced Configuration.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-black flex-shrink-0">3</div>
                <p className="text-slate-400 font-medium italic">Set <span className="text-white font-bold">Port to 9000</span> and restart Tally.</p>
              </div>
            </div>
          </div>
          <MdCloudDone className="absolute -bottom-10 -right-10 text-[20rem] text-teal-500 opacity-5" />
        </div>

      </div>
    </div>
  );
};

export default AdminTally;