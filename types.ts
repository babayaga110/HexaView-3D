
export type CameraView = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'main';

export interface ViewConfig {
  id: CameraView;
  label: string;
  position: [number, number, number]; // [x, y, z]
  rotation?: [number, number, number];
  fov?: number;
}

export interface ViewerState {
  modelUrl: string | null;
  fileName: string | null;
  wireframe: boolean;
  autoRotate: boolean;
  showGrid: boolean;
  isDragging: boolean;
}
