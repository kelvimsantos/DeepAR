import { RigidBody } from '@react-three/rapier';
import { Box, useGLTF } from '@react-three/drei';

export const World = () => {
  // Carrega o modelo GLB do terreno (exportado do editor)
  const { scene: terrainScene } = useGLTF('/models/terrain1.glb');

  return (
    <>
      {/* Terreno vindo do GLB */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={terrainScene.clone()} />
      </RigidBody>

      {/* (Opcional) Cubo de referência vermelho - pode remover depois */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="red" emissive="darkred" />
      </mesh>

      {/* Obstáculos de exemplo (podem ser substituídos pelo JSON futuramente) */}
      <RigidBody colliders="cuboid" position={[2, 1, 2]}>
        <Box args={[1, 2, 1]}>
          <meshStandardMaterial color="cyan" />
        </Box>
      </RigidBody>

      <RigidBody colliders="cuboid" position={[-2, 0.5, -2]}>
        <Box args={[2, 1, 2]}>
          <meshStandardMaterial color="orange" />
        </Box>
      </RigidBody>

      <RigidBody colliders="cuboid" position={[4, 1.5, -1]}>
        <Box args={[1, 3, 1]}>
          <meshStandardMaterial color="yellow" />
        </Box>
      </RigidBody>
    </>
  );
};