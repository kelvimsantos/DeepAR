import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Player } from './Player';
import { LoadedScene } from './LoadedScene';
import { MovementController } from './MovementController';
import { RepositionButton } from './RepositionButton';
import useGameStore from '../hooks/useGameStore';
import { World } from './World';
import { GameGrass } from './GameGrass';
import { Html } from '@react-three/drei';
import { WeatherController } from './WeatherController';
import { VolumetricClouds } from './VolumetricClouds';

const weatherNames = {
  clear: '☀️ Claro',
  cloudy: '☁️ Nublado',
  foggy: '🌫️ Neblina',
  windy: '💨 Ventania',
  rainy: '🌧️ Chuva',
  snowy: '❄️ Neve',
};

// =============================================================================
// CONFIGURAÇÃO DAS NUVENS PARA CADA CLIMA
// =============================================================================
const cloudConfig = {
  clear:   { enabled: false, density: 0,    tiling: 4.6, speed: 2.08, scale: 10, position: [0, 4.5, 3.2] },
  cloudy:  { enabled: true,  density: 2.2,  tiling: 4.6, speed: 2.08, scale: 10, position: [0, 4.5, 3.2] },
  foggy:   { enabled: false, density: 0,    tiling: 4.6, speed: 2.08, scale: 10, position: [0, 4.5, 3.2] },
  windy:   { enabled: true,  density: 2.0,  tiling: 4.6, speed: 3.5,  scale: 10, position: [0, 4.5, 3.2] }, // vento mais rápido
  rainy:   { enabled: true,  density: 2.5,  tiling: 4.6, speed: 2.5,  scale: 10, position: [0, 4.5, 3.2] },
  snowy:   { enabled: true,  density: 2.3,  tiling: 4.6, speed: 1.8,  scale: 10, position: [0, 4.5, 3.2] },
};

const ARScene = () => {
  const worldGroupRef = useRef(null);
  const { setWorldGroupRef, playerRigidBody } = useGameStore();
  const [sceneData, setSceneData] = useState(null);
  const [grassData, setGrassData] = useState(null);
  const [currentWeather, setCurrentWeather] = useState('clear');

  useEffect(() => {
    setWorldGroupRef(worldGroupRef.current);
  }, [setWorldGroupRef]);

  useEffect(() => {
    fetch('/scene.json')
      .then(res => res.json())
      .then(data => {
        setSceneData(data);
        setGrassData(data.grassInstances);
      })
      .catch(err => console.error('Erro ao carregar cena:', err));
  }, []);

  const teleportUp = () => {
    if (!playerRigidBody) return;
    const pos = playerRigidBody.translation();
    playerRigidBody.setTranslation({ x: pos.x, y: pos.y + 10, z: pos.z }, true);
  };

  const heightmap = sceneData?.terrainParams?.heightmap;
  const terrainSize = sceneData?.terrainParams?.size || 20;
  const terrainResolution = sceneData?.terrainParams?.resolution || 64;

  const cloud = cloudConfig[currentWeather] || cloudConfig.clear;

  return (
    <WeatherController onWeatherChange={setCurrentWeather}>
      {/* NUVENS VOLUMÉTRICAS - CONTROLADAS PELO CLIMA */}
      {cloud.enabled && (
        <VolumetricClouds
          density={cloud.density}
          tiling={cloud.tiling}
          speed={cloud.speed}
          scale={cloud.scale}
          position={[0, 5.5, 3.2]}
          enabled={true}
        />
      )}

      <group ref={worldGroupRef} position={[0, -1, -9]} userData={{ isWorldGroup: true }}>
        <World />
        {sceneData && <LoadedScene sceneData={sceneData} />}
        {grassData && heightmap && (
          <GameGrass
            instances={grassData}
            heightmap={heightmap}
            terrainSize={terrainSize}
            terrainResolution={terrainResolution}
          />
        )}
        <Player />
        <MovementController />
      </group>
      
      <RepositionButton />
      
      <Html transform={false}>
        <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 10002 }}>
          <button onClick={teleportUp}>⬆️ Teleportar</button>
        </div>
        <div style={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 10002, 
          background: 'rgba(0,0,0,0.7)', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          color: 'white', 
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          {weatherNames[currentWeather] || '☀️ Claro'}
          {cloud.enabled && <span style={{ color: '#88ff88', marginLeft: '8px' }}>☁️ NUVENS</span>}
        </div>
      </Html>
    </WeatherController>
  );
};

export default ARScene;