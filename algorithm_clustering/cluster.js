var canvas = document.getElementById("canvasCluster");
var ctx = canvas.getContext("2d");
var coordsPoint = [];
var coordsPointCluster = [];


function createCanvas(){
  canvas.removeEventListener("mousedown", pushPointListener);
  canvas.removeEventListener("mousedown", pushPointClusterListener);
  coordsPoint = [];
  coordsPointCluster = [];

  canvas.width = window.innerWidth*0.58;
  canvas.height = window.innerHeight*0.6;
  ctx.fillStyle = "rgba(211, 211, 211, 0.3)";
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function pushPointListener(e) {
  var Point = {
    x: e.pageX - e.target.offsetLeft,
    y: e.pageY - e.target.offsetTop 
  };
  coordsPoint.push(Point);
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  ctx.fillStyle = "rgb(128,128,128, 0.9)";
  ctx.fill();
} 
function pushPointClusterListener(e) {
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  var color = '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase();
  ctx.fillStyle = color;
  ctx.fill();
  var Point = {
    x: e.pageX - e.target.offsetLeft,
    y: e.pageY - e.target.offsetTop,
    color: color,
    neigbourPoints: []
  };
  coordsPointCluster.push(Point);
} 

function pushPoint(){
  canvas.removeEventListener("mousedown", pushPointClusterListener);
  canvas.addEventListener("mousedown", pushPointListener);
}
function pushPointCluster(){
  canvas.removeEventListener("mousedown", pushPointListener);
  canvas.addEventListener("mousedown", pushPointClusterListener);
}

function kMedium(){
  canvas.removeEventListener("mousedown", pushPointListener);
  canvas.removeEventListener("mousedown", pushPointClusterListener);
  minStroke();
  for (let i = 0; i < 10; i++) {
    setTimeout(function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth*0.58;
      canvas.height = window.innerHeight*0.6;
      ctx.fillStyle = "rgba(211, 211, 211, 0.3)";
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 5;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
      drawPoint();
      replacePointCluster();
      minStroke();
    }, 2000);
  }
}

function minStroke(){
  for (let i = 0; i < coordsPointCluster.length; i++) {
    coordsPointCluster[i].neigbourPoints = [];
  }
  for (let i = 0; i < coordsPoint.length; i++) {
    var minPoint = {
      x: 0,
      y: 0,
      color: "black",
      index: 0
    };
    var minLen = 999999;
    for (let j = 0; j < coordsPointCluster.length; j++) {
      let len = Math.sqrt(Math.pow((coordsPoint[i].x - coordsPointCluster[j].x), 2) + Math.pow((coordsPoint[i].y - coordsPointCluster[j].y), 2));
      if (len < minLen) {
        minLen = len;
        minPoint.x = coordsPointCluster[j].x, minPoint.y = coordsPointCluster[j].y,
        minPoint.color = coordsPointCluster[j].color, minPoint.index = j;
      }
    };
    let Point = {
      x: coordsPoint[i].x,
      y: coordsPoint[i].y
    }
    coordsPointCluster[minPoint.index].neigbourPoints.push(Point);
    ctx.beginPath();
    ctx.moveTo(coordsPoint[i].x, coordsPoint[i].y);
    ctx.lineTo(minPoint.x, minPoint.y);
    ctx.strokeStyle = minPoint.color; 
    ctx.lineWidth = "2"; 
    ctx.stroke(); 
  };
  console.log(coordsPointCluster);
}
function replacePointCluster(){
  for (let i = 0; i < coordsPointCluster.length; i++) {
    var sumX = 0, sumY = 0;
    for (let j = 0; j < coordsPointCluster[i].neigbourPoints.length; j++) {
      sumX += coordsPointCluster[i].neigbourPoints[j].x;
      sumY += coordsPointCluster[i].neigbourPoints[j].y;
    }
    coordsPointCluster[i].x = sumX / coordsPointCluster[i].neigbourPoints.length;
    coordsPointCluster[i].y = sumY / coordsPointCluster[i].neigbourPoints.length;
    ctx.beginPath();
    ctx.arc(coordsPointCluster[i].x , coordsPointCluster[i].y, 8, 0, Math.PI*2);
    ctx.fillStyle = coordsPointCluster[i].color;
    ctx.fill();
  }
}
function drawPoint(){
  for (let i = 0; i < coordsPoint.length; i++) {
    ctx.beginPath();
    ctx.arc(coordsPoint[i].x, coordsPoint[i].y, 8, 0, Math.PI*2);
    ctx.fillStyle = "rgb(128,128,128, 0.9)";
    ctx.fill();
  }
}

