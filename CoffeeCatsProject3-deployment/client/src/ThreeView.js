import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import modelFile from './scene.gltf';

const ThreeView = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (mountRef.current.childNodes.length === 0) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Add grid and axes helpers
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Add basic lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Set camera position
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelFile,
      (gltf) => {
        console.log('Model loaded successfully');
        
        // Get the model's size and center
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('Model size:', size);
        console.log('Model center:', center);
        
        // Scale model if it's too big or too small
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;  // Aim for 2 units size
        gltf.scene.scale.multiplyScalar(scale);
        
        // Center model
        gltf.scene.position.x = -center.x * scale;
        gltf.scene.position.y = -center.y * scale;
        gltf.scene.position.z = -center.z * scale;
        
        // Make sure materials are visible
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // Log material info
            console.log('Mesh found:', child.name);
            console.log('Material:', child.material);
            
            // Make sure material is visible
            child.material.side = THREE.DoubleSide;
            
            // If the model is black, it might need these
            child.material.metalness = 0.5;
            child.material.roughness = 0.5;
          }
        });

        scene.add(gltf.scene);
        
        // After adding, check if it's in frustum
        const frustum = new THREE.Frustum();
        frustum.setFromProjectionMatrix(
          new THREE.Matrix4().multiplyMatrices(
            camera.projectionMatrix,
            camera.matrixWorldInverse
          )
        );
        
        if (frustum.containsPoint(new THREE.Vector3(0, 0, 0))) {
          console.log('Model should be visible in camera');
        } else {
          console.log('Model might be outside camera view');
        }
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading: ${percent.toFixed(2)}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
    
    // Animation loop
    function animate() {
      controls.update();
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
    
    // Handle resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeView;