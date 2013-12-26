// Importing Libraries for Worker
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
	importScripts('science.v1.min.js');
	importScripts('underscore-min.js');
	importScripts('underscore-mixins.js');
	importScripts('colorbrewer.js');
	
	var cells = [];
	var settings;
	
} else {
	
	var cells = [{"index":0,"radius":12,"children":[],"parent":false,"alive":true,"born":0,"randomAngle":4.663045245111483,"color":"#e41a1c","x":429.8238424033283,"y":254.25476253409252,"driverGenes":[false,false,false,false,false,false,false,false,false,false],"genes":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"weight":0,"px":429.822615756692,"py":254.25461963429507},{"index":1,"radius":13,"children":[],"parent":false,"alive":true,"born":0,"randomAngle":5.382316351423005,"color":"#377eb8","x":390.37445825665606,"y":261.87912490241206,"driverGenes":[false,false,false,false,false,false,false,false,false,false],"genes":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"weight":0,"px":390.3772615597312,"py":261.8812832047626},{"index":2,"radius":11,"children":[],"parent":false,"alive":true,"born":0,"randomAngle":4.644964903055521,"color":"#4daf4a","x":407.6315790519284,"y":221.18797463911895,"driverGenes":[false,false,false,false,false,false,false,false,false,false],"genes":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"weight":0,"px":407.6316551441446,"py":221.18661364874498},{"index":3,"radius":11,"children":[],"parent":false,"alive":true,"born":0,"randomAngle":3.7686710180349916,"color":"#984ea3","x":388.498201940526,"y":232.0755569600501,"driverGenes":[false,false,false,false,false,false,false,false,false,false],"genes":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"weight":0,"px":388.49790433024526,"py":232.07383387214583},{"index":4,"radius":11,"children":[],"parent":false,"alive":true,"born":0,"randomAngle":3.714136003849895,"color":"#ff7f00","x":427.1400690470029,"y":231.39449804354894,"driverGenes":[false,false,false,false,false,false,false,false,false,false],"genes":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"weight":0,"px":427.13985868832185,"py":231.39405969820862},{"index":5,"radius":12,"children":[],"parent":false,"alive":true,"born":0,"randomAngle":6.275775150196805,"color":"#ffff33","x":408.0355406404851,"y":244.19146753239022,"driverGenes":[false,false,false,false,false,false,false,false,false,false],"genes":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"weight":0,"px":408.03483896796547,"py":244.1901880753529}];
	var settings = {"n":100,"p0":0.001,"q0":1e-7,"r":0.01,"d":10,"maxNumberOfCells":100000,"initialCells":6};
}

// return list of dead cells

// Worker's copy of global bep object
var time = 0;			// global simulation time
var running = false;	// running status



var intervalID;
onmessage = function(e) {
	console.log("worker receiving message");
	var data = JSON.parse(e.data);
	
	console.log(data.message);
	
	if (data.settings) {
		settings = data.settings;
	}
	
	if (data.cells) {
		cells = data.cells;
	}
	
	if (data.message === "startSimulation") {
		console.log("worker: startSimulation");
		running = true;
		// update settings..
		simulate(1000);	
		postMessage( JSON.stringify({'message':'firstCells', 'cells':cells}) );
	
		simulate();		// simulate rest
		postMessage( JSON.stringify({'message':'allCells', 'cells':cells}) );
		
	}
	
	
}







// Single Cell Object
var Cell = function(parent) {
	this.index = cells.length;				// append to cells array
	this.radius = 0;
	this.finalRadius = Math.floor(Math.random() * 5 + 10);
	this.children = [];
	this.alive = true;
	this.died = undefined;				// timestep
	this.born = time;					// timestep
	this.randomAngle = Math.random()*Math.PI*2;
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







// Simulate one generation

var simulate = function(limit) {
	if (cells.length===0) {
		console.log("No cells defined.");
	}
	
	if (limit===undefined) {
		limit = settings.maxNumberOfCells;
	}
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
			
			if (cells.length === limit) {					//  break when the desired number of cells are reached
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



