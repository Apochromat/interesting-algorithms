var state = -1; // Режим рисования: 0 - очистить, 1 - вход, 2 - выход, -1 - стенка
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

function setPaintState(newState) {
  state = newState;
  console.log(`State: ${state}`);
}

function clearAll() {
  for (element of document.getElementsByClassName("ioTableCell")) {
    element.setAttribute("bgcolor", `white`);
  }
}

function run() {
  console.log("Run");
}

function coloriseCell(cell) {
  console.log("Colorise: " + state)
  switch (state) {
    case 0:
      cell.setAttribute("bgcolor", `white`);
      break;
    case -1:
      cell.setAttribute("bgcolor", `#616161`);
      break;
    case 1:
      cell.setAttribute("bgcolor", `#0a76d0`);
      break;
    case 2:
      cell.setAttribute("bgcolor", `#ffa500`);
      break;
  }
}

function tableSizeAdjust() {
  var cells = document.getElementsByClassName("ioTableCell");
  var table = document.getElementById("ioTable");
  var boxSize = Math.min(window.screen.height - 300, window.screen.width - document.querySelector('.algorithmOptions').offsetWidth)
  var cellAmount = parseInt(document.getElementById("tableSizeSlider").value);
  table.setAttribute("width", `${boxSize}px`);
  table.setAttribute("height", `${boxSize}px`);
  for (element of cells) {
    element.setAttribute("width", `${Math.floor(boxSize / cellAmount)}px`);
    element.setAttribute("height", `${Math.floor(boxSize / cellAmount)-3}px`);
    element.setAttribute("bgcolor", `white`);
    element.onclick = function(e){
      coloriseCell(e.target);
    }
  }
}

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
      var cellText = document.createTextNode(" ");
      cell.setAttribute("border", "1px");
      cell.setAttribute("class", "ioTableCell");
      cell.setAttribute("width", "25px");
      cell.setAttribute("height", "25px");
      cell.appendChild(cellText);
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  }
  table.appendChild(tableBody);
  algorithmView.appendChild(table);
  table.setAttribute("border", "1px");
  table.setAttribute("id", "ioTable");
}
