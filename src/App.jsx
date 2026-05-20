import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Home, ClipboardList, LogOut, Lock, LayoutDashboard, Cpu, Plus } from 'lucide-react';
import logoUtac from './assets/logo-utac.png';
import HomePage from './pages/HomePage.jsx';
import FormPage from './pages/FormPage.jsx';
import PhotoPage from './pages/PhotoPage.jsx';
import { GlassCard, GlassInput } from './components/UIComponents.jsx';

export const API_URL = "http://localhost:3000"; 

export default function App() {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('iqc_auth');
    return savedAuth ? JSON.parse(savedAuth) : null;
  }); 

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [page, setPage] = useState('home');
  const [step, setStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState({ pkg: [], sck: [], pin: [], mnt: [] });
  const [uploadedImages, setUploadedImages] = useState({});
  
  // 🌟 State ควบคุมหน้าต่างป๊อปอัพคำขอส่งใบเปลี่ยนพิน
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinRequestForm, setPinRequestForm] = useState({ location: '', contac_no: '', contac_sn: '' });
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const [formData, setFormData] = useState({
    hwName: "", supplier: "", dateRecv: "", invoiceNo: "", hwDesc: "", poNo: "", serialNo: "", customer: "", owner: "Contactor", sendBy: "", location: "",
    chk_pin1: "", part_pin1: "", qty_pin1: "", chk_sck1: "", part_sck1: "", qty_sck1: "", chk_aln1: "", part_align1: "", qty_align1: ""
  });

  const isDocComplete = uploadedDocs.pkg.length > 0 || uploadedDocs.sck.length > 0 || uploadedDocs.pin.length > 0 || uploadedDocs.mnt.length > 0;

  const handleFileChange = (docId, files) => { setUploadedDocs(p => ({ ...p, [docId]: files })); };
  const handleImageChange = (e, id) => { const file = e.target.files[0]; if (file) setUploadedImages(p => ({ ...p, [id]: file })); };
  const handleMultiImageChange = (e, id, max = 4) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadedImages(p => { const current = p[id] || []; const newFiles = files.slice(0, max - current.length); return { ...p, [id]: [...current, ...newFiles] }; });
  };
  const removeImage = (id) => setUploadedImages(p => { const n={...p}; delete n[id]; return n; });
  const removeMultiImage = (id, index) => { setUploadedImages(p => { const current = p[id] || []; const updated = current.filter((_, i) => i !== index); const n = { ...p, [id]: updated }; if (updated.length === 0) delete n[id]; return n; }); };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        setAuth(data);
        localStorage.setItem('iqc_auth', JSON.stringify(data)); 
      } else {
        setLoginError("Invalid credentials.");
      }
    } catch (err) { setLoginError("Server offline."); }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('iqc_auth');
  };

  // ส่งใบคำขอไปเก็บยังคิวของฐานข้อมูลหลังบ้าน
  const handlePinRequestSubmit = async (e) => {
    e.preventDefault();
    if(!pinRequestForm.location || !pinRequestForm.contac_no) return alert("Please fill in location and Contac No.");
    try {
      const res = await fetch(`${API_URL}/api/pin-change-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify(pinRequestForm)
      });
      if(res.ok) {
        alert("✅ Request Pin Changing Submitted Successfully!");
        setPinRequestForm({ location: '', contac_no: '', contac_sn: '' });
        setIsPinModalOpen(false);
        setTriggerRefresh(prev => prev + 1); // ยิงสัญญาณรีเฟรชตารางหน้า Home อัตโนมัติ
      }
    } catch (err) { alert(err.message); }
  };

  const resetFormAndGoHome = () => {
    setFormData({
      hwName: "", supplier: "", dateRecv: "", invoiceNo: "", hwDesc: "", poNo: "", serialNo: "", customer: "", owner: "Contactor", sendBy: "", location: "",
      chk_pin1: "", part_pin1: "", qty_pin1: "", chk_sck1: "", part_sck1: "", qty_sck1: "", chk_aln1: "", part_align1: "", qty_align1: ""
    });
    setUploadedDocs({ pkg: [], sck: [], pin: [], mnt: [] });
    setUploadedImages({});
    setStep(1);
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center font-sans">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }} className="absolute w-[80vw] h-[80vw] bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] rounded-full blur-[120px] opacity-40 z-0" />
        <div className="z-10 w-full max-w-md p-4">
          <GlassCard className="!p-10 flex flex-col items-center">
            <img src={logoUtac} alt="UTAC" className="h-14 mb-8" />
            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><Lock size={20}/> SECURE LOGIN</h2>
            <p className="text-white/40 text-xs mb-8">Centralized Factory Portal</p>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <GlassInput name="username" label="Username" value={loginForm.username} onChange={(e)=>setLoginForm({...loginForm, username: e.target.value})} placeholder="Username" />
              <GlassInput name="password" type="password" label="Password" value={loginForm.password} onChange={(e)=>setLoginForm({...loginForm, password: e.target.value})} placeholder="Password" />
              {loginError && <p className="text-rose-500 text-xs text-center font-bold">{loginError}</p>}
              <button type="submit" className="w-full mt-4 bg-[#6f7bf7] hover:bg-[#5b66e0] text-white text-sm font-black tracking-widest uppercase py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(111,123,247,0.3)]">SIGN IN</button>
            </form>
          </GlassCard>
        </div>
      </div>
    );
  }

  const pageVariants = {
    initial: (direction) => ({ opacity: 0, x: direction > 0 ? 30 : -30 }),
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: (direction) => ({ opacity: 0, x: direction > 0 ? -30 : 30, transition: { duration: 0.2 } })
  };

  return (
    <div className="min-h-screen relative text-slate-200 overflow-x-hidden font-sans">
      <div className="fixed inset-0 z-[-1] no-print bg-[#0b0c10] flex items-center justify-center overflow-hidden">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute w-[80vw] h-[80vw] bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] rounded-full blur-[120px] opacity-40" />
      </div>

      <header className="fixed top-0 inset-x-0 z-[999] bg-black/40 backdrop-blur-3xl border-b border-white/5 no-print shadow-sm">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-4 w-[20%]">
            <img src={logoUtac} alt="UTAC" className="h-10 w-auto object-contain" />
            <h1 className="text-xl font-black text-white uppercase tracking-tighter hidden lg:block">IQC Hub</h1>
          </div>
          
          {/* 🌟 Center Menu: มีปุ่มเปิด Request Pin Changing โชว์เด่นอยู่ตรงกลางสำหรับทุกๆ Role */}
          <div className="flex justify-center items-center gap-3 w-[60%]">
            <button onClick={() => { setPage('home'); setStep(1); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${page === 'home' ? 'bg-[#6f7bf7] text-white shadow-[0_0_15px_rgba(111,123,247,0.5)]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              <LayoutDashboard size={14} /> Status Query
            </button>

            {/* ปุ่มเวทมนตร์ส่งคำขอเปลี่ยนพิน เปิดสิทธิ์เสรีภาพให้ทุกสิทธิ์กดได้จากใจกลางแดชบอร์ด */}
            <button onClick={() => setIsPinModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]">
              <Cpu size={14} /> Request Pin Changing
            </button>
            
            {auth.role !== 'viewer' && (
              <button onClick={() => { setPage('iqc'); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${page === 'iqc' || page === 'photo' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                <ClipboardList size={14} /> + IQC Form
              </button>
            )}
          </div>

          <div className="flex justify-end items-center gap-3 w-[20%]">
             <div className="hidden xl:flex flex-col text-right justify-center pr-3 border-r border-white/10">
               <span className="text-xs font-bold text-white leading-tight">{auth.name}</span>
               <span className="text-[9px] uppercase tracking-widest text-[#6f7bf7]">{auth.role}</span>
             </div>
             <button onClick={() => window.print()} className="bg-white/10 p-2.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all text-white/70"><Printer size={18}/></button>
             <button onClick={handleLogout} className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><LogOut size={18}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-[1540px] mx-auto px-4 md:px-6 pt-32 pb-40 print:p-0">
        <AnimatePresence mode="wait" custom={step}>
          {page === 'home' && (
            <motion.div key={`home_${triggerRefresh}`} custom={-1} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <HomePage setPage={setPage} auth={auth} triggerRefresh={triggerRefresh} />
            </motion.div>
          )}
          {page === 'iqc' && step === 1 && (
            <motion.div key="step1" custom={1} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <FormPage formData={formData} setFormData={setFormData} uploadedDocs={uploadedDocs} handleFileChange={handleFileChange} removeFile={(id)=>handleFileChange(id, [])} onNext={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </motion.div>
          )}
          {page === 'iqc' && step === 2 && (
            <motion.div key="step2" custom={1} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PhotoPage auth={auth} formData={formData} uploadedDocs={uploadedDocs} uploadedImages={uploadedImages} handleImageChange={handleImageChange} removeImage={removeImage} handleMultiImageChange={handleMultiImageChange} removeMultiImage={removeMultiImage} onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} isDocComplete={isDocComplete} onSuccess={resetFormAndGoHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🌟 WINDOWS MODAL OVERLAY: หน้าต่างป๊อปอัพสำหรับสร้าง Request Pin Changing */}
      <AnimatePresence>
        {isPinModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-md">
              <GlassCard className="!p-8 relative border-fuchsia-500/30">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <Cpu className="text-fuchsia-400" />
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Pin Changing Request</h3>
                </div>
                <form onSubmit={handlePinRequestSubmit} className="space-y-5">
                  <GlassInput name="location" label="Machine Location *" value={pinRequestForm.location} onChange={(e)=>setPinRequestForm({...pinRequestForm, location: e.target.value})} placeholder="e.g. LC-04" />
                  <GlassInput name="contac_no" label="Contac No. *" value={pinRequestForm.contac_no} onChange={(e)=>setPinRequestForm({...pinRequestForm, contac_no: e.target.value})} placeholder="e.g. CON-9981" />
                  <GlassInput name="contac_sn" label="Contac S/N" value={pinRequestForm.contac_sn} onChange={(e)=>setPinRequestForm({...pinRequestForm, contac_sn: e.target.value})} placeholder="e.g. SN-8827" />
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsPinModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3.5 rounded-xl transition-all">CANCEL</button>
                    <button type="submit" className="flex-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110 text-white text-xs font-black tracking-widest uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-1"><Plus size={14}/> SUBMIT REQ</button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
