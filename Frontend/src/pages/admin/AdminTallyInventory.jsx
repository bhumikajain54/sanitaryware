import { useState, useEffect } from 'react';
import { MdSearch, MdSync, MdArrowBack, MdCloudUpload } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import tallyService from "../../services/tallyService";
import { syncAllProductsToTally } from "../../services/additionalServices";
import toast from "react-hot-toast";

const AdminTallyInventory = () => {
    const navigate = useNavigate();
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const loadStock = async () => {
        setLoading(true);
        try {
            const data = await tallyService.fetchStockItems();
            setStockItems(data || []);
        } catch {
            toast.error('Failed to fetch stock items from Tally');
        } finally { setLoading(false); }
    };

    const handlePushSync = async () => {
        setSyncing(true);
        const tid = toast.loading("Syncing all products to Tally...");
        try {
            const result = await syncAllProductsToTally();
            toast.success(`Successfully synced ${result.success || result.syncedCount || 'all'} products!`, { id: tid });
            loadStock();
        } catch (error) {
            toast.error(error.message || "Failed to sync products", { id: tid });
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => { loadStock(); }, []);

    const filteredStock = stockItems.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guid?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">

                {/* ─── Header ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin/tally')}
                            className="p-2 hover:bg-white rounded-full transition-all flex-shrink-0 bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                        >
                            <MdArrowBack className="text-2xl text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                                Tally Stock Items
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs">
                                Inventory Masters Sync
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <button onClick={handlePushSync} disabled={syncing}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-white border border-[#00A88F] text-[#00A88F] rounded-xl font-bold hover:bg-[#00A88F]/5 transition-all text-[10px] sm:text-xs shadow-sm disabled:opacity-50"
                        >
                            <MdCloudUpload className={`text-base sm:text-lg ${syncing ? 'animate-bounce' : ''}`} />
                            Push Sync
                        </button>
                        <button onClick={loadStock}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-[#00A88F] text-white rounded-xl font-bold hover:bg-[#008F7A] shadow-lg shadow-[#00A88F]/20 transition-all active:scale-95 text-[10px] sm:text-xs"
                        >
                            <MdSync className={`text-base sm:text-lg flex-shrink-0 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ─── Search ─── */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex gap-3 sm:gap-4 items-center">
                    <div className="flex-1 relative">
                        <MdSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base sm:text-lg md:text-xl" />
                        <input
                            type="text"
                            placeholder="Search inventory by name or guid..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 sm:pl-11 md:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#00A88F]/20 outline-none transition-all font-medium text-xs sm:text-sm text-slate-700"
                        />
                    </div>
                </div>

                {/* ─── Inventory Table ─── */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[560px] sm:min-w-[640px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    {['Item Name', 'Unit', 'Closing Balance', 'Closing Rate', 'Total Value'].map((th) => (
                                        <th key={th}
                                            className="px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap"
                                        >
                                            {th}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
                                                <div className="h-3.5 sm:h-4 bg-slate-100 rounded w-36 sm:w-44 md:w-48" />
                                            </td>
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
                                                <div className="h-3.5 sm:h-4 bg-slate-100 rounded w-12 sm:w-16" />
                                            </td>
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
                                                <div className="h-3.5 sm:h-4 bg-slate-100 rounded w-16 sm:w-20 md:w-24" />
                                            </td>
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
                                                <div className="h-3.5 sm:h-4 bg-slate-100 rounded w-16 sm:w-20 md:w-24" />
                                            </td>
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
                                                <div className="h-3.5 sm:h-4 bg-slate-100 rounded w-24 sm:w-28 md:w-32" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredStock.length > 0 ? (
                                    filteredStock.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-all group">

                                            {/* Item name + GUID */}
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-3.5 sm:py-4 md:py-5 lg:py-6 font-bold text-slate-700">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] sm:text-xs md:text-sm truncate max-w-[140px] sm:max-w-[200px] md:max-w-none">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[7px] sm:text-[8px] text-slate-300 font-mono mt-0.5 sm:mt-1 opacity-60 truncate max-w-[140px] sm:max-w-[200px] md:max-w-none">
                                                        GUID: {item.guid}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Unit */}
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-3.5 sm:py-4 md:py-5 lg:py-6">
                                                <span className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-slate-100 text-slate-500 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                    {item.baseUnits || 'Nos'}
                                                </span>
                                            </td>

                                            {/* Closing Balance */}
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-3.5 sm:py-4 md:py-5 lg:py-6 font-mono text-slate-800 font-black text-[10px] sm:text-xs md:text-sm">
                                                {item.closingBalance || 0}
                                            </td>

                                            {/* Closing Rate */}
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-3.5 sm:py-4 md:py-5 lg:py-6 font-mono text-slate-500 italic text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                                                ₹{(item.closingRate || 0).toLocaleString()}
                                            </td>

                                            {/* Total Value */}
                                            <td className="px-4 sm:px-5 md:px-6 lg:px-8 py-3.5 sm:py-4 md:py-5 lg:py-6 font-mono text-[#00A88F] font-black text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                                                ₹{(item.closingValue || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 sm:px-8 py-12 sm:py-16 md:py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic opacity-50 text-[9px] sm:text-[10px] md:text-xs">
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