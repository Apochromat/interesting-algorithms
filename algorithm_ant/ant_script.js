var canvas = document.getElementById("canvasAnt");
var ctx = canvas.getContext("2d");
var nodes = new Array();
var ANT_ID = 0;
var ALPHA = 1;
var BETA = 2;
var RHO = 0.1;
var Q = 1;

var mouseX = 0;
var mouseY = 0;
var ants = new Array();
var tau = null;
var dist = null;
var bestSolution = null;
var intervalID = 0;
function Node(id,ant,mouseX,mouseY){
		this.id = id;
		this.ant=ant;
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
   nodes = new Array();
   NODE_ID = 0;
   ants = new Array();
   ANT_ID = 0;
  fiilCanvas();
}
function pushPointListener(e) {
  var Point = {
    x: e.pageX - e.target.offsetLeft,
    y: e.pageY - e.target.offsetTop
  };
  ctx.beginPath();
  ctx.arc(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, 8, 0, Math.PI*2);
  var ant = new Ant(ANT_ID++,e.pageX - e.target.offsetLeft,e.pageY - e.target.offsetTop);
  var node = new Node(NODE_ID++,ant,e.pageX - e.target.offsetLeft,e.pageY - e.target.offsetTop);
  nodes.push(node);
  ant.initialNode = node.id;
  ants.push(ant);
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
		
function Ant(i,x,y){
		this.id = i;//id муравья 
		this.x = x;//координата х муравья 
		this.y = y;//координата у муравья 
		this.initialNode = i;//стратовый узел 
		this.currentNode = i;//текущий узел 
		this.nextNode = -1;//следующий узел 
		this.angle = 0;//угол 
		this.callback = null;//хз 
		this.start = false;
		this.nodesToVisit;//узлы, которые надо посетить 
		this.visitedNodes;//посещенные узлы 
		this.path = new Array(nodes.length);//путь 
		//функция начальной инициализации 
		this.init = function(){
			//создаем массивы для путей и узлов
			this.nodesToVisit = new Array();
			this.visitedNodes = new Array();
			this.path = new Array(nodes.length);
			//добавляем в посещенные узлы текущий узел 
			this.visitedNodes.push(this.initialNode);
			this.currentNode = this.initialNode;
			this.nextNode = -1;
			//проходим по всем узлам и добавляем в массив с узлами те узлы, которые не являются начальным 
			for(var i=0;i<nodes.length;i++){
	  			if(i != this.initialNode){
	  				this.nodesToVisit.push(i);
	  			}
	  		}
	  		//console.log(this.nodesToVisit);
	  		//составляем массив путей 
	  		//типо дуга из текущего узла в следующий 
	  		//дуга из следующего в текущий 
	  		//ставим нули, так как не были в них
	  		for(var i=0;i<nodes.length;i++){
	  			this.path[i] = new Array(nodes.length);
	  			for(var j=0;j<nodes.length;j++){
	  				this.path[i][j] = 0;
	  			}
	  		}	  		
		}
		//функция отвечающая за передвижение по узлам 
		this.move = function(){
			//зачем это? хз
			//console.log("in move")
			if(this.start === false){
				return;
			}
			//если не существует следующего узла, то он (начинает иезучение текущего?)
			if(this.nextNode == -1){
				this.nextNode = this.doExploration(this.currentNode);
			}
			//определяем следущий узел 
			var node = nodes[this.nextNode];
			this.x = node.x;			
			this.y = node.y;

			var x = (node.x-this.x);
			var y = (node.y-this.y);
			var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
			//Проверка, находится ли муравей в узле 
		    //помечаем дугу, как посещенную
		    //console.log(this.visitedNodes);
		    //console.log(this.nextNode);
			if(Math.pow((node.x - this.x),2) + Math.pow((node.y - this.y),2) <= Math.pow(node.radius,2)){
				this.path[this.currentNode][this.nextNode] = 1; 
				this.path[this.nextNode][this.currentNode] = 1;
				//Помечаем узел, как опсещенный 
				this.visitedNodes.push(this.nextNode)
				//Определяем новую позицию муравья 
				this.currentNode = this.nextNode;
				this.nextNode = -1;	
				this.x = node.x;			
				this.y = node.y;
				//если закончились узлы, которые надо посетить, то возвращаемся в исходный 
				//console.log(15);
				//console.log(this.nodesToVisit.length);
				if(this.nodesToVisit.length == 0){
					if(this.currentNode !== this.initialNode){
						this.nextNode = this.initialNode;
						console.log("Change");
					}else{
						this.start = false;
						if(this.callback !== null){
							this.callback();
						}						
					}
				}
			}
		}
		//функиця исследования
		this.doExploration = function(i){
			var nextNode = -1;
			var sum = 0.0;

			// обновляем сумму феромонов 
			this.nodesToVisit.forEach(function(j) {
				if (tau[i][j] == 0.0) {
					throw "tau == 0.0";
				}

				var tij = Math.pow(tau[i][j], ALPHA);
				var nij = Math.pow(getNij(i,j), BETA);
				sum += tij * nij;				
			});

			if (sum == 0.0) {
				throw "sum == 0.0";
			}
			//создаем массив с вероятностями длинной всех путей 
			var probability = new Array(nodes.length);
			//заполняем вероятности нулями 
			for(var j=0;j<probability.length;j++){
				probability[j] = 0.0;
			}
			//аннулируем сумму вероятностей 
			var sumProbability = 0.0;
			//для каждого узла, который надо посетить, высчитываем индивидуальную вероятность
			this.nodesToVisit.forEach(function(j) {
				var tij = Math.pow(tau[i][j], ALPHA);
				var nij = Math.pow(getNij(i,j), BETA);
				probability[j] = (tij * nij) / sum;
				sumProbability += probability[j];
			});

			// выбираем следующий узел основываясь на вероятности 
			nextNode = rouletteWheel(probability, sumProbability);

			if (nextNode == -1) {
				throw "nextNode == -1";
			}

			// находим и вырезаем узел из массива 
			var i = this.nodesToVisit.indexOf(nextNode);
			if(i != -1) {
				this.nodesToVisit.splice(i, 1);
			}else{
				throw "indexOf not found";
			}
			//console.log(this.nodesToVisit);
			return nextNode;
		}
	}
//стартовые параметры феромонов и т.д при старте 
function initParameters(){
  		if(tau === null){
			//создание феромона и матрицы расстояний 
			tau = new Array(nodes.length);
			dist = new Array(nodes.length);
			bestSolution = null;

			for (var i = 0; i < nodes.length; i++) {
		    	tau[i] = new Array(nodes.length);
		    	dist[i] = new Array(nodes.length);
		    	for(var j=0;j<nodes.length;j++){
		  			tau[i][j] = 1;
		  			dist[i][j] = 0;
		  		}
		  	}

		  	//переводим координаты в расстояние для каждого узла 
		  	for (var i = 0; i < nodes.length; i++) {
				for (var j = i; j < nodes.length; j++) {
					if (i != j) {
						var x1 = nodes[i].x;
						var y1 = nodes[i].y;
						var x2 = nodes[j].x;
						var y2 = nodes[j].y;

						dist[i][j] = euclideanDistance(x1,y1,x2,y2);
						dist[j][i] = dist[i][j];
					}
				}
			}			
		}
		//инициализируем всех муравьев и даем им двигаться
		ants.forEach(function(ant) {
			ant.init();	
	  		ant.start = true;
	  	});
}
  //высчитываем лучшее значение для выбора узла (или не лучшее значение)
 function rouletteWheel(probability, sumProbability) {
		var j = 0;
		var p = probability[j];
		var r = 0.0 + (Math.random() * (sumProbability - 0.0)) 
		
		while (p < r) {
			j = j + 1;
			p = p + probability[j];
		}

		return j;
	}
//перевод из радиан в градусы 
function toDegrees(radians){
		return radians * (180/Math.PI);
	}
//высчитывание расстояния по координатам 
function euclideanDistance(x1,y1, x2, y2){
	    var xDistance = Math.abs(x1 - x2);
	    var yDistance = Math.abs(y1 - y2);

		return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// берем значени N ij 
function getNij(i,j){
		return 1.0 / dist[i][j];
}
//рисует лучший путь
function drawBestSolution(ant){
	//console.log(ant);
		if(ant == null){
			return;
		}
		console.log(1);
		ctx.beginPath();
		for (var h = 1; h < ant.visitedNodes.length; h++) {
			var i = ant.visitedNodes[h - 1];
			var j = ant.visitedNodes[h];
			
			drawLine(nodes[i].x-4,nodes[i].y-4,nodes[j].x-4,nodes[j].y-4,2,"red");
		}
}
function Start(){
	nodes.forEach(function(node) {
			node.ant.x = node.x;
			node.ant.y = node.y;
			node.ant.init();
		});
	initParameters();
	start();
	drawBestSolution(bestSolution);
}
 function start(){	
	
		move(function(){
			console.log(ants);
			ants.forEach(function(ant) {
				ant.start = true;
				console.log("This ant")
				console.log(ant);
				ant.init();

				
			});			
		})
}
var finishedAnts = 0;

function move(callback){
	console.log("move");
		ants.forEach(function(ant) {
			while(ant.start!=false){
			ant.move();
			console.log(ant);
			ant.callback = function(){
				finishedAnts++;
				console.log(4);
				if(bestSolution == null ||  evaluate(ant) < evaluate(bestSolution)){
					bestSolution = clone(ant);
					console.log(1);
				}

				if(finishedAnts == ants.length){
					globalUpdateRule();
					finishedAnts = 0;
				
				console.log(callback);
					if(callback !== null){
						callback();
					}				
				}
			}
		}
			

		});

	drawBestSolution(bestSolution);
}
	function evaluate(ant){
		var totalDistance = 0;
		console.log(3);
		for (var h = 1; h < ant.visitedNodes.length; h++) {
			var i = ant.visitedNodes[h - 1];
			var j = ant.visitedNodes[h];
			totalDistance += dist[i][j];
		}

		return totalDistance;
	}

	function globalUpdateRule(){
		for (var i = 0; i < nodes.length; i++) {
			for (var j = i; j < nodes.length; j++) {
				if (i != j) {
					var deltaTau = 0.0;

					for (var k = 0; k < ants.length; k++) {
						if (ants[k].path[i][j] == 1) {
							//deltaTau += p.getDeltaTau(ant[k], i, j);
							deltaTau += Q / evaluate(ants[k]);
						}
					}

					var evaporation = (1.0 - RHO) * tau[i][j];
					var deposition = deltaTau;				

					tau[i][j] = evaporation + deposition;
					tau[j][i] = evaporation + deposition;
				}
			}
		}
	}	
function clone(obj) {
	    // Handle the 3 simple types, and null or undefined
	    if (null == obj || "object" != typeof obj) return obj;

	    // Handle Date
	    if (obj instanceof Date) {
	        var copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Array
	    if (obj instanceof Array) {
	        var copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {
	            copy[i] = clone(obj[i]);
	        }
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        var copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	        }
	        return copy;
	    }

	    throw new Error("Unable to copy obj! Its type isn't supported.");
	}