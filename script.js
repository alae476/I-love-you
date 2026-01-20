// إعداد المشهد والكاميرا والمصير (renderer)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// إضافة إضاءة
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040, 2);
scene.add(ambient);

// تحميل الكعكة
const mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath('models/');
mtlLoader.load('cake.mtl', (materials) => {
  materials.preload();

  const objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('models/');
  objLoader.load('cake.obj', (object) => {
    object.scale.set(0.5, 0.5, 0.5);
    scene.add(object);
  });
});

// حلقة الرسم
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// إعادة ضبط الحجم عند تغيير نافذة المتصفح
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
