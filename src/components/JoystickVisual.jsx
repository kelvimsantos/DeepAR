export function JoystickVisual({ side = 'left' }) {
  const backgroundColor = side === 'left'
    ? 'rgba(0, 150, 255, 0.5)'   // azul transparente
    : 'rgba(255, 80, 80, 0.5)';  // vermelho transparente

  const borderColor = side === 'left'
    ? 'rgba(100, 200, 255, 0.8)'
    : 'rgba(255, 150, 150, 0.8)';

  return (
    <div
      className={`joystick ${side}`}
      style={{
        backgroundColor,
        border: `3px solid ${borderColor}`,
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)',
        position: 'fixed',
        bottom: '80px',
        [side]: '40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        zIndex: 10001,
        pointerEvents: 'none', // O visual não precisa capturar eventos, só o overlay
      }}
    />
  );
}