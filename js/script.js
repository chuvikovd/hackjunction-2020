var ww = window.innerWidth;
var wh = window.innerHeight;
var isMobile = ww < 500;

function Tunnel() {
  this.init();
  this.createMesh();

  this.handleEvents();

  window.requestAnimationFrame(this.render.bind(this));
}

Tunnel.prototype.init = function() {

  this.speed = 1;
  this.prevTime = 0;

  this.mouse = {
    position: new THREE.Vector2(ww * 0.5, wh * 0.7),
    ratio: new THREE.Vector2(0, 0),
    target: new THREE.Vector2(ww * 0.5, wh * 0.7)
  };

  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#scene")
  });
  this.renderer.setSize(ww, wh);

  this.camera = new THREE.PerspectiveCamera(15, ww / wh, 0.01, 100);
  this.camera.rotation.y = Math.PI;
  this.camera.position.z = 0.35;

  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(0x000d25,0.05,1.6);

  var light = new THREE.HemisphereLight( 0xe9eff2, 0x01010f, 1 );
  this.scene.add( light );

  this.addParticle();
};

Tunnel.prototype.addParticle = function() {
  this.particles = [];
  // for(var i = 0; i < (isMobile?5:10); i++){
  //   this.particles.push(new Particle(this.scene));
  // }
};

Tunnel.prototype.createMesh = function() {
  var points = [];
  var i = 0;
  var geometry = new THREE.Geometry();
  
  this.scene.remove(this.tubeMesh)

  for (i = 0; i < 5; i += 1) {
    points.push(new THREE.Vector3(0, 0, 2.5 * (i / 4)));
  }
  points[4].y = -0.06;

  this.curve = new THREE.CatmullRomCurve3(points);
  this.curve.type = "catmullrom";

  geometry = new THREE.Geometry();
  geometry.vertices = this.curve.getPoints(70);
  this.splineMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial());

  this.tubeMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    color:0xffffff
  });

  this.tubeGeometry = new THREE.TubeGeometry(this.curve, 70, 0.02, 30, false);
  this.tubeGeometry_o = this.tubeGeometry.clone();
  this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);

  this.scene.add(this.tubeMesh);

};

Tunnel.prototype.handleEvents = function() {
  window.addEventListener('resize', this.onResize.bind(this), false);
  
  document.body.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  document.body.addEventListener('touchmove', this.onMouseMove.bind(this), false);
};

Tunnel.prototype.onResize = function() {
  ww = window.innerWidth;
  wh = window.innerHeight;
  
  isMobile = ww < 500;

  this.camera.aspect = ww / wh;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(ww, wh);
};

Tunnel.prototype.onMouseMove = function(e) {
  if (e.type === "mousemove"){
    this.mouse.target.x = e.clientX;
    this.mouse.target.y = e.clientY;
  } else {
    this.mouse.target.x = e.touches[0].clientX;
    this.mouse.target.y = e.touches[0].clientY;
  }
};

Tunnel.prototype.updateCameraPosition = function() {
  
  this.mouse.position.x += (this.mouse.target.x - this.mouse.position.x);
  this.mouse.position.y += (this.mouse.target.y - this.mouse.position.y);

  this.mouse.ratio.x = (this.mouse.position.x / ww);
  this.mouse.ratio.y = (this.mouse.position.y / wh);

  this.camera.rotation.z = ((this.mouse.ratio.x) * 1 - 0.05);
  this.camera.rotation.y = Math.PI - (this.mouse.ratio.x * 0.3 - 0.15);

  this.camera.position.x = ((this.mouse.ratio.x) * 0.044);
  this.camera.position.y = ((this.mouse.ratio.y) * 0.044);

  const xmin = -0.008, xmax = -0.012, ymin = xmin, ymax = xmax
  if (this.camera.position.x > xmax) this.camera.position.x = xmax
  if (this.camera.position.x < xmin) this.camera.position.x = xmin
  if (this.camera.position.y > ymax) this.camera.position.y = ymax
  if (this.camera.position.y < ymin) this.camera.position.y = ymin
};

function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r*100)*0.01, Math.round(g*100)*0.01, Math.round(b*100)*0.01];
}


Tunnel.prototype.checkCollision = function() {
  for(var i = 0; i < this.particles.length; i++){
    const { radius, pos } = this.particles[i]
    if (
      Math.abs(this.camera.position.x - pos.x) < radius * 2 &&
      Math.abs(this.camera.position.y - pos.y) < radius * 2 &&
      Math.abs(this.camera.position.z - pos.z) < radius * 3        
    ) {
      this.particles.splice(i, 1);

      const [r, g, b] = hslToRgb(Math.random(), Math.max(0.8, Math.random()), Math.max(0.7, Math.random()))
      TweenMax.to(this.tubeMaterial.color, 0.6, {
        r,
        g,
        b
      });

      setTimeout(() => {
        TweenMax.to(this.tubeMaterial.color, 0.6, {
          r: 1,
          g: 1,
          b: 1
        });
      }, 500)
    }
  }
}

Tunnel.prototype.updateCurve = function() {
  var i = 0;
  var index = 0;
  var vertice_o = null;
  var vertice = null;
  for (i = 0; i < this.tubeGeometry.vertices.length; i += 1) {
    vertice_o = this.tubeGeometry_o.vertices[i];
    vertice = this.tubeGeometry.vertices[i];
    index = Math.floor(i / 30);
    vertice.x += ((vertice_o.x + this.splineMesh.geometry.vertices[index].x) - vertice.x) / 15;
    vertice.y += ((vertice_o.y + this.splineMesh.geometry.vertices[index].y) - vertice.y) / 15;
  }
  this.tubeGeometry.verticesNeedUpdate = true;

  this.curve.points[2].x = 0.6 * (1 - this.mouse.ratio.x) - 0.3;
  this.curve.points[3].x = 0;
  this.curve.points[4].x = 0.6 * (1 - this.mouse.ratio.x) - 0.3;

  this.curve.points[2].y = 0.6 * (1 - this.mouse.ratio.y) - 0.3;
  this.curve.points[3].y = 0;
  this.curve.points[4].y = 0.6 * (1 - this.mouse.ratio.y) - 0.3;

  this.splineMesh.geometry.verticesNeedUpdate = true;
  this.splineMesh.geometry.vertices = this.curve.getPoints(70);
};

let rot = 0
const incRot = (num) => {
  rot += num / 50
  if (rot > 1) rot -= 1

  return rot
}

Tunnel.prototype.render = function(time) {
  this.dataArray = window.dataArray
  if (window.analyser) {
    window.analyser.getByteFrequencyData(dataArray);

    this.lowerHalfArray = this.dataArray.slice(0, (dataArray.length/2) - 1);
    this.upperHalfArray = this.dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);
  
    this.overallMax = max(this.dataArray);
    this.overallAvg = avg(this.dataArray);
    this.lowerMax = max(this.lowerHalfArray);
    this.lowerAvg = avg(this.lowerHalfArray);
    this.upperMax = max(this.upperHalfArray);
    this.upperAvg = avg(this.upperHalfArray);
  
    this.lowerMaxFr = this.lowerMax / this.lowerHalfArray.length;
    this.lowerAvgFr = this.lowerAvg / this.lowerHalfArray.length;
    this.upperMaxFr = this.upperMax / this.upperHalfArray.length;
    this.upperAvgFr = this.upperAvg / this.upperHalfArray.length;  
  }

  this.updateCameraPosition();

  this.updateCurve();
  incRot(this.lowerAvgFr)
  for(var i = 0; i < this.particles.length; i++){
    this.particles[i].mesh.material.color.setHSL(rot, 0.8, 0.6);

    this.particles[i].update(this);
    if(this.particles[i].burst && this.particles[i].percent > 1){
      this.particles.splice(i, 1);
      i--;
    }
  }
  
  if (this.particles.length < 90 && this.overallMax > 100) {
    this.prevTime = time;
    for(var i = 0; i < Math.min(Math.round(this.overallMax - 100), 10); i++){
      this.particles.push(new Particle(this.scene, true, time));
    }
  }

  this.checkCollision()
  
  this.renderer.render(this.scene, this.camera);

  window.requestAnimationFrame(this.render.bind(this));
};

function Particle(scene, burst, time) {
  this.radius = Math.random()*0.002 + 0.0003;
  var geom = this.icosahedron;
  var random = Math.random();
  if(random > 0.9){
    geom = this.cube;
  } else if(random > 0.8){
    geom = this.sphere;
  }
  var range = 50;
  if(burst){
    this.color = new THREE.Color("hsl("+(time / 50)+",100%,60%)");
  } else {
    var offset = 180;
    this.color = new THREE.Color("hsl("+(Math.random()*range+offset)+",100%,80%)");
  }
  var mat = new THREE.MeshPhongMaterial({
    color: this.color,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.scale.set(this.radius, this.radius, this.radius);
  this.mesh.position.set(0,0,1.5);
  this.percent = burst ? 0.2 : Math.random();
  this.burst = burst ? true : false;
  this.offset = new THREE.Vector3((Math.random()-0.5)*0.025, (Math.random()-0.5)*0.025, 0);
  this.speed = Math.random()*0.001 + 0.0001;
  if (this.burst){
    this.speed += 0.001;
    this.mesh.scale.x *= 1.4;
    this.mesh.scale.y *= 1.4;
    this.mesh.scale.z *= 1.4;
  }
  this.rotate = new THREE.Vector3(-Math.random()*0.1+0.01,0,Math.random()*0.01);
  
  this.pos = new THREE.Vector3(0,0,0);
  scene.add(this.mesh);
}

Particle.prototype.cube = new THREE.BoxBufferGeometry(1, 1, 1);
Particle.prototype.sphere = new THREE.SphereBufferGeometry(1, 6, 6 );
Particle.prototype.icosahedron = new THREE.IcosahedronBufferGeometry(1,0);
Particle.prototype.update = function (tunnel) {
  
  this.percent += this.speed * (this.burst?1:tunnel.speed);
  
  this.pos = tunnel.curve.getPoint(1 - (this.percent%1)) .add(this.offset);
  this.mesh.position.x = this.pos.x;
  this.mesh.position.y = this.pos.y;
  this.mesh.position.z = this.pos.z;
  this.mesh.rotation.x += this.rotate.x;
  this.mesh.rotation.y += this.rotate.y;
  this.mesh.rotation.z += this.rotate.z;
};

function play(audio) {
  var context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  window.analyser = context.createAnalyser();
  src.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 512;
  var bufferLength = analyser.frequencyBinCount;
  window.dataArray = new Uint8Array(bufferLength);
}

function fractionate(val, minVal, maxVal) {
  return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
  var fr = fractionate(val, minVal, maxVal);
  var delta = outMax - outMin;
  return outMin + (fr * delta);
}

function avg(arr){
  var total = arr.reduce(function(sum, b) { return sum + b; });
  return (total / arr.length);
}

function max(arr){
  return arr.reduce(function(a, b){ return Math.max(a, b); })
}

window.onload = function() {
  window.tunnel = new Tunnel();

  var audio = document.getElementById("audio");
  var playBtn = document.getElementById("play");
  var file = document.getElementById("file");

  file.onchange = function () {
    const files = this.files;

    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    play(audio)
  };

  playBtn.addEventListener('click', function(event) {
    event.preventDefault()

    audio.play();
    play(audio)
  })
};