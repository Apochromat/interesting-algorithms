const reader = new FileReader()
var tree;
var nonNumberPropertyValuesAmount = 5;
var minEntropy = 0.05;
var minDeltaEntropy = 0.01;
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
  tree.head.split(tree);
  console.log(tree);
}


class Node {
  constructor(batch, index, depth, type = "node"){
    this.type = type;
    this.depth = depth;
    this.label;
    this.index = index;
    this.batch = batch;
    this.childs = [];
    this.property;
    this.condition;
    this.value;
  }
  split(tree){
    if (tree.findBestSplit(this.batch) == undefined) {
      this.type = "leaf";
    }
    else {
      var predict = tree.findBestSplit(this.batch);
      if (predict["condition"] == "equal"){
        this.label = `Divide by ${predict["property"]}`;
        this.property = predict["property"];
      }
      else {
        this.label = `Is ${predict["property"]} ${predict["condition"]} than ${predict["value"]}?`;
        this.property = predict["property"];
        this.condition = predict["condition"];
        this.value = predict["value"];
      }
      if ((predict["entropy"][0] > minEntropy) || (predict["entropy"][1] > minDeltaEntropy)) {
        for (let i = 0; i < predict["split"].length; i++) {
          this.childs.push(new Node(predict["split"][i], i, this.depth+1));
        }
        for (let el of this.childs) {
          el.split(tree);
        }
      }
      else {
        this.type = "leaf";
      }
    }
  }
  feedForwand(input){
    console.log(input);
  }
}

class Tree {
  constructor(csvData) {
    this.csvData = csvData;
    this.keys = Object.keys(csvData[0]);
    this.keys.splice(this.keys.indexOf("Id"), 1);
    this.propertyValues = {};
    this.head = new Node(csvData, 0, 0);
  }

  calculatePropertyValues(){
    for (let key of this.keys) {
      let temp = new Set();
      for (let index = 0; index < this.csvData.length; index++) {
        temp.add(this.csvData[index][key]);
      }
      this.propertyValues[key] = new Set(Array.from(temp).sort((a, b) => a-b));
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
      if (p != 0) h -= p*Math.log2(p);
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
          if (parseFloat(el[property]) > parseFloat(propertyValue)){
            filtred.push(el);
          }
          break;
        case "less":
          if (parseFloat(el[property]) < parseFloat(propertyValue)){
            filtred.push(el);
          }
          break;
        case "nomore":
          if (parseFloat(el[property]) <= parseFloat(propertyValue)){
            filtred.push(el);
          }
          break;
        case "noless":
          if (parseFloat(el[property]) >= parseFloat(propertyValue)){
            filtred.push(el);
          }
          break;
      }
      
    }
    return filtred
  }

  findBestSplit(batch) {
    var initialEntropy = this.calculateEntropy(batch);
    let bestDeltaEntropy = 0;
    let predict;
    for (let key of this.keys) {
      if (key == "Class") continue;
      var tempSplit = [];
      if (this.propertyValues[key].size > nonNumberPropertyValuesAmount){
        for (let propertyValue of this.propertyValues[key]) {
          tempSplit = [this.filterByProperty(batch, propertyValue, key, "more"), this.filterByProperty(batch, propertyValue, key, "nomore")];
          if ((tempSplit[0].length != 0)&&(tempSplit[1].length != 0)) {
            let tempEntropy = Math.max(this.calculateEntropy(tempSplit[0]) + this.calculateEntropy(tempSplit[1]));
            if ((initialEntropy - tempEntropy) > bestDeltaEntropy) {
              bestDeltaEntropy = initialEntropy - tempEntropy;
              predict = {
                "split": tempSplit,
                "condition": "more",
                "property": key,
                "value": propertyValue, 
                "entropy": [tempEntropy, bestDeltaEntropy]
              }
            }
          }
        } 
      }
      else {
        let tempEntropySum = 0;
        let tempEntropyObjects = 0;
        for (let propertyValue of this.propertyValues[key]) {
          let filtered = this.filterByProperty(batch, propertyValue, key, "equal");
          tempSplit.push(filtered);
          tempEntropySum += this.calculateEntropy(filtered);
          tempEntropyObjects++;          
        }
        let tempEntropy = tempEntropySum / tempEntropyObjects;
        if ((initialEntropy - tempEntropy) > bestDeltaEntropy) {
          bestDeltaEntropy = initialEntropy - tempEntropy;
          predict = {
            "split": tempSplit,
            "condition": "equal",
            "property": key,
            "value": null,
            "entropy": [tempEntropy, bestDeltaEntropy]
          }
        }
      }
    } 
    return predict
  }
}