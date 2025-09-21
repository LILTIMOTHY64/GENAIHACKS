import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MorphValues {
  mouthOpen: number;
  mouthSmile: number;
  mouthRound: number;
}

interface AvatarProps {
  morphValues?: MorphValues;
}

// Avatar Model Component with better error handling
const AvatarModelInner: React.FC<{ 
  modelPath: string; 
  morphValues: MorphValues;
  onSuccess?: () => void;
}> = ({ modelPath, morphValues, onSuccess }) => {
  const group = useRef<THREE.Group>(null);
  
  const gltf = useGLTF(modelPath);
  
  // Signal success when component mounts successfully
  useEffect(() => {
    if (gltf && gltf.scene) {
      onSuccess?.();
    }
  }, [gltf, onSuccess]);
  
  if (!gltf || !gltf.scene) {
    throw new Error('Invalid GLTF data or missing scene');
  }
  
  const { scene } = gltf;
  
  // Clone the scene to avoid sharing between instances
  const clonedScene = scene.clone();
  
  // Try to find and apply morph targets for mouth animation
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
      const geometry = child.geometry;
      if (geometry.morphAttributes.position) {
        const morphTargets = child.morphTargetDictionary;
        
        if (morphTargets) {
          // Apply mouth open morph
          if (morphTargets['mouthOpen'] !== undefined) {
            child.morphTargetInfluences![morphTargets['mouthOpen']] = morphValues.mouthOpen;
          }
          if (morphTargets['mouth_open'] !== undefined) {
            child.morphTargetInfluences![morphTargets['mouth_open']] = morphValues.mouthOpen;
          }
          
          // Apply mouth smile morph  
          if (morphTargets['mouthSmile'] !== undefined) {
            child.morphTargetInfluences![morphTargets['mouthSmile']] = morphValues.mouthSmile;
          }
          if (morphTargets['mouth_smile'] !== undefined) {
            child.morphTargetInfluences![morphTargets['mouth_smile']] = morphValues.mouthSmile;
          }
        }
      }
    }
  });
  
  return (
    <group ref={group} dispose={null} rotation={[-Math.PI / 8, 0, 0]}>
      <primitive 
        object={clonedScene} 
        scale={[1.2, 1.2, 1.2]}
        position={[0, -0.5, 0]}
      />
    </group>
  );
};

// Error boundary wrapper
const AvatarModel: React.FC<{ 
  modelPath: string; 
  morphValues: MorphValues;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}> = ({ modelPath, morphValues, onError, onSuccess }) => {
  return (
    <ErrorBoundary onError={onError}>
      <AvatarModelInner 
        modelPath={modelPath} 
        morphValues={morphValues} 
        onSuccess={onSuccess}
      />
    </ErrorBoundary>
  );
};

// Simple Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: string) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Avatar model loading error:', error);
    this.props.onError?.(error.message || 'Failed to load 3D model');
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

// Placeholder Avatar when no model is available
const PlaceholderAvatar: React.FC<{ morphValues: MorphValues }> = ({ morphValues }) => {
  const mouthRef = useRef<THREE.Mesh>(null);
  
  // Calculate mouth shape based on morph values
  const mouthScale = 1 + (morphValues.mouthOpen * 0.5);
  const mouthWidth = 1 + (morphValues.mouthSmile * 0.4);
  const mouthDepth = 1 + (morphValues.mouthRound * 0.3);
  
  return (
    <group position={[0, -0.5, 0]} scale={[1.2, 1.2, 1.2]}>
      {/* Head with better skin tone */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.8} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#4a3429" roughness={0.9} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.25, 16]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.8} />
      </mesh>
      
      {/* Body (torso) with shirt */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 0.8, 32]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, -0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.8} />
      </mesh>
      <mesh position={[0.6, -0.1, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.8} />
      </mesh>
      
      {/* Eyes with pupils */}
      <mesh position={[-0.15, 0.6, 0.45]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.15, 0.6, 0.48]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      <mesh position={[0.15, 0.6, 0.45]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, 0.6, 0.48]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Eyebrows */}
      <mesh position={[-0.15, 0.7, 0.4]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.15, 0.03, 0.02]} />
        <meshStandardMaterial color="#4a3429" />
      </mesh>
      <mesh position={[0.15, 0.7, 0.4]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.15, 0.03, 0.02]} />
        <meshStandardMaterial color="#4a3429" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 0.5, 0.48]}>
        <coneGeometry args={[0.04, 0.1, 8]} />
        <meshStandardMaterial color="#f4c2a1" roughness={0.8} />
      </mesh>
      
      {/* Animated mouth - using sphere instead of ellipse */}
      <mesh 
        ref={mouthRef} 
        position={[0, 0.35, 0.45]}
        scale={[mouthWidth * 1.5, mouthScale, mouthDepth]}
      >
        <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color="#c53030" roughness={0.6} />
      </mesh>
      
      {/* Collar - using cylinder instead of torus */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.28, 0.25, 0.06, 32]} />
        <meshStandardMaterial color="#1e40af" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Lighting setup
const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
      />
    </>
  );
};

// Preload the model
useGLTF.preload('/models/avatar.glb');

// Main Avatar Component
const Avatar: React.FC<AvatarProps> = ({ morphValues = { mouthOpen: 0, mouthSmile: 0, mouthRound: 0 } }) => {
  const [modelPath] = useState<string>('/models/avatar.glb');
  const [useModel, setUseModel] = useState(true); // Start with GLB model
  const [modelError, setModelError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleModelError = (error: string) => {
    console.error('Model loading failed:', error);
    setModelError(error);
    setUseModel(false); // Fall back to placeholder on error
    setIsLoading(false);
  };

  const handleModelSuccess = () => {
    console.log('Model loaded successfully');
    setIsLoading(false);
    setModelError(null);
  };

  // Add timeout to prevent infinite loading, but only if model hasn't loaded
  useEffect(() => {
    if (useModel && isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading && !modelError) {
          handleModelError('Model loading timeout (10s)');
        }
      }, 10000); // Increased to 10 seconds

      return () => clearTimeout(timeout);
    }
  }, [useModel, isLoading, modelError]);
  
  return (
    <div className="w-full h-full bg-gray-100 relative">
      <Canvas
        camera={{ 
          position: [0, 1.76, 1.20], // Perfect conversational framing from your image
          fov: 20, // Narrower FOV for closer crop and zoom effect
          near: 0.1,
          far: 1000 
        }}
        shadows
      >
        <Lights />
        
        {useModel ? (
          <React.Suspense 
            fallback={
              <group>
                <mesh position={[0, 0, 0]}>
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshStandardMaterial color="#4F46E5" />
                </mesh>
                {/* Loading indicator */}
                <mesh position={[0, -0.5, 0]}>
                  <boxGeometry args={[0.05, 0.05, 0.05]} />
                  <meshStandardMaterial color="#10B981" />
                </mesh>
              </group>
            }
          >
            <AvatarModel 
              modelPath={modelPath} 
              morphValues={morphValues}
              onError={handleModelError}
              onSuccess={handleModelSuccess}
            />
          </React.Suspense>
        ) : (
          <PlaceholderAvatar morphValues={morphValues} />
        )}
        
        {/* Enabled OrbitControls for manual adjustment */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 1.58, 0]} // Target point in front of camera at same height but closer to avatar
        />
      </Canvas>
      
      {/* Control panel for development */}
      <div className="absolute top-4 left-4 space-y-2">
        <button
          onClick={() => {
            if (useModel) {
              setUseModel(false);
              setModelError(null);
              setIsLoading(false);
            } else {
              setUseModel(true);
              setModelError(null);
              setIsLoading(true);
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          {useModel ? 'Use Placeholder' : 'Try GLB Model'}
        </button>
        {modelError && (
          <button
            onClick={() => {
              setUseModel(true);
              setModelError(null);
              setIsLoading(true);
            }}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Retry Model
          </button>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 text-gray-600 text-xs bg-white/80 p-2 rounded">
        <div>Status: {isLoading ? 'Loading...' : useModel ? 'GLB Model' : 'Placeholder Avatar'}</div>
        {modelError && (
          <div className="text-red-600 mt-1">Error: {modelError}</div>
        )}
      </div>

    </div>
  );
};

export default Avatar;