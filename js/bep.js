// Gobal Bep Object
var bep = {};

//variable
bep.G = 0;
bep.populationSize = 0;;
bep.time = 0;
bep.limXY = 0;;
bep.maxX = 0;
bep.minX = 0;
bep.maxY = 0;
bep.minY = 0;
bep.genome2fitnessMap = {};  // public Map <Long, Double> genome2fitnessMap;
bep.genome2mutatedGeneMap = {} // public Map <Long, Set<Integer>> genome2mutatedGeneMap;	




// Single Cell
var Cell = function(x, y, color) {
	if (arguments.length!==0) {		// prevent copying from adding Cells to bep.cells
		this.x = x;
		this.y = y;
		this.color = (color === undefined) ? "#000000" : color;
		this.init();
		bep.cells[x+" "+y] = this;		// add to global cell array
	}
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






// Worker Test
var worker = new Worker("js/worker.js");

console.time("worker");

var test;
worker.postMessage({'message':'simulate', 'bep':bep});
worker.onmessage = function(e) {
	console.timeEnd("worker");
	test = e.data;
	console.log(e.data);
	worker.terminate();
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




bep.initializeGenomes = function() {
	console.log("initializeGenomes");
	delete(bep.cells);
	bep.cells = {};
	bep.populationSize = 0;
	bep.time = 0;
	bep.maxX = 0;
	bep.minX = 0;
	bep.maxY = 0;
	bep.minY = 0;
	bep.limXY = Math.floor(2*Math.sqrt(bep.maxPopulationSize));
	bep.G = Math.floor(bep.genomeSize/bep.maxBinary + 1); 
	bep.genome2fitnessMap =  {};
	bep.genome2mutatedGeneMap = {};
	bep.fillCore();
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

bep.getCell = function(x, y) {
	return _.copy(bep.cells[x+" "+y]);
}


bep.setCell = function(x, y, cell) {
	cell.x = x;		// also update cell internal coordinates
	cell.y = y;
	bep.cells[x+" "+y] = _.copy(cell);
}

bep.setNormalCell = function(x, y, color) {
	var c = new Cell(x, y, color);	// also sets genome array to 0 and state to t,f,f
}



// clears genome & state, state array values are set to false, genomes to empty
bep.clear = function(x, y) {
	delete(bep.cells[x+" "+y]);
}

// true, if state[x][y][0] is false, false means empty
bep.isEmpty = function(x, y) {
	return (bep.cells[x+" "+y] === undefined);
}

// get replicate bit
bep.getRep = function(x, y) {
	return !bep.cells[x+" "+y].state[2];
}

 // set replicate bit
bep.setRep = function(x, y, b) {
	bep.cells[x+" "+y].state[2] = b;
}

 // set differentiate bit
bep.setDif = function(x, y, b) {
	bep.cells[x+" "+y].state[1] = b;
}

 // get differentiate bit, is Stem Cell?
bep.isStem = function(x, y) {
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
		var colorSet = colorbrewer.Set1["9"];
		if (currentColorNr === colorSet.length) {
			currentColorNr = 0;
		}
		var color = colorSet[currentColorNr];
		currentColorNr++;
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
	var genome = bep.getCell(x, y).genome;  // copy of genome at x,y

	for (var j=0; j < bep.G; j++) {
		var newMutatedGenes = [];
		for (var i=0; (i < bep.maxBinary && j*bep.maxBinary + i < bep.genomeSize); i++) {
			
			
			if (!bep.isMutated(genome, j*bep.maxBinary + i) && (Math.random() < bep.mutationRate)) {
				newMutatedGenes.push(i);
			}
		}
		
		if (newMutatedGenes.length > 0) {
			genome[j] = bep.mutatedGenes2genomeLong(newMutatedGenes);
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
	var cell = bep.getCell(x, y);
		
	var neighbour = bep.getEmptyNeighbour(x, y);
	if (neighbour) {
		var x2 = neighbour[0];
		var y2 = neighbour[1];
		bep.setCell(x2, y2, cell);
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

		}
		else if (D===2) {
			//upper right
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x+i, 'y':y+i});
			}
			
		}
		else if (D===3) {
       //upper
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x, 'y':y+i});
			}
			
		}
		else if (D===4) {
			//upper left
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x-i, 'y':y+i});
			}
			
		}
		else  if (D===5) {
			//left
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x-i, 'y':y});
			}
			
		}
		else if (D===6) {
			//lower left
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x-i, 'y':y-i});
			}
			
		}
		else if (D===7) {
			//lower 
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x, 'y':y-i});
			}

		}
		else if (D===8) {
			//lower right
			for (var i=1;i<=d+1;i++) {
				coords.push({'x':x+i, 'y':y-i});
			}
			
		}

		// move cells outwards, one by one
		for (var l=coords.length-1; l>0; l--) {
			var from = coords[l-1];
			var to = coords[l];
			bep.setCell(to.x, to.y, bep.getCell(from.x, from.y));
		}
	
		// set new cell
		bep.setCell(coords[0].x, coords[0].y, cell);
		
		/*
		work backwards from coords, [a,b,c]: move b to c, a to b, new cell to a.
		*/
	}
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
	return bep.genome2fitness(bep.getCell(x, y).genome);
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
	console.log("bep.simulate", bep.time);

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







