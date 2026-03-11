import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import useGameStore from '../hooks/useGameStore';

export const RepositionButton = () => {
  const { camera } = useThree();
  const { worldGroupRef, playerRigidBody } = useGameStore();

  const handleReposition = () => {
    if (!worldGroupRef || !playerRigidBody) return;

    // Obtém a posição atual do jogador no mundo
    const playerPos = playerRigidBody.translation();

    // Queremos que o jogador fique a 2 metros da câmera
    const idealDistance = 2;
    const cameraPos = camera.position.clone();

    // Direção da câmera para o jogador (atual)
    const camToPlayer = new Vector3(playerPos.x, playerPos.y, playerPos.z)
      .sub(cameraPos)
      .normalize();

    // Nova posição desejada para o jogador (a 2m da câmera na mesma direção)
    const targetPlayerPos = cameraPos.clone().add(camToPlayer.multiplyScalar(idealDistance));

    // Calcula quanto o mundo precisa se mover para que o jogador chegue a targetPlayerPos
    const delta = targetPlayerPos.clone().sub(new Vector3(playerPos.x, playerPos.y, playerPos.z));

    // Move o grupo do mundo (que contém todos os objetos)
    worldGroupRef.current.position.add(delta);
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