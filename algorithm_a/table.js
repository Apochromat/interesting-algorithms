matrix = [];
document.addEventListener("DOMContentLoaded", ready);

function ready() {
  document.querySelector("#buildTable").onclick = function () {
    tableCreate();
    console.log("Hi");
  };
}

function tableCreate() {
  if (document.getElementById("ioTable") != null) {
    var todel = document.getElementById("ioTable");
    todel.remove();
  }
  var size = parseInt(document.getElementById("tableSizeSlider").value);
  var body = document.getElementsByClassName("algorithmView")[0];
  var tbl = document.createElement("table");
  var tblBody = document.createElement("tbody");
  for (var j = 0; j <= size; j++) {
    var row = document.createElement("tr");

    for (var i = 0; i < size; i++) {
      var cell = document.createElement("td");
      var cellText = document.createTextNode(" ");
      cell.setAttribute("border", "2px");
      cell.setAttribute("width", "25px");
      cell.setAttribute("height", "25px");
      cell.appendChild(cellText);
      row.appendChild(cell);
    }

    tblBody.appendChild(row);
  }

  tbl.appendChild(tblBody);
  body.appendChild(tbl);
  tbl.setAttribute("border", "2px");
  tbl.setAttribute("id", "ioTable");
}
