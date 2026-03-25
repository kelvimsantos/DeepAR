import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { timeConfig, getTimeColor } from '../config/timeConfig';

export const LightingController = ({ children }) => {
  const sunLightRef = useRef();
  const ambientLightRef = useRef();
  const timeRef = useRef(timeConfig.timeOfDay);
  const timeSpeedRef = useRef(timeConfig.timeSpeed);

  // Atualiza a iluminação baseada no tempo
  const updateLighting = (t, scene) => {
    const angle = t * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    const sunHorizontal = Math.cos(angle);
    
    // Posição do sol no céu
    const sunX = sunHorizontal * 20;
    const sunZ = Math.sin(angle) * 20;
    const sunY = Math.max(0.1, sunHeight * 15 + 5);
    
    // Obtém cor baseada no horário (AGORA DECLARADO ANTES DE USAR)
    const timeColor = getTimeColor(t);
    
    if (sunLightRef.current) {
      sunLightRef.current.position.set(sunX, sunY, sunZ);
      sunLightRef.current.color.setRGB(
        timeColor.sun[0],
        timeColor.sun[1],
        timeColor.sun[2]
      );
      sunLightRef.current.intensity = timeColor.intensity;
    }
    
    if (ambientLightRef.current) {
      // Luz ambiente mais fraca à noite
      const ambientIntensity = Math.max(0.1, Math.min(0.8, sunHeight * 0.8 + 0.2));
      ambientLightRef.current.intensity = ambientIntensity * timeConfig.ambientIntensity;
    }
    
    // Atualiza a cor do céu
    if (scene && scene.background) {
      scene.background.setRGB(
        timeColor.sky[0],
        timeColor.sky[1],
        timeColor.sky[2]
      );
    }
    
    // Atualiza neblina
    if (scene && scene.fog) {
      const fogDensity = timeConfig.fogDensity * (1 - Math.max(0, sunHeight) * 0.5);
      scene.fog.density = fogDensity;
    }
    
    return { sunHeight, timeColor };
  };

  useFrame(({ scene }) => {
    // Atualiza o tempo se a velocidade for maior que 0
    if (timeSpeedRef.current > 0) {
      timeRef.current += timeSpeedRef.current;
      if (timeRef.current >= 1) timeRef.current -= 1;
    }
    
    // Atualiza luzes
    updateLighting(timeRef.current, scene);
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
      <ambientLight ref={ambientLightRef} intensity={0.4} />
      
      {/* Luz de preenchimento (sempre presente) */}
      <hemisphereLight intensity={0.3} color={0x88aaff} groundColor={0x442200} />
      
      {/* Neblina */}
      <fog attach="fog" args={[0x88aaff, 10, 50]} />
      
      {children}
    </>
  );
};