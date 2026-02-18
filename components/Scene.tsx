import React, { Suspense, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  View, 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  Center,
  Grid,
  Html,
  Bounds,
  useBounds
} from '@react-three/drei';
import * as THREE from 'three';
import { ViewConfig } from '../types';

interface SceneProps {
  modelUrl: string | null;
  wireframe: boolean;
  autoRotate: boolean;
  showGrid: boolean;
  mainRef: React.RefObject<HTMLDivElement | null>;
  viewRefs: Record<string, React.RefObject<HTMLDivElement | null>>;
  views: ViewConfig[];
}

// Component to handle model loading and material processing
const Model: React.FC<{ url: string; wireframe?: boolean }> = ({ url, wireframe }) => {
  const { scene } = useGLTF(url);
  
  // Clone scene for multiple views
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (wireframe) {
           // Wireframe override
           const createWireframe = (m: THREE.Material) => {
             const cm = m.clone();
             (cm as THREE.MeshStandardMaterial).wireframe = true;
             return cm;
           };
           if (Array.isArray(child.material)) {
             child.material = child.material.map(createWireframe);
           } else {
             child.material = createWireframe(child.material);
           }
        } else {
           // Fix dark materials
           const fixMaterial = (m: THREE.Material) => {
             if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
               const stdMat = m as THREE.MeshStandardMaterial;
               // lighten up dark models
               if (stdMat.metalness > 0.8) stdMat.metalness = 0.5;
               if (stdMat.roughness < 0.2) stdMat.roughness = 0.5;
               // Ensure color isn't too dark
               if (stdMat.color.r < 0.1 && stdMat.color.g < 0.1 && stdMat.color.b < 0.1) {
                  stdMat.color.setHex(0xaaaaaa);
               }
               stdMat.needsUpdate = true;
             }
           };
           if (Array.isArray(child.material)) child.material.forEach(fixMaterial);
           else fixMaterial(child.material);
        }
      }
    });
    return clone;
  }, [scene, wireframe]);

  return <primitive object={clonedScene} />;
};

// Auto-zoom component to ensure model fits in view
const SelectToZoom = ({ children }: { children: React.ReactNode }) => {
  const api = useBounds();
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      // clip().fit() fits the bounds to the screen
      api.refresh(groupRef.current).clip().fit();
    }
  }, [children, api]);
  
  return <group ref={groupRef}>{children}</group>;
};

const LoadingIndicator = () => (
  <Html center>
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 rounded-lg border border-slate-700 shadow-xl backdrop-blur-md">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-slate-200">Rendering...</span>
    </div>
  </Html>
);

export const ViewerScene: React.FC<SceneProps> = ({ 
  modelUrl, 
  wireframe, 
  autoRotate, 
  showGrid, 
  mainRef, 
  viewRefs, 
  views 
}) => {
  if (!modelUrl) return null;

  return (
    <Canvas
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 30 }}
      shadows
      gl={{ antialias: true }}
    >
      <View.Port />

      {/* ================= MAIN VIEW ================= */}
      <View track={mainRef as React.MutableRefObject<HTMLElement>}>
         <color attach="background" args={['#0f172a']} />
         
         <ambientLight intensity={1.5} />
         <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
         <spotLight position={[0, 10, 0]} intensity={2} angle={0.5} penumbra={1} castShadow />

         <Suspense fallback={<LoadingIndicator />}>
           {/* Bounds automatically sizes the camera to fit the object. Margin < 1.0 zooms in. */}
           <Bounds fit clip observe margin={0.5}>
             <SelectToZoom>
               <Center>
                  <Model url={modelUrl} wireframe={wireframe} />
               </Center>
             </SelectToZoom>
           </Bounds>
         </Suspense>

         {showGrid && <Grid infiniteGrid fadeDistance={40} sectionColor="#475569" cellColor="#1e293b" position={[0, -0.01, 0]} />}
         
         <OrbitControls makeDefault autoRotate={autoRotate} />
      </View>


      {/* ================= FIXED VIEWS ================= */}
      {views.map((view) => (
        <View track={viewRefs[view.id] as React.MutableRefObject<HTMLElement>} key={view.id}>
          <color attach="background" args={['#020617']} />
          
          <ambientLight intensity={2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
          <Suspense fallback={null}>
             {/* 
                Use Bounds for fixed views as well.
                This ensures the camera (at fixed angle) zooms in to fill the frame.
             */}
             <Bounds fit clip observe margin={0.6}>
               <SelectToZoom>
                 <Center>
                    <Model url={modelUrl} wireframe={wireframe} />
                 </Center>
               </SelectToZoom>
             </Bounds>
             
             {/* Small axes helper for orientation reference in fixed views */}
             <axesHelper args={[2]} />
          </Suspense>
          
          <PerspectiveCamera 
            makeDefault 
            position={view.position} 
            fov={35}
            onUpdate={(c) => c.lookAt(0, 0, 0)}
          />
        </View>
      ))}
    </Canvas>
  );
};