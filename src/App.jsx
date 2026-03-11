import React from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, useXR } from '@react-three/xr';
import { Box, Plane, Html } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

// Cria a store XR (necessário para a versão 6)
const store = createXRStore();

function ARScene() {
  const { isPresenting } = useXR();

  return (
    <>
      <ambientLight />
      <pointLight position={[5, 5, 5]} />
      
      {/* Um cubo flutuante */}
      <RigidBody colliders="cuboid" position={[0, 2, -2]}>
        <Box args={[1, 1, 1]}>
          <meshStandardMaterial color="hotpink" emissive="red" />
        </Box>
      </RigidBody>

      {/* Chão invisível para colisão (opcional) */}
      <RigidBody type="fixed" position={[0, 0, 0]}>
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial transparent opacity={0} />
        </Plane>
      </RigidBody>

      {/* UI flutuante para sair do AR */}
      {isPresenting && (
        <Html position={[0, 1, -1]}>
          <button onClick={() => store.exitAR()}>Sair do AR</button>
        </Html>
      )}
    </>
  );
}

function App() {
  return (
    <>
      {/* Botão para iniciar AR (fora do Canvas) */}
      <button
        onClick={() => store.enterAR()}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}
      >
        Iniciar AR
      </button>

      <Canvas style={{ width: '100vw', height: '100vh' }}>
        <XR store={store}>
          <Physics gravity={[0, -9.81, 0]}>
            <ARScene />
          </Physics>
        </XR>
      </Canvas>
    </>
  );
}

export default App;