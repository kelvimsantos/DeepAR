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
        }}
        sessionInit={{
          requiredFeatures: ['hit-test'],
        }}
      />

      {/* Joysticks visuais */}
      <JoystickVisual side="left" />
      <JoystickVisual side="right" />

      {/* Overlay que captura os toques */}
      <JoystickOverlay />

        {/* UI DE TESTE - UM GRANDE QUADRADO VERMELHO */}
      <div style={{
        position: 'fixed',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '200px',
        backgroundColor: 'red',
        zIndex: 10001,
        pointerEvents: 'auto',
        borderRadius: '20px',
        opacity: 0.9,
      }}>
        <p style={{ color: 'white', textAlign: 'center' }}>UI TESTE</p>
      </div>

      <Canvas
        gl={{ alpha: true }}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
        camera={{ near: 0.1, far: 1000 }}
      >
         <ambientLight intensity={1.2} />
          <directionalLight position={[5, 10, 5]} intensity={2} />
        <XR>
          <Physics gravity={[0, -9.81, 0]}>
            <ARScene />
          </Physics>
        </XR>
      </Canvas>
    </>
  );
}

export default App;