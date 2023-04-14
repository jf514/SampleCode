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

const size = 29;
const divisions = 30;
const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.set(0, 0, 0);
gridHelper.rotation.x = Math.PI/2;

scene.add( gridHelper );

camera.position.z = 20;
var deltaT = .1;
var t = 0.0;

///////////////////////////////////////////////////////////////////
class BicycleModel {
	constructor(x, y, z, theta, steer, v, lf, lr) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.theta = theta;
		this.steer = steer;
		this.v = v;
		this.lf = lf;
		this.lr = lr; 
	}

	update(deltaT, deltaSteer){
		// Midpoint method - calc midpoints
		var beta = Math.atan(this.lr * Math.tan(this.steer)/(this.lf+this.lr))  
		var steer_mid = this.steer + (0.5*deltaT)*deltaSteer;
		var x_mid = this.x + this.v*(0.5*deltaT)*Math.cos(this.theta + beta);
		var y_mid = this.y + this.v*(0.5*deltaT)*Math.sin(this.theta + beta);
		var theta_mid = this.theta + (0.5*deltaT)*(this.v/(this.lf + this.lr))*Math.tan(this.steer)*Math.cos(beta);
		
		// Full update
		var beta_mid = Math.atan(this.lr * Math.tan(steer_mid)/(this.lf+this.lr))  
		this.x = this.x + this.v*(deltaT)*Math.cos(theta_mid + beta_mid);
		this.y = this.y + this.v*(deltaT)*Math.sin(theta_mid + beta_mid);
		this.theta = this.theta + (deltaT)*(this.v/(this.lf + this.lr))*Math.tan(steer_mid)*Math.cos(beta_mid);
		this.steer = this.steer + (deltaT)*deltaSteer;
	}
}
///////////////////////////////////////////////////////////////////

const bike = new BicycleModel(0, 14.5, 0.0, 0*0.25*Math.PI, -0.125*Math.PI, 0.5, 1.5, 1.5);
///////////////////////////////////////////////////////////////////

function animate() {
	requestAnimationFrame( animate );

	//cube.rotation.x += 0.01;
	var deltaSteer = 1.0*Math.PI*Math.sin(2*Math.PI*t/(100.0));
	bike.update(deltaT, 0.0*deltaSteer);
	cube.position.x = bike.x;
	cube.position.y = bike.y;
	cube.rotation.z = bike.theta;

	t += deltaT;

	//gridHelper.rotation.x += 0.01;	
	renderer.render( scene, camera );
}

animate();