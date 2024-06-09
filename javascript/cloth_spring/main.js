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
camera.position.set(0, -25, 0);
camera.lookAt(-10, 0, 0);

// DEBUG: Add some coordinate axes. R = X, green = Y, blue = Z.
//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

//Load background texture.
const txloader = new THREE.TextureLoader();
//txloader.load('./Models/space_resized.png' , function(texture) {
//           scene.background = texture;  
//          });

///////////////////////////////////////////////////////////////////
// DEBUG: Grid helper... useful for debugging velocity/scale issues.
const size = 35;
const divisions = 30;
const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.set(0, 0, 0);
gridHelper.rotation.x = Math.PI/2;
///////////////////////////////////////////////////////////////////

// Simulation constants.
//const dT = 1/60;
const dT = 1/60
const dTH = .5 * dT;
var steerModel = Math.PI/6.;  
var t = 0.0;

///////////////////////////////////////////////////////////////////
// DEBUG: Allows for camera controls. Enable for dynamic camera.
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
//controls.minPolarAngle = Math.PI/2;
//controls.maxPolarAngle = Math.PI - Math.PI/6;
//controls.minAzimuthAngle = 0;
//controls.maxAzimuthAngle = 0;
controls.enablePan = false;
controls.enableDamping = true;
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


///////////////////////////////////////////////////////////////////
// Model

	// // Create sphere geometry
	const rSmSph = .1
	const smallSphGeo = new THREE.SphereGeometry(rSmSph, 32, 32);
	//const smallSphMat = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 100 });
	// const mSa = new THREE.Mesh(smallSphGeo, smallSphMat);
	// scene.add(mSa);
	// const mSb = new THREE.Mesh(smallSphGeo, smallSphMat);
	// scene.add(mSb);

	// // Create cylinder geometry
	var smallCylGeo = new THREE.CylinderGeometry(.04, .04, 2, 32)
	// const mSCyl = new THREE.Mesh(smallCylGeo, smallSphMat);
	// scene.add(mSCyl);
	// mSCyl.position.set(0,0,0);

	const bigSphGeo = new THREE.SphereGeometry(2*rSmSph, 32, 32);
	// const bigSphMat = new THREE.MeshPhongMaterial({ color: 0xff1100, specular: 0x222222, shininess: 100 })
	// const mBa = new THREE.Mesh(bigSphGeo, bigSphMat);
	// scene.add(mBa);
	// const mBb = new THREE.Mesh(bigSphGeo, bigSphMat);
	// scene.add(mBb)

	var bigCylGeo = new THREE.CylinderGeometry(.04, .04, 2, 32)
	// const bigCyl = new THREE.Mesh(bigCylGeo, bigSphMat);
	// scene.add(bigCyl);
	// bigCyl.position.set(0,0,0);

	const R = 1
	// mSa.position.set(R,0,0)
	// mSb.position.set(-R,0,0)

	// mBa.position.set(0,R,0)
	// mBb.position.set(0,-R,0)

	// Create directional light
	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(1, -1, 1).normalize();
	scene.add(light);


// Step - basis for euler and other mid point methods
function stepSp(state, derivs, deltaT) {
	var s = state.clone();
	for (let i = 0; i < s.verts.length; ++i){
		var v = s.verts[i];
		v.x.addScaledVector(derivs.verts[i].x, dT);
		v.v.addScaledVector(derivs.verts[i].v, dT);
		v.mesh.position.copy(v.x);
	}

	return s;
}

//var mp = step(s, s.clone().derivs(), 0.5*deltaT)
//var snew = step(s, mp.clone().derivs(), deltaT)

class VertexInfo {
	constructor(pos, isFixed = false){
		this.x = pos;
		this.v = new THREE.Vector3();
		this.m = .01;
		this.isFixed = isFixed;
		this.verts = [];
	}

	addMesh() {
		this.mat = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 100 });
		this.mesh = new THREE.Mesh(smallSphGeo, this.mat);
		scene.add(this.mesh);
		this.mesh.position.copy(this.x);
	}

	clone(){
		var v = new VertexInfo(this.x, this.isFixed);
		v.v = this.v.clone();
		v.m = this.m;
		v.mesh = this.mesh;
		for (let i = 0; i < this.verts.length; ++i){
			v.verts.push(this.verts[i]);
		}

		return v;
	}
}

function forceOnV0(currState, v0, v1){
	var springInfo = currState.lu.getVal(v0, v1);
	var force = new THREE.Vector3();

	var dir = currState.verts[v1].x.clone();
	// Dir points from v0 to v1
	dir.sub(currState.verts[v0].x);
	var dist = dir.length();
	dir.normalize();

	var forceMag = (springInfo.k) * (dist - springInfo.l0);
	var force0 = dir.clone().multiplyScalar(forceMag);

	return force0.clone();
}

function planeConstraint(state){
	for(let i = 0; i < state.verts.length; ++i){
		var cLevel = -3.5;
		if(state.verts[i].x.z <= cLevel){
			state.verts[i].x.z = cLevel;
			state.verts[i].v.z = -1.0*state.verts[i].v.z;
		}
	}
}

class StateSp {
	constructor(lookup) {
		this.lu = lookup;
		this.verts = [];
	}

	addVert(vertex){
		this.verts.push(vertex);
	}

	derivs(){
		var s = new StateSp(this.forces);

		for(let i = 0; i < this.verts.length; ++i){
			var oldV = this.verts[i];
			
			var newV = new VertexInfo();
			if(oldV.isFixed){
				// Velocity 
				newV.x = new THREE.Vector3(0,0,0);
				newV.v = new THREE.Vector3(0,0,0);
			} else {
				newV.x = oldV.v.clone();
				var force = new THREE.Vector3;
				for (let j = 0; j < oldV.verts.length; ++j){
					var forceV0 = forceOnV0(this, i, oldV.verts[j]);
					forceV0.multiplyScalar(1/oldV.m);
					force.add(forceV0);
				}
				force.add(new THREE.Vector3(0,0,-3));
				var a = 1.5;
				force.add(oldV.v.clone().multiplyScalar(-a*oldV.v.length()));
				newV.v = force.clone();


			}
			s.addVert(newV)
		}

		return s;
	}

	add(state, scalar){
		for(let i = 0; i < this.verts.length; ++i){
			this.verts[i].x.addScaledVector(state.verts[i].x, scalar);
			this.verts[i].v.addScaledVector(state.verts[i].v, scalar);
		}
	}


	clone(){
		var s = new StateSp(this.lu); 
		for(let i = 0; i < this.verts.length; ++i){
			s.addVert(this.verts[i].clone())
		}

		return s;
	}
}

class SpringInfo {
	constructor(k, l0) {
		this.k = k;
		this.l0 = l0;
	}

	printSpring(){
		console.log("SpringInfo:")
		console.log("k = ", this.k);
		console.log("m = ", this.m);
		console.log("l0 = ", this.l0);
	}
}

class LookUp {
	constructor(){
		this.map = new Map();
	}

	getKey(i, j){
		console.assert(i != j);
		var i0 = Math.min(i,j);
		var i1 = Math.max(i,j);
		var key = [i0,i1];
		key = key.join(",")
		return key;
	}

	add(i, j, springInfo){
		var key = this.getKey(i,j);
		console.assert(!this.map.has(key));

		// if(this.map.has(i0)){
		// 	assert(!this.map.get(i0).has(i1));
		// 	this.map.get(i)
		// }

		this.map.set(key, springInfo);
	}

	getVal(i,j){
		var key = this.getKey(i,j);
		console.assert(this.map.has(key));
		var val = this.map.get(key);
		return val;
	}
}

//var fOnV0 = forceOnV0(lu, 1, 0);
//console.log("force0on1", fOnV0);
//var ds = currState.derivs();
//stepSp(currState, currState.derivs(), dT);

function addSpring(model, v0, v1, springInfo){
	model.lu.add(v0,v1,springInfo);
	model.currState.verts[v0].verts.push(v1);
	model.currState.verts[v1].verts.push(v0);
}

class Model {
	constructor(){
		this.lu = new LookUp();
		this.currState = new StateSp(this.lu);
	}

	update() {
		this.currState = stepSp(this.currState, this.currState.derivs(), dT).clone();
	}

	// Midpoint
	updateMP() {
		var s = this.currState.clone();
		var k1 = stepSp(s, s.derivs(), 0.5*dT);
		//var diff = mp.p1.clone().sub(s.p1);
		//console.log("updateMP mp diff: ", diff);
		var snew = stepSp(s, k1.clone().derivs(), 0.5*dT);
		this.currState = snew;
	}

	// RK4
	updateRK(deltaT) {
		var s0 = this.currState.clone()
		var k1 = s0.derivs();
		var k2 = stepSp(s0, k1.clone(), 0.5*dT).derivs();
		var k3 = stepSp(s0, k2.clone(), 0.5*dT).derivs();
		var k4 = stepSp(s0, k3.clone(), dT).derivs();

		s0.add(k1, dT/6);
		s0.add(k2, dT/3);
		s0.add(k3, dT/3);
		s0.add(k4, dT/6);

		this.currState = s0;
	}
}

class ModelBlock extends Model {
	constructor(){
		super();

		// Verts
		var vtx = new VertexInfo(new THREE.Vector3(0,0,0), false);
		vtx.addMesh();
		this.currState.addVert(vtx);

		vtx = new VertexInfo(new THREE.Vector3(0,0,-1), false);
		vtx.addMesh();
		this.currState.addVert(vtx);

		vtx = new VertexInfo(new THREE.Vector3(1,0,-1), false);
		vtx.addMesh();
		this.currState.addVert(vtx);

		vtx = new VertexInfo(new THREE.Vector3(1,0,0), false);
		vtx.addMesh();
		this.currState.addVert(vtx);

		// Springs
		addSpring(this, 0,1, new SpringInfo(1,1));
		addSpring(this, 1,2, new SpringInfo(1,1));
		addSpring(this, 2,3, new SpringInfo(1,1));
		addSpring(this, 3,0, new SpringInfo(1,1));
		// Diags
		addSpring(this, 0,2, new SpringInfo(1,Math.SQRT2));
		addSpring(this, 1,3, new SpringInfo(1,Math.SQRT2));
	}
}

class ModelSp extends Model {
	constructor(){
		super() 
		
		this.lu.add(0,1, new SpringInfo(1,1,1));
		this.lu.add(1,2, new SpringInfo(1,1,1));
		//this.lu.getVal(0,1).printSpring();
		
		//Verts
		var vtx = new VertexInfo(new THREE.Vector3(0,0,0), true);
		vtx.addMesh();
		this.currState.addVert(vtx);

		vtx = new VertexInfo(new THREE.Vector3(1,0,0), false);
		vtx.addMesh();
		this.currState.addVert(vtx);

		vtx = new VertexInfo(new THREE.Vector3(2,0,0), false);
		vtx.addMesh();
		this.currState.addVert(vtx);

		this.currState.verts[0].verts.push(1);
		this.currState.verts[1].verts.push(0);
		this.currState.verts[1].verts.push(2);
		this.currState.verts[2].verts.push(1);
	}
}

class ModelCloth extends Model {
	constructor(){
		super();

		// Set up verts
		var width = 12;
		var depth = 12;
		var dx = 1.0;
		for (let x = 0; x < width; ++x){
			for (let y = 0; y < depth; ++y){
				var isFixed = y==0;
				var vtx = new VertexInfo(new THREE.Vector3(0.5*(x - width)*dx,y*dx,0), isFixed);
				vtx.addMesh();
				this.currState.addVert(vtx);
			}
		}

		// Add springs
		for (let x = 0; x < width; ++x){
			for (let y = 0; y < depth; ++y){
				if(x != width - 1){
					var n = x + width*y;
					addSpring(this,n,n+1,new SpringInfo(1,1));
				}
				if(y != depth - 1){
					var n = x + width*y;
					addSpring(this, n, n + width, new SpringInfo(1,1));
				}
				// Diag
				if(x != width - 1 && y != depth - 1){
					var n = x + width*y;
					addSpring(this, n, n + width + 1, new SpringInfo(1, Math.SQRT2))
				}
			}
		}		
	}
}

///////////////////////////////////////////////////////////////////
// Main animation loop.

// These implement constant time steps across different
// devices, etc..
const fixedTimeStep = 1/60;
const clock = new THREE.Clock();

//var spModel = new ModelSp();
//var blModel = new ModelBlock();
var clModel = new ModelCloth()

// The main workhorse.
function animate() {
	const deltaTime = clock.getDelta();

	//spModel.updateRK();
	//blModel.updateRK();
	//planeConstraint(blModel.currState);

	clModel.updateRK();

	t += dT;
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

animate();