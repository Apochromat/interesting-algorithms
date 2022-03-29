var canvas = document.getElementById("canvasCluster");
var ctx = canvas.getContext("2d");
var nodes = new Array();
var NODE_ID = 0;
function Node(id,mouseX,mouseY){
		this.id = id;
		this.x = mouseX;
		this.y = mouseY;
		this.radius = 15;
}
function fiilCanvas() {
  canvas.width = window.innerWidth*0.58;
  canvas.height = window.innerHeight*0.6;
  ctx.fillStyle = "rgba(211, 211, 211, 0)";
  ctx.strokeStyle = "whitesmoke";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}
function clearCanvas(){
  canvas.removeEventListener("mousedown", pushPointListener);
  coordsPoint = [];
  coordsClusterKMeans = [];
  coordsClusterHier = [];
  fiilCanvas();
}
function pushPointListener(e) {
  var Point = {
    x: e.pageX - e.target.offsetLeft,
    y: e.pageY - e.target.offsetTop
  };
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  var node = new Node(NODE_ID++,e.pageX - e.target.offsetLeft,e.pageY - e.target.offsetTop);
  nodes.push(node);
  console.log(nodes.length);
  ctx.fillStyle = "whitesmoke";
  ctx.fill();
  if(nodes.length>1){
  	for(var i=0; i<nodes.length; i++){
			for(var j=0; j<nodes.length; j++){
				if(i != j){
						drawLine(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y,1,"whitesmoke");
				}
			}
		}
  }
  
  
} 
function NewNode(){

    canvas.addEventListener("mousedown", pushPointListener);
}
function drawLine(x0,y0,x1,y1,lineWidth,color){
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);			
		ctx.stroke();
}	
		
			