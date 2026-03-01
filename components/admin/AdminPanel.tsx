
import React, { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs, setDoc, doc, updateDoc } from '../../firebase.ts';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newRole, setNewRole] = useState<'friend' | 'family'>('friend');
  
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Fetch failed", e); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const faceData = canvasRef.current.toDataURL('image/jpeg', 0.8);
    
    await updateDoc(doc(db, "users", "ALEX"), { faceData });
    alert("Identification registered, Amin.");
    stopCamera();
    fetchUsers();
  };

  const startCamera = async () => {
    setIsCapturing(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    setIsCapturing(false);
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newKey) return;
    const upperId = newId.toUpperCase();
    await setDoc(doc(db, "users", upperId), { 
      name: newName || upperId, password: newKey, role: newRole, online: false 
    });
    setNewId(''); setNewKey(''); setNewName('');
    fetchUsers();
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black flex flex-col p-8 safe-pt animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Amin's Core</h2>
           <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.4em]">Biometric & Control</p>
        </div>
        <button onClick={onClose} className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-white text-4xl">×</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pb-32 pr-2 no-scrollbar">
        <div className="glass-card p-10 rounded-[4rem] border-white/10 bg-gradient-to-br from-cyan-500/[0.05] to-transparent">
          <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-8 text-center">Face Registry</p>
          <div className="relative aspect-square max-w-[200px] mx-auto bg-zinc-950 rounded-[4rem] overflow-hidden mb-8 border-2 border-white/5 group ring-4 ring-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
             {isCapturing ? (
               <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-1.17-15.696A9 9 0 003.345 11.415M9 5a3 3 0 000 6m3 0a3 3 0 100-6M9.75 11.965a4.5 4.5 0 011.898.626M12 11c1.242 0 2.37.505 3.195 1.318" /></svg>
                  </div>
               </div>
             )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
          <button 
            onClick={isCapturing ? captureFace : startCamera} 
            className={`w-full py-6 rounded-3xl font-black text-xs tracking-widest uppercase transition-all shadow-2xl ${isCapturing ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white border border-white/10'}`}>
            {isCapturing ? 'Register Face' : 'Start Face Sync'}
          </button>
        </div>

        <form onSubmit={addUser} className="glass-card p-10 rounded-[4rem] space-y-5 border-white/10">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Add Identity Link</p>
          <div className="grid grid-cols-2 gap-4">
            <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="ID" className="w-full bg-white/5 p-6 rounded-3xl text-white outline-none border border-white/5 focus:border-cyan-500/30 transition-all font-bold uppercase" />
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NAME" className="w-full bg-white/5 p-6 rounded-3xl text-white outline-none border border-white/5 focus:border-cyan-500/30 transition-all font-bold uppercase" />
          </div>
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="ACCESS KEY" className="w-full bg-white/5 p-6 rounded-3xl text-white outline-none border border-white/5 focus:border-cyan-500/30 transition-all font-bold uppercase" />
          <button type="submit" className="w-full bg-white text-black font-black py-6 rounded-3xl text-xs tracking-widest uppercase active:scale-95 transition-all">Add To Grid</button>
        </form>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.5em] text-center">Active Sync Links</p>
          {users.map(u => (
            <div key={u.id} className="glass-card p-6 rounded-[3rem] flex justify-between items-center border-white/5">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center">
                  {u.faceData ? <img src={u.faceData} className="w-full h-full object-cover" /> : <span className="text-white text-xl font-black">{u.name?.[0]}</span>}
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase">{u.name || u.id}</p>
                  <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{u.role} | {u.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
