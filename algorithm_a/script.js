var objectTable = {
  size: 0,              //Размер таблицы, сторона квадрата
  table: null,          //Объект-ссылка на таблицу
  cellInput: null,      //Объект-ссылка на начальную клетку
  cellOutput: null,     //Объект-ссылка на конечную клетку
  cellList: [],         //Массив объектов-ссылок на все ячейки в виде списка для перебора
  cellMatrix: [],       //Массив объектов-ссылок на все ячейки в виде двумерного массива
  matrix: []            //Массив типов (clear, input, output, wall) ячеек в виде двумерного массива
};

class Point {
  constructor(i, j, cell = null) {
      this.i = i;
      this.j = j;
      this.cell = cell;
  }
}

var h;
var state = -1; // Режим рисования: 0 - очистить, 1 - вход, 2 - выход, -1 - стенка, 3 - open, 4 - closed, 5 - правильный путь
var searchSpeed = 200;
var traceSpeed = 75;
var maxWay = 10000;

//Выполнение при инициализации, привязка обработчиков
document.addEventListener("DOMContentLoaded", ready);
function ready() {
  document.querySelector("#buildTable").onclick = function () {
    tableCreate();
  };
  document.getElementById("tableSizeSlider").onclick = function () {
    document.getElementById('tableSizeLabel').innerHTML = this.value;
  }
  document.getElementById("buildMaze").onclick = function () { buildMaze()}
  document.getElementById("setInput").onclick = function () { setPaintState(1)}
  document.getElementById("setOutput").onclick = function () { setPaintState(2)}
  document.getElementById("setWall").onclick = function () { setPaintState(-1)}
  document.getElementById("setClear").onclick = function () { setPaintState(0)}
  document.getElementById("clearAll").onclick = function () { clearAll()}
  document.getElementById("run").onclick = function () { run()}
  setIndicator(0);
}

function randInt(min, max, except=1000) { // min and max included 
  let num = Math.floor(Math.random() * (max - min + 1) + min);
  while (num == except) {
    num = Math.floor(Math.random() * (max - min + 1) + min);
  } 
  return num
}

//Вызов построения лабиринта
function buildMaze() {  
  setIndicator(0);
  objectTable.cellInput = null;
  objectTable.cellOutput = null;
  if (objectTable.table == null){
    alert("Не создано поле")
  }
  else {
    dfsMazeConstructor();
  }
}

//Вызов запуска A*
function run() {
  if (objectTable.table == null){
    alert("Не создано поле")
  }
  else if ((objectTable.cellInput == null) || (objectTable.cellOutput == null)){
    alert("Не указано начало или конец пути");
  }
  else {
    switch(chooseHeuristic.selectedIndex) {
      case 0:
        h = function(point1, point2){return Math.sqrt(((point1.i - point2.i)**2)+((point1.j - point2.j)**2))}
        break;
      case 1:  
        h = function(point1, point2){return Math.max(Math.abs(point2.i - point1.i), Math.abs(point2.j - point1.j))}
        break;
      case 2:
        h = function(point1, point2){return Math.abs(point2.i - point1.i) + Math.abs(point2.j - point1.j)}
        break;
      default:
        h = function(point1, point2){return Math.abs(point2.i - point1.i) + Math.abs(point2.j - point1.j)}
        break;
    }
    setIndicator(1);
    for (el of objectTable.cellList) {
      let attr = el.getAttribute("class");
      if ((attr == "ioTableCell open") || (attr == "ioTableCell closed") || (attr == "ioTableCell way")) {
        el.setAttribute("class", "ioTableCell clear")
      }
    }
    aStar(objectTable.cellInput, objectTable.cellOutput);
  }
}

//Ищет объект точки среди тех, что массиве
function findPoint(unvisited, i, j) {
  for (el of unvisited) {
    if (el.i == i && el.j == j) return el;
  }
  return null;
}

//Выдает случайное направление для змеи лабиринта
function findDirection(point, unvisited) {
  let x = point.j;
  let y = point.i;
  let d = ["up", "down", "right", "left"];
  while (d.length > 0) {
    let dir_index = randInt(0, d.length - 1);
    switch (d[dir_index]) {
      case "up":
        if ((y - 2 >= 0) && (findPoint(unvisited, y-2, x) != null)) return(findPoint(unvisited, y-2, x));
        break;
      case "down":
        if ((y + 2 < objectTable.size) && (findPoint(unvisited, y+2, x) != null)) return(findPoint(unvisited, y+2, x));
        break;
      case "right":
        if ((x - 2 >= 0) && (findPoint(unvisited, y, x-2) != null)) return(findPoint(unvisited, y, x-2));
        break;
      case "left":
        if ((x + 2 < objectTable.size) && (findPoint(unvisited, y, x+2) != null)) return(findPoint(unvisited, y, x+2));
        break;
    }
    d.splice(dir_index, 1);
  }
  return null;
}
//Озвучивает вердикт
function play(result) {
  var fail = new Audio('../sounds/fail.wav');
  var success = new Audio('../sounds/success.wav');
  if (result) {
    success.play();
  }
  else{
    fail.play();
  }
}

//Создает задержку
function delay(delayInms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}

function setIndicator(state){
  butt = document.getElementById("indicator");
  switch (state) {
    case 0:
      butt.setAttribute("class", "idle");
      break;
    case 1:
      butt.setAttribute("class", "running");
      break;
    case 2:
      butt.setAttribute("class", "success");
      break;
    case 3:
      butt.setAttribute("class", "fail");
      break;
  }
}

//Функции построителя лабиринтов

function findPointBetweenPoints(point1, point2) {
  if (point1.i == point2.i){
    return new Point(point1.i, Math.min(point1.j, point2.j) + 1);
  }
  return new Point(Math.min(point1.i, point2.i) + 1, point1.j);
}

function deepFirstSearch(point, used, unvisited) {
  if (unvisited.indexOf(point) != -1) unvisited.splice(unvisited.indexOf(point), 1);
	while (findDirection(point, unvisited) != null) {
    next = findDirection(point, unvisited);
    unvisited.splice(unvisited.indexOf(next), 1);
		used.push(next);
    let neighbour = findPointBetweenPoints(point, next);
    coloriseCell(objectTable.cellMatrix[neighbour.i][neighbour.j], 0);
		deepFirstSearch(next, used, unvisited);
	}
}

function dfsMazeConstructor() {
  var used = [new Point(0, 0)];
  var unvisited = [];
  //Красим ячейки в сетку
  for (let i = 0; i < objectTable.size; i++) {
    for (let j = 0; j < objectTable.size; j++) {
      coloriseCell(objectTable.cellMatrix[i][j], -1);
      if ((i%2==0)&&(j%2==0)) {
        coloriseCell(objectTable.cellMatrix[i][j], 0);
        unvisited.push(new Point(i, j))
      }
    }
  }

  //Если таблица четная, то случайно красим край
  if (objectTable.size % 2 == 0) {
    for (let i = 0; i < objectTable.size; i++) {
      if (randInt(0, 100) < 40) coloriseCell(objectTable.cellMatrix[objectTable.size - 1][i], 0);
      if (randInt(0, 100) < 40) coloriseCell(objectTable.cellMatrix[i][objectTable.size - 1], 0);
    }
  }
  
  deepFirstSearch(unvisited[randInt(0, unvisited.length - 1)], used, unvisited);

}

//Функции для А*
function getPointByCell(cell){
  for (let i = 0; i < objectTable.size; i++) {
    for (let j = 0; j < objectTable.size; j++) {
      if (objectTable.cellMatrix[i][j] == cell) return new Point(i, j, cell);      
    }
  }
}

function getIndexByCell (array, cell) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].cell == cell) return i;
  }
}

function getIndexByPoint (array, point) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] == point) return i;
  }
}

function minF(array, F, points){
  var min = maxWay;
  var minPoint;
  for (el of array) {
    if (F[getIndexByPoint(points, el)] < min) {
      min = F[getIndexByPoint(points, el)];
      minPoint = el;
    }
  }
  return minPoint;
}

function anyNeighbours(point, points){
  var neighbours = [];
  if(point.i - 1 >= 0){
    if (findPoint(points, point.i - 1, point.j) != null) neighbours.push(findPoint(points, point.i - 1, point.j));
  }
  if(point.i + 1 < objectTable.size){
    if (findPoint(points, point.i + 1, point.j) != null) neighbours.push(findPoint(points, point.i + 1, point.j));
  }
  if(point.j - 1 >= 0) {
    if (findPoint(points, point.i, point.j - 1) != null) neighbours.push(findPoint(points, point.i, point.j - 1));
  }
  if(point.j + 1 < objectTable.size) {
    if (findPoint(points, point.i, point.j + 1) != null) neighbours.push(findPoint(points, point.i, point.j + 1));
  }
  return neighbours;
}

function unclosedNeighbours(closed, point, points){
  var allNeighbours = anyNeighbours(point, points);
  var neighbours = [];
  for (el of allNeighbours) {
    if (closed.indexOf(el) == -1) neighbours.push(el);
  }
  return neighbours
}

async function traceWay(map, points, end, start){
  var point;
  var way = [];
  index = end;
  while (index != start){
    point = points[index];
    way.push(point.cell);
    index = map[index];
  }
  while (way.length > 0) {
    el = way.pop();
    await delay(traceSpeed);
    coloriseCell(el, 5);
  }
}

async function aStar (startCell, endCell) {
  var points = [];
  for (el of objectTable.cellList) {
    if (el.getAttribute("class") == `ioTableCell clear`) points.push(getPointByCell(el));
    if (el.getAttribute("class") == `ioTableCell input`) points.push(getPointByCell(el));
    if (el.getAttribute("class") == `ioTableCell output`) points.push(getPointByCell(el));
  }
  var closed = [];
  var open = [points[getIndexByCell(points, startCell)]];
  var map = [];
  var G = [];
  var F = [];
  var end;
  var start = getIndexByCell(points, startCell);
  for (let i = 0; i < points.length; i++) {
    G[i] = maxWay;
  }
  G[getIndexByCell(points, startCell)] = 0;
  F[getIndexByCell(points, startCell)] = G[getIndexByCell(points, startCell)] + h(getPointByCell(startCell), getPointByCell(endCell));
  while (open.length > 0) {
    await delay(searchSpeed);
    var curr = minF(open, F, points);
    if (curr.cell == endCell) {
      traceWay(map, points, end, start);
      setIndicator(2);
      play(true);
      return true;
    }
    end = getIndexByPoint(points, curr);
    open.splice(open.indexOf(curr), 1);
    closed.push(curr);
    if ((curr.cell != endCell) && (curr.cell != startCell)) coloriseCell(curr.cell, 4);
    for(el of unclosedNeighbours(closed, curr, points)) {
      if ((el.cell != endCell) && (el.cell != startCell)) coloriseCell(el.cell, 3);
      tempG = G[getIndexByPoint(points, curr)] + 1;
      if ((open.indexOf(el) == -1) || (tempG < G[getIndexByPoint(points, el)])) {
        map[getIndexByPoint(points, el)] = getIndexByPoint(points, curr);
        G[getIndexByPoint(points, el)] = tempG;
        F[getIndexByPoint(points, el)] = G[getIndexByPoint(points, el)] + h(el, getPointByCell(endCell));
      }
      if (open.indexOf(el) == -1) open.push(el);
    }
  }
  setIndicator(3);
  play(false);
  return false
}

//Функции для рисования
function setPaintState(newState) {
  for (el of objectTable.cellList) {
    let attr = el.getAttribute("class");
    if ((attr == "ioTableCell open") || (attr == "ioTableCell closed") || (attr == "ioTableCell way")) {
      el.setAttribute("class", "ioTableCell clear")
    }
  }
  setIndicator(0);
  state = newState;
}

function clearAll() {
  setIndicator(0);
  for (element of objectTable.cellList) {
    element.setAttribute("class", `ioTableCell clear`);
  }
  objectTable.cellInput = null;
  objectTable.cellOutput = null;
}

//Раскраска ячейки по глобальному state, если он не передается в функцию, strictState требуется для покраски в реальном времени
function coloriseCell(cell, strictState = -2) {
  if (cell == objectTable.cellInput) {
    cell.setAttribute("class", `ioTableCell clear`);
    objectTable.cellInput = null;
  }
  if (cell == objectTable.cellOutput) {
    cell.setAttribute("class", `ioTableCell clear`);
    objectTable.cellOutput = null;
  }
  if (strictState == -2){
    for (el of objectTable.cellList) {
      let attr = el.getAttribute("class");
      if ((attr == "ioTableCell open") || (attr == "ioTableCell closed") || (attr == "ioTableCell way")) {
        el.setAttribute("class", "ioTableCell clear")
      }
    }
  }
  switch (strictState == -2 ? state : strictState) {
    case 0:   //Clear
      cell.setAttribute("class", `ioTableCell clear`);
      if (cell == objectTable.cellInput) {
        objectTable.cellInput = null;
      }
      if (cell == objectTable.cellOutput) {
        objectTable.cellOutput = null;
      }
      break;
    case -1:  //Wall
      cell.setAttribute("class", `ioTableCell wall`);
      if (cell == objectTable.cellInput) {
        objectTable.cellInput = null;
      }
      if (cell == objectTable.cellOutput) {
        objectTable.cellOutput = null;
      }
      break;
    case 1:   //Input
      if (objectTable.cellInput != null) {
        objectTable.cellInput.setAttribute("class", `ioTableCell clear`);
      }
      cell.setAttribute("class", `ioTableCell input`);
      objectTable.cellInput = cell;
      break;
    case 2:   //Output
      if (objectTable.cellOutput != null) {
        objectTable.cellOutput.setAttribute("class", `ioTableCell clear`);
      }
      cell.setAttribute("class", `ioTableCell output`);
      objectTable.cellOutput = cell;
      break;
    case 3:   //Open
      cell.setAttribute("class", `ioTableCell open`);
      break;
    case 4:   //Closed
      cell.setAttribute("class", `ioTableCell closed`);
      break;
    case 5:   //Way
      cell.setAttribute("class", `ioTableCell way`);
      break;
  }
}

//Создание таблицы, установление objectTable для взаимодействия
function tableCreate() {
  setIndicator(0);
  //Удаление таблицы, если она существует
  if (document.getElementById("ioTable") != null) {
    var todel = document.getElementById("ioTable");
    todel.remove();
    objectTable.cellMatrix = [];
    objectTable.cellList = [];
    objectTable.cellInput = null;
    objectTable.cellOutput = null;
    objectTable.matrix = [];
    objectTable.table = null;
  }

  //Построение таблицы
  var size = parseInt(document.getElementById("tableSizeSlider").value);
  var algorithmView = document.getElementsByClassName("algorithmView")[0];
  var table = document.createElement("table");
  var tableBody = document.createElement("tbody");
  for (var j = 0; j < size; j++) {
    var row = document.createElement("tr");
    for (var i = 0; i < size; i++) {
      var cell = document.createElement("td");
      cell.setAttribute("border", "1px");
      cell.setAttribute("class", "ioTableCell clear");
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  }
  table.appendChild(tableBody);
  algorithmView.appendChild(table);
  table.setAttribute("id", "ioTable");

  //Заполнение objectTable
  objectTable.size = size;
  let matrix = [];
  for (element of document.getElementsByClassName("ioTableCell")) {
    objectTable.cellList.push(element);
    if (matrix.length == size) {
      objectTable.cellMatrix.push(matrix);
      matrix = [];
    }
    matrix.push(element);
  }
  objectTable.cellMatrix.push(matrix);
  objectTable.table = document.getElementById("ioTable");

  //"Подгон" размера ячеек таблицы, чтобы они были квадратными и занимали всю доступную площадь
  var boxSize = Math.min(window.innerHeight - 180, window.innerWidth - document.querySelector('.algorithmOptions').offsetWidth - 200);
  objectTable.table.setAttribute("width", `${boxSize}px`);
  objectTable.table.setAttribute("height", `${boxSize}px`);
  for (element of objectTable.cellList) {
    element.setAttribute("width", `${Math.floor(boxSize / objectTable.size)}px`);
    element.setAttribute("height", `${Math.floor(boxSize / objectTable.size) - 3}px`);
    element.onclick = function(e){
      coloriseCell(e.target);
    }
  }
}