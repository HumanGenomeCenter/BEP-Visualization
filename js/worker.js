// Importing Libraries for Worker
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
	importScripts('science.v1.min.js');
	importScripts('underscore-min.js');
	importScripts('underscore-mixins.js');
	importScripts('colorbrewer.js');
}

// return list of dead cells

// Worker's copy of global bep object
var time = 0;			// global simulation time
var cells = [];
var running = false;	// running status

var settings;


var intervalID;
onmessage = function(e) {
	var data = JSON.parse(e.data);
	
	if (data.settings) {
		settings = data.settings;
	}
		
	if (data.message === "getInitialCells") {
		initiateCells();
		postMessage( JSON.stringify({'message':'initialCells', 'initialCells':cells}) );
	} 
	

	
	else if (data.message === "startSimulation") {
		console.log("worker: startSimulation");
		running = true;
		// update settings..
	
		simulate();
		
	//	postMessage( JSON.stringify({"cells":cells}) );
	}
	
	else if (data.message === "get" && data.start && data.end ) {
		// can we keep running or do we need to stop?
		
	//	var newCells = cells.slice(currentIndex, e.data.range);
	//	var newCells = cells.slice(currentIndex, e.data.range);
	//	var message = {'message':newcells};
		
		
		postMessage( JSON.stringify({'cells':cells.slice(data.start, data.end), 'time':time}) );
			
	} 
}







// Single Cell Object
var Cell = function(parent) {
	this.index = cells.length;				// append to cells array
	this.radius = Math.floor(Math.random() * 5 + 10);
	this.finalRadius = this.radius;
	this.children = [];
	this.alive = true;
	this.died = undefined;				// timestep
	this.born = time;					// timestep
	this.randomAngle = Math.random()*Math.PI*2;
	
	if (parent===false) {
		// root cells	
		var initGenes = function(n) {
			for (var i=0, genes = []; i<n; i++) { genes[i] = false; }
			return genes;
		}
		this.parent = false;	// root, no parents
		this.genes = initGenes(settings.n - settings.d);
		this.driverGenes = initGenes(settings.d);
		
	} else {
		

		this.parent = parent.index;			// add parent id
		parent.children.push(this.index);	// add child id to parent
		
		// Mutate Genese
		this.genes = parent.genes.slice(0);					// copy genes
		for (var j=0; j<this.genes.length; j++) {
			if (!this.genes[j]) {							// 'gene' not mutated
				if (Math.random() < settings.r) {			// mutation probabiliy of each gene when replicated
					this.genes[j] = true;					// mutated
				}
			}
		}
		
		// Mutate Driver Genes
		this.driverGenes = parent.driverGenes.slice(0);		// copy parent driver genes
		for (var k=0; k<this.driverGenes.length; k++) {
			if (!this.driverGenes[k]) {						// gene' not mutated
				if (Math.random() < settings.r) {			// mutation probabiliy of each gene when replicated
					this.driverGenes[k] = true;				// mutated
				}
			}
		}
		
	}
}

var initiateCells = function() {
	cells = [];
	for (var i=0; i<9; i++) {
		cells[i] = new Cell(false);
	}
}





// Simulate one generation

var firstMessagesReturned = false;
var secondMessagesReturned = false;
var allMessagesReturned = false;
var simulate = function() {
	
	while(true) {
		var cell, i;
		var length = cells.length;	

		for (i=0; i<length; i++) {		// loop over cells
			cell = cells[i];

			if (Math.random() < settings.q0) {						// die
				// update alive status
				// time of death
				// remove from display
				continue;
			}

			if (Math.random() < settings.p0) {						// replicate

				var parent = cells[i];
				var child = new Cell(parent);
				cells.push(child);
				
			}		
			
			if (cells.length === 10000 && !firstMessagesReturned) {
				// return first 10000 cells immediatly
				firstMessagesReturned = true;
				postMessage( JSON.stringify({'cells':cells, 'time':time}) );
			}
			
			if (cells.length === 20000 && !secondMessagesReturned) {
				// return first 10000 cells immediatly
				secondMessagesReturned = true;
				postMessage( JSON.stringify({'cells':cells.slice(10000, 20000), 'time':time}) );
			}
			
			if (cells.length === settings.maxNumberOfCells && !allMessagesReturned) {
				// return first 10000 cells immediatly
				allMessagesReturned = true;
				postMessage( JSON.stringify({'cells':cells, 'time':time}) );
				return;
			}
			
		}
		time++;			// advance time
		
	}
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



