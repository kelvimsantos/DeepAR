import { useRef, useEffect, useState } from 'react';
import { RigidBody } from '@react-three/rapier';
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
  const currentAnim = useRef('Idle'); // guarda animação atual para evitar trocas desnecessárias

  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, visualRef);

  // Expõe moveDir no rigid body e registra no store
  useEffect(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.currentMoveDir = moveDir;
      setPlayerRigidBody(rigidBodyRef.current);
    }
    return () => setPlayerRigidBody(null);
  }, [setPlayerRigidBody]);

  // Função para tocar animação
  const playAnimation = (name) => {
    if (!actions || !actions[name] || currentAnim.current === name) return;
    Object.values(actions).forEach(action => action.stop());
    actions[name].reset().play();
    currentAnim.current = name;
    console.log('Trocando animação para:', name);
  };

  // Atualiza a cada frame: movimento e detecção de chão
  useFrame(({ camera }) => {
    if (!rigidBodyRef.current) return;

    const { x: dx, z: dz } = moveDir.current;
    const currentVel = rigidBodyRef.current.linvel();

    // Detecção de chão simplificada
    const grounded = Math.abs(currentVel.y) < 0.1;
    setIsGrounded(grounded);

    //['Crouch', 'Idle', 'Rifle_crouch', 'Rifle_run', 'Rifle_stand', 'Run', 'Walk']
    // Lógica de animação baseada no movimento e chão
    const isMoving = dx !== 0 || dz !== 0;
    if (!isMoving) {if (!grounded) { playAnimation('Crouch');} else
      playAnimation('Idle');
    } else {
      // Se estiver no chão, anda; se no ar, talvez uma animação de queda, mas temos apenas Crouch? Vamos usar Walk para andar
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

    // Rotaciona o modelo visual na direção do movimento
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
      colliders="cuboid"
      mass={1}
      position={[0, 1, 0]}
      linearDamping={0.5}
      enabledRotations={[false, false, false]}
    >
      <group>
        {/* Cubo visível (opcional) */}
        <mesh>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color="hotpink" emissive="darkred" />
        </mesh>

        {/* Modelo animado */}
        <group ref={visualRef} scale={0.25} position={[0, -0.25, 0]}>
          <primitive object={scene} />
        </group>
      </group>
    </RigidBody>
  );
};

useGLTF.preload(MODEL_PATH);