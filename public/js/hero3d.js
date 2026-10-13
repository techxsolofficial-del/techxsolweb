/**
 * Tech X Sol - Unique Minimalist 3D Hero Kinetic Engine
 * Replaces the complex/cluttered wireframe with a sleek, clean, modern
 * Orbital Quantum Nexus with interactive mouse parallax and glowing particle field.
 */

function initHero3D() {
  const container = document.getElementById('three-canvas');
  if (!container || typeof THREE === 'undefined') return;

  // Clear any existing children
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

  // Inner subtle glow core for futuristic depth
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


  // Mouse Parallax tracking with smooth damping
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    targetRotY = mouseX * 0.45;
    targetRotX = -mouseY * 0.45;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // 1 Ring revolving around the central circle
    orbitalRing.rotation.z += 0.012;

    // Gentle shimmer rotation on the central circle
    centerCircle.rotation.y += 0.004;
    innerGlow.rotation.y -= 0.006;
    innerGlow.rotation.x += 0.003;

    // Smooth subtle breathing scale on central circle
    const pulse = 1 + Math.sin(time * 2) * 0.03;
    centerCircle.scale.set(pulse, pulse, pulse);

    // Smooth inertia interpolation towards mouse target
    currentRotX += (targetRotX - currentRotX) * 0.05;
    currentRotY += (targetRotY - currentRotY) * 0.05;

    mainGroup.rotation.x = currentRotX;
    mainGroup.rotation.y = currentRotY;

    renderer.render(scene, camera);
  }

  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w && h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  });
}

// Auto init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero3D);
} else {
  initHero3D();
}
