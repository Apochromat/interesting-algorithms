var canvas = document.getElementById("canvasCluster");
var ctx = canvas.getContext("2d");

function createCanvas(){
  canvas.removeEventListener("mousedown", pushPointListener);
  canvas.removeEventListener("mousedown", pushPointClusterListener);
  canvas.width = window.innerWidth*0.58;
  canvas.height = window.innerHeight*0.6;
  ctx.fillStyle = "rgba(211, 211, 211, 0.3)";
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  removePoint();
}

function pushPointListener(e) {
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  ctx.fillStyle = "rgb(128,128,128, 0.9)";
  ctx.fill();
} 
function pushPointClusterListener(e) {
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  ctx.fillStyle = '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase();
  ctx.fill();
} 

function pushPoint(){
  canvas.addEventListener("mousedown", pushPointListener);
}
function pushPointCluster(){
  canvas.addEventListener("mousedown", pushPointClusterListener);
}


