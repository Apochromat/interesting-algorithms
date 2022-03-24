var canvas = document.getElementById("canvasCluster");
var ctx = canvas.getContext("2d");

var CONFIG_NODE_COLOR = "#f5003b";	
var CONFIG_TEXT_COLOR = "#ffffff";
var OPTION_NEW_NODE = 1;
var OPTION_MOVE_NODE = 2;
var OPTION_REMOVE_NODE = 3;
var ANT_ID = 0;
var NODE_ID = 0;
var ALPHA = 1;
var BETA = 2;
var RHO = 0.1;
var Q = 1;

var mouseX = 0;
var mouseY = 0;
var nodes = new Array();//массив будующих узлов 
var ants = new Array(); // массив муравьев 
var selectedNode = null;
var tau = null;
var dist = null;
var animationSpeed = 20;
var bestSolution = null;
var showPheromone = true;
var showBestSolution = false;
var intervalID = 0;
var showAnts = true;
var what = "click";
var isRunning = false;

function Node(id,ant,mouseX,mouseY){
		id; 
		ant; 
		x = mouseX;
		y = mouseY;
		radius = 15;
	}
function Ant(i,x,y){
		this.id = i;
		this.x = x;
		this.y = y;
		this.initialNode = i;
		this.currentNode = i;
		this.nextNode = -1;
		this.angle = 0;
		this.callback = null;
		this.start = false;
		this.nodesToVisit;
		this.visitedNodes;
		this.path = new Array(nodes.length);

		this.init = function(){
			this.nodesToVisit = new Array();
			this.visitedNodes = new Array();
			this.path = new Array(nodes.length);
			this.visitedNodes.push(this.initialNode);
			this.currentNode = this.initialNode;
			this.nextNode = -1;
			this.angle = 0;

			for(var i=0;i<nodes.length;i++){
	  			if(i != this.initialNode){
	  				this.nodesToVisit.push(i);
	  			}
	  		}

	  		for(var i=0;i<nodes.length;i++){
	  			this.path[i] = new Array(nodes.length);
	  			for(var j=0;j<nodes.length;j++){
	  				this.path[i][j] = 0;
	  			}
	  		}	  		
		}
		
		this.move = function(){
			if(this.start === false){
				return;
			}

			if(this.nextNode == -1){
				this.nextNode = this.doExploration(this.currentNode);
			}

			var node = nodes[this.nextNode];
			
			if ( ! showAnts){
				this.x = node.x;			
				this.y = node.y;
			}

			//Define the angle
			
			var x = (node.x-this.x);
			var y = (node.y-this.y);
			var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));

			if(x > 0 && y < 0){	//Primeiro Quadrante
				this.angle = 90 - toDegrees(Math.asin(Math.abs(y/z)))
			}else if(x > 0 && y > 0){	//Segundo Quadrante
				this.angle = 180 - toDegrees(Math.acos(Math.abs(y/z)));
			}else if(x < 0 && y > 0){	//Terceiro Quadrante
				this.angle = 180 + toDegrees(Math.acos(Math.abs(y/z)))
			}else if(x < 0 && y < 0){	//Quarto Quadrante
				this.angle = toDegrees(Math.asin(x/z));
			}else if(y == 0 && x < 0){
				this.angle = -90;
			}else if(y == 0 && x > 0){
				this.angle = 90;
			}else if(y > 0 && x == 0){
				this.angle = -180;
			}

			//Move the ant

			if (showAnts){
				//Only move the ant if the show ant options is selected
				var cos0 = y/z;
				var sen0 = x/z;
				var antSpeed = 10;

				if(animationSpeed <= 20){
					antSpeed = animationSpeed;
				}else{
					antSpeed = 20;
				}

				this.y += antSpeed*cos0;
				this.x += antSpeed*sen0;
			}

			//Verify if the ant is into the Node
			if(Math.pow((node.x - this.x),2) + Math.pow((node.y - this.y),2) <= Math.pow(node.radius,2)){
				//Mark arc as visited
				this.path[this.currentNode][this.nextNode] = 1; 
				this.path[this.nextNode][this.currentNode] = 1;

				//Mark node as visited;
				this.visitedNodes.push(this.nextNode)

				//Define new position
				this.currentNode = this.nextNode;
				this.nextNode = -1;	
				this.x = node.x;			
				this.y = node.y;
				if(this.nodesToVisit.length == 0){
					//Back to initial node
					if(this.currentNode !== this.initialNode){
						this.nextNode = this.initialNode;
					}else{
						//Finished the tour
						this.start = false;
						if(this.callback !== null){
							this.callback();
						}						
					}
				}
			}
		}

		this.doExploration = function(i){
			var nextNode = -1;
			var sum = 0.0;

			// Update the sum
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

			var probability = new Array(nodes.length);
			
			for(var j=0;j<probability.length;j++){
				probability[j] = 0.0;
			}

			var sumProbability = 0.0;

			this.nodesToVisit.forEach(function(j) {
				var tij = Math.pow(tau[i][j], ALPHA);
				var nij = Math.pow(getNij(i,j), BETA);
				probability[j] = (tij * nij) / sum;
				sumProbability += probability[j];
			});

			// Select the next node by probability
			nextNode = rouletteWheel(probability, sumProbability);

			if (nextNode == -1) {
				throw "nextNode == -1";
			}

			// Find and remove node from an array
			var i = this.nodesToVisit.indexOf(nextNode);
			
			if(i != -1) {
				this.nodesToVisit.splice(i, 1);
			}else{
				throw "indexOf not found";
			}

			return nextNode;
		}
	}
function clearCanvas(){
  canvas.removeEventListener("mousedown", pushPointListener);
  coordsPoint = [];
  coordsPointCluster = [];
  fiilCanvas();
}
function fiilCanvas() {
  canvas.width = window.innerWidth*0.56;
  canvas.height = window.innerHeight*0.6;
  ctx.fillStyle = "rgba(211, 211, 211, 0)";
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 5;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}
function resetAll(){
		console.log("[LOG] ResetAll");
		tau = null;
		dist = null;
		bestSolution = null;
		
		nodes.forEach(function(OPTION_NEW_NODE) {
			node.ant.x = node.x;
			node.ant.y = node.y;
			node.ant.init();
		});
	}		
function pushPointListener(e) {
	resetAll();
	var ant = new Ant(ANT_ID++,mouseX,mouseY);
	var node = new Node(NODE_ID++,ant,mouseX,mouseY);
	ant.initialNode = node.id;
	ants.push(ant);
	nodes.push(node);
	draw();
}

function draw(){
		console.log("1");		
		//очищаем экран перед рисованием 
		ctx.clearRect (0 , 0 , canvas.width,canvas.height );		
		
		if(showBestSolution === true){
			drawBestSolution(bestSolution);
			drawBestPathValue();
		}
		drawNodes();	
	}
function drawNodes(){
		nodes.forEach(function(node) {
			drawCircle(node);
		});//типр для каждого узла рисуется круг
	}	
function drawCircle(node){
		ctx.beginPath();//начало пути 
		if(node == selectedNode){
			ctx.fillStyle = shadeColor1(CONFIG_NODE_COLOR,-40); //если узел и выбранный узел совпадают, то меняется оттенок 
		}else{
			ctx.fillStyle = CONFIG_NODE_COLOR; 
		}
		ctx.arc(node.x,node.y, node.radius, 0, 2 * Math.PI, false);//делается круг для узла 
		ctx.arc(node.x,node.y, node.radius, 0, 2 * Math.PI, false);
		ctx.fill();	 //типо расскрашивает узел 
		ctx.fillStyle = CONFIG_TEXT_COLOR;
		ctx.font="10px Arial";
		ctx.fillText(node.id,node.x-3,node.y+2);
	}
function NewNode(){
  canvas.addEventListener("mousedown", pushPointListener);
}
// (function() {
// 	//дефолтные настройки 
// 	var CONFIG_NODE_COLOR = "#f5003b";	
// 	var CONFIG_TEXT_COLOR = "#ffffff";
// 	var OPTION_NEW_NODE = 1;
// 	var OPTION_MOVE_NODE = 2;
// 	var OPTION_REMOVE_NODE = 3;
// 	var ANT_ID = 0;
// 	var NODE_ID = 0;
// 	var ALPHA = 1;
// 	var BETA = 2;
// 	var RHO = 0.1;
// 	var Q = 1;

// 	var mouseX = 0;
// 	var mouseY = 0;
// 	var canvas = document.getElementById("canvas");
// 	var ctx = canvas.getContext("2d");
// 	var nodes = new Array();//массив будующих узлов 
// 	var ants = new Array(); // массив муравьев 
// 	var selectedOption = OPTION_NEW_NODE;
// 	var selectedNode = null;
// 	var tau = null;
// 	var dist = null;
// 	var animationSpeed = 20;
// 	var bestSolution = null;
// 	var showPheromone = true;
// 	var showBestSolution = false;
// 	var intervalID = 0;
// 	var showAnts = true;
// 	var what = "click";
// 	var isRunning = false;

// 	//картинка муравья 
// 	var imgAnt = new Image();	
// 	imgAnt.src = 'img/ant.png';
// 	//функция для определния вершины 
// 	function Node(id,ant,mouseX,mouseY){
// 		id; 
// 		ant; 
// 		x = mouseX;
// 		y = mouseY;
// 		radius = 15;
// 	}
// 	//функция муравья 
// 	function Ant(i,x,y){
// 		id = i;
// 		x = x;
// 		y = y;
// 		initialNode = i;
// 		currentNode = i;
// 		nextNode = -1;
// 		angle = 0;
// 		callback = null;
// 		start = false;
// 		nodesToVisit; //узел, который надо посетить 
// 		visitedNodes; //посещенный узел 
// 		path = new Array(nodes.length);//массив с путям длиной кол-влм всех вершин

// 		init = function(){
// 			nodesToVisit = new Array(); //массив вершин, которые надо посетить 
// 			visitedNodes = new Array(); //массив посещенных вершин 
// 			path = new Array(nodes.length); //массив с путям длиной кол-влм всех вершин
// 			visitedNodes.push(initialNode); //добавляем в самое начало массива первоначальный узел муравья 
// 			currentNode =initialNode; //тегущий узел становится стартовым 
// 			nextNode = -1; 
// 			angle = 0;
// 			//запускаем просмотр всех узлов и добавляем все, которые не совпадают с текущим
// 			for(var i=0;i<nodes.length;i++){
// 	  			if(i != initialNode){
// 	  				nodesToVisit.push(i); //вершины, которые нам надо будет посетить 
// 	  			}
// 	  		}

// 	  		for(var i=0;i<nodes.length;i++){
// 	  			path[i] = new Array(nodes.length); //создаем двумерный массив с будующей длинной? 
// 	  			for(var j=0;j<nodes.length;j++){
// 	  				path[i][j] = 0;
// 	  			}
// 	  		}	  		
// 		}
// 		//функция отвечающая за передвижение
// 		move = function(){
// 			if(start === false){
// 				return;
// 			}

// 			if(nextNode == -1){
// 				nextNode = doExploration(currentNode);//типо вернуться на старт, если нет следующего узла 
// 			}

// 			var node = nodes[nextNode];// из списка вершин выбираем следующую
			
// 			x = node.x;			
// 			y = node.y;

// 			//че то про определение углов, сам хз 
// 			var x = (node.x-x);
// 			var y = (node.y-y);
// 			var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));

// 			if(x > 0 && y < 0){	//первый квадрант и тд
// 				this.angle = 90 - toDegrees(Math.asin(Math.abs(y/z)))
// 			}else if(x > 0 && y > 0){	//Segundo Quadrante
// 				this.angle = 180 - toDegrees(Math.acos(Math.abs(y/z)));
// 			}else if(x < 0 && y > 0){	//Terceiro Quadrante
// 				this.angle = 180 + toDegrees(Math.acos(Math.abs(y/z)))
// 			}else if(x < 0 && y < 0){	//Quarto Quadrante
// 				this.angle = toDegrees(Math.asin(x/z));
// 			}else if(y == 0 && x < 0){
// 				this.angle = -90;
// 			}else if(y == 0 && x > 0){
// 				this.angle = 90;
// 			}else if(y > 0 && x == 0){
// 				this.angle = -180;
// 			}
// 				var cos0 = y/z;
// 				var sen0 = x/z;
// 				var antSpeed = 10;
// 				//тут базар про скорость муравьев
// 				if(animationSpeed <= 20){
// 					antSpeed = animationSpeed;
// 				}else{
// 					antSpeed = 20;
// 				}

// 				this.y += antSpeed*cos0;
// 				this.x += antSpeed*sen0;

// 			//проверка на нахождение муравья в узле 
// 			if(Math.pow((node.x - this.x),2) + Math.pow((node.y - this.y),2) <= Math.pow(node.radius,2)){
// 				//отметить дугу, как посещенную
// 				path[currentNode][nextNode] = 1; 
// 				path[nextNode][currentNode] = 1;

// 				//пометить узел как посещенный
// 				visitedNodes.push(nextNode)

// 				//определение следующего узла
// 				currentNode = nextNode;
// 				nextNode = -1;	
// 				x = node.x;			
// 				y = node.y;
// 				if(nodesToVisit.length == 0){
// 					//возвращение к начальному узлу
// 					if(currentNode !== initialNode){
// 						nextNode = initialNode;
// 					}else{
// 						//закончить обход
// 						start = false;
// 						if(callback !== null){
// 							callback();
// 						}						
// 					}
// 				}
// 			}
// 		}
// 		//функция отвечающая за разведку
// 		doExploration = function(i){
// 			var nextNode = -1;
// 			var sum = 0.0;

// 			// обновление суммы??
// 			//выполняется функция по одному разу для каждого элемента 
// 			nodesToVisit.forEach(function(j) {
// 				//углы мб или феромоны???
// 				var tij = Math.pow(tau[i][j], ALPHA);
// 				var nij = Math.pow(getNij(i,j), BETA);
// 				sum += tij * nij;				
// 			});
// 			//создали массив с вероятностью 
// 			var probability = new Array(nodes.length);
// 			//занулили вероятность 
// 			for(var j=0;j<probability.length;j++){
// 				probability[j] = 0.0;
// 			}
// 			//сумма вероятности 
// 			var sumProbability = 0.0;
// 			//для каждого узла для посещения определяется феромон???? 
// 			nodesToVisit.forEach(function(j) {
// 				var tij = Math.pow(tau[i][j], ALPHA);
// 				var nij = Math.pow(getNij(i,j), BETA);
// 				probability[j] = (tij * nij) / sum;
// 				sumProbability += probability[j];
// 			});

// 			// выбор следующего узла основываясь на вероятности
// 			nextNode = rouletteWheel(probability, sumProbability);

// 			// поиск и удаление узла из массива 
// 			var i = nodesToVisit.indexOf(nextNode);//по первому индексу
			
// 			if(i != -1) {
// 				nodesToVisit.splice(i, 1); //типо заменяем элемент на 1
// 			}else{
// 				throw "indexOf not found";
// 			}

// 			return nextNode;
// 		}
// 	}

// 	//высчитывание вероятности типо???
// 	function rouletteWheel(probability, sumProbability) {
// 		var j = 0;
// 		var p = probability[j];
// 		var r = 0.0 + (Math.random() * (sumProbability - 0.0)) 
		
// 		while (p < r) {
// 			j = j + 1;
// 			p = p + probability[j];
// 		}

// 		return j;
// 	}
// 	//хз че это делает 
// 	function getNij(i,j){
// 		return 1.0 / dist[i][j];
// 	}
// 	//евклидово расстояние, чтобы это не значило 
// 	function euclideanDistance(x1,y1, x2, y2){
// 	    var xDistance = Math.abs(x1 - x2);
// 	    var yDistance = Math.abs(y1 - y2);
// 		return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
// 	}
// 	//перевод из радиан в градусы 
// 	function toDegrees(radians){
// 		return radians * (180/Math.PI);
// 	}
// 	//изменение размера окна 
// 	function resizeCanvas() {
// 		canvas.width = $("#panel").width();
// 		canvas.height = $(window).height() - $("#navbar").height() - $(".sec-nav-bar").height()-60;
// 	}	
// 	//рисование круга для узла 
// 	function drawCircle(node){
// 		ctx.beginPath();//начало пути 
// 		if(node == selectedNode){
// 			ctx.fillStyle = shadeColor1(CONFIG_NODE_COLOR,-40); //если узел и выбранный узел совпадают, то меняется оттенок 
// 		}else{
// 			ctx.fillStyle = CONFIG_NODE_COLOR; 
// 		}
// 		ctx.arc(node.x,node.y, node.radius, 0, 2 * Math.PI, false);//делается круг для узла 
// 		ctx.arc(node.x,node.y, node.radius, 0, 2 * Math.PI, false);
// 		ctx.fill();	 //типо расскрашивает узел 
// 		ctx.fillStyle = CONFIG_TEXT_COLOR;
// 		ctx.font="10px Arial";
// 		ctx.fillText(node.id,node.x-3,node.y+2);
// 	}
// 	//функция для определения оттенка цвета??
// 	function shadeColor1(color, percent) {  
// 		var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
// 		return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
// 	}
// 	//рисование лучшего значения пути, который найдут муравьи 
// 	function drawBestPathValue(){
// 		var text = "Best Path Value is ";
		
// 		ctx.beginPath();		
// 		ctx.fillStyle = "red";
// 		ctx.font="12px Arial";

// 		if(bestSolution !== null){
// 			text += evaluate(bestSolution);
// 		}else{
// 			text += "Infinite";
// 		}

// 		ctx.fillText(text,10,20);
// 	}
// //рисование лучшего  пути, который найдут муравьи 
// 	function drawBestSolution(ant){
// 		if(ant == null){
// 			return;
// 		}

// 		ctx.beginPath();
			
// 		for (var h = 1; h < ant.visitedNodes.length; h++) {
// 			var i = ant.visitedNodes[h - 1];
// 			var j = ant.visitedNodes[h];
			
// 			drawLine(nodes[i].x-4,nodes[i].y-4,nodes[j].x-4,nodes[j].y-4,2,"red");
// 		}
// 	}
// 	//функция для рисования линии??
// 	function drawLine(x0,y0,x1,y1,lineWidth,color){
// 		ctx.beginPath();
// 		ctx.strokeStyle = color;
// 		ctx.lineWidth = lineWidth;
// 		ctx.moveTo(x0, y0);
// 		ctx.lineTo(x1, y1);			
// 		ctx.stroke();
// 	}
// 	//функция для рисования???
// 	function draw(){		
// 		//очищаем экран перед рисованием 
// 		ctx.clearRect (0 , 0 , canvas.width,canvas.height );		
		
// 		if(showBestSolution === true){
// 			drawBestSolution(bestSolution);
// 			drawBestPathValue();
// 		}

// 		if(showPheromone){
// 			drawPheromone();
// 		}
		
// 		drawNodes();

// 		if(showAnts){
// 			drawAnts();
// 		}		
// 	}
// 	//функция для рисования феромона 
// 	function drawPheromone(){
// 		for(var i=0; i<nodes.length; i++){
// 			for(var j=0; j<nodes.length; j++){
// 				if(i != j){
// 					if(tau === null){
// 						drawLine(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y,1,"black");
// 					}else{
// 						drawLine(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y,tau[i][j],"black");
// 					}
// 				}
// 			}
// 		}		
// 	}
// 	//функция для рисования муравья 
// 	function drawAnts(){
// 		ants.forEach(function(ant) {
// 			ctx.save();
// 			ctx.translate(ant.x, ant.y);
// 			ctx.rotate(ant.angle*(Math.PI/180));
// 			ctx.translate(-ant.x, -ant.y);
// 			ctx.drawImage(imgAnt, ant.x-10, ant.y-10,20,20);
// 			ctx.restore();			
// 		});
// 	}
// 	//функция для рисования узла 
// 	function drawNodes(){
// 		nodes.forEach(function(node) {
// 			drawCircle(node);
// 		});//типр для каждого узла рисуется круг
// 	}	
// 	//походу функция для того, чтобы поставить узел 
// 	function getSelectedNode(mouseX,mouseY){
// 		var selectedNode = null;
		
// 		nodes.forEach(function(node) {
// 			//проверить нахождение муравья внутри узла 
// 			if(Math.pow((node.x - mouseX),2) + Math.pow((node.y - mouseY),2) <= Math.pow(node.radius,2)){
// 				selectedNode = node;
// 			}			
// 		});	
		
// 		return selectedNode;
// 	}
	
// 	function remove(array,element){
// 		// нахождение и удаление эллемнта из массива 
// 		var i = array.indexOf(element);
// 		if(i != -1) {
// 			array.splice(i, 1);
// 		}
// 	}
// 	//тут типо чекается что за объект еам дают, а потом копируется 
// 	function clone(obj) {
// 	    // данные для обработки 
// 	    if (obj instanceof Date) { //проверяет есть ли в объекте Дата 
// 	        var copy = new Date(); 
// 	        copy.setTime(obj.getTime());
// 	        return copy; // че то за мутки с датой
// 	    }

// 	    // работа с массивом 
// 	    if (obj instanceof Array) {
// 	        var copy = [];
// 	        for (var i = 0, len = obj.length; i < len; i++) {
// 	            copy[i] = clone(obj[i]);
// 	        }
// 	        return copy;
// 	    }

// 	    // работа с объектом 
// 	    if (obj instanceof Object) {
// 	        var copy = {};
// 	        for (var attr in obj) {
// 	            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
// 	        }
// 	        return copy;
// 	    }
// 	}
// 	//гасит все кнопки 
// 	function desactiveAllButtons(){
// 		$(".action-button").removeClass('active');
// 	}
// 	//разгашивает все кнопки 
// 	function enableAllButtons(){
// 		$(".action-button").removeAttr('disabled');		
// 	}
// //
// 	function disableAllButtons(){
// 		$(".action-button").attr('disabled','disabled');		
// 	}
	
// 	//убирает контекстное меню, если нажать правой кнопкой 
// 	$(document).bind("contextmenu",function(e){
// 		return false;
// 	});
// 	//фиксирует движение мышкой 
// 	$( "canvas" ).mousemove(function( event ) {
// 		var rect = canvas.getBoundingClientRect();
// 		mouseX = event.clientX - rect.left;
// 		mouseY = event.clientY - rect.top;
		
// 		if (selectedOption == OPTION_MOVE_NODE){
// 			if(selectedNode !== null){
// 				resetAll();
				
// 				selectedNode.x = mouseX;
// 				selectedNode.y = mouseY;			
				
// 				draw();
// 			}
// 		}
// 		//фиксирует нажатия мышкой хз по чему 
// 	}).click(function(event) {
// 		if (selectedOption == OPTION_NEW_NODE){
// 			resetAll();			
// 			var ant = new Ant(ANT_ID++,mouseX,mouseY);
// 			var node = new Node(NODE_ID++,ant,mouseX,mouseY);
// 			ant.initialNode = node.id;
// 			ants.push(ant);
// 			nodes.push(node);
// 			draw();
// 		}else if (selectedOption == OPTION_REMOVE_NODE){
// 			var selectedNode = getSelectedNode(mouseX,mouseY);
// 			if(selectedNode !== null){
// 				if(confirm("Do you want to delete the node "+selectedNode.id)){
// 					remove(ants,selectedNode.ant);
// 					remove(nodes,selectedNode);	
					
// 					resetAll();

// 					//Restart the all index
// 					var index = 0;
// 					nodes.forEach(function(nodes) {
// 						nodes.id = index++;
// 						nodes.ant.initialNode = nodes.id;						
// 					});
// 					//update que next node index
// 					NODE_ID = index;
					
// 					draw();
// 				}
// 			}
// 		}
// 		//срабатыает при первоначальном нажатии кнопки, без отпускания 
// 	}).mousedown(function() {
// 		if (selectedOption == OPTION_MOVE_NODE || selectedOption == OPTION_REMOVE_NODE){
// 			selectedNode = getSelectedNode(mouseX,mouseY);
// 			if(selectedNode != null){
// 				draw();
// 			}
// 		}		
// 		//противоположность дауну 
// 	}).mouseup(function() {
// 		selectedNode = null	
// 		draw();
// 	});
// 	//отображает можальное окно 
// 	$("#about").click(function(event) {
// 		$('#myModal').modal('show');
// 	});
// 	//выбирает создание нового узла, отключает другие кнопки 
// 	$("#new-node").click(function(event) {
// 		desactiveAllButtons();
// 		$(this).addClass("active");
// 		selectedOption = OPTION_NEW_NODE;		
// 	});
// 	//выбирает движение, отключает другие кнопки 
// 	$("#move").click(function(event) {
// 		desactiveAllButtons();
// 		$(this).addClass("active");
// 		selectedOption = OPTION_MOVE_NODE;		
// 	});
	
// 	$("#remove").click(function(event) {
// 		desactiveAllButtons();
// 		$(this).addClass("active");
// 		selectedOption = OPTION_REMOVE_NODE;		
// 	});

// 	$("#start").click(function(event) {
// 		if(nodes.length <= 1){
// 			alert("Before, you must add at least two nodes");
// 			return;
// 		}
		
// 		disableButtonsWhileIsRunning();
// 		initParameters();
// 		start();
// 	});

// 	$("#step").click(function(event) {
// 		if(nodes.length <= 1){
// 			alert("Before, you must add at least two nodes");
// 			return;
// 		}

// 		disableButtonsWhileIsRunning();
// 		initParameters();
// 		intervalID = setInterval(step,getAnimationSpeed());
// 	});

// 	$("#stop").click(function(event) {
// 		enableButtonsWhenIsStop();
// 		clearInterval(intervalID);		
// 	});

// 	$("#clear-all").click(function(event) {
// 		if(confirm("Are you sure?")){
// 			ants = new Array();
// 			nodes = new Array();
// 			ANT_ID = 0;
// 			NODE_ID = 0;
// 			bestSolution = null;
// 			draw();
// 		}
// 	});

// 	$('.colorpicker-node-color').colorpicker({color:CONFIG_NODE_COLOR})
// 	$('.colorpicker-text-color').colorpicker({color:CONFIG_TEXT_COLOR})

// 	$('.colorpicker-node-color').colorpicker().on('changeColor', function(ev){
// 	  	CONFIG_NODE_COLOR = ev.color.toHex();
// 	  	draw();
// 	});

// 	$('.colorpicker-text-color').colorpicker().on('changeColor', function(ev){
// 	  	CONFIG_TEXT_COLOR = ev.color.toHex();
// 	  	draw();
// 	});

// 	$('#slider-rho').slider({
// 		min: 0,
// 		max: 1,
// 		step: 0.1,
// 		value: RHO
// 	}).on('slide', function (ev) {
// 		RHO = ev.value;		
//     });

//     $('#slider-q').slider({
// 		min: 1,
// 		max: 10,		
// 		value: Q
// 	}).on('slide', function (ev) {
// 		Q = ev.value;		
//     });

// 	$('#slider-animation').slider({
// 		min: 1,
// 		max: 40,
// 		value: animationSpeed
// 	}).on('slide', function (ev) {
// 		animationSpeed = ev.value;		
//     });

// 	$('#slider-alpha').slider({
// 		min: 0,
// 		max: 5,
// 		step: 0.5,
// 		value: ALPHA
// 	}).on('slide', function (ev) {
//         ALPHA = ev.value;
//     });
//     $('#slider-beta').slider({
// 		min: 0,
// 		max: 5,
// 		step: 0.5,
// 		value: BETA
// 	}).on('slide', function (ev) {
//         BETA = ev.value;
//     });

// 	$( "#select-show-pheromone" ).val(showPheromone.toString());
// 	$( "#select-show-best-solution" ).val(showBestSolution.toString());
// 	$( "#select-show-ants" ).val(showAnts.toString());

// 	$( "#select-show-pheromone" ).change(function () {
// 		if(this.value == "true"){
// 			showPheromone = true;	
// 		}else{
// 			showPheromone = false;
// 		}
		
// 		draw();
//   	});

//   	$( "#select-show-best-solution" ).change(function () {
// 		if(this.value == "true"){
// 			showBestSolution = true;	
// 		}else{
// 			showBestSolution = false;
// 		}
		
// 		draw();
//   	});

//   	$( "#select-show-ants" ).change(function () {
// 		if(this.value == "true"){
// 			showAnts = true;	
// 		}else{
// 			showAnts = false;
// 		}
		
// 		draw();
//   	});

//   	$( window ).resize(function() {
// 		resizeCanvas();
// 		draw();
// 	});

//   	function enableButtonsWhenIsStop(){
//   		enableAllButtons()	
// 		$("#stop").attr('disabled','disabled');
//   	}

//   	function disableButtonsWhileIsRunning(){
//   		disableAllButtons()	
// 		$("#stop").removeAttr('disabled');
//   	}
//   	//возвращает все в старотовую позицию	
//   	function initParameters(){
//   		if(tau === null){
//   			console.log("Creating a new pheromone matrix...");
// 			//Create the pheremone and distance matrix
// 			tau = new Array(nodes.length);
// 			dist = new Array(nodes.length);
// 			bestSolution = null;

// 			for (var i = 0; i < nodes.length; i++) {
// 		    	tau[i] = new Array(nodes.length);
// 		    	dist[i] = new Array(nodes.length);
// 		    	for(var j=0;j<nodes.length;j++){
// 		  			tau[i][j] = 1;
// 		  			dist[i][j] = 0;
// 		  		}
// 		  	}

// 		  	//convert coordinates to distance()
// 		  	for (var i = 0; i < nodes.length; i++) {
// 				for (var j = i; j < nodes.length; j++) {
// 					if (i != j) {
// 						var x1 = nodes[i].x;
// 						var y1 = nodes[i].y;
// 						var x2 = nodes[j].x;
// 						var y2 = nodes[j].y;

// 						dist[i][j] = euclideanDistance(x1,y1,x2,y2);
// 						dist[j][i] = dist[i][j];
// 					}
// 				}
// 			}			
// 		}

// 		ants.forEach(function(ant) {
// 			ant.init();	
// 	  		ant.start = true;
// 	  	});
//   	}	
// 	//ресетит все
// 	function resetAll(){
// 		console.log("[LOG] ResetAll");
// 		tau = null;
// 		dist = null;
// 		bestSolution = null;
		
// 		nodes.forEach(function(node) {
// 			node.ant.x = node.x;
// 			node.ant.y = node.y;
// 			node.ant.init();
// 		});
// 	}				
// //старт
// 	function start(){
// 		clearInterval(intervalID);
		
// 		move(function(){
// 			ants.forEach(function(ant) {
// 				ant.start = true;
// 				ant.init();
// 			});			
// 		})
				
// 		intervalID = setInterval(start, getAnimationSpeed());
// 	}
// //штука, чтобы по шагам показывать 
// 	function step(){
// 		move(function(){
// 			enableButtonsWhenIsStop();
// 			clearInterval(intervalID);
// 		})
// 	}

// 	var finishedAnts = 0;
// //че то про движение 
// 	function move(callback){
// 		ants.forEach(function(ant) {
// 			ant.move();
// 			ant.callback = function(){
// 				finishedAnts++;

// 				if(bestSolution == null ||  evaluate(ant) < evaluate(bestSolution)){
// 					bestSolution = clone(ant);
// 				}

// 				if(finishedAnts == ants.length){
// 					globalUpdateRule();
// 					finishedAnts = 0;

// 					if(callback !== null){
// 						callback();
// 					}				
// 				}
// 			}
// 		});

// 		draw();
// 	}
// 	//че то про оценку 
// 	function evaluate(ant){
// 		var totalDistance = 0;

// 		for (var h = 1; h < ant.visitedNodes.length; h++) {
// 			var i = ant.visitedNodes[h - 1];
// 			var j = ant.visitedNodes[h];
// 			totalDistance += dist[i][j];
// 		}

// 		return totalDistance;
// 	}
// //обновление правил 
// 	function globalUpdateRule(){
// 		for (var i = 0; i < nodes.length; i++) {
// 			for (var j = i; j < nodes.length; j++) {
// 				if (i != j) {
// 					var deltaTau = 0.0;

// 					for (var k = 0; k < ants.length; k++) {
// 						if (ants[k].path[i][j] == 1) {
// 							//deltaTau += p.getDeltaTau(ant[k], i, j);
// 							deltaTau += Q / evaluate(ants[k]);
// 						}
// 					}

// 					var evaporation = (1.0 - RHO) * tau[i][j];
// 					var deposition = deltaTau;				

// 					tau[i][j] = evaporation + deposition;
// 					tau[j][i] = evaporation + deposition;
// 				}
// 			}
// 		}
// 	}
// //скорость для анимации 
// 	function getAnimationSpeed(){
// 		var speed = 40;

// 		if(animationSpeed > 20){
// 			speed = 40-animationSpeed;			
// 		}else{
// 			speed = 40;
// 		}

// 		return speed;
// 	}

// 	function isMobile() { 
// 		return ('ontouchstart' in document.documentElement); 
// 	}
// 	//начало 
// 	function init(){
// 		resizeCanvas();	
// 		enableButtonsWhenIsStop();
// 		draw();		
// 	}

// 	init();
// });	