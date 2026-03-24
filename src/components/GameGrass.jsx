import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const createBladeGeometry = (width, height, joints) => {
  const geometry = new THREE.PlaneGeometry(width, height, 1, joints);
  geometry.translate(0, height / 2, 0);
  const positions = geometry.attributes.position.array;
  const vertex = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  for (let i = 0; i < positions.length; i += 3) {
    vertex.set(positions[i], positions[i + 1], positions[i + 2]);
    const t = vertex.y / height;
    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.3 * t);
    vertex.applyQuaternion(quat);
    positions[i] = vertex.x;
    positions[i + 1] = vertex.y;
    positions[i + 2] = vertex.z;
  }
  geometry.computeVertexNormals();
  return geometry;
};

export const GameGrass = ({ instances, heightmap, terrainSize, terrainResolution, grassWidth = 0.12, grassHeight = 1.0 }) => {
  const meshRef = useRef();
  const timeRef = useRef(0);

  const bladeGeo = useMemo(
    () => createBladeGeometry(grassWidth, grassHeight, 4),
    [grassWidth, grassHeight]
  );

  // Calcula as posições finais da grama com base no heightmap
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
      
      // Encontra a altura do terreno neste ponto
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
      },
      vertexShader: `
        attribute float rotation;
        attribute float scale;
        attribute vec3 offset;
        varying vec2 vUv;
        uniform float time;
        uniform float bladeHeight;

        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.y *= scale;

          float c = cos(rotation);
          float s = sin(rotation);
          vec3 rotatedPos;
          rotatedPos.x = pos.x * c - pos.z * s;
          rotatedPos.y = pos.y;
          rotatedPos.z = pos.x * s + pos.z * c;

          float wind = sin(offset.x * 0.5 + time * 2.0) * cos(offset.z * 0.3 + time * 1.5);
          wind *= 0.2 * (pos.y / bladeHeight);
          rotatedPos.x += wind;
          rotatedPos.z += wind * 0.5;

          vec3 finalPos = rotatedPos + offset;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        void main() {
          float alpha = 1.0 - vUv.y * 0.1;
          gl_FragColor = vec4(0.2, 0.8, 0.2, alpha);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });
  }, [grassHeight]);

  useFrame(() => {
    if (meshRef.current) {
      timeRef.current += 0.01;
      meshRef.current.material.uniforms.time.value = timeRef.current;
    }
  });

  useEffect(() => {
    if (meshRef.current && instancedGeo) {
      meshRef.current.geometry = instancedGeo;
      meshRef.current.count = finalInstances.offsets.length / 3;
    }
  }, [instancedGeo, finalInstances]);

  if (!instancedGeo || !finalInstances) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, material, finalInstances.offsets.length / 3]}
      frustumCulled={false}
      castShadow
      receiveShadow
    />
  );
};