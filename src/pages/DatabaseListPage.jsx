import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Database, Edit2, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/UIComponents.jsx';

export default function DatabaseListPage({ onAddNew, onEditRecord }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 📥 Fetch ข้อมูล (จิมมี่เสียบ API ดึงรายชื่อคอนแทคเตอร์มาลงตรงนี้ได้เลย)
  useEffect(() => {
    setTimeout(() => {
      setRecords([
        { id: 1, name: 'CT-EPSN0141', type: 'Socket', supplier: '-', date: '2026-06-15' },
        { id: 2, name: 'CT-MTT0016', type: 'Socket', supplier: '-', date: '2026-06-16' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRecords = records.filter(r => 
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.supplier || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'Pending') return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">PENDING</span>;
    return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">ACTIVE</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-white">
        <Loader2 className="animate-spin text-[#6f7bf7]" size={32} />
        <span className="text-sm font-bold tracking-widest uppercase opacity-60">Loading Database...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 w-full max-w-7xl mx-auto p-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Database className="text-blue-500" /> Contactor Database
          </h1>
          <p className="text-xs text-white/40 mt-1">จัดการและตรวจสอบรายชื่อคอนแทคเตอร์ทั้งหมดในระบบ</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(37,99,235,0.3)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddNew}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer transition-colors"
        >
          <Plus size={18} strokeWidth={3} /> NEW CONTACTOR
        </motion.button>
      </div>

      <div className="relative w-full max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search by Name or Supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
        />
      </div>

      <GlassCard className="p-0 overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                <th className="py-4 px-6">Contactor Name</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Supplier</th>
                <th className="py-4 px-4">Date Added</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-white/30 font-bold text-xs uppercase tracking-wider">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group text-white/80">
                    <td className="py-4 px-6 font-bold text-white text-sm">{row.name}</td>
                    <td className="py-4 px-4 text-xs font-bold text-white/60">{row.type}</td>
                    <td className="py-4 px-4 text-xs text-white/50">{row.supplier}</td>
                    <td className="py-4 px-4 text-xs text-white/50">{row.date}</td>
                    <td className="py-4 px-4 text-center align-middle">{getStatusBadge(row.status)}</td>
                    <td className="py-4 px-6 text-right align-middle">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditRecord(row.id)}
                        className="p-2 bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 rounded-xl text-white/60 transition-all inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <Edit2 size={13} /> EDIT
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}
