import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, Settings, Wrench, CheckCircle2, 
  ExternalLink, Image as ImageIcon, Plus, ArrowRight 
} from 'lucide-react';

export default function ContactorInfoPage() {
  
  // 📌 MOCK DATA
  const contactorData = {
    no: "CT-EPSN0141",
    name: "CONTACTOR-39-QFN-5.0X6.0-VAR-ROL200",
    pn: "186235-0001",
    category: "Pick and Place",
    brand: "Johnstech",
    pinType: "Finger",
    package: "39L QFN 5.0x6.0 P0.50"
  };

  const statusCards = [
    { title: "Register", count: 100, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: <CheckCircle2 size={18} /> },
    { title: "Production", count: 100, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <Box size={18} /> },
    { title: "In store", count: 100, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <Settings size={18} /> },
    { title: "Under repair", count: 100, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: <Wrench size={18} /> },
  ];

  const bomData = [
    { name: "Frame", itemNo: "-", pn: "-", desc: "-", qty: "-", stock: "-", showAdd: false },
    { name: "Socket body", itemNo: "2", pn: "180156-0001", desc: "HSG-39-QFN-5.0X6.0-VAR-ROL200", qty: "1", stock: "-", showAdd: false },
    { name: "Cover", itemNo: "-", pn: "-", desc: "-", qty: "-", stock: "-", showAdd: false },
    { name: "Signal pin#1", itemNo: "3", pn: "138337-0002", desc: "CONTACT-PROL200-0.168THK-GP-FINE-TIP", qty: "39", stock: "-", showAdd: true },
    { name: "Signal pin#2", itemNo: "-", pn: "-", desc: "-", qty: "-", stock: "-", showAdd: false },
    { name: "Signal pin#3", itemNo: "-", pn: "-", desc: "-", qty: "-", stock: "-", showAdd: false },
    { name: "GND pin", itemNo: "-", pn: "-", desc: "-", qty: "-", stock: "-", showAdd: false },
    { name: "Alignment plate", itemNo: "-", pn: "-", desc: "-", qty: "-", stock: "-", showAdd: false },
    { name: "Other", itemNo: "-", pn: "-", desc: "-", qty: "-", stock: "-", showAdd: true },
    { name: "ELASTOMER", itemNo: "4", pn: "115832-0039", desc: "ELASTOMER-0.032inDIA-50D-GRAY", qty: "1", stock: "-", showAdd: false },
    { name: "ELASTOMER", itemNo: "5", pn: "115832-0052", desc: "ELASTOMER-0.030inDIA-40D-YELLOW", qty: "1", stock: "-", showAdd: false },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="w-full max-w-7xl mx-auto space-y-6 pb-20"
    >
      <motion.div variants={itemVariants} className="mb-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Contactor Information Database</h1>
        <p className="text-zinc-500 text-xs mt-1">Specifications & Live Inventory Status</p>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No.</p>
            <p className="text-sm font-semibold text-blue-400">{contactorData.no}</p>
          </div>
          <div className="space-y-1 col-span-2 lg:col-span-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</p>
            <p className="text-sm font-semibold text-white leading-tight">{contactorData.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">P/N</p>
            <p className="text-sm font-semibold text-white font-mono text-xs">{contactorData.pn}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Category</p>
            <p className="text-sm font-semibold text-white">{contactorData.category}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Brand</p>
            <p className="text-sm font-semibold text-white">{contactorData.brand}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Contact Pin Type</p>
            <p className="text-sm font-semibold text-white">{contactorData.pinType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Package</p>
            <p className="text-sm font-semibold text-white text-xs">{contactorData.package}</p>
          </div>
          <div className="space-y-1 flex items-end pb-0.5">
            <button className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
              <ExternalLink size={14} /> Socket Drawing Link
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((status, idx) => (
          <button 
            key={idx} 
            className={`flex flex-col p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-[#18181b] border-white/5 hover:${status.border} group text-left`}
          >
            <div className={`p-2 rounded-lg ${status.bg} ${status.color} w-fit mb-4`}>
              {status.icon}
            </div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">{status.title}</p>
            <h3 className="text-2xl font-black text-white">
              {status.count} <span className="text-xs font-medium text-zinc-500">units</span>
            </h3>
            <p className="text-[9px] text-zinc-500 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Open status sheet <ArrowRight size={10} />
            </p>
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Visual References</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 aspect-square rounded-xl border border-dashed border-white/10 bg-[#09090b] flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-all cursor-pointer group">
            <ImageIcon size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-medium">รูปจริงด้านหน้า</span>
          </div>
          <div className="md:col-span-1 aspect-square rounded-xl border border-dashed border-white/10 bg-[#09090b] flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-all cursor-pointer group">
            <ImageIcon size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-medium">รูปจริงด้านหลัง</span>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((side) => (
              <div key={side} className="aspect-[2/1] rounded-xl border border-dashed border-white/10 bg-[#09090b] flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-all cursor-pointer group">
                <ImageIcon size={20} className="mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-medium">ด้านข้าง {side}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
           <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Technical Drawing</h3>
           <div className="flex-1 rounded-xl bg-white flex items-center justify-center p-4 min-h-[300px]">
             <div className="text-zinc-300 text-center">
               <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
               <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Section A-A View</p>
             </div>
           </div>
        </div>

        <div className="xl:col-span-8 bg-[#18181b] border border-white/5 rounded-2xl p-0 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Bill of Materials (BOM)</h3>
          </div>
          <div className="overflow-x-auto">
            {/* 🌟 ล็อกสัดส่วนตารางใหม่ (Width %) และลด Padding (py-3, px-4) ให้กระชับขึ้น */}
            <table className="w-full text-sm text-left table-fixed min-w-[800px]">
              <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-4 py-3 w-[22%]">Part Name</th>
                  <th className="px-4 py-3 w-[10%] text-center whitespace-nowrap">Item No.</th>
                  <th className="px-4 py-3 w-[15%]">P/N</th>
                  <th className="px-4 py-3 w-[28%]">Description</th>
                  <th className="px-3 py-3 w-[8%] text-center">Q'ty</th>
                  <th className="px-3 py-3 w-[7%] text-center">Stock</th>
                  <th className="px-3 py-3 w-[10%] text-center">EOH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bomData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors text-zinc-300">
                    <td className={`px-4 py-2.5 whitespace-nowrap ${row.itemNo === '-' ? 'text-zinc-500' : 'font-semibold text-white'}`}>
                      {row.name}
                    </td>
                    <td className="px-4 py-2.5 text-center text-zinc-500 text-xs">{row.itemNo}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{row.pn}</td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400 truncate" title={row.desc}>{row.desc}</td>
                    <td className="px-3 py-2.5 text-center font-medium text-xs">{row.qty}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{row.stock}</td>
                    <td className="px-3 py-2.5 text-center">
                      {row.showAdd ? (
                        <button className="flex items-center justify-center gap-1 mx-auto bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all">
                          <Plus size={12} /> Add
                        </button>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
