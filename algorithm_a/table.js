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
  mazeConstructor(0, objectTable.size-1, 0, objectTable.size-1, objectTable.cellMatrix, randInt(0, 1), 1000);
  console.log("Build Maze");
}

function getTableSlice(type, index, matrix) {  //types: "column", "row"
  switch(type){
    case "row":
      return matrix[parseInt(index)];
    case "column":
      slice = [];
      for (let i = 0; i < matrix.length; i++) {
        slice.push(matrix[i][parseInt(index)])        
      }
      return slice;
  }
}

function mazeConstructor(beginI, endI, beginJ, endJ, matrix, figure, avoidCell) {
    switch (figure) { //0 - строим столбец, 1 - строим строку
      case 0:
        let columnIndex = randInt(beginJ+1, endJ-1, avoidCell)
        let column = getTableSlice("column", columnIndex, matrix); //Берем столбец таблицы, между случайными индексами строк
        for (element of column) coloriseCell(element, -1);
        avoidCell = randInt(1, column.length - 1);
        coloriseCell(column[avoidCell], 0);
        
        if (columnIndex - beginJ >= 3){
          let matrixLeft = [];
          let tempLeft = [];
          for (let i = beginI; i <= endI; i++) {
            for (let j = beginJ; j < columnIndex; j++) {
              tempLeft.push(objectTable.cellMatrix[i][j]);
            }
            matrixLeft.push(tempLeft);
            tempLeft = [];
          }
          mazeConstructor(beginI, endI, beginJ, columnIndex - 1, matrixLeft, figure == 0 ? 1 : 0, avoidCell);
        }
        if (endJ - columnIndex >= 3) {
          let matrixRight = [];
          let tempRight = [];
          for (let i = beginI; i <= endI; i++) {
            for (let j = columnIndex + 1; j <= endJ; j++) {
              tempRight.push(objectTable.cellMatrix[i][j]);
            }
            matrixRight.push(tempRight);
            tempRight = [];
          }
          mazeConstructor(beginI, endI, columnIndex + 1, endJ, matrixRight, figure == 0 ? 1 : 0, avoidCell);
        }
        break;
      case 1:
        let rowIndex = randInt(beginI+1, endI-1);
        let row = getTableSlice("row", rowIndex, matrix);    //Берем строку таблицы, между случайными индексами столбцов
        for (element of row) coloriseCell(element, -1);
        avoidCell = randInt(1, row.length - 1);
        coloriseCell(row[avoidCell], 0);

        if (rowIndex - beginI >= 3){
          let matrixUp = [];
          let tempUp = [];
          for (let j = beginI; j < rowIndex; j++) {
            for (let i = beginJ; i <= endJ; i++) {
              tempUp.push(objectTable.cellMatrix[j][i]);
            }
            matrixUp.push(tempUp);
            tempUp = [];
          }
          mazeConstructor(beginI, rowIndex - 1, beginJ, endJ, matrixUp, figure == 0 ? 1 : 0, avoidCell);
        }
        if (endI - rowIndex >= 3) {
          let matrixDown = [];
          let tempDown = [];
          for (let j = rowIndex + 1; j <= endI; j++) {
            for (let i = beginJ; i <= endJ; i++) {
              tempDown.push(objectTable.cellMatrix[j][i]);
            }
            matrixDown.push(tempDown);
            tempDown = [];
          }
          mazeConstructor(rowIndex + 1, endI, beginJ, endJ, matrixDown, figure == 0 ? 1 : 0, avoidCell);
        }
        break;
    }
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
  table.setAttribute("border", "1px");
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