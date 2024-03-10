import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js';

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

// Nurbs Curve Stuff

	// NURBS curve

	var nurbsControlPoints = [];
	var nurbsKnots = [];
	const nurbsDegree = 3;
    
    // var R = 10;
    // var P0 = new THREE.Vector4(R,0,.1,1);
    // var P1 = new THREE.Vector4(0,R,.1,1);
    // var P2 = new THREE.Vector4(-R,0,.1,1);
    // var P3 = new THREE.Vector4(R,0,.1,1);

    // nurbsControlPoints.push(P0);
    // nurbsControlPoints.push(P1);
    // nurbsControlPoints.push(P2);
    // nurbsControlPoints.push(P3);

    // nurbsKnots.push(0);
    // nurbsKnots.push(0);
    // nurbsKnots.push(0);
    // nurbsKnots.push(0);

    // nurbsKnots.push(1);
    // nurbsKnots.push(1);
    // nurbsKnots.push(1);
    // nurbsKnots.push(1);


// Assuming you have THREE.js included in your environment
function createEquilateralTriangleWithInterleavedMidpoints(sideLength) {
    // Calculate the height of the triangle
    const height = Math.sqrt(3) / 2 * sideLength;
    const halfHeight = height / 2;

    // Vertices of the triangle, centered such that one midpoint can be at the origin
    const p1 = new THREE.Vector4(-sideLength / 2, -halfHeight, 0.1, 1);
    const p2 = new THREE.Vector4(sideLength / 2 , -halfHeight, 0.1, 1);
    const p3 = new THREE.Vector4(0, height - halfHeight - 35, 0.1, 1);

    // Calculate midpoints between vertices
    const midpoint12 = new THREE.Vector4((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 0.1, 1); // Midpoint between p1 and p2
    const midpoint23 = new THREE.Vector4((p2.x + p3.x) / 2, (p2.y + p3.y) / 2, 0.1, 1); // Midpoint between p2 and p3
    const midpoint31 = new THREE.Vector4((p3.x + p1.x) / 2, (p3.y + p1.y) / 2, 0.1, 1); // Midpoint between p3 and p1

    // Create an array that interleaves vertices with midpoints in a counter-clockwise orientation
    // Start with midpoint12 to ensure the first and last points are the same (at origin adjustment if needed)
    var points = [
        midpoint12, p1, midpoint31, p3, midpoint23, p2, new THREE.Vector4().copy(midpoint12)
    ];

    return points;
}

function addConstantOffsetToVectorList(vectorList, center) {
    var i = 0;
    vectorList.forEach(vector => {
        console.log(i++);
        vector.x += center.x;
        vector.y += center.y;
        vector.z += center.z;
    });
}

// Example usage
var sideLength = 80; // Side length of the equilateral triangle
nurbsControlPoints = createEquilateralTriangleWithInterleavedMidpoints(sideLength);
// Deep copy function for a list of THREE.Vector4 objects
function deepCopyVectorList(vectorList) {
    return vectorList.map(vector => new THREE.Vector4().copy(vector));
}

// Make a deep copy of the original list
const outpts = deepCopyVectorList(nurbsControlPoints);
console.log(outpts);
addConstantOffsetToVectorList(nurbsControlPoints, new THREE.Vector4(0, 10, 0, 0));
nurbsKnots = [0, 0, 0, 0, 0.45, 0.5, 0.65, 1, 1, 1, 1];
console.log(nurbsControlPoints);

const nurbsCurve = new NURBSCurve( nurbsDegree, nurbsKnots, nurbsControlPoints );

const nurbsGeometry = new THREE.BufferGeometry();
nurbsGeometry.setFromPoints( nurbsCurve.getPoints( 100 ) );

const nurbsMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );

const nurbsLine = new THREE.Line( nurbsGeometry, nurbsMaterial );
//nurbsLine.position.set( 200, - 100, 0 );
scene.add( nurbsLine );

const nurbsControlPointsGeometry = new THREE.BufferGeometry();
nurbsControlPointsGeometry.setFromPoints( nurbsCurve.controlPoints );

const nurbsControlPointsMaterial = new THREE.LineBasicMaterial( { color: 0x333333, opacity: 0.25, transparent: true } );

const nurbsControlPointsLine = new THREE.Line( nurbsControlPointsGeometry, nurbsControlPointsMaterial );
nurbsControlPointsLine.position.copy( nurbsLine.position );
scene.add( nurbsControlPointsLine );

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
        var bezAngle = getZRotation(curveFirstDerivative(nurbsCurve, t));
        deltaTheta += bezAngle;	

        // Add rotation due to drift from curvature
		var thetaK = 10*curveSignedCurvature(nurbsCurve, t);
        var driftAngle = calcDriftTheta(1.25, thetaK, 1.65);
        deltaTheta += driftAngle;

        // Add to base model theta
        theta += deltaTheta;
        models[1].rotation.y = theta;
        
        // Set translation - transform car location
        // so center of front wheels follows the spline.
        var transCM = nurbsCurve.getPoint(t);
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