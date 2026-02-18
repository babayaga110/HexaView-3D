import React, { ReactNode, Ref } from 'react';
import { Upload, Box, Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', active, icon, ...props }) => {
  return (
    <button
      className={`
        flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
        ${active 
          ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-900/20' 
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
        }
        ${className}
      `}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

interface PanelProps {
  label?: string;
  children?: ReactNode;
  className?: string;
  onRef?: Ref<HTMLDivElement>;
  active?: boolean;
}

export const ViewPanel: React.FC<PanelProps> = ({ label, children, className = '', onRef, active }) => {
  return (
    <div 
      className={`relative w-full h-full bg-slate-900 border overflow-hidden flex flex-col ${
        active ? 'border-blue-500/50' : 'border-slate-800'
      } ${className}`}
    >
      {label && (
        <div className="absolute top-0 left-0 z-10 px-3 py-1 bg-slate-950/80 backdrop-blur-sm border-b border-r border-slate-800/50 rounded-br-lg pointer-events-none">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            {label}
          </span>
        </div>
      )}

      {/* Content Area (Canvas Portal Target) */}
      <div ref={onRef} className="flex-1 w-full h-full relative min-h-[100px]">
        {children}
      </div>
    </div>
  );
};

export const LoadingOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 text-white animate-in fade-in duration-200 pointer-events-none">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
    <p className="text-sm font-medium text-slate-400">Loading Model...</p>
  </div>
);

export const EmptyState: React.FC<{ onUpload: () => void }> = ({ onUpload }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 pointer-events-auto">
    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
      <Box className="w-8 h-8 opacity-50" />
    </div>
    <h3 className="text-lg font-semibold text-slate-200 mb-2">No Model Loaded</h3>
    <p className="text-sm max-w-xs mb-6">Upload a .glb or .gltf file to start inspecting it in multiple dimensions.</p>
    <Button onClick={onUpload} icon={<Upload className="w-4 h-4" />} active>
      Select File
    </Button>
  </div>
);