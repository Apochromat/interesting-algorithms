var objectTable = {
  size: 0,              //Размер таблицы, сторона квадрата
  table: null,          //Объект-ссылка на таблицу
  cellInput: null,      //Объект-ссылка на начальную клетку
  cellOutput: null,     //Объект-ссылка на конечную клетку
  cellList: [],         //Массив объектов-ссылок на все ячейки в виде списка для перебора
  cellMatrix: [],       //Массив объектов-ссылок на все ячейки в виде двумерного массива
  matrix: []            //Массив типов (clear, input, output, wall) ячеек в виде двумерного массива
};

var state = -1; // Режим рисования: 0 - очистить, 1 - вход, 2 - выход, -1 - стенка, 3 - просмотрено, 4 - правильный путь

//Выполнение при инициализации, привязка Слушателей
document.addEventListener("DOMContentLoaded", ready);
function ready() {
  document.querySelector("#buildTable").onclick = function () {
    tableCreate();
    tableSizeAdjust();
    console.log("Table created");
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

function buildMaze() {
  console.log("Build Maze");
}

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
function coloriseCell(cell, strictState=0) {
  switch (strictState == 0 ? state : strictState) {
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

//"Подгон" размера ячеек таблицы, чтобы они были квадратными и занимали всю доступную площадь
function tableSizeAdjust() {
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

//Создание таблицы, установление objectTable для взаимодействия
function tableCreate() {
  if (document.getElementById("ioTable") != null) {
    var todel = document.getElementById("ioTable");
    todel.remove();
  }
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
  table.setAttribute("border", "1px");
  table.setAttribute("id", "ioTable");
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
}
