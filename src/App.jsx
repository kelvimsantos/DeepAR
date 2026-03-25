import { Canvas } from '@react-three/fiber';
import { XR, ARButton } from '@react-three/xr';
import { Physics } from '@react-three/rapier';
import ARScene from './components/ARScene';
import { JoystickVisual } from './components/JoystickVisual';
import { JoystickOverlay } from './components/JoystickOverlay';
import './App.css';

function App() {
  return (
    <>
      <ARButton
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10000,
          padding: '12px 24px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          cursor: 'pointer',
        }}
        sessionInit={{
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.body },
        }}
      />

      <JoystickVisual side="left" />
      <JoystickVisual side="right" />
      <JoystickOverlay />

      <Canvas
        shadows
        gl={{ alpha: true }}
        style={{
          width: '100vw',
          height: '100vh',
          background: 'transparent',
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
        camera={{ near: 0.1, far: 1000, position: [0, 5, 5], rotation: [-1, 0, 0] }}
      >
        {/* REMOVIDA a luz direcional fixa - só mantém a ambiente básica */}
        <ambientLight intensity={0.5} />
        
        <XR
          sessionInit={{
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: document.body },
          }}
        >
          <Physics gravity={[0, -9.81, 0]}>
            <ARScene />
          </Physics>
        </XR>
      </Canvas>
    </>
  );
}

export default App;