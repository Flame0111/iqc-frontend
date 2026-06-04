import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, LayoutDashboard, Cpu, Plus, LogOut, ClipboardList, User, KeyRound, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import logoUtac from './assets/logo-utac.png';
import HomePage from './pages/HomePage.jsx';
import FormPage from './pages/FormPage.jsx';
import PhotoPage from './pages/PhotoPage.jsx';
import { GlassCard, GlassInput } from './components/UIComponents.jsx';

export const API_URL = "https://iqc-api-server.onrender.com";

export default function App() {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('iqc_auth');
    return savedAuth ? JSON.parse(savedAuth) : null;
  }); 

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [page, setPage] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has('edit') ? 'iqc' : 'home';
  });

  const [step, setStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState({ pkg: [], sck: [], pin: [], mnt: [] });
  const [uploadedImages, setUploadedImages] = useState({});
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinRequestForm, setPinRequestForm] = useState({ 
    location: '', pin_no: '', stock_pin_no: '', name_socket: '', customer_name: '', req_name: '' 
  });
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const [formData, setFormData] = useState({
    hwName: "", supplier: "", dateRecv: "", invoiceNo: "", hwDesc: "", poNo: "", serialNo: "", customer: "", owner: "Contactor", sendBy: "", location: "", checkedBy: "", finalResult: "PASS",
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
        setLoginError("Access denied. Please check your ID and Password.");
      }
    } catch (err) { setLoginError("System offline. Unable to connect to server."); }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('iqc_auth');
  };

  const handlePinRequestSubmit = async (e) => {
    e.preventDefault();
    if(!pinRequestForm.location || !pinRequestForm.pin_no || !pinRequestForm.req_name) {
      return alert("Please fill in Machine Name, Pin No. and Requester Name.");
    }
    try {
      const res = await fetch(`${API_URL}/api/pin-change-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify(pinRequestForm)
      });
      if(res.ok) {
        setPinRequestForm({ location: '', pin_no: '', stock_pin_no: '', name_socket: '', customer_name: '', req_name: '' });
        setIsPinModalOpen(false);
        setTriggerRefresh(prev => prev + 1); 
      }
    } catch (err) { alert(err.message); }
  };

  const resetFormAndGoHome = () => {
    setFormData({
      hwName: "", supplier: "", dateRecv: "", invoiceNo: "", hwDesc: "", poNo: "", serialNo: "", customer: "", owner: "Contactor", sendBy: "", location: "", checkedBy: "", finalResult: "PASS",
      chk_pin1: "", part_pin1: "", qty_pin1: "", chk_sck1: "", part_sck1: "", qty_sck1: "", chk_aln1: "", part_align1: "", qty_align1: ""
    });
    setUploadedDocs({ pkg: [], sck: [], pin: [], mnt: [] });
    setUploadedImages({});
    setStep(1);
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // 🌟 DIMENSIONAL & DEEP 3D UI LOGIN (Super Senior Level)
  // ==========================================
  if (!auth) {
    return (
      <div className="min-h-screen bg-[#030406] flex items-center justify-center font-sans relative overflow-hidden">
        
        {/* Animated Background Orbs for Deep Lighting */}
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[#4f46e5] rounded-full blur-[150px] opacity-20 pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-[#a855f7] rounded-full blur-[150px] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
          className="z-10 w-full max-w-[440px] p-6 relative"
        >
          {/* Glass Card Container with Deep Shadows and Glossy Borders */}
          <div className="backdrop-blur-3xl backdrop-saturate-[1.2] bg-[#0a0c13]/70 border-t border-l border-white/10 border-r border-b border-black/80 rounded-[2rem] p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),_inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden">
            
            {/* Top Glossy Reflection */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

            {/* Header Section */}
            <div className="flex flex-col items-center mb-10 relative z-10">
              <div className="relative mb-6 group">
                 {/* Floating Puck Effect behind Logo */}
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                 <div className="w-20 h-20 bg-[#0f111a] border-t border-white/10 border-b border-black/50 shadow-[0_15px_25px_-5px_rgba(0,0,0,0.8),_inset_0_2px_4px_rgba(255,255,255,0.05)] rounded-[1.5rem] flex items-center justify-center relative z-10">
                   <img src={logoUtac} alt="UTAC" className="h-9 object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] opacity-95" />
                 </div>
              </div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight mb-2">IQC PORTAL</h2>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-full px-4 py-1.5 shadow-inner">
                <Sparkles size={12} className="text-[#a855f7]" />
                <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/70">Centralized Auth</p>
              </div>
            </div>

            {/* Dimensional Form */}
            <form onSubmit={handleLogin} className="w-full space-y-6 relative z-10">
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-2">Employee ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="w-5 h-5 text-white/30 group-focus-within:text-indigo-400 transition-all duration-300" />
                  </div>
                  {/* Deep Inset Shadow Input */}
                  <input 
                    name="username"
                    type="text" 
                    value={loginForm.username}
                    onChange={(e)=>setLoginForm({...loginForm, username: e.target.value})}
                    className="w-full bg-[#050608]/90 border border-white/[0.03] text-white rounded-2xl pl-12 pr-4 py-4 text-sm font-medium shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] focus:outline-none focus:border-indigo-500/40 focus:bg-[#08090f] focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 placeholder:text-white/20"
                    placeholder="Enter your ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <KeyRound className="w-5 h-5 text-white/30 group-focus-within:text-indigo-400 transition-all duration-300" />
                  </div>
                  <input 
                    name="password"
                    type="password" 
                    value={loginForm.password}
                    onChange={(e)=>setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full bg-[#050608]/90 border border-white/[0.03] text-white rounded-2xl pl-12 pr-4 py-4 text-sm font-medium shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] focus:outline-none focus:border-indigo-500/40 focus:bg-[#08090f] focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 placeholder:text-white/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <AnimatePresence>
                {loginError && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold py-3 px-4 rounded-xl flex items-center gap-2 mt-2 shadow-inner">
                      <ShieldAlert size={14} className="shrink-0"/> {loginError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3D Gradient Button */}
              <button 
                type="submit" 
                className="w-full relative mt-8 overflow-hidden group bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white text-xs font-black tracking-[0.2em] uppercase py-4.5 rounded-2xl transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(124,58,237,0.7),_inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_40px_-10px_rgba(124,58,237,0.9),_inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {/* Button Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center opacity-30 flex flex-col items-center gap-2">
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-white drop-shadow-md">UTAC Quality Control © 2026</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // MAIN APP ROUTING
  // ==========================================
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
          <div className="flex justify-center items-center gap-3 w-[60%]">
            <button onClick={() => { setPage('home'); setStep(1); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${page === 'home' ? 'bg-[#6f7bf7] text-white shadow-[0_0_15px_rgba(111,123,247,0.5)]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              <LayoutDashboard size={14} /> Status Query
            </button>
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
              <HomePage auth={auth} triggerRefresh={triggerRefresh} />
            </motion.div>
          )}
          {page === 'iqc' && step === 1 && (
            <motion.div key="step1" custom={1} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <FormPage auth={auth} formData={formData} setFormData={setFormData} uploadedDocs={uploadedDocs} handleFileChange={handleFileChange} removeFile={(id)=>handleFileChange(id, [])} onNext={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </motion.div>
          )}
          {page === 'iqc' && step === 2 && (
            <motion.div key="step2" custom={1} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PhotoPage auth={auth} formData={formData} setFormData={setFormData} uploadedDocs={uploadedDocs} uploadedImages={uploadedImages} handleImageChange={handleImageChange} removeImage={removeImage} handleMultiImageChange={handleMultiImageChange} removeMultiImage={removeMultiImage} onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} isDocComplete={isDocComplete} onSuccess={resetFormAndGoHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isPinModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-md my-8">
              <GlassCard className="!p-8 relative border-fuchsia-500/30">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <Cpu className="text-fuchsia-400" />
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Pin Changing Request</h3>
                </div>
                <form onSubmit={handlePinRequestSubmit} className="space-y-4">
                  <GlassInput name="location" label="Machine Name *" value={pinRequestForm.location} onChange={(e)=>setPinRequestForm({...pinRequestForm, location: e.target.value})} placeholder="e.g. EXCEED-03" />
                  <div className="grid grid-cols-2 gap-4">
                    <GlassInput name="customer_name" label="Customer Name" value={pinRequestForm.customer_name} onChange={(e)=>setPinRequestForm({...pinRequestForm, customer_name: e.target.value})} placeholder="e.g. SONY" />
                    <GlassInput name="req_name" label="Requester Name *" value={pinRequestForm.req_name} onChange={(e)=>setPinRequestForm({...pinRequestForm, req_name: e.target.value})} placeholder="e.g. Somchai" />
                  </div>
                  <GlassInput name="pin_no" label="Pin No. *" value={pinRequestForm.pin_no} onChange={(e)=>setPinRequestForm({...pinRequestForm, pin_no: e.target.value})} placeholder="e.g. PIN NUMBER" />
                  <GlassInput name="stock_pin_no" label="Stock Pin No." value={pinRequestForm.stock_pin_no} onChange={(e)=>setPinRequestForm({...pinRequestForm, stock_pin_no: e.target.value})} placeholder="SOCKET NUMBER" />
                  <GlassInput name="name_socket" label="Name Socket" value={pinRequestForm.name_socket} onChange={(e)=>setPinRequestForm({...pinRequestForm, name_socket: e.target.value})} placeholder="SOCKET NAME" />
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
