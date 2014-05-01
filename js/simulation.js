

var cells = [];  // Create a nested structure for cells


var simulation = {
	info: {}
};

var time = 0;


// Mutate Cells
var Cell = function(parent) {
		
	var i = cells.length;
	this.id = i;				// append to cells array
	this.radius = 0;
	this.finalRadius = 12;		// randomize radius? Math.floor(Math.random() * 5 + 10);
	this.children = [];
	this.born = time;					// timestep
	this.alive = true;
	this.died = undefined;				// timestep
	this.randomAngle = Math.random()*Math.PI*2;
	
	this.sameDriverGenes = [];
	
	if (parent === undefined) {
		this.parent = false;	// root, no parents
		this.isStem = true;		// stem or normal... stem -> stem|normal, normal -> normal
						// timestep
		this.subtype = i;			// initial subtypes
		this.color = simulation.getColor[i];

		this.x = width/2 + (Math.floor(Math.random()*20-10));
		this.y = height/2 + (Math.floor(Math.random()*20-10));
		if (i>0) {
			var neighbourCell = cells[Math.floor(Math.random()*i)];
			this.x = Math.cos(this.randomAngle)*neighbourCell.radius + neighbourCell.x;
			this.y = Math.sin(this.randomAngle)*neighbourCell.radius + neighbourCell.y;		
		}
		
		this.driverGenes = d3.range(settings.d).map(function() { return false; });			// false -> not mutated
		this.essentialGenes = d3.range(settings.e).map(function() { return false; })
		this.genes = d3.range(settings.n-settings.d-settings.e).map(function() { return false; });		// false -> not mutated
		
	} else {
		
		this.parent = parent.id;			// add parent id
		parent.children.push(this.id);	// add child id to parent
		
		console.log("parent", parent.subtype, parent.id);
		
		this.subtype = parent.subtype;			// initial subtypes
		
		this.color = simulation.varyColor(parent.color);
		
	//	this.x = Math.cos(parent.randomAngle)*parent.radius + parent.x;
	//	this.y = Math.sin(parent.randomAngle)*parent.radius + parent.y;
		
		this.genes = parent.genes.slice(0);					// copy genes
		this.driverGenes = parent.driverGenes.slice(0);		// copy parent driver genes
		this.essentialGenes = parent.essentialGenes.slice(0);		// copy parent driver genes
		simulation.mutate(this);
		
	}
	
}


/* - - - - - - - - -  Color - - - - - - - - -  */

/* Create Array of string colors, declare function & execute once */
simulation.getColor = function() {
	return colorbrewer.Set1[9].map(function(c){ return c; });
//	return colorbrewer.Set3[12].map(function(c){ return c; });
}();

simulation.varyColor = function(stringColor) {
	var color = d3.rgb(stringColor);
	if (Math.random() > 0.5) {
		return color.darker(Math.random()/3).toString();		// return hex color, NOT d3.rgb object
	} else {
		return color.brighter(Math.random()/3).toString();
	}
}

/* - - - - - - - - -  Color End - - - - - - - - -  */




simulation.start = function() {
	console.log("starting simulation, settings:", settings);
	time = 0;
	var info = simulation.info;
	// empty & re-populate
	/*
	cells = [];
	for(var i=0; i<settings.n; i++) {
		cells.push(new Cell());
	}
	*/
	
	// set limit
	var limit = settings.maxNumberOfCells;
	
	
	simulationLoop: 		// while loop label
	while(true) {
		var cell, i;
		var length = cells.length;		// get new length

		for (i=0; i<length; i++) {		// loop over cells
			
			if (cells.length === limit) {							//  break when the desired number of cells are reached
				break simulationLoop;
			}
						
			cell = cells[i];

			if (cell.died>=0) continue;	// skip if cell is dead
			
			// Remove
		
			var dr = Math.random();
			var drns = Math.random();
		
				
			if ((dr < settings.deathRate) || (drns < settings.deathRateForNonStem)) {				// Death Rate
		
				cell.died = time;		// time of death
				if (info.aliveCells === 0) break simulationLoop;		// no more alive cells left...
				continue;
			}
			
			// Mutate & Replicate
			if (Math.random() < (simulation.getFitness(cell) * settings.growthRate)) {
				// mutate(cell); mutationg happens in new Cell()		
				var childCell = new Cell(cell);		// copy cell, id is cell length
				
				// if cell is stem cell and random() is larger than srp, create a normal cell
				if (cell.isStem && (Math.random() > settings.srp)) {
					childCell.isStem = false;		// -> normal cell
				}
				
				if (simulation.getFitness(childCell) < 0) {
					childCell.alive = false; 	// update alive status
					childCell.died = time;		// time of death
			
				} 
				// stem cells and normal cell have the same genome!? only difference is the isStem bit
				
				cells.push(childCell);
			}		
			
		}
		time++;			// advance time on tick
	}
	
	simulation.updateInfo();
	console.timeEnd("simulation");
}


simulation.getFitness = function(cell) {
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


simulation.mutate = function(cell) {
	if (cell.died >= 0) return;		// don't mutate if cell is dead
	simulation.mutateGenes(cell.driverGenes);
	simulation.mutateGenes(cell.essentialGenes);
	simulation.mutateGenes(cell.genes);
}

simulation.mutateGenes = function(genes) {
	for (var i=0; i<genes.length; i++) {
		if (genes[i]===false) {
			if (Math.random() < settings.mutationRate) {	// not mutated, & mutation probabiliy of each gene when replicated
				genes[i] = time;												// change to mutated time
			} 
		}
	}	
}


// TODO: move update to front
simulation.updateInfo = function() {
	console.time("updateInfo");
	var allCells = 0,
	aliveCells = 0,
	deadCells = 0,
	stemCells = 0,
	normalCells = 0;
//	links = [];
	
	for (var i=0; i<cells.length; i++) {
		var cell = cells[i];
		if (cell.alive) {
			aliveCells++;	
		} else {
			deadCells++;
		}
		if (cell.isStem) stemCells++;
		if (!cell.isStem) normalCells++;
		
		/*
		// create Links
		if (cell.parent) {		// original cells don't have parents
			links.push({'source': cell.parent, 'target': cell.id});
		}
		*/
	}
	
	simulation.info.allCells = cells.length;
	simulation.info.aliveCells = aliveCells;
	simulation.info.deadCells = deadCells;
	simulation.info.stemCells = stemCells;
	simulation.info.normalCells = normalCells;
//	simulation.info.links = links;
	
	summary.reduce();
	console.timeEnd("updateInfo");
}






/* - - - - - - - - - Summarize Cells - - - - - - - - - */

var summary = {};
summary.cellsByGene = [];
summary.map = [];
summary.cutoffCells = [];
summary.cells = [];

// reduce driver genes
summary.reduce = function() {
	// create and index of genetically same cells
	summary.cellsByGene = [];
	summary.map = [];
	for (var i=0; i<cells.length; i++) {
		var genes = cells[i].driverGenes;
		genes = genes.toString().replace(/\d+/g, "1").replace(/false/g, "0").replace(/,/g, "");	// genes array to binary string
		genes = parseInt(genes,2); 							// binary string to decimal number
		if (summary.cellsByGene[genes] === undefined) {
			summary.cellsByGene[genes] = [i];	// new array with intial cell id
			summary.map.push(genes);
			

			summary.cells.push(cells[i]);
			
			
		} else {
			summary.cellsByGene[genes].push(i);
			
			var initialCellID = summary.cellsByGene[genes][0];
			var sameDriverCell = cells[initialCellID];
			sameDriverCell.sameDriverGenes.push(i);
			
		}
	}
	
	// map radius to same driver cells
	for (var i=0; i<summary.cells.length; i++) {
		var cell = summary.cells[i];
		cell.finalRadius = cell.sameDriverGenes.length / Math.PI;
	}


	summary.length = this.map.length;
	
	console.log(summary);
}
summary.getCellsByGene = function(geneArray) {
	var gene = geneArray.toString().replace(/\d+/g, "1").replace(/false/g, "0").replace(/,/g, "");
	gene = parseInt(gene,2);
	return summary.cellsByGene[gene];
}
summary.getCells = function(i) {
	return summary.cellsByGene[summary.map[i]];
}

summary.cluster = function() {
	// http://mus.org.uk/teapot/clustering-in-javascript/
	// https://github.com/harthur/clusterfck
	// https://code.google.com/p/figue/
}

summary.cutoff = function(threshold) {
	summary.cutoffCells = [];
	if (threshold === undefined) threshold = 0;
	summary.map.forEach(function(key, i) {
	//	console.log(key, i);
		
		var c = summary.getCells(i)
		if (c.length > threshold) {
			summary.cutoffCells[key] = c;
		}
	});
}

/* - - - - - - - - - Summarize Cells  End - - - - - - - - - */









simulation.findRoot = function(id) {
	console.time("find root");
	var rootPath = [];
	var cell = cells[id];
	console.log("parent", cell.parent);
	
	while (cell.parent) {
		cell = cells[cell.parent];
		rootPath.unshift(cell.id);
	}
	console.log("root: " + cell.id, cell);
	
	console.timeEnd("find root");
	return rootPath;
}



simulation.findChildren = function(id) {
	// brute force
	
	var childPath = [];
	
	var parentCell = cells[id];


	for (var i=id; i<cells.length; i++) {
		var childCell = cells[i];
		if (childCell.parent === parentCell.id) {
			childPath.push(childCell.id);
			childPath.push(findChildren());
		}
	}
	
	console.log(childPath);
	return childPath;
}



