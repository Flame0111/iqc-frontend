import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Edit2, Loader2, CheckCircle2, XCircle, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/UIComponents.jsx';
import { API_URL } from '../App.jsx';

export default function HomePage({ auth, triggerRefresh }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PASS' | 'FAIL' | 'DRAFT'

  // 📥 ฟังก์ชันดึงข้อมูล IQC ทั้งหมดจากเซิร์ฟเวอร์
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = auth?.token || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/iqc`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching IQC records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [triggerRefresh]);

  // 📊 คำนวณตัวเลขสถิติสำหรับโชว์บนการ์ดสรุปผล
  const totalCount = records.length;
  const passCount = records.filter(r => r.job_status === 'Completed' && r.checklist_data?.finalResult === 'PASS').length;
  const failCount = records.filter(r => r.job_status === 'Completed' && r.checklist_data?.finalResult === 'FAIL').length;
  const draftCount = records.filter(r => r.job_status === 'Draft').length;

  // 🔍 กรองข้อมูลตามแถบค้นหา (Search) และ แถบสถานะ (Tabs)
  const filteredRecords = records.filter(row => {
    const matchesSearch = 
      (row.hw_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.serial_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.invoice_no || '').toLowerCase().includes(searchQuery.toLowerCase());

    const finalRes = row.checklist_data?.finalResult || 'PASS';
    if (activeTab === 'PASS') return matchesSearch && row.job_status === 'Completed' && finalRes === 'PASS';
    if (activeTab === 'FAIL') return matchesSearch && row.job_status === 'Completed' && finalRes === 'FAIL';
    if (activeTab === 'DRAFT') return matchesSearch && row.job_status === 'Draft';
    return matchesSearch;
  });

  // ฟังก์ชันช่วยจัดการรูปแบบสีของ Badge สถานะในตาราง
  const renderStatusBadge = (row) => {
    if (row.job_status === 'Draft') {
      return (
        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 tracking-wider">
          DRAFT
        </span>
      );
    }
    if (row.checklist_data?.finalResult === 'FAIL') {
      return (
        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 tracking-wider">
          FAIL
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
        PASS
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="animate-spin text-[#6f7bf7]" size={36} />
        <span className="text-xs font-black tracking-widest uppercase text-white/50 animate-pulse">Loading IQC Hub Database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto p-2">
      
      {/* ================= SECTION 1: STATS CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="!p-5 border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Total Records</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-white/60"><FileText size={20} /></div>
        </GlassCard>

        <GlassCard className="!p-5 border-emerald-500/20 bg-emerald-950/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-wider">Passed Lots</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{passCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle2 size={20} /></div>
        </GlassCard>

        <GlassCard className="!p-5 border-rose-500/20 bg-rose-950/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-rose-400/50 uppercase tracking-wider">Defect / Failed</p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">{failCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><XCircle size={20} /></div>
        </GlassCard>

        <GlassCard className="!p-5 border-yellow-500/20 bg-yellow-950/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-yellow-400/50 uppercase tracking-wider">Draft Records</p>
            <h3 className="text-2xl font-black text-yellow-400 mt-1">{draftCount}</h3>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400"><AlertCircle size={20} /></div>
        </GlassCard>
      </div>

      {/* ================= SECTION 2: FILTERS & SEARCH ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        
        {/* Tabs เปลี่ยนสถานะการกรอก */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'ALL LOTS' },
            { id: 'PASS', label: 'PASS' },
            { id: 'FAIL', label: 'FAIL' },
            { id: 'DRAFT', label: 'DRAFTS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${activeTab === tab.id ? 'bg-[#6f7bf7] text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ช่องค้นหาข้อมูลแบบเรียลไทม์ */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Search size={15} /></span>
          <input
            type="text"
            placeholder="Search HW, S/N, Supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-[#6f7bf7]/50 transition-all"
          />
        </div>
      </div>

      {/* ================= SECTION 3: DATA TABLE ================= */}
      <GlassCard className="p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <th className="py-4 px-6 w-[25%]">Hardware Information</th>
                <th className="py-4 px-4 w-[20%]">Supplier</th>
                <th className="py-4 px-4 w-[20%]">Serial Number</th>
                <th className="py-4 px-4 w-[15%]">Date Received</th>
                <th className="py-4 px-4 text-center w-[10%]">Status</th>
                <th className="py-4 px-6 text-right w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-white/80">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-white/20 font-black text-xs uppercase tracking-widest animate-pulse">
                    No matching records found / ไม่พบข้อมูลในระบบ
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.01] transition-colors group">
                    
                    {/* ชื่อฮาร์ดแวร์ */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm group-hover:text-[#6f7bf7] transition-colors">{row.hw_name || '-'}</div>
                      <div className="text-[10px] text-white/30 font-mono mt-0.5">{row.invoice_no ? `INV: ${row.invoice_no}` : 'No Invoice'}</div>
                    </td>

                    {/* ผู้ผลิต */}
                    <td className="py-4 px-4 text-xs font-bold text-white/60">{row.supplier || '-'}</td>

                    {/* หมายเลขซีเรียล */}
                    <td className="py-4 px-4 font-mono text-xs text-purple-300 tracking-tight">{row.serial_no || '-'}</td>

                    {/* วันที่รับของ */}
                    <td className="py-4 px-4 text-xs text-white/40">{row.date_recv ? row.date_recv.split('T')[0] : '-'}</td>

                    {/* สเตตัสหลักผลสรุป */}
                    <td className="py-4 px-4 text-center align-middle">{renderStatusBadge(row)}</td>

                    {/* 🌟 บล็อกปุ่มควบคุม Actions: มีทั้ง EDIT และ VIEW อยู่เคียงข้างกันอย่างสวยงาม */}
                    <td className="py-4 px-6 text-right align-middle whitespace-nowrap">
                      <div className="inline-flex gap-2">
                        
                        {/* ปุ่ม VIEW */}
                        <button
                          onClick={() => { window.location.href = `/?edit=${row.id}`; }}
                          className="p-2 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black rounded-xl text-emerald-400 transition-all inline-flex items-center gap-1 text-[11px] font-black cursor-pointer shadow-md"
                        >
                          <Eye size={12} /> VIEW
                        </button>

                        {/* ปุ่ม EDIT */}
                        <button
                          onClick={() => { window.location.href = `/?edit=${row.id}`; }}
                          className="p-2 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500 hover:bg-blue-500 hover:text-white rounded-xl text-blue-400 transition-all inline-flex items-center gap-1 text-[11px] font-black cursor-pointer shadow-md"
                        >
                          <Edit2 size={11} /> EDIT
                        </button>

                      </div>
                    </td>

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
