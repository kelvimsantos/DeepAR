// src/components/JoystickOverlay.jsx
import { useEffect, useRef } from 'react';
import useGameStore from '../hooks/useGameStore';

export function JoystickOverlay() {
  const moveActive = useRef(false);
  const moveTouchId = useRef(null);
  const { playerRigidBody, setMovementDirection } = useGameStore();

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (!playerRigidBody) return;

      const touch = e.touches[0];
      if (!touch) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Só ativa se tocar nos 30% inferiores da tela
      if (touch.clientY < screenH * 0.7) return;

      // Lado esquerdo (movimento)
      if (touch.clientX < screenW / 2) {
        moveActive.current = true;
        moveTouchId.current = touch.identifier;
        console.log('Movimento ativado');
      } 
      // Lado direito (pulo)
      else {
        console.log('Pulo');
        if (playerRigidBody) {
          const vel = playerRigidBody.linvel();
          if (Math.abs(vel.y) < 0.1) {
            playerRigidBody.setLinvel({ x: vel.x, y: 5, z: vel.z }, true);
          }
        }
      }
    };

    const handleTouchMove = (e) => {
      if (!moveActive.current || !playerRigidBody) return;

      const touch = e.touches[0];
      if (!touch) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Centro da área de movimento (canto inferior esquerdo)
      const centerX = screenW / 4;
      const centerY = screenH - 100;

      // Calcula vetor direção
      let dx = (touch.clientX - centerX) / 80;
      let dy = (touch.clientY - centerY) / 80;

      // Limita ao círculo
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 1) {
        dx /= length;
        dy /= length;
      }

      // Converte para direção cardinal (4 direções)
      let dir = null;
      const threshold = 0.5;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold) dir = 'right';
        else if (dx < -threshold) dir = 'left';
      } else {
        // Inverte dy porque no celular positivo é para baixo
        if (dy > threshold) dir = 'backward'; // para trás
        else if (dy < -threshold) dir = 'forward'; // para frente
      }

      if (dir) setMovementDirection(dir);
    };

    const handleTouchEnd = (e) => {
      if (moveActive.current) {
        moveActive.current = false;
        moveTouchId.current = null;
        setMovementDirection(null);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [playerRigidBody, setMovementDirection]);

  return null;
}