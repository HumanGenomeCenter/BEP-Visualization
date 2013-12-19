// Importing Libraries for Worker
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
	importScripts('science.v1.min.js');
	importScripts('underscore-min.js');
	importScripts('underscore-mixins.js');
	importScripts('colorbrewer.js');
}

// Worker's copy of global bep object
var time = 0;			// global simulation time
var cells = [];
var running = false;	// running status

var settings = {
	n: 100,				// number of genes
	p0: 0.001,			// initial replication probability
	q0: 0.0000001,		// death probabiliy
	r: 0.01, 			// mutation probabiliy of each gene when replicated
	d: 10, 				// number of driver genes, first d genes of g
	rootCells: 6,		// initial number of root cells
};

// Single Cell Object
var Cell = function(parent) {
	this.index = cells.length;				// append to cells array
	this.radius = Math.floor(Math.random() * 5 + 10);
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
		parent.children.push(this.index)	// add child id to parent
		
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

var initiateCells = function(nr) {
	cells = [];
	if (nr===undefined) nr = settings.rootCells;
	cells = [];
	for (var i=0; i<nr; i++) {
		cells[i] = new Cell(false);
	}
}
initiateCells();




// return list of dead cells

onmessage = function(e) {

	if (e.data.message === "play") {
		console.log("worker: play");
		running = true;
		simulate({maxNumberOfCells:10000});
		postMessage( JSON.stringify({"cells":cells}) );
		
	} else if (e.data.message === "pause") {
		console.log("worker: pause");
		running = false;

	} else if (e.data.message === "reset") {
		running = false;
		initiateCells();
		console.log("worker: reset");
		postMessage( JSON.stringify({"cells":cells}) );
	}
	else if (e.data.message === "get" && e.data.amount > 0) {
		// can we keep running or do we need to stop?
		
	//	var newCells = cells.slice(currentIndex, e.data.range);
	//	var newCells = cells.slice(currentIndex, e.data.range);
	//	var message = {'message':newcells};
		
		
		postMessage( JSON.stringify({'cells':cells, 'time':time}) );
			
	} else {
		postMessage("Something else");
	}
}





var simulate = function(options) {

	console.time("simulate");
	
	while(true) {
		
	//	if (time > 10000) return;		// break when status changes

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
			
			if (cells.length > options.maxNumberOfCells) {
				console.log(cells.length, time);
				console.timeEnd("simulate");
				return;	// done
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



