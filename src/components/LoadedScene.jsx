import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

const SceneObject = ({ data }) => {
  // Converte rotação se necessário (Three.js aceita array ou objeto)
  const rotation = Array.isArray(data.rotation) ? data.rotation : [0,0,0];
  const { scene } = useGLTF(data.modelPath);
  return (
    <RigidBody
      position={data.position}
      rotation={rotation}
      scale={data.scale}
      type="fixed"
      colliders="cuboid"
    >
      <primitive object={scene.clone()} />
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