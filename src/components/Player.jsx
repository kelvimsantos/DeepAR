import { useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import useGameStore from '../hooks/useGameStore';

export const Player = () => {
  const rigidBodyRef = useRef();
  const setPlayerRigidBody = useGameStore((state) => state.setPlayerRigidBody);

  useEffect(() => {
    if (rigidBodyRef.current) {
      setPlayerRigidBody(rigidBodyRef.current);
    }
    return () => setPlayerRigidBody(null);
  }, [setPlayerRigidBody]);

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="cuboid"
      mass={1}
      position={[0, 1, 0]}
      linearDamping={0.5}
    >
      <mesh>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="hotpink" emissive="darkred" />
      </mesh>
    </RigidBody>
  );
};