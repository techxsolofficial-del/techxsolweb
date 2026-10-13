import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    container.innerHTML = '';

    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Parent Group for smooth interactive tilt
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Core Circle (Smooth Radiant Sphere)
    const centerCircleGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const centerCircleMat = new THREE.MeshBasicMaterial({
      color: 0x00A8E8,
      transparent: true,
      opacity: 0.85
    });
    const centerCircle = new THREE.Mesh(centerCircleGeo, centerCircleMat);
    mainGroup.add(centerCircle);

    // Inner subtle glow core
    const innerGlowGeo = new THREE.SphereGeometry(2.35, 24, 24);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00C8FF,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    mainGroup.add(innerGlow);

    // 2. Exactly 1 Single Orbital Ring Revolving Around the Central Circle
    const ringGeo = new THREE.TorusGeometry(5.2, 0.048, 24, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00C8FF,
      transparent: true,
      opacity: 0.95
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 2.5; // Elegant orbital tilt angle
    orbitalRing.rotation.y = Math.PI / 6;
    mainGroup.add(orbitalRing);

    // Glowing Satellite Node orbiting along the ring
    const nodeGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
    const satNode = new THREE.Mesh(nodeGeo, nodeMat);
    satNode.position.set(5.2, 0, 0);
    orbitalRing.add(satNode);

    // Mouse Parallax tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.45;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Exactly 1 Ring revolving around central circle
      orbitalRing.rotation.z += 0.012;

      // Gentle rotation on central circle
      centerCircle.rotation.y += 0.004;
      innerGlow.rotation.y -= 0.006;
      innerGlow.rotation.x += 0.003;

      // Breathing pulse on central circle
      const pulse = 1 + Math.sin(time * 2) * 0.03;
      centerCircle.scale.set(pulse, pulse, pulse);

      // Smooth inertia towards mouse
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      mainGroup.rotation.x = currentRotX;
      mainGroup.rotation.y = currentRotY;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} id="three-canvas" style={{ width: '100%', height: '100%', minHeight: '380px' }} />;
}
