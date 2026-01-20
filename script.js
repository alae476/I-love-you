// Main variables
let scene, camera, renderer, controls;
let cakeModel = null;
let balloons = [];
let lights = [];
let rotateBalloons = true;
let clock = new THREE.Clock();

// Initialize the 3D scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Create camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth * 0.7 / 600, 0.1, 1000);
    camera.position.set(8, 5, 8);
    
    // Create renderer
    const sceneContainer = document.getElementById('scene');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sceneContainer.offsetWidth, sceneContainer.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sceneContainer.appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
    
    // Add lighting
    setupLighting();
    
    // Add ground
    createGround();
    
    // Add table
    createTable();
    
    // Add balloons
    createBalloons(12);
    
    // Load cake model
    loadCakeModel();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    
    // Update model status
    updateModelStatus("Loading cake model from models/cake.obj...");
    
    // Start animation loop
    animate();
}

// Set up lighting for the scene
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    lights.push(ambientLight);
    
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(10, 20, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);
    lights.push(sunLight);
    
    // Add some point lights for decoration
    const pointLight1 = new THREE.PointLight(0xffaa00, 0.5, 20);
    pointLight1.position.set(5, 3, 5);
    scene.add(pointLight1);
    lights.push(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00aaff, 0.5, 20);
    pointLight2.position.set(-5, 3, -5);
    scene.add(pointLight2);
    lights.push(pointLight2);
}

// Create grassy ground
function createGround() {
    // Ground texture (green grass)
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x3a7c3a,
        side: THREE.DoubleSide
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add some grassy patches
    for (let i = 0; i < 50; i++) {
        const grassGeometry = new THREE.ConeGeometry(0.05, 0.3, 4);
        const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x2a8c2a });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        
        grass.position.x = (Math.random() - 0.5) * 35;
        grass.position.z = (Math.random() - 0.5) * 35;
        grass.position.y = -0.35;
        grass.rotation.x = Math.random() * 0.1;
        grass.rotation.z = Math.random() * 0.1;
        
        scene.add(grass);
    }
}

// Create a white table in the middle
function createTable() {
    // Table top
    const tableTopGeometry = new THREE.CylinderGeometry(2, 2.2, 0.3, 8);
    const tableTopMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf5f5f5,
        shininess: 30
    });
    const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
    tableTop.position.y = 1.5;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    scene.add(tableTop);
    
    // Table legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf0f0f0,
        shininess: 30
    });
    
    const legPositions = [
        { x: 1.5, z: 1.5 },
        { x: -1.5, z: 1.5 },
        { x: 1.5, z: -1.5 },
        { x: -1.5, z: -1.5 }
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, 0.75, pos.z);
        leg.castShadow = true;
        scene.add(leg);
    });
    
    // Add a tablecloth effect
    const tableclothGeometry = new THREE.CylinderGeometry(2.1, 2.3, 0.05, 8);
    const tableclothMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffebee,
        shininess: 10
    });
    const tablecloth = new THREE.Mesh(tableclothGeometry, tableclothMaterial);
    tablecloth.position.y = 1.65;
    scene.add(tablecloth);
}

// Create colorful balloons
function createBalloons(count) {
    const balloonColors = [
        0xff0000, 0x00ff00, 0x0000ff, 0xffff00,
        0xff00ff, 0x00ffff, 0xff8800, 0x8800ff
    ];
    
    for (let i = 0; i < count; i++) {
        // Create balloon (sphere + cone)
        const balloonGroup = new THREE.Group();
        
        // Balloon sphere
        const balloonSize = 0.4 + Math.random() * 0.2;
        const balloonGeometry = new THREE.SphereGeometry(balloonSize, 16, 16);
        const balloonMaterial = new THREE.MeshPhongMaterial({ 
            color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
            shininess: 100
        });
        const balloonSphere = new THREE.Mesh(balloonGeometry, balloonMaterial);
        balloonSphere.castShadow = true;
        balloonGroup.add(balloonSphere);
        
        // Balloon tip (cone)
        const tipGeometry = new THREE.ConeGeometry(0.05, 0.3, 8);
        const tipMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.y = -balloonSize - 0.15;
        tip.rotation.x = Math.PI;
        balloonGroup.add(tip);
        
        // String (line)
        const stringLength = 3 + Math.random() * 2;
        const stringGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -balloonSize - 0.3, 0),
            new THREE.Vector3(0, -balloonSize - stringLength, 0)
        ]);
        const stringMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const string = new THREE.Line(stringGeometry, stringMaterial);
        balloonGroup.add(string);
        
        // Position balloon around the table
        const angle = (i / count) * Math.PI * 2;
        const radius = 3 + Math.random() * 2;
        const height = 3 + Math.random() * 3;
        
        balloonGroup.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        // Add slight random rotation
        balloonGroup.rotation.x = Math.random() * 0.1;
        balloonGroup.rotation.z = Math.random() * 0.1;
        
        // Store balloon data for animation
        balloons.push({
            group: balloonGroup,
            originalY: height,
            angle: angle,
            radius: radius,
            floatSpeed: 0.5 + Math.random() * 0.5,
            rotationSpeed: 0.5 + Math.random()
        });
        
        scene.add(balloonGroup);
    }
}

// Load the cake OBJ model
function loadCakeModel() {
    // If OBJ and MTL loaders are not available, create a placeholder cake
    if (!THREE.OBJLoader || !THREE.MTLLoader) {
        createPlaceholderCake();
        updateModelStatus("Using placeholder cake (OBJLoader not available)");
        return;
    }
    
    // Try to load the cake model
    const mtlLoader = new THREE.MTLLoader();
    const objLoader = new THREE.OBJLoader();
    
    // Set the path for materials
    mtlLoader.setPath('models/');
    
    mtlLoader.load('cake.mtl', (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        
        objLoader.setPath('models/');
        objLoader.load('cake.obj', (object) => {
            // Successfully loaded cake model
            cakeModel = object;
            
            // Scale and position the cake
            cakeModel.scale.set(0.8, 0.8, 0.8);
            cakeModel.position.set(0, 2.1, 0);
            cakeModel.rotation.y = Math.PI / 4;
            
            // Enable shadows
            cakeModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(cakeModel);
            updateModelStatus("Cake model loaded successfully!");
        }, 
        // onProgress callback
        (xhr) => {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            updateModelStatus(`Loading cake model: ${percent}%`);
        },
        // onError callback
        (error) => {
            console.error('Error loading cake model:', error);
            createPlaceholderCake();
            updateModelStatus("Error loading cake.obj, using placeholder cake");
        });
    }, 
    // onProgress callback for MTL
    undefined,
    // onError callback for MTL
    (error) => {
        console.error('Error loading cake materials:', error);
        // Try loading OBJ without materials
        objLoader.setPath('models/');
        objLoader.load('cake.obj', (object) => {
            cakeModel = object;
            cakeModel.scale.set(0.8, 0.8, 0.8);
            cakeModel.position.set(0, 2.1, 0);
            cakeModel.rotation.y = Math.PI / 4;
            
            // Apply a default material
            cakeModel.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({ 
                        color: 0xf0c0a0,
                        shininess: 30
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(cakeModel);
            updateModelStatus("Cake model loaded (without materials)");
        },
        undefined,
        (error) => {
            console.error('Error loading OBJ:', error);
            createPlaceholderCake();
            updateModelStatus("Error loading cake.obj, using placeholder cake");
        });
    });
}

// Create a placeholder cake if the model fails to load
function createPlaceholderCake() {
    const cakeGroup = new THREE.Group();
    
    // Cake base
    const baseGeometry = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf0c0a0,
        shininess: 30
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.4;
    base.castShadow = true;
    base.receiveShadow = true;
    cakeGroup.add(base);
    
    // Cake top layer
    const topGeometry = new THREE.CylinderGeometry(1.0, 1.1, 0.5, 16);
    const topMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffd0d0,
        shininess: 50
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.85;
    top.castShadow = true;
    cakeGroup.add(top);
    
    // Icing on top
    const icingGeometry = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 16);
    const icingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffe0e0,
        shininess: 100
    });
    const icing = new THREE.Mesh(icingGeometry, icingMaterial);
    icing.position.y = 1.1;
    cakeGroup.add(icing);
    
    // Candles
    const candleColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    for (let i = 0; i < 4; i++) {
        const candleGroup = new THREE.Group();
        
        // Candle stick
        const candleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        const candleMaterial = new THREE.MeshPhongMaterial({ 
            color: candleColors[i]
        });
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.position.y = 0.2;
        candleGroup.add(candle);
        
        // Candle flame
        const flameGeometry = new THREE.ConeGeometry(0.06, 0.15, 8);
        const flameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffaa00,
            emissive: 0xff5500,
            emissiveIntensity: 0.5
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 0.425;
        candleGroup.add(flame);
        
        // Position candles on cake
        const angle = (i / 4) * Math.PI * 2;
        candleGroup.position.set(
            Math.cos(angle) * 0.7,
            1.25,
            Math.sin(angle) * 0.7
        );
        
        cakeGroup.add(candleGroup);
    }
    
    cakeGroup.position.set(0, 2.1, 0);
    scene.add(cakeGroup);
    cakeModel = cakeGroup;
}

// Update model loading status
function updateModelStatus(message) {
    const statusElement = document.getElementById('model-load-status');
    if (statusElement) {
        if (message.includes("successfully") || message.includes("placeholder")) {
            statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: #4CAF50;"></i> ${message}`;
        } else if (message.includes("Error")) {
            statusElement.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #FF5722;"></i> ${message}`;
        } else {
            statusElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Animate balloons
    if (rotateBalloons) {
        balloons.forEach((balloon, index) => {
            // Float up and down
            balloon.group.position.y = balloon.originalY + Math.sin(Date.now() * 0.001 * balloon.floatSpeed) * 0.3;
            
            // Rotate around the table
            balloon.angle += delta * 0.1 * balloon.rotationSpeed;
            balloon.group.position.x = Math.cos(balloon.angle) * balloon.radius;
            balloon.group.position.z = Math.sin(balloon.angle) * balloon.radius;
            
            // Slight rotation
            balloon.group.rotation.y += delta * 0.5;
        });
    }
    
    // Rotate cake slowly
    if (cakeModel) {
        cakeModel.rotation.y += delta * 0.1;
    }
    
    // Update controls
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const sceneContainer = document.getElementById('scene');
    camera.aspect = sceneContainer.offsetWidth / sceneContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.offsetWidth, sceneContainer.offsetHeight);
}

// Handle keyboard controls
function onKeyDown(event) {
    switch(event.code) {
        case 'Space':
            // Toggle lights
            lights.forEach(light => {
                if (light.intensity !== undefined) {
                    light.intensity = light.intensity > 0 ? 0 : (light === lights[0] ? 0.6 : 0.8);
                }
            });
            break;
        case 'KeyR':
            // Toggle balloon rotation
            rotateBalloons = !rotateBalloons;
            break;
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);