import useGameStore from '../hooks/useGameStore';
import './UI.css'; // crie este CSS básico

export const UI = () => {
  const setMovementDirection = useGameStore((state) => state.setMovementDirection);

  const handleStart = (dir) => setMovementDirection(dir);
  const handleEnd = () => setMovementDirection(null);

  return (
    <div className="movement-panel" style={{ pointerEvents: 'auto', zIndex: 2000 }}>
      <button onTouchStart={() => handleStart('forward')} onTouchEnd={handleEnd}>▲</button>
      <div>
        <button onTouchStart={() => handleStart('left')} onTouchEnd={handleEnd}>◀</button>
        <button onTouchStart={() => handleStart('right')} onTouchEnd={handleEnd}>▶</button>
      </div>
      <button onTouchStart={() => handleStart('backward')} onTouchEnd={handleEnd}>▼</button>
    </div>
  );
};