import { useRef, useEffect, useState } from 'react';
import { Player } from './Player';
import { LoadedScene } from './LoadedScene';
import { MovementController } from './MovementController';
import { RepositionButton } from './RepositionButton';
import useGameStore from '../hooks/useGameStore';
import { World } from './World';

const ARScene = () => {
  const worldGroupRef = useRef(null);
  const { setWorldGroupRef } = useGameStore();
  const [sceneData, setSceneData] = useState(null);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    setWorldGroupRef(worldGroupRef.current);
  }, [setWorldGroupRef]);

  useEffect(() => {
    fetch('/scene.json')
  .then(res => {
    if (!res.ok) {
      console.log('Resposta não ok, status:', res.status);
      return res.text().then(text => { throw new Error(`HTTP ${res.status} - ${text.substring(0,100)}`); });
    }
    return res.json();
  })
  .then(data => {
    console.log('JSON carregado:', data);
    setSceneData(data);
  })
  .catch(err => {
    console.error('Erro ao carregar cena:', err);
  });
  }, []);

  return (
    <>
      <group ref={worldGroupRef} position={[0, -1, -9]}>
        <World />
        {sceneData && <LoadedScene sceneData={sceneData} />}
        {loadingError && (
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[0.5,0.5,0.5]} />
            <meshStandardMaterial color="red" />
          </mesh>
        )}
        <Player />
        <MovementController />
      </group>
      <RepositionButton />
    </>
  );
};

export default ARScene;