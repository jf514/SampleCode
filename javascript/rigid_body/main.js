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
camera.position.set(0, -5, 5);
camera.lookAt(0, 0, 0);

// DEBUG: Add some coordinate axes. R = X, green = Y, blue = Z.
//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

//Load background texture.
const txloader = new THREE.TextureLoader();
txloader.load('./Models/space_resized.png' , function(texture) {
           scene.background = texture;  
          });

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
var steerModel = Math.PI/6.;  
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

// Create a plane representing the x-y plane
const geometry = new THREE.PlaneGeometry(500, 500);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.0});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Set up raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let drawRB = false;
export function enableChekovEffect() {
    drawRB = true;
}

export function disableChekovEffect() {
    drawRB = false;
}

// const checkbox = document.getElementById('myCheckbox');
// checkbox.addEventListener('change', function() {
// 	drawRB = checkbox.checked;
// });


// Get references to the checkboxes
const checkbox1 = document.getElementById('checkbox1');
const checkbox2 = document.getElementById('checkbox2');
const checkbox3 = document.getElementById('checkbox3');

// Add event listeners to the checkboxes
checkbox1.addEventListener('change', function() {
	if (this.checked) {
		console.log('Checkbox 1 is checked');
		// Add your logic here when Checkbox 1 is checked
	} else {
		console.log('Checkbox 1 is unchecked');
		// Add your logic here when Checkbox 1 is unchecked
	}
});

checkbox2.addEventListener('change', function() {
	if (this.checked) {
		console.log('Checkbox 2 is checked');
		// Add your logic here when Checkbox 2 is checked
	} else {
		console.log('Checkbox 2 is unchecked');
		// Add your logic here when Checkbox 2 is unchecked
	}
});

checkbox3.addEventListener('change', function() {
	if (this.checked) {
		console.log('Checkbox 3 is checked');
		// Add your logic here when Checkbox 3 is checked
	} else {
		console.log('Checkbox 3 is unchecked');
		// Add your logic here when Checkbox 3 is unchecked
	}
});


///////////////////////////////////////////////////////////////////
// Model

	// Create sphere geometry
	const rSmSph = .1
	const smallSphGeo = new THREE.SphereGeometry(rSmSph, 32, 32);
	const smallSphMat = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 100 });
	const mSa = new THREE.Mesh(smallSphGeo, smallSphMat);
	scene.add(mSa);
	const mSb = new THREE.Mesh(smallSphGeo, smallSphMat);
	scene.add(mSb);

	// Create cylinder geometry
	var smallCylGeo = new THREE.CylinderGeometry(.04, .04, 2, 32)
	const mSCyl = new THREE.Mesh(smallCylGeo, smallSphMat);
	scene.add(mSCyl);
	mSCyl.position.set(0,0,0);

	const bigSphGeo = new THREE.SphereGeometry(2*rSmSph, 32, 32);
	const bigSphMat = new THREE.MeshPhongMaterial({ color: 0xff1100, specular: 0x222222, shininess: 100 })
	const mBa = new THREE.Mesh(bigSphGeo, bigSphMat);
	scene.add(mBa);
	const mBb = new THREE.Mesh(bigSphGeo, bigSphMat);
	scene.add(mBb)

	var bigCylGeo = new THREE.CylinderGeometry(.04, .04, 2, 32)
	const bigCyl = new THREE.Mesh(bigCylGeo, bigSphMat);
	scene.add(bigCyl);
	bigCyl.position.set(0,0,0);

	const R = 1
	mSa.position.set(R,0,0)
	mSb.position.set(-R,0,0)

	mBa.position.set(0,R,0)
	mBb.position.set(0,-R,0)

	// Create directional light
	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(1, -1, 1).normalize();
	scene.add(light);

// Masses
var m1 = 1
var m2 = 9.09

// Initial ang. vel.
var omega = new THREE.Vector3(0,0,1);

// Positions & vels

var theta = .3 * Math.PI/180
var p1 = new THREE.Vector3(0,R*Math.sin(theta),R*Math.cos(theta));
var p2 = (new THREE.Vector3(1,0,0)).cross(p1);
var v1 = omega.clone().cross(p1);
var v2 = omega.clone().cross(p2);
///////////////////////////////////////////////////////////////////
// Equations of motion

function dvdt1(pos1, v1, pos2, v2) {
	// if (v1 instanceof THREE.Vector3) {
	// 	console.log("v1 is THREE.Vector3");
	// } else {
	// 	console.log("v1 is " + typeof v1);
	// }
    let v1Sqr = v1.lengthSq();
    let v1v2 = v1.dot(v2);
    let x1 = pos1.clone().multiplyScalar(-v1Sqr / (R * R));
    let x2 = pos2.clone().multiplyScalar(-2 * m2 / ((m1 + m2) * R * R)).multiplyScalar(v1v2);
    return x1.add(x2);
}

function dvdt2(pos1, v1, pos2, v2) {
    let v2Sqr = v2.lengthSq();
    let v1v2 = v1.dot(v2);
    let x2 = pos2.clone().multiplyScalar(-v2Sqr / (R * R));
    let x1 = pos1.clone().multiplyScalar(-2 * m1 / ((m1 + m2) * R * R)).multiplyScalar(v1v2);
    return x2.add(x1);
}

// function dvdt1(p1, v1, p2, v2) {
// 	var k = 1;
// 	var r = p1.length();
// 	return p1.clone().multiplyScalar(-k*r);
// }

// function dvdt2(p1, v1, p2, v2) {
// 	var k = 1;
// 	var r = p2.length();
// 	return p2.clone().multiplyScalar(-k*r);
// }

// Step - basis for euler and other mid point methods
function step(state, derivs, deltaT) {
	var s = state.clone();
	s.p1.addScaledVector(derivs.p1,deltaT);
	s.v1.addScaledVector(derivs.v1,deltaT);
	s.p2.addScaledVector(derivs.p2,deltaT);
	s.v2.addScaledVector(derivs.v2,deltaT);

	return s
}

//var mp = step(s, s.clone().derivs(), 0.5*deltaT)
//var snew = step(s, mp.clone().derivs(), deltaT)

class State {
	constructor(p1, v1, p2, v2) {
		this.p1 = p1.clone();
		this.v1 = v1.clone();
		this.p2 = p2.clone();
		this.v2 = v2.clone(); 
	}

	derivs() {
		var d = new State(
			this.v1,
			dvdt1(this.p1, this.v1, this.p2, this.v2),
			this.v2,
			dvdt2(this.p1, this.v1, this.p2, this.v2)
		)

		return d;
	}

	updateEuler(deltaT) {
		p1.addScaledVector(v1,deltaT);
		v1.addScaledVector(dvdt1(p1, v1, p2, v2), deltaT);
		p2.addScaledVector(v2, deltaT);
		v2.addScaledVector(dvdt2(p1, v1, p2, v2), deltaT);

		return this.clone();
	}

	updateMP(deltaT) {
		var s = this.clone()
		//var c = s.clone()
		//var d = c.derivs()
		var k1 = step(s, s.clone().derivs(), 0.5*deltaT);
		//var diff = mp.p1.clone().sub(s.p1);
		//console.log("updateMP mp diff: ", diff);
		var snew = step(s, k1.clone().derivs(), deltaT);
		this.copy(snew);
	}

	// This is probably not right...
	updateRK(deltaT) {
		var s0 = this.clone()
		var k1 = s0.derivs();
		var k2 = step(s0, k1.clone(), 0.5*deltaT).derivs();
		var k3 = step(s0, k2.clone(), 0.5*deltaT).derivs();
		var k4 = step(s0, k3.clone(), deltaT).derivs();

		s0.Add(k1, deltaT/6);
		s0.Add(k2, deltaT/3);
		s0.Add(k3, deltaT/3);
		s0.Add(k4, deltaT/6);

		this.copy(s0);
	}

	Add(state0, scalar) {
		this.p1.addScaledVector(state0.p1, scalar);
		this.v1.addScaledVector(state0.v1, scalar);
		this.p2.addScaledVector(state0.p2, scalar);
		this.v2.addScaledVector(state0.v2, scalar);
	}

	clone() {
		var s = new State(this.p1,
							this.v1,
							this.p2,
							this.v2) 
		return s;
	}

	copy(s) {
		this.p1.copy(s.p1);
		this.v1.copy(s.v1);
		this.p2.copy(s.p2);
		this.v2.copy(s.v2);
	}
}


class Model {
	constructor(smallColor, bigColor) {
		this.smallColor = smallColor;
		this.bigColor = bigColor;
		this.p1 = new THREE.Vector3(0,R*Math.sin(theta),R*Math.cos(theta));
		this.p2 = (new THREE.Vector3(1,0,0)).cross(p1);
		this.v1 = omega.clone().cross(p1);
		this.v2 = omega.clone().cross(p2);
	} 

	init() {
		// Create sphere geometry
		const rSmSph = .1
		const smallSphGeo = new THREE.SphereGeometry(rSmSph, 32, 32);
		const smallSphMat = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 100 });
		const mSa = new THREE.Mesh(smallSphGeo, smallSphMat);
		scene.add(mSa);
		const mSb = new THREE.Mesh(smallSphGeo, smallSphMat);
		scene.add(mSb);

		// Create cylinder geometry
		var smallCylGeo = new THREE.CylinderGeometry(.04, .04, 2, 32)
		const mSCyl = new THREE.Mesh(smallCylGeo, smallSphMat);
		scene.add(mSCyl);
		mSCyl.position.set(0,0,0);

		const bigSphGeo = new THREE.SphereGeometry(2*rSmSph, 32, 32);
		const bigSphMat = new THREE.MeshPhongMaterial({ color: 0xff1100, specular: 0x222222, shininess: 100 })
		const mBa = new THREE.Mesh(bigSphGeo, bigSphMat);
		scene.add(mBa);
		const mBb = new THREE.Mesh(bigSphGeo, bigSphMat);
		scene.add(mBb)

		var bigCylGeo = new THREE.CylinderGeometry(.04, .04, 2, 32)
		const bigCyl = new THREE.Mesh(bigCylGeo, bigSphMat);
		scene.add(bigCyl);
		bigCyl.position.set(0,0,0);

		const R = 1
		mSa.position.set(R,0,0)
		mSb.position.set(-R,0,0)

		mBa.position.set(0,R,0)
		mBb.position.set(0,-R,0)
	}

	updateEuler(deltaT) {
		p1.addScaledVector(v1,deltaT);
		v1.addScaledVector(dvdt1(p1, v1, p2, v2), deltaT);
		p2.addScaledVector(v2, deltaT);
		v2.addScaledVector(dvdt2(p1, v1, p2, v2), deltaT);

		return this.clone();
		
	}

	updateGraphics() {
		mSa.position.copy(p1)
		mSb.position.copy(p1.clone().multiplyScalar(-1))
		setRotation(mSCyl, p1);
	
		mBa.position.copy(p2)
		mBb.position.copy(p2.clone().multiplyScalar(-1))
		setRotation(bigCyl, p2);
	}

	
}

const euler = new Model(0xFF0000, 0x00FF00);
euler.updateEuler();

function setRotation(mesh, point){
	var azimuth = Math.atan2(-point.x, point.y);
	var distance = Math.sqrt(point.x * point.x + point.y * point.y);
	var elevation = Math.atan2(point.z, distance);

	var euler = new THREE.Euler(elevation,0,azimuth, "ZYX");

	mesh.setRotationFromEuler(euler);
}

function updateDynamicsMP() {
	var s = new State(p1, v1, p2, v2);
	s.updateMP(dT);
	var pbef = p1.clone(p1);
	p1 = s.p1;
	var difference = pbef.sub(s.p1);
	//console.log("diff: ", difference)
	v1 = s.v1;
	p2 = s.p2;
	v2 = s.v2;
}

function updateDynamicsRK() {
	var s = new State(p1, v1, p2, v2);
	s.updateRK(dT);
	//var pbef = p1.clone(p1);
	p1 = s.p1;
	//var difference = pbef.sub(s.p1);
	//console.log("diff: ", difference)
	v1 = s.v1;
	p2 = s.p2;
	v2 = s.v2;
}

function updateDynamicsEuler() {
	p1.addScaledVector(v1,dT);
	v1.addScaledVector(dvdt1(p1, v1, p2, v2), dT);
	p2.addScaledVector(v2,dT);
	v2.addScaledVector(dvdt2(p1, v1, p2, v2), dT);
}

function updateGraphics() {
	mSa.position.copy(p1)
	mSb.position.copy(p1.clone().multiplyScalar(-1))
	setRotation(mSCyl, p1);

	mBa.position.copy(p2)
	mBb.position.copy(p2.clone().multiplyScalar(-1))
	setRotation(bigCyl, p2);
}

///////////////////////////////////////////////////////////////////
// Main animation loop.

// These implement constant time steps across different
// devices, etc..
const fixedTimeStep = 1/60;
const clock = new THREE.Clock();

// The main workhorse.
function animate() {
	const deltaTime = clock.getDelta();
	//updateDynamicsMP();

	if(!drawRB){
		updateDynamicsRK();
		updateGraphics();
	}
	t += dT;
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

animate();