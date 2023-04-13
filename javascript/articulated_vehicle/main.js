import * as THREE from 'three'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 5, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const size = 30;
const divisions = 30;
const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.set(0, 0, 0);
gridHelper.rotation.x = Math.PI/2;

scene.add( gridHelper );

camera.position.z = 20;
var t = 0;

function animate() {
	requestAnimationFrame( animate );

	//cube.rotation.x += 0.01;
	cube.rotation.z += 0.01;

	//gridHelper.rotation.x += 0.01;

	t += 0.01;

	cube.position.z = Math.sin(t);
	
	renderer.render( scene, camera );
}

animate();