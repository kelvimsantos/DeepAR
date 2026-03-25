import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shader para CHUVA - TRAÇOS LONGOS
const rainVertexShader = `
  attribute float speed;
  attribute vec3 direction;
  attribute float size;
  attribute float trailLength;
  varying float vAlpha;
  varying float vTrail;
  uniform float time;
  uniform float intensity;
  uniform float windStrength;
  
  void main() {
    vec3 pos = position;
    
    // Movimento vertical - QUEDA RÁPIDA
    float fallSpeed = speed * intensity * 1.5;
    float fallDistance = time * fallSpeed;
    pos.y -= fallDistance;
    
    // Movimento horizontal com vento
    float windX = sin(time * 1.8 + position.z) * 0.12 * windStrength;
    float windZ = cos(time * 1.5 + position.x) * 0.12 * windStrength;
    pos.x += windX * intensity;
    pos.z += windZ * intensity;
    
    // Reset quando cair
    if (pos.y < -2.0) {
      pos.y = 16.0;
      pos.x = (fract(sin(position.x * 12.9898) * 43758.5453) - 0.5) * 50.0;
      pos.z = (fract(cos(position.z * 78.233) * 43758.5453) - 0.5) * 50.0;
      fallDistance = 0.0;
    }
    
    // Opacidade baseada na velocidade
    vAlpha = 0.7 * intensity;
    vTrail = trailLength;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    // Tamanho base
    float pointSize = size * (350.0 / -mvPosition.z) * intensity;
    
    // Esticamento vertical (traço longo)
    gl_PointSize = pointSize;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader para CHUVA - TRAÇO VERTICAL
const rainFragmentShader = `
  uniform vec3 color;
  uniform float time;
  varying float vAlpha;
  varying float vTrail;
  
  void main() {
    vec2 coord = gl_PointCoord;
    
    // Criar traço vertical longo
    float y = coord.y;
    float x = coord.x - 0.5;
    
    // Forma de gota alongada verticalmente
    float verticalStretch = 3.5;
    float horizontalWidth = 0.25;
    
    // Intensidade baseada na posição vertical
    float intensityY = 1.0 - abs(y - 0.5) * 1.2;
    intensityY = clamp(intensityY, 0.3, 1.0);
    
    // Fade nas pontas
    float tipFade = 1.0 - abs(y - 0.5) * 0.8;
    
    // Forma do traço
    float distX = abs(x);
    float shape = 0.0;
    
    if (distX < horizontalWidth) {
      shape = intensityY * tipFade;
    }
    
    // Ponto mais brilhante no centro
    float centerGlow = (1.0 - distX * 2.0) * 0.8;
    shape += centerGlow * 0.5;
    
    float alpha = shape * vAlpha * 0.9;
    alpha = clamp(alpha, 0.0, 0.95);
    
    // Cor com brilho
    vec3 finalColor = color;
    finalColor += vec3(0.4, 0.5, 0.7) * centerGlow;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Shader para NEVE - REDONDA
const snowVertexShader = `
  attribute float speed;
  attribute vec3 direction;
  attribute float size;
  varying float vAlpha;
  uniform float time;
  uniform float intensity;
  uniform float windStrength;
  
  void main() {
    vec3 pos = position;
    
    float fallSpeed = speed * intensity * 0.35;
    pos.y -= time * fallSpeed;
    
    float windX = sin(time * 1.2 + position.z) * 0.06 * windStrength;
    float windZ = cos(time * 1.0 + position.x) * 0.06 * windStrength;
    pos.x += windX * intensity;
    pos.z += windZ * intensity;
    
    if (pos.y < -2.0) {
      pos.y = 14.0;
      pos.x = (fract(sin(position.x * 12.9898) * 43758.5453) - 0.5) * 45.0;
      pos.z = (fract(cos(position.z * 78.233) * 43758.5453) - 0.5) * 45.0;
    }
    
    vAlpha = (1.0 - (pos.y + 2.0) / 16.0) * 0.8 * intensity;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z) * intensity;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const snowFragmentShader = `
  uniform vec3 color;
  uniform float time;
  varying float vAlpha;
  
  void main() {
    vec2 coord = gl_PointCoord;
    float dist = length(coord - 0.5);
    float alpha = (1.0 - dist * 1.3) * vAlpha;
    alpha = clamp(alpha, 0.0, 0.85);
    
    float glow = (1.0 - dist) * 0.6;
    vec3 finalColor = color + vec3(glow * 0.5);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Configurações
const particleTypes = {
  rain: {
    count: 2800,
    color: [0.55, 0.75, 0.98],
    speed: 0.28,
    size: 0.12,
    trailLength: 1.5,
    windInfluence: 1.4,
    isRain: true,
  },
  heavyRain: {
    count: 4000,
    color: [0.50, 0.70, 0.95],
    speed: 0.32,
    size: 0.14,
    trailLength: 1.8,
    windInfluence: 1.6,
    isRain: true,
  },
  snow: {
    count: 1800,
    color: [0.96, 0.98, 1.00],
    speed: 0.05,
    size: 0.14,
    windInfluence: 0.8,
    isRain: false,
  },
  blizzard: {
    count: 2600,
    color: [0.94, 0.97, 1.00],
    speed: 0.07,
    size: 0.13,
    windInfluence: 1.4,
    isRain: false,
  },
};

export const ParticleSystem = ({ 
  type = 'rain', 
  intensity = 1.0, 
  windStrength = 0.5,
  enabled = true 
}) => {
  const pointsRef = useRef();
  const timeRef = useRef(0);
  
  const config = particleTypes[type] || particleTypes.rain;
  const count = Math.floor(config.count * Math.min(1.2, intensity));
  const isRain = config.isRain;
  
  const { positions, speeds, directions, sizes, trails } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const directions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const trails = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Área maior para chuva
      const range = isRain ? 55 : 45;
      positions[i*3] = (Math.random() - 0.5) * range;
      positions[i*3+1] = Math.random() * 18;
      positions[i*3+2] = (Math.random() - 0.5) * range;
      
      speeds[i] = config.speed + Math.random() * config.speed * 0.4;
      
      const angle = Math.random() * Math.PI * 2;
      directions[i*3] = Math.cos(angle) * 0.6;
      directions[i*3+1] = 0;
      directions[i*3+2] = Math.sin(angle) * 0.6;
      
      sizes[i] = config.size * (0.7 + Math.random() * 0.8);
      trails[i] = config.trailLength || 1.0;
    }
    
    return { positions, speeds, directions, sizes, trails };
  }, [count, config.speed, config.size, config.trailLength, isRain]);
  
  const material = useMemo(() => {
    if (isRain) {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          intensity: { value: intensity },
          windStrength: { value: windStrength },
          color: { value: new THREE.Color(config.color[0], config.color[1], config.color[2]) },
        },
        vertexShader: rainVertexShader,
        fragmentShader: rainFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    } else {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          intensity: { value: intensity },
          windStrength: { value: windStrength },
          color: { value: new THREE.Color(config.color[0], config.color[1], config.color[2]) },
        },
        vertexShader: snowVertexShader,
        fragmentShader: snowFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    }
  }, [config.color, isRain]);
  
  useFrame(() => {
    if (!pointsRef.current || !enabled || intensity < 0.1) return;
    
    timeRef.current += 0.016;
    material.uniforms.time.value = timeRef.current;
    material.uniforms.intensity.value = intensity;
    material.uniforms.windStrength.value = windStrength;
  });
  
  if (!enabled || intensity < 0.1) return null;
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-speed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-direction" args={[directions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        {isRain && <bufferAttribute attach="attributes-trailLength" args={[trails, 1]} />}
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
};