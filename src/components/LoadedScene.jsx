import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

const SceneObject = ({ data }) => {
  // Converte rotação se necessário (Three.js aceita array ou objeto)
  const rotation = Array.isArray(data.rotation) ? data.rotation : [0,0,0];
  const { scene } = useGLTF(data.modelPath);
    // Verifica se é um coqueiro (pela path ou nome)
  const isPalmTree = data.modelPath.includes('palm') || 
                     (data.name && data.name.toLowerCase().includes('palm_tree'));
    // Define a escala: 0.006 para coqueiros, escala original para outros
  let finalScale = data.scale;
  
  if (isPalmTree) {
    console.log('🌴 Corrigindo escala de coqueiro:', data.scale, '→ 0.006');
    finalScale = [0.006, 0.006, 0.006];
  }
  return (
    <RigidBody
      position={data.position}
      rotation={rotation}
      scale={data.scale}
      type="fixed"
      colliders="cuboid"
    >
      // No LoadedScene.jsx, ajuste a escala
<primitive object={scene.clone()} scale={data.scale.map(s => s * 100)} />
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