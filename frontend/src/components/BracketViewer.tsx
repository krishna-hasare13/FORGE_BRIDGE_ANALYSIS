import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PresentationControls, Grid } from '@react-three/drei';
// @ts-expect-error - STLLoader types missing in local three install
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { Download } from 'lucide-react';

interface BracketViewerProps {
  stlUrl: string;
}

const Model = ({ url, viewMode }: { url: string, viewMode: 'SOLID' | 'XRAY' }) => {
  const geom = useLoader(STLLoader, url);
  return (
    <mesh geometry={geom} castShadow receiveShadow>
      <meshStandardMaterial 
        color={viewMode === 'SOLID' ? "#0062ff" : "#00d4ff"} 
        roughness={0.1} 
        metalness={0.9} 
        emissive="#001144"
        emissiveIntensity={0.2}
        transparent={viewMode === 'XRAY'}
        opacity={viewMode === 'XRAY' ? 0.4 : 1.0}
        wireframe={viewMode === 'XRAY'}
      />
    </mesh>
  );
};

// A high-tech diagnostic grid base
const DiagnosticBase = () => (
  <Grid
    infiniteGrid
    fadeDistance={400}
    fadeStrength={5}
    cellSize={10}
    sectionSize={50}
    sectionColor="#0062ff"
    cellColor="#003366"
    position={[0, -0.1, 0]}
  />
);

const HighlightRing = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.01;
            ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
        }
    });

    return (
        <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
                <ringGeometry args={[115, 120, 64]} />
                <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

export const BracketViewer: React.FC<BracketViewerProps> = ({ stlUrl }) => {
  const [viewMode, setViewMode] = React.useState<'SOLID' | 'XRAY'>('SOLID');
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = stlUrl;
    link.download = 'forge_quantum_bracket.stl';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px', background: '#05070a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Suspense fallback={
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0062ff' }}>
          <div style={{ letterSpacing: '2px', fontSize: '0.8rem', fontWeight: 800 }}>INITIALIZING_VOLUMETRIC_VIEWPORT...</div>
        </div>
      }>
        <Canvas shadows camera={{ position: [200, 150, 200], fov: 35 }}>
          <color attach="background" args={['#05070a']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[100, 200, 100]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-100, -100, -100]} color="#00d4ff" />
          
          <PresentationControls 
            global 
            rotation={[0, 0, 0]} 
            polar={[-Math.PI / 3, Math.PI / 3]} 
            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
          >
            <Model url={stlUrl} viewMode={viewMode} />
            <HighlightRing />
          </PresentationControls>

          <DiagnosticBase />
          <Environment preset="night" />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={20} blur={24} far={45} />
          <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </Suspense>

      {/* HUD OVERLAYS */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ border: '1px solid rgba(0, 212, 255, 0.3)', background: 'rgba(5, 7, 10, 0.8)', padding: '0.5rem 1rem', borderRadius: '4px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff' }}></div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#00d4ff', letterSpacing: '1px' }}>VOLUMETRIC_VIEWPORT_01 // STABLE</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(0, 212, 255, 0.5)', fontWeight: 600, fontFamily: 'monospace' }}>RES: 4K_HD // FOV: 35.0 // RENDER: METAL_V2</div>
      </div>

      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          {(['SOLID', 'XRAY'] as const).map(m => (
              <button 
                key={m}
                onClick={() => setViewMode(m)}
                style={{
                  background: viewMode === m ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                  color: viewMode === m ? 'black' : 'white',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {m}
              </button>
          ))}
      </div>

      <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }}>
        <button 
          onClick={handleDownload}
          className="primary-btn"
          style={{
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 0 30px rgba(0, 98, 255, 0.4)',
            letterSpacing: '1px'
          }}
        >
          <Download size={18} />
          EXECUTE_STL_EXPORT
        </button>
      </div>

      <div className="scanline"></div>
    </div>
  );
};

export default BracketViewer;
