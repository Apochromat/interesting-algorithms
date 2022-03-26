var canvas = document.getElementById("canvasCluster");
var ctx = canvas.getContext("2d");
var coordsPoint = [];
var coordsClusterKMeans = [];
var coordsClusterHier = [];
var maxLen = 250;
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

function delay(delayInms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}
function clearCanvas(){
  canvas.removeEventListener("mousedown", pushPointListener);
  coordsPoint = [];
  coordsClusterKMeans = [];
  coordsClusterHier = [];
  fiilCanvas();
}
function clearStroke(){
  coordsClusterKMeans = [];
  coordsClusterHier = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fiilCanvas();
  drawPoint();
}
function fiilCanvas() {
  canvas.width = window.innerWidth*0.56;
  canvas.height = window.innerHeight*0.6;
  ctx.fillStyle = "rgba(211, 211, 211, 0)";
  ctx.strokeStyle = "whitesmoke";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}
function drawPoint(){
  for (let i = 0; i < coordsPoint.length; i++) {
    ctx.beginPath();
    ctx.arc(coordsPoint[i].x, coordsPoint[i].y, 8, 0, Math.PI*2);
    ctx.fillStyle = "whitesmoke";
    ctx.fill();
  }
}
function pushPointListener(e) {
  var Point = {
    x: e.pageX - e.target.offsetLeft,
    y: e.pageY - e.target.offsetTop
  };
  coordsPoint.push(Point);
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  ctx.fillStyle = "whitesmoke";
  ctx.fill();
} 
function pushPoint(){
  canvas.addEventListener("mousedown", pushPointListener);
}

async function kMedium(){
  if (coordsPoint.length == 0) {
    alert("Обозначьте вершину");
    return 0;
  }
  if (coordsPoint.length < numCenter) {
    alert("Кол-во вершин меньше кол-ва центроидов");
    return 0;
  }
  canvas.removeEventListener("mousedown", pushPointListener);
  clearStroke();
  findCenter();
  minStroke();
  while (true){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fiilCanvas();
    drawPoint();
    let flag = false;
    if(!replacePointCluster(flag)){
      minStroke();
      break;
    }
    minStroke();
    await delay(900);  
  }
}
//Старая и сложная версия нахождения центроидов
// function findCenter() {
//   let Point = {
//     x: 0,
//     y: 0,
//     index: 0,
//     color: "blue"
//   };
//   let curI = Math.floor(Math.random()*(coordsPoint.length));
//   Point.x = coordsPoint[curI].x, Point.y = coordsPoint[curI].y, Point.index = curI; 
//   coordsClusterKMeans.push(Point);
//   for (let i = 1; i < numCenter; i++) {

//     let maxPoint = {
//       x: 0,
//       y: 0,
//       index: 0,
//       color: "blue"
//     };
//     let maxPointer = -1, pointer;
//     let maxLenForCenter = []
//     maxLenForCenter.length = coordsClusterKMeans.length;
//     for (let index = 0; index < maxLenForCenter.length; index++) maxLenForCenter[index] = -1;

//     for (let j = 0; j < coordsPoint.length; j++) {
//       let lenForCenter = []
//       lenForCenter.length = coordsClusterKMeans.length;
//       for (let index = 0; index < maxLenForCenter.length; index++) lenForCenter[index] = -1;
      
//       let flag = true;
//       for (let k = 0; k < coordsClusterKMeans.length; k++) 
//         if(coordsClusterKMeans[k].index == j) flag = false;
        
      
//       if(flag)
//         for (let k = 0; k < coordsClusterKMeans.length; k++) 
//             lenForCenter[k] = Math.sqrt(Math.pow((coordsClusterKMeans[k].x - coordsPoint[j].x), 2) + Math.pow((coordsClusterKMeans[k].y - coordsPoint[j].y), 2));
        
//         pointer = 0;
//         for (let k = 0; k < lenForCenter.length; k++){
//           if (lenForCenter[k] > maxLenForCenter[k]) 
//             pointer++;
//           if (lenForCenter[k] <= maxLen) {
//             pointer -= 10;
//           }
//         }
//           console.log(pointer);  
//         if (maxPointer <= pointer) {
//           maxLenForCenter = lenForCenter;
          
//           maxPointer = pointer;
//           maxPoint.x = coordsPoint[j].x, maxPoint.y = coordsPoint[j].y, maxPoint.index = j, maxPoint.color = '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase();
//         }
//       }
//     coordsClusterKMeans.push(maxPoint);
//   }
//   console.log("coords");
//   console.log(coordsClusterKMeans);
// }
function findCenter() {
  let step =  Math.floor(coordsPoint.length/numCenter);
  for (let i = 0, curInd = 0; i < numCenter; i++, curInd += step) {
    Point = {
      x: 0,
      y: 0,
      index: 0,
      color: "black"
    };
    Point.x = coordsPoint[curInd].x;
    Point.y = coordsPoint[curInd].y;
    Point.index = curInd;
    Point.color = '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase();
    coordsClusterKMeans.push(Point);
  }
}
function minStroke(){
  for (let i = 0; i < coordsClusterKMeans.length; i++) 
    coordsClusterKMeans[i].neigbourPoints = [];
  
  for (let i = 0; i < coordsPoint.length; i++) {
    var minPoint = {
      x: 0,
      y: 0,
      color: "black",
      index: 0
    };
    var minLen = 999999;
    for (let j = 0; j < coordsClusterKMeans.length; j++) {
      let len = Math.sqrt(Math.pow((coordsPoint[i].x - coordsClusterKMeans[j].x), 2) + Math.pow((coordsPoint[i].y - coordsClusterKMeans[j].y), 2));
      if (len < minLen) {
        minLen = len;
        minPoint.x = coordsClusterKMeans[j].x, minPoint.y = coordsClusterKMeans[j].y
        minPoint.color = coordsClusterKMeans[j].color, minPoint.index = j;
        }
      }
    let Point = {
      x: coordsPoint[i].x,
      y: coordsPoint[i].y
    }
    coordsClusterKMeans[minPoint.index].neigbourPoints.push(Point);
    ctx.beginPath();
    ctx.moveTo(coordsPoint[i].x, coordsPoint[i].y);
    ctx.lineTo(minPoint.x, minPoint.y);
    ctx.strokeStyle = "rgb(13, 92, 145)"; 
    ctx.lineWidth = "4"; 
    ctx.stroke(); 
  };
}
function replacePointCluster(flag){
  for (let i = 0; i < coordsClusterKMeans.length; i++) {
    var sumX = 0, sumY = 0;
    for (let j = 0; j < coordsClusterKMeans[i].neigbourPoints.length; j++) {
      sumX += coordsClusterKMeans[i].neigbourPoints[j].x;
      sumY += coordsClusterKMeans[i].neigbourPoints[j].y;
    }
    if (coordsClusterKMeans[i].x != sumX / coordsClusterKMeans[i].neigbourPoints.length || coordsClusterKMeans[i].y != sumY / coordsClusterKMeans[i].neigbourPoints.length) {
      flag = true;
    }
    coordsClusterKMeans[i].x = sumX / coordsClusterKMeans[i].neigbourPoints.length;
    coordsClusterKMeans[i].y = sumY / coordsClusterKMeans[i].neigbourPoints.length;
  }
  return flag;
}

async function hierarchical() {
  if (coordsPoint.length == 0) {
    alert("Обозначьте вершину");
    return 0;
  }
  canvas.removeEventListener("mousedown", pushPointListener);
  clearStroke();
  for (let i = 0; i < coordsPoint.length; i++){
    Point = {
      x: coordsPoint[i].x,
      y: coordsPoint[i].y,
      index: i,
      neigbourPoints: [i], 
      nearCluster: 0
    };
     coordsClusterHier.push(Point);
  }
  while (true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fiilCanvas();
    drawPoint();
    findNearCluster();
    let flag = false;
    if(!updateClusters(flag)){
      drawStroke();
      break;
    }
    drawStroke();
    await delay(500);  
    console.log("coords");
    console.log(coordsClusterHier);
  }
}
function findNearCluster() {
  for (let i = 0; i < coordsClusterHier.length; i++){ 
    var minLen = 999999;
    for (let j = 0; j < coordsClusterHier.length; j++){ 
      if (i != j) {
        let len = Math.sqrt(Math.pow((coordsClusterHier[i].x - coordsClusterHier[j].x), 2) + Math.pow((coordsClusterHier[i].y -coordsClusterHier[j].y), 2));
        if (len < minLen && len < maxLen) {
          minLen = len;
          coordsClusterHier[i].nearCluster = j;
        }
      }
    }
  }
}
function updateClusters(flag) {
  for (let i = 0; i < coordsClusterHier.length; i++) 
    for (let j = 0; j < coordsClusterHier.length; j++) 
      if (i != j && coordsClusterHier[i] != 0 && coordsClusterHier[j] != 0) 
        if (coordsClusterHier[i].nearCluster == j && coordsClusterHier[j].nearCluster == i){
          mergeCluster(i, j);
          flag = true;
        }         
  temp = [];
  for (let i = 0; i < coordsClusterHier.length; i++) 
    if(coordsClusterHier[i] != 0) temp.push(coordsClusterHier[i]);
  coordsClusterHier = temp;
  return flag;
} 
function mergeCluster(i, j) {
for (let k = 0; k < coordsClusterHier[j].neigbourPoints.length; k++) 
  coordsClusterHier[i].neigbourPoints.push(coordsClusterHier[j].neigbourPoints[k])
  coordsClusterHier[j] = 0;
  var sumX = 0, sumY = 0;
  for (let k = 0; k < coordsClusterHier[i].neigbourPoints.length; k++) {
    sumX += coordsPoint[coordsClusterHier[i].neigbourPoints[k]].x;
    sumY += coordsPoint[coordsClusterHier[i].neigbourPoints[k]].y;
  }
  coordsClusterHier[i].x = sumX / coordsClusterHier[i].neigbourPoints.length;
  coordsClusterHier[i].y = sumY / coordsClusterHier[i].neigbourPoints.length;
}
function drawStroke() {
  for (let i = 0; i < coordsClusterHier.length; i++) {
    for (let k = 0; k < coordsClusterHier[i].neigbourPoints.length; k++) {
      ctx.beginPath();
      ctx.moveTo(coordsClusterHier[i].x, coordsClusterHier[i].y);
      ctx.lineTo(coordsPoint[coordsClusterHier[i].neigbourPoints[k]].x, coordsPoint[coordsClusterHier[i].neigbourPoints[k]].y);
      ctx.strokeStyle = "white"; 
      ctx.lineWidth = "1.5"; 
      ctx.stroke(); 
    }
  }
}

async function compareClusterizations() {
  if (coordsPoint.length == 0) {
    alert("Обозначьте вершину");
    return 0;
  }
  if (coordsPoint.length < numCenter) {
    alert("Кол-во вершин меньше кол-ва центроидов");
    return 0;
  }
  canvas.removeEventListener("mousedown", pushPointListener);
  clearStroke();
  findCenter();
  minStroke();
  for (let i = 0; i < coordsPoint.length; i++){
    Point = {
      x: coordsPoint[i].x,
      y: coordsPoint[i].y,
      index: i,
      neigbourPoints: [i], 
      nearCluster: 0
    };
     coordsClusterHier.push(Point);
  }
  while (true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fiilCanvas();
    drawPoint();
    findNearCluster();
    let flag1 = false;
    flag1 = updateClusters(flag1);
    let flag2 = false;
    flag2 = replacePointCluster(flag2);
    minStroke();
    drawStroke();
    if (flag1 == false && flag2 == false) break;
    await delay(500);  
  }
}