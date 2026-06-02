import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit2 } from 'lucide-react';
import { API_URL } from '../App.jsx';

export default function HomePage({ auth, triggerRefresh }) {
  const [listData, setListData] = useState([]);
  const [pinChangeQueue, setPinChangeQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const iqcStatusOptions = ["Draft", "Awaiting", "Done", "Return to store", "waiting part", "Need more data", "Return to production"];

  const fetchData = () => {
    fetch(`${API_URL}/api/iqc-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json())
      .then(data => { if (data.success) setListData(data.data); })
      .catch(err => console.error(err));
    
    fetch(`${API_URL}/api/pin-change-list`, { headers: { 'Authorization': `Bearer ${auth.token}` }})
      .then(res => res.json())
      .then(data => { if (data.success) setPinChangeQueue(data.data); setLoading(false); })
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
      await fetch(`${API_URL}/api/pin-change-complete/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${auth.token}` } });
      fetchData();
    } catch(err) { console.error(err); }
  };

  const handleDeleteRecord = async (type, id) => {
    if(!window.confirm("Admin Alert: ต้องการลบข้อมูลคิวนี้ถาวรใช่หรือไม่?")) return;
    const endpoint = type === 'IQC Check' ? `/api/iqc/${id}` : `/api/pin-change/${id}`;
    try {
      await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${auth.token}` }});
      fetchData();
    } catch(err) { console.error(err); }
  };

  const getWW = (dateString) => {
    if(!dateString) return "-";
    const d = new Date(dateString);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return "W" + Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const formatDate = (dateString) => {
    if(!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString('th-TH', { hour12: false });
  };

  const unifiedQueue = [
    ...listData.map(item => ({
      id: item.id,
      queueType: 'IQC Check',
      displayId: `#IQC-${item.id}`,
      mcNo: item.location || '-',
      ww: getWW(item.created_at),
      dateTime: formatDate(item.created_at),
      operator: item.owner || '-',
      primaryTarget: item.hw_name ? `HW: ${item.hw_name} | Inv: ${item.invoice_no || '-'}` : '-',
      subIdentification: item.serial_no ? `S/N: ${item.serial_no} | Supplier: ${item.supplier || '-'}` : '-',
      statusWorkflow: item.job_status || 'Awaiting',
      completedAt: item.completed_at ? new Date(item.completed_at).toLocaleDateString('th-TH') : '-',
      inspectionBy: item.checked_by || '-',
      systemRemark: item.system_remark || '-'
    })),
    ...pinChangeQueue.map(item => ({
      id: item.id,
      queueType: 'Pin Changing',
      displayId: `#PC-${item.id}`,
      mcNo: item.location || '-',
      ww: getWW(item.created_at),
      dateTime: formatDate(item.created_at),
      operator: item.requested_by || item.req_name || '-',
      primaryTarget: `Pin: ${item.pin_no || '-'} | Cust: ${item.customer_name || '-'}`,
      subIdentification: `Stock: ${item.stock_pin_no || '-'} | Socket: ${item.name_socket || '-'}`,
      statusWorkflow: item.status || 'Pending',
      completedAt: item.completed_at ? new Date(item.completed_at).toLocaleDateString('th-TH') : '-',
      inspectionBy: item.accepted_by || '-',
      systemRemark: item.system_remark || 'Auto-Accepted Queue'
    }))
  ].sort((a, b) => b.id - a.id);

  return (
    <div className="w-full bg-[#141124] text-white p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold tracking-wide text-zinc-300">Central Que list</h1>
        <button onClick={() => window.location.href = '/form'} className="px-4 py-2 bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl hover:bg-purple-600 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
          + Open IQC Form
        </button>
      </div>

      <div className="bg-[#1b162e]/40 border border-purple-500/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium tracking-wide">
            <thead>
              <tr className="border-b border-purple-500/10 text-zinc-400 uppercase">
                <th className="py-4 px-4">Queue Type</th>
                <th className="py-4 px-4">M/C No.</th>
                <th className="py-4 px-4">Queue ID</th>
                <th className="py-4 px-4">WW</th>
                <th className="py-4 px-4">Date / Time</th>
                <th className="py-4 px-4">Operator</th>
                <th className="py-4 px-4">Primary Target Details</th>
                <th className="py-4 px-4">Sub Identification</th>
                <th className="py-4 px-4 text-center">Status Workflow</th>
                <th className="py-4 px-4">Completed At</th>
                <th className="py-4 px-4">Inspection By</th>
                <th className="py-4 px-4">System Remark</th>
                {auth.role === 'admin' && <th className="py-4 px-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/5 text-zinc-300">
              {loading ? (
                <tr><td colSpan="13" className="py-12 text-center text-purple-400"><Loader2 className="animate-spin mx-auto mb-2"/>Loading Queues...</td></tr>
              ) : (
                unifiedQueue.map((row, index) => (
                  <tr key={index} className="hover:bg-purple-500/5 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${row.queueType === 'IQC Check' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'}`}>
                        {row.queueType === 'IQC Check' ? '📝 IQC Check' : '⚙️ Pin Changing'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-100">{row.mcNo}</td>
                    <td className="py-4 px-4 font-bold text-zinc-400 flex items-center gap-1.5">
                      {row.displayId}
                      {row.queueType === 'IQC Check' && row.statusWorkflow === 'Draft' && (
                        <button onClick={() => window.location.href = `/form?edit=${row.id}`} className="p-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded hover:bg-yellow-500 hover:text-black transition-all" title="แก้ไขไฟล์ Draft">
                          <Edit2 size={10} />
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-zinc-500">{row.ww}</td>
                    <td className="py-4 px-4 text-zinc-400">{row.dateTime}</td>
                    <td className="py-4 px-4 text-zinc-200">{row.operator}</td>
                    <td className="py-4 px-4 font-medium text-zinc-100">{row.primaryTarget}</td>
                    <td className="py-4 px-4 text-zinc-400">{row.subIdentification}</td>
                    <td className="py-4 px-4 text-center">
                      {row.queueType === 'IQC Check' ? (
                        <select 
                          value={row.statusWorkflow} 
                          onChange={(e) => handleMainStatusChange(row.id, e.target.value)}
                          className={`bg-[#141124] outline-none cursor-pointer px-3 py-1 rounded-lg text-[11px] font-bold border text-center transition-all ${row.statusWorkflow === 'Done' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' : row.statusWorkflow === 'Draft' ? 'border-yellow-500 text-yellow-400 bg-yellow-950/20' : 'border-blue-500 text-blue-400'}`}
                        >
                          {row.statusWorkflow === 'Draft' && <option value="Draft">Draft</option>}
                          {iqcStatusOptions.filter(opt => opt !== 'Draft').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <button disabled={row.statusWorkflow === 'Done'} onClick={() => handleCompletePinRequest(row.id)} className={`px-3 py-1 rounded-lg text-[11px] font-bold border uppercase transition-all ${row.statusWorkflow === 'Done' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' : 'border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white'}`}>
                          {row.statusWorkflow === 'Done' ? 'Finished' : 'Mark Done'}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-zinc-400">{row.completedAt}</td>
                    <td className="py-4 px-4 font-semibold text-emerald-400">{row.inspectionBy}</td>
                    <td className="py-4 px-4 text-zinc-500 text-[11px] italic">{row.systemRemark}</td>
                    {auth.role === 'admin' && (
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => handleDeleteRecord(row.queueType, row.id)} className="text-zinc-500 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
