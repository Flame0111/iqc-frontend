import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertCircle, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { GlassCard, GlassInput, CustomSelect, GlassRadio, FileUploadField } from '../components/UIComponents.jsx';
import { API_URL } from '../App.jsx';

export default function FormPage({ formData, setFormData, uploadedDocs, handleFileChange, removeFile, onNext, auth }) {
  
  const searchParams = new URLSearchParams(window.location.search);
  const editId = searchParams.get('edit');

  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const getActiveToken = () => {
    if (auth?.token) return auth.token;
    try {
      const localAuth = localStorage.getItem('auth');
      if (localAuth) {
         const parsed = JSON.parse(localAuth);
         if (parsed.token) return parsed.token;
      }
    } catch(e) { console.error("Parse auth error", e); }
    
    const justToken = localStorage.getItem('token');
    if (justToken) return justToken;
    
    return null; 
  };

  const activeToken = getActiveToken();

  useEffect(() => {
    if (editId && activeToken) {
      setIsLoadingDraft(true);
      fetch(`${API_URL}/api/iqc/${editId}`, { headers: { 'Authorization': `Bearer ${activeToken}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const r = data.data;
            const checklist = r.checklist_data || {};
            
            setFormData(prev => ({
              ...prev,
              hwName: r.hw_name || '',
              supplier: r.supplier || '',
              dateRecv: r.date_recv ? r.date_recv.split('T')[0] : '',
              invoiceNo: r.invoice_no || '',
              hwDesc: r.hw_desc || '',
              poNo: r.po_no || '',
              serialNo: r.serial_no || '',
              customer: r.customer || '',
              owner: r.owner || '',
              sendBy: r.send_by || '',
              location: r.location || '',
              ...checklist
            }));
          }
          setIsLoadingDraft(false);
        }).catch(err => { console.error(err); setIsLoadingDraft(false); });
    }
  }, [editId, activeToken, setFormData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    const currentToken = getActiveToken(); 

    if (!currentToken) {
      return alert("Session expired! ระบบหาบัตรผ่านไม่เจอ รบกวนกลับไปล็อกอินใหม่อีกครั้งครับ");
    }

    const submitData = new FormData();
    submitData.append('iqcData', JSON.stringify({ ...formData, jobStatus: 'Draft' }));

    const url = editId ? `${API_URL}/api/update-iqc/${editId}` : `${API_URL}/api/submit-iqc`;
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { 
        method: method, 
        headers: { 'Authorization': `Bearer ${currentToken}` }, 
        body: submitData 
      });
      const data = await res.json();
      if (data.success) {
        alert("บันทึกข้อมูลฉบับร่าง (Save Draft) สำเร็จเรียบร้อย!");
        window.location.href = '/'; 
      } else {
        alert("ไม่สามารถบันทึกได้: " + (data.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"));
      }
    } catch(err) { 
      console.error(err); 
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้");
    }
  };

  // ==========================================
  // 🌟 ฟังก์ชันเรียก AI จาก n8n Webhook
  // ==========================================
  const handleAIAutoFill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAILoading(true);
    
    const aiFormData = new FormData();
    aiFormData.append('file', file); // หรือ 'data' ขึ้นอยู่กับการตั้งค่าใน n8n

    try {
      // ⚠️ เปลี่ยน URL ตรงนี้เป็น Webhook URL ของ n8n
      const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/ai-drawing-reader";
      
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: aiFormData
      });
      
      const aiData = await res.json();
      
      // อัปเดตข้อมูลที่ AI อ่านได้ลงใน Form
      setFormData(prev => ({
        ...prev,
        ...aiData 
      }));
      
      alert("✨ AI แยกข้อมูลจาก Drawing สำเร็จแล้ว!");
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบ n8n Webhook หรือรูปแบบไฟล์");
    } finally {
      setIsAILoading(false);
      e.target.value = null; 
    }
  };

  const contactPinItems = [
    {id: 'pin1', en: '1.1 Signal pin#1', th: '(พินสัญญาณ#1)'},
    {id: 'pin2', en: '1.2 Signal pin#2', th: '(พินสัญญาณ#2)'}, 
    {id: 'pin3', en: '1.3 Signal pin#3', th: '(พินสัญญาณ#3)'}, 
    {id: 'pin4', en: '1.4 Ground pin#1', th: '(พินต่อลงดิน#1)'}
  ];
  
  const socketItems = [
    {id: 'sck1', en: '2.1 Socket housing body', th: '(ตัวซ็อกเก็ต)'},
    {id: 'sck2', en: '2.2 Socket housing cover', th: '(ฝาซ็อกเก็ต)'}, 
    {id: 'sck3', en: '2.3 Socket housing screw', th: '(สกรูยึดซ็อกเก็ต)'}, 
    {id: 'sck4', en: '2.4 Socket housing guide', th: '(พินนำซ็อกเก็ต)'}, 
    {id: 'sck5', en: '2.5 Socket frame', th: '(โครงซ็อกเก็ต)'}
  ];
  
  const alignmentItems = [
    {id: 'aln1', en: '3.1 Alignment plate', th: '(แผ่นจัดแนว)'},
    {id: 'aln2', en: '3.2 Alignment plate screw', th: '(สกรูแผ่นจัดแนว)'}
  ];

  const specificMapItems = [
    { id: 'map1', label: '1.1 Color difference', th: '(สีแตกต่างกันหรือไม่)' },
    { id: 'map2', label: '1.2 Fiducial', th: '(จุดอ้างอิง)' },
    { id: 'map3', label: '1.3 Step down', th: '(มีสเตปหรือไม่)', hint: 'Must be a step down of at least 1.5x of device thinness.' }
  ];

  const specificPnpItems = [
    { id: 'pnp1', label: '2.1 Slot for DDD function.', th: '(มีช่องสำหรับฟังก์ชั่น DDD)' },
    { id: 'pnp2', label: '2.2 Chamfer least 30 degree.', th: '(มีมุมเอียงอย่างน้อย 30 องศา)' },
    { id: 'pnp3', label: '2.3 Pocket size alignment', th: '', hint: "Must not deviated from 50% of device's width." }
  ];

  const peList = ["Yada Ch.", "Ekaphat W.", "Bhamornkiat Ch.","Kiattisak C.", "Natthakarn P.", "Natdanai Ch", "Weera T.", "Saranyu L.", "Kasipat M.", "Pakapol S.", "Jettanat P.", "Sasiwan L.", "Chayanon S.", "Phongphon P.", "Ekkaraj J.", "Alisa T.", "Warisa P.", "Orawan B.", "Thanapol Pu.", "Peephat Th.", "Kittisak Y.", "Jutamas Ch.", "Chollitha A.", "Kittithon T."];
  const managerList = ["Aroon S.", "Wichai M."];

  if (isLoadingDraft) return <div className="text-white text-center py-20 font-black tracking-widest uppercase animate-pulse">Loading Draft Record...</div>;

  return (
    <div className="space-y-6 print:block fade-in relative print:pt-6">
      
      {/* แสดงเฉพาะตอน Print - มุมขวาบน */}
      <div className="hidden print:flex flex-col items-end absolute top-0 right-0 z-50">
        <div className="mb-1">
          <span className="text-[10px] font-bold text-black uppercase">Verified By : DCC</span>
        </div>
        <div className="text-[10px] font-bold text-black uppercase">
          Refer : TS-H/W-002
        </div>
        <div className="text-[10px] font-bold text-black uppercase">
          Serial : 03
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 1: RECEIVING PROFILE              */}
      {/* ========================================== */}
      <GlassCard className="z-[50] print:border-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4 print:border-none print:mb-2 print:pb-0">
          <div className="flex items-center gap-3">
            <FileText className="text-white no-print" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white print:text-black">
              Section 1: Receiving Profile <span className="print-hide-th text-[10px] font-normal opacity-50 tracking-normal">(ส่วนที่ 1: รับฮาร์ดแวร์)</span>
            </h2>
          </div>
          
          {/* 🌟 ปุ่ม AI Auto-Fill (ซ่อนตอนปริ้นท์) */}
          <div className="relative group no-print">
            <input 
              type="file" 
              accept=".pdf,image/*"
              onChange={handleAIAutoFill}
              disabled={isAILoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              title="Upload Drawing to Auto-Fill"
            />
            <button 
              disabled={isAILoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-lg
                ${isAILoading 
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-wait' 
                  : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white border border-fuchsia-400/30 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                }`}
            >
              {isAILoading ? (
                <><span className="animate-spin text-fuchsia-400">⏳</span> Processing...</>
              ) : (
                <><Sparkles size={14} /> AI Auto-Fill</>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 print:gap-x-4 print:gap-y-2">
          <GlassInput name="hwName" label="Hardware Name" thLabel="(ชื่อฮาร์ดแวร์)" value={formData.hwName || ''} onChange={handleChange} />
          <GlassInput name="supplier" label="Supplier" thLabel="(ผู้ผลิต)" value={formData.supplier || ''} onChange={handleChange} />
          <GlassInput name="dateRecv" label="Date Received" thLabel="(วันที่รับ)" type="date" value={formData.dateRecv || ''} onChange={handleChange} />
          <GlassInput name="invoiceNo" label="Invoice No" thLabel="(หมายเลขอินวอยซ์)" value={formData.invoiceNo || ''} onChange={handleChange} />
          <GlassInput name="hwDesc" label="Hardware Description" thLabel="(รายละเอียดในอินวอยซ์)" value={formData.hwDesc || ''} onChange={handleChange} gridClass="col-span-2" />
          <GlassInput name="poNo" label="PO No#" thLabel="(หมายเลข PO#)" value={formData.poNo || ''} onChange={handleChange} />
          <GlassInput name="serialNo" label="S/N" thLabel="(ซีเรียลนัมเบอร์)" value={formData.serialNo || ''} onChange={handleChange} />
          <GlassInput name="customer" label="Customer" thLabel="(ลูกค้า)" value={formData.customer || ''} onChange={handleChange} />
          <GlassInput name="owner" label="Owner" thLabel="(เจ้าของฮาร์ดแวร์)" value={formData.owner || ''} onChange={handleChange} />
          <GlassInput name="sendBy" label="Send by" thLabel="(ส่งมาโดย)" value={formData.sendBy || ''} onChange={handleChange} />
          <div className="hidden md:block print:hidden"></div>
          
          <CustomSelect name="peName" value={formData.peName || ''} onChange={handleChange} label="Engineer Name" thLabel="(ชื่อเอ็นจิเนียร์)" options={peList} gridClass="col-span-2" />
          <GlassInput name="location" label="HW Location" thLabel="(โลเคชั่น)" value={formData.location || ''} onChange={handleChange} gridClass="col-span-2" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:grid-cols-2 relative z-[40]">
        
        {/* ========================================== */}
        {/* SECTION 2: CHECKLIST                       */}
        {/* ========================================== */}
        <GlassCard className="h-full print:border-none">
          <h2 className="text-sm font-black text-fuchsia-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 print:text-black print:mb-1 print:pb-0 print:border-none">
            <CheckCircle2 className="w-5 h-5 no-print inline-block mr-2 text-fuchsia-400" /> Section 2: Checklist <span className="print-hide-th text-[10px] font-normal opacity-50 tracking-normal">(ส่วนที่ 2: รายการตรวจสอบ)</span>
          </h2>
          <div className="space-y-6 print:space-y-2">
            
            <div className="overflow-x-auto rounded-2xl border border-white/10 print:border-none print:rounded-none bg-white/[0.02] print:bg-transparent">
              <table className="w-full text-sm glass-table print:text-[9px]">
                <thead>
                  <tr>
                    <th className="text-left pl-4 w-[35%]">Documentation</th>
                    <th className="w-[10%]">Yes</th><th className="w-[10%]">No</th>
                    <th className="text-left pl-4 w-[25%]">Remarks</th>
                    <th className="no-print w-[20%] pr-4">Attach PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { k: 'pkg', n: 'Package Outline Drawing', th: '(ภาพวาดโครงร่างแพ็กเกจ)', req: true, btnLabel: 'Attach' },
                    { k: 'sck', n: 'Socket Drawing', th: '(ภาพวาดซ็อกเก็ต)', req: true, btnLabel: 'Attach' },
                    { k: 'pin', n: 'Contact pin Drawing', th: '(ภาพวาดพินคอนแทค)', req: true, btnLabel: 'Attach' },
                    { k: 'mnt', n: 'Maintenance guide line', th: '(คู่มือการบำรุงรักษา)', req: false, btnLabel: 'Optional' }
                  ].map((d) => (
                    <tr key={d.k} className="hover:bg-white/5 print:hover:bg-transparent">
                      <td className="pl-4 py-2 leading-tight">{d.n} {d.req && <span className="text-rose-500">*</span>}<span className="print-hide-th text-[9px] text-white/40 block">{d.th}</span></td>
                      <GlassRadio name={`doc_${d.k}`} value="yes" checked={formData[`doc_${d.k}`] === "yes"} onChange={handleChange} />
                      <GlassRadio name={`doc_${d.k}`} value="no" checked={formData[`doc_${d.k}`] === "no"} onChange={handleChange} />
                      <td className="pl-4 pr-6 align-bottom pb-3 print:pb-0">
                         <input type="text" name={`remark_doc_${d.k}`} value={formData[`remark_doc_${d.k}`] || ""} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 outline-none text-xs pb-0.5 text-white/80" placeholder="Remarks..." />
                      </td>
                      <td className="no-print pr-4 py-2 h-14 relative">
                        <FileUploadField docId={d.k} label={d.btnLabel} onFileChange={(docId, files) => { if(files.length === 0) removeFile(docId); else handleFileChange(docId, files); }} currentFiles={uploadedDocs[d.k]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 print:border-none print:rounded-none bg-white/[0.02] print:bg-transparent">
              <table className="w-full text-sm glass-table print:text-[9px]">
                <thead>
                  <tr>
                    <th className="text-left pl-4 w-[40%]">Information of contactor</th>
                    <th>Yes</th><th>No</th><th>Part number</th><th className="text-fuchsia-400 print:text-black">Stock No.</th><th className="w-12">Q'ty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white/5 print:bg-transparent"><td colSpan="6" className="pl-4 py-1 text-[10px] font-bold text-white print:text-black uppercase print:text-[9px]">1.Contact pin</td></tr>
                  {contactPinItems.map(i => (
                    <tr key={i.id} className="hover:bg-white/5 print:hover:bg-transparent">
                      <td className="pl-6 text-[11px] text-white/60 print:text-black py-1 leading-tight print:text-[9px]">{i.en} <span className="print-hide-th block text-[8px] text-white/30">{i.th}</span></td>
                      <GlassRadio name={`chk_${i.id}`} value="yes" checked={formData[`chk_${i.id}`] === "yes"} onChange={handleChange} />
                      <GlassRadio name={`chk_${i.id}`} value="no" checked={formData[`chk_${i.id}`] === "no"} onChange={handleChange} />
                      <td><input name={`part_${i.id}`} value={formData[`part_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent text-center text-[10px] text-white print:text-black" placeholder="-" /></td>
                      <td><input name={`stk_${i.id}`} value={formData[`stk_${i.id}`] || ""} onChange={handleChange} className="w-full bg-white/5 rounded text-center text-purple-300 text-[10px] py-1 outline-none print:bg-transparent print:text-black" placeholder="Stk-" /></td>
                      <td><input name={`qty_${i.id}`} value={formData[`qty_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent text-center text-[10px] text-white print:text-black" placeholder="0" /></td>
                    </tr>
                  ))}

                  <tr className="bg-white/5 print:bg-transparent"><td colSpan="6" className="pl-4 py-1 text-[10px] font-bold text-white print:text-black uppercase print:text-[9px]">2.Socket /Housing</td></tr>
                  {socketItems.map(i => (
                    <tr key={i.id} className="hover:bg-white/5 print:hover:bg-transparent">
                      <td className="pl-6 text-[11px] text-white/60 print:text-black py-1 leading-tight print:text-[9px]">{i.en} <span className="print-hide-th block text-[8px] text-white/30">{i.th}</span></td>
                      <GlassRadio name={`chk_${i.id}`} value="yes" checked={formData[`chk_${i.id}`] === "yes"} onChange={handleChange} />
                      <GlassRadio name={`chk_${i.id}`} value="no" checked={formData[`chk_${i.id}`] === "no"} onChange={handleChange} />
                      <td><input name={`part_${i.id}`} value={formData[`part_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent text-center text-[10px] text-white print:text-black" placeholder="-" /></td>
                      <td><input name={`stk_${i.id}`} value={formData[`stk_${i.id}`] || ""} onChange={handleChange} className="w-full bg-white/5 rounded text-center text-purple-300 text-[10px] py-1 outline-none print:bg-transparent print:text-black" placeholder="Stk-" /></td>
                      <td><input name={`qty_${i.id}`} value={formData[`qty_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent text-center text-[10px] text-white print:text-black" placeholder="0" /></td>
                    </tr>
                  ))}

                  <tr className="bg-white/5 print:bg-transparent"><td colSpan="6" className="pl-4 py-1 text-[10px] font-bold text-white print:text-black uppercase print:text-[9px]">3.Alignment plate</td></tr>
                  {alignmentItems.map(i => (
                    <tr key={i.id} className="hover:bg-white/5 print:hover:bg-transparent">
                      <td className="pl-6 text-[11px] text-white/60 print:text-black py-1 leading-tight print:text-[9px]">{i.en} <span className="print-hide-th block text-[8px] text-white/30">{i.th}</span></td>
                      <GlassRadio name={`chk_${i.id}`} value="yes" checked={formData[`chk_${i.id}`] === "yes"} onChange={handleChange} />
                      <GlassRadio name={`chk_${i.id}`} value="no" checked={formData[`chk_${i.id}`] === "no"} onChange={handleChange} />
                      <td><input name={`part_${i.id}`} value={formData[`part_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent text-center text-[10px] text-white print:text-black" placeholder="-" /></td>
                      <td><input name={`stk_${i.id}`} value={formData[`stk_${i.id}`] || ""} onChange={handleChange} className="w-full bg-white/5 rounded text-center text-purple-300 text-[10px] py-1 outline-none print:bg-transparent print:text-black" placeholder="Stk-" /></td>
                      <td><input name={`qty_${i.id}`} value={formData[`qty_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent text-center text-[10px] text-white print:text-black" placeholder="0" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* ========================================== */}
        {/* SECTION 3: VISUAL AUDIT                    */}
        {/* ========================================== */}
        <GlassCard className="h-full print:border-none">
          <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 print:text-black print:mb-1 print:pb-0 print:border-none">
            <Activity className="w-5 h-5 no-print inline-block mr-2 text-cyan-400" /> Section 3: Visual Inspection
          </h2>
          <div className="space-y-6 print:space-y-2">
             <div className="overflow-x-auto rounded-2xl border border-white/10 print:border-none print:rounded-none bg-white/[0.02] print:bg-transparent">
                <table className="w-full text-sm glass-table print:text-[9px]">
                  <thead>
                    <tr>
                      <th className="text-left pl-4 w-[45%]">A. Standard</th>
                      <th className="text-emerald-400">New</th><th className="text-blue-400">Used</th><th className="text-rose-400">Dmg</th>
                      <th className="text-left pl-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white/5 print:bg-transparent"><td colSpan="5" className="pl-4 py-1.5 text-[10px] font-bold text-emerald-400 print:text-black uppercase print:text-[9px]">1.Contact pin</td></tr>
                    {contactPinItems.map(i => (
                      <tr key={`vis_${i.id}`} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="pl-6 text-[11px] text-white/60 print:text-black py-1 leading-tight print:text-[9px]">{i.en}</td>
                        <GlassRadio name={`vis_status_${i.id}`} value="new" checked={formData[`vis_status_${i.id}`] === "new"} onChange={handleChange} />
                        <GlassRadio name={`vis_status_${i.id}`} value="used" checked={formData[`vis_status_${i.id}`] === "used"} onChange={handleChange} />
                        <GlassRadio name={`vis_status_${i.id}`} value="dmg" checked={formData[`vis_status_${i.id}`] === "dmg"} onChange={handleChange} />
                        <td className="pl-4 pr-2"><input type="text" name={`vis_remark_${i.id}`} value={formData[`vis_remark_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 text-white print:text-black text-[10px] pb-0.5" placeholder="Remarks..." /></td>
                      </tr>
                    ))}
                    
                    <tr className="bg-white/5 print:bg-transparent"><td colSpan="5" className="pl-4 py-1.5 text-[10px] font-bold text-emerald-400 print:text-black uppercase print:text-[9px]">2.Socket /Housing</td></tr>
                    {socketItems.map(i => (
                      <tr key={`vis_${i.id}`} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="pl-6 text-[11px] text-white/60 print:text-black py-1 leading-tight print:text-[9px]">{i.en}</td>
                        <GlassRadio name={`vis_status_${i.id}`} value="new" checked={formData[`vis_status_${i.id}`] === "new"} onChange={handleChange} />
                        <GlassRadio name={`vis_status_${i.id}`} value="used" checked={formData[`vis_status_${i.id}`] === "used"} onChange={handleChange} />
                        <GlassRadio name={`vis_status_${i.id}`} value="dmg" checked={formData[`vis_status_${i.id}`] === "dmg"} onChange={handleChange} />
                        <td className="pl-4 pr-2"><input type="text" name={`vis_remark_${i.id}`} value={formData[`vis_remark_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 text-white print:text-black text-[10px] pb-0.5" placeholder="Remarks..." /></td>
                      </tr>
                    ))}

                    <tr className="bg-white/5 print:bg-transparent"><td colSpan="5" className="pl-4 py-1.5 text-[10px] font-bold text-emerald-400 print:text-black uppercase print:text-[9px]">3.Alignment plate</td></tr>
                    {alignmentItems.map(i => (
                      <tr key={`vis_${i.id}`} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="pl-6 text-[11px] text-white/60 print:text-black py-1 leading-tight print:text-[9px]">{i.en}</td>
                        <GlassRadio name={`vis_status_${i.id}`} value="new" checked={formData[`vis_status_${i.id}`] === "new"} onChange={handleChange} />
                        <GlassRadio name={`vis_status_${i.id}`} value="used" checked={formData[`vis_status_${i.id}`] === "used"} onChange={handleChange} />
                        <GlassRadio name={`vis_status_${i.id}`} value="dmg" checked={formData[`vis_status_${i.id}`] === "dmg"} onChange={handleChange} />
                        <td className="pl-4 pr-2"><input type="text" name={`vis_remark_${i.id}`} value={formData[`vis_remark_${i.id}`] || ""} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 text-white print:text-black text-[10px] pb-0.5" placeholder="Remarks..." /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>

             <div className="overflow-x-auto rounded-2xl border border-white/10 print:border-none print:rounded-none bg-white/[0.02] print:bg-transparent">
                <table className="w-full text-sm glass-table print:text-[9px]">
                  <thead>
                    <tr><th className="text-left pl-4 w-[45%]">B. Specific</th><th>Pass</th><th>Fail</th><th className="text-left pl-4">Remarks</th></tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white/5 print:bg-transparent"><td colSpan="4" className="pl-4 py-1.5 text-[10px] font-bold text-white print:text-black uppercase print:text-[9px]">1.Map test socket</td></tr>
                    {specificMapItems.map(item => (
                      <tr key={item.id} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="pl-6 text-[11px] text-white/60 print:text-black leading-tight py-2 print:py-1 print:text-[9px]">{item.label} <br/><span className="print-hide-th text-[8px] text-white/30">{item.th}</span></td>
                        <GlassRadio name={`spec_${item.id}`} value="pass" checked={formData[`spec_${item.id}`] === "pass"} onChange={handleChange} />
                        <GlassRadio name={`spec_${item.id}`} value="fail" checked={formData[`spec_${item.id}`] === "fail"} onChange={handleChange} />
                        <td className="pl-4 pr-2"><input type="text" name={`spec_remark_${item.id}`} value={formData[`spec_remark_${item.id}`] || ""} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 outline-none text-[10px] pb-0.5 text-white print:text-black" placeholder="Remarks..." /></td>
                      </tr>
                    ))}
                    <tr className="bg-white/5 print:bg-transparent"><td colSpan="4" className="pl-4 py-1.5 text-[10px] font-bold text-white print:text-black uppercase print:text-[9px]">2.PnP / Turret test socket</td></tr>
                    {specificPnpItems.map(item => (
                      <tr key={item.id} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="pl-6 text-[11px] text-white/60 print:text-black leading-tight py-2 print:py-1 print:text-[9px]">{item.label} <br/><span className="print-hide-th text-[8px] text-white/30">{item.th}</span></td>
                        <GlassRadio name={`spec_${item.id}`} value="pass" checked={formData[`spec_${item.id}`] === "pass"} onChange={handleChange} />
                        <GlassRadio name={`spec_${item.id}`} value="fail" checked={formData[`spec_${item.id}`] === "fail"} onChange={handleChange} />
                        <td className="pl-4 pr-2"><input type="text" name={`spec_remark_${item.id}`} value={formData[`spec_remark_${item.id}`] || ""} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 outline-none text-[10px] pb-0.5 text-white print:text-black" placeholder="Remarks..." /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </GlassCard>
      </div>

      {/* ========================================== */}
      {/* SECTION 4: NON-CONFORMANCE & APPROVAL      */}
      {/* ========================================== */}
      <GlassCard className="border-t-[3px] border-rose-500/50 print:border-none mt-6 z-[30] print:mt-1 print:pt-1 print:pb-0 print:mb-0">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 print:mb-1 print:flex-row">
          <h2 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 print:text-black print:text-[10px]">
            <AlertCircle className="w-5 h-5 no-print text-rose-500" /> Section 4: Non-Conformance Action
          </h2>
          <div className="flex items-center gap-5 print:gap-3">
             <label className="flex items-center gap-1.5 cursor-pointer">
               <input type="radio" name="ncType" value="ncr" checked={formData.ncType === 'ncr'} onChange={handleChange} className="w-4 h-4 accent-rose-500 print:w-2 print:h-2" />
               <span className="text-xs font-bold text-rose-200 print:text-black print:text-[8px]">Non-conformance request</span>
             </label>
             <label className="flex items-center gap-1.5 cursor-pointer">
               <input type="radio" name="ncType" value="claim" checked={formData.ncType === 'claim'} onChange={handleChange} className="w-4 h-4 accent-rose-500 print:w-2 print:h-2" />
               <span className="text-xs font-bold text-rose-200 print:text-black print:text-[8px]">Customer claim / Complaint</span>
             </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:gap-2 items-start">
           
           <div className="lg:col-span-7 flex flex-col gap-5 print:gap-1">
              <div className="flex flex-col print:flex-row print:items-center gap-3 print:gap-1">
                 <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block print:text-black print:text-[8px] min-w-[60px]">Action Taken :</label>
                 <div className="flex flex-wrap gap-3 print:gap-1">
                    {[{ en: 'Internal Rework', th: 'internal' }, { en: 'External Rework', th: 'external' }, { en: 'Return Vendor', th: 'vendor' }, { en: 'Return Customer', th: 'customer' }].map(a => (
                      <label key={a.en} className="flex items-center gap-2 bg-[#000000]/50 border border-white/10 px-3 py-2 rounded-xl cursor-pointer hover:bg-white/10 no-print print:px-0 print:py-0 print:border-none print:flex print:items-center print:bg-transparent">
                        <input type="radio" name="nc_action" value={a.th} checked={formData.nc_action === a.th} onChange={handleChange} className="w-4 h-4 accent-rose-500 print:w-2 print:h-2" />
                        <span className="text-[11px] text-white/90 font-medium whitespace-nowrap print:text-black print:text-[8px]">{a.en}</span>
                      </label>
                    ))}
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 print:gap-2 print:items-end">
                <GlassInput name="vendorInfo" label="Vendor Info" value={formData.vendorInfo || ''} onChange={handleChange} />
                <GlassInput name="customerInfo" label="Customer Info" value={formData.customerInfo || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 gap-4 print:gap-1">
                 <GlassInput name="probDesc" label="Problem Description" value={formData.probDesc || ''} onChange={handleChange} />
                 <GlassInput name="preventAction" label="Action Taken/Prevention" value={formData.preventAction || ''} onChange={handleChange} />
              </div>
           </div>
           
           <div className="lg:col-span-5 grid grid-cols-2 gap-4 p-5 rounded-3xl bg-[#000000]/40 border border-white/5 items-end print:bg-transparent print:p-0 print:border-none print:rounded-none print:gap-x-2 print:gap-y-2 print:items-end">
              <CustomSelect name="reworkBy" value={formData.reworkBy || ''} onChange={handleChange} label="Rework By" options={peList} />
              <GlassInput name="ncDate" label="Date" type="date" value={formData.ncDate || ''} onChange={handleChange} />
              
              <div className="col-span-2 print:border-none print:pt-1">
                <CustomSelect name="approvalPE" value={formData.approvalPE || ''} onChange={handleChange} label="Approval (PE)" options={peList} />
              </div>
              
              <CustomSelect name="ackManager" value={formData.ackManager || ''} onChange={handleChange} label="Acknowledge (Manager)" options={managerList} />
              <GlassInput name="empNo" label="Sign / Emp No." value={formData.empNo || ''} onChange={handleChange} />
           </div>
           
        </div>
      </GlassCard>

      <div className="flex justify-end items-center gap-4 no-print pt-10 pb-10">
        <motion.button 
          type="button"
          onClick={handleSaveDraft}
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          className="bg-zinc-800 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black font-black py-4 px-8 rounded-2xl shadow-xl transition-all"
        >
          SAVE AS DRAFT
        </motion.button>
        
        <motion.button 
          onClick={onNext} 
          whileHover={{ scale: 1.05, x: 5 }} 
          whileTap={{ scale: 0.95 }} 
          className="bg-[#6f7bf7] hover:bg-[#5b66e0] text-white font-black py-4 px-10 rounded-2xl shadow-xl flex items-center gap-3 transition-colors"
        >
          NEXT: PHOTO UPLOAD <ArrowRight size={20}/>
        </motion.button>
      </div>

    </div>
  );
}
