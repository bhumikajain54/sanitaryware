import { useState, useEffect } from 'react';
import { MdSearch, MdAdd, MdSync, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import tallyService from '../../services/tallyService';
import toast from 'react-hot-toast';

const AdminTallyLedgers = () => {
    const navigate = useNavigate();
    const [ledgers, setLedgers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLedger, setNewLedger] = useState({ name: '', parent: 'Sundry Debtors' });

    const loadLedgers = async () => {
        setLoading(true);
        try {
            const data = await tallyService.fetchLedgers();
            setLedgers(data || []);
        } catch (error) {
            toast.error('Failed to fetch ledgers from Tally');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLedgers(); }, []);

    const handleCreateLedger = async (e) => {
        e.preventDefault();
        try {
            const response = await tallyService.createLedger(newLedger);
            if (response.success) {
                toast.success('Ledger created in Tally');
                setShowAddModal(false);
                setNewLedger({ name: '', parent: 'Sundry Debtors' });
                loadLedgers();
            } else {
                toast.error(response.errorMessage || 'Failed to create ledger');
            }
        } catch (error) {
            toast.error('Connection error with Tally');
        }
    };

    const filteredLedgers = ledgers.filter(ledger =>
        ledger.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ledger.parent?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">

                    {/* Left: back + title */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/tally')}
                            className="p-2 hover:bg-white rounded-full transition-all shrink-0 bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                        >
                            <MdArrowBack className="text-2xl text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                                Tally Ledgers
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                                Manage Accounting Masters
                            </p>
                        </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={loadLedgers}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs sm:text-sm shadow-sm"
                        >
                            <MdSync className={`text-base sm:text-lg shrink-0 ${loading ? 'animate-spin' : ''}`} />
                            Sync Tally
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200/60 transition-all text-xs sm:text-sm"
                        >
                            <MdAdd className="text-base sm:text-lg shrink-0" />
                            Create
                        </button>
                    </div>
                </div>

                {/* ── Search Bar ── */}
                <div className="bg-white px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-4 sm:mb-5 md:mb-6">
                    <div className="relative">
                        <MdSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg sm:text-xl" />
                        <input
                            type="text"
                            placeholder="Search ledgers by name or group..."
                            className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-xs sm:text-sm outline-none text-slate-600 placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 sm:px-6 lg:px-8 py-4 lg:py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Ledger Name</th>
                                    <th className="px-5 sm:px-6 lg:px-8 py-4 lg:py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Parent Group</th>
                                    <th className="px-5 sm:px-6 lg:px-8 py-4 lg:py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Opening</th>
                                    <th className="px-5 sm:px-6 lg:px-8 py-4 lg:py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Current</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse border-none">
                                            <td className="px-6 lg:px-8 py-5"><div className="h-4 bg-slate-100 rounded w-44" /></td>
                                            <td className="px-6 lg:px-8 py-5"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                                            <td className="px-6 lg:px-8 py-5"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                                            <td className="px-6 lg:px-8 py-5"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                                        </tr>
                                    ))
                                ) : filteredLedgers.length > 0 ? (
                                    filteredLedgers.map((ledger, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-all border-none group">
                                            <td className="px-6 lg:px-8 py-5 font-bold text-slate-700 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-teal-500/20 group-hover:bg-teal-500 transition-all duration-300" />
                                                    {ledger.name}
                                                </div>
                                            </td>
                                            <td className="px-6 lg:px-8 py-5">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                                                    {ledger.parent}
                                                </span>
                                            </td>
                                            <td className="px-6 lg:px-8 py-5 font-mono text-slate-500 text-sm">₹{ledger.openingBalance?.toLocaleString()}</td>
                                            <td className="px-6 lg:px-8 py-5 font-mono text-teal-600 font-bold text-sm">₹{ledger.closingBalance?.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="border-none">
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-6 max-w-sm mx-auto">
                                                {/* Empty State Icon */}
                                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center relative">
                                                    <MdSync className="text-4xl text-slate-200 animate-pulse" />
                                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-slate-50">
                                                        <div className="w-2 h-2 rounded-full bg-[#00A88F] animate-ping" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-black text-slate-800">No Ledgers Found</h3>
                                                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                                        Your accounting masters haven't been synchronized from Tally yet. Sync to populate this table.
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={loadLedgers}
                                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#00A88F] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#008F7A] shadow-xl shadow-[#00A88F]/20 transition-all active:scale-95"
                                                >
                                                    <MdSync className={`${loading ? 'animate-spin' : ''} text-lg`} />
                                                    Sync Tally Masters Now
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ── Add Ledger Modal ── */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">Create New Ledger</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 sm:mb-8">Tally Master Sync</p>

                        <form onSubmit={handleCreateLedger} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                    Ledger Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 sm:py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700 text-sm"
                                    value={newLedger.name}
                                    onChange={(e) => setNewLedger({ ...newLedger, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                    Parent Group
                                </label>
                                <select
                                    className="w-full px-5 py-3.5 sm:py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700 appearance-none text-sm"
                                    value={newLedger.parent}
                                    onChange={(e) => setNewLedger({ ...newLedger, parent: e.target.value })}
                                >
                                    <option>Sundry Debtors</option>
                                    <option>Sundry Creditors</option>
                                    <option>Bank Accounts</option>
                                    <option>Direct Incomes</option>
                                    <option>Sales Accounts</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2 sm:pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3.5 sm:py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 sm:py-4 bg-teal-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all"
                                >
                                    Sync to Tally
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTallyLedgers;