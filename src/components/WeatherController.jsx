import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VolumetricFog } from './VolumetricFog';
import { ParticleSystem } from './ParticleSystem';
import { updateWindFromWeather } from '../config/windConfig';

// CLIMAS — FOG VOLUMÉTRICO DENSO
const weatherList = {
  clear: { 
    name: '☀️ CLARO', wind: 0.3, 
    skyColor: [0.35, 0.70, 1.00],
    particles: null, particleIntensity: 0,
    fogDensity: 0.10, fogColor: [0.70, 0.74, 0.80], fogHeight: 0.45
  },
  cloudy: { 
    name: '☁️ NUBLADO', wind: 0.5, 
    skyColor: [0.55, 0.65, 0.85],
    particles: null, particleIntensity: 0,
    fogDensity: 0.38, fogColor: [0.68, 0.71, 0.78], fogHeight: 0.65
  },
  foggy: { 
    name: '🌫️ NEBLINA DENSA', wind: 0.2, 
    skyColor: [0.70, 0.72, 0.78],
    particles: null, particleIntensity: 0,
    fogDensity: 0.98, fogColor: [0.92, 0.94, 0.98], fogHeight: 0.98  // ← MÁXIMO
  },
  windy: { 
    name: '💨 VENTANIA', wind: 1.2, 
    skyColor: [0.45, 0.70, 0.95],
    particles: null, particleIntensity: 0,
    fogDensity: 0.18, fogColor: [0.72, 0.75, 0.82], fogHeight: 0.55
  },
  rainy: { 
    name: '🌧️ CHUVA', wind: 0.9, 
    skyColor: [0.48, 0.58, 0.72],
    particles: 'rain', particleIntensity: 0.7,
    fogDensity: 0.62, fogColor: [0.62, 0.68, 0.80], fogHeight: 0.72
  },
  heavyRain: { 
    name: '⛈️ CHUVA FORTE', wind: 1.1, 
    skyColor: [0.42, 0.52, 0.68],
    particles: 'heavyRain', particleIntensity: 0.9,
    fogDensity: 0.78, fogColor: [0.58, 0.64, 0.78], fogHeight: 0.78
  },
  snowy: { 
    name: '❄️ NEVE', wind: 0.6, 
    skyColor: [0.75, 0.80, 0.90],
    particles: 'snow', particleIntensity: 0.6,
    fogDensity: 0.55, fogColor: [0.88, 0.92, 0.99], fogHeight: 0.68
  },
  blizzard: { 
    name: '🌨️ NEVASCA', wind: 1.3, 
    skyColor: [0.70, 0.75, 0.88],
    particles: 'blizzard', particleIntensity: 0.85,
    fogDensity: 0.72, fogColor: [0.90, 0.94, 1.00], fogHeight: 0.82
  },
};

// CORES DA LUZ DO SOL (mantido igual)
const sunColors = {
  sunrise: { r: 1.00, g: 0.70, b: 0.40, intensity: 1.20 },
  noon:    { r: 1.00, g: 1.00, b: 0.95, intensity: 1.80 },
  sunset:  { r: 1.00, g: 0.65, b: 0.35, intensity: 1.20 },
  night:   { r: 0.35, g: 0.40, b: 0.90, intensity: 0.28 },
};

const getSunColor = (angle) => {
  const sunHeight = Math.sin(angle);
  if (sunHeight > 0.6) return sunColors.noon;
  if (sunHeight > 0.2) {
    const factor = (sunHeight - 0.2) / 0.4;
    if (angle < Math.PI) {
      return {
        r: sunColors.sunrise.r + (sunColors.noon.r - sunColors.sunrise.r) * factor,
        g: sunColors.sunrise.g + (sunColors.noon.g - sunColors.sunrise.g) * factor,
        b: sunColors.sunrise.b + (sunColors.noon.b - sunColors.sunrise.b) * factor,
        intensity: sunColors.sunrise.intensity + (sunColors.noon.intensity - sunColors.sunrise.intensity) * factor,
      };
    } else {
      return {
        r: sunColors.noon.r + (sunColors.sunset.r - sunColors.noon.r) * factor,
        g: sunColors.noon.g + (sunColors.sunset.g - sunColors.noon.g) * factor,
        b: sunColors.noon.b + (sunColors.sunset.b - sunColors.noon.b) * factor,
        intensity: sunColors.noon.intensity + (sunColors.sunset.intensity - sunColors.noon.intensity) * factor,
      };
    }
  }
  return sunColors.night;
};

const getSkyColor = (angle, weather) => {
  const sunHeight = Math.sin(angle);
  if (sunHeight > 0.5) {
    return { r: weather.skyColor[0], g: weather.skyColor[1], b: weather.skyColor[2] };
  } else if (sunHeight > 0.2) {
    const factor = (sunHeight - 0.2) / 0.3;
    const orange = { r: 1.0, g: 0.55, b: 0.35 };
    return {
      r: orange.r + (weather.skyColor[0] - orange.r) * factor,
      g: orange.g + (weather.skyColor[1] - orange.g) * factor,
      b: orange.b + (weather.skyColor[2] - orange.b) * factor,
    };
  } else {
    const nightFactor = (0.2 - sunHeight) / 0.2;
    return {
      r: 0.08 + nightFactor * 0.05,
      g: 0.10 + nightFactor * 0.08,
      b: 0.48 + nightFactor * 0.10,
    };
  }
};

export const WeatherController = ({ children, onWeatherChange }) => {
  const sunLightRef = useRef();
  const ambientRef = useRef();
  const [currentWeather, setCurrentWeather] = useState('clear');
  const [fogIntensity, setFogIntensity] = useState(0);
  const [particleIntensity, setParticleIntensity] = useState(0);
  
  useEffect(() => {
    const weathers = ['clear', 'cloudy', 'windy', 'rainy', 'heavyRain', 'snowy', 'blizzard', 'foggy'];
    let index = 0;
    
    const changeWeather = () => {
      const newWeather = weathers[index % weathers.length];
      index++;
      setCurrentWeather(newWeather);
      if (onWeatherChange) onWeatherChange(newWeather);
      const weather = weatherList[newWeather];
      console.log(`🌤️ CLIMA: ${weather.name} | Fog: ${weather.fogDensity}`);
    };
    
    const interval = setInterval(changeWeather, 15000);
    return () => clearInterval(interval);
  }, [onWeatherChange]);
  
  useFrame(({ scene, clock }) => {
    const weather = weatherList[currentWeather];
    const time = clock.getElapsedTime();
    
    const cycleDuration = 60;
    const cycleTime = (time % cycleDuration) / cycleDuration;
    const angle = cycleTime * Math.PI * 2;
    
    const sunX = Math.cos(angle) * 28;
    const sunZ = Math.sin(angle) * 28;
    const sunY = Math.sin(angle) * 18 + 6;
    
    const sunColor = getSunColor(angle);
    const skyColor = getSkyColor(angle, weather);
    
    if (sunLightRef.current) {
      sunLightRef.current.position.set(sunX, sunY, sunZ);
      sunLightRef.current.color.setRGB(sunColor.r, sunColor.g, sunColor.b);
      
      let weatherIntensity = 1.0;
      if (currentWeather === 'heavyRain') weatherIntensity = 0.65;
      if (currentWeather === 'blizzard') weatherIntensity = 0.60;
      if (currentWeather === 'rainy') weatherIntensity = 0.72;
      if (currentWeather === 'snowy') weatherIntensity = 0.78;
      if (currentWeather === 'foggy') weatherIntensity = 0.58;
      if (currentWeather === 'cloudy') weatherIntensity = 0.82;
      
      sunLightRef.current.intensity = sunColor.intensity * weatherIntensity;
    }
    
    if (ambientRef.current) {
      const sunHeight = Math.max(0, Math.sin(angle));
      ambientRef.current.intensity = 0.52 + sunHeight * 0.28;
    }
    
    if (scene.background) {
      scene.background.setRGB(skyColor.r, skyColor.g, skyColor.b);
    }
    
    // Transições suaves
    const targetFogDensity = weather.fogDensity;
    setFogIntensity(prev => prev + (targetFogDensity - prev) * 0.08);
    
    const targetParticleIntensity = weather.particleIntensity;
    setParticleIntensity(prev => prev + (targetParticleIntensity - prev) * 0.1);
    
    updateWindFromWeather(currentWeather, weather.wind);
  });
  
  const weather = weatherList[currentWeather];
  const showParticles = weather.particles && particleIntensity > 0.05;
  
  return (
    <>
      <directionalLight
        ref={sunLightRef}
        position={[10, 15, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight ref={ambientRef} intensity={0.52} />
      <hemisphereLight intensity={0.42} color={0x88aaff} groundColor={0x553322} />
      
      {/* Fog volumétrico — fixo no mundo */}
      <VolumetricFog
        density={fogIntensity}
        color={weather.fogColor}
        height={weather.fogHeight}
        noiseScale={2.5}
        enabled={true}
      />
      
      {/* Partículas de chuva/neve */}
      {showParticles && (
        <ParticleSystem
          type={weather.particles}
          intensity={particleIntensity}
          windStrength={weather.wind}
          enabled={true}
        />
      )}
      
      {children}
    </>
  );
};