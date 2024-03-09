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
camera.position.set(0, -40, 60);
//camera.position.set(0,0,60);
camera.lookAt(0, 0, 0);

//Debug Helper:
//Add some coordinate axes. R = X, green = Y, blue = Z.
//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

//Load background texture.
const txloader = new THREE.TextureLoader();
txloader.load('./Models/space_resized.png' , function(texture) {
            scene.background = texture;  
           });

///////////////////////////////////////////////////////////////////
// Load models.

let models = new Array();

// Load the model. Asynchronous, make sure this can be handled in main thread.
const loader = new GLTFLoader();

// Parking lot - backgound.
loader.load('./Models/ParkingLot_02.glb', function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.x = Math.PI/2;
    const sc = 0.01;
    model.scale.set(sc, sc, sc);
	models[0] = model;
    scene.add(model);
    }
    , function(xhr){
        console.log((xhr.loaded/xhr.total * 100) + "% loaded")
    }, function(error){
        console.log("")
    }
);

// Load the truck.
loader.load('./Models/Truck.glb', function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.x = Math.PI/2;
    model.rotation.y = -Math.PI/2;
    const sc = 0.01;
    model.scale.set(sc, sc, sc);
	models[1] = model;
    scene.add(model);
    }
    , function(xhr){
        console.log((xhr.loaded/xhr.total * 100) + "% loaded")
    }, function(error){
        console.log('An error occurred')
    }
);

// Function to evaluate a point on the cubic Bezier curve given parameter t
function bezierPoint(P0, P1, P2, P3, t) {
    const oneMinusT = 1 - t;
    const oneMinusT2 = oneMinusT * oneMinusT;
    const oneMinusT3 = oneMinusT2 * oneMinusT;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = oneMinusT3 * P0.x + 3 * oneMinusT2 * t * P1.x + 3 * oneMinusT * t2 * P2.x + t3 * P3.x;
    const y = oneMinusT3 * P0.y + 3 * oneMinusT2 * t * P1.y + 3 * oneMinusT * t2 * P2.y + t3 * P3.y;
    const z = oneMinusT3 * P0.z + 3 * oneMinusT2 * t * P1.z + 3 * oneMinusT * t2 * P2.z + t3 * P3.z;

    return new THREE.Vector3(x, y, z);
}


// Function to compute the first derivative of the cubic Bezier curve
function bezierFirstDerivative(P0, P1, P2, P3, t) {
    const dt = 1e-5; // Small value for approximating the derivative
    const t1 = Math.max(0, t - dt);
    const t2 = Math.min(1, t + dt);

    const p1 = bezierPoint(P0, P1, P2, P3, t1);
    const p2 = bezierPoint(P0, P1, P2, P3, t2);

    return p2.clone().sub(p1).multiplyScalar(1 / (t2 - t1));
}

// Function to compute the second derivative of the cubic Bezier curve
function bezierSecondDerivative(P0, P1, P2, P3, t) {
    const dt = 1e-5; // Small value for approximating the derivative
    const t1 = Math.max(0, t - dt);
    const t2 = Math.min(1, t + dt);

    const dp1 = bezierFirstDerivative(P0, P1, P2, P3, t1);
    const dp2 = bezierFirstDerivative(P0, P1, P2, P3, t2);

    return dp2.clone().sub(dp1).multiplyScalar(1 / (t2 - t1));
}

// Function to compute the signed curvature of the cubic Bezier curve at a given parameter t
function signedCurvature(P0, P1, P2, P3, t) {
    const dT_dt = bezierFirstDerivative(P0, P1, P2, P3, t);
    const ddT_dt2 = bezierSecondDerivative(P0, P1, P2, P3, t);
    const curvature = (dT_dt.x * ddT_dt2.y - dT_dt.y * ddT_dt2.x) / Math.pow(dT_dt.length(), 3);
    return Math.sign(curvature) * Math.abs(curvature);
}


function rotateVector(vector, angle) {
    const rotationMatrix = [[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]];
    return [
        dotProduct(rotationMatrix[0], vector),
        dotProduct(rotationMatrix[1], vector)
    ];
}

function calcDriftTheta(k, theta, pow){
	var sign = Math.sign(theta);
    theta = k * sign * Math.abs(theta) ** pow;
    
    var maxAngle = 75.*Math.PI/180.;
	return Math.min(Math.max(theta, -maxAngle), maxAngle);
}
	
// Function to get the z rotation of a vector confined to the XY plane
function getZRotation(vector) {
    // Ensure the vector is in the XY plane by setting its z-component to 0
    const vectorXY = new THREE.Vector3(vector.x, vector.y, 0);
    
    // Calculate the angle between the vector and the positive X-axis
    const angle = Math.atan2(vectorXY.y, vectorXY.x);

    // Convert the angle from radians to degrees and return it
    return angle;
}


// Simulation constants.
const deltaT = .1;
var steer = 20*Math.PI/180.;
var t = 0.0;

// Camera controls.
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI - Math.PI/6;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = 0;
controls.enablePan = false;
controls.enableDamping = true;

// Handle resizing window.
window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};

// Control Points
var P0 
const cP = [
    new THREE.Vector3(-30, 0, .1),
    new THREE.Vector3(-15, 30, .1),
    new THREE.Vector3(15, -30, .1),
    new THREE.Vector3(30, 0, .1),
];

// // Draw Control Points
// const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// cP.forEach(point => {
//     const sphere = new THREE.Mesh(sphereGeometry, material);
//     sphere.position.copy(point);
//     scene.add(sphere);
// });

// Bezier Curve
const curve = new THREE.CubicBezierCurve3(
    cP[0],
    cP[1],
    cP[2],
    cP[3]
);

const points = curve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const bezierCurve = new THREE.Line(geometry, lineMaterial);

scene.add(bezierCurve);

///////////////////////////////////////////////////////////////////
// Main animation loop.

// These implement constant time steps across different
// devices, etc..
const fixedTimeStep = 1/60;
const velocity = 1/6;
let accumulator = 0;
const clock = new THREE.Clock();

var t = 0

// The main workhorse.
function animate() {
    const deltaTime = clock.getDelta();
	if(models.length > 1){
        // Calculate rotation:
        // Align model to x - axis
        var theta = -Math.PI/2;
        
        // Set up a variable to hold rotations
        // relative to x-axis 
        var deltaTheta = 0;

        // Add rotation from spline slope
        var bezAngle = getZRotation(bezierFirstDerivative(cP[0], cP[1], cP[2], cP[3], t));
        deltaTheta += bezAngle;	

        // Add rotation due to drift from curvature
		var thetaK = 10*signedCurvature(cP[0], cP[1], cP[2], cP[3], t);
        var driftAngle = calcDriftTheta(1.25, thetaK, 1.65);
        deltaTheta += driftAngle;

        // Add to base model theta
        theta += deltaTheta;
        models[1].rotation.y = theta;
        
        // Set translation - transform car location
        // so center of front wheels follows the spline.
        var transCM = bezierPoint(cP[0],
			cP[1],
			cP[2],
            cP[3], t);
            
        var transFrontWheel = new THREE.Vector3(Math.cos(deltaTheta), Math.sin(deltaTheta), 0);
        var distToFronWheel = 2;
        transFrontWheel.multiplyScalar(-distToFronWheel);
        transFrontWheel.add(transCM);    
        models[1].position.copy(transFrontWheel);

        // console.log(transFrontWheel);
        // console.log(transCM);
        // console.log(models[1].position);
	}

	renderer.render( scene, camera );

	requestAnimationFrame( animate );

	t += velocity*fixedTimeStep;

    // Warp to start of spline
	if(t > 1)
		t = 0;
}

animate();