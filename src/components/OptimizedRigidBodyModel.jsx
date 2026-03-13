import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import useGameStore from '../hooks/useGameStore';

export const OptimizedRigidBodyModel = ({ url, position, maxDistance = 15, ...rigidProps }) => {
  const rigidRef = useRef();
  const { scene } = useGLTF(url);
  const playerPos = useGameStore(state => state.playerPosition);

  useFrame(() => {
    if (rigidRef.current && playerPos) {
      const pos = rigidRef.current.translation();
      const dx = pos.x - playerPos.x;
      const dy = pos.y - playerPos.y;
      const dz = pos.z - playerPos.z;
      const distSq = dx*dx + dy*dy + dz*dz;
      const maxDistSq = maxDistance * maxDistance;

      // Aqui você precisa esconder o modelo. Como o modelo é filho do RigidBody,
      // você pode acessar o grupo do RigidBody e esconder todo o grupo.
      // Mas o RigidBody não expõe diretamente o grupo visual. Uma alternativa é colocar
      // o modelo em um grupo separado e controlar a visibilidade desse grupo.
    }
  });

  return (
    <RigidBody ref={rigidRef} position={position} {...rigidProps}>
      <group>
        <primitive object={scene} />
      </group>
    </RigidBody>
  );
};