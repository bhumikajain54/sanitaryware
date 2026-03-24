import { useState, useEffect } from 'react';
import { MdSearch, MdFilterList, MdAdd, MdSync, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import tallyService from '../../../services/tallyService';
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

    useEffect(() => {
        loadLedgers();
    }, []);

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
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/tally')} className="p-2 hover:bg-white rounded-full transition-all">
                            <MdArrowBack className="text-2xl text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tally Ledgers</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Manage Accounting Masters</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadLedgers} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            <MdSync className={`${loading ? 'animate-spin' : ''}`} /> Sync Tally
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">
                            <MdAdd /> Create Ledger
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input 
                            type="text" 
                            placeholder="Search ledgers by name or group..." 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Parent Group</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Opening Balance</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                        </tr>
                                    ))
                                ) : filteredLedgers.length > 0 ? (
                                    filteredLedgers.map((ledger, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-6 font-bold text-slate-700">{ledger.name}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {ledger.parent}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-slate-500">₹{ledger.openingBalance?.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-mono text-teal-600 font-bold">₹{ledger.closingBalance?.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic opacity-50">
                                            No ledgers found matching your search
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Ledger Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Create New Ledger</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">Tally Master Sync</p>
                        
                        <form onSubmit={handleCreateLedger} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ledger Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700"
                                    value={newLedger.name}
                                    onChange={(e) => setNewLedger({...newLedger, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Parent Group</label>
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700 appearance-none"
                                    value={newLedger.parent}
                                    onChange={(e) => setNewLedger({...newLedger, parent: e.target.value})}
                                >
                                    <option>Sundry Debtors</option>
                                    <option>Sundry Creditors</option>
                                    <option>Bank Accounts</option>
                                    <option>Direct Incomes</option>
                                    <option>Sales Accounts</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-teal-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all"
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
