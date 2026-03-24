import { useRef, useEffect, useState } from 'react';
import { Player } from './Player';
import { LoadedScene } from './LoadedScene';
import { MovementController } from './MovementController';
import { RepositionButton } from './RepositionButton';
import useGameStore from '../hooks/useGameStore';
import { World } from './World';
import { GameGrass } from './GameGrass';
import { Html } from '@react-three/drei';

const ARScene = () => {
  const worldGroupRef = useRef(null);
  const { setWorldGroupRef, playerRigidBody } = useGameStore();
  const [sceneData, setSceneData] = useState(null);
  const [grassData, setGrassData] = useState(null);

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
      .then(res => res.json())
      .then(data => {
        setSceneData(data);
        setGrassData(data.grassInstances);
      })
      .catch(err => console.error('Erro ao carregar cena:', err));
  }, []);

  const teleportUp = () => {
    if (!playerRigidBody) return;
    const pos = playerRigidBody.translation();
    playerRigidBody.setTranslation({ x: pos.x, y: pos.y + 10, z: pos.z }, true);
  };

  // Extrai dados do terreno do sceneData (se disponível)
  const heightmap = sceneData?.terrainParams?.heightmap;
  const terrainSize = sceneData?.terrainParams?.size || 20;
  const terrainResolution = sceneData?.terrainParams?.resolution || 64;

  return (
    <>
      <group ref={worldGroupRef} position={[0, -1, -9]}  userData={{ isWorldGroup: true }}  >
        <World />
        {sceneData && <LoadedScene sceneData={sceneData} />}
        
        {/* Grama com altura corrigida pelo heightmap */}
        {grassData && heightmap && (
          <GameGrass
            instances={grassData}
            heightmap={heightmap}
            terrainSize={terrainSize}
            terrainResolution={terrainResolution}
          />
        )}

        <Player spawnPosition={playerSpawnPosition} />
        <MovementController />
      </group>

      {/* Cubo de teste fora do grupo */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="yellow" />
      </mesh>

      <RepositionButton />
      <Html style={{ position: 'absolute', bottom: 80, left: 20, zIndex: 10002 }} transform={false}>
        <button onClick={teleportUp}>⬆️ Teleportar</button>
      </Html>
    </>
  );
};

export default ARScene;