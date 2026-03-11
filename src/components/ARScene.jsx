import { useRef, useEffect } from 'react';
import { Player } from './Player';
import { World } from './World';
import { MovementController } from './MovementController';
import { RepositionButton } from './RepositionButton';
import useGameStore from '../hooks/useGameStore';

const ARScene = () => {
  const worldGroupRef = useRef(null);
  const { setWorldGroupRef } = useGameStore();

  useEffect(() => {
    setWorldGroupRef(worldGroupRef.current);
  }, [setWorldGroupRef]);

  return (
    <>
      {/* Grupo posicionado a 2 metros na frente da câmera */}
      <group ref={worldGroupRef} position={[0, -0.5, -6] }  >
        <Player />
        <World />
        <MovementController />
      </group>
      <RepositionButton />
    </>
  );
};

export default ARScene;