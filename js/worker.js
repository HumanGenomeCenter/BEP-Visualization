// Importing Libraries for Worker
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
	importScripts('science.v1.min.js');
	importScripts('underscore-min.js');
	importScripts('underscore-mixins.js');
	importScripts('colorbrewer.js');
	
	var cells = [];
	var settings;
	
} else {
	// debugging
	// Single Inital Cell Object
	
	var settings = {
		n: 20,						// total number of genes, including driver (d) and essential (e) genes
		r: 0.01, 					// mutation probabiliy of each gene when replicated
		d: 10, 						// number of driver genes, first d genes of g
		e: 5,						// number of essential genes, number of genes
		mutationRate: 0.01,
		growthRate: 0.01,			// 0.0001
		deathRate: 0.001,		
		deathRateForNonStem: 0.001,
		srp: 0.5,	// between 0 and 1
		fitnessIncrease:5, 
		maxNumberOfCells: 1000,
		initialCells: 6,
	};
	
	cells = [];
	
	var initGenes = function(nr) {
		var genes = [];
		for(var i=0; i<nr; i++) {
			genes.push(false);
		}
		return genes;	
	}
	var StemCell = function() {
		var i = cells.length;
		this.index = i;				// append to cells array
		this.isStem = true;
		this.subtype = i;			// initial subtypes
		this.radius = 0;			// important to set initial radius to 0
		this.finalRadius = Math.floor(Math.random() * 5 + 10);
		this.children = [];
		this.parent = false;	// root, no parents
		this.alive = true;
		this.died = undefined;						// timestep
		this.born = 0;								// timestep, start, 0
		this.randomAngle = Math.random()*Math.PI*2;
		this.color = "#44aaCC";
		this.x = 0;
		this.y = 0;
		this.driverGenes = initGenes(settings.d);			// false -> not mutated
		this.essentialGenes = initGenes(settings.e);
		this.genes = initGenes(settings.n - settings.e - settings.d);		// false -> not mutated
		return this;
	}

	var initCells = function(nr) {
		cells = [];
		for(var i=0; i<nr; i++) {
			cells.push(new StemCell());
		}
	}

	initCells(5);
}

// return list of dead cells

// Worker's copy of global bep object
var time = 0;			// global simulation time
var running = false;	// running status

var info = {};

var intervalID;

onmessage = function(e) {
	console.log("worker receiving message");
	var data = JSON.parse(e.data);
	
	console.log(data.message);
	
	if (data.settings) {			// update settings..
		settings = data.settings;
		console.log("settings updated");
	}
	
	if (data.cells) {				// update cells..
		cells = data.cells;	
	}
	
	if (data.message === "startSimulation") {
		console.log("worker: startSimulation");
		running = true;
		
		simulate(settings.maxNumberOfCells);
		updateInfo();
		postMessage( JSON.stringify({'message':'simulationFinished', 'cells':cells, 'info':info}) );
	
	}
	
	
}




var cellRadius = function() {
	return 12;
//	return 10 + Math.floor(Math.random() * 10);
}

// Create a child Cell object from a parent Cell object
var Cell = function(parent) {
	this.index = cells.length;				// append to cells array
	this.isStem = parent.isStem;				// stem or normal 
	this.subtype = parent.subtype;			// propagate subtype
	this.radius = 0;
	this.finalRadius = cellRadius();		// randomize radius?
	this.children = [];
	this.alive = true;
	this.died = undefined;				// timestep
	this.born = time;					// timestep
	this.randomAngle = Math.random()*Math.PI*2;
	this.parent = parent.index;			// add parent id
	parent.children.push(this.index);	// add child id to parent
	this.genes = parent.genes.slice(0);					// copy genes
	this.driverGenes = parent.driverGenes.slice(0);		// copy parent driver genes
	this.essentialGenes = parent.essentialGenes.slice(0);		// copy parent driver genes
	mutate(this);
}







// Simulate one generation

var simulate = function(limit) {
	console.time("simulation");
	
	if (cells.length===0) {
		console.log("No cells defined.");
		return;
	}
	
	if (limit===undefined) {
		limit = settings.maxNumberOfCells;
	}
	
	
	simulationLoop: 		// while loop label
	while(true) {
		var cell, i;
		var length = cells.length;		// get new length

		for (i=0; i<length; i++) {		// loop over cells
			
			if (cells.length === limit) {							//  break when the desired number of cells are reached
				break simulationLoop;
			}
						
			cell = cells[i];
			
			if (!cell.alive) continue;	// skip if cell is dead
			
			// Remove
		
			var dr = Math.random();
			var drns = Math.random();
		
				
			if ((dr < settings.deathRate) || (drns < settings.deathRateForNonStem)) {				// Death Rate
				if (cell.index < 5) {
					console.log("StemCell died " + cell.index);
				}
				cell.alive = false; 	// update alive status
				cell.died = time;		// time of death
				if (info.aliveCells === 0) break simulationLoop;		// no more alive cells left...
				continue;
			}
			
			// Mutate & Replicate
			if (Math.random() < (getFitness(cell) * settings.growthRate)) {
				// mutate(cell); mutationg happens in new Cell()		
				var childCell = new Cell(cell);		// copy cell
				
				// if cell is stem cell and random() is larger than srp, create a normal cell
				if (cell.isStem && (Math.random() > settings.srp)) {
					childCell.isStem = false;		// -> normal cell
				}
				
				if (getFitness(childCell) < 0) {
					childCell.alive = false; 	// update alive status
					childCell.died = time;		// time of death
			
				} else {
					// stem cells and normal cell have the same genome!? only difference is the isStem bit
					cells.push(childCell);	
				}
				
			}		
			
		
			
		}
		time++;			// advance time on tick
	}
	
	updateInfo();
	console.timeEnd("simulation");
}


var getFitness = function(cell) {
	var fitness = 1;
	for (var k=0; k<cell.driverGenes.length; k++) {
		if (cell.driverGenes[k]) {						// gene not already mutated
			fitness *= settings.fitnessIncrease;
		}
	}
	
	for (var j=0; j<cell.essentialGenes.length; j++) {
		if (cell.essentialGenes[j]) {							// gene not already mutated
			fitness = -1;										// if fitness is <0, cell dies
			break;
		}
	}
	return fitness;
}


var mutate = function(cell) {
	if (cell.alive === false) return;		// don't mutate if cell is dead
	mutateGenes(cell.driverGenes);
	mutateGenes(cell.essentialGenes);
	mutateGenes(cell.genes);
}

var mutateGenes = function(genes) {
	for (var i=0; i<genes.length; i++) {
		if (genes[i]===false) {
			if (Math.random() < settings.mutationRate) {	// not mutated, & mutation probabiliy of each gene when replicated
				genes[i] = time;												// change to mutated time
			} 
		}
	}	
}



var updateInfo = function() {
	console.time("updateInfo");
	var allCells = 0,
	aliveCells = 0,
	deadCells = 0,
	stemCells = 0,
	normalCells = 0,
	links = [];
	
	for (var i=0; i<cells.length; i++) {
		var cell = cells[i];
		if (cell.alive) {
			aliveCells++;	
		} else {
			deadCells++;
		}
		if (cell.isStem) stemCells++;
		if (!cell.isStem) normalCells++;
		
		// create Links
		if (cell.parent) {		// original cells don't have parents
			links.push({'source': cell.parent, 'target': cell.index});
		}
	}
	
	info.allCells = cells.length;
	info.aliveCells = aliveCells;
	info.deadCells = deadCells;
	info.stemCells = stemCells;
	info.normalCells = normalCells;
	info.links = links;
	
	compareGenes();
	console.timeEnd("updateInfo");
}





var compareGenes = function() {
	console.time("compareGenes");
	
	var genesToBinary = function(geneArray) {
		var str = geneArray.map(function(value, i, arr) {
			if (value) return 1;
			return 0;
		});
		str = str.join("");
		return str;
	}
	
	// convert mutation arrays to binary strings
	genes = cells.map(function(cell, i) {
		var driverGenes = genesToBinary(cell.driverGenes);
		var essentialGenes = genesToBinary(cell.essentialGenes);
		var genes = genesToBinary(cell.genes);
		return driverGenes + essentialGenes + genes;
	});

	// get unique genes
	var reducedGenes = {};
	for (var i=0; i<genes.length; i++) {
		var gene = genes[i];
		if (reducedGenes[gene] === undefined) {
			reducedGenes[gene] = [i];
		} else {
			reducedGenes[gene].push(i);
		}
	}
	info.reducedGenes = reducedGenes;
	
	
	console.timeEnd("compareGenes");
}




var findRoot = function(id) {
	console.time("find root");
	var rootPath = [];
	var cell = cells[id];
	console.log("parent", cell.parent);
	
	while (cell.parent) {
		cell = cells[cell.parent];
		rootPath.unshift(cell.index);
	}
	console.log("root: " + cell.index, cell);
	
	console.timeEnd("find root");
	return rootPath;
}



var findChildren = function(id) {
	// brute force
	
	var childPath = [];
	
	var parentCell = cells[id];


	for (var i=id; i<cells.length; i++) {
		var childCell = cells[i];
		if (childCell.parent === parentCell.index) {
			childPath.push(childCell.index);
			childPath.push(findChildren());
		}
	}
	
	console.log(childPath);
	return childPath;
}



