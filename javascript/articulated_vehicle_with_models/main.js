import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
//import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js'

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const pmremGenerator = new THREE.PMREMGenerator( renderer );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

// Models
let models = new Array();

//const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var width = 50;
var height = 50;
const aspect = window.innerWidth / window.innerHeight;
//const camera = new THREE.OrthographicCamera( width * aspect / - 2, width * aspect / 2, height / 2, height / - 2, 1, 1000 );
// Basic camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 40);
camera.lookAt(0, 0, 0);
camera.rotateX(Math.PI);

// Load the model. Synchronous, probably not great for big models.
const loader = new GLTFLoader();
loader.load('./Models/ParkingLot.glb', function (gltf) {
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
        console.log('An error occurred')
    }
);

loader.load('./Models/Truck.glb', function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.x = Math.PI/2;
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

loader.load('./Models/Trailer_15ft.glb', function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.x = Math.PI/2;
    const sc = 0.01;
    model.scale.set(sc, sc, sc);
	models[2] = model;
    scene.add(model);
    }
    , function(xhr){
        console.log((xhr.loaded/xhr.total * 100) + "% loaded")
    }, function(error){
        console.log('An error occurred')
    }
);

loader.load('./Models/Trailer_15ft.glb', function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.x = Math.PI/2;
    const sc = 0.01;
    model.scale.set(sc, sc, sc);
	models[3] = model;
    scene.add(model);
    }
    , function(xhr){
        console.log((xhr.loaded/xhr.total * 100) + "% loaded")
    }, function(error){
        console.log('An error occurred')
    }
);

//const renderer = new THREE.WebGLRenderer();
//renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 5, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

// Trailer
const tgeometry = new THREE.BoxGeometry( 5, 1, 1 );
const tmaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const tcube = new THREE.Mesh( tgeometry, tmaterial );
//scene.add( tcube );

// 2nd Trailer
const ttgeometry = new THREE.BoxGeometry( 5, 1, 1 );
const ttmaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const ttcube = new THREE.Mesh( ttgeometry, ttmaterial );
//scene.add( ttcube );

const size = 35;
const divisions = 30;
const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.set(0, 0, 0);
gridHelper.rotation.x = Math.PI/2;

//scene.add( gridHelper );

//camera.position.x = 0;
//camera.position.y = -20;
//camera.position.z = 25;
//camera.rotation.x = Math.PI/4;
var deltaT = .1;
var t = 0.0;

// Allows for camera controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

// Handle resizing window
window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

};

///////////////////////////////////////////////////////////////////
class BicycleModel {
	constructor(x, y, z, theta, steer, v, lf, lr, hitchDist, trailer) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.hitchDist = hitchDist; 
		this.theta = theta;
		this.thetaPrev = theta;
		this.beta = 0;
		this.steer = steer;
		this.v = v;
		this.lf = lf;
		this.lr = lr;
		this.trailer = trailer; 
	}

	update(deltaT, steer){
		// Update steer
		this.steer = steer;

		// Midpoint method - calc midpoints
		this.beta = Math.atan(this.lr * Math.tan(this.steer)/(this.lf+this.lr))  
		var x_mid = this.x + this.v*(0.5*deltaT)*Math.cos(this.theta + this.beta);
		var y_mid = this.y + this.v*(0.5*deltaT)*Math.sin(this.theta + this.beta);
		var theta_mid = this.theta + (0.5*deltaT)*(this.v/(this.lf + this.lr))*Math.tan(steer)*Math.cos(this.beta);
		
		// Full update
		this.x = this.x + this.v*(deltaT)*Math.cos(theta_mid + this.beta);
		this.y = this.y + this.v*(deltaT)*Math.sin(theta_mid + this.beta);
		this.thetaPrev = this.theta;
		this.theta = this.theta + (deltaT)*(this.v/(this.lf + this.lr))*Math.tan(this.steer)*Math.cos(this.beta);

		if(this.trailer){
			var hitchPos = this.getHitchPos();
			var hitchVel = this.getHitchVel(deltaT);
			this.trailer.update(deltaT, hitchPos, hitchVel, this.theta);
		}
	}

	getHitchPos(){
		var hX = this.x - this.hitchDist*Math.cos(this.theta);
		var hY = this.y - this.hitchDist*Math.sin(this.theta);
		var hitchPos = new THREE.Vector2(hX, hY);

		return hitchPos;
	}

	getRearWheelPos(){
		var hX = this.x - this.lr*Math.cos(this.theta);
		var hY = this.y - this.lr*Math.sin(this.theta);
		var rearWheelPos = new THREE.Vector2(hX, hY);

		return rearWheelPos;
	}

	getHitchVel(deltaT){
		var omega = (this.theta - this.thetaPrev)/deltaT;
		var vX = -omega*this.hitchDist*Math.sin(this.theta + Math.PI)+this.v*Math.cos(this.theta + this.beta);
		var vY = omega*this.hitchDist*Math.cos(this.theta + Math.PI)+this.v*Math.sin(this.theta + this.beta);
		var hitchVel = new THREE.Vector2(vX, vY);

		return hitchVel;
	}

	getPos(){
		var pos = new THREE.Vector3;
		pos.set(this.x, this.y, 0);

		return pos;
	}
}

class Trailer{
	constructor(distToAxle, distToCenter, distToHitch, theta, trailer){
		this.distToAxle = distToAxle;
		this.distToCenter = distToCenter;
		this.distToHitch = distToHitch;
		this.theta = theta;
		this.thetaPrev = theta;
		this.trailer2 = trailer;
	}

	update(deltaT, hitchPosParent, hitchVelParent, thetaParent){
		// World orientation:
		// thetaRel = thetaTrailerWorld - thetaParent (world) 
		// -> thetaTrailerWorld = thetaRel + thetaParentWorld (world)

		// JEF TODO REFACTOR
		var hitchVelX = hitchVelParent.x;
		var hitchVelY = hitchVelParent.y;
		var hitchPosX = hitchPosParent.x;
		var hitchPosY = hitchPosParent.y;

		const hitchVel = Math.sqrt(hitchVelX*hitchVelX + hitchVelY*hitchVelY);
		
		if(hitchVel == 0)
			return;

		const invHitchVel = 1.0/hitchVel;
		const hitchAngleSign = Math.cos(this.theta)*hitchVelY - Math.sin(this.theta)*hitchVelX > 0 ? 1 : -1;
		const hitchVelAngle = hitchAngleSign*Math.acos(invHitchVel*(Math.cos(this.theta)*hitchVelX + 
			Math.sin(this.theta)*(hitchVelY)));
		const hitchVelPerpendicular = Math.sin(hitchVelAngle)*hitchVel;
		const omega = hitchVelPerpendicular/this.distToAxle;

		this.thetaPrev = this.theta;
		this.theta += deltaT*omega;

		if(this.trailer2){
			trailer2.update(deltaT, 
				this.getHitchPos(hitchPosParent), 
				this.getHitchVel(deltaT, hitchVelParent), 
				this.theta);
		} else {
			var x = 0;
		}

		//this.theta = thetaParent;  // JEF REMOVE
	}

	getCenter(parentHitchPos){
		var cX = -this.distToCenter*Math.cos(this.theta) + parentHitchPos.x;
		var cY = -this.distToCenter*Math.sin(this.theta) + parentHitchPos.y;
		var center = new THREE.Vector3(cX, cY, 0);

		return center;
	}

	getHitchPos(parentHitchPos){
		var hX = parentHitchPos.x - this.distToHitch*Math.cos(this.theta);
		var hY = parentHitchPos.y - this.distToHitch*Math.sin(this.theta);
		var hitchPos = new THREE.Vector3(hX, hY, 0.);

		return hitchPos;
	}

	getHitchVel(deltaT, parentHitchVel){
		var omega = (this.theta - this.thetaPrev)/deltaT;
		var vX = parentHitchVel.x - omega*this.distToHitch*Math.sin(this.theta - Math.PI);
		var vY = parentHitchVel.y + omega*this.distToHitch*Math.cos(this.theta - Math.PI);
		var hitchVel = new THREE.Vector2(vX, vY);

		return hitchVel;
	}
}

///////////////////////////////////////////////////////////////////
function figure8(t, period){
	var theta = 0.125*Math.PI;
	if(Math.floor(t/period) % 2){
		return theta; 
	}

	return -1*theta;
}

function figure8_2(t, period){
	var theta = 0.25*Math.PI*Math.sin(6.28*(t/period));
	if(Math.floor(t/period) % 2){
		return theta; 
	}

	return -1*theta;
}

function make_bbox2(xmin, ymin, xmax, ymax){
	const min1 = new THREE.Vector2(xmin, ymin);
	const max1 = new THREE.Vector2(xmax, ymax);
	const box1 = new THREE.Box2(min1, max1);

	return box1;
}

function bbox_steer(pos){
	var box1 = make_bbox2(-7, -50, 50, 50);
	var box2 = make_bbox2(-150, -50, -44.5, 50);

	if(box1.containsPoint(pos) || box2.containsPoint(pos))
		return Math.PI/9;
	else
		return 0.0;
}

class Fig8Steer {
	constructor(angle, yCenter){
		this.angle = angle;
		this.yCenter = yCenter;
		this.angleSign = 1;
	}

	getSteer(y, prevY){
		if( (y - this.yCenter) > 0 && (prevY - this.yCenter) < 0){
			this.angleSign = -1*this.angleSign;
		}

		return this.angleSign*this.angle;
	}
}

///////////////////////////////////////////////////////////////////
const thetaStart = -0.125*Math.PI*0;
const trailer2 = new Trailer(5, 2.5, 6, -Math.PI/2);
const trailer = new Trailer(5, 2.5, 5, -Math.PI/2, trailer2);
const bike = new BicycleModel(1.5, 10.5, 0, Math.PI/2, 0, 1.0, 2.0, 2.0, 2.5, trailer);
const fig8Steer = new Fig8Steer(Math.PI/11.5, 10.5);
var prevY = 4.9;

///////////////////////////////////////////////////////////////////
function animate() {
	requestAnimationFrame( animate );

	//var deltaSteer = 1.0*Math.PI*Math.sin(2*Math.PI*t/(100.0));

	//var steer = figure8(t, 61.5);
	//var steer = 0.125*Math.PI*Math.sin(6.28*(t/10.7));
	//var steer = bbox_steer(bike.getRearWheelPos());
	var steer = fig8Steer.getSteer(bike.getPos().y, prevY);
	prevY = bike.getPos().y;

	bike.update(deltaT, steer);
	cube.position.copy(bike.getPos());
	cube.rotation.z = bike.theta;

	models[1].position.copy(bike.getPos());
	models[1].rotation.y = bike.theta - Math.PI/2;

	tcube.position.x = bike.trailer.getCenter(bike.getHitchPos()).x;
	tcube.position.y = bike.trailer.getCenter(bike.getHitchPos()).y;
	tcube.rotation.z = bike.trailer.theta;

	models[2].position.copy(bike.trailer.getCenter(bike.getHitchPos()));
	models[2].rotation.y = bike.trailer.theta - Math.PI/2;

	ttcube.position.x = bike.trailer.trailer2.getCenter(bike.trailer.getHitchPos(bike.getHitchPos())).x;
	ttcube.position.y = bike.trailer.trailer2.getCenter(bike.trailer.getHitchPos(bike.getHitchPos())).y;
	ttcube.rotation.z = bike.trailer.trailer2.theta;

	models[3].position.copy(bike.trailer.trailer2.getCenter(bike.trailer.getHitchPos(bike.getHitchPos())));
	models[3].rotation.y = bike.trailer.trailer2.theta - Math.PI/2;

	t += deltaT;

	//gridHelper.rotation.x += 0.01;	
	renderer.render( scene, camera );
}

animate();