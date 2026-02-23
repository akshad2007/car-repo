(() => {
  gsap.registerPlugin(ScrollTrigger);

  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#07080b', 10, 36);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 2.7, 10.5);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.35;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.minAzimuthAngle = -0.5;
  controls.maxAzimuthAngle = 0.5;
  controls.target.set(0, 0.8, 0);

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bokeh = new THREE.BokehPass(scene, camera, {
    focus: 2.1,
    aperture: 0.0003,
    maxblur: 0.006,
    width: window.innerWidth,
    height: window.innerHeight,
  });
  composer.addPass(bokeh);

  const ambient = new THREE.HemisphereLight('#d2d8ff', '#111218', 0.7);
  scene.add(ambient);

  const key = new THREE.DirectionalLight('#ffffff', 1.25);
  key.position.set(5, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  scene.add(key);

  const rim = new THREE.DirectionalLight('#6aa2ff', 0.7);
  rim.position.set(-8, 4, -6);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(16, 64),
    new THREE.MeshStandardMaterial({
      color: '#121419',
      metalness: 0.2,
      roughness: 0.88,
    })
  );
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.45;
  scene.add(floor);

  const car = new THREE.Group();
  scene.add(car);

  const paint = new THREE.MeshPhysicalMaterial({
    color: '#c2081d',
    metalness: 0.85,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.07,
    reflectivity: 1,
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: '#1d1f24',
    metalness: 0.85,
    roughness: 0.26,
  });

  const detailMaterial = new THREE.MeshStandardMaterial({
    color: '#858b94',
    metalness: 0.9,
    roughness: 0.22,
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: '#111214',
    metalness: 0.25,
    roughness: 0.8,
  });

  function mesh(geometry, material, cast = true) {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = cast;
    m.receiveShadow = true;
    return m;
  }

  const bodyShell = mesh(new THREE.BoxGeometry(6.3, 1.1, 2.7), paint);
  bodyShell.position.y = 0.4;
  car.add(bodyShell);

  const roof = mesh(new THREE.BoxGeometry(2.6, 0.72, 2.2), paint);
  roof.position.set(0, 1.22, 0);
  car.add(roof);

  const hood = mesh(new THREE.BoxGeometry(1.5, 0.23, 2.45), paint);
  hood.position.set(2.38, 0.76, 0);
  car.add(hood);

  const trunk = mesh(new THREE.BoxGeometry(1.16, 0.3, 2.3), paint);
  trunk.position.set(-2.57, 0.7, 0);
  car.add(trunk);

  const wheelPositions = [
    [2.16, -0.52, 1.27],
    [2.16, -0.52, -1.27],
    [-2.16, -0.52, 1.27],
    [-2.16, -0.52, -1.27],
  ];

  const wheels = wheelPositions.map(([x, y, z]) => {
    const wheelGroup = new THREE.Group();
    const tire = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.36, 36), rubber);
    tire.rotation.z = Math.PI / 2;
    const rimPart = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.38, 20), detailMaterial);
    rimPart.rotation.z = Math.PI / 2;
    wheelGroup.add(tire, rimPart);
    wheelGroup.position.set(x, y, z);
    car.add(wheelGroup);
    return wheelGroup;
  });

  const doorGeometries = [
    { side: 1, x: 0.7 },
    { side: -1, x: 0.7 },
    { side: 1, x: -0.7 },
    { side: -1, x: -0.7 },
  ];

  const doors = doorGeometries.map(({ side, x }) => {
    const door = mesh(new THREE.BoxGeometry(1.4, 0.8, 0.14), paint);
    door.position.set(x, 0.4, side * 1.36);
    car.add(door);
    return door;
  });

  const seats = [
    [0.8, 0.03, 0.44],
    [0.8, 0.03, -0.44],
    [-0.6, 0.03, 0.44],
    [-0.6, 0.03, -0.44],
  ].map(([x, y, z]) => {
    const seat = mesh(new THREE.BoxGeometry(0.54, 0.64, 0.52), darkMetal);
    seat.position.set(x, y, z);
    car.add(seat);
    return seat;
  });

  const dashboard = mesh(new THREE.BoxGeometry(0.4, 0.4, 1.9), darkMetal);
  dashboard.position.set(1.63, 0.55, 0);
  car.add(dashboard);

  const steeringWheel = mesh(new THREE.TorusGeometry(0.2, 0.045, 14, 32), detailMaterial);
  steeringWheel.rotation.y = Math.PI / 2;
  steeringWheel.position.set(1.37, 0.6, -0.58);
  car.add(steeringWheel);

  const chassis = mesh(new THREE.BoxGeometry(6.1, 0.26, 2.4), detailMaterial);
  chassis.position.y = -0.34;
  car.add(chassis);

  const engineBase = mesh(new THREE.BoxGeometry(1.05, 0.56, 1.3), darkMetal);
  engineBase.position.set(1.54, 0.4, 0);
  car.add(engineBase);

  const enginePieces = [];
  for (let i = 0; i < 8; i += 1) {
    const cyl = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.44, 16), detailMaterial);
    cyl.rotation.z = Math.PI / 2;
    cyl.position.set(1.35 + (i % 4) * 0.2, 0.72 + Math.floor(i / 4) * 0.17, i < 4 ? -0.33 : 0.33);
    enginePieces.push(cyl);
    car.add(cyl);
  }

  car.rotation.y = -0.26;

  const timeline = gsap.timeline({
    defaults: { duration: 1, ease: 'power1.inOut' },
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=220%',
      scrub: 0.8,
      pin: true,
      anticipatePin: 1,
    },
  });

  timeline.to(wheels[0].position, { x: 3.9, y: -0.28, z: 2.45 }, 0)
    .to(wheels[1].position, { x: 3.9, y: -0.28, z: -2.45 }, 0)
    .to(wheels[2].position, { x: -3.9, y: -0.28, z: 2.45 }, 0)
    .to(wheels[3].position, { x: -3.9, y: -0.28, z: -2.45 }, 0)
    .to(wheels[0].rotation, { y: 0.8, z: 0.6 }, 0)
    .to(wheels[1].rotation, { y: -0.8, z: -0.6 }, 0)
    .to(wheels[2].rotation, { y: 0.7, z: -0.6 }, 0)
    .to(wheels[3].rotation, { y: -0.7, z: 0.6 }, 0)

    .to(doors[0].position, { x: 1.1, z: 2.5, y: 0.78 }, 0.15)
    .to(doors[1].position, { x: 1.1, z: -2.5, y: 0.78 }, 0.15)
    .to(doors[2].position, { x: -1.05, z: 2.35, y: 0.7 }, 0.2)
    .to(doors[3].position, { x: -1.05, z: -2.35, y: 0.7 }, 0.2)
    .to(doors.map((d) => d.rotation), { y: (_, target) => (target === doors[0].rotation || target === doors[2].rotation ? 0.5 : -0.5) }, 0.2)

    .to(hood.position, { x: 3.25, y: 1.7, z: 0 }, 0.34)
    .to(hood.rotation, { z: 0.48, y: 0.2 }, 0.34)

    .to(engineBase.position, { x: 2.58, y: 1.1, z: 0 }, 0.44)
    .to(engineBase.rotation, { y: -0.34, z: 0.16 }, 0.44)
    .to(enginePieces[0].position, { x: 2.2, y: 1.6, z: -1 }, 0.5)
    .to(enginePieces[1].position, { x: 2.55, y: 1.82, z: -0.58 }, 0.5)
    .to(enginePieces[2].position, { x: 2.88, y: 1.5, z: -0.2 }, 0.5)
    .to(enginePieces[3].position, { x: 3.2, y: 1.8, z: 0.25 }, 0.5)
    .to(enginePieces[4].position, { x: 2.2, y: 2.1, z: 0.9 }, 0.56)
    .to(enginePieces[5].position, { x: 2.55, y: 2.3, z: 0.5 }, 0.56)
    .to(enginePieces[6].position, { x: 2.9, y: 2.05, z: 0.15 }, 0.56)
    .to(enginePieces[7].position, { x: 3.22, y: 2.26, z: -0.25 }, 0.56)
    .to(enginePieces.map((p) => p.rotation), { x: 0.35, y: 0.35, z: 0.55, stagger: 0.02 }, 0.56)

    .to(seats[0].position, { x: 1.35, y: 1.38, z: 1.35 }, 0.66)
    .to(seats[1].position, { x: 1.35, y: 1.38, z: -1.35 }, 0.66)
    .to(seats[2].position, { x: -1.5, y: 1.14, z: 1.15 }, 0.7)
    .to(seats[3].position, { x: -1.5, y: 1.14, z: -1.15 }, 0.7)
    .to(seats.map((s) => s.rotation), { y: 0.42, x: -0.2, stagger: 0.03 }, 0.7)

    .to(steeringWheel.position, { x: 1.95, y: 1.35, z: -1.55 }, 0.78)
    .to(steeringWheel.rotation, { x: 0.8, y: 1.2 }, 0.78)
    .to(dashboard.position, { x: 2.02, y: 1.6, z: 0 }, 0.8)
    .to(dashboard.rotation, { z: -0.2, y: 0.34 }, 0.8)

    .to(chassis.position, { y: -1.1, z: 0, x: 0 }, 0.88)
    .to(chassis.rotation, { x: 0.13, y: 0.12 }, 0.88)

    .to([bodyShell.position, roof.position, trunk.position], { y: (_, target) => target.y + 0.4 }, 0.95)
    .to([bodyShell.rotation, roof.rotation, trunk.rotation], { y: 0.08, z: -0.04 }, 0.95)

    .to(camera.position, { z: 13.4, y: 3.2 }, 0.4)
    .to(controls.target, { y: 0.9 }, 0.4);

  function tick() {
    controls.update();
    composer.render();
    requestAnimationFrame(tick);
  }
  tick();

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onResize);
})();
