import { useEffect, useRef } from 'react';
import useGameStore from '../hooks/useGameStore';

export function JoystickOverlay() {
  const moveActive = useRef(false);
  const moveTouchId = useRef(null);
  const { playerRigidBody, setMovementDirection } = useGameStore();

  useEffect(() => {
    console.log('🎮 JoystickOverlay montado');

    const handleTouchStart = (e) => {
      // Não previne padrão para não bloquear botão AR
      if (!playerRigidBody) {
        console.log('⏳ Aguardando playerRigidBody...');
        return;
      }

      const touch = e.touches[0];
      if (!touch) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Área segura (70% inferior da tela)
      if (touch.clientY < screenH * 0.7) return;

      // Área de movimento (esquerda)
      if (touch.clientX < screenW / 2) {
        moveActive.current = true;
        moveTouchId.current = touch.identifier;
        console.log('✅ Movimento ativado');
      }
      // Área de pulo (direita) – opcional, pode remover
      else {
        console.log('🦘 Pulo');
        const vel = playerRigidBody.linvel();
        if (Math.abs(vel.y) < 0.1) {
          playerRigidBody.setLinvel(
            { x: vel.x, y: 5, z: vel.z },
            true
          );
        }
      }
    };

    const handleTouchMove = (e) => {
      if (!moveActive.current || !playerRigidBody) return;

      const touch = e.touches[0];
      if (!touch) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Centro da área de movimento
      const centerX = screenW / 4;
      const centerY = screenH - 100;

      // Calcula direção
      let dx = (touch.clientX - centerX) / 80;
      let dy = (touch.clientY - centerY) / 80;

      // Limita ao círculo
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 1) {
        dx /= length;
        dy /= length;
      }

      // Converte para direção cardinal (simplificado para 4 direções)
      // Se quiser analógico, precisaria de outra lógica, mas vamos manter 4 direções
      const angle = Math.atan2(dy, dx); // dy é vertical, dx horizontal
      const threshold = 0.5;
      let dir = null;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold) dir = 'right';
        else if (dx < -threshold) dir = 'left';
      } else {
        if (dy > threshold) dir = 'forward'; // lembre-se que dy positivo para baixo, então ajuste
        else if (dy < -threshold) dir = 'backward';
      }
      // Invertemos dy porque na tela, positivo é para baixo
      // Mas vamos usar a lógica original do projeto: z = -dy
      // Para simplificar, vou usar a mesma lógica do MovementController
      // Melhor: usar os eixos x e z diretamente, mas o MovementController espera direção cardinal.
      // Por simplicidade, vamos continuar usando a direção cardinal.
      if (dir) setMovementDirection(dir);
    };

    const handleTouchEnd = (e) => {
      if (moveActive.current) {
        moveActive.current = false;
        moveTouchId.current = null;
        console.log('⏹️ Movimento parado');
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