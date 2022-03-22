var canvas = document.getElementById("canvasCluster");
var ctx = canvas.getContext("2d");
var coordsPoint = [];
var coordsPointCluster = [];
var maxLen = 220;
var numCenter = 3;
document.getElementById("sliderNumCenter").onclick = function () {
  document.getElementById('lableNumCenter').innerHTML = this.value;
  numCenter = document.getElementById('lableNumCenter').innerText;
  // maxLen = 210-numCenter*10;
}
document.getElementById("sliderMaxLen").onclick = function () {
  document.getElementById('lableMaxLen').innerHTML = this.value;
  maxLen = document.getElementById('lableMaxLen').innerText;
}

function clearCanvas(){
  canvas.removeEventListener("mousedown", pushPointListener);
  coordsPoint = [];
  coordsPointCluster = [];
  fiilCanvas();
}
function clearStroke(){
  coordsPointCluster = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fiilCanvas();
  drawPoint();
}
function fiilCanvas() {
  canvas.width = window.innerWidth*0.56;
  canvas.height = window.innerHeight*0.6;
  ctx.fillStyle = "rgba(211, 211, 211, 0)";
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function pushPointListener(e) {
  var Point = {
    x: e.pageX - e.target.offsetLeft,
    y: e.pageY - e.target.offsetTop,
    nearPoint: 0 
  };
  coordsPoint.push(Point);
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  ctx.fillStyle = "rgb(128,128,128, 0.9)";
  ctx.fill();
} 

function pushPoint(){
  canvas.addEventListener("mousedown", pushPointListener);
}

function kMedium(){
  canvas.removeEventListener("mousedown", pushPointListener);
  if (coordsPoint.length == 0) {
    alert("Обозначьте вершину");
    return 0;
  }
  if (coordsPoint.length < numCenter) {
    alert("Кол-во вершин меньше кол-ва центроидов");
    return 0;
  }
  clearStroke();
  findCenter();
  minStroke();
  for (let i = 0; i < 5; i++) 
    setTimeout(function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fiilCanvas();
      drawPoint();
      replacePointCluster();
      minStroke();
    }, 2000);
}
function findCenter() {
  let Point = {
    x: 0,
    y: 0,
    index: 0,
    color: "blue"
  };
  let curI = Math.floor(Math.random()*(coordsPoint.length));
  Point.x = coordsPoint[curI].x, Point.y = coordsPoint[curI].y, Point.index = curI; 
  coordsPointCluster.push(Point);
  for (let i = 1; i < numCenter; i++) {

    let maxPoint = {
      x: 0,
      y: 0,
      index: 0,
      color: "blue"
    };
    let maxPointer = -1, pointer;
    let maxLenForCenter = []
    maxLenForCenter.length = coordsPointCluster.length;
    for (let index = 0; index < maxLenForCenter.length; index++) maxLenForCenter[index] = -1;

    for (let j = 0; j < coordsPoint.length; j++) {
      let lenForCenter = []
      lenForCenter.length = coordsPointCluster.length;
      for (let index = 0; index < maxLenForCenter.length; index++) lenForCenter[index] = -1;
      
      let flag = true;
      for (let k = 0; k < coordsPointCluster.length; k++) 
        if(coordsPointCluster[k].index == j) flag = false;
        
      
      if(flag)
        for (let k = 0; k < coordsPointCluster.length; k++) 
            lenForCenter[k] = Math.sqrt(Math.pow((coordsPointCluster[k].x - coordsPoint[j].x), 2) + Math.pow((coordsPointCluster[k].y - coordsPoint[j].y), 2));
        
        pointer = 0;
        for (let k = 0; k < lenForCenter.length; k++){
          if (lenForCenter[k] > maxLenForCenter[k]) 
            pointer++;
          if (lenForCenter[k] <= maxLen) {
            pointer -= 10;
          }
        }
          console.log(pointer);  
        if (maxPointer <= pointer) {
          maxLenForCenter = lenForCenter;
          
          maxPointer = pointer;
          maxPoint.x = coordsPoint[j].x, maxPoint.y = coordsPoint[j].y, maxPoint.index = j, maxPoint.color = '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase();
        }
      }
    coordsPointCluster.push(maxPoint);
  }
  console.log("coords");
  console.log(coordsPointCluster);
}

function minStroke(){
  for (let i = 0; i < coordsPointCluster.length; i++) 
    coordsPointCluster[i].neigbourPoints = [];
  
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
function hierarchical() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fiilCanvas();
  drawPoint();
  coordsPointCluster = [];
  for (let i = 0; i < coordsPoint.length; i++) 
    var minLen = 999999;
    for (let j = 0; j < coordsPoint.length; j++) 
      if (i != j) {
        let len = Math.sqrt(Math.pow((coordsPoint[i].x - coordsPoint[j].x), 2) + Math.pow((coordsPoint[i].y - coordsPoint[j].y), 2));
        if (len < minLen && len < maxLen) {
          minLen = len;
          coordsPoint[i].nearPoint = j;
        }
      }
  for (let i = 0; i < coordsPoint.length; i++) 
    for (let j = 0; j < coordsPoint.length; j++) 
      if (i != j) 
        if (coordsPoint[i].nearPoint == j && coordsPoint[j].nearPoint == i) {
          ctx.beginPath();
          ctx.moveTo(coordsPoint[i].x, coordsPoint[i].y);
          ctx.lineTo(coordsPoint[j].x, coordsPoint[j].y);
          ctx.strokeStyle = "black"; 
          ctx.lineWidth = "2"; 
          ctx.stroke(); 
          console.log(1);
        }
} 
