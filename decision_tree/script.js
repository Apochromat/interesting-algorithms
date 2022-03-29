const reader = new FileReader()

//Выполнение при инициализации, привязка обработчиков
document.addEventListener("DOMContentLoaded", ready);
function ready() {
    reader.onload = function (e) {
        console.log(csvToArray(e.target.result));
    }
}

function read(input) {
	const csv = input.files[0]
	reader.readAsText(csv)
}

function csvToArray(str, delimiter = ";") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
    const arr = rows.map(function (row) {
      const values = row.split(delimiter);
      const el = headers.reduce(function (object, header, index) {
        object[header] = values[index];
        return object;
      }, {});
      return el;
    });
    return arr;
  }
