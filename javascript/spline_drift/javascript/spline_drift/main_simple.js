import * as THREE from 'three';

// Bezier stuff

// Define the required math functions
function addVectors(v1, v2) {
    return v1.map((_, i) => v1[i] + v2[i]);
}

function subVectors(v1, v2) {
    return v1.map((_, i) => v1[i] - v2[i]);
}

function mulVectorScalar(v, scalar) {
    return v.map(x => x * scalar);
}

function dotProduct(v1, v2) {
    return v1.map((_, i) => v1[i] * v2[i]).reduce((sum, curr) => sum + curr, 0);
}

function norm(v) {
    return Math.sqrt(dotProduct(v, v));
}

function bezierPoint(P0, P1, P2, P3, t) {
    return P0.map((_, i) => (1 - t) ** 3 * P0[i] + 3 * (1 - t) ** 2 * t * P1[i] + 3 * (1 - t) * t ** 2 * P2[i] + t ** 3 * P3[i]);
}

function bezierDerivative(P0, P1, P2, P3, t) {
    return P0.map((_, i) => 3 * (1 - t) ** 2 * (P1[i] - P0[i]) + 6 * (1 - t) * t * (P2[i] - P1[i]) + 3 * t ** 2 * (P3[i] - P2[i]));
}

function bezierSecondDerivative(P0, P1, P2, P3, t) {
    return P0.map((_, i) => 6 * (1 - t) * (P2[i] - 2 * P1[i] + P0[i]) + 6 * t * (P3[i] - 2 * P2[i] + P1[i]));
}

function tangentVector(P0, P1, P2, P3, t) {
    const dT_dt = bezierDerivative(P0, P1, P2, P3, t);
    return mulVectorScalar(dT_dt, 1 / norm(dT_dt));
}

function signedCurvature(P0, P1, P2, P3, t) {
    const dT_dt = bezierDerivative(P0, P1, P2, P3, t);
    const ddT_dt2 = bezierSecondDerivative(P0, P1, P2, P3, t);
    const curvature = (dT_dt[0] * ddT_dt2[1] - dT_dt[1] * ddT_dt2[0]) / Math.pow(norm(dT_dt), 3);
    return Math.sign(curvature) * Math.abs(curvature);
}

function rotateVector(vector, angle) {
    const rotationMatrix = [[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]];
    return [
        dotProduct(rotationMatrix[0], vector),
        dotProduct(rotationMatrix[1], vector)
    ];
}

// Example usage
const P0 = [0.0, 0.0];
const P1 = [1.0, 2.0];
const P2 = [2.0, -1.0];
const P3 = [3.0, 0.0];

// Generate points on the curve, tangent vectors, and signed curvatures
let tValues = Array.from({length: 100}, (_, i) => i / 99);
let curvePoints = tValues.map(t => bezierPoint(P0, P1, P2, P3, t));
let tangentVectors = tValues.map(t => tangentVector(P0, P1, P2, P3, t));
let signedCurvatures = tValues.map(t => signedCurvature(P0, P1, P2, P3, t));

// Adjust tangent vectors and their lengths
let adjustedTangentVectors = tangentVectors.map((vec, i) => rotateVector(vec, signedCurvatures[i]));

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera position
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Control Points
const controlPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.5, 1, 0),
    new THREE.Vector3(0.5, -1, 0),
    new THREE.Vector3(1, 0, 0),
];

// Draw Control Points
const sphereGeometry = new THREE.SphereGeometry(0.05, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
controlPoints.forEach(point => {
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.copy(point);
    scene.add(sphere);
});

// Bezier Curve
const curve = new THREE.CubicBezierCurve3(
    controlPoints[0],
    controlPoints[1],
    controlPoints[2],
    controlPoints[3]
);

const points = curve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const bezierCurve = new THREE.Line(geometry, lineMaterial);

scene.add(bezierCurve);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
