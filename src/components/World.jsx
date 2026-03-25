import { RigidBody } from '@react-three/rapier';
import { Box, useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

export const World = () => {
  const { scene } = useGLTF('/models/terreno2.glb');
  
  // Força todos os materiais do terreno a receberem sombra
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = false; // terreno não projeta sombra (economiza)
        if (child.material) {
          // Garante que o material responde à luz
          child.material.shadowSide = THREE.FrontSide;
        }
      }
    });
  }, [scene]);

  return (
    <>
      {/* Terreno com colisão */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive 
          object={scene} 
          castShadow={false}
          receiveShadow={true}
        />
      </RigidBody>

      {/* Cubo de referência vermelho COM SOMBRA */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="red" emissive="darkred" />
      </mesh>

      {/* Obstáculos COM SOMBRAS */}
   
    </>
  );
};