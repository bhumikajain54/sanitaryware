import { useState, useEffect } from 'react';
import { MdSearch, MdPayment, MdSync, MdArrowBack, MdCalendarToday, MdPerson, MdFormatListBulleted } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import tallyService from '../../../services/tallyService';
import toast from 'react-hot-toast';

const AdminTallyVouchers = () => {
    const navigate = useNavigate();
    const [ledgers, setLedgers] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Voucher Form State
    const [voucher, setVoucher] = useState({
        partyName: '',
        voucherNumber: `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        narration: 'Sales from Web Dashboard',
        inventoryEntries: [
            { itemName: '', quantity: 1, unit: 'Nos', rate: 0, amount: 0 }
        ],
        ledgerEntries: []
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [ledgersData, stockData] = await Promise.all([
                    tallyService.fetchLedgers(),
                    tallyService.fetchStockItems()
                ]);
                setLedgers(ledgersData || []);
                setStockItems(stockData || []);
            } catch (error) {
                console.error('Failed to load voucher data:', error);
            }
        };
        loadInitialData();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...voucher.inventoryEntries];
        newItems[index][field] = value;
        
        // Auto-calculate amount
        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }
        
        // Auto-fill rate if itemName is selected from stock items
        if (field === 'itemName') {
            const item = stockItems.find(i => i.name === value);
            if (item && item.closingRate) {
                newItems[index].rate = item.closingRate;
                newItems[index].amount = newItems[index].quantity * item.closingRate;
            }
        }
        
        setVoucher({ ...voucher, inventoryEntries: newItems });
    };

    const addItem = () => {
        setVoucher({
            ...voucher,
            inventoryEntries: [...voucher.inventoryEntries, { itemName: '', quantity: 1, unit: 'Nos', rate: 0, amount: 0 }]
        });
    };

    const removeItem = (index) => {
        if (voucher.inventoryEntries.length > 1) {
            const newItems = voucher.inventoryEntries.filter((_, i) => i !== index);
            setVoucher({ ...voucher, inventoryEntries: newItems });
        }
    };

    const calculateTotal = () => {
        return voucher.inventoryEntries.reduce((sum, item) => sum + item.amount, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Prepare final voucher data
        const total = calculateTotal();
        const finalVoucher = {
            ...voucher,
            ledgerEntries: [
                { ledgerName: voucher.partyName, amount: total, isDebit: true },
                { ledgerName: 'Sales', amount: -total, isDebit: false }
            ]
        };

        try {
            const response = await tallyService.createVoucher(finalVoucher);
            if (response.success) {
                toast.success('Sales Voucher synced to Tally');
                navigate('/admin/tally');
            } else {
                toast.error(response.errorMessage || 'Failed to sync voucher');
            }
        } catch (error) {
            toast.error('Sync failed. Check Tally connectivity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/tally')} className="p-2 hover:bg-white rounded-full transition-all">
                            <MdArrowBack className="text-2xl text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sales Voucher</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Direct Tally Entry</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Party & Date */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MdPerson className="text-lg" /> General Information
                            </h3>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Party Name (Ledger)</label>
                                <select 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:outline-none focus:ring-teal-500/20 font-bold text-slate-700 appearance-none"
                                    value={voucher.partyName}
                                    onChange={(e) => setVoucher({ ...voucher, partyName: e.target.value })}
                                >
                                    <option value="">Select a Customer</option>
                                    {ledgers.map((l, i) => (
                                        <option key={i} value={l.name}>{l.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Voucher #</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700"
                                        value={voucher.voucherNumber}
                                        onChange={(e) => setVoucher({ ...voucher, voucherNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700"
                                        value={voucher.date}
                                        onChange={(e) => setVoucher({ ...voucher, date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                                    <MdSync className="text-lg text-teal-400" /> Tally Cloud Sync
                                </h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Amount</p>
                                <h2 className="text-5xl font-black tracking-tight text-white">₹{calculateTotal().toLocaleString()}</h2>
                            </div>
                            
                            <div className="pt-8 space-y-4">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                    <span>Items</span>
                                    <span>{voucher.inventoryEntries.length}</span>
                                </div>
                                <div className="h-[1px] bg-slate-800" />
                                <button 
                                    type="submit"
                                    disabled={loading || !voucher.partyName}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${
                                        loading || !voucher.partyName 
                                        ? 'bg-slate-800 text-slate-600' 
                                        : 'bg-teal-500 text-white hover:bg-teal-400 shadow-teal-500/20 active:scale-[0.98]'
                                    }`}
                                >
                                    {loading ? 'Processing Sync...' : 'Sync to Tally ERP'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Items */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MdFormatListBulleted className="text-lg" /> Item Allocations
                            </h3>
                            <button 
                                type="button"
                                onClick={addItem}
                                className="text-[10px] font-black uppercase tracking-widest text-teal-600 px-4 py-2 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all"
                            >
                                + Add Row
                            </button>
                        </div>

                        <div className="space-y-4">
                            {voucher.inventoryEntries.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-3xl group border-2 border-transparent hover:border-teal-500/10 transition-all">
                                    <div className="col-span-5">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Stock Item Name</label>
                                        <select 
                                            required
                                            className="w-full px-4 py-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700 appearance-none"
                                            value={item.itemName}
                                            onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                                        >
                                            <option value="">Select stock item</option>
                                            {stockItems.map((s, i) => (
                                                <option key={i} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Quantity</label>
                                        <input 
                                            type="number" 
                                            className="w-full px-4 py-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Rate</label>
                                        <input 
                                            type="number" 
                                            className="w-full px-4 py-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Total</label>
                                        <div className="w-full px-4 py-3 bg-white/50 border border-slate-100 rounded-xl font-bold text-slate-400">
                                            ₹{item.amount.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="col-span-1 pb-1 text-center">
                                        <button 
                                            type="button"
                                            onClick={() => removeItem(idx)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminTallyVouchers;
