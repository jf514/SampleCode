import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

///////////////////////////////////////////////////////////////////
// Set up the 3D scene.

// Render.
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const pmremGenerator = new THREE.PMREMGenerator( renderer );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

// Basic camera. 
const width = 50;
const height = 50;
const aspect = window.innerWidth / window.innerHeight;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -2, 2);
camera.lookAt(0, 0, 0);

// DEBUG: Add some coordinate axes. R = X, green = Y, blue = Z.
//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

//Load background texture.
//const txloader = new THREE.TextureLoader();
//txloader.load('./Models/space_resized.png' , function(texture) {
//           scene.background = texture;  
//          });

///////////////////////////////////////////////////////////////////
// DEBUG: Grid helper... useful for debugging velocity/scale issues.
//const size = 35;
//const divisions = 30;
//const gridHelper = new THREE.GridHelper( size, divisions );
//gridHelper.position.set(0, 0, 0);
//gridHelper.rotation.x = Math.PI/2;
///////////////////////////////////////////////////////////////////

// Simulation constants.
//const dT = 1/60;
const dT = 1/60
const dTH = .5 * dT;
var t = 0.0;

///////////////////////////////////////////////////////////////////
// DEBUG: Allows for camera controls. Enable for dynamic camera.
// const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set( 0, 0.5, 0 );
// controls.update();
// controls.minPolarAngle = Math.PI/4-0.001; //Math.PI/2;
// controls.maxPolarAngle = Math.PI/4+0.001; // Math.PI - Math.PI/6;
// controls.minAzimuthAngle = 0;
// controls.maxAzimuthAngle = 0;
// controls.enablePan = false;
// controls.enableDamping = true;
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
// Handle resizing window.
window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};

//////////////////////////////////////////////////////////////////
// Click



///////////////////////////////////////////////////////////////////
// Model

	// // Create sphere geometry
	const rSmSph = .1
	const smallSphGeo = new THREE.SphereGeometry(rSmSph, 32, 32);
	const smallSphMat = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 100 });
	const mSa = new THREE.Mesh(smallSphGeo, smallSphMat);
	// scene.add(mSa);
	// const mSb = new THREE.Mesh(smallSphGeo, smallSphMat);
	// scene.add(mSb);

	// // Create cylinder geometry
	var smallCylGeo = new THREE.CylinderGeometry(.04, .04, 2, 32)
	// const mSCyl = new THREE.Mesh(smallCylGeo, smallSphMat);
	// scene.add(mSCyl);
	// mSCyl.position.set(0,0,0);

	const R = 1.0

	// Create directional light
	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(1, -1, 1).normalize();
	scene.add(light);


class Model {
	constructor(x0, v0, m, g) {
		this.x = x0;
		this.p = x0;
		this.v = v0;
		this.w = 1/m;
		this.g = g;

		this.mat = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 100 });
		this.mesh = new THREE.Mesh(smallSphGeo, this.mat);
		scene.add(this.mesh);
	} 

	preConstraintStep() {
		// Update velocity
		this.v.addScaledVector(new THREE.Vector3(0,0, this.g), dT)
		this.p = this.x.clone();
		this.p.addScaledVector(this.v, dT);
	}

	postConstraintStep() {
		this.v.subVectors(this.p, this.x);
		this.v.multiplyScalar(1/dT);
		this.x = this.p;
		this.mesh.position.copy(this.x);
	}
	

	updateGraphics() {

	}
}

function setRotation(mesh, point){
	var azimuth = Math.atan2(-point.x, point.y);
	var distance = Math.sqrt(point.x * point.x + point.y * point.y);
	var elevation = Math.atan2(point.z, distance);
	var euler = new THREE.Euler(elevation,0,azimuth, "ZYX");
	mesh.setRotationFromEuler(euler);
}

// Update models for constraint
function solveConstraint(model1, model2){
		var x1 = model1.p.clone();
		var x2 = model2.p.clone();
		var x_12 = new THREE.Vector3();
		x_12.subVectors(x1, x2);
		const x_12_mag = x_12.length();
		x_12.normalize();
		
		const mass_ratio1 = model1.w / (model1.w + model2.w);
		const mass_ratio2 = model2.w / (model1.w + model2.w);

		var deltaX1 = x_12.clone();
		deltaX1.multiplyScalar(-mass_ratio1*(x_12_mag - R));

		var deltaX2 = x_12.clone();
		deltaX2.multiplyScalar( mass_ratio2*(x_12_mag - R))

		// Return tuple?
		return [deltaX1, deltaX2];
}

function checkConstraints(particles){
	for (let i = 1; i < 10; ++i){
		var diff = particles[i].x.clone();
		diff.sub(particles[i-1].x);
		console.log("Diff = ", diff.length())
	}
}


function updateGraphics() {
	// mSa.position.copy(p1)
	// mSb.position.copy(p1.clone().multiplyScalar(-1))
	// setRotation(mSCyl, p1);

	// mBa.position.copy(p2)
	// mBb.position.copy(p2.clone().multiplyScalar(-1))
	// setRotation(bigCyl, p2);
}

///////////////////////////////////////////////////////////////////
// Main animation loop.

// These implement constant time steps across different
// devices, etc..
const fixedTimeStep = 1/60;
const clock = new THREE.Clock();

function createParticles() {
	var particles = [	new Model(new THREE.Vector3(0, 0, 0),	new THREE.Vector3(0,0,0), 1000000000, 0)];
	for (let i = 0; i < 1; ++i){
		particles.push(new Model(new THREE.Vector3(R*(i+1), 0, 0), 	new THREE.Vector3(0,0,0), 1, -1))
	}
	return particles;
}					

function preConstraint(particles){
	for (let i = 0; i < particles.length; ++i){
		particles[i].preConstraintStep();
	}
}

function postConstraint(particles){
	for (let i = 0; i < particles.length; ++i){
		particles[i].postConstraintStep();
	}
}

function projectConstraints(particles) {
	const iters = 5;
	for (let i = 0; i < iters; ++i){
		for(let j = 1; j < particles.length; ++j){
			const [deltaX1, deltaX2] = solveConstraint(particles[j-1], particles[j]);
			particles[j-1].p.add(deltaX1);
			particles[j].p.add(deltaX2);
		}
	}
}

var particles = createParticles();

// The main workhorse.
function animate() {
	const deltaTime = clock.getDelta();

	preConstraint(particles);
	projectConstraints(particles);
	postConstraint(particles);
	//checkConstraints(particles);

	t += dT;
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

animate();