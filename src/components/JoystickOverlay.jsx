import { useEffect, useRef } from 'react';
import useGameStore from '../hooks/useGameStore';

export function JoystickOverlay() {
  const moveActive = useRef(false);
  const { setMovementDirection } = useGameStore();

  useEffect(() => {
    console.log('🎮 JoystickOverlay montado');

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Área de movimento: 70% inferior da tela, lado esquerdo
      if (touch.clientY > screenH * 0.3 && touch.clientX < screenW / 2) {
        moveActive.current = true;
        console.log('✅ Movimento ativado');
        // Não definimos direção ainda, só ativamos o movimento.
        // A direção será calculada no handleTouchMove.
      }
    };

    const handleTouchMove = (e) => {
      if (!moveActive.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Centro da área de movimento (ajuste fino)
      const centerX = screenW / 4;
      const centerY = screenH - 150;

      // Calcula o vetor de direção
      let dx = (touch.clientX - centerX) / 80;
      let dy = (touch.clientY - centerY) / 80;

      // Limita ao círculo unitário
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 1) {
        dx /= length;
        dy /= length;
      }

      // Converte o vetor em uma direção cardinal (top-down: dx = esquerda/direita, dy = frente/trás)
      // Importante: dy negativo significa para frente (para cima na tela), dy positivo para trás.
      const threshold = 0.3;
      let dir = null;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold) dir = 'right';
        else if (dx < -threshold) dir = 'left';
      } else {
        if (dy < -threshold) dir = 'forward'; // dy negativo = cima da tela = frente
        else if (dy > threshold) dir = 'backward';
      }

      if (dir) {
        setMovementDirection(dir);
      }
    };

    const handleTouchEnd = () => {
      if (moveActive.current) {
        moveActive.current = false;
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
  }, [setMovementDirection]);

  return null;
}