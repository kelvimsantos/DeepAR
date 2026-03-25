import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TimeController = ({ 
  children,
  timeOfDay = 0.25, // 0 = meia-noite, 0.25 = nascer, 0.5 = meio-dia, 0.75 = pôr
  timeSpeed = 0.002,
  onTimeChange = null
}) => {
  const timeRef = useRef(timeOfDay);
  const sunLightRef = useRef();
  const ambientLightRef = useRef();
  const fogRef = useRef();

  // Cores do céu baseadas no tempo
  const getSkyColor = (t) => {
    // t: 0-1, ciclo completo
    const angle = t * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    
    if (sunHeight > 0.3) {
      // Dia claro
      return new THREE.Color(0.4, 0.6, 0.9);
    } else if (sunHeight > 0) {
      // Nascer/pôr
      return new THREE.Color(0.8, 0.5, 0.3);
    } else {
      // Noite
      return new THREE.Color(0.05, 0.05, 0.15);
    }
  };

  const getSunColor = (t) => {
    const angle = t * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    
    if (sunHeight > 0.5) {
      return new THREE.Color(1.0, 0.95, 0.85);
    } else if (sunHeight > 0) {
      return new THREE.Color(1.0, 0.6, 0.3);
    } else {
      return new THREE.Color(0.2, 0.2, 0.4);
    }
  };

  const getSunIntensity = (t) => {
    const angle = t * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    return Math.max(0, Math.min(1.2, sunHeight * 1.5));
  };

  const getAmbientIntensity = (t) => {
    const angle = t * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    return 0.2 + Math.max(0, sunHeight) * 0.5;
  };

  const getFogDensity = (t) => {
    const angle = t * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    // Mais neblina ao amanhecer/anoitecer
    const fogFactor = 1 - Math.abs(sunHeight);
    return 0.01 + fogFactor * 0.02;
  };

  const getWindStrength = (t) => {
    const angle = t * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    // Vento mais forte durante o dia
    return 0.15 + Math.max(0, sunHeight) * 0.2;
  };

  useFrame(({ scene }) => {
    // Atualiza o tempo
    timeRef.current += timeSpeed;
    if (timeRef.current >= 1) timeRef.current -= 1;
    
    const t = timeRef.current;
    const sunAngle = t * Math.PI * 2;
    
    // Atualiza a luz direcional
    if (sunLightRef.current) {
      const sunHeight = Math.sin(sunAngle);
      const sunX = Math.cos(sunAngle) * 20;
      const sunZ = Math.sin(sunAngle) * 20;
      
      sunLightRef.current.position.set(sunX, sunHeight * 15 + 5, sunZ);
      sunLightRef.current.intensity = getSunIntensity(t);
      sunLightRef.current.color = getSunColor(t);
    }
    
    // Atualiza luz ambiente
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = getAmbientIntensity(t);
    }
    
    // Atualiza neblina
    scene.fog.color = getSkyColor(t);
    scene.fog.density = getFogDensity(t);
    
    // Atualiza a cor de fundo
    scene.background = getSkyColor(t);
    
    // Callback para outros componentes (ex: vento)
    if (onTimeChange) {
      onTimeChange({
        timeOfDay: t,
        sunAngle: sunAngle,
        sunHeight: Math.sin(sunAngle),
        windStrength: getWindStrength(t),
        sunIntensity: getSunIntensity(t)
      });
    }
  });

  return (
    <>
      {/* Luz direcional (sol) */}
      <directionalLight
        ref={sunLightRef}
        position={[10, 15, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Luz ambiente */}
      <ambientLight ref={ambientLightRef} intensity={0.5} />
      
      {/* Neblina */}
      <fog ref={fogRef} attach="fog" args={[0x4a6c8f, 10, 50]} />
      
      {/* Luz de preenchimento (backup) */}
      <hemisphereLight intensity={0.3} color={0x88aaff} groundColor={0x442200} />
      
      {children}
    </>
  );
};