
import React, { useState, useRef } from 'react';
import { AdminPanel } from './AdminPanel';

export interface LocalMedia { id: string; name: string; url: string; type: 'audio' | 'image' | 'video' | 'file'; date: string; folder?: string; }
export interface Folder { id: string; name: string; files: LocalMedia[]; }

interface MediaLibraryProps {
  folders: Folder[];
  reminders: any[];
  usersList: any[];
  currentUser: any;
  onDeleteFile: (id: string) => void;
  onUploadFile: (data: Partial<LocalMedia>) => void;
  onClose: () => void;
  onSelectFile?: (file: LocalMedia) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = (props) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const type = file.type.startsWith('image') ? 'image' : 
                   file.type.startsWith('audio') ? 'audio' : 
                   file.type.startsWith('video') ? 'video' : 'file';
      props.onUploadFile({ name: file.name, url: reader.result as string, type, folder: selectedFolderId || 'Unsorted' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col safe-pt font-outfit animate-in slide-in-from-bottom-full duration-500">
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Vault</h2>
        <div className="flex gap-4">
          {props.currentUser.role === 'admin' && (
            <button onClick={() => setShowAdmin(true)} className="text-[10px] font-black uppercase text-cyan-400 border border-cyan-400/20 px-4 py-2 rounded-full">Admin</button>
          )}
          <button onClick={props.onClose} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white">×</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {!selectedFolderId ? (
          <div className="grid grid-cols-2 gap-4">
            {props.folders.map(f => (
              <div key={f.id} onClick={() => setSelectedFolderId(f.id)} className="glass-card p-6 rounded-[2rem] flex flex-col items-center gap-4 active:scale-95 transition-all">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white truncate w-24">{f.name}</p>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">{f.files.length} Items</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 mb-6">Back</button>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-white">{selectedFolderId}</h3>
               <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase bg-white text-black px-4 py-2 rounded-full">Upload</button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <div className="space-y-3">
              {props.folders.find(f => f.id === selectedFolderId)?.files.map(file => (
                <div key={file.id} className="glass-card p-4 rounded-3xl flex items-center gap-4 active:bg-white/5 transition-all">
                  <div onClick={() => props.onSelectFile?.(file)} className="w-12 h-12 bg-black rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {file.type === 'image' ? <img src={file.url} className="w-full h-full object-cover" /> : <span className="text-lg">📄</span>}
                  </div>
                  <div onClick={() => props.onSelectFile?.(file)} className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{file.name}</p>
                    <p className="text-[8px] text-zinc-600 uppercase font-black">{file.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};
