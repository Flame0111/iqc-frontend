import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ListFilter, Loader2, Minimize2, Maximize2, Cpu, Bell, Check, User, MapPin, Hash, Calendar } from 'lucide-react';
import { GlassCard } from '../components/UIComponents.jsx';
import { API_URL } from '../App.jsx'; 

export default function HomePage({ auth, triggerRefresh }) {
  const [listData, setListData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pass_count: 0, fail_count: 0 });
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [pinChangeQueue, setPinChangeQueue] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  const statusOptions = ["Awaiting", "Done", "Return to store", "waiting part", "Need more data", "Return to production"];

  const fetchData = () => {
    fetch(`${API_URL}/api/iqc-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json()).then(data => { if (data.success) { setListData(data.data); setStats(data.stats); } });
    
    fetch(`${API_URL}/api/pin-change-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json()).then(data => {
        if (data.success) {
          setPinChangeQueue(data.data);
          // 🌟 นับ Alert เฉพาะงานที่ Pending
          setAlertCount(data.data.filter(item => item.status === 'Pending').length);
        }
        setLoading(false);
      });
  };

  // 🌟 Auto-Refresh 15 วินาที
  useEffect(() => {
    fetchData(); // ดึงครั้งแรกเมื่อโหลดหน้า หรือเมื่อได้รับ Trigger จาก App.jsx
    const interval = setInterval(fetchData, 15000); // แอบดึงข้อมูลเบื้องหลังทุก 15 วิ
    return () => clearInterval(interval);
  }, [triggerRefresh]); 

  const handleDeleteMainIqc = async (id) => {
    if(!window.confirm("Admin Warning: ยืนยันการลบ Record นี้ถาวร?")) return;
    try {
      setListData(prev => prev.filter(item => item.id !== id));
      await fetch(`${API_URL}/api/iqc/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${auth.token}` }});
      fetchData();
    } catch(err) { console.error(err); fetchData(); }
  };

  const handleMainStatusChange = async (id, newStatus) => {
    const previousData = [...listData];
    setListData(prev => prev.map(item => item.id === id ? { ...item, job_status: newStatus } : item));
    try {
      await fetch(`${API_URL}/api/iqc-status/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${auth.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    } catch(err) { setListData(previousData); }
  };

  const handleCompletePinRequest = async (id) => {
    try {
      await fetch(`${API_URL}/api/pin-change-complete/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${auth.token}` } });
      fetchData(); // สั่งรีเฟรชตารางทันทีหลังอัปเดตสถานะสำเร็จ
    } catch(err) { alert(err.message); }
  };

  const handleDeletePinRequest = async (id) => {
    if(!window.confirm("Admin Warning: ยืนยันการลบคิว Request เปลี่ยนพินชิ้นนี้?")) return;
    try {
      await fetch(`${API_URL}/api/pin-change/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${auth.token}` } });
      fetchData();
    } catch (err) { alert(err.message); }
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
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; 
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full items-start fade-in">
      
      {/* 📊 LEFT/CENTER AREA: PRIMARY IQC STATUS QUERY LIST (75%) */}
      <div className="w-full xl:w-[75%] flex flex-col gap-4 min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3"><ListFilter className="text-[#6f7bf7]"/> Primary Status Query</h1>
            <p className="text-white/40 text-sm mt-1">ฐานข้อมูลจัดการใบตรวจสอบคุณภาพและสถานะงานทั้งหมด</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex gap-3 bg-black/40 border border-white/5 rounded-2xl p-2 px-4 shadow-inner">
              <div className="text-center px-3"><p className="text-[10px] font-bold text-white/40 uppercase">Total</p><p className="text-lg font-black text-white">{stats.total}</p></div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center px-3"><p className="text-[10px] font-bold text-emerald-400/70 uppercase">Pass</p><p className="text-lg font-black text-emerald-400">{stats.pass_count}</p></div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center px-3"><p className="text-[10px] font-bold text-rose-400/70 uppercase">Fail</p><p className="text-lg font-black text-rose-400">{stats.fail_count}</p></div>
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
                {/* 🌟 เอาคอลัมน์ Count ออกแล้ว */}
                <tr className="bg-white/5 border-b border-white/10">
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Loc</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>No.</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>WW</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Date</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Who</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Job kind</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Contac No.</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Contac S/N.</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-center font-black text-[#6f7bf7] uppercase tracking-wider bg-[#6f7bf7]/10 transition-all`}>Status</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Complated Date</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Inspection By</th>
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-left font-bold text-white/50 uppercase tracking-wider transition-all`}>Remark</th>
                  {auth.role === 'admin' && <th className="py-1.5 px-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="13" className="py-16 text-center text-[#6f7bf7] font-medium">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin w-8 h-8" />
                        <span className="text-white/40 text-xs tracking-widest uppercase">Loading Systems...</span>
                      </div>
                    </td>
                  </tr>
                ) : listData.length === 0 ? (
                  <tr><td colSpan="13" className="py-12 text-center text-white/30 font-medium">No records found.</td></tr>
                ) : (
                  listData.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.04] transition-all duration-200 group">
                      <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white/80 font-medium transition-all`}>{row.location || '-'}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-sm'} text-white/60 transition-all`}>#{row.id}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-sm'} text-white/60 transition-all`}>{getWW(row.created_at)}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white/80 whitespace-nowrap transition-all`}>{new Date(row.created_at).toLocaleDateString('en-GB')}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white/80 transition-all`}>{row.owner || row.send_by || '-'}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-xs'} text-white/60 transition-all`}>IQC Check</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-white font-bold transition-all`}>{row.hw_name || row.invoice_no || '-'}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-sm'} text-white/60 transition-all`}>{row.serial_no || '-'}</td>
                      
                      <td className="py-1 px-2 text-center bg-black/20">
                        {auth.role === 'viewer' ? (
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider border ${getStatusColor(row.job_status)}`}>
                            {row.job_status || 'Awaiting'}
                          </span>
                        ) : (
                          <select 
                            value={row.job_status || 'Awaiting'} 
                            onChange={(e) => handleMainStatusChange(row.id, e.target.value)}
                            className={`appearance-none outline-none cursor-pointer px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider border text-center transition-all ${getStatusColor(row.job_status)}`}
                          >
                            {statusOptions.map(opt => <option key={opt} value={opt} className="bg-[#1a1f35] text-white">{opt}</option>)}
                          </select>
                        )}
                      </td>
                      
                      <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-sm'} text-white/60 whitespace-nowrap transition-all`}>{row.job_status === 'Done' ? new Date(row.created_at).toLocaleDateString('en-GB') : '-'}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-sm'} text-emerald-400 font-medium transition-all`}>{row.checked_by || '-'}</td>
                      <td className={`${isCompact ? 'py-1 px-3 text-[10px]' : 'py-3 px-4 text-xs'} text-white/50 max-w-[150px] truncate transition-all`} title={row.checklist_data?.probDesc}>
                        {row.checklist_data?.probDesc || row.checklist_data?.preventAction || '-'}
                      </td>
                      
                      {/* 🌟 เอา <td>1</td> (Count) ตรงนี้ออกแล้ว */}
                      
                      {auth.role === 'admin' && (
                        <td className="py-1 px-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={()=>handleDeleteMainIqc(row.id)} className="text-white/30 hover:text-rose-500 p-1 rounded hover:bg-rose-500/10"><Trash2 size={14}/></button>
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

      {/* 🚀 RIGHT AREA: PIN CHANGING REQUEST QUEUE (25%) */}
      <div className="w-full xl:w-[25%] flex flex-col shrink-0 min-w-0">
        <GlassCard className="border-fuchsia-500/30 !p-5 sticky top-24">
          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 relative shrink-0">
                <Cpu size={20} />
                {alertCount > 0 && (
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1.5 -right-1.5 bg-rose-500 border border-black text-white text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-1 shadow-lg">
                    <Bell size={8} className="animate-bounce" /> {alertCount}
                  </motion.span>
                )}
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider leading-tight">Pin Changing<br/>Queue</h2>
              </div>
            </div>
            <span className="text-[10px] bg-white/5 px-2 py-1 rounded-lg text-white/40 font-bold">{pinChangeQueue.length} Req</span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
            {pinChangeQueue.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-white/30 text-xs font-medium">No active pin requests.</p>
              </div>
            ) : (
              pinChangeQueue.map((req) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={req.id} className="bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/10 hover:bg-white/[0.03] transition-all group relative">
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-fuchsia-400 font-black text-sm tracking-wider">#PC-{req.id}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* 🌟 แสดงข้อมูลด้วย Field ใหม่: pin_no, stock_pin_no, name_socket */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4">
                    <div><p className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-1"><MapPin size={10}/> Location</p><p className="text-xs text-white font-bold">{req.location}</p></div>
                    <div><p className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-1"><Hash size={10}/> Pin No</p><p className="text-xs text-white/80">{req.pin_no}</p></div>
                    <div><p className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-1"><Hash size={10}/> Stock Pin</p><p className="text-xs text-white/60">{req.stock_pin_no || '-'}</p></div>
                    <div><p className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-1"><Cpu size={10}/> Socket</p><p className="text-[11px] text-white/70">{req.name_socket || '-'}</p></div>
                    
                    <div><p className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-1"><User size={10}/> Req By</p><p className="text-[11px] text-white/70">{req.requested_by}</p></div>
                    <div className="col-span-2"><p className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-1"><Calendar size={10}/> Timestamp</p><p className="text-[10px] text-white/40">{new Date(req.created_at).toLocaleString('en-GB')}</p></div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end gap-2 items-center">
                    {auth.role === 'admin' && (
                       <button onClick={() => handleDeletePinRequest(req.id)} className="text-white/20 hover:text-rose-400 p-1.5 rounded mr-auto hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                    )}

                    {auth.role === 'viewer' ? (
                      <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">View Only</span>
                    ) : (
                      <>
                        {/* 🌟 เอาปุ่ม Accept ทิ้งไป เหลือแค่ปุ่ม Mark as Done สำหรับสถานะ Pending */}
                        {req.status === 'Pending' && (
                          <button onClick={() => handleCompletePinRequest(req.id)} className="w-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black tracking-widest uppercase px-3 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                            <Check size={12} strokeWidth={3} /> Mark as Done
                          </button>
                        )}
                        {req.status === 'Done' && (
                          <span className="w-full text-[10px] text-emerald-400/30 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 py-1"><Check size={12}/> Finished</span>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
