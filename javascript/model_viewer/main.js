import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the model
const loader = new GLTFLoader();
loader.load('./ModelsGltfFormat/Truck.glb', function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.x = Math.PI/2;
    const sc = 0.01;
    model.scale.set(sc, sc, sc);
    scene.add(model);
    }
    , function(xhr){
        console.log((xhr.loaded/xhr.total * 100) + "% loaded")
    }, function(error){
        console.log('An error occurred')
    }
);

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0,0,30)
scene.add(light)

// Set up camera position
camera.position.set(0, 0, 15);
camera.lookAt(0,0,0);
scene.add(camera);

  // Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Apply rotation
    //model.rotation.z += 0.01;

    renderer.render(scene, camera);
}

animate();



