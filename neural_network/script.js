import {coeffs} from './data.js';
var brushSize = 3;
var brushColor = "rgb(1, 1, 1)";
var pixelSide = 56;
var d;
var net;
var learnData, learnMax, learnIter, testData;

document.addEventListener("DOMContentLoaded", ready);
function ready() {
  d = new DCanvas(document.getElementById("canv"));
  net = new Network(coeffs);
  document.getElementById("clearAll").onclick = function () { d.clear() }
  document.getElementById("run").onclick = function () { run() }
  document.getElementById("learnMode").onclick = function () { learnMode() }
  document.getElementById("learn").onclick = function () { learn() }
}

function run() {
  var data = d.calculate();
  alert(net.recognising(makeDataForResponsing(convoluteMatrix(data, 1, 0.25))));
}

function convoluteMatrix(matrix, type = 0, threshold = 0) {
  var data = [];
  for (let i = 0; i < pixelSide; i++) {
    let temp = [];
    for (let j = 0; j < pixelSide; j++) {
      let value = (matrix[i][j] + matrix[i + 1][j] + matrix[i][j + 1] + matrix[i + 1][j + 1]) / 4;
      if (!type) value = value > threshold ? 1 : 0;
      temp.push(value)
      j++;
    }
    data.push(temp);
    i++;
  }
  return data
}

function makeDataForResponsing(matrix) {
  var data = []
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      data.push([matrix[i][j]]);
    }
  }
  return data
}

function DCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  let boxSize = Math.min(window.innerHeight - 180, window.innerWidth - document.querySelector('.algorithmOptions').offsetWidth - 200);
  canvas.width = boxSize;
  canvas.height = boxSize;
  const pixel = boxSize / pixelSide;

  let is_mouse_down = false;

  this.clear = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  this.calculate = function () {
    const w = canvas.width;
    const h = canvas.height;
    const p = w / pixel;

    const xStep = w / p;
    const yStep = h / p;

    const vector = [];

    for (let y = 0; y < h; y += yStep) {
      for (let x = 0; x < w; x += xStep) {
        const data = ctx.getImageData(x, y, xStep, yStep);
        let nonEmptyPixelsCount = 0;
        for (let i = 0; i < data.data.length; i += 10) {
          const isEmpty = data.data[i] === 0;
          if (!isEmpty) {
            nonEmptyPixelsCount += 1;
          }
        }
        vector.push(nonEmptyPixelsCount >= 1 ? 1 : 0);
      }
    }
    var matrix = [];
    for (let y = 0; y < pixelSide; y++) {
      let temp = [];
      for (let x = 0; x < pixelSide; x++) {
        temp.push(vector[y * pixelSide + x]);
      }
      matrix.push(temp);
    }
    return matrix;
  };

  canvas.addEventListener("mousedown", function (e) {
    is_mouse_down = true;
    ctx.beginPath();
  });

  canvas.addEventListener("mouseup", function (e) {
    is_mouse_down = false;
  });

  canvas.addEventListener("mouseleave", function (e) {
    is_mouse_down = false;
  });

  canvas.addEventListener("mousemove", function (e) {
    if (is_mouse_down) {
      ctx.fillStyle = brushColor;
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = pixel * brushSize;

      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(e.offsetX, e.offsetY, pixel * brushSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    }
  });
}

function sigmoid(z) {
  return 1.0 / (1.0 + (2.718 ** (-z)))
}

class Network {
  constructor(data) {
    this.biases = data["biases"]
    this.weights = data["weights"]
  }
  recognising(a) {
    console.log(a);
    var matr = []
    for (let k = 0; k < this.biases.length; k++) {
      let bias = this.biases[k];
      let weight = this.weights[k];
      for (let i = 0; i < weight.length; i++) {
        let sum = 0;
        for (let j = 0; j < a.length; j++) {
          sum += a[j][0] * weight[i][j];
        }
        matr.push([sigmoid(sum + bias[i][0])])
      }
      a = matr
      matr = []
      console.log(a);
    }
    let output = 0;
    let maximum = 0;
    for(let i = 0; i < a.length; i++){
      if (a[i][0] > maximum){
        maximum = a[i][0]
        output = i
      }
    }
    return output
  }

}

function learn(){
  let learnImage = makeDataForResponsing(convoluteMatrix(d.calculate(), 1, 0.25));
  let learnNumber = prompt(`${learnIter}/${learnMax}: Что это за число?`);
  let ldn = []
  for (let index = 0; index < 10; index++) {
    ldn[index] = 0.0;
  }
  ldn[parseInt(learnNumber)] = 1.0;
  testData["testdata"].push([learnImage, parseInt(learnNumber)]);
  learnData["learndata"].push([learnImage, ldn]);
  if (learnIter++ == learnMax){
    alert("Обучение завершено");
    console.log(learnData);
    console.log(testData);
  }
  d.clear();
}

function learnMode(){
  testData = {"testdata": []};
  learnData = {"learndata": []};
  learnMax = prompt("ВВедите кол-во обучений");
  learnIter = 1;
}