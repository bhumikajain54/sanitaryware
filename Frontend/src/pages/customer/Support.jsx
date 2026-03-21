import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdOutlineHelpOutline, MdAdd, MdSearch, MdFilterList,
  MdChatBubbleOutline, MdCheckCircleOutline, MdAccessTime,
  MdErrorOutline, MdSend, MdAttachFile, MdClose,
  MdPerson, MdDelete, MdOutlineSync
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';
import { Card, Badge } from '../../components/common/DashboardUI';

const Support = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketList, setTicketList] = useState([]);
  const [copiedType, setCopiedType] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [chatFiles, setChatFiles] = useState([]);
  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);

  useEffect(() => { setTicketList([]); }, []);

  const handleFileChange = (e, type = 'ticket') => {
    const files = Array.from(e.target.files);
    type === 'ticket' ? setAttachedFiles(p => [...p, ...files]) : setChatFiles(p => [...p, ...files]);
  };
  const removeFile = (index, type = 'ticket') => {
    type === 'ticket'
      ? setAttachedFiles(p => p.filter((_, i) => i !== index))
      : setChatFiles(p => p.filter((_, i) => i !== index));
  };
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const [newTicket, setNewTicket] = useState({
    category: 'Delivery Issues', priority: 'Medium', subject: '', description: ''
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerService.createContactInquiry({
        name: user?.name || 'Customer', email: user?.email || '',
        subject: `[${newTicket.category}] ${newTicket.subject}`,
        message: newTicket.description
      });
      toast.success('Support inquiry submitted successfully');
      setActiveTab('tickets');
      setNewTicket({ category: 'Delivery Issues', priority: 'Medium', subject: '', description: '' });
      setAttachedFiles([]);
    } catch (err) {
      toast.error(err.message || 'Failed to submit inquiry');
    } finally { setLoading(false); }
  };

  const updateTicketStatus = (id, newStatus) => {
    setTicketList(p => p.map(t => t.id === id ? { ...t, status: newStatus, lastUpdate: 'Just now' } : t));
    if (selectedTicket?.id === id) setSelectedTicket(p => ({ ...p, status: newStatus }));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && chatFiles.length === 0) return;
    const msg = {
      id: Date.now(), sender: 'user', text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: [...chatFiles]
    };
    setTicketList(p => p.map(t => t.id === selectedTicket.id ? { ...t, messages: [...t.messages, msg], lastUpdate: 'Just now' } : t));
    setSelectedTicket(p => ({ ...p, messages: [...p.messages, msg], lastUpdate: 'Just now' }));
    setNewMessage(''); setChatFiles([]);
  };

  const activeTicketsCount = ticketList.filter(t => t.status !== 'Resolved').length;
  const resolvedTicketsCount = ticketList.filter(t => t.status === 'Resolved').length;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return <Badge variant="info" className="gap-1 sm:gap-1.5 text-[9px] sm:text-[10px]"><MdAccessTime size={10} />Open</Badge>;
      case 'resolved': return <Badge variant="success" className="gap-1 sm:gap-1.5 text-[9px] sm:text-[10px]"><MdCheckCircleOutline size={10} />Resolved</Badge>;
      case 'in progress': return <Badge variant="warning" className="gap-1 sm:gap-1.5 text-[9px] sm:text-[10px]"><MdOutlineSync size={10} />In Progress</Badge>;
      default: return <Badge variant="neutral" className="text-[9px] sm:text-[10px]">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority) => ({
    critical: 'text-rose-600 bg-rose-50',
    high: 'text-amber-600 bg-amber-50',
    medium: 'text-blue-600 bg-blue-50'
  }[priority?.toLowerCase()] || 'text-slate-600 bg-slate-50');

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 max-w-[1200px] mx-auto">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2 sm:gap-3">
            <MdOutlineHelpOutline className="text-teal-600 flex-shrink-0 text-xl sm:text-2xl md:text-3xl" />
            <span className="truncate">Help & Support</span>
          </h1>
          <p className="text-[10px] sm:text-sm md:text-base text-[var(--text-muted)] font-medium mt-0.5 sm:mt-1">
            Track your requests or raise a new ticket.
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 bg-[var(--bg-card)] p-1 rounded-xl sm:rounded-2xl shadow-sm border border-[var(--border-main)] w-full sm:w-auto flex-shrink-0">
          {[{ id: 'tickets', label: 'My Tickets' }, { id: 'new', label: 'New Ticket' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2 md:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/10'
                : 'text-[var(--text-muted)] hover:bg-[var(--border-subtle)]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ─── Tickets Tab ─── */}
        {activeTab === 'tickets' ? (
          <motion.div key="tickets"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-4 sm:space-y-5 md:space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {[
                { label: 'Active Tickets', value: activeTicketsCount.toString(), icon: MdChatBubbleOutline, color: 'text-teal-600' },
                { label: 'Resolved Tickets', value: resolvedTicketsCount.toString(), icon: MdCheckCircleOutline, color: 'text-emerald-600' },
                { label: 'Avg. Response Time', value: '4h', icon: MdAccessTime, color: 'text-blue-600' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Card key={i} className="flex items-center gap-2 sm:gap-3 md:gap-4 py-2.5 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-4">
                    <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-[var(--border-subtle)] ${stat.color} flex-shrink-0`}>
                      <Icon className="text-base sm:text-lg md:text-xl lg:text-2xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate hidden sm:block">{stat.label}</p>
                      <p className="text-[7px] sm:hidden font-bold text-[var(--text-muted)] uppercase truncate">{stat.label.split(' ')[0]}</p>
                      <p className="text-base sm:text-xl md:text-2xl font-black text-[var(--text-main)]">{stat.value}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base sm:text-lg md:text-xl" />
                <input type="text" placeholder="Search tickets..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-11 md:pl-12 pr-4 py-2.5 sm:py-2.5 md:py-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-xs sm:text-sm md:text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                />
              </div>
              <div className="relative flex-shrink-0">
                <button onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-2.5 md:py-3 border rounded-xl text-[10px] sm:text-xs md:text-sm font-bold transition-all w-full sm:w-auto justify-center ${statusFilter !== 'All'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/10'
                    : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)]'
                    }`}
                >
                  <MdFilterList className="text-base sm:text-lg md:text-xl flex-shrink-0" />
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
                        className="absolute right-0 mt-2 w-44 sm:w-48 bg-[var(--bg-card)] rounded-xl sm:rounded-2xl shadow-2xl border border-[var(--border-main)] py-1.5 sm:py-2 z-20 overflow-hidden"
                      >
                        {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
                          <button key={status} onClick={() => { setStatusFilter(status); setShowFilterMenu(false); }}
                            className={`w-full text-left px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-colors ${statusFilter === status ? 'bg-teal-500/10 text-teal-600' : 'text-[var(--text-muted)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
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

            {/* ─── Tickets Table — layout preserved, only cell spacing responsive ─── */}
            <Card noPadding className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[540px]">
                  <thead>
                    <tr className="bg-[var(--border-subtle)] border-b border-[var(--border-main)] text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4">Ticket Info</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4">Category</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4">Priority</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4">Status</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {ticketList
                      .filter(t =>
                        (t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (statusFilter === 'All' || t.status === statusFilter)
                      )
                      .map(t => (
                        <tr key={t.id} className="hover:bg-[var(--border-subtle)] transition-colors group">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-[var(--text-main)] mb-0.5 sm:mb-1 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{t.id}</p>
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-[var(--text-muted)]">{t.subject}</p>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-[var(--text-muted)]">{t.category}</span>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                            <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider ${getPriorityColor(t.priority)}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                            {getStatusBadge(t.status)}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-right">
                            <button onClick={() => { setSelectedTicket(t); setShowChat(true); }}
                              className="text-[10px] sm:text-xs md:text-sm font-bold text-teal-600 hover:underline whitespace-nowrap"
                            >
                              View Chat
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                    {/* Empty state inside table */}
                    {ticketList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 sm:py-12 md:py-16 text-center">
                          <MdChatBubbleOutline className="mx-auto text-4xl sm:text-5xl text-[var(--text-muted)] opacity-20 mb-3" />
                          <p className="text-[10px] sm:text-xs md:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">No tickets found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

        ) : (
          /* ─── New Ticket Tab ─── */
          <motion.div key="new"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-7 lg:gap-8"
          >
            <Card className="lg:col-span-2 p-4 sm:p-5 md:p-6 lg:p-8">
              <form onSubmit={handleSubmitTicket} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Category</label>
                    <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-xs sm:text-sm text-[var(--text-main)]"
                    >
                      {['Delivery Issues', 'Product Defect', 'Installation Help', 'Billing & Payment', 'Warranty Claim', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Priority</label>
                    <div className="flex gap-1.5 sm:gap-2">
                      {['Low', 'Medium', 'High'].map(p => (
                        <button key={p} type="button" onClick={() => setNewTicket({ ...newTicket, priority: p })}
                          className={`flex-1 py-2.5 sm:py-3 px-1 sm:px-2 border rounded-xl text-[9px] sm:text-[10px] md:text-xs font-bold transition-all ${newTicket.priority === p
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

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Subject</label>
                  <input type="text" value={newTicket.subject} required
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Briefly describe the issue"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-xs sm:text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Detailed Description</label>
                  <textarea rows={5} value={newTicket.description} required
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Tell us more about the issue. Include order ID if applicable."
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium resize-none text-xs sm:text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleFileChange(e, 'ticket')} />
                    <button type="button" onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 text-[var(--text-muted)] font-bold hover:text-teal-600 transition-colors group text-xs sm:text-sm"
                    >
                      <MdAttachFile className="text-base sm:text-xl group-hover:rotate-12 transition-transform flex-shrink-0" />
                      Attach Files / Images
                    </button>
                    <button type="submit" disabled={loading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-teal-600 text-white rounded-xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all group text-[10px] sm:text-xs md:text-sm disabled:opacity-60"
                    >
                      {loading ? 'Submitting...' : 'Submit Ticket'}
                      <MdSend className="text-sm sm:text-base md:text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                    </button>
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 p-3 sm:p-4 bg-[var(--bg-app)] rounded-xl sm:rounded-2xl border border-dashed border-[var(--border-main)]">
                      {attachedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-1.5 sm:gap-2 bg-[var(--bg-card)] px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--border-main)] shadow-sm">
                          <span className="text-[9px] sm:text-xs font-bold text-[var(--text-muted)] truncate max-w-[100px] sm:max-w-[120px]">{file.name}</span>
                          <button type="button" onClick={() => removeFile(i, 'ticket')} className="text-[var(--text-muted)] hover:text-rose-500 flex-shrink-0">
                            <MdDelete className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none p-4 sm:p-5 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                  <MdErrorOutline className="text-teal-400 flex-shrink-0" />
                  Average Response
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6 font-medium">
                  Our specialists usually respond within{' '}
                  <span className="text-white font-bold underline decoration-teal-500 underline-offset-4">4 hours</span>
                  {' '}during business hours (10AM – 8PM).
                </p>
                <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-teal-500 rounded-full" />
                </div>
              </Card>

              <Card className="p-4 sm:p-5 md:p-6">
                <h3 className="text-[var(--text-main)] font-bold text-xs sm:text-sm md:text-base mb-3 sm:mb-4">Support Channels</h3>
                <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                  {[
                    { href: 'tel:+917974047116', label: 'Direct Call', type: 'tel', copy: '+917974047116', bg: 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20', hover: 'hover:bg-teal-500/5 hover:border-teal-500', icon: MdAccessTime },
                    { href: 'https://mail.google.com/mail/?view=cm&fs=1&to=sajaljn0@gmail.com', label: 'Email Support', type: 'email', copy: 'sajaljn0@gmail.com', bg: 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20', hover: 'hover:bg-purple-500/5 hover:border-purple-500', icon: MdChatBubbleOutline, target: '_blank' }
                  ].map(ch => (
                    <a key={ch.type} href={ch.href} target={ch.target} rel={ch.target ? 'noopener noreferrer' : undefined}
                      onClick={() => handleCopy(ch.copy, ch.type)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-[var(--border-main)] ${ch.hover} transition-all group`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ${ch.bg} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors`}>
                          <ch.icon className="text-sm sm:text-base" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] truncate">{ch.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {copiedType === ch.type && <span className="text-[9px] sm:text-[10px] font-bold text-teal-600 animate-pulse">Copied!</span>}
                        <MdAdd className="rotate-45 text-[var(--text-muted)] group-hover:text-teal-600 transition-colors text-base sm:text-lg" />
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Chat Modal ─── */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-card)] w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-[var(--border-main)]"
            >
              {/* Chat Header */}
              <div className="bg-slate-900 dark:bg-[var(--bg-app)] px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 md:py-8 text-white flex-shrink-0">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-base md:text-xl font-bold text-white flex-shrink-0">ST</div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm sm:text-base md:text-lg lg:text-xl leading-tight">Support Desk</h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                        <p className="text-teal-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{selectedTicket?.id}</p>
                        <span className="w-1 h-1 bg-slate-700 rounded-full flex-shrink-0" />
                        {getStatusBadge(selectedTicket?.status || '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {selectedTicket?.status !== 'Resolved' && (
                      <button onClick={() => updateTicketStatus(selectedTicket.id, 'Resolved')}
                        className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                      >
                        <MdCheckCircleOutline className="text-sm flex-shrink-0" /> Mark Resolved
                      </button>
                    )}
                    <button onClick={() => setShowChat(false)}
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0"
                    >
                      <MdClose className="text-base sm:text-lg md:text-xl" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 bg-[var(--bg-app)]">
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                  <p className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-[var(--border-subtle)] rounded-full text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Conversation Started on {selectedTicket?.date}
                  </p>
                </div>
                {(selectedTicket?.messages || []).map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] sm:max-w-[80%] flex items-end gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-900 dark:bg-[var(--bg-card)] text-white border border-[var(--border-main)]'
                        }`}>
                        {msg.sender === 'user' ? <MdPerson className="text-sm" /> : <MdChatBubbleOutline className="text-xs sm:text-sm" />}
                      </div>
                      <div className={`p-3 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium shadow-sm ${msg.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-[var(--bg-card)] text-[var(--text-main)] rounded-bl-none border border-[var(--border-main)]'
                        }`}>
                        {msg.text}
                        <p className={`text-[8px] sm:text-[9px] mt-1 text-right font-bold uppercase opacity-60 ${msg.sender === 'user' ? 'text-teal-50' : 'text-[var(--text-muted)]'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-[var(--bg-card)] border-t border-[var(--border-main)] space-y-2 sm:space-y-3 md:space-y-4 flex-shrink-0">
                {chatFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {chatFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-[var(--bg-app)] px-2 py-1 rounded-md border border-[var(--border-main)]">
                        <span className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] truncate max-w-[80px] sm:max-w-[100px]">{file.name}</span>
                        <button onClick={() => removeFile(i, 'chat')} className="text-[var(--text-muted)] hover:text-rose-500 flex-shrink-0">
                          <MdDelete className="text-xs sm:text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2.5 sm:gap-3 md:gap-4 items-center bg-[var(--bg-app)] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                  <input type="file" ref={chatFileInputRef} className="hidden" multiple onChange={(e) => handleFileChange(e, 'chat')} />
                  <button onClick={() => chatFileInputRef.current.click()}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-teal-600 transition-colors flex-shrink-0"
                  >
                    <MdAttachFile className="text-base sm:text-lg md:text-xl" />
                  </button>
                  <input type="text" placeholder="Type your message..."
                    value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-[var(--text-main)] py-2 sm:py-3"
                  />
                  <button onClick={handleSendMessage}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-teal-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-teal-700 shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex-shrink-0"
                  >
                    <MdSend className="text-sm sm:text-base md:text-lg" />
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