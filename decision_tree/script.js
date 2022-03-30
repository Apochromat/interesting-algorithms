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
  document.getElementById("runTree").onclick = function () { runTree() }
  document.getElementById("runFeed").onclick = function () { runFeed() }
}

function read(input) {
  const csv = input.files[0]
  reader.readAsText(csv)
}

function runTree() {
  if (tree == undefined) { alert("Не загружена выборка") }
  else {
    tree.head.split(tree);
    console.log(tree);
  }
}

function runFeed() {
  if (tree == undefined) { alert("Не загружена выборка") }
  else if(tree.head.childs.length == 0) { alert("Не построено дерево") }
  else {
    document.getElementById("result").innerHTML=(tree.head.feedForward(readCSVInput()))
  }
}

function readCSVInput(){
  let str = document.getElementById("csvInput").value;
  let obj = csvToObject(tree.headers, str);
  return obj;
}

function csvToObject(headers, row, delimiter = ";") {
  var values = row.split(delimiter);
  var obj = {};
  for (let i = 0; i < headers.length - 2; i++) {
    obj[headers[i + 1]] = values[i];
  }
  return obj
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
  return [headers, arr];
}

class Node {
  constructor(batch, depth, parent, tree, type = "node") {
    this.type = type;
    this.depth = depth;
    this.batch = batch;
    this.childs = [];
    this.label;
    this.result = "";
    this.parent = parent;
    this.property;
    this.condition;
    this.value;
    this.tree = tree;
  }
  conclusion(){
    var array = [];
    for (let el of this.batch) {
      array.push(el["Class"]);
    }
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
  }
  nextChild(input) {
    if (input[this.property] > parseFloat(this.value)) {
      return this.childs[0];
    }
    return this.childs[1];
  }
  split() {
    this.tree.maxDepth = Math.max(this.tree.maxDepth, this.depth);
    if (this.tree.findBestSplit(this.batch) == undefined) {
      this.type = "leaf";
      this.result = this.conclusion();
      this.tree.leaves.push(this);
    }
    else {
      var predict = this.tree.findBestSplit(this.batch);
      if (predict["condition"] == "equal") {
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
          this.childs.push(new Node(predict["split"][i], this.depth + 1, this, this.tree));
        }
        for (let el of this.childs) {
          el.split();
        }
      }
      else {
        this.type = "leaf";
        this.result = this.conclusion();
        this.tree.leaves.push(this);
      }
    }
  }
  feedForward(input) {
    if (this.type == "node") {
      if (this.condition == "equal") {
        for (let index = 0; index < this.childs.length; index++) {
          if (this.childs[index][this.property] == input[this.property]){
            return this.childs[index].feedForward(input);
          }
        }
      }
      else {
        return this.nextChild(input).feedForward(input)
      }
    }
    else {
      return this.result;
    }
  }
}

class Tree {
  constructor(csvData) {
    this.csvData = csvData[1];
    this.headers = csvData[0];
    this.head = new Node(this.csvData, 0, this, this);
    this.maxDepth = 0;
    this.leaves = [];
    this.keys = Object.keys(this.csvData[0]);
    this.keys.splice(this.keys.indexOf("Id"), 1);
    this.propertyValues = {};
  }

  calculatePropertyValues() {
    for (let key of this.keys) {
      let temp = new Set();
      for (let index = 0; index < this.csvData.length; index++) {
        temp.add(this.csvData[index][key]);
      }
      this.propertyValues[key] = new Set(Array.from(temp).sort((a, b) => a - b));
    }
  }

  calculateEntries(batch, propertyValue, property) {
    let entries = 0;
    for (let el of batch) {
      if (el[property] == propertyValue) {
        entries++;
      }
    }
    return entries
  }

  calculateEntropy(batch, property = "Class") {
    let h = 0;
    for (let propertyValue of this.propertyValues[property]) {
      let p = this.calculateEntries(batch, propertyValue, property) / batch.length;
      if (p != 0) h -= p * Math.log2(p);
    }
    return h
  }

  /**
     * types: "equal", "more", "less", "nomore", "noless"
     */
  filterByProperty(batch, propertyValue, property, type = "equal") {
    let filtred = []
    for (let el of batch) {
      switch (type) {
        case "equal":
          if (el[property] == propertyValue) {
            filtred.push(el);
          }
          break;
        case "more":
          if (parseFloat(el[property]) > parseFloat(propertyValue)) {
            filtred.push(el);
          }
          break;
        case "less":
          if (parseFloat(el[property]) < parseFloat(propertyValue)) {
            filtred.push(el);
          }
          break;
        case "nomore":
          if (parseFloat(el[property]) <= parseFloat(propertyValue)) {
            filtred.push(el);
          }
          break;
        case "noless":
          if (parseFloat(el[property]) >= parseFloat(propertyValue)) {
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
      if (this.propertyValues[key].size > nonNumberPropertyValuesAmount) {
        for (let propertyValue of this.propertyValues[key]) {
          tempSplit = [this.filterByProperty(batch, propertyValue, key, "more"), this.filterByProperty(batch, propertyValue, key, "nomore")];
          if ((tempSplit[0].length != 0) && (tempSplit[1].length != 0)) {
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