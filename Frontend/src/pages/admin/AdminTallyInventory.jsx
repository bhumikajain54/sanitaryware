import { useState, useEffect } from 'react';
import { MdSearch, MdInventory, MdSync, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import tallyService from '../../../services/tallyService';
import toast from 'react-hot-toast';

const AdminTallyInventory = () => {
    const navigate = useNavigate();
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadStock = async () => {
        setLoading(true);
        try {
            const data = await tallyService.fetchStockItems();
            setStockItems(data || []);
        } catch (error) {
            toast.error('Failed to fetch stock items from Tally');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStock();
    }, []);

    const filteredStock = stockItems.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guid?.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tally Stock Items</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Inventory Masters Sync</p>
                        </div>
                    </div>
                    <div>
                        <button onClick={loadStock} className="flex items-center gap-2 px-6 py-3 bg-[#00A88F] text-white rounded-xl font-bold hover:bg-[#008F7A] shadow-lg shadow-[#00A88F]/20 transition-all active:scale-95 uppercase tracking-widest text-xs">
                            <MdSync className={`${loading ? 'animate-spin' : ''} text-lg`} /> Refresh Inventory
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input 
                            type="text" 
                            placeholder="Search inventory by name or guid..." 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00A88F]/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Item Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Closing Balance</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Closing Rate</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                        </tr>
                                    ))
                                ) : filteredStock.length > 0 ? (
                                    filteredStock.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-6 font-bold text-slate-700">
                                                <div className="flex flex-col">
                                                    <span>{item.name}</span>
                                                    <span className="text-[8px] text-slate-300 font-mono mt-1 opacity-60">GUID: {item.guid}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {item.baseUnits || 'Nos'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-slate-800 font-black">
                                                {item.closingBalance || 0}
                                            </td>
                                            <td className="px-8 py-6 font-mono text-slate-500 italic">₹{(item.closingRate || 0).toLocaleString()}</td>
                                            <td className="px-8 py-6 font-mono text-[#00A88F] font-black">₹{(item.closingValue || 0).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic opacity-50">
                                            No stock items found in Tally sync
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTallyInventory;
