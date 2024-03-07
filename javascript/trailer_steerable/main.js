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
camera.position.set(0, -50, 50);
camera.lookAt(0, 0, 0);
//camera.rotateX(Math.PI);

// Add some coordinate axes. R = X, green = Y, blue = Z.
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

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

// Load the truck - lead vehicle.
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

// Function to load i-th instance of a trailer.
function LoadTrailer(i){
	loader.load('./Models/Trailer_15ft.glb', function (gltf) {
		const model = gltf.scene;
		model.position.set(0, 0, 0);
		model.rotation.x = Math.PI/2;
		const sc = 0.01;
		model.scale.set(sc, sc, sc);
		models[i+2] = model;
		scene.add(model);
		}
		, function(xhr){
			console.log((xhr.loaded/xhr.total * 100) + "% loaded")
		}, function(error){
			console.log('An error occurred')
		}
	);
}

// Start with two trailers.
LoadTrailer(0);
LoadTrailer(1);

// Grid helper... useful for debugging velocity/scale issues.
//const size = 35;
//const divisions = 30;
//const gridHelper = new THREE.GridHelper( size, divisions );
//gridHelper.position.set(0, 0, 0);
//gridHelper.rotation.x = Math.PI/2;

// Simulation constants.
const deltaT = .1;
var steer = 20*Math.PI/180.;
var t = 0.0;

// // Allows for camera controls.
// const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set( 0, 0.5, 0 );
// controls.update();
// controls.minPolarAngle = Math.PI/4-0.001; //Math.PI/2;
// controls.maxPolarAngle = Math.PI/4+0.001; // Math.PI - Math.PI/6;
// controls.minAzimuthAngle = 0;
// controls.maxAzimuthAngle = 0;
// controls.enablePan = false;
// controls.enableDamping = true;

// Handle resizing window.
window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};

// Button GUI controls.
var addTrailerButton = document.getElementById("addTrailer");
addTrailerButton.addEventListener("click", addTrailer, false);

var removeTrailerButton = document.getElementById("removeTrailer");
removeTrailerButton.addEventListener("click", removeTrailer, false);

var steering = null
var wheel = document.getElementById("wheel")
const updateSteering = (mouseX) => {
  steering = -(1 - (mouseX/window.innerWidth)*2);
  steer = -.5*steering*Math.PI/2;
  
  wheel.style.display = "block";
  wheel.style.transform = `rotate(${steering*90}deg)`;
}
document.addEventListener("pointerdown",(e)=>updateSteering(e.clientX))
document.addEventListener("pointermove",(e)=>{
	//console.log(`clientX = ${e.clientX}`)
	//console.log(`movementX = ${e.movementX}`)
	if(steering != null) updateSteering(e.clientX)
})
document.addEventListener("pointerup",()=>{
	steering = null
  	wheel.style.display = "none"
})

// var steerMax = 45*(Math.PI/180)
// const mouseMove = (mouseMoveX) => {
// 	if(isMouseDown) {
// 		steer -= 0.0005*mouseMoveX
// 		steer = Math.sign(steer)*Math.min(Math.abs(steer), steerMax)
// 	}
// 	//wheel.style.display = "block";
// 	//wheel.style.transform = `rotate(${steer}rad)`;
// }

var isMouseDown = false
var lastMouse = 0

// document.addEventListener("pointerdown",(e)=>{ 
// 	isMouseDown = true; /*lastMouse = e.clientX*/ 
// })
// document.addEventListener("pointermove", (e)=>mouseMove(e.movementX))
// document.addEventListener("pointerup", (e)=>{ isMouseDown = false})

//document.addEventListener("touchstart", (e)=> {console.log('Touchstart!')})
//document.addEventListener("touchend", (e)=> {console.log('Touchend!')})
//document.addEventListener("touchmove", (e)=> {console.log('Touchmove!')})

document.addEventListener("touchstart",(e)=>{
	console.log('Touchstart!'); 
	isMouseDown = true; /*lastMouse = e.clientX*/ 
})
var previousTouch;
document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];

    if (previousTouch) {
        // be aware that these only store the movement of the first touch in the touches array
        e.movementX = 10*(touch.pageX - previousTouch.pageX);
        //e.movementY = touch.pageY - previousTouch.pageY;

        mouseMove(e.movementX);
    };

    previousTouch = touch;
});
document.addEventListener("touchend", (e)=>{ isMouseDown = false; previousTouch = null})

var turnDir = 1;
function addTrailer(event) {
	var len = trailerChain.length;
	LoadTrailer(len - 1);
	var theta = trailerChain[len - 1].theta;
	trailerChain.push(new Trailer(3, 2, 5, theta+turnDir*Math.PI/2));
	turnDir *= -1;
}

function removeTrailer(event){
	if(trailerChain.length > 1){
		scene.remove(models.pop());
		trailerChain.pop();
	}
}

function steerLeft(event){
	steer += 5*Math.PI/180;
	steer = Math.min(steer, 45*Math.PI/180);
}

function steerRight(event){
	steer -= 5*Math.PI/180;
	steer = Math.max(steer, -45*Math.PI/180);
}


///////////////////////////////////////////////////////////////////
// Physical model of kinematic bicyle and kinematic trailer

// This holds a copy of current entity data
class EntityData {
	constructor(theta, position){
		this.theta = theta;
		this.position = position;
	}
}

// Classic Kinematic Bicycle Model
class BicycleModel {
	constructor(x, y, z, theta, steer, v, lf, lr, hitchDist) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.hitchDist = hitchDist; 
		this.theta = theta;
		this.beta = 0;
		this.steer = steer;
		this.v = v;
		this.lf = lf;
		this.lr = lr; 
		this.hitchPos = null;
		this.hitchVel = null;
		this.omega = 0;
	}

	update(deltaT, steer){
		// Update steer
		this.steer = steer;

		// Geometric factors 
		this.beta = Math.atan(this.lr * Math.tan(this.steer)/(this.lf+this.lr))
		this.omega = (this.v/(this.lf + this.lr))*Math.tan(steer)*Math.cos(this.beta);  
		
		this.x = this.x + this.v*(deltaT)*Math.cos(this.theta + this.beta);
		this.y = this.y + this.v*(deltaT)*Math.sin(this.theta + this.beta);
		this.theta = this.theta + (deltaT)*this.omega;

		this.hitchPos = this.getHitchPos();
		this.hitchVel = this.getHitchVel(deltaT);
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
		var vX = -this.omega*this.hitchDist*Math.sin(this.theta + Math.PI)+this.v*Math.cos(this.theta + this.beta);
		var vY = this.omega*this.hitchDist*Math.cos(this.theta + Math.PI)+this.v*Math.sin(this.theta + this.beta);
		var hitchVel = new THREE.Vector2(vX, vY);

		return hitchVel;
	}

	getPos(){
		var pos = new THREE.Vector3;
		pos.set(this.x, this.y, 0);

		return pos;
	}
}

// Kinematic unicycle (Kinematic Trailer)
class Trailer{
	constructor(distToAxle, distToCenter, distToHitch, theta){
		this.distToAxle = distToAxle;
		this.distToCenter = distToCenter;
		this.distToHitch = distToHitch;
		this.theta = theta;
		this.center = null;
		this.hitchPos = null;
		this.hitchVel = null;
		this.omega = null;
	}

	update(deltaT, hitchPosParent, hitchVelParent){
		// World orientation:
		var hitchVelX = hitchVelParent.x;
		var hitchVelY = hitchVelParent.y;
		var hitchPosX = hitchPosParent.x;
		var hitchPosY = hitchPosParent.y;

		const hitchVel = Math.sqrt(hitchVelX*hitchVelX + hitchVelY*hitchVelY);
	
		this.omega = 0;
		if(hitchVel != 0){
			const invHitchVel = 1.0/hitchVel;
			const hitchAngleSign = Math.cos(this.theta)*hitchVelY - Math.sin(this.theta)*hitchVelX > 0 ? 1 : -1;
			const hitchVelAngle = hitchAngleSign*Math.acos(invHitchVel*(Math.cos(this.theta)*hitchVelX + 
				Math.sin(this.theta)*(hitchVelY)));
			const hitchVelPerpendicular = Math.sin(hitchVelAngle)*hitchVel;
			this.omega = hitchVelPerpendicular/this.distToAxle;
		}

		this.theta += deltaT*this.omega;

		this.center = this.calcCenter(hitchPosParent);
		this.hitchPos = this.calcHitchPos(hitchPosParent);
		this.hitchVel = this.calcHitchVel(deltaT, hitchVelParent);
	}

	// World origin of body coordinate frame.
	calcCenter(parentHitchPos){
		var cX = -this.distToCenter*Math.cos(this.theta) + parentHitchPos.x;
		var cY = -this.distToCenter*Math.sin(this.theta) + parentHitchPos.y;
		var center = new THREE.Vector3(cX, cY, 0);

		return center;
	}

	// World coordinate of the hitch. 
	calcHitchPos(parentHitchPos){
		var hX = parentHitchPos.x - this.distToHitch*Math.cos(this.theta);
		var hY = parentHitchPos.y - this.distToHitch*Math.sin(this.theta);
		var hitchPos = new THREE.Vector3(hX, hY, 0.);

		return hitchPos;
	}

	// World velocity of the hitch location (which is point of attachment for 
	// this trailer's child, if there is one.)
	calcHitchVel(deltaT, parentHitchVel){
		var vX = parentHitchVel.x + this.omega*this.distToHitch*Math.sin(this.theta);
		var vY = parentHitchVel.y - this.omega*this.distToHitch*Math.cos(this.theta);
		var hitchVel = new THREE.Vector2(vX, vY);

		return hitchVel;
	}

	getPos(){
		return this.center;
	}
}

/////////////////////////////////////////////////////////////////
// Steering input functions.
//
// Steer by Figure 8 pattern. Steers by a constant absulute angle,
// but changes the sign each time the lead vehicle y coordinate 
// becomes greater than yCenter
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
// Set up dynamic simulation
var steerInp = 0
const thetaStart = -0.125*Math.PI*0;
const trailer2 = new Trailer(3, 2, 5, -Math.PI/2);
const trailer = new Trailer(3, 2, 5, -Math.PI/2);
const bike = new BicycleModel(1.5, 10.5, 0, Math.PI/2, 0, 1.0, 2.0, 1.3, 2.9);
var trailerChain = [bike, trailer, trailer2]; 

const fig8Steer = new Fig8Steer(Math.PI/11.5, 10.5);
var prevY = 4.9;

// Update the dynamic models together.
function updateTrailers(deltaT, steer){
	// Update bicycle model.
	trailerChain.at(0).update(deltaT, steer);

	// Update children (trailers). (Must happen in order of
	// parent then child.)
	for(let i = 1; i < trailerChain.length; ++i){
			trailerChain.at(i).update(deltaT, 
				trailerChain.at(i-1).hitchPos, 
				trailerChain.at(i-1).hitchVel);
	}
}

///////////////////////////////////////////////////////////////////
// Main animation loop.

// These implement constant time steps across different
// devices, etc..
const fixedTimeStep = 1/60;
let accumulator = 0;
const clock = new THREE.Clock();

// The main workhorse.
function animate() {

	//console.log()
	const deltaTime = clock.getDelta();
	accumulator += deltaTime;

	// Accumlator only steps when sufficient time has passed.
	while(accumulator >= fixedTimeStep){
		console.log(`steer = ${steer}`)
		//var steer = fig8Steer.getSteer(bike.getPos().y, prevY);
		//prevY = bike.getPos().y;

		updateTrailers(deltaT, steer);

		// Check that loading is complete (completed in seperate thread).
		if(models.length == trailerChain.length + 1)
		{
			for(let i = 0; i < trailerChain.length; ++i){
				models[i+1].position.copy(trailerChain.at(i).getPos());
				models[i+1].rotation.y = trailerChain.at(i).theta - Math.PI/2;
			}
		}

		t += deltaT;
		accumulator -= fixedTimeStep;
	}
	renderer.render( scene, camera );

	if(isMouseDown == false)
	{
		var deltaS = 0.01
		steer -= Math.sign(steer)*deltaS
		//var wheel = document.getElementById("wheel")
		//wheel.style.display = "block";
		//wheel.style.transform = `rotate(${steer}rad)`;
	}

	wheel.style.display = "block";
	wheel.style.transform = `rotate(${-steer}rad)`;

	requestAnimationFrame( animate );
}

animate();