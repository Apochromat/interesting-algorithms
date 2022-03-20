var brushSize = 6;
var brushColor = "rgb(1, 1, 1)";
var pixelSide = 56;
var d;

document.addEventListener("DOMContentLoaded", ready);
function ready() {
    d = new DCanvas(document.getElementById("canv"));
    document.getElementById("clearAll").onclick = function () { d.clear()}
    document.getElementById("run").onclick = function () { run()}
}

function run(){
    var data = d.calculate();
    console.log(convoluteMatrix(data, 0, 0.25));
}

function convoluteMatrix(matrix, type = 0, threshold = 0) {
    var convolutedMatrix = [];
    for (let i = 0; i < pixelSide; i++) {
        let temp = [];
        for (let j = 0; j < pixelSide; j++) {
            let value = (matrix[i][j] + matrix[i + 1][j] + matrix[i][j + 1] + matrix[i + 1][j + 1]) / 4;
            if (!type) value = value > threshold ? 1 : 0;
            temp.push(value)
            j++;
        }
        convolutedMatrix.push(temp);
        i++;
    }
    return convolutedMatrix
}

function DCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  let boxSize = Math.min(window.innerHeight - 180, window.innerWidth - document.querySelector('.algorithmOptions').offsetWidth - 200);
  canvas.width = boxSize;
  canvas.height = boxSize;
  const pixel = boxSize/pixelSide;

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
        for (i = 0; i < data.data.length; i += 10) {
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
            temp.push(vector[y*pixelSide+x]);
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
