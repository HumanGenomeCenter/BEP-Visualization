
// Worker Test
var worker = new Worker("js/worker.js");

console.time("worker");

worker.postMessage("test");
worker.onmessage = function(e) {
	console.timeEnd("worker");
	workerData = e.data;
	worker.terminate();
}



// underscore mixins
_.mixin({
	copy: function(original) {
		var copy;
		if (original instanceof Cell) {
			copy = new Cell();
		} else if (original instanceof Array) {
			copy = [];
		} else if (original instanceof Object) {
			copy = {};
		} else {
			console.log("Error. Could not make a copy.");
		}
		$.extend(true, copy, original);	// deep copy this onto a
		return copy;
	},
	has: function(arr, value) {
		if (arr.indexOf(value) >= 0) {
			return true;
		}
		return false;
	}
});



// Gobal Bep Object
var bep = {};


// Single Cell
var Cell = function(x, y, color) {
	this.x = x;
	this.y = y;
	this.color = (color === undefined) ? "#000000" : color;
	this.init();
	bep.cells[x+" "+y] = this;		// add to global cell array
}

Cell.prototype = {
	init: function() {
		this.genome = [];
		for (var i=0; i<bep.G; i++) {
			this.genome[i] = 0;
		}
		this.state = [true, false, false];
		this.rand = Math.random();
	},
	draw: function() {
		console.log("draw");
	}
}



// Get Intial Vars from UI
$(document).ready(function(){
	bep.maxBinary = parseInt($("#maxBinary").val(), 10); // = 63; // 63;//   number of digits of max long  is 63 in  the binary system 
	bep.mutationRate = parseInt($("#mutationRate").val(), 10)/1000; // = 0.001;
	bep.growthRate = parseInt($("#growthRate").val(), 10)/1000;  // = 0.001;
	bep.deathRate = parseInt($("#deathRate").val(), 10)/100000000;; // =  0.0000001;
	bep.deathRateForNonStem = parseInt($("#deathRateForNonStem").val(), 10)/1000;; // =  0.01;
	bep.symmetricReplicationProbablity = parseInt($("#symmetricReplicationProbablity").val(), 10)/1000;; // = 0.1;
	bep.maxTime = parseInt($("#maxTime").val(), 10); // = 5000000;        // 5000000
	bep.maxPopulationSize = parseInt($("#maxPopulationSize").val(), 10); // = 10000; // 100000
	bep.genomeSize = parseInt($("#genomeSize").val(), 10); // = 300;
	bep.driverSize = parseInt($("#driverSize").val(), 10); // = 10; //  driverSize  +  essensialGeneSize  <= maxBinary
	bep.essensialGeneSize = parseInt($("#essensialGeneSize").val(), 10); // = 0; 
	bep.fitnessIncrease = parseInt($("#fitnessIncrease").val(), 10); //  = 5;
	bep.initialPopulationSize = parseInt($("#initialPopulationSize").val(), 10); // = 10;
});

//variable
bep.G = 0;
bep.populationSize = 0;;
bep.time = 0;
bep.limXY = 0;;
bep.maxX = 0;
bep.minX = 0;
bep.maxY = 0;
bep.minY = 0;
bep.genomes; //  public long[][][] genomes;
bep.state; // public boolean [][][] state; // occupied differentiated  replicate 
bep.genome2fitnessMap = {};  // public Map <Long, Double> genome2fitnessMap;
bep.genome2mutatedGeneMap = {} // public Map <Long, Set<Integer>> genome2mutatedGeneMap;	




bep.initializeGenomes = function() {
	
	bep.cells = {};
	
	console.log("initializeGenomes");
	bep.populationSize = 0;
	bep.time = 0;
	bep.maxX = 0;
	bep.minX = 0;
	bep.maxY = 0;
	bep.minY = 0;
	bep.limXY = Math.floor(2*Math.sqrt(bep.maxPopulationSize));
	bep.G = Math.floor(bep.genomeSize/bep.maxBinary + 1); 
	bep.genomes  = initArray(2*bep.limXY+1, 2*bep.limXY+1, bep.G, 0); // new long[2*limXY+1][2*limXY+1][G];
	bep.state = initArray(2*bep.limXY+1, 2*bep.limXY+1, 3, true); //new boolean [2*limXY+1][2*limXY+1][3];
	bep.genome2fitnessMap =  {};
	bep.genome2mutatedGeneMap = {};

	bep.fillCore();
	
	function initArray(xLength, yLength, zLength, initalValue) {
		console.log("initArray", xLength, yLength, zLength, initalValue);
		var x = Array(xLength);
		
		for (var i=0; i<x.length; i++) {
			var y = Array(yLength)
			x[i] = y;
			for (var j=0; j<y.length; j++) {
				var z = Array(zLength);
				x[i][j] = z;
				for (var k=0; k<z.length; k++) {
					x[i][j][k] = initalValue;
				}
			}
		}
		return x;
	}
}

// Converts LongDecimal Number to Binary String
  // 12345 -> "11000000111001"
bep.decimal2binary = function(d) {
	return Number(d).toString(2);
}

// Converts Binary String to LongDecimal Number
// "11000000111001" -> 12345
bep.binary2decimalLong = function(numberString) {
	return parseInt(numberString, 2);
}



bep.mutatedGenes2genomeLong = function(mutatedGenes) {		// Java: 'Set', JS: Array with unique values
	var tmp = "";	
	for (var i = 0; i <  bep.maxBinary; i++) {
		if (mutatedGenes.indexOf(i) > -1) {		// mutatedGenes has i..
			tmp = "1" + tmp;
		} else {
			tmp = "0" + tmp;
		}
	}
	var tmp2 = bep.binary2decimalLong(tmp);
	bep.genome2mutatedGeneMap[tmp2] = mutatedGenes;
	return tmp2;
}

bep.genomeLong2mutatedGenes = function(genome) {				// long
	if (bep.genome2mutatedGeneMap.hasOwnProperty(genome)) {
		return bep.genome2mutatedGeneMap[genome];
	} else {
		var tmp = bep.decimal2binary(genome);
		var mutatedGenes = [];
		var l = tmp.length;
		for (var i = 0; i < l; i++) {
			if (tmp[l-i-1] === "1") {
				mutatedGenes.push(i);
			}
		}
		bep.genome2mutatedGeneMap[genome] = mutatedGenes;
		return mutatedGenes;
	}
}

bep.genome2mutatedGenes = function(genomeArray) {		// array with long values
	var mutatedGenes = [];
	for (var j=0; j < bep.G; j++) {
		var tmp = bep.genomeLong2mutatedGenes(genomeArray[j]);
		for (var i = 0;(i < bep.maxBinary & j*bep.maxBinary + i < bep.genomeSize); i++) {
			if (tmp.indexOf(i)>-1) {
				mutatedGenes.push(j*bep.maxBinary+i);
			}
		}
	}
	return mutatedGenes;
}

bep.coordinate2index = function(c) {
	return bep.limXY + c;
}

// shallow get
bep.get = function (x, y) {
//	return bep.genomes[bep.coordinate2index(x)][bep.coordinate2index(y)];
	return bep.cells[x+" "+y].genome;
}

// deep copy get
bep.getDeeply = function (x,y) {
	return _.copy(bep.get(x, y));
}

bep.getCell = function (x,y) {
	// get copy of a cell
	return _.copy(bep.cells[x+" "+y]);
}

// Same function names, but different argument signatures
bep.set = function(x, y, genomeArray, stateArray) {

//	bep.genomes[bep.coordinate2index(x)][bep.coordinate2index(y)] = _.copy(genomeArray);
	
	if (bep.cells[x+" "+y] === undefined) {
		bep.cells[x+" "+y] = new Cell(x, y);
	}
	bep.cells[x+" "+y].genome = _.copy(genomeArray);
	
	if (stateArray !== undefined) {
//		bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)] = _.copy(stateArray);
		bep.cells[x+" "+y].state = _.copy(stateArray);
	}
}

bep.setCell = function(x, y, cell) {
	// deep copy a cell
	cell.x = x;		// also update cell internal coordinates
	cell.y = y;
	bep.cells[x+" "+y] = _.copy(cell);
}


// clears genome & state, state array values are set to false, genomes to empty
bep.clear = function(x, y) {
	var a = bep.coordinate2index(x);
	var b = bep.coordinate2index(y);
	// reset to [0, 0, 0, ... , 0 ,0, 0]
	bep.genomes[a][b] = [];
	for (var i=0; i<bep.G; i++) {
		bep.genomes[a][b][i] = 0;
	}
	// reset to [false, false, false], state length = 3
	bep.state[a][b] = [false, false, false] 									// occupied, differentiated, replicate


	delete(bep.cells[x+" "+y]);
}

// reference to state array
bep.getState = function(x, y) {
//	return bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)];
	return bep.cells[x+" "+y].state;
}

// deep copy of state array
bep.getStateDeeply = function(x, y) {
	return _.copy(bep.getState(x,y));
}

// set state, deep copy passed array
bep.setState = function (x, y, stateArray) {
//	bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)] = _.copy(stateArray);
	bep.cells[x+" "+y].state = _.copy(stateArray);
}

// true, if state[x][y][0] is false, false means empty
bep.isEmpty = function(x, y) {
//	return (bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)][0] === false);
	return (bep.cells[x+" "+y] === undefined);
}

// get replicate bit
bep.getRep = function(x, y) {
//	return bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)][2];
	return !bep.cells[x+" "+y].state[2];
}

 // set replicate bit
bep.setRep = function(x, y, b) {
//	bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)][2] = b;
	bep.cells[x+" "+y].state[2] = b;
}

 // set differentiate bit
bep.setDif = function(x, y, b) {
//	bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)][1] = b;
	bep.cells[x+" "+y].state[1] = b;
}

 // get differentiate bit, is Stem Cell?
bep.isStem = function(x, y) {
//	return !bep.state[bep.coordinate2index(x)][bep.coordinate2index(y)][1];
	return !bep.cells[x+" "+y].state[1];
}

bep.isMutated = function(genome, g) {
	var n = Math.floor(g/bep.maxBinary);   //  g = n*maxBinary + m
	var m = g - (n*bep.maxBinary);	
	return _.has( bep.genomeLong2mutatedGenes(genome[n]), m);
}

bep.genome2fitness = function(genome) {
	if (bep.genome2fitnessMap.hasOwnProperty(genome[0])) {
		// return bep.genome2fitnessMap[genome[0]];
	} else {
		var fitness = 1;
		for (var i=0; i<bep.driverSize; i++) {
			if (bep.isMutated(genome, i)) {
				fitness *= bep.fitnessIncrease;
			}
		}
		for (var i=bep.driverSize; i<bep.driverSize+bep.essensialGeneSize; i++) {
			if (bep.isMutated(genome, i)) {
				fitness = -1;
			}
		}
		bep.genome2fitnessMap[genome[0]] = fitness;
	}
	
	return bep.genome2fitnessMap[genome[0]]
}

bep.fillCore = function() {
	// add color
	
	var currentColorNr = 0;
	var getNextColor = function() {
		var color = colorbrewer.Set1["9"][currentColorNr];
		currentColorNr++;
		if (currentColorNr === bep.initialPopulationSize) {
			currentColorNr = 0;
		}
		return color;
	}
	
	bep.setNormalCell(0, 0, getNextColor());
	
	for (var r=1; r<bep.limXY; r++) {
		for (var y=r; y>-r; y--) {
			bep.setNormalCell(r, y, getNextColor());
			bep.setMaxMinXY(r, y);
			if (_.size(bep.cells) === bep.initialPopulationSize) {
				return;
			}
		}
		for (var x=r; x>-r; x--) {
			bep.setNormalCell(x, -r, getNextColor());
			bep.setMaxMinXY(x, -r);
			if (_.size(bep.cells) === bep.initialPopulationSize) {
				return;
			}
		}
		for (var y=-r; y<r; y++) {
			bep.setNormalCell(-r, y, getNextColor());
			bep.setMaxMinXY(-r, y);
			if (_.size(bep.cells) === bep.initialPopulationSize) {
				return;
			}
		}
		for (var x=-r; x<r; x++) {
			bep.setNormalCell(x, r, getNextColor());
			bep.setMaxMinXY(x, r);
			if (_.size(bep.cells) === bep.initialPopulationSize) {
				return;
			}
		}
	}
}



bep.setNormalCell = function(x, y, color) {

	// Cell Approach:
	var c = new Cell(x, y, color);	// also sets genome array to 0 and state to t,f,f
	

}

bep.setMaxMinXY = function(x, y) {
	if (x > bep.maxX) {
		bep.maxX = x;
	}
	if (y > bep.maxY) {
		maxY = y;
	}
	if (x < bep.minX) {
		bep.minX = x;
	}
	if (y < bep.minY) {
		bep.minY = y;
	}
}

bep.mutate = function(x, y) {
	var genome = bep.get(x, y);  // reference to genome at x,y

	for (var j=0; j < bep.G; j++) {
		var newMutatedGenes = [];
		for (var i=0; (i < bep.maxBinary && j*bep.maxBinary + i < bep.genomeSize); i++) {
			
			
			if (!bep.isMutated(genome, j*bep.maxBinary + i) && (Math.random() < bep.mutationRate)) {
				newMutatedGenes.push(i);
			}
		}
		
		if (newMutatedGenes.length > 0) {
			genome[j] = bep.mutatedGenes2genomeLong(newMutatedGenes);
			/*
			console.log("newMutatedGenes", newMutatedGenes);
			console.log("genome[j]", genome[j]);			
			console.log("genome", genome, x, y);
			*/
		}
	}
}

bep.getEmptyNeighbour = function(x, y) {
	// array of [x,y] of empty neighbours
	var emptyNeighbours = [];
	for (var i = x-1; i<=x+1 ; i++) {
		for (var j = y-1; j<=y+1 ; j++) {
			if (bep.isEmpty(i, j)) {
				emptyNeighbours.push([i, j]);
			}
		}
	}
	if (emptyNeighbours.length<1) {
		return false;
	}
	
	return emptyNeighbours[Math.floor(Math.random()*emptyNeighbours.length)];	// get random neigbour
}


bep.createNeighbor = function(x, y) {
	bep.setRep(x, y, false);
	
	var genome = bep.getDeeply(x, y); 
	var state = bep.getStateDeeply(x, y);
	var cell = bep.getCell(x, y);
	
	var neighbour = bep.getEmptyNeighbour(x, y);
	if (neighbour) {
		var x2 = neighbour[0];
		var y2 = neighbour[1];
		bep.set(x2, y2, genome, state);
		bep.setMaxMinXY(x2, y2);	
			
	} else {
		// get nearest neigbours by searching n, ne, e, se s, sw, w, nw, 
		var limXY = bep.limXY;
		
		v = Array(8);
		V = Array(8);
		//right, find nearest right empty cell
		var a = 1;
		var b = 0;
		for (var i=1; x+i<=limXY; i++) {
			a
			if (bep.isEmpty(x+i, y)) {
				v[0]=i-1;
				V[0]=1.0/(i-1);
				break;
			}
		}
		//upper right
		for (var i=1; x+i<=limXY & y+i<=limXY; i++) {
			if (bep.isEmpty(x+i, y+i)) {
				v[1]=i-1;
				V[1]=1.0/(i-1);
				break;
			}
		}
		//upper
		for (var i=1; y+i<=limXY; i++) {
			if (bep.isEmpty(x, y+i) ) {
				v[2]=i-1;
				V[2]=1.0/(i-1);
				break;
			}
		}
		//upper left
		for (var i=1; x-i>=-limXY & y+i<=limXY; i++) {
			if (bep.isEmpty(x-i, y+i) ) {
				v[3]=i-1;
				V[3]=1.0/(i-1);
				break;
			}
		}
		//left
		for (var i=1; x-i>=-limXY; i++) {
			if (bep.isEmpty(x-i, y) ) {
				v[4]=i-1;
				V[4]=1.0/(i-1);
				break;
			}
		}
		//lower left
		for (var i=1; x-i>=-limXY & y-i>=-limXY; i++) {
			if (bep.isEmpty(x-i, y-i) ) {
				v[5]=i-1;
				V[5]=1.0/(i-1);
				break;
			}
		}
		//lower
		for (var i=1; y-i>=-limXY; i++) {
			if (bep.isEmpty(x, y-i)) {
				v[6]=i-1;
				V[6]=1.0/(i-1);
				break;
			}
		}
		//lower right
		for (var i=1; y-i>=-limXY & x+i<=limXY; i++) {
			if (bep.isEmpty(x+i, y-i) ) {
				v[7]=i-1;
				V[7]=1.0/(i-1);
				break;
			}
		}


		//  add up all V
		var s = 0;
		for (var i = 0; i < 8;i++) {
			s = s + V[i];
		}
		
		for (var i = 0; i < 8;i++) {
			V[i] = V[i]/s;
		}
		
		// Randomize the direction
		var r = Math.random();	//R.nextDouble();
		s=0;
		var d = 0;
		var D = 0;
		for (var i = 0; i < 8;i++) {
			s += V[i];
			if (r < s) {
				d = v[i];
				D = i+1;
				break;
			}
		}
		
		var tmp = Array(d);
		var tmpR = Array(d);
		
		coords = [];
		setCoords = [];
		
		if (D===1) {
			//right
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x+i, 'y':y});
			}
			/*
			for (var i=1;i<=d;i++) {
				// get genomes and states
				tmp[i-1] = bep.getDeeply(x+i, y);
				tmpR[i-1] = bep.getStateDeeply(x+i, y);
			}
			
			bep.set(x+1, y, genome, state);
			for (var i=1;i<=d;i++) {
				bep.set(x+i+1, y, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x+i+1, 'y':y});
			}
			
			if (x+d+1 > bep.maxX) {
				bep.maxX = x+d+1;
			}
			*/
		}
		else if (D===2) {
			//upper right
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x+i, 'y':y+i});
			}
			
		
			/*
			for (var i=1;i<=d;i++) {
				tmp[i-1] = bep.getDeeply(x+i, y+i);
				tmpR[i-1] = bep.getStateDeeply(x+i, y+i);
			}
			bep.set(x+1, y+1, genome, state);
			
			for (var i=1;i<=d;i++) {
				bep.set(x+i+1, y+i+1, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x+i+1, 'y':y+i+1});
			}
			if (x+d+1 > bep.maxX) {
				bep.maxX = x+d+1;
			}
			if ( y+d+1 > bep.maxY) {
				bep.maxY = y+d+1;
			}
			*/
		}
		else if (D===3) {
       //upper
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x, 'y':y+i});
			}
			
			/*
			for (var i=1;i<=d;i++) {
				tmp[i-1] = bep.getDeeply(x, y+i);
         		tmpR[i-1] = bep.getStateDeeply(x, y+i);
			}
			
			
			bep.set(x, y+1, genome, state);
			
			for (var i=1;i<=d;i++) {
				bep.set(x, y+i+1, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x, 'y':y+i+1});
			}
			if ( y+d+1 > bep.maxY) {
				bep.maxY = y+d+1;
			}
			*/
		}
		else if (D===4) {
			//upper left
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x-i, 'y':y+i});
			}
			
			/*
			for (var i=1;i<=d;i++) {
				tmp[i-1] = bep.getDeeply(x-i, y+i);
				tmpR[i-1] = bep.getStateDeeply(x-i, y+i);
			}
		
			
			bep.set(x-1, y+1, genome, state);
			for (var i=1;i<=d;i++) {
				bep.set(x-i-1, y+i+1, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x-i-1, 'y':y+i+1});
			}
			if (x-d-1 < bep.minX) {
				bep.minX = x-d-1;
			}
			if (y+d+1 > bep.maxY) {
				bep.maxY = y+d+1;
			}
			*/
		}
		else  if (D===5) {
			//left
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x-i, 'y':y});
			}
			
			/*
			for (var i=1;i<=d;i++) {
				tmp[i-1] = bep.getDeeply(x-i, y);
				tmpR[i-1] = bep.getStateDeeply(x-i, y);
			}
			
			bep.set(x-1, y, genome, state);
			for (var i=1;i<=d;i++) {
				bep.set(x-i-1, y, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x-i-1, 'y':y});
			}
			if (x-d-1 < bep.minX) {
				bep.minX = x-d-1;
			}
			*/
		}
		else if (D===6) {
			//lower left
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x-i, 'y':y-i});
			}
			/*
			for (var i=1;i<=d;i++) {
				tmp[i-1] = bep.getDeeply(x-i, y-i);
				tmpR[i-1] = bep.getStateDeeply(x-i, y-i);
			}
			
			
			bep.set(x-1, y-1, genome, state);
			for (var i=1;i<=d;i++) {
				bep.set(x-i-1, y-i-1, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x-i-1, 'y':y-i-1});
			}
			if (x-d-1 < bep.minX) {
				bep.minX = x-d-1;
			}
			if (y-d-1 < bep.minY) {
				bep.minY = y-d-1;
			}
			*/
		}
		else if (D===7) {
			//lower 
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x, 'y':y-i});
			}
			/*
			for (var i=1;i<=d;i++) {
				tmp[i-1] = bep.getDeeply(x, y-i);
				tmpR[i-1] = bep.getStateDeeply(x, y-i);
			}
			
			
			
			bep.set(x, y-1, genome, state);
			for (var i=1;i<=d;i++) {
				bep.set(x, y-i-1, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x, 'y':y-i-1});
			}
			if (y-d-1 < bep.minY) {
				bep.minY = y-d-1;
			}
			*/
		}
		else if (D===8) {
			//lower right
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x+i, 'y':y-i});
			}
			
			/*	
			for (var i=1;i<=d;i++) {
				tmp[i-1] = bep.getDeeply(x+i, y-i);
				tmpR[i-1] = bep.getStateDeeply(x+i, y-i);
			}
		
			
			bep.set(x+1, y-1, genome, state);
			for (var i=1;i<=d;i++) {
				bep.set(x+i+1, y-i-1, tmp[i-1], tmpR[i-1]);
				setCoords.push({'x':x+i+1, 'y':y-i-1});
			}
			if (x+d+1 > bep.maxX) {
				bep.maxX = x+d+1;
			}
			if (y-d-1 < bep.minY) {
				bep.minY = y-d-1;
			}
			*/
			
		}
		
		console.log("\nx y", x, y);
		console.log("coords", coords);
		console.log("setCoords", setCoords);

		// move cells outwards, one by one
		for (var l=coords.length-1; l>0; l--) {
			console.log("move " + coords[l-1].x + " " + coords[l-1].y + " to " +coords[l].x + " " + coords[l].y);
			var from = coords[l-1];
			var to = coords[l];
			bep.setCell(to.x, to.y, bep.getCell(from.x, from.y));

		}
		//
		bep.setCell(coords[0].x, coords[0].y, cell);
		
		/*
		work backwards from coords, [a,b,c]: move b to c, a to b, new cell to a.
		*/
	}
}

bep.addNewCell = function() {
	
	
}

bep.growPopulation = function() {
	var minX = bep.minX;
	var maxX = bep.maxX;
	var minY = bep.minY;
	var maxY = bep.maxY;
	
	for (var x  = minX; x <= maxX ; x++) {
		for (var y  = minY; y <= maxY ; y++) {	
			if (bep.growCell1(x, y)===false) {
				return;
			}
		}
	}
	if (bep.growCell2(0, 0)===false) {
		return;
	}
	for (var r=1; r <= Math.abs(maxX) | r <= Math.abs(minX) | r <= Math.abs(maxY) | r <= Math.abs(minY); r++) {
		//if(true){
			if (Math.random()>0.5) {
			for (var y = r; y > -r; y--) {
				if (!bep.growCell2(r, y)) {
					return;
				}
			}
			for (var x = r; x > -r; x--) {
				if (!bep.growCell2(x, -r)) {
					return;
				}
			}
			for (var y = -r; y < r; y++) {
				if (!bep.growCell2(-r, y)) {
					return;
				}
			}
			for (var x = -r; x < r; x++) {
				if (!bep.growCell2(x, r)) {
					return;
				}
			}
		}
		else {
			for (var x = r; x > -r; x--) {
				if (!bep.growCell2(x, r)) {
					return;
				}
			}
			for (var y = r; y > -r; y--) {
				if (!bep.growCell2(-r, y)) {
					return;
				}
			}
			for (var x = -r; x < r; x++) {
				if (!bep.growCell2(x, -r)) {
					return;
				}
			}
			for (var y = -r; y < r; y++) {
				if (!bep.growCell2(r, y)) {
					return;
				}
			}
		}
	}
}

bep.growCell1 = function(x, y) {
	if (bep.isEmpty(x, y)) {
		return true;
	}
	if (Math.abs(x) == bep.limXY | Math.abs(y) == bep.limXY) {
		return false;
	}

	if ((bep.isStem(x, y) & Math.random() < bep.deathRate) | (!bep.isStem(x, y) & Math.random() < bep.deathRateForNonStem)) {
		bep.clear(x, y);
		bep.populationSize = bep.populationSize-1;
		return true;
	}
	if (Math.random() < bep.getFitness(x, y)*bep.growthRate) {
		bep.mutate(x, y);
		if (bep.getFitness(x, y) < 0) {
			bep.clear(x, y);
			bep.populationSize = bep.populationSize-1;
			return true;
		}
		bep.setRep(x, y, true);
	}
	else {
		bep.setRep(x, y, false);
	}
	if (bep.populationSize >= bep.maxPopulationSize) {
		return false;
	}
	else {
		return true;
	}
}

bep.getFitness = function(x, y) {
	return bep.genome2fitness(bep.get(x, y));
}	


bep.replicate = function(x, y) {	
	if (bep.symmetricReplicationProbablity<1 & bep.isStem(x, y)) {
		//stem
		if (Math.random() > bep.symmetricReplicationProbablity) {
			//asymmetric replication
			if (Math.random()>0.5) {
				bep.setDif(x, y, true);
				bep.createNeighbor(x, y);
				bep.setDif(x, y, false);
			}
			else {
				bep.createNeighbor(x, y);
				bep.setDif(x, y, true);
			}
		}
		else {
			//symmetric replication
			bep.createNeighbor(x, y);
		}
	}
	else {
		//differentiated
		bep.createNeighbor(x, y);
	}
}

bep.growCell2 = function(x, y) {
	if (bep.isEmpty(x, y)) {
		return true;
	}
	if (Math.abs(x) ==  bep.limXY | Math.abs(y) ==  bep.limXY) {
		return false;
	}
	if (bep.getRep(x, y)) {
		bep.replicate(x, y);
		bep.populationSize = bep.populationSize+1;
	}
	if (bep.populationSize >= bep.maxPopulationSize) {
		return false;
	}
	else {
		return true;
	}
}

bep.simulate = function(counter) {

	
	bep.time = bep.time + 1;
	/*
	console.log("simulate(): bep.time: " + bep.time);
	console.log("bep.get(0,0)", bep.get(0,0));
	console.log("bep.getState(0,0)", bep.getState(0,0));
	*/
	if (counter > bep.maxTime) {
		bep.running = false;
		console.log("simulate(): Finished, timed out");
		return;
    } else if (bep.populationSize >= bep.maxPopulationSize) {
		bep.running = false;
		console.log("simulate(): Finished: reached maxPopulationSize ");
		return;
	}

	bep.growPopulation();
}

bep.count = function() {
	var tmp = 0;
	for (var x  = bep.minX; x <= bep.maxX ; x++) {
		for (var y  = bep.minY; y <= bep.maxY ; y++) {	
			if (!bep.isEmpty(x, y)) {
				tmp++;
			}
		}
	}
	return tmp;
}

bep.initialize = function() {
	console.log("start");
	bep.running = true;
	bep.initializeGenomes();
	bep.run();
}

bep.run = function() {
	for (var i=0; i<1000; i++) {
		if (bep.running) {
			//console.log("Calling Simulate: bep.time: " + bep.time);
			bep.simulate(i);
		} else {
			console.log("Finished: " + i);
			drawImage();
			bep.running = false;
			break;
			
		}
		
	}	
};




bep.randomDistance = function(p) {
	var rand = 2 * Math.random() - 1;
	console.log(rand);
	var erf = science.stats.erf(rand);
	var r = (1 + erf)/2;
	return r/p;
}







