import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import useGameStore from '../hooks/useGameStore';

export const CameraTracker = () => {
  const { camera } = useThree();
  const setCameraPosition = useGameStore((state) => state.setCameraPosition);

  useFrame(() => {
    setCameraPosition(camera.position.clone());
  });

  return null;
};