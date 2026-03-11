import { RigidBody } from '@react-three/rapier';
import { Box } from '@react-three/drei';

export const World = () => {
  return (
    <>
      {/* Chão verde sólido */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="green" />
        </mesh>
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