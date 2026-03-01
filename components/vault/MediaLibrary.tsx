
import React, { useState, useRef } from 'react';
import { db, collection, addDoc } from '../../firebase.ts';
import { AdminPanel } from '../admin/AdminPanel.tsx';

export interface LocalMedia { id: string; name: string; url: string; type: 'audio' | 'image' | 'video' | 'file'; date: string; folder?: string; cloud?: boolean; }
export interface Folder { id: string; name: string; files: LocalMedia[]; }

interface LibraryProps {
  localFolders: Folder[];
  cloudFolders: Folder[];
  currentUser: any;
  usersList: any[];
  onClose: () => void;
  onInitiateCall: (user: any, type: 'audio' | 'video') => void;
}

export const MediaLibrary: React.FC<LibraryProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'local' | 'cloud' | 'contacts' | 'settings'>('local');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileType = file.type.startsWith('image') ? 'image' : 
                         file.type.startsWith('video') ? 'video' : 
                         file.type.startsWith('audio') ? 'audio' : 'file';
        
        const data = { 
          name: file.name, url: reader.result as string, type: fileType, 
          date: new Date().toISOString(), folder: selectedFolderId || 'Unsorted'
        };

        if (activeTab === 'cloud') {
          await addDoc(collection(db, "cloud_storage"), { ...data, cloud: true, owner: props.currentUser.id });
        } else {
          await addDoc(collection(db, "users", props.currentUser.id, "vault"), data);
        }
        alert("File Uploaded Successfully, Amin.");
      } catch (err) { alert("Upload error, Amin."); } finally { setIsUploading(false); setSelectedFolderId(null); }
    };
    reader.readAsDataURL(file);
  };

  const currentFolders = activeTab === 'local' ? props.localFolders : props.cloudFolders;

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col safe-pt font-outfit animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
      <div className="px-8 py-8 flex justify-between items-center border-b border-white/5 bg-zinc-950/80 backdrop-blur-3xl">
        <div>
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Vault</h2>
           <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar max-w-[70vw]">
              {['local', 'cloud', 'contacts', 'settings'].map(t => (
                <button key={t} onClick={() => { setActiveTab(t as any); setSelectedFolderId(null); }} 
                  className={`text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all flex-shrink-0 ${activeTab === t ? 'text-cyan-400 border-cyan-400 bg-cyan-400/10' : 'text-zinc-600 border-white/5'}`}>
                  {t}
                </button>
              ))}
           </div>
        </div>
        <button onClick={props.onClose} className="w-12 h-12 glass-card rounded-2xl text-white text-2xl flex items-center justify-center transition-all">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 pb-32">
        {activeTab === 'settings' ? (
          <button onClick={() => setShowAdmin(true)} className="w-full glass-card p-6 rounded-[2rem] border-white/10 flex items-center justify-between text-white uppercase font-black text-xs tracking-widest">
            <span>Core Controls</span>
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" strokeWidth={2} /></svg>
          </button>
        ) : activeTab === 'contacts' ? (
          <div className="space-y-4">
            {props.usersList.map(u => (
              <div key={u.id} className="glass-card p-5 rounded-[2.5rem] flex items-center justify-between border-white/5 active:bg-white/5 transition-all">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                    {u.faceData ? <img src={u.faceData} className="w-full h-full object-cover" /> : <span className="text-white font-black text-xl">{u.name?.[0]}</span>}
                  </div>
                  <div><p className="text-sm font-bold text-white uppercase">{u.name}</p><p className="text-[8px] text-zinc-600 font-black uppercase">{u.role}</p></div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => props.onInitiateCall(u, 'audio')} className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{activeTab} storage</h3>
               <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                 {isUploading ? 'SYNCING...' : 'Upload'}
               </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />

            {!selectedFolderId ? (
              <div className="grid grid-cols-2 gap-4">
                {currentFolders.length === 0 && <p className="col-span-2 text-zinc-600 text-xs font-bold uppercase py-10">Khaali hai, Amin.</p>}
                {currentFolders.map(f => (
                  <div key={f.id} onClick={() => setSelectedFolderId(f.id)} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center border-white/5 active:scale-95 transition-all text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-zinc-500"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg></div>
                    <p className="text-sm font-bold text-white truncate w-full uppercase">{f.name}</p>
                    <p className="text-[10px] text-zinc-600 font-black uppercase mt-1">{f.files.length} Items</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setSelectedFolderId(null)} className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M15 19l-7-7 7-7" /></svg> Back
                </button>
                <div className="grid gap-3">
                  {currentFolders.find(f => f.id === selectedFolderId)?.files.map(file => (
                    <div key={file.id} className="glass-card p-4 rounded-3xl flex items-center gap-4 border-white/5 text-left">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {file.type === 'image' ? <img src={file.url} className="w-full h-full object-cover" /> : <span className="text-xl">📄</span>}
                      </div>
                      <div className="flex-1 overflow-hidden"><p className="text-xs font-bold text-white truncate uppercase">{file.name}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};
