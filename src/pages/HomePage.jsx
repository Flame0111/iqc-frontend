import React, { useState, useEffect } from 'react';
import { Trash2, ListFilter } from 'lucide-react';
import { GlassCard } from '../components/UIComponents.jsx';
import { API_URL } from '../App.jsx'; // 🌟 ดึง API_URL มาจาก App

export default function HomePage({ setPage, auth }) {
  const [listData, setListData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pass_count: 0, fail_count: 0 });
  const [loading, setLoading] = useState(true);

  const statusOptions = ["Awaiting", "Done", "Return to store", "waiting part", "Need more data", "Return to production"];

  const fetchList = () => {
    fetch(`${API_URL}/api/iqc-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json())
      .then(data => { 
        if (data.success) { setListData(data.data); setStats(data.stats); }
        setLoading(false); 
      })
      .catch(err => console.error("Error fetching list:", err));
  };

  useEffect(() => { fetchList(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Admin Warning: ยืนยันการลบ Record นี้พร้อมไฟล์แนบถาวร?")) return;
    try {
      const res = await fetch(`${API_URL}/api/iqc/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${auth.token}` }});
      if(res.ok) fetchList();
      else alert("Error deleting record");
    } catch(err) { alert(err.message); }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/iqc-status/${id}`, { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if(res.ok) fetchList(); 
    } catch(err) { alert("Update failed: " + err.message); }
  };

  const getWW = (dateString) => {
    if(!dateString) return "-";
    const d = new Date(dateString);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return "W" + weekNo;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Return to store': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Return to production': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Need more data': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'waiting part': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; 
    }
  };

  return (
    <div className="space-y-6 w-full fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><ListFilter className="text-[#6f7bf7]"/> Status Query List</h1>
          <p className="text-white/40 text-sm mt-1">ภาพรวมและติดตามสถานะงานตรวจสอบ IQC ทั้งหมด</p>
        </div>
        <div className="flex gap-3 bg-black/40 border border-white/5 rounded-2xl p-2 px-6 shadow-inner">
          <div className="text-center px-4"><p className="text-[10px] font-bold text-white/40 uppercase">Total</p><p className="text-lg font-black text-white">{stats.total}</p></div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center px-4"><p className="text-[10px] font-bold text-emerald-400/70 uppercase">Pass</p><p className="text-lg font-black text-emerald-400">{stats.pass_count}</p></div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center px-4"><p className="text-[10px] font-bold text-rose-400/70 uppercase">Fail</p><p className="text-lg font-black text-rose-400">{stats.fail_count}</p></div>
        </div>
      </div>

      <GlassCard className="!p-4 md:!p-6 overflow-hidden flex flex-col">
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 pb-2 custom-scrollbar">
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Loc</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">No.</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">WW</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Who</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Job kind</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Contac No.</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Contac S/N.</th>
                <th className="py-3 px-4 text-center text-[11px] font-black text-[#6f7bf7] uppercase tracking-wider bg-[#6f7bf7]/10">Status</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Complated Date</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Inspection By</th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">Remark</th>
                <th className="py-3 px-4 text-center text-[11px] font-bold text-white/50 uppercase tracking-wider">Count</th>
                {auth.role === 'admin' && <th className="py-3 px-4"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="14" className="py-8 text-center text-white/30 font-medium">Loading data...</td></tr>
              ) : listData.length === 0 ? (
                <tr><td colSpan="14" className="py-8 text-center text-white/30 font-medium">No records found.</td></tr>
              ) : (
                listData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-white/80 font-medium">{row.location || '-'}</td>
                    <td className="py-3 px-4 text-white/60">#{row.id}</td>
                    <td className="py-3 px-4 text-white/60">{getWW(row.created_at)}</td>
                    <td className="py-3 px-4 text-white/80 whitespace-nowrap">{new Date(row.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="py-3 px-4 text-white/80">{row.owner || row.send_by || '-'}</td>
                    <td className="py-3 px-4 text-white/60 text-xs">IQC Check</td>
                    <td className="py-3 px-4 text-white font-bold">{row.hw_name || row.invoice_no || '-'}</td>
                    <td className="py-3 px-4 text-white/60">{row.serial_no || '-'}</td>
                    
                    <td className="py-2 px-2 text-center bg-black/20">
                      {auth.role === 'viewer' ? (
                        <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider border ${getStatusColor(row.job_status)}`}>
                          {row.job_status || 'Awaiting'}
                        </span>
                      ) : (
                        <select 
                          value={row.job_status || 'Awaiting'} 
                          onChange={(e) => handleStatusChange(row.id, e.target.value)}
                          className={`appearance-none outline-none cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider border text-center text-ellipsis ${getStatusColor(row.job_status)}`}
                        >
                          {statusOptions.map(opt => <option key={opt} value={opt} className="bg-[#1a1f35] text-white">{opt}</option>)}
                        </select>
                      )}
                    </td>
                    
                    <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.job_status === 'Done' ? new Date(row.created_at).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{row.checked_by || '-'}</td>
                    <td className="py-3 px-4 text-white/50 text-xs max-w-[150px] truncate" title={row.checklist_data?.probDesc}>
                      {row.checklist_data?.probDesc || row.checklist_data?.preventAction || '-'}
                    </td>
                    <td className="py-3 px-4 text-center text-white/60">1</td>
                    
                    {auth.role === 'admin' && (
                      <td className="py-3 px-4 text-right">
                        <button onClick={()=>handleDelete(row.id)} className="text-white/20 hover:text-rose-500 transition-colors p-1.5 rounded hover:bg-rose-500/10"><Trash2 size={16}/></button>
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