// src/components/JoystickVisual.jsx
export function JoystickVisual({ side = 'left' }) {
  const color = side === 'left' ? 'rgba(0, 100, 255, 0.6)' : 'rgba(255, 50, 50, 0.6)';
  return (
    <div
      className={`joystick ${side}`}
      style={{
        backgroundColor: color,
        border: `2px solid ${side === 'left' ? 'rgba(0, 200, 255, 0.8)' : 'rgba(255, 100, 100, 0.8)'}`,
      }}
    />
  );
}