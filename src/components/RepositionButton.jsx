import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import useGameStore from '../hooks/useGameStore';

export const RepositionButton = () => {
  const { camera } = useThree();
  const { worldGroupRef, playerPosition } = useGameStore();

  const handleReposition = () => {
    if (!worldGroupRef) return;

    // Queremos que o jogador fique a 2 metros da câmera
    const idealDistance = 2;
    const cameraPos = camera.position.clone();
    const playerPos = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);

    // Direção da câmera para o jogador (atual)
    const camToPlayer = playerPos.clone().sub(cameraPos).normalize();
    // Onde queremos que o jogador esteja: na mesma direção, mas a idealDistance de distância
    const targetPlayerPos = cameraPos.clone().add(camToPlayer.multiplyScalar(idealDistance));
    // Deslocamento necessário: targetPlayerPos - playerPos
    const delta = targetPlayerPos.clone().sub(playerPos);

    // Aplica o deslocamento ao grupo do mundo
    worldGroupRef.position.add(delta);
  };

  return (
    <Html position={[0, 2, -2]}>
      <button
        onClick={handleReposition}
        style={{
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: '8px',
          color: '#333',
          fontSize: '18px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        }}
      >
        🔍 Aproximar Mundo
      </button>
    </Html>
  );
};