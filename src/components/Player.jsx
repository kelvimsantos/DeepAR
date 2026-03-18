import { useRef, useEffect, useState } from 'react';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { Vector3 } from 'three';
import useGameStore from '../hooks/useGameStore';

const MODEL_PATH = '/models/player.glb';

export const Player = () => {
  const rigidBodyRef = useRef();
  const visualRef = useRef();
  const moveDir = useRef({ x: 0, z: 0 });
  const [isGrounded, setIsGrounded] = useState(true);
  const setPlayerRigidBody = useGameStore((state) => state.setPlayerRigidBody);
  const currentAnim = useRef('Idle');

  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, visualRef);

  useEffect(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.currentMoveDir = moveDir;
      setPlayerRigidBody(rigidBodyRef.current);
    }
    return () => setPlayerRigidBody(null);
  }, [setPlayerRigidBody]);

  const playAnimation = (name) => {
    if (!actions || !actions[name] || currentAnim.current === name) return;
    Object.values(actions).forEach(action => action.stop());
    actions[name].reset().play();
    currentAnim.current = name;
  };

  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  useFrame(({ camera }) => {
    if (!rigidBodyRef.current) return;

    const position = rigidBodyRef.current.translation();
    setPlayerPosition({ x: position.x, y: position.y, z: position.z });

    const { x: dx, z: dz } = moveDir.current;
    const currentVel = rigidBodyRef.current.linvel();

    // Ground detection (simples)
    const grounded = Math.abs(currentVel.y) < 0.1;
    setIsGrounded(grounded);

    // Animação
    const isMoving = dx !== 0 || dz !== 0;
    if (!isMoving) {
      playAnimation(grounded ? 'Idle' : 'Crouch');
    } else {
      playAnimation('Run');
    }

    // Direção da câmera no plano XZ
    const cameraDir = new Vector3(0, 0, 0);
    camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    cameraDir.normalize();

    const rightDir = new Vector3().crossVectors(cameraDir, new Vector3(0, 1, 0)).normalize();

    const moveVector = new Vector3()
      .copy(cameraDir).multiplyScalar(dz)
      .add(rightDir.clone().multiplyScalar(dx));

    const speed = 2;
    rigidBodyRef.current.setLinvel(
      {
        x: moveVector.x * speed,
        y: currentVel.y,
        z: moveVector.z * speed,
      },
      true
    );

    // Rotaciona o modelo na direção do movimento
    if (visualRef.current && (dx !== 0 || dz !== 0)) {
      if (moveVector.length() > 0.1) {
        const angle = Math.atan2(moveVector.x, moveVector.z);
        visualRef.current.rotation.y = angle;
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      mass={1}
      position={[0, 1, 0]}
      linearDamping={0.5}
      enabledRotations={[false, false, false]}
    >
      {/* Colisor em forma de cápsula – altura 0.8, raio 0.3 */}
      <CapsuleCollider args={[0.2, 0.3]} />

      <group>
        {/* Cubo invisível (opcional, só para referência) */}
        <mesh visible={false}>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>

        {/* Modelo animado – posicionado para que os pés fiquem na base da cápsula */}
        <group ref={visualRef} scale={0.25} position={[0, -0.25, 0]}>
          <primitive object={scene} />
        </group>
      </group>
    </RigidBody>
  );
};

useGLTF.preload(MODEL_PATH);