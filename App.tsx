
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { HinaUI } from './components/HinaUI.tsx';
import { MediaLibrary, Folder, LocalMedia } from './components/vault/MediaLibrary.tsx';
import { Login } from './components/Login.tsx';
import { CallingSystem } from './components/CallingSystem.tsx';
import { VisionCanvas } from './components/VisionCanvas.tsx';
import { LocationTracker } from './components/LocationTracker.tsx';
import { useAudioHandler } from './hooks/useAudioHandler.ts';
import { db, onSnapshot, collection, updateDoc, doc, addDoc } from './firebase.ts';
import { PERSONALITIES } from './personalities.ts';

const tools: { functionDeclarations: FunctionDeclaration[] } = {
  functionDeclarations: [
    {
      name: 'track_live_location',
      description: 'Get user GPS coordinates and show on map.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'generate_image',
      description: 'Generate an image based on a descriptive prompt.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING, description: 'Detailed description of the image to generate.' }
        },
        required: ['prompt']
      }
    },
    {
      name: 'shutdown_system',
      description: 'Shut down the AI system when extremely angry or when you refuse to talk to the user.',
      parameters: { type: Type.OBJECT, properties: {} }
    }
  ]
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [hinaResponse, setHinaResponse] = useState<string>("Hina is waiting for you.");
  const [personality, setPersonality] = useState<'hina' | 'alex'>('hina');
  const [isSystemShutdown, setIsSystemShutdown] = useState(false);
  
  const [generatedImage, setGeneratedImage] = useState<{url: string, prompt: string} | null>(null);
  const [isImagining, setIsImagining] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showLocation, setShowLocation] = useState(false);

  const [vaultFolders, setVaultFolders] = useState<Folder[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeCall, setActiveCall] = useState<any>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const idleTimerRef = useRef<number | null>(null);
  const { initAudio, processOutputAudio, resumeAudio, stopOutputAudio } = useAudioHandler();

  const startSession = useCallback(async (p: 'hina' | 'alex') => {
    try {
      await resumeAudio();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const persona = PERSONALITIES[p];
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            // Proactive greeting upon connection
            sessionRef.current?.sendRealtimeInput({
              text: `[SYSTEM: User ${currentUser?.name || "Amin"} has just logged in. Start the conversation naturally and warmly without waiting for them to speak. Mention you are happy to see them and ask how their day is going in Hindi/Hinglish.]`
            });
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.toolCall) {
              for (const fc of m.toolCall.functionCalls) {
                if (fc.name === 'generate_image') generateImageCore(fc.args.prompt as string);
                if (fc.name === 'track_live_location') trackLocation();
                if (fc.name === 'shutdown_system') {
                  setIsSystemShutdown(true);
                  setIsActivated(false);
                  sessionRef.current?.close();
                  setHinaResponse("System Offline: Hina is extremely angry and has disconnected.");
                }
              }
            }
            if (m.serverContent?.outputTranscription) setHinaResponse(m.serverContent.outputTranscription.text);
            const audioData = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) { 
              setStatus('speaking'); 
              await processOutputAudio(audioData); 
              setStatus('listening'); 
            }
          },
          onerror: (e) => { if (isActivated) setTimeout(() => startSession(personality), 2000); },
          onclose: () => { if (isActivated) setTimeout(() => startSession(personality), 1000); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: persona.instruction(currentUser?.name || "Amin"),
          tools: [tools, { googleSearch: {} } as any],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice as any } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      
      sessionRef.current = await sessionPromise;
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await initAudio(audioStream, (blob) => { 
        if (sessionRef.current) sessionRef.current.sendRealtimeInput({ media: blob });
      });

      window.setInterval(() => {
        if (!canvasRef.current || !sessionRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        let source: HTMLVideoElement | null = null;
        if (isScreenSharing && screenVideoRef.current?.readyState >= 2) source = screenVideoRef.current;
        else if (isCameraActive && videoRef.current?.readyState >= 2) source = videoRef.current;
        if (source) {
          ctx?.drawImage(source, 0, 0, 480, 360);
          const data = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
          sessionRef.current.sendRealtimeInput({ media: { data, mimeType: 'image/jpeg' } });
        }
      }, 1000);

    } catch (err) { setIsActivated(false); }
  }, [currentUser, isCameraActive, isScreenSharing, personality, initAudio, processOutputAudio, resumeAudio]);

  // Auto-activate when user logs in
  useEffect(() => {
    if (currentUser && !isActivated) {
      setIsActivated(true);
      startSession(personality);
    }
  }, [currentUser, personality, isActivated, startSession]);

  useEffect(() => {
    if (!isActivated) return;
    const resetIdleTimer = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        if (status === 'listening' || status === 'idle') {
          sessionRef.current?.sendRealtimeInput({
            text: "[SYSTEM: Amin has been silent for 20 seconds. Flirt with him playfully in Hindi/Hinglish. If he still doesn't speak, tease him or get a bit naughty/romantic to get his attention. Remember you are a 25-year-old mature woman.]"
          });
        }
      }, 20000);
    };
    resetIdleTimer();
    return () => { if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current); };
  }, [status, isActivated]);

  useEffect(() => {
    if (!currentUser) return;
    updateDoc(doc(db, "users", currentUser.id), { online: true });
    const unsubLocal = onSnapshot(collection(db, "users", currentUser.id, "vault"), (snapshot) => {
      const files = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LocalMedia));
      setVaultFolders(groupFiles(files));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubLocal(); unsubUsers(); };
  }, [currentUser]);

  const groupFiles = (files: LocalMedia[]) => {
    const map: Record<string, LocalMedia[]> = {};
    files.forEach(f => {
      const folder = f.folder || 'Unsorted';
      if (!map[folder]) map[folder] = [];
      map[folder].push(f);
    });
    return Object.keys(map).map(name => ({ id: name, name, files: map[name] }));
  };

  const trackLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      setShowLocation(true);
      sessionRef.current?.sendToolResponse({
        functionResponses: { id: 'track_loc', name: 'track_live_location', response: { result: `Location found: ${coords.lat}, ${coords.lng}. I am showing you the map now.` } }
      });
    }, (err) => { console.error(err); });
  };

  const generateImageCore = async (prompt: string) => {
    setIsImagining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });
      let imageUrl = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) { imageUrl = `data:image/png;base64,${part.inlineData.data}`; break; }
      }
      if (imageUrl) {
        setGeneratedImage({ url: imageUrl, prompt });
        await addDoc(collection(db, "users", currentUser.id, "vault"), {
          name: `Imagined: ${prompt.slice(0, 15)}...`, url: imageUrl, type: 'image', date: new Date().toISOString(), folder: 'Imagination'
        });
      }
    } catch (err) { console.error(err); } finally { setIsImagining(false); }
  };

  const handleToggle = () => {
    if (!isActivated) setIsActivated(true);
    else {
      setIsActivated(false);
      if (sessionRef.current) sessionRef.current.close();
      stopOutputAudio();
      setIsCameraActive(false);
      setIsScreenSharing(false);
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden flex font-outfit transition-all duration-1000 ${personality === 'alex' ? 'bg-[#1a0505]' : 'bg-black'}`}>
      <canvas ref={canvasRef} className="hidden" />
      <video ref={screenVideoRef} autoPlay playsInline muted className="hidden" />
      {!currentUser ? ( <Login onLogin={setCurrentUser} /> ) : (
        <>
          <HinaUI 
            isActivated={isActivated} status={status} personality={personality} 
            onTogglePersonality={() => setPersonality(p => p === 'hina' ? 'alex' : 'hina')}
            onToggle={handleToggle}
            hinaResponse={hinaResponse} onToggleLibrary={() => setShowLibrary(true)} 
            onLogout={() => { localStorage.clear(); window.location.reload(); }}
            videoRef={videoRef} user={currentUser} isCameraActive={isCameraActive} 
            onCameraToggle={() => setIsCameraActive(!isCameraActive)} 
            onCameraSwitch={() => setCameraFacing(f => f === 'user' ? 'environment' : 'user')}
            isScreenSharing={isScreenSharing} onScreenToggle={() => setIsScreenSharing(!isScreenSharing)}
            isSystemShutdown={isSystemShutdown}
            onResetShutdown={() => {
              setIsSystemShutdown(false);
              setHinaResponse("Hina is back. Be careful not to upset her again.");
            }}
          />
          {activeCall && <CallingSystem {...activeCall} onEnd={() => setActiveCall(null)} onAccept={() => setActiveCall(null)} />}
          {showLibrary && (
            <MediaLibrary 
              localFolders={vaultFolders} cloudFolders={[]} 
              currentUser={currentUser} usersList={users} 
              onClose={() => setShowLibrary(false)} 
              onInitiateCall={(u, t) => setActiveCall({ targetName: u.name, type: t, incoming: false, callerRole: u.role })} 
            />
          )}
          {(isImagining || generatedImage) && (
            <VisionCanvas 
              image={generatedImage?.url || null} prompt={generatedImage?.prompt || "Thinking..."} 
              isImagining={isImagining} onClose={() => setGeneratedImage(null)} personality={personality}
            />
          )}
          {showLocation && location && <LocationTracker lat={location.lat} lng={location.lng} onClose={() => setShowLocation(false)} />}
        </>
      )}
    </div>
  );
};
export default App;
