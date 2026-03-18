import { useRef, useEffect, useState } from 'react';
import { Player } from './Player';
import { LoadedScene } from './LoadedScene';
import { MovementController } from './MovementController';
import { RepositionButton } from './RepositionButton';
import useGameStore from '../hooks/useGameStore';
import { World } from './World';
import { Html } from '@react-three/drei'; // para botões 2D na cena

const ARScene = () => {
  const worldGroupRef = useRef(null);
  const { setWorldGroupRef, playerRigidBody } = useGameStore();
  const [sceneData, setSceneData] = useState(null);
  const [loadingError, setLoadingError] = useState(null);

  const targetGlobalPosition = [10, 30, 5];
  const playerSpawnPosition = [
    targetGlobalPosition[0] - 0,
    targetGlobalPosition[1] - (-1),
    targetGlobalPosition[2] - (-9)
  ];

  useEffect(() => {
    setWorldGroupRef(worldGroupRef.current);
  }, [setWorldGroupRef]);

  useEffect(() => {
    fetch('/scene.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setSceneData(data))
      .catch(err => console.error('Erro ao carregar cena:', err));
  }, []);

  // Função para teleportar o jogador para cima
  const teleportUp = () => {
    if (!playerRigidBody) return;
    const currentPos = playerRigidBody.translation();
    // Aumenta a altura em 10 unidades
    playerRigidBody.setTranslation(
      { x: currentPos.x, y: currentPos.y + 10, z: currentPos.z },
      true // wake up
    );
  };

  return (
    <>
      <group ref={worldGroupRef} position={[0, -1, -9]}>
        <World />
        {sceneData && <LoadedScene sceneData={sceneData} />}
        {loadingError && (
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[0.5,0.5,0.5]} />
            <meshStandardMaterial color="red" />
          </mesh>
        )}
        <Player spawnPosition={playerSpawnPosition} />
        <MovementController />
      </group>
      <RepositionButton />

      {/* Botão de teleporte (posicionado no canto inferior esquerdo) */}
      <Html
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '20px',
          zIndex: 10002,
          pointerEvents: 'auto',
        }}
        transform={false}
      >
        <button
          onClick={teleportUp}
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.9)',
            border: '2px solid #ffaa00',
            borderRadius: '8px',
            color: '#333',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          }}
        >
          ⬆️ Teleportar para cima
        </button>
      </Html>
    </>
  );
};

export default ARScene;