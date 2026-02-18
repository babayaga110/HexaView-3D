import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileBox, Cuboid, RotateCw, Grid3X3, Box } from 'lucide-react';
import { ViewerScene } from './components/Scene';
import { Button, ViewPanel, EmptyState, LoadingOverlay } from './components/UI';
import { ViewConfig, ViewerState } from './types';

// Constants - Initial positions set far out; Bounds will auto-zoom to fit.
const FIXED_VIEWS: ViewConfig[] = [
  { id: 'front', label: 'Front View', position: [0, 0, 10] },
  { id: 'back', label: 'Back View', position: [0, 0, -10] },
  { id: 'left', label: 'Left View', position: [-10, 0, 0] },
  { id: 'right', label: 'Right View', position: [10, 0, 0] },
  { id: 'top', label: 'Top View', position: [0, 10, 0] },
  { id: 'bottom', label: 'Bottom View', position: [0, -10, 0] },
];

const App: React.FC = () => {
  // --- State ---
  const [state, setState] = useState<ViewerState>({
    modelUrl: null,
    fileName: null,
    wireframe: false,
    autoRotate: false,
    showGrid: true,
    isDragging: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // --- Refs ---
  const mainViewRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Map IDs to Refs
  const viewRefs = {
    front: frontRef,
    back: backRef,
    left: leftRef,
    right: rightRef,
    top: topRef,
    bottom: bottomRef,
  };

  // --- Handlers ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const url = URL.createObjectURL(file);

    setTimeout(() => {
      setState(prev => ({ ...prev, modelUrl: url, fileName: file.name }));
      setIsLoading(false);
    }, 800);
  };

  const triggerFileUpload = () => {
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if (input) input.click();
  };

  const toggleState = (key: keyof ViewerState) => {
    setState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(s => ({ ...s, isDragging: true }));
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(s => ({ ...s, isDragging: false }));
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(s => ({ ...s, isDragging: false }));
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setState(prev => ({ ...prev, modelUrl: url, fileName: file.name }));
        setIsLoading(false);
      }, 500);
    } else {
        alert("Please upload a valid .glb or .gltf file");
    }
  }, []);

  return (
    <div 
      className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 font-sans"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input 
        type="file" 
        id="file-upload" 
        accept=".glb,.gltf" 
        className="hidden" 
        onChange={handleFileUpload} 
      />

      <header className="h-14 px-6 border-b border-slate-800 bg-slate-900 flex items-center justify-between shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Cuboid className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">HexaView <span className="text-blue-500">3D</span></h1>
          {state.fileName && (
            <div className="ml-4 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
              <FileBox className="w-3 h-3" />
              {state.fileName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {state.modelUrl && (
            <>
              <div className="h-6 w-px bg-slate-800 mx-2" />
              <Button 
                onClick={() => toggleState('wireframe')} 
                active={state.wireframe} 
                icon={<Box className="w-4 h-4" />}
                title="Toggle Wireframe"
              >
                Wireframe
              </Button>
              <Button 
                onClick={() => toggleState('autoRotate')} 
                active={state.autoRotate} 
                icon={<RotateCw className="w-4 h-4" />}
                title="Auto Rotate Main View"
              >
                Auto-Spin
              </Button>
              <Button 
                onClick={() => toggleState('showGrid')} 
                active={state.showGrid} 
                icon={<Grid3X3 className="w-4 h-4" />}
                title="Toggle Grid"
              >
                Grid
              </Button>
            </>
          )}
          <div className="h-6 w-px bg-slate-800 mx-2" />
          <Button onClick={triggerFileUpload} icon={<Upload className="w-4 h-4" />} className="bg-blue-600 text-white hover:bg-blue-500 border-none">
            Upload Model
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
        {isLoading && <LoadingOverlay />}
        {state.isDragging && (
           <div className="absolute inset-0 z-50 bg-blue-600/20 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-2xl flex items-center justify-center">
             <div className="text-2xl font-bold text-white drop-shadow-md">Drop .GLB file here</div>
           </div>
        )}

        {/* Main View Container */}
        <div className="w-full h-1/2 md:h-full md:w-[60%] border-r border-slate-800 relative bg-slate-900 flex flex-col">
           <ViewPanel 
             label="Interactive Inspection" 
             onRef={mainViewRef} 
             className="border-none bg-transparent flex-1" 
             active
           >
              {!state.modelUrl && !isLoading && <EmptyState onUpload={triggerFileUpload} />}
           </ViewPanel>
           
           {state.modelUrl && (
             <div className="absolute bottom-4 left-4 z-10 px-3 py-2 bg-slate-950/50 backdrop-blur text-xs text-slate-500 rounded border border-slate-800/50 pointer-events-none">
               <span className="text-slate-300">Orbit</span> Left Click • <span className="text-slate-300">Pan</span> Right Click • <span className="text-slate-300">Zoom</span> Scroll
             </div>
           )}
        </div>

        {/* Fixed Views Grid */}
        <div className="w-full h-1/2 md:h-full md:w-[40%] grid grid-cols-2 grid-rows-3 gap-px bg-slate-800">
           {FIXED_VIEWS.map((view) => (
             <ViewPanel 
                key={view.id}
                label={view.label} 
                onRef={viewRefs[view.id]}
                className="bg-slate-900"
             />
           ))}
        </div>
      </main>
      
      <ViewerScene 
        modelUrl={state.modelUrl}
        wireframe={state.wireframe}
        autoRotate={state.autoRotate}
        showGrid={state.showGrid}
        mainRef={mainViewRef}
        viewRefs={viewRefs}
        views={FIXED_VIEWS}
      />
    </div>
  );
};

export default App;