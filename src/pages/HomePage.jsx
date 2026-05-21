import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ListFilter, Loader2, Minimize2, Maximize2, Cpu, Bell, Check, Play, FileText, Settings } from 'lucide-react';
import { GlassCard } from '../components/UIComponents.jsx';
import { API_URL } from '../App.jsx'; 

export default function HomePage({ auth, triggerRefresh }) {
  const [listData, setListData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pass_count: 0, fail_count: 0 });
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [pinChangeQueue, setPinChangeQueue] = useState([]);

  const iqcStatusOptions = ["Awaiting", "Done", "Return to store", "waiting part", "Need more data", "Return to production"];
  const pinStatusOptions = ["Pending", "Done"];

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

  const handleDeleteMainIqc = async (id) => {
    if(!window.confirm("Admin Warning: ยืนยันการลบ Record IQC นี้ถาวร?")) return;
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

  const getWW = (dateString) => {
    if(!dateString) return "-";
    const d = new Date(dateString);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return "W" + Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Return to store': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Return to production': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; 
    }
  };

  const unifiedQueue = [
    ...listData.map(item => ({
      ...item,
      queueType: 'IQC Check',
      displayId: `IQC-${item.id}`,
      details: item.hw_name || item.invoice_no || '-',
      subDetails: item.serial_no ? `S/N: ${item.serial_no}` : '-',
      operator: item.owner || item.send_by || '-',
      currentStatus: item.job_status || 'Awaiting',
      remark: item.checklist_data?.probDesc || item.checklist_data?.preventAction || '-'
    })),
    ...pinChangeQueue.map(item => ({
      ...item,
      queueType: 'Pin Changing',
      displayId: `PC-${item.id}`,
      // 🌟 ดึงข้อมูล Customer มาต่อท้าย Pin 
      details: item.customer_name ? `Pin: ${item.pin_no} | Cust: ${item.customer_name}` : `Pin: ${item.pin_no}`,
      subDetails: item.stock_pin_no ? `Stock: ${item.stock_pin_no} | Socket: ${item.name_socket}` : '-',
      // 🌟 ดึงข้อมูล Req Name มาเป็น Operator (ถ้าไม่มีจะใช้บัญชีคน Login)
      operator: item.req_name || item.requested_by || '-',
      currentStatus: item.status || 'Pending',
      remark: 'Auto-Accepted Queue'
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const pendingCount = unifiedQueue.filter(q => q.currentStatus !== 'Done').length;

  return (
    <div className="w-full space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ListFilter className="text-[#6f7bf7]"/> 
            Primary Centralized Queue
            {pendingCount > 0 && (
              <span className="text-xs bg-rose-500 text-white px-2.5 py-1 rounded-full font-black animate-pulse shadow-lg">
                {pendingCount} ACTIVE QUEUES
              </span>
            )}
          </h1>
          <p className="text-white/40 text-sm mt-1">ศูนย์รวมคิวและตรวจสอบสถานะทุกประเภทภายในโรงงานแบบ Real-time (IQC & Pin Changing)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex gap-3 bg-black/40 border border-white/5 rounded-2xl p-2 px-4 shadow-inner">
            <div className="text-center px-3"><p className="text-[10px] font-bold text-white/40 uppercase">Total Items</p><p className="text-lg font-black text-white">{unifiedQueue.length}</p></div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center px-3"><p className="text-[10px] font-bold text-emerald-400/70 uppercase">IQC Pass</p><p className="text-lg font-black text-emerald-400">{stats.pass_count}</p></div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center px-3"><p className="text-[10px] font-bold text-rose-400/70 uppercase">IQC Fail</p><p className="text-lg font-black text-rose-400">{stats.fail_count}</p></div>
          </div>

          <button 
            onClick={() => setIsCompact(!isCompact)} 
            className={`flex items-center justify-center gap-2 h-[52px] px-4 rounded-xl text-xs font-black tracking-widest uppercase border transition-all no-print ${isCompact ? 'bg-[#6f7bf7]/20 border-[#6f7bf7] text-[#6f7bf7]' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
          >
            {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />} 
            <span className="hidden sm:block">{isCompact ? "NORMAL" : "COMPACT"}</span>
          </button>
        </div>
      </div>

      <GlassCard className="!p-4 overflow-hidden flex flex-col">
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 pb-2 custom-scrollbar">
          <table className="w-full text-sm min-w-[1200px] transition-all">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Queue Type</th>
                {/* 🌟 เปลี่ยน Loc เป็น M/C No. */}
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>M/C No.</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Queue ID</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>WW</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Date / Time</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Operator</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Primary Target Details</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Sub Identification</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-center font-black text-[#6f7bf7] uppercase tracking-wider bg-[#6f7bf7]/10`}>Status Workflow</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Completed At</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>Inspection By</th>
                <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider`}>System Remark</th>
                {auth.role === 'admin' && <th className="py-1.5 px-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="13" className="py-16 text-center text-[#6f7bf7] font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin w-8 h-8" />
                      <span className="text-white/40 text-xs tracking-widest uppercase">Fetching Live Stream Queues...</span>
                    </div>
                  </td>
                </tr>
              ) : unifiedQueue.length === 0 ? (
                <tr><td colSpan="13" className="py-12 text-center text-white/30 font-medium">No records found inside centralized pool.</td></tr>
              ) : (
                unifiedQueue.map((row) => (
                  <tr key={row.displayId} className="hover:bg-white/[0.04] transition-all duration-200 group">
                    <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-xs'} font-bold transition-all`}>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-black tracking-wider uppercase text-[10px] ${row.queueType === 'IQC Check' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'}`}>
                        {row.queueType === 'IQC Check' ? <FileText size={10}/> : <Settings size={10}/>}
                        {row.queueType}
                      </span>
                    </td>
                    
                    <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white/80 font-black`}>{row.location || '-'}</td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-sm'} font-bold text-white/40`}>#{row.displayId}</td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-sm'} text-white/60`}>{getWW(row.created_at)}</td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white/80 whitespace-nowrap`}>{new Date(row.created_at).toLocaleString('en-GB')}</td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white/80`}>{row.operator}</td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white font-bold`}>{row.details}</td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-xs'} text-white/60`}>{row.subDetails}</td>
                    
                    <td className="py-1 px-2 text-center bg-black/20">
                      {auth.role === 'viewer' ? (
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider border ${getStatusColor(row.currentStatus)}`}>
                          {row.currentStatus}
                        </span>
                      ) : row.queueType === 'IQC Check' ? (
                        <select 
                          value={row.currentStatus} 
                          onChange={(e) => handleMainStatusChange(row.id, e.target.value)}
                          className={`appearance-none outline-none cursor-pointer px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider border text-center transition-all ${getStatusColor(row.currentStatus)}`}
                        >
                          {iqcStatusOptions.map(opt => <option key={opt} value={opt} className="bg-[#1a1f35] text-white">{opt}</option>)}
                        </select>
                      ) : (
                        row.currentStatus === 'Pending' ? (
                          <button onClick={() => handleCompletePinRequest(row.id)} className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-1 mx-auto">
                            <Check size={10} strokeWidth={3} /> Mark Done
                          </button>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider border bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase mx-auto">
                            Finished
                          </span>
                        )
                      )}
                    </td>
                    
                    <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-sm'} text-white/60 whitespace-nowrap`}>
                      {row.currentStatus === 'Done' ? (row.completed_at ? new Date(row.completed_at).toLocaleDateString('en-GB') : new Date(row.created_at).toLocaleDateString('en-GB')) : '-'}
                    </td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-emerald-400 font-medium`}>{row.checked_by || row.accepted_by || '-'}</td>
                    <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-xs'} text-white/50 max-w-[200px] truncate`} title={row.remark}>{row.remark}</td>
                    
                    {auth.role === 'admin' && (
                      <td className="py-1 px-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => row.queueType === 'IQC Check' ? handleDeleteMainIqc(row.id) : handleDeletePinRequest(row.id)} className="text-white/30 hover:text-rose-500 p-1 rounded hover:bg-rose-500/10"><Trash2 size={14}/></button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
