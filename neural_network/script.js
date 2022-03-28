import {coeffs} from './data.js';
var brushSize = 4;
var brushColor = "rgb(1, 1, 1)";
var pixelSide = 56;
var d;
var net;

document.addEventListener("DOMContentLoaded", ready);
function ready() {
  d = new DCanvas(document.getElementById("canv"));
  net = new Network(coeffs);
  document.getElementById("clearAll").onclick = function () { d.clear() }
  document.getElementById("run").onclick = function () { run() }
}

function run() {
  var data = d.calculate();
  net.recognising(makeDataForResponsing(convoluteMatrix(data, 1, 0.25)));
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
  let boxSize = 560;
  canvas.width = boxSize;
  canvas.height = boxSize;
  const pixel = boxSize / pixelSide;

  let is_mouse_down = false;

  this.clear = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  this.calculate = function () {
    const wide = canvas.width;
    const p = wide / pixel;
    const Step = wide / p;

    const vector = [];

    for (let y = 0; y < wide; y += Step) {
      for (let x = 0; x < wide; x += Step) {
        const data = ctx.getImageData(x, y, Step, Step);
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
  return 1.0 / (1.0 + (Math.E ** (-z)))
}

class Network {
  constructor(data) {
    this.biases = data["biases"]
    this.weights = data["weights"]
  }
  recognising(a) {
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
    }
    let top1 = 0;
    let top2 = 0;
    let top3 = 0;
    let top1m = 0;
    let top2m = 0;
    let top3m = 0;
    for(let i = 0; i < a.length; i++){
      if (a[i][0] > top1m){
        top1m = a[i][0]
        top1 = i
      }
      else if (a[i][0] > top2m){
        top2m = a[i][0]
        top2 = i
      }
      else if (a[i][0] > top3m){
        top3m = a[i][0]
        top3 = i
      }
    }
    document.getElementById("top1").innerHTML = `"${top1}": ${(top1m * 100).toFixed(4)}%`
    document.getElementById("top2").innerHTML = `"${top2}": ${(top2m * 100).toFixed(4)}%`
    document.getElementById("top3").innerHTML = `"${top3}": ${(top3m * 100).toFixed(4)}%`
    return top1
  }
}
