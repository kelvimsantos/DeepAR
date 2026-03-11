import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import useGameStore from '../hooks/useGameStore';

export const MovementController = () => {
  const { playerRigidBody, movementDirection } = useGameStore();

  useFrame(({ camera }) => {
    if (!playerRigidBody || !movementDirection) return;

    const cameraDirection = new Vector3(0, 0, 0);
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const moveDir = new Vector3(0, 0, 0);
    if (movementDirection === 'forward') moveDir.copy(cameraDirection);
    if (movementDirection === 'backward') moveDir.copy(cameraDirection).negate();
    if (movementDirection === 'left') {
      moveDir.copy(cameraDirection).cross(new Vector3(0, 1, 0)).normalize();
    }
    if (movementDirection === 'right') {
      moveDir.copy(cameraDirection).cross(new Vector3(0, -1, 0)).normalize();
    }

    const speed = 5;
    playerRigidBody.setLinvel(
      {
        x: moveDir.x * speed,
        y: playerRigidBody.linvel().y,
        z: moveDir.z * speed,
      },
      true
    );
  });

  return null;
};