canvcreate("", 500, 500);
canv.width = window.innerWidth;
canv.height = window.innerHeight;
window.onresize = function () {
	canv.width = window.innerWidth;
	canv.height = window.innerHeight;
}

var startTime = new Date();
var deltaTime = 0;
var frame = 0;
var rFps = 0;

var frameCountForSample = 5;
var fps = 0;

var dt = 1;

function plus(a, b) {

}
function arrToObj(a) {
	return {
		x: a[0],
		y: a[1],
		z: a[2]
	};
}
function equal(a, b) {
	for (let i = 0; i < b.length; i++) {
		a[i] = b[i];
	}
}

var camera = new Camera3d({ x: 0, y: 300, z: -1800 });

function moveCamera(speed = 20) {
	if (input.keyboard.char == "w") {
		camera.position.x += camera.forward.x * speed;
		camera.position.y += camera.forward.y * speed;
		camera.position.z += camera.forward.z * speed;
	}
	if (input.keyboard.char == "a") {
		camera.position.x += -camera.right.x * speed;
		camera.position.y += -camera.right.y * speed;
		camera.position.z += -camera.right.z * speed;
	}
	if (input.keyboard.char == "s") {
		camera.position.x += -camera.forward.x * speed;
		camera.position.y += -camera.forward.y * speed;
		camera.position.z += -camera.forward.z * speed;
	}
	if (input.keyboard.char == "d") {
		camera.position.x += camera.right.x * speed;
		camera.position.y += camera.right.y * speed;
		camera.position.z += camera.right.z * speed;
	}
	if (input.keyboard.char == "r") {
		camera.position.x += camera.up.x * speed;
		camera.position.y += camera.up.y * speed;
		camera.position.z += camera.up.z * speed;
	}
	if (input.keyboard.char == "f") {
		camera.position.x += -camera.up.x * speed;
		camera.position.y += -camera.up.y * speed;
		camera.position.z += -camera.up.z * speed;
	}
}
function axisLines() {
	let vXPos1 = camera.ProjectToCanvas(arrToObj([-5, 0, 0]));
	let vXPos2 = camera.ProjectToCanvas(arrToObj([5, 0, 0]));

	d.line(vXPos1.x, vXPos1.y, vXPos2.x, vXPos2.y, inRgb(255, 0, 0, 0.5));

	let vYPos1 = camera.ProjectToCanvas(arrToObj([0, -5, 0]));
	let vYPos2 = camera.ProjectToCanvas(arrToObj([0, 5, 0]));

	d.line(vYPos1.x, vYPos1.y, vYPos2.x, vYPos2.y, inRgb(0, 255, 0, 0.5));

	let vZPos1 = camera.ProjectToCanvas(arrToObj([0, 0, -5]));
	let vZPos2 = camera.ProjectToCanvas(arrToObj([0, 0, 5]));

	d.line(vZPos1.x, vZPos1.y, vZPos2.x, vZPos2.y, inRgb(0, 0, 255, 0.5));
}
function sortArr(arr, f) {
	let newArray = [];
	equal(newArray, arr);
	let i = 0;

	let state = 1;
	while (i < arr.length - 1) {
		if (f(newArray[i], newArray[i + 1])) {
			let e = newArray[i];

			newArray[i] = newArray[i + 1];
			newArray[i + 1] = e;

			i = 0;
			continue;
		}
		i++;
	}
	return newArray;
}

class Particle {
	constructor(StartPosition, StartVelocity, Mass, Radius, Color = inRgb(Math.random() * 255, 200, 200)) {
		this.index = particles.length;

		this.position = StartPosition;
		this.velocity = StartVelocity;

		this.color = Color;
		this.radius = Radius;
		this.mass = Mass;
	}
	update() {
		this.position[0] += this.velocity[0] * dt;
		this.position[1] += this.velocity[1] * dt;
		this.position[2] += this.velocity[2] * dt;

	}
	attractTo(nParticle) {
		let delta = [
			nParticle.position[0] - this.position[0],
			nParticle.position[1] - this.position[1],
			nParticle.position[2] - this.position[2]
		];
		let magn = math.magnitude(delta);
		if (magn < this.radius + nParticle.radius) return;

		this.velocity[0] += (delta[0] / magn) * (nParticle.mass / Math.pow(magn, 2)) * dt;
		this.velocity[1] += (delta[1] / magn) * (nParticle.mass / Math.pow(magn, 2)) * dt;
		this.velocity[2] += (delta[2] / magn) * (nParticle.mass / Math.pow(magn, 2)) * dt;
	}
	getCollisions() {
		let collisions = [];
		for (let i = 0; i < particles.length; i++) {
			if (i == this.index) continue;
			let magn = math.magnitude([this.position[0] - particles[i].position[0], this.position[1] - particles[i].position[1], this.position[2] - particles[i].position[2]]);
			if (magn < this.radius + particles[i].radius) {
				collisions.push(i);
			}
		}
		return collisions;
	}
	onCollide(nParticle) {
		let averageVelocity = [
			(this.velocity[0] * this.mass + nParticle.velocity[0] * nParticle.mass) / (this.mass + nParticle.mass),
			(this.velocity[1] * this.mass + nParticle.velocity[1] * nParticle.mass) / (this.mass + nParticle.mass),
			(this.velocity[2] * this.mass + nParticle.velocity[2] * nParticle.mass) / (this.mass + nParticle.mass)
		];
		equal(this.velocity, averageVelocity);
		equal(nParticle.velocity, averageVelocity);
	}
	draw() {
		let screenPos = camera.ProjectToCanvas(arrToObj(this.position));
		// let p1 = camera.ProjectToCanvas(arrToObj([this.position[0] + camera.right.x * this.radius, this.position[1] + camera.right.y * this.radius, this.position[2] + camera.right.z * this.radius]));
		let delta1 = [this.position[0] - camera.position.x, this.position[1] - camera.position.y, this.position[2] - camera.position.z];
		let delta2 = [this.position[0] + this.radius];

		let magn = camera.DistToCamera(arrToObj(this.position));

		let colorRGB = rgbaStringToArray(this.color);
		let nColor = inRgb(colorRGB[0], colorRGB[1], colorRGB[2]);

		d.circle(screenPos.x, screenPos.y, Math.max(this.radius * 300000 / magn/magn, 1), nColor, nColor);
	}
}
var particles = [];

particles.push(new Particle([0, 0, 0], [0, 0, 0], 100, 100));

let l = 40;
for (let i = 0; i < 400; i++) {
	let a = Math.random() * 2 * Math.PI;
	let dst = 1600 + Math.random() * 300;

	let v = -Math.sqrt(particles[0].mass / dst) * 1.1;
	let vel = [
		Math.cos(a + Math.PI / 2) * v,
		0,
		Math.sin(a + Math.PI / 2) * v,
	];
	particles.push(new Particle([
		Math.cos(a) * dst,
		(-1 + (Math.random()) * 2) * 50,
		Math.sin(a) * dst,
	], vel, 10, 3));
}

var replay = new Record();
replay.recordedData.push({
	DrawFunc: (position, c) => {
		for (let i = 0; i < position.length; i++) {
			let screenPos = camera.ProjectToCanvas(arrToObj(position[i]));

			let magn = camera.DistToCamera(arrToObj(position[i]));
			// magn = Math.pow(magn, 1 / 1.01);

			let colorRGB = rgbaStringToArray(position[i][4]);
			let nColor = inRgb(colorRGB[0], colorRGB[1], colorRGB[2]);

			d.circle(screenPos.x, screenPos.y, Math.max(position[i][3] * 500 / magn, 1), nColor, nColor);
		}
	}, data: []
});

function render() {
	deltaTime = (new Date() - startTime);
	startTime = new Date();
	fps += 1000 / deltaTime;
	if (frame % frameCountForSample == 0) {
		rFps = fps / frameCountForSample;
		fps = 0;
	}
	moveCamera();

	if (input.keyboard.char == 'v') replay.Replay.isReplay = true;

	d.clear("black");
	for (let speed = 0; speed < 1; speed++) {
		for (let i = 0; i < particles.length; i++) {
			for (let j = 0; j < particles.length; j++) {
				if (i == j) continue;
				particles[i].attractTo(particles[j]);
			}
			let collisions = particles[i].getCollisions();
			for (let j = 0; j < collisions.length; j++) {
				particles[i].onCollide(particles[collisions[j]]);
			}
		}
		// particles = sortArr(particles, (a, b) => { return camera.DistToCamera(arrToObj(a.position)) < camera.DistToCamera(arrToObj(b.position)) });
		replay.recordedData[0].data[frame] = [];
		for (let i = 0; i < particles.length; i++) {
			particles[i].update();

			replay.recordedData[0].data[frame].push([particles[i].position[0], particles[i].position[1], particles[i].position[2], particles[i].radius, particles[i].color]);
		}
	}

	for (let i = 0; i < particles.length; i++) {
		particles[i].draw();
	}


	axisLines();


	d.txt(Math.round(rFps), 1, 16, "", "white");
	frame++;
	if (!replay.Replay.isReplay)
		requestAnimationFrame(render);
	else
		requestAnimationFrame(renderReplay);
};
requestAnimationFrame(render);

function renderReplay() {
	moveCamera();
	replay.Render();
	if (input.keyboard.char == 'v') replay.Replay.isReplay = false;
	if (!replay.Replay.isReplay)
		requestAnimationFrame(render);
	else
		requestAnimationFrame(renderReplay);
}
