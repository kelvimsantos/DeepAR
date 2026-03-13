import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import useGameStore from '../hooks/useGameStore';

/**
 * Componente que renderiza um modelo GLTF apenas se estiver a uma distância
 * menor que `maxDistance` do jogador.
 *
 * @param {string} url - Caminho para o arquivo .glb
 * @param {[number, number, number]} position - Posição do modelo no mundo
 * @param {number} maxDistance - Distância máxima para renderizar (metros)
 * @param {object} props - Outras props (ex: scale, rotation)
 */
export const OptimizedModel = ({ url, position, maxDistance = 15, ...props }) => {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const playerPos = useGameStore(state => state.playerPosition);

  useFrame(() => {
    if (ref.current && playerPos) {
      // Calcula a distância entre o modelo e o jogador
      const dx = ref.current.position.x - playerPos.x;
      const dy = ref.current.position.y - playerPos.y;
      const dz = ref.current.position.z - playerPos.z;
      const distSq = dx*dx + dy*dy + dz*dz;
      const maxDistSq = maxDistance * maxDistance;

      // Atualiza a visibilidade
      ref.current.visible = distSq <= maxDistSq;
    }
  });

  return <primitive ref={ref} object={scene} position={position} {...props} />;
};

// Pré-carregamento opcional (pode ser feito globalmente)
// useGLTF.preload(url);