import { Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { Vector3, Quaternion } from 'three';
import useGameStore from '../hooks/useGameStore';
import { useState, useRef } from 'react';

export const RepositionButton = () => {
  const { camera } = useThree();
  const { world } = useRapier();
  const { playerPosition } = useGameStore();
  const [followMode, setFollowMode] = useState(false); // modo de seguimento contínuo
  const [manualMode, setManualMode] = useState(false); // opcional: manter modo manual separado

  // Offset desejado no espaço da câmera: (direita, cima, frente) - ajuste conforme necessário
  const desiredOffset = new Vector3(0, 1, -6); // 2m frente, 1m abaixo

  // Suavidade do movimento (lerp)
  const FOLLOW_SPEED = 5; // quanto maior, mais rápido (unidades por segundo? na verdade fator de interpolação)

  // Função para mover todos os corpos de uma só vez (útil para reposicionamento manual)
  const applyDeltaToAllBodies = (delta) => {
    world.bodies.forEach(body => {
      const currentPos = body.translation();
      body.setTranslation(
        { x: currentPos.x + delta.x, y: currentPos.y + delta.y, z: currentPos.z + delta.z },
        true
      );
    });
  };

  // Reposicionamento manual instantâneo (botão "Aproximar")
  const handleManualReposition = () => {
    const cameraPos = camera.position.clone();
    const playerPos = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);

    // Calcula onde o jogador deveria estar com base no offset desejado
    const targetPos = cameraPos.clone().add(desiredOffset.clone().applyQuaternion(camera.quaternion));

    const delta = new Vector3().subVectors(targetPos, playerPos);
    applyDeltaToAllBodies(delta);
    console.log('🔍 Reposicionamento manual aplicado. Delta:', delta);
  };

  // Seguimento contínuo (executado a cada frame se followMode ativo)
  useFrame(() => {
    if (!followMode) return;

    const cameraPos = camera.position.clone();
    const playerPos = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);

    // Posição desejada do jogador no mundo: cameraPos + offset rotacionado pela câmera
    const targetPos = cameraPos.clone().add(desiredOffset.clone().applyQuaternion(camera.quaternion));

    // Vetor erro (para onde o jogador precisa se mover)
    const error = new Vector3().subVectors(targetPos, playerPos);

    // Se o erro for muito pequeno, não faz nada
    if (error.length() < 0.001) return;

    // Movimento suave: move uma fração do erro (baseado em FOLLOW_SPEED e deltaTime)
    // Usamos um fator de interpolação exponencial: 1 - exp(-FOLLOW_SPEED * deltaTime)
    // Isso dá uma sensação mais natural e independente de framerate.
    const deltaTime = 1/60; // aproximado, mas podemos usar o clock do useFrame (segundo argumento)
    // Na verdade o useFrame fornece deltaTime, então vamos usar:
  });

  // Precisamos do deltaTime do useFrame, então vamos reescrever o useFrame com o parâmetro
  useFrame((_, deltaTime) => {
    if (!followMode) return;

    const cameraPos = camera.position.clone();
    const playerPos = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);

    // Posição desejada do jogador no mundo
    const targetPos = cameraPos.clone().add(desiredOffset.clone().applyQuaternion(camera.quaternion));

    // Vetor erro
    const error = new Vector3().subVectors(targetPos, playerPos);

    if (error.length() < 0.001) return;

    // Fator de interpolação: quanto mais próximo de 1, mais rápido. Usamos 1 - exp(-FOLLOW_SPEED * deltaTime)
    const factor = 1 - Math.exp(-FOLLOW_SPEED * deltaTime);
    const move = error.clone().multiplyScalar(factor);

    // Aplica o movimento a todos os corpos
    applyDeltaToAllBodies(move);
  });

  const toggleFollowMode = () => {
    setFollowMode(prev => !prev);
    console.log(followMode ? '🔴 Seguimento contínuo DESATIVADO' : '🟢 Seguimento contínuo ATIVADO');
  };

  return (
    <Html
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '20px',
        zIndex: 10002,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      transform={false}
    >
      <button
        onClick={handleManualReposition}
        style={{
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.9)',
          border: '2px solid #007bff',
          borderRadius: '8px',
          color: '#333',
          fontSize: '18px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        }}
      >
        🔍 Aproximar (manual)
      </button>
      <button
        onClick={toggleFollowMode}
        style={{
          padding: '12px 24px',
          background: followMode ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255,255,255,0.9)',
          border: `2px solid ${followMode ? '#4CAF50' : '#007bff'}`,
          borderRadius: '8px',
          color: followMode ? 'white' : '#333',
          fontSize: '18px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        }}
      >
        {followMode ? '🎯 Seguir ON' : '📌 Seguir OFF'}
      </button>
    </Html>
  );
};