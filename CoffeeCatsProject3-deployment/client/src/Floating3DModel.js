import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';

const Loader = () => (
  <Html center>
    <div className="text-green-500">Loading...</div>
  </Html>
);

const Model = () => {
  const { scene } = useGLTF('/path-to-your-model.gltf');
  return <primitive object={scene} />;
};

const Floating3DModel = () => (
  <Canvas>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <mesh>
      <sphereBufferGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  </Canvas>
);


export default Floating3DModel;
