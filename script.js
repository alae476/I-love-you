function startScene() {
  document.getElementById("message").style.display = "none";
  document.getElementById("scene").style.display = "block";
  initScene();
}

function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f8ff); // خلفية سماوية

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("scene").appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // إضاءة
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  // طاولة بيضاء
  const tableGeometry = new THREE.CylinderGeometry(3, 3, 0.2, 32);
  const tableMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.position.y = -1;
  scene.add(table);

  // تحميل الكعكة مع الخامات
  const mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath('models/'); // مجلد الملفات
  mtlLoader.load('cake.mtl', function(materials) {
    materials.preload();

    const objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('models/');
    objLoader.load('cake.obj', function(object) {
      object.scale.set(0.5, 0.5, 0.5); // تصغير الحجم
      object.position.y = -0.5;        // وضعها فوق الطاولة
      scene.add(object);
    });
  });

  // بالونات ملونة
  const balloonColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
  for (let i = 0; i < 4; i++) {
    const balloonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const balloonMaterial = new THREE.MeshPhongMaterial({ color: balloonColors[i] });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.set(Math.cos(i * Math.PI/2) * 2, 1.5, Math.sin(i * Math.PI/2) * 2);
    scene.add(balloon);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}