import React from 'react';
import { ImagePlus, X, ChevronDown } from 'lucide-react';

// ---------------------------------------------
// 1. GlassCard Component (กรอบใสๆ)
// ---------------------------------------------
export const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl ${className}`}>
    {children}
  </div>
);

// ---------------------------------------------
// 2. ImageUploadBox Component (กล่องอัปโหลดรูปเดี่ยว)
// ---------------------------------------------
export const ImageUploadBox = ({ id, label, image, onChange, onRemove, onPreview }) => {
  return (
    <div className="flex flex-col h-[150px] print:h-[120px]">
      <label className="text-[10px] font-bold text-white/50 text-center mb-2 uppercase truncate print:text-black">
        {label}
      </label>
      <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-[#6f7bf7]/50 transition-all group flex items-center justify-center print:border-black print:bg-transparent">
        {image ? (
          <>
            <img
              src={typeof image === 'string' ? image : URL.createObjectURL(image)}
              alt={label}
              // 🌟 ฟังก์ชันคลิกเพื่อเปิดรูปใหญ่ (เรียก onPreview)
              onClick={(e) => {
                e.stopPropagation();
                if (onPreview) onPreview(typeof image === 'string' ? image : URL.createObjectURL(image));
              }}
              // 🌟 เปลี่ยนเมาส์เป็นแว่นขยาย
              className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
            />
            {/* ปุ่มกากบาทลบรูป */}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg no-print z-10"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10 no-print" 
              onChange={(e) => onChange(id, e.target.files[0])} 
              accept="image/*" 
            />
            <div className="flex flex-col items-center justify-center opacity-30 group-hover:opacity-100 group-hover:text-[#6f7bf7] transition-all print:opacity-100 print:text-black">
              <ImagePlus size={24} className="mb-1" />
              <span className="text-[9px] font-bold uppercase">Upload</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------
// 3. MultiImageUploadBox Component (กล่องอัปโหลดหลายรูป)
// ---------------------------------------------
export const MultiImageUploadBox = ({ id, label, images = [], onChange, onRemove, max = 4, onPreview }) => {
  // ทำให้ชัวร์ว่าเป็น Array เสมอ
  const currentImages = Array.isArray(images) ? images : (images ? [images] : []);

  return (
    <div className="flex flex-col h-[150px] print:h-[120px]">
      <label className="text-[10px] font-bold text-[#4facfe] text-center mb-2 uppercase truncate print:text-black">
        {label}
      </label>
      <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-dashed border-[#4facfe]/30 bg-[#4facfe]/5 hover:bg-[#4facfe]/10 transition-all p-1 flex flex-wrap gap-1 items-center justify-center print:border-black print:bg-transparent">
        
        {/* โชว์รูปที่อัปโหลดแล้ว */}
        {currentImages.map((img, idx) => {
          const url = typeof img === 'string' ? img : URL.createObjectURL(img);
          return (
            <div key={idx} className="relative w-[calc(50%-2px)] h-[calc(50%-2px)] rounded-lg overflow-hidden group">
              <img
                src={url}
                alt={`${label} ${idx}`}
                // 🌟 ฟังก์ชันคลิกเพื่อเปิดรูปใหญ่
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPreview) onPreview(url);
                }}
                className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(id, idx); }} 
                className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 z-10 no-print"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}

        {/* ปุ่มอัปโหลดรูปเพิ่ม (ถ้ายังไม่ครบโควต้า) */}
        {currentImages.length < max && (
          <div className="relative w-full h-full flex flex-col items-center justify-center opacity-50 hover:opacity-100 cursor-pointer text-[#4facfe] transition-all print:text-black">
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer z-10 no-print" 
              onChange={(e) => onChange(id, e.target.files)} 
              accept="image/*" 
            />
            {currentImages.length === 0 ? (
              <>
                <ImagePlus size={24} className="mb-1" />
                <span className="text-[9px] font-bold">MAX {max} FILES</span>
              </>
            ) : (
              <span className="text-[20px] font-bold">+</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------
// 4. CustomSelect Component (Dropdown)
// ---------------------------------------------
export const CustomSelect = ({ options = [], value, onChange, placeholder = "-- Select --" }) => {
  return (
    <div className="relative w-full h-[40px]">
      <select
        value={value || ""}
        onChange={onChange}
        className="w-full h-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-[#6f7bf7] transition-colors cursor-pointer print:text-black print:border-black print:bg-transparent"
      >
        <option value="" disabled className="bg-[#1a1f35]">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt} className="bg-[#1a1f35] text-white">
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 print:hidden">
        <ChevronDown size={14} />
      </div>
    </div>
  );
};

// ---------------------------------------------
// 5. GlassInput Component (ช่องกรอกข้อความ)
// ---------------------------------------------
export const GlassInput = ({ label, thLabel, placeholder, type = "text", gridClass = "", value, onChange }) => {
  return (
    <div className={`flex flex-col ${gridClass}`}>
      {(label || thLabel) && (
        <label className="text-[10px] font-bold text-white/50 mb-2 uppercase flex items-center gap-1 print:text-black">
          {label} {thLabel && <span className="text-[9px] text-white/30 font-normal print:text-black">{thLabel}</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-white/20 focus:outline-none focus:border-[#6f7bf7]/50 focus:bg-[#6f7bf7]/10 transition-all print:border-b print:border-black print:bg-transparent print:rounded-none print:text-black print:px-0"
      />
    </div>
  );
};
