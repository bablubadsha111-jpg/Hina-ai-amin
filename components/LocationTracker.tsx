
import React from 'react';

export const LocationTracker: React.FC<{ lat: number; lng: number; onClose: () => void }> = ({ lat, lng, onClose }) => {
  return (
    <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md glass-card rounded-[3rem] overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-white font-black text-lg italic tracking-tighter uppercase">Live Signal Found</h3>
            <p className="text-[9px] text-cyan-400 font-black tracking-widest uppercase">Grid Coordinates Locked</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white text-2xl">×</button>
        </div>
        
        <div className="h-64 w-full bg-zinc-900 relative">
          <iframe 
            width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} 
            src={`https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`}
          />
        </div>
        
        <div className="p-8 text-center bg-zinc-950">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Current Location</p>
           <p className="text-white font-mono text-xs">{lat.toFixed(5)}° N, {lng.toFixed(5)}° E</p>
           <button onClick={onClose} className="mt-8 w-full py-4 bg-cyan-500 text-black font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Dismiss Signal</button>
        </div>
      </div>
    </div>
  );
};
