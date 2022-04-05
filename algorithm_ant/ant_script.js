var canvas = document.getElementById("canvasAnt");
var ctx = canvas.getContext("2d");
var nodes = new Array(); //массив для всех городов 
var ants = new Array();  //массив для всех муравьев 
var ANT_ID = 0; //порядковый номер муравья 
var NODE_ID=0; //порядковый номер узла
//величины для подсчета феромона 
var ALPHA = 1 ;//параметр контролирующий влияние tau
var BETA = 2; //параметр контролирующий влияние nij
var RHO = 0.1; //скорость испарения феромона 
var Q = 1; //регулируемый параметр 

var mouseX = 0; 
var mouseY = 0;

var tau = null; //колличество феромона на ребре 
var dist = null; //длина 
var bestSolution = null; //лучшее решение 
//функция для определения узла 
function Node(id,ant,mouseX,mouseY){
		this.id = id;
		this.ant=ant;
		this.x = mouseX;
		this.y = mouseY;
		this.radius = 15;
}
//канвас
function fiilCanvas() {
  canvas.width = window.innerWidth*0.58;
  canvas.height = window.innerHeight*0.8;
  ctx.fillStyle = "rgba(211, 211, 211, 0)";
  ctx.strokeStyle = "whitesmoke";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}
function clearCanvas(){
   canvas.removeEventListener("mousedown", pushPointListener);
   nodes = new Array(); //массив для всех городов 
   ants = new Array();  //массив для всех муравьев 
   ANT_ID = 0; //порядковый номер муравья 
   NODE_ID=0;
//величины для подсчета феромона 
 ALPHA = 1 ;//параметр контролирующий влияние tau
 BETA = 2; //параметр контролирующий влияние nij
 RHO = 0.1; //скорость испарения феромона 
 Q = 1; //регулируемый параметр 

 mouseX = 0; 
 mouseY = 0;

 tau = null; //колличество феромона на ребре 
 dist = null; //длина 
 bestSolution = null; //лучшее решение 
//функция для определения узла 
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
  ctx.fillStyle = "red";
  ctx.fill();
  
  
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
//функция для определения муравья 	
function Ant(i,x,y){
		this.id = i;//id муравья 
		this.x = x;//координата х муравья 
		this.y = y;//координата у муравья 
		this.initialNode = i;//стратовый узел 
		this.currentNode = i;//текущий узел 
		this.nextNode = -1;//следующий узел 
		this.angle = 0;//угол 
		this.callback = null;//функция, которая сработает, после выполнения функции, в которую она передается 
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
			//движение не сработает, если не активирован старт 
			if(this.start === false){
				return;
			}
			//если не существует следующего узла, то он начинает движение из текущего
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

			if(Math.pow((node.x - this.x),2) + Math.pow((node.y - this.y),2) <= Math.pow(node.radius,2)){
				//помечаем дугу, как посещенную
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
				if(this.nodesToVisit.length == 0){
					//если не вернулись, то возращаемся 
					if(this.currentNode !== this.initialNode){
						this.nextNode = this.initialNode;
					}else{
						//если вернулись на старт, то вызываем функцию для подсчета пути 
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

			// обновляем начальную сумму феромонов 
			this.nodesToVisit.forEach(function(j) {
				//для каждого узла счиатем феромон
				var tij = Math.pow(tau[i][j], ALPHA); //это количество феромонов на ребре i,j;
				var nij = Math.pow(getNij(i,j), BETA); //привлекательность ребра i,j
				sum += tij * nij;				
			});

			//создаем массив с вероятностями длинной всех путей 
			var probability = new Array(nodes.length);
			//заполняем вероятности нулями 
			for(var j=0;j<probability.length;j++){
				probability[j] = 0.0;
			}
			//аннулируем сумму вероятностей 
			var sumProbability = 0.0;
			//для каждого узла, который надо посетить, высчитываем индивидуальный феромон
			this.nodesToVisit.forEach(function(j) {
				var tij = Math.pow(tau[i][j], ALPHA);
				var nij = Math.pow(getNij(i,j), BETA);
				//по формуле считаем феромон
				probability[j] = (tij * nij) / sum;
				sumProbability += probability[j];
			});

			// выбираем следующий узел основываясь феромонах 
			nextNode = rouletteWheel(probability, sumProbability);
			// находим и вырезаем узел из массива 
			var i = this.nodesToVisit.indexOf(nextNode);
			if(i != -1) {
				this.nodesToVisit.splice(i, 1);
			}
			return nextNode;
		}
	}
//стартовые параметры феромонов и т.д при старте 
function initParameters(){
  		if(tau === null){
			//создание матрицы феромона и  расстояний 
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
  //функция для выбора следующего узла
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
		if(ant == null){
			return;
		}
		ctx.beginPath();
		for (var h = 1; h < ant.visitedNodes.length; h++) {
			var i = ant.visitedNodes[h - 1];
			var j = ant.visitedNodes[h];
			
			drawLine(nodes[i].x-4,nodes[i].y-4,nodes[j].x-4,nodes[j].y-4,2,"red");
		}
}
//функция для старта 
function Start(){
	if(nodes.length==1){
		alert("Нужно поставить больше 1 города");
		return;
	}
	var i=0;
	initParameters();
	while (i!=100){
		i++;
	nodes.forEach(function(node) {
			node.ant.x = node.x;
			node.ant.y = node.y;
			node.ant.init();
		});
	start();
	globalUpdateRule()
}
	drawBestSolution(bestSolution);
}
 function start(){	
	
		move(function(){
			ants.forEach(function(ant) {
				ant.start = true;
				ant.init();

				
			});			
		})
}
var finishedAnts = 0;

function move(callback){
	    ants.forEach(function(ant) {ant.start=true;});
		ants.forEach(function(ant) {
			while(ant.start!=false){
			ant.move();
				
			}
			if(bestSolution == null ||  evaluate(ant) < evaluate(bestSolution)){
					bestSolution = clone(ant);
				}
		});		
		
}	
	
//функция для оценивая дистанции 
function evaluate(ant){
		var totalDistance = 0;
		for (var h = 1; h < ant.visitedNodes.length; h++) {
			var i = ant.visitedNodes[h - 1];
			var j = ant.visitedNodes[h];
			totalDistance += dist[i][j];
		}

		return totalDistance;
	}
//функция для обновления феромонов
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
	    if (null == obj || "object" != typeof obj) return obj;
	    // если надо скопировать массив 
	    if (obj instanceof Array) {
	        var copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {	
	            copy[i] = clone(obj[i]);
	        }
	        return copy;
	    }

	    // если надо скопировать объект 
	    if (obj instanceof Object) {
	        var copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	        }
	        return copy;
	    }
	}