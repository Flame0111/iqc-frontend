import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2, Minimize2, Maximize2, Cpu, Check, Activity, Clock, User, ShieldCheck, Edit2 } from 'lucide-react';
import { API_URL } from '../App.jsx'; 

export default function HomePage({ auth, triggerRefresh }) {
  const [listData, setListData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pass_count: 0, fail_count: 0 });
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [pinChangeQueue, setPinChangeQueue] = useState([]);

  const iqcStatusOptions = ["Awaiting", "Done", "Return to store", "waiting part", "Need more data", "Return to production"];

  const fetchData = () => {
    fetch(`${API_URL}/api/iqc-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json())
      .then(data => { if (data.success) { setListData(data.data); setStats(data.stats); } })
      .catch(err => console.error(err));
    
    fetch(`${API_URL}/api/pin-change-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json())
      .then(data => { if (data.success) { setPinChangeQueue(data.data); } setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [triggerRefresh]);

  const handleMainStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/api/iqc-status/${id}`, { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${auth.token}`, 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: newStatus }) 
      });
      fetchData();
    } catch(err) { console.error(err); }
  };

  const handleCompletePinRequest = async (id) => {
    try {
      await fetch(`${API_URL}/api/pin-change-complete/${id}`, { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${auth.token}` } 
      });
      fetchData();
    } catch(err) { console.error(err); }
  };

  const handleDeleteMainIqc = async (id) => {
    if(!window.confirm("Admin Warning: Confirm permanent deletion?")) return;
    try {
      await fetch(`${API_URL}/api/iqc/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${auth.token}` }});
      fetchData();
    } catch(err) { console.error(err); }
  };

  const handleDeletePinRequest = async (id) => {
    if(!window.confirm("Admin Warning: ยืนยันการลบคิว Request เปลี่ยนพินชิ้นนี้?")) return;
    try {
      await fetch(`${API_URL}/api/pin-change/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${auth.token}` }});
      fetchData();
    } catch (err) { console.error(err); }
  };

  const getWW = (dateString) => {
    if(!dateString) return "-";
    const d = new Date(dateString);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return "W" + Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Awaiting': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse';
      case 'Return to production': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'; 
    }
  };

  const unifiedQueue = [
    ...listData.map(item => ({
      ...item,
      queueType: 'IQC Check',
      displayId: `IQC-${item.id}`,
      details: item.hw_name || item.invoice_no || '-',
      operator: item.owner || item.send_by || '-',
      currentStatus: item.job_status || 'Awaiting',
      remark: item.checklist_data?.probDesc || '-'
    })),
    ...pinChangeQueue.map(item => ({
      ...item,
      queueType: 'Pin Changing',
      displayId: `PC-${item.id}`,
      details: item.customer_name ? `Pin: ${item.pin_no} (${item.customer_name})` : `Pin: ${item.pin_no}`,
      operator: item.req_name || item.requested_by || '-',
      currentStatus: item.status || 'Pending',
      remark: 'Pin Change Request'
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full items-start fade-in pb-20">
      
      {/* LEFT: MAIN DASHBOARD */}
      <div className="w-full lg:w-[76%] flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                <Activity size={20} className="text-indigo-400" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Operations</h1>
            </div>
            <p className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase pl-1">Live Factory Stream • WW {getWW(new Date())}</p>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
            <div className="px-5 py-1 text-center border-r border-white/5">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Queue</p>
              <p className="text-xl font-black text-white">{unifiedQueue.length}</p>
            </div>
            <div className="px-5 py-1 text-center border-r border-white/5">
              <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Pass</p>
              <p className="text-xl font-black text-emerald-400">{stats.pass_count}</p>
            </div>
            <div className="px-5 py-1 text-center border-r border-white/5">
              <p className="text-[9px] font-black text-rose-500/50 uppercase tracking-widest mb-1">Fail</p>
              <p className="text-xl font-black text-rose-400">{stats.fail_count}</p>
            </div>
            <button onClick={() => window.location.href = '/form'} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl border border-indigo-500/50 hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap">
              + New IQC
            </button>
            <button onClick={() => setIsCompact(!isCompact)} className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/50 hover:bg-white/10 transition-all">
              {isCompact ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-[#0c0c0e] rounded-[32px] border border-white/5 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="py-5 px-6 text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Type</th>
                  <th className="py-5 px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">M/C No.</th>
                  <th className="py-5 px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Operator</th>
                  <th className="py-5 px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Details</th>
                  <th className="py-5 px-4 text-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] bg-indigo-500/5">Workflow</th>
                  <th className="py-5 px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">WW</th>
                  <th className="py-5 px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Inspector</th>
                  <th className="py-5 px-4 w-20 text-center text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading ? (
                  <tr><td colSpan="8" className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" /><p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Establishing Secure Link...</p></td></tr>
                ) : (
                  unifiedQueue.map((row) => (
                    <tr key={row.displayId} className="hover:bg-white/[0.02] transition-all group">
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border ${row.queueType === 'IQC Check' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'}`}>
                          {row.queueType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-sm text-white/90">{row.location || '-'}</td>
                      <td className="py-4 px-4 text-xs font-bold text-white/50 flex items-center gap-2"><User size={12}/> {row.operator}</td>
                      <td className="py-4 px-4 text-xs font-bold text-white leading-relaxed">{row.details}</td>
                      <td className="py-4 px-4 text-center bg-indigo-500/[0.02]">
                         {row.queueType === 'IQC Check' ? (
                           <select 
                            value={row.currentStatus} 
                            onChange={(e) => handleMainStatusChange(row.id, e.target.value)}
                            className={`bg-transparent outline-none cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border text-center transition-all ${getStatusColor(row.currentStatus)}`}
                           >
                             {row.currentStatus === 'Draft' && <option value="Draft" className="bg-[#161b22] text-yellow-400">Draft</option>}
                             {iqcStatusOptions.map(opt => <option key={opt} value={opt} className="bg-[#161b22] text-white">{opt}</option>)}
                           </select>
                         ) : (
                           <button 
                            disabled={row.currentStatus === 'Done'}
                            onClick={() => handleCompletePinRequest(row.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border uppercase transition-all ${row.currentStatus === 'Done' ? 'opacity-30 border-white/10 text-white' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500 hover:text-white'}`}
                           >
                            {row.currentStatus === 'Done' ? 'Finished' : 'Mark Done'}
                           </button>
                         )}
                      </td>
                      <td className="py-4 px-4 text-[11px] font-bold text-white/30">{getWW(row.created_at)}</td>
                      <td className="py-4 px-4 text-xs font-black text-indigo-400/80 italic">{row.checked_by || row.accepted_by || '-'}</td>
                      
                      <td className="py-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-2">
                        {row.queueType === 'IQC Check' && (row.currentStatus === 'Draft' || row.currentStatus === 'Awaiting') && (
                          <button onClick={() => window.location.href = `/form?edit=${row.id}`} className="text-indigo-400/50 hover:text-indigo-400 p-1.5 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Continue Draft"><Edit2 size={16}/></button>
                        )}
                        {auth.role === 'admin' && (
                          <button onClick={() => row.queueType === 'IQC Check' ? handleDeleteMainIqc(row.id) : handleDeletePinRequest(row.id)} className="text-white/20 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT: ACTION SIDEBAR */}
      <div className="w-full lg:w-[24%] flex flex-col gap-6">
        <div className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 rounded-[32px] border border-white/10 p-7 shadow-2xl backdrop-blur-3xl sticky top-28">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={14} className="text-fuchsia-400" /> Pending Tasks
              </h2>
              <span className="bg-rose-500/20 text-rose-500 px-2.5 py-1 rounded-lg text-[10px] font-black animate-pulse">
                {unifiedQueue.filter(q => q.currentStatus === 'Pending' || q.currentStatus === 'Awaiting').length}
              </span>
           </div>

           <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
              {unifiedQueue.filter(q => q.currentStatus === 'Pending' || q.currentStatus === 'Awaiting').length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                   <ShieldCheck size={32} className="text-emerald-500/20 mx-auto mb-3" />
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">All System Secured</p>
                </div>
              ) : (
                unifiedQueue.filter(q => q.currentStatus === 'Pending' || q.currentStatus === 'Awaiting').map((task) => (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    key={task.displayId} 
                    className="p-5 bg-black/40 rounded-[24px] border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 bg-indigo-500/10 rounded-bl-xl text-[8px] font-black text-indigo-400 opacity-50 uppercase">{task.displayId}</div>
                    <div className="flex items-center gap-3 mb-3">
                       <span className={`w-2 h-2 rounded-full animate-ping ${task.queueType === 'IQC Check' ? 'bg-blue-500' : 'bg-fuchsia-500'}`}></span>
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{task.queueType}</span>
                    </div>
                    <p className="text-sm font-black text-white mb-1">{task.location}</p>
                    <p className="text-[11px] font-bold text-white/50 mb-4 line-clamp-1">{task.details}</p>
                    <div className="flex justify-between items-center text-[10px] font-black text-white/30 uppercase border-t border-white/5 pt-3 group-hover:border-indigo-500/20 transition-all">
                       <span>WW {getWW(task.created_at)}</span>
                       <span className="text-indigo-400">{task.operator}</span>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>

    </div>
  );
}
