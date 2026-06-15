import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, LayoutDashboard, Cpu, Plus, LogOut, ClipboardList, User, KeyRound, ShieldAlert, Database } from 'lucide-react';
import logoUtac from './assets/logo-utac.png';

// 🌟 นำเข้าหน้าต่างหลักทั้งหมด
import HomePage from './pages/HomePage.jsx';
import FormPage from './pages/FormPage.jsx';
import PhotoPage from './pages/PhotoPage.jsx';
import ContactorInfoPage from './pages/ContactorInfoPage.jsx'; 
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
        setLoginError("Invalid credentials. Please verify and try again.");
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

  // ------------------------------------------
  // LOGIN UI
  // ------------------------------------------
  if (!auth) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-sans relative overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"
        />
        <div className="z-10 w-full max-w-[400px] p-6">
          <div className="flex flex-col items-center mb-8">
            <motion.img initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 0.9, scale: 1, y: 0 }} transition={{ duration: 0.5 }} src={logoUtac} alt="UTAC" className="h-12 object-contain mb-6" />
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-2xl font-bold text-white tracking-tight">Contactor Portal</motion.h2>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-zinc-500 text-sm mt-2">Please Sign in</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="bg-[#18181b] border border-white/5 rounded-2xl p-8 shadow-2xl relative">
            <form onSubmit={handleLogin} className="w-full space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><User className="w-4 h-4 text-zinc-500" /></div>
                  <input name="username" type="text" value={loginForm.username} onChange={(e)=>setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-[#09090b] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600" placeholder="Enter your ID" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><KeyRound className="w-4 h-4 text-zinc-500" /></div>
                  <input name="password" type="password" value={loginForm.password} onChange={(e)=>setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-[#09090b] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600" placeholder="••••••••" />
                </div>
              </div>
              <AnimatePresence>
                {loginError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium py-3 px-4 rounded-xl flex items-center gap-2"><ShieldAlert size={14} className="shrink-0"/> {loginError}</div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} type="submit" className="w-full mt-6 bg-white hover:bg-zinc-200 text-black text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">Sign In</motion.button>
            </form>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-8 text-center"><p className="text-xs text-zinc-600">If you have any issues, please contact Rangsimont Jitrayont, Fame.</p></motion.div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // MAIN APP ROUTING (เมื่อ Login ผ่านแล้ว)
  // ------------------------------------------
  const pageVariants = {
    initial: (direction) => ({ opacity: 0, x: direction > 0 ? 25 : -30 }),
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 220, damping: 22 } },
    exit: (direction) => ({ opacity: 0, x: direction > 0 ? -25 : 30, transition: { duration: 0.15 } })
  };

  return (
    <div className="min-h-screen relative text-slate-200 overflow-x-hidden font-sans">
      <div className="fixed inset-0 z-[-1] no-print bg-[#0b0c10] flex items-center justify-center overflow-hidden">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute w-[80vw] h-[80vw] bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] rounded-full blur-[120px] opacity-40" />
      </div>

      {/* GLOBAL NAVBAR HEADER */}
      <header className="fixed top-0 inset-x-0 z-[999] bg-black/40 backdrop-blur-3xl border-b border-white/5 no-print shadow-sm">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 w-[20%]">
            <img src={logoUtac} alt="UTAC" className="h-10 w-auto object-contain" />
            <h1 className="text-xl font-black text-white uppercase tracking-tighter hidden lg:block">IQC Hub</h1>
          </div>
          
          {/* แถบเมนูกลาง ควบคุมการย้ายหน้าแยก 100% */}
          <div className="flex justify-center items-center gap-3 w-[60%] flex-wrap">
            <button onClick={() => { setPage('home'); setStep(1); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${page === 'home' ? 'bg-[#6f7bf7] text-white shadow-[0_0_15px_rgba(111,123,247,0.5)]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              <LayoutDashboard size={14} /> Status Query
            </button>
            <button onClick={() => setIsPinModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]">
              <Cpu size={14} /> Request Pin Changing
            </button>
            
            {/* 🌟 ปุ่มสลับไปหน้าแยก Contactor DB ขาดจากกัน */}
            <button onClick={() => { setPage('contactor_info'); setStep(1); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${page === 'contactor_info' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              <Database size={14} /> Contactor DB
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

      {/* VIEWPORT CONTROLLER */}
      <main className="max-w-[1540px] mx-auto px-4 md:px-6 pt-32 pb-40 print:p-0">
        <AnimatePresence mode="wait" custom={step}>
          {page === 'home' && (
            <motion.div key={`home_${triggerRefresh}`} custom={-1} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <HomePage auth={auth} triggerRefresh={triggerRefresh} />
            </motion.div>
          )}
          
          {/* 🌟 หน้าเดี่ยวแยกอิสระ คุมจาก Navbar อย่างเดียว */}
          {page === 'contactor_info' && (
            <motion.div key="contactor_info" custom={1} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ContactorInfoPage />
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

      {/* PIN CHANGING MODAL */}
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
