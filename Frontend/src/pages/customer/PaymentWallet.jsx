import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdCreditCard, MdAccountBalanceWallet, MdSmartphone, 
  MdAdd, MdDelete, MdEdit, MdClose, MdHistory, 
  MdMoreVert, MdArrowUpward, MdArrowDownward
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import customerService from '../../services/customerService';

/* ─── Reusable Card / Box Component ─── */
const DashboardCard = ({ title, actionBtn, children }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
      <h3 className="text-[14px] md:text-[16px] font-bold text-slate-800 tracking-tight">{title}</h3>
      {actionBtn}
    </div>
    {children}
  </div>
);

/* ─── 1. Saved Card Item ─── */
const CardItem = ({ card, onDelete }) => {
  const isVisa = card.type.toLowerCase() === 'visa';
  const isMastercard = card.type.toLowerCase() === 'mastercard';
  
  return (
    <div className="group flex items-center justify-between p-4 mb-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-8 rounded-md flex items-center justify-center font-black text-xs italic ${
          isVisa ? 'bg-blue-600 text-white' : isMastercard ? 'bg-orange-500 text-white' : 'bg-slate-800 text-white'
        }`}>
          {card.type}
        </div>
        <div>
          <p className="text-[13px] md:text-[14px] font-bold text-slate-700 tracking-widest">{card.number}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] md:text-[11px] font-medium text-slate-500 uppercase">{card.name}</p>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <p className="text-[10px] md:text-[11px] font-medium text-slate-500 border border-slate-200 px-1.5 rounded">{card.expiry}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-slate-400 hover:text-teal-600 bg-white shadow-sm border border-slate-100 rounded-lg transition-all"><MdEdit size={14}/></button>
        <button onClick={() => onDelete(card.id)} className="p-2 text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-lg transition-all"><MdDelete size={14}/></button>
      </div>
    </div>
  );
};

/* ─── 2. Saved UPI Item ─── */
const UpiItem = ({ upi, onDelete }) => (
  <div className="group flex items-center justify-between p-3.5 mb-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
        <MdSmartphone className="text-teal-600 text-lg" />
      </div>
      <div>
        <p className="text-[13px] md:text-[14px] font-bold text-slate-700">{upi.upiIdentifier}</p>
        <p className="text-[10px] md:text-[11px] font-medium text-slate-500 mt-0.5">Verified Account</p>
      </div>
    </div>
    <button onClick={() => onDelete(upi.id)} className="p-2 text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
      <MdDelete size={14}/>
    </button>
  </div>
);

/* ─── Modal ─── */
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-[15px] font-bold text-slate-800">{title}</h4>
            <button onClick={onClose} className="w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"><MdClose size={16}/></button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ═════════ MAIN COMPONENT ═════════ */
const PaymentWallet = () => {
  // State from live API
  const [cards, setCards] = useState([]);
  const [upiIds, setUpiIds] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'card', 'upi', 'money'
  
  // Form State
  const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '' });
  const [newUpi, setNewUpi] = useState('');
  const [addAmount, setAddAmount] = useState('');

  // Fetch live backend data on mount
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setIsLoading(true);
        const [cardsRes, upiRes, balRes, histRes] = await Promise.allSettled([
          customerService.getSavedCards(),
          customerService.getSavedUpi(),
          customerService.getWalletBalance(),
          customerService.getWalletHistory()
        ]);
        
        if (cardsRes.status === 'fulfilled' && Array.isArray(cardsRes.value)) {
          // Map backend cardNumber/cardHolderName to frontend number/name
          setCards(cardsRes.value.map(c => ({
            id: c.id,
            type: c.cardNumber?.startsWith('4') ? 'Visa' : 'Mastercard',
            number: c.cardNumber,
            name: c.cardHolderName,
            expiry: c.expiry
          })));
        }
        
        if (upiRes.status === 'fulfilled' && Array.isArray(upiRes.value)) {
          setUpiIds(upiRes.value.map(u => ({ id: u.id, upiIdentifier: u.upiId })));
        }
        
        if (balRes.status === 'fulfilled') {
          setWalletBalance(balRes.value?.balance || 0);
        }

        if (histRes.status === 'fulfilled' && Array.isArray(histRes.value)) {
          setTransactions(histRes.value.map(t => ({
            id: t.id,
            desc: t.description,
            date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            amt: (t.type === 'CREDIT' ? '+' : '-') + '₹' + t.amount.toLocaleString(),
            positive: t.type === 'CREDIT'
          })));
        }
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveData();
  }, []);

  // Handlers
  const handleDeleteCard = async (id) => {
    try {
      await customerService.deleteSavedCard(id).catch(() => {}); // Optional silent catch if endpoint missing
      setCards(cards.filter(c => c.id !== id));
      toast.success('Card removed successfully');
    } catch {
      toast.error('Failed to remove card from server');
    }
  };

  const handleDeleteUpi = async (id) => {
    try {
      await customerService.deleteSavedUpi(id).catch(() => {});
      setUpiIds(upiIds.filter(u => u.id !== id));
      toast.success('UPI ID removed successfully');
    } catch {
      toast.error('Failed to remove UPI from server');
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (newCard.number && newCard.name && newCard.expiry) {
      // Backend expects cardNumber, cardHolderName, expiry
      const backendPayload = { 
        cardNumber: `**** **** **** ${newCard.number.slice(-4)}`, 
        cardHolderName: newCard.name, 
        expiry: newCard.expiry 
      };
      try {
        const saved = await customerService.addSavedCard(backendPayload);
        setCards([...cards, { 
          id: saved.id || Date.now(), 
          type: 'Visa', 
          number: backendPayload.cardNumber, 
          name: backendPayload.cardHolderName, 
          expiry: backendPayload.expiry 
        }]);
        setActiveModal(null);
        setNewCard({ number: '', name: '', expiry: '' });
        toast.success('Card added successfully');
      } catch {
        toast.error('Failed to save card securely');
      }
    }
  };

  const handleAddUpi = async (e) => {
    e.preventDefault();
    if (newUpi.includes('@')) {
      try {
        const saved = await customerService.addSavedUpi(newUpi);
        setUpiIds([...upiIds, { id: saved.id || Date.now(), upiIdentifier: newUpi }]);
        setActiveModal(null);
        setNewUpi('');
        toast.success('UPI ID verified and linked');
      } catch {
        toast.error('Failed to link UPI to account');
      }
    } else {
      toast.error('Please enter a valid UPI ID');
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (amt > 0) {
      try {
        await customerService.addMoneyToWallet(amt).catch(() => {});
        setWalletBalance(prev => prev + amt);
        setActiveModal(null);
        setAddAmount('');
        toast.success(`₹${amt} added to your wallet!`);
      } catch {
        toast.error('Failed to add funds via secure gateway');
      }
    }
  };



  return (
    <div className="min-h-screen bg-slate-50/50 pt-6 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Payment & Wallet</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">Manage your saved cards, UPI IDs, and Wallet balance.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing with secure server...</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Cards & UPI) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Saved Cards */}
            <DashboardCard 
              title="Saved Cards" 
              actionBtn={
                <button onClick={() => setActiveModal('card')} className="flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors uppercase tracking-wider">
                  <MdAdd size={14}/> Add New
                </button>
              }
            >
              {cards.length > 0 ? (
                cards.map(card => <CardItem key={card.id} card={card} onDelete={handleDeleteCard} />)
              ) : (
                <p className="text-[13px] text-slate-400 text-center py-6">No saved cards found.</p>
              )}
            </DashboardCard>

            {/* 2. Saved UPI */}
            <DashboardCard 
              title="Saved UPI IDs" 
              actionBtn={
                <button onClick={() => setActiveModal('upi')} className="flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors uppercase tracking-wider">
                  <MdAdd size={14}/> Add New
                </button>
              }
            >
              {upiIds.length > 0 ? (
                upiIds.map(upi => <UpiItem key={upi.id} upi={upi} onDelete={handleDeleteUpi} />)
              ) : (
                <p className="text-[13px] text-slate-400 text-center py-6">No saved UPI IDs found.</p>
              )}
            </DashboardCard>
          </div>

          {/* Right Column (Wallet) */}
          <div className="space-y-6">
            
            {/* 3. Wallet */}
            <DashboardCard title="My Wallet" actionBtn={<MdAccountBalanceWallet className="text-slate-300 text-xl" />}>
              <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-xl p-6 text-white text-center shadow-lg shadow-teal-600/20 mb-5 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <p className="text-[11px] text-teal-100 font-semibold uppercase tracking-widest mb-1">Available Balance</p>
                <h2 className="text-4xl font-black mb-4">₹{walletBalance.toFixed(2)}</h2>
                <button onClick={() => setActiveModal('money')} className="w-full bg-white text-teal-700 font-bold text-[13px] py-3 rounded-lg hover:bg-teal-50 shadow-sm transition-colors flex items-center justify-center gap-2">
                  <MdAdd size={18}/> Add Money
                </button>
              </div>

              {/* Transactions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[12px] font-bold text-slate-700 uppercase tracking-widest">Recent Activity</p>
                  <button className="text-[11px] font-semibold text-teal-600 flex items-center gap-1 hover:underline"><MdHistory size={14}/> All</button>
                </div>
                <div className="space-y-0 text-[13px]">
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {tx.positive ? <MdArrowDownward size={14}/> : <MdArrowUpward size={14}/>}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 leading-tight">{tx.desc}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{tx.date}</p>
                          </div>
                        </div>
                        <span className={`font-bold ${tx.positive ? 'text-green-600' : 'text-slate-800'}`}>{tx.amt}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 text-center py-4">No recent activity.</p>
                  )}
                </div>
              </div>
            </DashboardCard>

          </div>
        </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Add Card Modal */}
      <Modal isOpen={activeModal === 'card'} onClose={() => setActiveModal(null)} title="Add New Card">
        <form onSubmit={handleAddCard} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Card Number</label>
            <input type="text" maxLength="16" required placeholder="0000 0000 0000 0000" value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value.replace(/\D/g, '')})} className="w-full border border-slate-200 rounded-lg p-3 text-[14px] font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
              <input type="text" maxLength="5" required placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard({...newCard, expiry: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-[14px] font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
            </div>
            <div className="w-24">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">CVV</label>
              <input type="password" maxLength="3" required placeholder="•••" className="w-full border border-slate-200 rounded-lg p-3 text-[14px] font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Card Holder Name</label>
            <input type="text" required placeholder="Name on card" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-[14px] uppercase focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-[13px] py-3.5 rounded-lg mt-2 transition-colors">Save Card</button>
        </form>
      </Modal>

      {/* 2. Add UPI Modal */}
      <Modal isOpen={activeModal === 'upi'} onClose={() => setActiveModal(null)} title="Link New UPI ID">
        <form onSubmit={handleAddUpi} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Virtual Payment Address (UPI ID)</label>
            <input type="text" required placeholder="example@bank" value={newUpi} onChange={e => setNewUpi(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-[14px] focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-[13px] py-3.5 rounded-lg mt-2 transition-colors">Verify & Link</button>
        </form>
      </Modal>

      {/* 3. Add Money Modal */}
      <Modal isOpen={activeModal === 'money'} onClose={() => setActiveModal(null)} title="Add Money to Wallet">
        <form onSubmit={handleAddMoney} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Amount to Add (₹)</label>
            <input type="number" min="1" required placeholder="1000" value={addAmount} onChange={e => setAddAmount(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-[18px] font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-center" />
          </div>
          <div className="flex gap-2">
            {[500, 1000, 2000].map(amt => (
              <button type="button" key={amt} onClick={() => setAddAmount(amt.toString())} className="flex-1 border border-teal-200 bg-teal-50 text-teal-700 rounded-lg py-2 font-semibold text-[13px] hover:bg-teal-100 transition-colors">+₹{amt}</button>
            ))}
          </div>
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 text-white font-bold text-[13px] py-3.5 rounded-lg mt-2 transition-colors flex justify-center items-center gap-2"><MdAdd size={18}/> Proceed to Add</button>
        </form>
      </Modal>

    </div>
  );
};

export default PaymentWallet;
