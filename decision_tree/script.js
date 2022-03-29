const reader = new FileReader()
var tree;
//Выполнение при инициализации, привязка обработчиков
document.addEventListener("DOMContentLoaded", ready);
function ready() {
    reader.addEventListener('load', function (e) {
        tree = new Tree(csvToArray(e.target.result));
        tree.calculatePropertyValues();
    });
    document.getElementById("run").onclick = function () { run()}
}

function read(input) {
	const csv = input.files[0]
	reader.readAsText(csv)
}

function csvToArray(str, delimiter = ";") {
    const headers = str.slice(0, str.indexOf("\n")).trim().split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).trim().split("\n");
    const arr = rows.map(function (row) {
      const values = row.split(delimiter);
      const el = headers.reduce(function (object, header, index) {
        object[header] = values[index].trim();
        return object;
      }, {});
      return el;
    });
    return arr;
}

function run() {
  console.log(tree.calculateEntropy(tree.csvData));
}

class Tree {
  constructor(csvData) {
    this.csvData = csvData;
    this.keys = Object.keys(csvData[0]);
    this.propertyValues = {};
  }
  calculatePropertyValues(){
    for (let key of this.keys) {
      let temp = new Set();
      for (let index = 0; index < this.csvData.length; index++) {
        temp.add(this.csvData[index][key]);
      }
      this.propertyValues[key] = temp;
    }
  }
  calculateEntries(batch, propertyValue, property){
    let entries = 0;
    for (let el of batch) {
      if (el[property] == propertyValue){
        entries++;
      }
    }
    return entries
  }
  calculateEntropy(batch, property = "Class") {
    let h = 0;
    for (let propertyValue of this.propertyValues[property]){
      let p = this.calculateEntries(batch, propertyValue, property)/batch.length;
      h -= p*Math.log2(p);
    }
    return h
  }

  /**
     * types: "equal", "more", "less", "nomore", "noless"
     */
  filterByProperty(batch, propertyValue, property, type = "equal") { 
    let filtred = []
    for (let el of batch) {
      switch(type){
        case "equal":
          if (el[property] == propertyValue){
            filtred.push(el);
          }
          break;
        case "more":
          if (el[property] > propertyValue){
            filtred.push(el);
          }
          break;
        case "less":
          if (el[property] < propertyValue){
            filtred.push(el);
          }
          break;
        case "nomore":
          if (el[property] <= propertyValue){
            filtred.push(el);
          }
          break;
        case "noless":
          if (el[property] >= propertyValue){
            filtred.push(el);
          }
          break;
      }
      
    }
    return filtred
  }

}