var 
  canvas = document.getElementById("canvasCluster"),
  ctx = canvas.getContext("2d"),
  coordsPoint = [],
  coordsClusterKMeans = [],
  coordsClusterHier = [],
  Ostov = [],
  lonelyCluster = [],
  numCenter = 3,
  colorsKMeans = ["rgb(13, 92, 145)", "rgb(177, 12, 237)", "rgb(12, 237, 211)", "rgb(5, 255, 47)", "rgb(12, 19, 237)", "rgb(233, 237, 12)","rgb(237, 147, 12)", "rgb(0, 150, 105)", "rgb(237, 12, 132)", "rgb(0, 150, 15)"],
  colorKMeans = "rgb(13, 92, 145)",
  colorHier = "white",
  colorOstov = "red";
  widthKMeans = "2";
  widthHier = "1";
  widthOstov = "1";
  
document.getElementById("sliderNumCenter").onclick = function () {
  document.getElementById('lableNumCenter').innerHTML = this.value;
  numCenter = document.getElementById('lableNumCenter').innerText;
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
  Graph = [];
  Ostov = [];
  fiilCanvas();
}
function clearStroke(){
  coordsClusterKMeans = [];
  coordsClusterHier = [];
  Graph = [];
  Ostov = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fiilCanvas();
  drawPoint();
}
function fiilCanvas() {
  canvas.width = window.innerWidth*0.58;
  canvas.height = window.innerHeight*0.8;
  ctx.fillStyle = "rgba(211, 211, 211, 0)";
  ctx.strokeStyle = "whitesmoke";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}
function drawPoint(){
  for (let i = 0; i < coordsPoint.length; i++) drawCircle(coordsPoint[i], 8, "whitesmoke");
}
function drawCircle(point, radius, color) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();  
}
function drawStroke(point1, point2, width, color) {
  ctx.beginPath();
  ctx.moveTo(point1.x, point1.y);
  ctx.lineTo(point2.x, point2.y);
  ctx.strokeStyle = color; 
  ctx.lineWidth = width; 
  ctx.stroke(); 
}
function pushPointListener(e) {
  var Point = {
    x: e.pageX - e.target.offsetLeft,
    y: e.pageY - e.target.offsetTop
  };
  coordsPoint.push(Point);
  drawCircle(Point, 8, "whitesmoke");
} 
function pushPoint(){
  canvas.addEventListener("mousedown", pushPointListener);
}
function findLenBeetwenPoints(p1, p2) {
  return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
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
  let flagCompare = false;
  clearStroke();
  findCentroids();
  findMinStroke(flagCompare);
  while (true){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fiilCanvas();
    let flag = false;
    if(!replaceCentroids(flag)){
      findMinStroke(flagCompare);
      break;
    }
    findMinStroke(flagCompare);
    await delay(900);  
  }
  
}
function findCentroids() {
  let Point = {
    x: 0,
    y: 0,
    index: 0,
    color: colorsKMeans[0]
  };

  // let maximus = 99999;
  // for (let i = 0; i < coordsPoint.length; i++) {
  //   let curMedLen = 0;
  //   for (let j = 0; j < coordsPoint.length; j++) {
  //     curMedLen += findLenBeetwenPoints(coordsPoint[i], coordsPoint[j]);
  //   }
  //   curMedLen /= coordsPoint.length;
  //   if (maximus > curMedLen) {
  //     curI = i;
  //     maximus = curMedLen;
  //   }
  // }


  let curI = Math.floor(Math.random()*(coordsPoint.length));
  Point.x = coordsPoint[curI].x, Point.y = coordsPoint[curI].y, Point.index = curI; 
  coordsClusterKMeans.push(Point);
  for (let i = 1; i < numCenter; i++) {

    let maxPoint = {
      x: 0,
      y: 0,
      index: 0,
      color: colorsKMeans[i]
    };
    let maxMedLen = -1;
    let maxLenForCenter = []
    maxLenForCenter.length = coordsClusterKMeans.length;
    for (let index = 0; index < maxLenForCenter.length; index++) maxLenForCenter[index] = -1;

    for (let j = 0; j < coordsPoint.length; j++) {
      let lenForCenter = []
      lenForCenter.length = coordsClusterKMeans.length;
      for (let index = 0; index < maxLenForCenter.length; index++) lenForCenter[index] = -1;
      
      let flag = true;
      for (let k = 0; k < coordsClusterKMeans.length; k++) 
        if(coordsClusterKMeans[k].index == j) flag = false;
        
      if(flag)
        for (let k = 0; k < coordsClusterKMeans.length; k++) 
          lenForCenter[k] = findLenBeetwenPoints(coordsClusterKMeans[k], coordsPoint[j]);
        
        let medLen = 0;
        for (let k = 0; k < lenForCenter.length; k++) 
          medLen += lenForCenter[k];
        medLen /= lenForCenter.length;

        if (maxMedLen < medLen) {
          maxLenForCenter = lenForCenter;
          maxMedLen = medLen;
          maxPoint.x = coordsPoint[j].x, maxPoint.y = coordsPoint[j].y, maxPoint.index = j;
        }
      }
    coordsClusterKMeans.push(maxPoint);
  }
}
function findMinStroke(flagCompare){
  for (let i = 0; i < coordsClusterKMeans.length; i++) 
    coordsClusterKMeans[i].neigbourPoints = [];
  
  for (let i = 0; i < coordsPoint.length; i++) {
    var minPoint = {
      x: 0,
      y: 0,
      index: 0,
      color: "black"
    };
    var minLen = 999999;
    for (let j = 0; j < coordsClusterKMeans.length; j++) 
      if (minLen > findLenBeetwenPoints(coordsPoint[i], coordsClusterKMeans[j])) {
        minLen = findLenBeetwenPoints(coordsPoint[i], coordsClusterKMeans[j]);
        minPoint.x = coordsClusterKMeans[j].x, minPoint.y = coordsClusterKMeans[j].y
        minPoint.color = coordsClusterKMeans[j].color, minPoint.index = j;
        }
    let Point = {
      x: coordsPoint[i].x,
      y: coordsPoint[i].y
    }
    coordsClusterKMeans[minPoint.index].neigbourPoints.push(Point);
    
    if (!flagCompare) {
      drawStroke(coordsPoint[i], minPoint, widthKMeans, minPoint.color);
      drawCircle(coordsPoint[i], 5, minPoint.color); 
    }
    else{
      drawCircle(coordsPoint[i], 10, minPoint.color);
    }
  };
  for (let i = 0; i < coordsClusterKMeans.length; i++) 
    if (coordsClusterKMeans[i].neigbourPoints.length == 1) {
      if (!flagCompare) drawCircle(coordsClusterKMeans[i].neigbourPoints[0], 8, coordsClusterKMeans[i].color); 
      else drawCircle(coordsClusterKMeans[i].neigbourPoints[0], 18, coordsClusterKMeans[i].color);    
    } 
}
function replaceCentroids(flag){
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
  if (coordsPoint.length < numCenter) {
    alert("Кол-во вершин меньше кол-ва центроидов");
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
      nearCluster: -1,
    };
     coordsClusterHier.push(Point);
  }
  while (coordsClusterHier.length > numCenter) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fiilCanvas();
    updateClusters();
    if(coordsClusterHier.length == numCenter){
      updateStroke();
      break;
    }
    updateStroke();
    await delay(100);  
  }
}
function updateClusters() {
  let minCluster1 = -1, minCluster2 = -1, minLen = 9999;
  for (let i = 0; i < coordsClusterHier.length-1; i++) 
    for (let j = i+1; j < coordsClusterHier.length; j++) 
      if (minLen >= findLenBeetwenPoints(coordsClusterHier[i], coordsClusterHier[j])){
        minCluster1 = i, minCluster2 = j;
        minLen = findLenBeetwenPoints(coordsClusterHier[i], coordsClusterHier[j]);
      }      
  mergeCluster(minCluster1, minCluster2);       
  temp = [];
  for (let i = 0; i < coordsClusterHier.length; i++) 
    if(coordsClusterHier[i] != 0) temp.push(coordsClusterHier[i]);
  coordsClusterHier = temp;
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
function updateStroke() {
  for (let i = 0; i < coordsClusterHier.length; i++) 
    for (let k = 0; k < coordsClusterHier[i].neigbourPoints.length; k++) {
      if (coordsClusterHier[i].neigbourPoints.length == 1) 
        drawCircle(coordsPoint[coordsClusterHier[i].neigbourPoints[k]], 4, colorHier);
      else{
        drawStroke(coordsClusterHier[i], coordsPoint[coordsClusterHier[i].neigbourPoints[k]], widthHier, colorHier);
        drawCircle(coordsPoint[coordsClusterHier[i].neigbourPoints[k]], 2, colorHier);
      }
    }
}

async function ostovClusterizations(){
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
  Ostov = findOstov();
  deleteMaxStroke();
  fiilCanvas();
  drawOstov();
}  
function findOstov() {
  var Graph = [];
  for (let i = 0; i < coordsPoint.length; i++) Graph[i] = [];

  for (let i = 0; i < coordsPoint.length; i++) 
    for (let j = 0; j < coordsPoint.length; j++)
      Graph[i][j] = findLenBeetwenPoints(coordsPoint[i], coordsPoint[j]);
  let numVer = coordsPoint.length, minDistance = 0;
  var Ostov = [];
  for (let i = 0; i < numVer; i++) 
      Ostov[i] = [];
  for (let i = 0; i < numVer; i++)
      for (let j = 0; j < numVer; j++) 
          Ostov[i][j] = 0;
  let visited = [];
  for (let i = 0; i < numVer; i++)
      visited[i] = false;
  visited[0] = true;

  for (let l = 0; l < numVer - 1; l++) {
    let min_i = -1, min_j = -1;
      for (let i = 0; i < numVer; i++)
          if (visited[i])
              for (let j = 0; j < numVer; j++)
                  if (!visited[j] && Graph[i][j] > 0 && (min_j == -1 || Graph[i][j] < Graph[min_j][min_i]))
                      min_j = i, min_i = j;
      minDistance += Graph[min_j][min_i];
      Ostov[min_j][min_i] = Graph[min_j][min_i];
      Ostov[min_i][min_j] = Graph[min_j][min_i];
      visited[min_i] = true;
  }
  return Ostov;
}  
function deleteMaxStroke() {
  lonelyCluster = [];
  let visited = []
  for (let i = 0; i < coordsPoint.length; i++) visited[i] = false;
  for (let k = 0; k < numCenter-1; k++) {
    let maxLen = -1, maxI = -1, maxJ = -1;
    for (let i = 0; i < coordsPoint.length; i++){ 
      for (let j = 0; j < coordsPoint.length; j++){
        if (Ostov[i][j] > maxLen) 
          maxI = i, maxJ = j, maxLen = Ostov[i][j];
        if (Ostov[i][j] != 0) 
          visited[i] = true;   
      }
    }
    Ostov[maxI][maxJ] = 0;
    Ostov[maxJ][maxI] = 0;
  }
  let flag;
  for (let i = 0; i < coordsPoint.length; i++){ 
    flag = false;
      for (let j = 0; j < coordsPoint.length; j++) 
        if (Ostov[i][j] != 0){
          flag = true;
          break;
        }
    if (flag == false && visited[i] == true) lonelyCluster.push(i);
    }
  }
function drawOstov() {
  for (let i = 0; i < coordsPoint.length; i++) 
    for (let j = 0; j < coordsPoint.length; j++) 
      if (Ostov[i][j] != 0) {
        drawStroke(coordsPoint[i], coordsPoint[j], widthOstov, colorOstov);
        drawCircle(coordsPoint[i], 4, colorOstov);
        drawCircle(coordsPoint[j], 4, colorOstov);
      }
  for (let i = 0; i < lonelyCluster.length; i++) 
    drawCircle(coordsPoint[lonelyCluster[i]], 7, colorOstov);
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
  let flagCompare = true;
  clearStroke();
  findCentroids();
  findMinStroke(flagCompare);
  Ostov = findOstov();
  deleteMaxStroke();
  for (let i = 0; i < coordsPoint.length; i++){
    Point = {
      x: coordsPoint[i].x,
      y: coordsPoint[i].y,
      index: i,
      neigbourPoints: [i], 
      nearCluster: 0,
    };
     coordsClusterHier.push(Point);
  }
  while (true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fiilCanvas();
    drawPoint();
    if(coordsClusterHier.length > numCenter){
      updateClusters();
    }
    let flag2 = false;
    flag2 = replaceCentroids(flag2);
    findMinStroke(flagCompare);
    drawOstov();
    updateStroke();
    if (coordsClusterHier.length == numCenter && flag2 == false) break;
    await delay(100);  
  }
}
