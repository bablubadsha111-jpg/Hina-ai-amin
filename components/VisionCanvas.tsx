
import React from 'react';

interface VisionCanvasProps {
  image: string | null;
  prompt: string;
  isImagining: boolean;
  onClose: () => void;
  personality: 'hina' | 'alex';
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({ image, prompt, isImagining, onClose, personality }) => {
  return (
    <div className="fixed inset-0 z-[4000] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className={`relative w-full max-w-lg aspect-[4/5] glass-card rounded-[3rem] overflow-hidden border-2 transition-all duration-1000 ${personality === 'alex' ? 'border-red-500/30' : 'border-cyan-500/30'} ${isImagining ? 'animate-pulse scale-95' : 'scale-100'}`}>
        
        {isImagining ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            <div className={`w-24 h-24 rounded-full border-t-4 mb-8 animate-spin ${personality === 'alex' ? 'border-red-500' : 'border-cyan-500'}`} />
            <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">Imagining...</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase mt-4 tracking-widest px-6">{prompt}</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col">
            <img src={image!} className="w-full h-full object-cover animate-in zoom-in duration-1000" alt="Imagination" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-0 left-0 right-0 p-10">
               <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.4em] mb-2">Memory Captured</p>
               <p className="text-white text-sm font-bold italic opacity-80 leading-relaxed">"{prompt}"</p>
            </div>
            
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-2xl border border-white/10 active:scale-90 transition-all">
              ×
            </button>
          </div>
        )}
      </div>

      {!isImagining && (
        <button 
          onClick={onClose} 
          className="mt-12 px-12 py-5 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-2xl">
          Back to Hina
        </button>
      )}
      
      <p className="fixed bottom-10 text-[8px] text-zinc-700 font-black uppercase tracking-[0.8em]">Vision Neural Engine Active</p>
    </div>
  );
};
