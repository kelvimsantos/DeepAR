import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import useGameStore from '../hooks/useGameStore';
import { getWindStrength, getWindSpeed } from '../config/windConfig';

const createBladeGeometry = (width, height, joints) => {
  const geometry = new THREE.PlaneGeometry(width, height, 1, joints);
  geometry.translate(0, height / 2, 0);
  const positions = geometry.attributes.position.array;
  const vertex = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  
  for (let i = 0; i < positions.length; i += 3) {
    vertex.set(positions[i], positions[i + 1], positions[i + 2]);
    const t = vertex.y / height;
    
    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.45 * t);
    vertex.applyQuaternion(quat);
    
    const widthScale = 1 - (t * 0.65);
    positions[i] = vertex.x * widthScale;
    positions[i + 1] = vertex.y;
    positions[i + 2] = vertex.z * widthScale;
  }
  geometry.computeVertexNormals();
  return geometry;
};

export const GameGrass = ({ 
  instances, 
  heightmap, 
  terrainSize, 
  terrainResolution, 
  grassWidth = 0.05,
  grassHeight = 0.55
}) => {
  const meshRef = useRef();
  const rigidBodyRef = useRef();
  const timeRef = useRef(0);
  const playerPosition = useGameStore((state) => state.playerPosition);
  
  const currentWindStrength = useRef(getWindStrength());
  const currentWindSpeed = useRef(getWindSpeed());

  const bladeGeo = useMemo(
    () => createBladeGeometry(grassWidth, grassHeight, 4),
    [grassWidth, grassHeight]
  );

  const finalInstances = useMemo(() => {
    if (!instances || !heightmap) return null;

    const step = terrainSize / terrainResolution;
    const width = terrainResolution;
    const count = instances.offsets.length / 3;
    const finalOffsets = [];
    
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = instances.offsets[ix];
      const z = instances.offsets[ix + 2];
      
      const xi = Math.floor((x + terrainSize / 2) / step);
      const zi = Math.floor((z + terrainSize / 2) / step);
      const idx = zi * (width + 1) + xi;
      const y = heightmap[idx] ?? 0;
      
      finalOffsets.push(x, y, z);
    }

    return {
      offsets: new Float32Array(finalOffsets),
      rotations: new Float32Array(instances.rotations),
      scales: new Float32Array(instances.scales),
    };
  }, [instances, heightmap, terrainSize, terrainResolution]);

  const instancedGeo = useMemo(() => {
    if (!finalInstances) return null;

    const geo = new THREE.InstancedBufferGeometry();
    geo.index = bladeGeo.index;
    geo.attributes.position = bladeGeo.attributes.position;
    geo.attributes.uv = bladeGeo.attributes.uv;
    geo.attributes.normal = bladeGeo.attributes.normal;

    geo.setAttribute('offset', new THREE.InstancedBufferAttribute(finalInstances.offsets, 3));
    geo.setAttribute('rotation', new THREE.InstancedBufferAttribute(finalInstances.rotations, 1));
    geo.setAttribute('scale', new THREE.InstancedBufferAttribute(finalInstances.scales, 1));

    return geo;
  }, [bladeGeo, finalInstances]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        bladeHeight: { value: grassHeight },
        playerPosition: { value: new THREE.Vector3(0, 0, 0) },
        interactionRadius: { value: 0.8 },
        interactionStrength: { value: 0.7 },
        windSpeed: { value: currentWindSpeed.current },
        windStrength: { value: currentWindStrength.current },
      },
      vertexShader: `
        attribute float rotation;
        attribute float scale;
        attribute vec3 offset;
        varying vec2 vUv;
        varying float vHeight;
        uniform float time;
        uniform float bladeHeight;
        uniform vec3 playerPosition;
        uniform float interactionRadius;
        uniform float interactionStrength;
        uniform float windSpeed;
        uniform float windStrength;

        void main() {
          vUv = uv;
          vHeight = position.y / bladeHeight;
          
          vec3 pos = position;
          pos.y *= scale;

          float c = cos(rotation);
          float s = sin(rotation);
          vec3 rotatedPos;
          rotatedPos.x = pos.x * c - pos.z * s;
          rotatedPos.y = pos.y;
          rotatedPos.z = pos.x * s + pos.z * c;

          float wind = sin(offset.x * 0.5 + time * windSpeed * 1.5) * cos(offset.z * 0.3 + time * windSpeed * 1.2);
          wind += sin(offset.x * 1.2 - time * windSpeed * 2.0) * 0.5;
          wind += cos(offset.z * 0.8 + time * windSpeed * 1.8) * 0.3;
          wind = wind * windStrength * vHeight;
          
          // REDUZIDO: 0.6 -> 0.35 e 0.4 -> 0.25 (menos esticamento)
          rotatedPos.x += wind * 0.35;
          rotatedPos.z += wind * 0.25;

          vec3 worldPos = rotatedPos + offset;
          float dx = worldPos.x - playerPosition.x;
          float dz = worldPos.z - playerPosition.z;
          float dist = sqrt(dx*dx + dz*dz);
          
          float bend = 0.0;
          if (dist < interactionRadius) {
            bend = (1.0 - dist / interactionRadius) * interactionStrength;
            bend = pow(bend, 1.5) * vHeight;
          }
          
          if (bend > 0.0 && dist > 0.01) {
            vec3 dirToPlayer = normalize(vec3(dx, 0.0, dz));
            rotatedPos.x += dirToPlayer.x * bend * 0.5;
            rotatedPos.z += dirToPlayer.z * bend * 0.5;
            rotatedPos.y -= bend * 0.3;
          }

          vec3 finalPos = rotatedPos + offset;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vHeight;
        uniform float time;

        void main() {
          vec3 greenBase = vec3(0.12, 0.45, 0.10);
          vec3 yellowTip = vec3(0.82, 0.72, 0.22);
          
          vec3 color = mix(greenBase, yellowTip, vHeight);
          float variation = sin(vUv.x * 12.0 + time * 5.0) * 0.08;
          color += variation;
          color += pow(vHeight, 1.2) * 0.15;
          
          float alpha = 0.92 - vHeight * 0.12;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });
  }, [grassHeight]);

  useFrame(() => {
    if (!meshRef.current || !material) return;
    
    const newWindStrength = getWindStrength();
    const newWindSpeed = getWindSpeed();
    
    if (currentWindStrength.current !== newWindStrength) {
      currentWindStrength.current = newWindStrength;
      material.uniforms.windStrength.value = newWindStrength;
    }
    if (currentWindSpeed.current !== newWindSpeed) {
      currentWindSpeed.current = newWindSpeed;
      material.uniforms.windSpeed.value = newWindSpeed;
    }
    
    timeRef.current += 0.016;
    material.uniforms.time.value = timeRef.current;
    
    if (playerPosition) {
      material.uniforms.playerPosition.value.set(
        playerPosition.x,
        playerPosition.y,
        playerPosition.z
      );
    }
  });

  useEffect(() => {
    if (!meshRef.current || !instancedGeo) return;
    
    meshRef.current.geometry = instancedGeo;
    meshRef.current.count = finalInstances.offsets.length / 3;
    meshRef.current.receiveShadow = true;
    meshRef.current.castShadow = false;
    
    if (meshRef.current.material) {
      meshRef.current.material.shadowSide = THREE.FrontSide;
    }
  }, [instancedGeo, finalInstances]);

  if (!instancedGeo || !finalInstances) return null;

  const offsets = finalInstances.offsets;
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < offsets.length; i += 3) {
    minX = Math.min(minX, offsets[i]);
    maxX = Math.max(maxX, offsets[i]);
    minZ = Math.min(minZ, offsets[i + 2]);
    maxZ = Math.max(maxZ, offsets[i + 2]);
  }
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const centerY = offsets[1] || 0;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[centerX, centerY, centerZ]}
      type="fixed"
      colliders={false}
    >
      <group position={[-centerX, -centerY, -centerZ]}>
        <instancedMesh
          ref={meshRef}
          args={[null, material, finalInstances.offsets.length / 3]}
          frustumCulled={false}
          castShadow={false}
          receiveShadow={true}
        />
      </group>
    </RigidBody>
  );
};