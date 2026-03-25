import React, { useState } from 'react';

export const WindControlUI = ({ onWindChange }) => {
  const [windStrength, setWindStrength] = useState(0.2);
  const [windSpeed, setWindSpeed] = useState(1.0);

  const handleStrengthChange = (e) => {
    const val = parseFloat(e.target.value);
    setWindStrength(val);
    onWindChange({ windStrength: val, windSpeed });
  };

  const handleSpeedChange = (e) => {
    const val = parseFloat(e.target.value);
    setWindSpeed(val);
    onWindChange({ windStrength, windSpeed: val });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '150px',
      right: '20px',
      zIndex: 10003,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      padding: '12px 16px',
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      border: '1px solid rgba(255,255,255,0.2)',
      minWidth: '160px',
      pointerEvents: 'auto'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>🌬️</span> CONTROLE DO VENTO
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>💨 Intensidade</span>
          <span>{windStrength.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1.2"
          step="0.01"
          value={windStrength}
          onChange={handleStrengthChange}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>⚡ Velocidade</span>
          <span>{windSpeed.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={windSpeed}
          onChange={handleSpeedChange}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>
      
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#aaa', textAlign: 'center' }}>
        {windStrength < 0.3 ? '🌿 Brisa suave' : windStrength < 0.7 ? '🍃 Vento moderado' : '🌪️ Ventania!'}
      </div>
    </div>
  );
};