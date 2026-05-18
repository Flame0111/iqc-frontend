import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileCheck, X, ChevronDown, Check, ImagePlus } from 'lucide-react';

const itemVar = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

export const GlassCard = ({ children, className = "" }) => (
  <motion.div variants={itemVar} className={`relative bg-white/[0.03] backdrop-blur-[32px] border border-white/[0.08] rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] print-reset hover:border-white/20 transition-all duration-500 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-fuchsia-500/0 opacity-0 hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] pointer-events-none no-print"></div>
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent no-print"></div>
    <div className="relative z-10">{children}</div>
  </motion.div>
);

export const GlassInput = ({ label, name, value, onChange, type = "text", gridClass = "", thLabel = "", placeholder = "" }) => (
  <div className={`flex flex-col gap-1.5 ${gridClass} print:mb-1 group`}>
    <label className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-widest print:text-black group-focus-within:text-purple-400 transition-colors">
      {label} <span className="text-[9px] text-white/40 print-hide-th ml-1 tracking-normal font-medium">{thLabel}</span>
    </label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="no-print w-full bg-white/[0.06] border border-transparent hover:bg-white/[0.09] rounded-xl px-4 py-3 text-sm text-white focus:bg-white/[0.12] focus:border-purple-500/50 outline-none transition-all backdrop-blur-md" />
    <div className="hidden print:block w-full border-b border-slate-400 text-[11px] font-medium pb-0.5 text-black min-h-[16px]">{value || " "}</div>
  </div>
);

export const CustomSelect = ({ label, thLabel, options, gridClass="" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className={`flex flex-col gap-1.5 relative ${gridClass} print:mb-1 ${isOpen ? 'z-[100]' : 'z-10'}`} ref={dropdownRef}>
      {label && <label className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-widest print:text-black">{label} <span className="text-[9px] text-white/20 print-hide-th ml-1 tracking-normal">{thLabel}</span></label>}
      <div className="no-print relative">
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setIsOpen(!isOpen)} className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-xl px-4 py-3 text-sm text-white flex justify-between items-center cursor-pointer transition-all backdrop-blur-md shadow-inner">
          <span className={selected ? "text-white" : "text-white/30"}>{selected || "-- Select --"}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown size={16} className="text-white/40" /></motion.div>
        </motion.div>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 5, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5 }} className="absolute z-[100] w-full bg-[#0b0c10]/95 border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden backdrop-blur-3xl">
              <div className="max-h-48 overflow-y-auto py-1">
                {options.map((opt, i) => (
                  <div key={i} onClick={() => { setSelected(opt); setIsOpen(false); }} className="px-4 py-3 text-sm text-white/80 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-none">{opt} {selected === opt && <Check size={14} className="text-[#6f7bf7]" />}</div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="hidden print:block border-b border-slate-400 text-xs font-bold pb-0.5">{selected || " "}</div>
    </div>
  );
};

export const GlassRadio = ({ name, value, checked, onChange }) => (
  <td className="p-2 text-center print:p-0.5">
    <div className="inline-flex items-center justify-center relative no-print">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer w-5 h-5 opacity-0 absolute cursor-pointer z-10" />
      <div className="w-5 h-5 rounded-full border-2 border-white/20 peer-hover:border-white/40 peer-checked:border-[#6f7bf7] peer-checked:bg-[#6f7bf7]/20 transition-all flex items-center justify-center bg-white/5 backdrop-blur-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-[#6f7bf7] scale-0 peer-checked:scale-100 transition-transform duration-300 shadow-[0_0_10px_rgba(111,123,247,1)]"></div>
      </div>
    </div>
    <input type="radio" checked={checked} readOnly className="hidden print:inline-block w-3 h-3 accent-black" />
  </td>
);

export const FileUploadField = ({ docId, label, onFileChange, currentFiles }) => (
  <div className="no-print h-10 flex items-center">
    <AnimatePresence mode="wait">
      {currentFiles?.length > 0 ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1.5 rounded-xl text-emerald-400 text-[10px] font-bold w-full">
          <FileCheck size={14} /> <span className="truncate flex-1">Attached</span>
          <button onClick={() => onFileChange(docId, [])} className="text-rose-400"><X size={12} /></button>
        </motion.div>
      ) : (
        <label className="group flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl py-2 cursor-pointer transition-colors">
          <Upload size={14} className="text-white/40 group-hover:text-white" />
          <span className="text-[10px] font-bold text-white/40 group-hover:text-white">{label}</span>
          <input type="file" accept=".pdf,image/*" multiple className="hidden" onChange={(e) => onFileChange(docId, Array.from(e.target.files))} />
        </label>
      )}
    </AnimatePresence>
  </div>
);

export const ImageUploadBox = ({ id, label, thLabel, image, onChange, onRemove }) => {
  const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[8px] md:text-[9px] font-bold text-white/70 uppercase tracking-tight text-center print:text-black flex flex-col justify-end h-10 leading-tight">
        <span>{label}</span><span className="print-hide-th text-[7px] text-white/30 font-normal mt-0.5 tracking-normal">{thLabel}</span>
      </label>
      <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center overflow-hidden print:border-solid print:border-black print:bg-transparent p-1">
         {image ? (
           <>
             <img src={imageUrl} alt={label} className="w-full h-full object-cover rounded-xl print:rounded-none" />
             <button onClick={(e)=>{e.preventDefault(); onRemove(id);}} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-rose-500 no-print"><X size={12}/></button>
           </>
         ) : (
           <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-white/20 hover:text-white/50 no-print">
             <ImagePlus size={20} className="mb-1" /><span className="text-[7px] font-bold uppercase tracking-wider text-center">Upload</span>
             <input type="file" accept="image/*" className="hidden" onChange={(e)=>onChange(e, id)} />
           </label>
         )}
      </div>
    </div>
  );
};

export const MultiImageUploadBox = ({ id, label, thLabel, images = [], onChange, onRemove, max = 4 }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[8px] md:text-[9px] font-bold text-white/70 uppercase tracking-tight text-center print:text-black flex flex-col justify-end h-10 leading-tight">
      <span className="text-blue-300 print:text-black">{label}</span><span className="print-hide-th text-[7px] text-white/30 font-normal mt-0.5 tracking-normal">{thLabel}</span>
    </label>
    <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center overflow-hidden print:border-solid print:border-black print:bg-transparent p-1">
       {images && images.length > 0 ? (
         <div className={`w-full h-full grid gap-1 ${images.length > 1 || images.length < max ? 'grid-cols-2 grid-rows-2' : 'grid-cols-1 grid-rows-1'}`}>
           {images.map((img, i) => {
             const imgUrl = img instanceof File ? URL.createObjectURL(img) : img;
             return (
             <div key={i} className="relative w-full h-full">
               <img src={imgUrl} alt={`${label} ${i+1}`} className="w-full h-full object-cover rounded-lg print:rounded-none" />
               <button onClick={(e)=>{e.preventDefault(); onRemove(id, i);}} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-rose-500 no-print backdrop-blur-sm"><X size={10}/></button>
             </div>
           )})}
           {images.length < max && (
             <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center bg-white/5 hover:bg-white/20 rounded-lg no-print border border-dashed border-white/20 transition-all">
               <ImagePlus size={14} className="text-white/30 mb-1" /><input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>onChange(e, id, max)} />
             </label>
           )}
         </div>
       ) : (
         <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-white/20 hover:text-white/50 no-print">
           <ImagePlus size={20} className="mb-1" /><span className="text-[7px] font-bold uppercase tracking-wider text-center px-1">Max {max} Files</span>
           <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>onChange(e, id, max)} />
         </label>
       )}
    </div>
  </div>
);