import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, ArrowLeft, Save, Lock, Loader2, ChevronDown } from 'lucide-react';
import { GlassCard, ImageUploadBox, MultiImageUploadBox, CustomSelect, GlassInput } from '../components/UIComponents.jsx';
import { API_URL } from '../App.jsx';

export default function PhotoPage({ 
  auth, formData, uploadedDocs, uploadedImages, 
  handleImageChange, removeImage, handleMultiImageChange, removeMultiImage, 
  onBack, isDocComplete, onSuccess, setFormData 
}) {
  const resultOptions = ["PASS", "FAIL"];
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🌟 State สำหรับเปิด/ปิด Dropdown แบบ Custom
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const submitToDatabase = async () => {
    if (!isDocComplete) return;
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      
      const textData = { 
        ...formData, 
        finalResult: formData.finalResult || "PASS", 
        checkedBy: formData.checkedBy || auth.name 
      };
      payload.append("iqcData", JSON.stringify(textData));

      Object.keys(uploadedDocs).forEach(docKey => {
        uploadedDocs[docKey].forEach(file => payload.append(`document_${docKey}`, file));
      });

      Object.keys(uploadedImages).forEach(imgKey => {
         const imageFile = uploadedImages[imgKey]; 
         if (Array.isArray(imageFile)) imageFile.forEach(img => payload.append(`image_${imgKey}`, img));
         else payload.append(`image_${imgKey}`, imageFile);
      });
      
      const response = await fetch(`${API_URL}/api/submit-iqc`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: payload, 
      });

      if (response.ok) {
        alert("✅ บันทึกข้อมูลและไฟล์ลงระบบเรียบร้อยแล้ว!");
        onSuccess(); 
      } else {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || `Server Error`);
      }
    } catch (error) {
      alert("❌ ไม่สามารถบันทึกข้อมูลได้\n\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 print:block">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4"><ImagePlus className="text-[#6f7bf7] no-print" /><h2 className="text-sm font-black uppercase text-[#6f7bf7] print:text-black">Section 5: Photographic Evidence</h2></div>
        
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1000px] flex flex-col gap-8 print:min-w-full">
            <div className="flex bg-blue-900/10 border border-blue-500/20 rounded-3xl p-4 print:p-0 print:border-black print:bg-transparent">
              <div className="w-[45px] flex items-center justify-center border-r border-blue-500/20 pr-4 mr-4 print:border-black"><span className="-rotate-90 whitespace-nowrap font-black text-blue-400 text-xs print:text-black">FRONT / TOP</span></div>
              <div className="flex-1 grid grid-cols-8 gap-3">
                 <ImageUploadBox id="f1" label="Before unpack" image={uploadedImages.f1} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="f2" label="After unpack" image={uploadedImages.f2} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="f3" label="FRONT / TOP" image={uploadedImages.f3} onChange={handleImageChange} onRemove={removeImage} />
                 <MultiImageUploadBox id="f4" label="Out side" images={uploadedImages.f4} onChange={handleMultiImageChange} onRemove={removeMultiImage} max={4} />
                 <ImageUploadBox id="f5" label="Serial & Ref" image={uploadedImages.f5} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="f6" label="Text on socket" image={uploadedImages.f6} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="f7" label="Contactor pin" image={uploadedImages.f7} onChange={handleImageChange} onRemove={removeImage} />
                 <div className="flex flex-col justify-end pb-1 border-l border-white/10 pl-3 print:border-black"><label className="text-[10px] font-bold text-white/50 text-center mb-2 uppercase print:text-black">Result</label><CustomSelect options={resultOptions} /></div>
              </div>
            </div>

            <div className="flex bg-amber-900/10 border border-amber-500/20 rounded-3xl p-4 print:p-0 print:border-black print:bg-transparent">
              <div className="w-[45px] flex items-center justify-center border-r border-amber-500/20 pr-4 mr-4 print:border-black"><span className="-rotate-90 whitespace-nowrap font-black text-amber-400 text-xs print:text-black">BACK / BOTTOM</span></div>
              <div className="flex-1 grid grid-cols-8 gap-3">
                 <ImageUploadBox id="b1" label="Before unpack" image={uploadedImages.b1} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="b2" label="After unpack" image={uploadedImages.b2} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="b3" label="BACK / BOTTOM" image={uploadedImages.b3} onChange={handleImageChange} onRemove={removeImage} />
                 <MultiImageUploadBox id="b4" label="Out side" images={uploadedImages.b4} onChange={handleMultiImageChange} onRemove={removeMultiImage} max={4} />
                 <ImageUploadBox id="b5" label="Serial & Ref" image={uploadedImages.b5} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="b6" label="Text on socket" image={uploadedImages.b6} onChange={handleImageChange} onRemove={removeImage} />
                 <ImageUploadBox id="b7" label="Contactor pin" image={uploadedImages.b7} onChange={handleImageChange} onRemove={removeImage} />
                 <div className="flex flex-col justify-end pb-1 border-l border-white/10 pl-3 print:border-black"><label className="text-[10px] font-bold text-white/50 text-center mb-2 uppercase print:text-black">Result</label><CustomSelect options={resultOptions} /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 print:border-black"><GlassInput label="DETAILS (IF ANY)" placeholder="Enter details here..." /></div>
      </GlassCard>

      <GlassCard className={`print:border-t-2 print:border-black print:!bg-transparent print:rounded-none transition-all duration-1000 z-[20] ${isDocComplete ? '!bg-gradient-to-r from-[#170a30] to-[#05000a] border-fuchsia-500/40' : 'border-dashed border-white/20 opacity-90'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 w-full md:w-2/3 items-end">
            <GlassInput label="Conclusion result" thLabel="(ผลสรุป)" value="Good Condition" gridClass="flex-1" />
            
            {/* 🌟 Custom Dropdown: สวยงาม คุม Style ได้ 100% และเซฟข้อมูลลง State ได้จริง */}
            <div className="relative flex flex-col w-48 z-[999] no-print">
              <label className="text-[10px] font-bold text-white/50 mb-1 uppercase flex items-center gap-1">
                Checked By <span className="text-[9px] text-white/30 font-normal">(ตรวจสอบโดย)</span>
              </label>
              
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold cursor-pointer flex justify-between items-center shadow-inner hover:border-[#6f7bf7]/50 transition-all"
              >
                <span className={formData.checkedBy ? "text-white" : "text-white/40"}>
                  {formData.checkedBy || "Select Name"}
                </span>
                <ChevronDown size={16} className={`text-white/40 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#6f7bf7]' : ''}`} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f35] border border-[#6f7bf7]/30 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[999]"
                  >
                    {["Benyathip C.", "Sukkasem S."].map((name) => (
                      <div 
                        key={name}
                        onClick={() => {
                          setFormData({ ...formData, checkedBy: name });
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${formData.checkedBy === name ? 'bg-[#6f7bf7]/20 text-[#6f7bf7]' : 'text-white hover:bg-white/5'}`}
                      >
                        {name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* ตัวแสดงผลตอน Print เพื่อไม่ให้ Dropdown ไปโผล่ในกระดาษ */}
            <div className="hidden print:block w-48">
               <label className="text-[10px] font-bold text-black mb-1 uppercase block">Checked By (ตรวจสอบโดย)</label>
               <div className="border-b border-black text-sm font-bold pb-1">{formData.checkedBy || "-"}</div>
            </div>
            
            <GlassInput label="Date" thLabel="(วันที่)" type="date" gridClass="w-36"/>
          </div>
          
          <div className={`relative p-5 rounded-2xl flex gap-10 print:bg-transparent print:border-none print:p-0 transition-all duration-500 ${isDocComplete ? 'bg-[#000000]/60 border border-fuchsia-500/20' : 'bg-[#000000]/40 border border-white/10'}`}>
            <AnimatePresence>
              {!isDocComplete && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-[-10px] z-20 bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center no-print border border-white/10">
                  <div className="bg-rose-500/20 text-rose-400 border border-rose-500/50 text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl">
                    <Lock size={14} /> UPLOAD 1 PDF TO UNLOCK
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="flex items-center gap-3 cursor-pointer group">
               <input 
                 type="radio" 
                 name="final" 
                 value="PASS"
                 checked={(formData.finalResult || "PASS") === "PASS"}
                 onChange={() => setFormData({ ...formData, finalResult: "PASS" })}
                 className="w-6 h-6 accent-emerald-500 print:w-4 print:h-4 no-print" 
                 disabled={!isDocComplete} 
               />
               <div className={`hidden print:block w-3 h-3 border border-black ${(formData.finalResult || 'PASS') === 'PASS' ? 'bg-black' : 'bg-white'}`}></div>
               <span className={`font-black text-3xl tracking-tighter print:text-black print:text-xl transition-colors ${isDocComplete ? ((formData.finalResult || 'PASS') === 'PASS' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-white/20 group-hover:text-white/40') : 'text-white/20'}`}>PASS</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
               <input 
                 type="radio" 
                 name="final" 
                 value="FAIL"
                 checked={formData.finalResult === "FAIL"}
                 onChange={() => setFormData({ ...formData, finalResult: "FAIL" })}
                 className="w-6 h-6 accent-rose-500 print:w-4 print:h-4 no-print" 
                 disabled={!isDocComplete} 
               />
               <div className={`hidden print:block w-3 h-3 border border-black ${formData.finalResult === 'FAIL' ? 'bg-black' : 'bg-white'}`}></div>
               <span className={`font-black text-3xl tracking-tighter print:text-black print:text-xl transition-colors ${isDocComplete ? (formData.finalResult === 'FAIL' ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'text-white/20 group-hover:text-white/40') : 'text-white/20'}`}>FAIL</span>
            </label>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-between no-print pt-10 pb-20">
        <motion.button whileHover={{ x: -5 }} onClick={onBack} className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl border border-white/10 flex items-center gap-3 transition-colors">
          <ArrowLeft size={20}/> BACK TO FORM
        </motion.button>
        <motion.button onClick={submitToDatabase} disabled={!isDocComplete || isSubmitting} whileHover={isDocComplete && !isSubmitting ? { scale: 1.05, y: -5, boxShadow: "0 0 40px rgba(111,123,247,0.4)" } : {}} whileTap={isDocComplete && !isSubmitting ? { scale: 0.95 } : {}} className={`font-black py-4 px-12 rounded-2xl flex items-center gap-3 transition-all ${isDocComplete && !isSubmitting ? 'bg-white text-black shadow-2xl cursor-pointer' : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'}`}>
          {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} {isSubmitting ? "SAVING TO DB..." : "SUBMIT TO SYSTEM"}
        </motion.button>
      </div>
    </div>
  );
}
