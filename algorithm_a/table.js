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
  constructor(i, j) {
      this.i = i;
      this.j = j;
  }
}

var state = -1; // Режим рисования: 0 - очистить, 1 - вход, 2 - выход, -1 - стенка, 3 - просмотрено, 4 - правильный путь

//Выполнение при инициализации, привязка Слушателей
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
  dfsMazeConstructor();
  console.log("Build Maze");
}

//Ищет объект точки среди тех, что не были посещены
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

//Вызов запуска A*
function run() {
  console.log("Run");
}

//Функции для рисования
function setPaintState(newState) {
  state = newState;
  console.log(`State: ${state}`);
}

function clearAll() {
  for (element of objectTable.cellList) {
    element.setAttribute("class", `ioTableCell clear`);
  }
}

//Раскраска ячейки по глобальному state, если он не передается в функцию, strictState требуется для покраски в реальном времени
function coloriseCell(cell, strictState = -2) {
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
      cell.setAttribute("class", `ioTableCell input`);
      if (objectTable.cellInput != null) {
        objectTable.cellInput.setAttribute("class", `ioTableCell clear`);
      }
      objectTable.cellInput = cell;
      break;
    case 2:   //Output
      cell.setAttribute("class", `ioTableCell output`);
      if (objectTable.cellOutput != null) {
        objectTable.cellOutput.setAttribute("class", `ioTableCell clear`);
      }
      objectTable.cellOutput = cell;
      break;
    case 3:   //Visited
      cell.setAttribute("class", `ioTableCell visited`);
      break;
    case 4:   //Way
      cell.setAttribute("class", `ioTableCell way`);
      break;
  }
}

//Создание таблицы, установление objectTable для взаимодействия
function tableCreate() {
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