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
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);
camera.up.set(0,0,1);

// DEBUG: Add some coordinate axes. R = X, green = Y, blue = Z.
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

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
const dT = 6/60
const dTH = .5 * dT;
var t = 0.0;

///////////////////////////////////////////////////////////////////
// DEBUG: Allows for camera controls. Enable for dynamic camera.
// const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set( 0, 0.5, 0 );
// controls.update();
// controls.minPolarAngle = Math.PI/2;
// controls.maxPolarAngle = Math.PI - Math.PI/6;
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
	const rSmSph = 1.1
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


// TODO: better tetrahedron


function matrixSum(matrixA, matrixB){
    var resultMatrix = new THREE.Matrix4();
    // Add corresponding elements of matrixA and matrixB
    for (var i = 0; i < 16; i++) {
        resultMatrix.elements[i] = matrixA.elements[i] + matrixB.elements[i];
    }

    return resultMatrix;
}

function matrixSum3(matrixA, matrixB){
    var resultMatrix = new THREE.Matrix3();
    // Add corresponding elements of matrixA and matrixB
    for (var i = 0; i < 9; i++) {
        resultMatrix.elements[i] = matrixA.elements[i] + matrixB.elements[i];
    }

    return resultMatrix;
}

function matrixTrace(matrix){
	var tr = matrix.elements[0] + matrix.elements[5] + matrix.elements[10] + matrix.elements[15];
	var res = new THREE.Matrix4();
	res.multiplyScalar(tr);
	return res;
}

function matrixTrace3(matrix){
	var tr = matrix.elements[0] + matrix.elements[4] + matrix.elements[8];
	var res = new THREE.Matrix3();
	res.multiplyScalar(tr);
	return res;
}

function getZeroMat(){
	var matrix = new THREE.Matrix4();
	matrix.set(0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0);
	return matrix;
}

function getZeroMat3(){
	var matrix = new THREE.Matrix3();
	matrix.set(0,0,0, 0,0,0, 0,0,0);
	return matrix;
}

// Utils
function printMatrix(matrix) {
    console.log(
        matrix.elements[0], matrix.elements[4], matrix.elements[8],  matrix.elements[12]);
    console.log(
        matrix.elements[1], matrix.elements[5], matrix.elements[9],  matrix.elements[13]);
    console.log(
        matrix.elements[2], matrix.elements[6], matrix.elements[10], matrix.elements[14]);
    console.log(
        matrix.elements[3], matrix.elements[7], matrix.elements[11], matrix.elements[15]);
}

function printMatrix3(matrix) {
    console.log(
        matrix.elements[0], matrix.elements[3], matrix.elements[6]);
    console.log(
        matrix.elements[1], matrix.elements[4], matrix.elements[7]);
    console.log(
        matrix.elements[2], matrix.elements[5], matrix.elements[8]);
}

var A = new THREE.Matrix4();
// Row major
A.set(0,1,2,3,  4,5,6,7,  8,9,10,11,  12,13,14,15);
printMatrix(A);

function multiplyMatrix4ByVector3(matrix, vector) {
    // Create a Vector4 from the Vector3, adding a fourth component (w) = 1
    var vector4 = new THREE.Vector4(vector.x, vector.y, vector.z, 1);
    
    // Apply the matrix transformation to the Vector4
    vector4.applyMatrix4(matrix);
    
    // Convert back to a Vector3 (ignoring the w component)
    return new THREE.Vector3(vector4.x, vector4.y, vector4.z);
}	

class VertexInfo {
	constructor(vertex, tetras) {
		this.vtx = vertex;
		this.vel = new THREE.Vector3;
		this.tetras = tetras;
		
		this.mat = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 100 });
		this.mesh = new THREE.Mesh(smallSphGeo, this.mat);
		scene.add(this.mesh);
		this.mesh.position.copy(this.vtx);
	}
}

function validateTris(thruples) {
    if (thruples.length !== 4) {
        throw new Error("Input list must contain exactly four triples.");
    }

    let idxs = new Set();

    for (let [a, b, c] of thruples) {
        idxs.add(a);
        idxs.add(b);
        idxs.add(c);
    }

    assert(idxs.size === 4);

	return idxs;
}

class Tetra {

	constructor(i0, i1, i2, i3) {

		this.idxs = [i0, i1, i2, i3];
		this.Q = new THREE.Matrix4();
		// this.Q.set( 	verts[i0].vtx.x , verts[i1].vtx.x , verts[i2].vtx.x, verts[i3].vtx.x,
		// 				verts[i0].vtx.y , verts[i1].vtx.y , verts[i2].vtx.y, verts[i3].vtx.y, 
		// 				verts[i0].vtx.z , verts[i1].vtx.z , verts[i2].vtx.z, verts[i3].vtx.z,
		// 						1  ,          1 ,          1,          1);

		// Note set() takes row-major, though they are stored column-major (seems dumb)
		this.Q.set( 	
				verts[i0].vtx.x , verts[i0].vtx.y , verts[i0].vtx.z, 1,
				verts[i1].vtx.x , verts[i1].vtx.y , verts[i1].vtx.z, 1,
				verts[i2].vtx.x , verts[i2].vtx.y , verts[i2].vtx.z, 1, 
				verts[i3].vtx.x , verts[i3].vtx.y , verts[i3].vtx.z, 1,);

		this.QInv = this.Q.clone().invert();
		this.F = new THREE.Matrix4();
		this.P = new THREE.Matrix4();
		this.V = 1; // TODO

		this.ANorms = new Map();
		for (let i = 0; i < this.idxs.length; ++i){
			this.ANorms.set(this.idxs[i], this.calcANorm(this.idxs[i]));
		}

		this.calcF();
	}

	getANorm(vdx){
		return this.ANorms.get(vdx);
	}

	printQinv() {
		printMatrix(this.QInv);
	}

	// list of indices to form updated matrix
	// list of verts (An area and normal)
	calcANorm(vdx) {
		var tri_idxs = []
		for (let i = 0; i < this.idxs.length; ++i){
			if(this.idxs[i] != vdx){
				tri_idxs.push(this.idxs[i]);
			}
		}
	
		var vtxA = verts[tri_idxs[0]].vtx.clone();
		var vtxB = verts[tri_idxs[1]].vtx.clone();
		var vtxC = verts[tri_idxs[2]].vtx.clone();
		var vtx0 = verts[vdx].vtx.clone();
		vtx0.sub(vtxA);

		// Compute the cross product of vectorA and vectorB
		var crossProductAB = new THREE.Vector3();
		crossProductAB.crossVectors(vtxB.sub(vtxA), vtxC.sub(vtxA));

		var A = .5*crossProductAB.length();
		crossProductAB.normalize();

		if(vtx0.dot(crossProductAB) > 0){
			return crossProductAB.multiplyScalar(-A);
		} else {
			return crossProductAB.multiplyScalar(A);
		}
	}

	update() {
		var x = new THREE.Matrix4;

		var [i0, i1, i2, i3] = this.idxs;
		// x.set( 	
		// 	verts[i0].vtx.x , verts[i1].vtx.x , verts[i2].vtx.x, verts[i3].vtx.x,
		// 	verts[i0].vtx.y , verts[i1].vtx.y , verts[i2].vtx.y, verts[i3].vtx.y, 
		// 	verts[i0].vtx.z , verts[i1].vtx.z , verts[i2].vtx.z, verts[i3].vtx.z,
		// 			1  ,          1 ,          1,          1);

		x.set( 	verts[i0].vtx.x , verts[i0].vtx.y , verts[i0].vtx.z, 1,
				verts[i1].vtx.x , verts[i1].vtx.y , verts[i1].vtx.z, 1,
				verts[i2].vtx.x , verts[i2].vtx.y , verts[i2].vtx.z, 1, 
				verts[i3].vtx.x , verts[i3].vtx.y , verts[i3].vtx.z, 1,);

		printMatrix(x);

		var F = x.multiply(this.QInv);
		var C = F.clone();
		C.transpose;
		C.multiply(F);

		var E = C.clone();
		E = matrixSum(E, (new THREE.Matrix4).multiplyScalar(-1));
		E.multiplyScalar(0.5);

		// Calculate Stress (move to function?)
		const mu = 20.;
		const lambda = 20.;
		var S = new THREE.Matrix4();
		S = E.clone().multiplyScalar(2*mu);
		var trE = matrixTrace(E);
		trE.multiplyScalar(lambda);
		S = matrixSum(S, trE);
		this.P = F.clone();
		this.P.multiply(S);
		if(!this.P.equals(getZeroMat())){
			console.log("Found non-zero");
		}
	}

	update3(){
		this.calcF();
		var C = this.F3.clone();
		C.transpose;
		C.multiply(this.F3);

		var E = C.clone();
		E = matrixSum3(E, (new THREE.Matrix3).multiplyScalar(-1));
		E.multiplyScalar(0.5);

		// Calculate Stress (move to function?)
		const mu = 2.;
		const lambda = 2.;
		var S = new THREE.Matrix3();
		S = E.clone().multiplyScalar(2*mu);
		var trE = matrixTrace3(E);
		trE.multiplyScalar(lambda);
		S = matrixSum3(S, trE);
		this.P = this.F3.clone();
		this.P.multiply(S);
		if(!this.P.equals(getZeroMat3())){
			console.log("Found non-zero");
		}
	}

	calcF(){
		//var [i0, i1, i2, i3] = this.idxs;
		var F3 = getZeroMat3();

		for (let idxs = 0; idxs < 4; ++idxs){
			var idx = this.idxs[idxs];
			var F_idx = getZeroMat3();

			for (let i = 0; i < 3; ++i ){
				for (let j = 0; j < 3; ++j){
					var temp = this.getANorm(idx);
					var An = temp.clone();
					Assign3(F_idx, i, j, verts[idx].vtx.getComponent(j)*An.getComponent(i));
					//F_idx.elements[i + 3*j] = verts[idx].vtx.getComponent(j)*An.getComponent(i);
				}
			}
			F3 = matrixSum3(F3, F_idx);
		}

		this.F3 = F3.clone();
		//var nV = 3*(1/6)
		var nV = 3*edgeLength*edgeLength*edgeLength/6; 
		this.F3.multiplyScalar(-1/nV);
		//console.log("F: ")
		//printMatrix(this.F3);
	}

	calcForces(){
		var forceT = new THREE.Vector3();
		for (var i = 0; i < verts.length; ++i){
			var forceV = this.getANorm(i).clone();
			forceV.applyMatrix3(this.P);
			forceT.add(forceV);
		}
		console.log("Net Forces: ", forceT);
	}
}

function Assign3(mat, i, j, val){
	mat.elements[3*j + i] = val;
}

var mat3 = new THREE.Matrix3;
for (let i = 0; i < 3; ++i){
	for (let j = 0; j < 4; ++j){
		Assign3(mat3, i,j, 3*i + j);
	}
}
console.log("Mat3:")
printMatrix3(mat3);
var vec = new THREE.Vector3(0,1,0);
vec.applyMatrix3(mat3);
console.log("v3: ", vec);

var edgeLength = 10;
var verts = [
				new VertexInfo(new THREE.Vector3(0,0,0),[0]),
				new VertexInfo(new THREE.Vector3(edgeLength,0,0),[0]),
				new VertexInfo(new THREE.Vector3(0,edgeLength,0),[0]),
				new VertexInfo(new THREE.Vector3(0,0,edgeLength),[0]),
			];

///////////////////////////////////////////////////////////////////
// Main animation loop.

// These implement constant time steps across different
// devices, etc..
const fixedTimeStep = 1/60;
const clock = new THREE.Clock();


var iter = 0;
function updateVerts3(){
	// Update tetras w/ last time step
	for(let i = 0; i < tetras.length; ++i){
		tetras[i].update3();
	}
	// Sum forces
	var forceT = new THREE.Vector3()
	for (let i = 0; i < verts.length; ++i){
		var f_v = new THREE.Vector3(0,0,0);
		verts[i].tetras.forEach((tetIdx) => {
			var aNorm = tetras[tetIdx].getANorm(i).clone();
			//var fc = multiplyMatrix4ByVector3(tetras[tetIdx].P, aNorm);

			var fc = aNorm.applyMatrix3(tetras[tetIdx].P)
			//var r = verts[i].vtx.length();
			//var fc = new THREE.Vector3(0,0,-r + 1.0);
			forceT.add(fc);
			f_v.add(fc);
		});

		// if(verts[i].vtx.z < 3){
		// 	var vz = verts[i].vel.z;
		// 	f_v.z += 2*Math.abs(vz)/dT;
		// }
		// else{
		// 	f_v.z += -1; 
		// }
	
		var V = edgeLength*edgeLength*edgeLength/6;
		verts[i].vel.addScaledVector(f_v, dT/V);
		verts[i].vtx.addScaledVector(verts[i].vel.clone(), dT);
		
		//verts[i].vel.addScaledVector(new THREE.Vector3(0,0,-1.0), dT);
		verts[i].mesh.position.copy(verts[i].vtx);
		console.log("vertex :", i);
		console.log(verts[i].vtx);

		if(i == 0){
			var dummy = 0;
		}
	}
	console.log("ForceT:",forceT);
	++iter;
}

var t = new Tetra(0, 1, 2, 3);
var tetras = [t];

//verts[3].vtx.z += 1.3;
verts[0].vtx.x = -1.3;
verts[0].vtx.y = -1.3;
updateVerts3();
t.calcForces();

t.printQinv();
var res = new THREE.Matrix4();
res.multiplyMatrices(t.Q, t.QInv);
printMatrix(res);

//t.update();
//console.log("t.P");
//printMatrix(t.P);

//updateVerts();

console.log(t.getANorm(0));
console.log(t.getANorm(1));
console.log(t.getANorm(2));
console.log(t.getANorm(3));

// The main workhorse.
var currTime = 0;
function animate(currentTime) {
	var deltaTime = currentTime - currTime;
	//console.log("deltaTime: ", deltaTime);
	currTime = currentTime;

	// preConstraint(particles);
	// projectConstraints(particles);
	// postConstraint(particles);
	//checkConstraints(particles);

	//updateVerts();
	updateVerts3();
	console.log(verts[0].vel.z/dT)


	t += dT;
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

animate();