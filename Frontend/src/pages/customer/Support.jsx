import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdOutlineHelpOutline, 
  MdAdd, 
  MdSearch, 
  MdFilterList, 
  MdChatBubbleOutline,
  MdCheckCircleOutline,
  MdAccessTime,
  MdErrorOutline,
  MdSend,
  MdAttachFile,
  MdClose,
  MdPerson,
  MdDelete,
  MdOutlineSync
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';
import { Card, Badge } from '../../components/common/DashboardUI';

const Support = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'new'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketList, setTicketList] = useState([]);
  
  useEffect(() => {
    // Note: The backend currently only supports admin viewing all inquiries.
    // This is a placeholder for when customer-specific inquiries are available.
    setTicketList([]);
  }, []);

  const [copiedType, setCopiedType] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [chatFiles, setChatFiles] = useState([]);
  
  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);

  const handleFileChange = (e, type = 'ticket') => {
    const files = Array.from(e.target.files);
    if (type === 'ticket') {
      setAttachedFiles(prev => [...prev, ...files]);
    } else {
      setChatFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index, type = 'ticket') => {
    if (type === 'ticket') {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setChatFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const [newTicket, setNewTicket] = useState({
    category: 'Delivery Issues',
    priority: 'Medium',
    subject: '',
    description: ''
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await customerService.createContactInquiry({
            name: user?.name || 'Customer',
            email: user?.email || '',
            subject: `[${newTicket.category}] ${newTicket.subject}`,
            message: newTicket.description
        });
        toast.success('Support inquiry submitted successfully');
        setActiveTab('tickets');
        setNewTicket({ category: 'Delivery Issues', priority: 'Medium', subject: '', description: '' });
        setAttachedFiles([]);
    } catch (err) {
        toast.error(err.message || 'Failed to submit inquiry');
    } finally {
        setLoading(false);
    }
  };

  const updateTicketStatus = (id, newStatus) => {
    setTicketList(prev => prev.map(t => 
      t.id === id ? { ...t, status: newStatus, lastUpdate: 'Just now' } : t
    ));
    if (selectedTicket?.id === id) {
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
    }
  };

  const activeTicketsCount = ticketList.filter(t => t.status !== 'Resolved').length;
  const resolvedTicketsCount = ticketList.filter(t => t.status === 'Resolved').length;

  const handleSendMessage = () => {
    if (!newMessage.trim() && chatFiles.length === 0) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: [...chatFiles]
    };

    setTicketList(prev => prev.map(t => 
      t.id === selectedTicket.id 
      ? { ...t, messages: [...t.messages, newMsg], lastUpdate: 'Just now' } 
      : t
    ));

    setSelectedTicket(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg],
      lastUpdate: 'Just now'
    }));

    setNewMessage('');
    setChatFiles([]);
  };


  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return (
        <Badge variant="info" className="gap-1.5">
          <MdAccessTime size={12} />
          Open
        </Badge>
      );
      case 'resolved': return (
        <Badge variant="success" className="gap-1.5">
          <MdCheckCircleOutline size={12} />
          Resolved
        </Badge>
      );
      case 'in progress': return (
        <Badge variant="warning" className="gap-1.5">
          <MdOutlineSync size={12} className="animate-spin-slow" />
          In Progress
        </Badge>
      );
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-rose-600 bg-rose-50';
      case 'high': return 'text-amber-600 bg-amber-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
            <MdOutlineHelpOutline className="text-teal-600" />
            Help & Support
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-medium mt-1">Track your requests or raise a new ticket.</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 bg-[var(--bg-card)] p-1 rounded-2xl shadow-sm border border-[var(--border-main)]">
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === 'tickets' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            My Tickets
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === 'new' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            New Ticket
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tickets' ? (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { label: 'Active Tickets', value: activeTicketsCount.toString(), icon: MdChatBubbleOutline, color: 'text-teal-600' },
                { label: 'Resolved Tickets', value: resolvedTicketsCount.toString(), icon: MdCheckCircleOutline, color: 'text-emerald-600' },
                { label: 'Avg. Response Time', value: '4h', icon: MdAccessTime, color: 'text-blue-600' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Card key={i} className="flex items-center gap-3 md:gap-4 py-3 md:py-4">
                    <div className={`p-2.5 md:p-3 rounded-xl bg-[var(--border-subtle)] ${stat.color}`}>
                      <Icon className="text-xl md:text-2xl" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
                      <p className="text-xl md:text-2xl font-black text-[var(--text-main)]">{stat.value}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Ticket List Controls */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-lg md:text-xl" />
                <input 
                  type="text" 
                  placeholder="Search tickets..." 
                  className="w-full pl-11 md:pl-12 pr-4 py-2.5 md:py-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-sm md:text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 border rounded-xl text-xs md:text-sm font-bold transition-all ${
                    statusFilter !== 'All' 
                    ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/10' 
                    : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <MdFilterList className="text-lg md:text-xl" />
                  {statusFilter === 'All' ? 'Filter' : statusFilter}
                </button>

                <AnimatePresence>
                  {showFilterMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-main)] py-2 z-20 overflow-hidden"
                      >
                        {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status);
                              setShowFilterMenu(false);
                            }}
                            className={`w-full text-left px-5 py-2.5 text-sm font-bold transition-colors ${
                              statusFilter === status 
                              ? 'bg-teal-500/10 text-teal-600' 
                              : 'text-[var(--text-muted)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tickets Grid/Table */}
            <Card noPadding className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[var(--border-subtle)] border-b border-[var(--border-main)] text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
                      <th className="px-6 py-4">Ticket Info</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {ticketList
                      .filter(t => {
                        const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                             t.subject.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesFilter = statusFilter === 'All' || t.status === statusFilter;
                        return matchesSearch && matchesFilter;
                      })
                      .map((t) => (
                      <tr key={t.id} className="hover:bg-[var(--border-subtle)] transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-[var(--text-main)] mb-1 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{t.id}</p>
                          <p className="text-sm font-medium text-[var(--text-muted)]">{t.subject}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold text-[var(--text-muted)]">{t.category}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getPriorityColor(t.priority)} bg-opacity-10`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(t.status)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => { setSelectedTicket(t); setShowChat(true); }}
                            className="text-sm font-bold text-teal-600 hover:underline"
                          >
                            View Chat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <Card className="lg:col-span-2 p-8">
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Category</label>
                    <select 
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-[var(--text-main)]"
                    >
                      <option>Delivery Issues</option>
                      <option>Product Defect</option>
                      <option>Installation Help</option>
                      <option>Billing & Payment</option>
                      <option>Warranty Claim</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Priority</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map((p) => (
                        <button 
                          key={p}
                          type="button"
                          onClick={() => setNewTicket({ ...newTicket, priority: p })}
                          className={`flex-1 py-3 px-2 border rounded-xl text-xs font-bold transition-all ${
                            newTicket.priority === p 
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/10' 
                            : 'border-[var(--border-main)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Subject</label>
                  <input 
                    type="text" 
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Briefly describe the issue"
                    required
                    className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Detailed Description</label>
                  <textarea 
                    rows="6"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Tell us more about the issue. Include order ID if applicable."
                    required
                    className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium resize-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                  ></textarea>
                </div>

            <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      onChange={(e) => handleFileChange(e, 'ticket')}
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 text-[var(--text-muted)] font-bold hover:text-teal-600 transition-colors group"
                    >
                      <MdAttachFile className="text-xl group-hover:rotate-12 transition-transform" />
                      Attach Files / Images
                    </button>
                    <button className="w-full md:w-auto px-10 py-4 bg-teal-600 text-white rounded-xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 group">
                      Submit Ticket
                      <MdSend className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                  
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 p-4 bg-[var(--bg-app)] rounded-2xl border border-dashed border-[var(--border-main)]">
                      {attachedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[var(--bg-card)] px-3 py-1.5 rounded-lg border border-[var(--border-main)] shadow-sm">
                          <span className="text-xs font-bold text-[var(--text-muted)] truncate max-w-[120px]">{file.name}</span>
                          <button 
                            type="button"
                            onClick={() => removeFile(i, 'ticket')}
                            className="text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <MdErrorOutline className="text-teal-400" />
                  Average Response
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                  Our specialists usually respond within <span className="text-white font-bold underline decoration-teal-500 underline-offset-4">4 hours</span> during business hours (10AM - 8PM).
                </p>
                <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-teal-500" />
                </div>
              </Card>

              <Card>
                <h3 className="text-[var(--text-main)] font-bold mb-4">Support Channels</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <a 
                      href="tel:+917974047116" 
                      onClick={() => handleCopy('+917974047116', 'tel')}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-main)] hover:bg-teal-500/5 hover:border-teal-500 transition-all group w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <MdAccessTime />
                        </div>
                        <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)]">Direct Call</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedType === 'tel' && <span className="text-[10px] font-bold text-teal-600 animate-pulse">Copied!</span>}
                        <MdAdd className="rotate-45 text-[var(--text-muted)] group-hover:text-teal-600 transition-colors" />
                      </div>
                    </a>
                  </div>

                  <div className="relative">
                    <a 
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=sajaljn0@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopy('sajaljn0@gmail.com', 'email')}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-main)] hover:bg-purple-500/5 hover:border-purple-500 transition-all group w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                          <MdChatBubbleOutline />
                        </div>
                        <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)]">Email Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedType === 'email' && <span className="text-[10px] font-bold text-purple-600 animate-pulse">Copied!</span>}
                        <MdAdd className="rotate-45 text-[var(--text-muted)] group-hover:text-purple-600 transition-colors" />
                      </div>
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-card)] w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-[var(--border-main)]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 dark:bg-[var(--bg-app)] p-6 md:p-8 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white">
                       ST
                    </div>
                    <div>
                      <h3 className="font-black text-lg md:text-xl leading-tight">Support Desk</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-teal-400 text-[10px] font-bold uppercase tracking-widest">{selectedTicket?.id}</p>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        {getStatusBadge(selectedTicket?.status || '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedTicket?.status !== 'Resolved' && (
                      <button 
                        onClick={() => updateTicketStatus(selectedTicket.id, 'Resolved')}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <MdCheckCircleOutline size={16} />
                        Mark Resolved
                      </button>
                    )}
                    <button 
                      onClick={() => setShowChat(false)}
                      className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <MdClose size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[var(--bg-app)]">
                <div className="text-center mb-8">
                   <p className="inline-block px-4 py-1.5 bg-[var(--border-subtle)] rounded-full text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Conversation Started on {selectedTicket?.date}</p>
                </div>

                {(selectedTicket?.messages || []).map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-900 dark:bg-[var(--bg-card)] text-white border border-[var(--border-main)]'}`}>
                        {msg.sender === 'user' ? <MdPerson /> : <MdChatBubbleOutline size={14} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${
                        msg.sender === 'user' 
                        ? 'bg-teal-600 text-white rounded-br-none' 
                        : 'bg-[var(--bg-card)] text-[var(--text-main)] rounded-bl-none border border-[var(--border-main)]'
                      }`}>
                        {msg.text}
                        <p className={`text-[9px] mt-1 text-right font-bold uppercase opacity-60 ${msg.sender === 'user' ? 'text-teal-50' : 'text-[var(--text-muted)]'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-[var(--bg-card)] border-t border-[var(--border-main)] space-y-4">
                {chatFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {chatFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[var(--bg-app)] px-2 py-1 rounded-md border border-[var(--border-main)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] truncate max-w-[100px]">{file.name}</span>
                        <button onClick={() => removeFile(i, 'chat')} className="text-[var(--text-muted)] hover:text-rose-500">
                          <MdDelete size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 items-center bg-[var(--bg-app)] p-2 rounded-2xl border border-[var(--border-main)]">
                  <input 
                    type="file" 
                    ref={chatFileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={(e) => handleFileChange(e, 'chat')}
                  />
                  <button 
                    onClick={() => chatFileInputRef.current.click()}
                    className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-teal-600 transition-colors"
                  >
                    <MdAttachFile size={20} />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[var(--text-main)] py-3"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center hover:bg-teal-700 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                  >
                    <MdSend size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Support;
