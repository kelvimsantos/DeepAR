import { RigidBody } from '@react-three/rapier';
import { Box, useGLTF } from '@react-three/drei';

export const World = () => {
  const { scene } = useGLTF('/models/terreno2.glb');

  return (
    <>
      {/* Terreno com colisão */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} />
      </RigidBody>

      {/* Cubo de referência vermelho */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="red" emissive="darkred" />
      </mesh>

      {/* Obstáculos */}
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