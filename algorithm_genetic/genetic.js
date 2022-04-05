var 
  canvas = document.getElementById("geneticCanvas"),
  ctx = canvas.getContext("2d"),
  sizePopulathion = 50,
  globalChanceParent = 30,
  globalChanceMutat = 70,
  coordsPoint = [],
  populathion = [],
  parentsID = [],
  bestPath = [],
  bestLen = 0,
  numCity = 0,
  pointerCrossing = 0,
  pointerMutat = 0,
  pointerDeathPerson = 0,
  iterathion = 0;
  flagWork = true,
  colorGenetic = "red",
  radiusPoint = "6";

function startAlgorithm() {
  flagWork = true;
}
function stopAlgorithm(){
  flagWork = false;
}  

async function GeneticAlgorithm() {
  if (coordsPoint.length == 0) {
    alert("В этом мире так одиноко...");
    return;
  }
  else if (coordsPoint.length == 1) {
    document.getElementById("countIter").innerHTML=("Итерация: 1");
    document.getElementById("curLen").innerHTML=("Длина: 0");
    coordsPoint = [];
    return;
  }
  else if (coordsPoint.length == 2) {
    document.getElementById("countIter").innerHTML=("Итерация: 1");
    document.getElementById("curLen").innerHTML=("Длина: " + Math.floor(findLenBeetwenPoints(coordsPoint[0], coordsPoint[1])*2));
    drawStroke(coordsPoint[0], coordsPoint[1], "2", "white");
    coordsPoint = [];
    return;
  }
  clearData();
  createStartPopulation();
  startAlgorithm();
  while(flagWork) {
    iterathion++;
    crossover(); 
    mutation();
    selection();
    await delay(0.001);
    resetData();
  }
  drawPath();
}

function createStartPopulation() {
  newPath = [];
  for (let i = 0; i < numCity; i++) newPath[i] = i;
  for (let i = 0; i < sizePopulathion; i++) {
    person = {
      path: shuffle(newPath).slice(0),
      chanceParent: getRandChance(),
      chanceMutat: getRandChance(),
      lenPath: 0
    }
    populathion.push(person);
  }
}
function crossover() {
  parentsID = [];
  for (let i = 0; i < populathion.length; i++)
    if (populathion[i].chanceParent >= globalChanceParent) 
      parentsID.push(i);
    
  let countCrossover = Math.floor(parentsID.length/2);
  for (let i = 0; i < countCrossover; i++) {
    parentsID = shuffle(parentsID).slice(0);
    exchangeGene(parentsID[0], parentsID[1]);
    pointerCrossing++;
    parentsID = parentsID.slice(2);
  }
}

function exchangeGene(parent1, parent2) {
  let child1 = [], child2 = [], pointer1 = 0, pointer2 = 0;
  for (let i = 0; i < Math.floor(numCity/2); i++){ 
    child1.push(populathion[parent1].path[i]);
    child2.push(populathion[parent2].path[i]);
  }
  for (let i = Math.floor(numCity/2); i < numCity; i++){
    while(child1.includes(populathion[parent2].path[pointer1], 0))
      pointer1++;
    child1.push(populathion[parent2].path[pointer1]);
    while(child2.includes(populathion[parent1].path[pointer2], 0))
      pointer2++;
    child2.push(populathion[parent1].path[pointer2]);
  }
  person = {
    path: child1.slice(0),
    chanceParent: getRandChance(),
    chanceMutat: getRandChance(),
    lenPath: 0
  }
  person2 = {
    path: child2.slice(0),
    chanceParent: getRandChance(),
    chanceMutat: getRandChance(),
    lenPath: 0
  }
  populathion.push(person);
  populathion.push(person2);
}

function mutation() {
  for (let i = 0; i < populathion.length; i++)
    if (populathion[i].chanceMutat >= globalChanceMutat){
      populathion[i].path = reverseGen(populathion[i].path).slice(0);
      pointerMutat++;
    }
}
function reverseGen(arr) {
  let lenPathBefore = findLenPath(arr), lenPathAfter;
  let copyArr = arr.slice(0);
  let city1 = getRandInt(numCity-1);
  let city2 = city1;

  while(city2 == city1)
    city2 = getRandInt(numCity-1);

  if (city1 > city2) 
    [city1, city2] = [city2, city1];

  for (let i = city1, j = city2; j-i > 0; i++, j--) [arr[i], arr[j]] = [arr[j], arr[i]];
  
  lenPathAfter = findLenPath(arr);

  if (lenPathBefore < lenPathAfter) return copyArr;
  else return arr;
}
function selection() {
  for (let i = 0; i < populathion.length; i++) 
    populathion[i].lenPath = findLenPath(populathion[i].path);
  
  for (let i = 0; i < populathion.length-sizePopulathion; i++){
    let maxLen = -1, maxIndex = -1;
    for (let j = 0; j < populathion.length; j++) {
      if (populathion[j].lenPath > maxLen &&  populathion[j].lenPath != 0) {
        maxLen = populathion[j].lenPath;
        maxIndex = j;
      }
    }
    populathion[maxIndex].lenPath = 0;
    pointerDeathPerson++;
  }

  let temp = [];
  for (let i = 0; i < populathion.length; i++) 
    if (populathion[i].lenPath != 0) 
      temp.push(populathion[i]);
  populathion = temp.slice(0);

  for (let i = 0; i < populathion.length; i++) {
    populathion[i].chanceParent = getRandChance();
    populathion[i].chanceMutat = getRandChance();
    if (populathion[i].lenPath < bestLen || bestLen == 0) {
      bestLen = populathion[i].lenPath;
      bestPath =  populathion[i].path.slice(0);
      drawPath();
    }
  }
}

function resetCanvas() {
  stopAlgorithm();
  coordsPoint = [];
  clearCanvas();
  clearData();
  resetData();
}

function resetData() {
  document.getElementById("countCity").innerHTML=("Кол-во городов: " + coordsPoint.length);
  document.getElementById("countIter").innerHTML=("Итерация: " + iterathion);
  document.getElementById("curLen").innerHTML=("Длина: " + Math.floor(bestLen));
  document.getElementById("countCrossover").innerHTML=("Кол-во скрещиваний: " + pointerCrossing);
  document.getElementById("countMutat").innerHTML=("Кол-во мутаций: " + pointerMutat);
  document.getElementById("countDeathPerson").innerHTML=("Кол-во погибших особей: " + pointerDeathPerson);
}

function clearData() {
  pointerCrossing = 0;
  pointerMutat = 0;
  pointerDeathPerson = 0;
  iterathion = 0;
  populathion = [];
  bestPath = [];
  bestLen = 0;
  numCity = coordsPoint.length;
}

function getRandChance() {
  return Math.floor(Math.random() * 101);
}
function getRandInt(end) {
  return Math.floor(Math.random() * end+1);
}
function shuffle(arr){
	let j;
	for(let i = arr.length - 1; i > 0; i--){
		j = Math.floor(Math.random()*(i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
function findLenPath(arr) {
  let len = 0;
  for (let i = 0; i < arr.length-1; i++) 
    len += findLenBeetwenPoints(coordsPoint[arr[i]], coordsPoint[arr[i+1]]);
  len += findLenBeetwenPoints(coordsPoint[arr[arr.length-1]], coordsPoint[arr[0]]);
  return len;
}
function delay(delayInms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}
function clearCanvas(){
  canvas.width = window.innerWidth*0.58;
  canvas.height = window.innerHeight*0.8;
  ctx.fillStyle = "rgba(211, 211, 211, 0)";
  ctx.strokeStyle = "whitesmoke";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}
function drawPoint(){
  for (let i = 0; i < coordsPoint.length; i++) drawCircle(coordsPoint[i], radiusPoint, colorGenetic);
}
function drawPath() {
  clearCanvas();
  drawPoint();
  for (let i = 0; i < bestPath.length-1; i++) 
    drawStroke(coordsPoint[bestPath[i]], coordsPoint[bestPath[i+1]], "2", colorGenetic);
  drawStroke(coordsPoint[bestPath[bestPath.length-1]], coordsPoint[bestPath[0]], "2", colorGenetic)
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
  document.getElementById("countCity").innerHTML=("Кол-во городов: " + coordsPoint.length);
  drawCircle(Point, radiusPoint, colorGenetic);
} 
function pushPoint(){
  canvas.addEventListener("mousedown", pushPointListener);
}
function findLenBeetwenPoints(p1, p2) {
  return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
}




