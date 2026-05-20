import React, { useState, useEffect } from 'react';
import { Trash2, ListFilter, Loader2, Minimize2, Maximize2, Cpu, Bell, Check, Play } from 'lucide-react';
import { GlassCard } from '../components/UIComponents.jsx';
import { API_URL } from '../App.jsx'; 

export default function HomePage({ auth, triggerRefresh }) {
  const [listData, setListData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pass_count: 0, fail_count: 0 });
  const [loading, setLoading] = useState(true);

  // 🌟 ฟีเจอร์ย่อตาราง (Minify Compact Mode) เพื่ออัด Data ให้แน่นขึ้น
  const [isCompact, setIsCompact] = useState(false);

  // 🌟 NEW DATA STATE: สำหรับหน้าต่างเก็บคิวงานเปลี่ยนพิน
  const [pinChangeQueue, setPinChangeQueue] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  const statusOptions = ["Awaiting", "Done", "Return to store", "waiting part", "Need more data", "Return to production"];

  const fetchMainIqcData = () => {
    fetch(`${API_URL}/api/iqc-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json())
      .then(data => { if (data.success) { setListData(data.data); setStats(data.stats); } })
      .catch(err => console.error(err));
  };

  // 🌟 ดึงข้อมูลคิวงานเปลี่ยนพินและคำนวณตัวแจ้งเตือน Alert
  const fetchPinChangeQueue = () => {
    fetch(`${API_URL}/api/pin-change-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPinChangeQueue(data.data);
          // นับจำนวนเฉพาะงานที่เป็น 'Awaiting' เพื่อทำ Live Alert Badge เม็ดกระดุมแจ้งเตือน
          const newAlerts = data.data.filter(item => item.status === 'Awaiting').length;
          setAlertCount(newAlerts);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchMainIqcData();
    fetchPinChangeQueue();
  }, [triggerRefresh]);

  const handleDeleteMainIqc = async (id) => {
    if(!window.confirm("Admin Warning: ยืนยันการลบ Record นี้ถาวร?")) return;
    try {
      setListData(prev => prev.filter(item => item.id !== id));
      const res = await fetch(`${API_URL}/api/iqc/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${auth.token}` }});
      if(res.ok) fetchMainIqcData();
    } catch(err) { console.error(err); fetchMainIqcData(); }
  };

  const handleMainStatusChange = async (id, newStatus) => {
    const previousData = [...listData];
    setListData(prev => prev.map(item => item.id === id ? { ...item, job_status: newStatus } : item));
    try {
      const res = await fetch(`${API_URL}/api/iqc-status/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${auth.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if(!res.ok) throw new Error("Update failed");
    } catch(err) { setListData(previousData); }
  };

  // ==========================================
  // 🚀 PIN CHANGING HANDLER CORE LOGIC
  // ==========================================

  // ฟังก์ชันกดรับงานเปลี่ยนพิน (สำหรับสิทธิ์ User และ Admin) -> เปลี่ยนเป็น Pending ทันทีแบบ Auto
  const handleAcceptPinRequest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/pin-change-accept/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if(res.ok) fetchPinChangeQueue(); // โหลดอัปเดตคิวงานใหม่ทันที
    } catch(err) { alert(err.message); }
  };

  // ฟังก์ชันอัปเดตสถานะเปลี่ยนพินเสร็จสิ้น -> เปลี่ยนเป็น Done (สำหรับสิทธิ์ User และ Admin)
  const handleCompletePinRequest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/pin-change-complete/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if(res.ok) fetchPinChangeQueue();
    } catch(err) { alert(err.message); }
  };

  // ฟังก์ชันสั่งลบคิวงานเปลี่ยนพินทิ้งออกจากฐานข้อมูลหลังบ้าน (สิทธิ์แอดมินสูงสุด)
  const handleDeletePinRequest = async (id) => {
    if(!window.confirm("Admin Warning: ยืนยันการลบคิว Request เปลี่ยนพินชิ้นนี้?")) return;
    try {
      const res = await fetch(`${API_URL}/api/pin-change/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if(res.ok) fetchPinChangeQueue();
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
      case 'Return to store': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Return to production': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; 
    }
  };

  return (
    <div className="space-y-10 w-full">
      
      {/* ========================================================= */}
      {/* 🚀 WINDOWS 1: หน้าต่างคิวงาน REQUEST PIN CHANGING QUEUE   */}
      {/* ========================================================= */}
      <GlassCard className="border-fuchsia-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 relative">
              <Cpu size={20} />
              {/* 🔔 Live Alert Badge: ขึ้นจุดนับเตือนออโต้เมื่อมีงาน Awaiting ขาเข้า */}
              {alertCount > 0 && (
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1.5 -right-1.5 bg-rose-500 border border-black text-white text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-1 shadow-lg">
                  <Bell size={8} className="animate-bounce" /> {alertCount}
                </motion.span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">Pin Changing Request Queue</h2>
              <p className="text-white/40 text-xs mt-0.5">หน้าต่างตรวจสอบคิวคำขอและอนุมัติอัปเดตสถานะรับพินเปลี่ยน</p>
            </div>
          </div>
        </div>

        {/* ตารางงานคิวเปลี่ยนพิน */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 max-h-64 custom-scrollbar">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left">
                <th className="py-3 px-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Req ID</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Loc</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Contac No.</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Contac S/N</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Requested By</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Accepted By</th>
                <th className="py-3 px-4 text-center text-[11px] font-bold text-white/50 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Timestamp</th>
                <th className="py-3 px-4 text-center text-[11px] font-bold text-white/50 uppercase tracking-wider">Workflows Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pinChangeQueue.length === 0 ? (
                <tr><td colSpan="9" className="py-6 text-center text-white/30 text-xs">No active pin changing requests in queue.</td></tr>
              ) : (
                pinChangeQueue.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-fuchsia-400 font-bold">#PC-{req.id}</td>
                    <td className="py-3 px-4 text-white font-black">{req.location}</td>
                    <td className="py-3 px-4 text-white/80">{req.contac_no}</td>
                    <td className="py-3 px-4 text-white/60">{req.contac_sn || '-'}</td>
                    <td className="py-3 px-4 text-white/70">{req.requested_by}</td>
                    <td className="py-3 px-4 text-amber-400 text-xs font-medium">{req.accepted_by || '-'}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest border uppercase ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/40 text-xs">{new Date(req.created_at).toLocaleString('en-GB')}</td>
                    
                    {/* 🌟 ส่วนควบคุมการกดเปลี่ยนสิทธิ์ตามบทบาทที่ได้รับมอบหมาย */}
                    <td className="py-2 px-4 text-center">
                      {auth.role === 'viewer' ? (
                        <span className="text-[10px] text-white/20 font-bold uppercase">View Only</span>
                      ) : (
                        <div className="flex justify-center items-center gap-1.5">
                          {req.status === 'Awaiting' && (
                            <button onClick={() => handleAcceptPinRequest(req.id)} className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1">
                              <Play size={10} /> Accept Job
                            </button>
                          )}
                          {req.status === 'Pending' && (
                            <button onClick={() => handleCompletePinRequest(req.id)} className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1">
                              <Check size={10} /> Mark Done
                            </button>
                          )}
                          {req.status === 'Done' && (
                            <span className="text-[10px] text-emerald-400/50 font-bold uppercase tracking-wider flex items-center gap-1"><Check size={10}/> Finished</span>
                          )}
                          {auth.role === 'admin' && (
                            <button onClick={() => handleDeletePinRequest(req.id)} className="text-white/20 hover:text-rose-400 p-1 rounded ml-2"><Trash2 size={12}/></button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ========================================================= */}
      {/* 📊 WINDOWS 2: หน้าต่างตารางตรวจสอบสถิติหลัก IQC PROTOCOL   */}
      {/* ========================================================= */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3"><ListFilter className="text-[#6f7bf7]"/> Primary Status Query List</h1>
            <p className="text-white/40 text-sm mt-1">ฐานข้อมูลกลางสำหรับบันทึกและจัดการใบตรวจสอบคุณภาพขาเข้าทั้งหมด</p>
          </div>
          
          {/* 🌟 ปุ่มบีบ/ย่อตารางหลักย่อตัวย่อใจ (Compact Mode Toggle Toggle) */}
          <button 
            onClick={() => setIsCompact(!isCompact)} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase border transition-all no-print ${isCompact ? 'bg-[#6f7bf7]/20 border-[#6f7bf7] text-[#6f7bf7]' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
            title={isCompact ? "Switch to Normal Row View" : "Switch to Compact Minified View"}
          >
            {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />} 
            {isCompact ? "NORMAL VIEW" : "COMPACT MINIFY"}
          </button>
        </div>

        <GlassCard className="!p-4 md:!p-6 overflow-hidden flex flex-col">
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 pb-2 custom-scrollbar">
            <table className="w-full text-sm min-w-[1200px] transition-all">
              <thead>
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
                  <th className={`${isCompact ? 'py-1.5 px-3 text-[10px]' : 'py-3 px-4 text-[11px]'} text-center font-bold text-white/50 uppercase tracking-wider transition-all`}>Count</th>
                  {auth.role === 'admin' && <th className="py-1.5 px-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="14" className="py-16 text-center text-[#6f7bf7] font-medium">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin w-8 h-8" />
                        <span className="text-white/40 text-xs tracking-widest uppercase">Loading Systems Database...</span>
                      </div>
                    </td>
                  </tr>
                ) : listData.length === 0 ? (
                  <tr><td colSpan="14" className="py-12 text-center text-white/30 font-medium">No records found inside core systems.</td></tr>
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
                      <td className={`${isCompact ? 'py-1 px-3 text-[11px]' : 'py-3 px-4 text-center'} text-white/60 transition-all`}>1</td>
                      
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
    </div>
  );
}
