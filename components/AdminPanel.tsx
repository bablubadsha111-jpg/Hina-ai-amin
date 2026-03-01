
import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, setDoc, doc } from '../firebase';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newRole, setNewRole] = useState<'friend' | 'family'>('friend');

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newKey) return;
    await setDoc(doc(db, "users", newId.toUpperCase()), { name: newName, password: newKey, role: newRole });
    setNewId(''); setNewKey(''); setNewName('');
    fetchUsers();
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/95 backdrop-blur-2xl flex flex-col p-8 safe-pt">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-white italic tracking-tighter">ADMIN CORE</h2>
        <button onClick={onClose} className="text-white text-3xl">×</button>
      </div>

      <div className="space-y-8 overflow-y-auto flex-1">
        <form onSubmit={addUser} className="glass-card p-6 rounded-[2.5rem] space-y-4 border-white/10">
          <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Register New Identity</p>
          <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="ID (e.g. SONU)" className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5" />
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Display Name" className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5" />
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Access Key" className="w-full bg-white/5 p-4 rounded-2xl text-white outline-none border border-white/5" />
          <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full bg-zinc-900 p-4 rounded-2xl text-white outline-none border border-white/5">
            <option value="friend">Friend</option>
            <option value="family">Family</option>
          </select>
          <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-4 rounded-2xl">ADD USER</button>
        </form>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Active Links</p>
          {users.map(u => (
            <div key={u.id} className="glass-card p-5 rounded-3xl flex justify-between items-center">
              <div>
                <p className="text-white font-bold">{u.name || u.id}</p>
                <p className="text-[9px] text-zinc-600 uppercase font-black">{u.role} | {u.id}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${u.online ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-zinc-800'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
