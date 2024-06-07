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
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

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
const dT = 10*1/60
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
// const geometry = new THREE.PlaneGeometry(500, 500);
// const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.0});
// const plane = new THREE.Mesh(geometry, material);
// scene.add(plane);

// // Set up raycaster
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();


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

	const R = .05
	// mSa.position.set(R,0,0)
	// mSb.position.set(-R,0,0)

	// mBa.position.set(0,R,0)
	// mBb.position.set(0,-R,0)

	// // Create the geometry for the square
	const sqGeo = new THREE.PlaneGeometry(R, R); // 2x2 size plane
	// // Create the material with a solid blue color
	const sqMat = new THREE.MeshBasicMaterial({ color: 0x0000ff});


	// // Vertex shader
	// const vertexShader = `
	// attribute vec3 instanceColor;
	// varying vec3 vColor;
	// void main() {
	// 	vColor = instanceColor;
	// 	vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
	// 	gl_Position = projectionMatrix * mvPosition;
	// }
	// `;

	// // Fragment shader
	// const fragmentShader = `
	// varying vec3 vColor;
	// void main() {
	// 	gl_FragColor = vec4(vColor, 1.0);
	// }
	// `;

	// // Create the shader material
	// const shMat = new THREE.ShaderMaterial({
	// 	vertexShader,
	// 	fragmentShader,
	// 	uniforms: {}
	// });
  
	// Create the mesh
	//const square = new THREE.Mesh(sqGeo, material);

	// Add the square to the scene
	//scene.add(square);

	// // Create directional light
	// const light = new THREE.DirectionalLight(0xffffff, 1);
	// light.position.set(1, -1, 1).normalize();
	// scene.add(light);



// Step - basis for euler and other mid point methods
function stepSp(state, derivs, deltaT) {
	var s = state.clone();
	for (let i = 0; i < s.verts.length; ++i){
		var v = s.verts[i];
		v.x.addScaledVector(derivs.verts[i].x, dT);
		v.v.addScaledVector(derivs.verts[i].v, dT);
		//v.mesh.position.copy(v.x);
	}

	return s;
}

//var mp = step(s, s.clone().derivs(), 0.5*deltaT)
//var snew = step(s, mp.clone().derivs(), deltaT)

class VertexInfo {
	constructor(pos, isFixed = false){
		this.x = pos;
		this.v = new THREE.Vector3();
		this.m = .001;
		this.isFixed = isFixed;
		this.verts = [];
	}

	addMesh(colorV = 0x0000ff) {
		this.mat = new THREE.MeshBasicMaterial({ color: colorV });
		this.mesh = new THREE.Mesh(sqGeo, this.mat);
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

function forceOnV0(currState, v0){
	var force0 = new THREE.Vector3();

	for (let i = 0; i < currState.verts.length; ++i){
		if(i == v0)
			continue;

		var delta = currState.verts[v0].x.clone();
		delta.sub(currState.verts[i].x);
		delta.applyAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
		var diffSq = delta.lengthSq();
		var currForce = delta.clone();
		currForce.multiplyScalar(currState.verts[i].m/diffSq);

		force0.add(currForce);

	}

	return force0.clone();
}


class StateSp {
	constructor() {
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
				var forceV0 = forceOnV0(this, i);
				newV.x = forceV0.clone();
				newV.v = new THREE.Vector3()
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
		var s = new StateSp(); 
		for(let i = 0; i < this.verts.length; ++i){
			s.addVert(this.verts[i].clone())
		}

		return s;
	}
}


class Model {
	constructor(){
		//this.lu = new LookUp();
		this.currState = new StateSp();
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

function updateInstancePosition(instancedMesh, index, position) {
	const matrix = new THREE.Matrix4().makeTranslation(position.x, position.y, position.z);
	instancedMesh.setMatrixAt(index, matrix);
	instancedMesh.instanceMatrix.needsUpdate = true;
  }

class ModelCloth extends Model {
	constructor(){
		super();

		// Vertex shader
		const vertexShader = `
		attribute vec3 instanceColor;
		varying vec3 vColor;
		void main() {
			vColor = instanceColor;
			vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
			gl_Position = projectionMatrix * mvPosition;
		}
		`;

		// Fragment shader
		const fragmentShader = `
		varying vec3 vColor;
		void main() {
			gl_FragColor = vec4(vColor, 1.0);
		}
		`;

		// Create the shader material
		// const shMat = new THREE.ShaderMaterial({
		// 	vertexShader,
		// 	fragmentShader,
		// 	uniforms: {}
		// });
	
		var shMat = new THREE.MeshBasicMaterial({color: 0xff0000, })
		// Set up verts
		var width = 100;
		var depth = 100;
		var dx = .2;

		// Create an InstancedMesh
		this.instancedMesh = new THREE.InstancedMesh(sqGeo, shMat, width * depth);

		//// Create the mesh
		//const square = new THREE.Mesh(geometry, material);


		for (let x = 0; x < width; ++x){
			for (let y = 0; y < depth; ++y){
				var pos = new THREE.Vector3((x - 0.5*width)*dx,y*dx,0);
				var vtx = new VertexInfo(pos.clone());
				//console.log("vtx: ", vtx.x);

				console.log("vtx: ", vtx.x);
				console.log("center: ", new THREE.Vector3(.25*width*dx,0.5*width,0))
				console.log("distSq: ", vtx.x.distanceToSquared(new THREE.Vector3(.75,0.5*width*dx,0)));
		
				updateInstancePosition(this.instancedMesh, x+width*y, pos.clone());
				if(vtx.x.distanceToSquared(new THREE.Vector3(.25*width*dx,0.5*width*dx,0)) < 0.6){
					vtx.m *= -1;
					//vtx.addMesh(0xfffff00);
					this.instancedMesh.setColorAt(x + width * y, new THREE.Color(1,1,0));
				} else if (vtx.x.distanceToSquared(new THREE.Vector3(-.75,0.5*width*dx,0)) < 0.6){
					vtx.m *= -1;
					//vtx.addMesh(0xffff00);
					this.instancedMesh.setColorAt(x + width * y, new THREE.Color(1,1,0));
				} else {
					//vtx.addMesh();
					this.instancedMesh.setColorAt(x + width * y, new THREE.Color(1,0,0));
				}

				this.currState.addVert(vtx);
			}
		}
		this.instancedMesh.instanceColor.needsUpdate = true;
		scene.add(this.instancedMesh);

	}

	updateMesh(){
		for(let i = 0; i < this.currState.verts.length; ++i){
			updateInstancePosition(this.instancedMesh, i, this.currState.verts[i].x.clone());
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

	//clModel.updateRK();
	clModel.updateMesh();
	//clModel.updateMP();

	t += dT;
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

animate();