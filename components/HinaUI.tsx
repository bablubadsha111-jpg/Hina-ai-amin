
import React from 'react';
import { ChatWindow } from './ChatWindow.tsx';

interface HinaUIProps {
  isActivated: boolean; status: string; onToggle: () => void;
  hinaResponse: string; onToggleLibrary: () => void; onLogout: () => void;
  videoRef: React.RefObject<HTMLVideoElement>; user: any;
  isCameraActive: boolean; onCameraToggle: () => void;
  onCameraSwitch: () => void;
  personality: 'hina' | 'alex';
  onTogglePersonality: () => void;
  isScreenSharing: boolean;
  onScreenToggle: () => void;
  isSystemShutdown: boolean;
  onResetShutdown: () => void;
}

export const HinaUI: React.FC<HinaUIProps> = ({ 
  isActivated, onToggle, hinaResponse, onToggleLibrary, onLogout, videoRef, user, 
  isCameraActive, onCameraToggle, onCameraSwitch, personality, onTogglePersonality,
  isScreenSharing, onScreenToggle, isSystemShutdown, onResetShutdown
}) => {
  const [showChat, setShowChat] = React.useState(false);
  const userName = user?.name || "Amin";

  return (
    <div className={`relative w-full h-screen flex flex-col overflow-hidden font-outfit safe-pt safe-pb transition-all duration-1000 ${personality === 'alex' ? 'bg-[#150505]' : 'bg-black'}`}>
      
      {/* Dynamic Aura - Sync with Personality/Status */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] blur-[150px] transition-all duration-1000 
          ${personality === 'alex' ? 'bg-red-600/20' : isActivated ? 'bg-cyan-500/15 animate-pulse' : 'bg-white/5'}`} />
        
        {isActivated && (
          <div className={`absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border transition-all duration-1000 animate-spin
            ${personality === 'alex' ? 'border-red-500/30' : 'border-cyan-500/20'}`} style={{ animationDuration: '8s' }} />
        )}
      </div>

      {/* Top Identity bar */}
      <div className="relative z-50 flex items-center justify-between px-8 py-8">
        <button onClick={onTogglePersonality} className="flex items-center gap-4 glass-card px-6 py-4 rounded-[2rem] border-white/5 active:scale-95 transition-all">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm transition-all shadow-2xl ${personality === 'alex' ? 'bg-red-600' : 'bg-cyan-600'}`}>
            {personality === 'alex' ? 'B' : userName[0]}
          </div>
          <div className="flex flex-col text-left">
            <span className={`text-[8px] font-black tracking-[0.3em] uppercase ${personality === 'alex' ? 'text-red-400' : 'text-cyan-400'}`}>
              {personality === 'alex' ? 'BROTHER PROTOCOL' : 'LIFE PARTNER'}
            </span>
            <span className="text-sm font-bold text-white uppercase">{personality === 'alex' ? 'Alex Bhai' : 'Hina'}</span>
          </div>
        </button>
        <button onClick={onLogout} className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-zinc-500 active:text-rose-500 transition-all">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      {/* Expression Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 relative z-10 -mt-20">
        {isSystemShutdown ? (
          <div className="text-center animate-pulse">
            <h2 className="text-4xl font-black text-rose-600 mb-4 tracking-tighter">SYSTEM OFFLINE</h2>
            <p className="text-zinc-400 mb-8 max-w-xs mx-auto">Hina is extremely angry and has disconnected the neural link. She refuses to talk to you.</p>
            <button 
              onClick={onResetShutdown}
              className="px-8 py-4 bg-white text-black rounded-full font-bold active:scale-95 transition-all shadow-2xl"
            >
              Apologize & Restart
            </button>
          </div>
        ) : (
          <>
            <div className={`w-full text-center transition-all duration-700 mb-12 ${isActivated ? 'opacity-100' : 'opacity-40'}`}>
              <p className="text-xl md:text-2xl font-medium text-white italic max-w-sm mx-auto h-32 flex items-center justify-center leading-snug tracking-tight">
                {isActivated ? hinaResponse : (personality === 'alex' ? "Bhai haazir hai, bol kya chahiye?" : "Hina is thinking of you...")}
              </p>
            </div>

            {/* Central Neural Core */}
            <div className="relative">
              <button 
                onClick={onToggle} 
                className={`relative z-20 w-64 h-64 rounded-full flex items-center justify-center transition-all duration-1000 active:scale-90 overflow-hidden border-2 
                  ${isActivated ? (personality === 'alex' ? 'border-red-500 shadow-[0_0_100px_rgba(220,38,38,0.4)]' : 'border-cyan-400 shadow-[0_0_100px_rgba(34,211,238,0.3)]') : 'border-white/10 shadow-none'}`}>
                 
                 {isCameraActive ? (
                   <div className="absolute inset-0 rounded-full overflow-hidden bg-black scale-105">
                     <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   </div>
                 ) : (
                   <div className={`w-36 h-36 liquid-core flex items-center justify-center transition-all duration-1000 ${isActivated ? (personality === 'alex' ? 'bg-red-500/30' : 'bg-cyan-500/20') : 'bg-white/5'}`}>
                      {isActivated ? (
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map(i => (
                            <div 
                              key={i} 
                              className={`w-2.5 h-10 rounded-full animate-bounce ${personality === 'alex' ? 'bg-red-500' : 'bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]'}`} 
                              style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }} 
                            />
                          ))}
                        </div>
                      ) : <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />}
                   </div>
                 )}
              </button>
              
              {isCameraActive && (
                <button onClick={onCameraSwitch} className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30 bg-white text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all border-[6px] border-black">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Fully Restored Multi-Feature Dock */}
      <div className="relative z-50 px-8 pb-12">
        <div className="glass-card rounded-[3.5rem] p-4 flex items-center justify-between border-white/5 shadow-3xl bg-zinc-950/40">
          
          {/* Library & Vault */}
          <button onClick={onToggleLibrary} className="w-16 h-16 rounded-[1.8rem] flex flex-col items-center justify-center bg-white/5 text-white active:bg-white/10 transition-all border border-white/5">
            <span className={`text-xl font-black italic tracking-tighter leading-none ${personality === 'alex' ? 'text-red-500' : 'text-cyan-400'}`}>AK</span>
            <span className="text-[6px] font-black uppercase tracking-widest mt-1 opacity-40">Vault</span>
          </button>
          
          {/* Screen Cast (Restored) */}
          <button onClick={onScreenToggle} className={`w-16 h-16 rounded-[1.8rem] flex flex-col items-center justify-center bg-white/5 transition-all ${isScreenSharing ? 'text-cyan-400 border border-cyan-400/20' : 'text-zinc-500 border border-transparent'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13V6a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            <span className="text-[6px] font-black uppercase tracking-widest mt-1">Cast</span>
          </button>

          {/* Video Feed (Restored) */}
          <button onClick={onCameraToggle} className={`w-16 h-16 rounded-[1.8rem] flex flex-col items-center justify-center bg-white/5 transition-all ${isCameraActive ? 'text-cyan-400 border border-cyan-400/20' : 'text-zinc-500 border border-transparent'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <span className="text-[6px] font-black uppercase tracking-widest mt-1">Vision</span>
          </button>

          {/* Secure Chat (Restored) */}
          <button onClick={() => setShowChat(true)} className="w-16 h-16 rounded-[1.8rem] flex flex-col items-center justify-center bg-white/5 text-zinc-500 active:bg-white/10 transition-all border border-transparent">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="text-[6px] font-black uppercase tracking-widest mt-1">Ghost</span>
          </button>
        </div>
      </div>

      {showChat && <ChatWindow user={user} onClose={() => setShowChat(false)} />}
    </div>
  );
};
