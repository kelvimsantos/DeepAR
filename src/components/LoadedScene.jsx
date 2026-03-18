import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const SceneObject = ({ data }) => {
  const rotation = Array.isArray(data.rotation) ? data.rotation : [0, 0, 0];
  const { scene } = useGLTF(data.modelPath);
  const modelRef = useRef();

  // Opcional: inspecionar a bounding box do modelo
  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      console.log('Bounding box do modelo:', box.min, box.max);
      // Se o mínimo y for negativo, significa que o pivô está no centro e a base está em -altura/2
    }
  }, []);

  // Parâmetros do collider manual (ajuste conforme necessário)
  // Para uma árvore, talvez um cubo fino (0.5, 1.0, 0.5) centralizado na base
  // Você pode calcular dinamicamente a partir da bounding box
  const colliderSize = [0.5, 1.0, 0.5];
  const colliderOffset = [0, 0.5, 0]; // se o pivô está no centro, a base está em -altura/2, então offset +altura/2

  return (
    <RigidBody
      position={data.position}
      rotation={rotation}
      type="fixed"
      colliders={false} // desativa collider automático
    >
      {/* Modelo visual (pode precisar de ajuste de posição) */}
      <group ref={modelRef} scale={data.scale}>
        <primitive object={scene.clone()} />
      </group>

      {/* Collider manual */}
      <CuboidCollider
        args={colliderSize}
        position={colliderOffset}
        rotation={rotation}
      />

      {/* Debug: cubo wireframe representando o collider */}
      <mesh visible={false} position={colliderOffset} rotation={rotation}>
        <boxGeometry args={colliderSize.map(s => s * 2)} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    </RigidBody>
  );
};

export const LoadedScene = ({ sceneData }) => {
  if (!sceneData || !sceneData.objects) return null;
  return (
    <>
      {sceneData.objects.map(obj => (
        <SceneObject key={obj.id} data={obj} />
      ))}
    </>
  );
};