import { useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import useGameStore from '../hooks/useGameStore';

export const Player = () => {
  const rigidBodyRef = useRef();
  const moveDir = useRef({ x: 0, z: 0 });
  const setPlayerRigidBody = useGameStore((state) => state.setPlayerRigidBody);

  useEffect(() => {
    if (rigidBodyRef.current) {
      // Expõe moveDir no rigid body para o joystick acessar
      rigidBodyRef.current.currentMoveDir = moveDir;
      setPlayerRigidBody(rigidBodyRef.current);
    }
    return () => setPlayerRigidBody(null);
  }, [setPlayerRigidBody]);

  useFrame(({ camera }) => {
    if (!rigidBodyRef.current) return;

    const { x: dx, z: dz } = moveDir.current;
    if (dx === 0 && dz === 0) {
      // Se não há movimento, podemos parar o personagem (opcional)
      // return;
    }

    // Obtém a direção da câmera no plano XZ
    const cameraDir = new Vector3(0, 0, 0);
    camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    cameraDir.normalize();

    // Vetor direito (perpendicular à câmera)
    const rightDir = new Vector3().crossVectors(cameraDir, new Vector3(0, 1, 0)).normalize();

    // Calcula o vetor de movimento combinando frente/direita
    const moveVector = new Vector3()
      .copy(cameraDir).multiplyScalar(dz)  // dz controla frente/trás
      .add(rightDir.clone().multiplyScalar(dx)); // dx controla esquerda/direita

    const speed = 2;
    const currentVel = rigidBodyRef.current.linvel();
    rigidBodyRef.current.setLinvel(
      {
        x: moveVector.x * speed,
        y: currentVel.y,
        z: moveVector.z * speed,
      },
      true
    );
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="cuboid"
      mass={1}
      position={[0, 1, 0]}
      linearDamping={0.5}
      enabledRotations={[false, false, false]}
    >
      <mesh>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="hotpink" emissive="darkred" />
      </mesh>
    </RigidBody>
  );
};