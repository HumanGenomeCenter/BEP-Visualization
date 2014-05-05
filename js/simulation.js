

var simulation = {
	info: {},
	cells: [],
};

simulation.reset = function() {
	simulation.info = {};
	simulation.cells = deepCopy(initialCellsCopy);	// copy initial cells
}

var summary = {
	cellsByGene: [],
	map: [],
	cutoffCells: [],
	cells: [],
	scaleFactor: 1.01, 	// for scaling summary cells	
};


summary.reset = function() {
	summary.cellsByGene = [];
	summary.map = [];
	summary.cutoffCells = [];
	summary.cells = [];
}

summary.replay = function() {
	if (summary.cellsCopy) {
		summary.cells = deepCopy(summary.cellsCopy);
	}
}




// Mutate Cells
var Cell = function(parent) {
		
	// append to cells array
	this.radius = 0;
	this.finalRadius = 12;		// randomize radius? Math.floor(Math.random() * 5 + 10);
	this.children = [];
	this.born = time;					// timestep
	this.alive = true;
	this.died = undefined;				// timestep
	this.randomAngle = Math.random()*Math.PI*2;
	this.summary = {};
	
	if (parent === undefined) {
		var i = cells.length;
		this.id = i;
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
		//console.log("cell",i,this.x, this.y);

		this.summary.parent = false;
		
		this.driverGenes = d3.range(settings.d).map(function() { return false; });			// false -> not mutated
		this.essentialGenes = d3.range(settings.e).map(function() { return false; })
		this.genes = d3.range(settings.n-settings.d-settings.e).map(function() { return false; });		// false -> not mutated
		
	} else {
		
		var i = simulation.cells.length;
		this.id = i;
		this.parent = parent.id;			// add parent id
		parent.children.push(this.id);	// add child id to parent	
		this.subtype = parent.subtype;			// initial subtypes
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
	
	simulation.reset();	
	summary.reset();
	
	console.log("\nStarting Simulation, Settings:", settings);
	
	var info = simulation.info;
	var limit = settings.maxNumberOfCells;		// set limit	
	
	var previousLength;
	
	simulationLoop: 		// while loop label
	while(true) {
		var cell, i;
		
		var length = simulation.cells.length;		// get new length
		
		// to prevent simulation running too long...
		if (time %1000 === 0) {
			console.log("time:", time, "length", length, limit);
			
			if (previousLength === length) {
				console.log("previousLength === length");
				break simulationLoop;
			}
			previousLength = length;
		}
		
		if (time > 100000) {
			break simulationLoop;
		}
		
		for (i=0; i<length; i++) {		// loop over cells
			
			if (simulation.cells.length === limit) {							//  break when the desired number of cells are reached
				console.log("Simulation reached limit.");
				break simulationLoop;
			}
						
			cell = simulation.cells[i];

			if (cell.died>=0) continue;	// skip if cell is dead
					
			var dr = Math.random();
			var drns = Math.random();
				
			if ((dr < settings.deathRate) || (drns < settings.deathRateForNonStem)) {				// Death Rate
				cell.alive = false;		// set alive status to false
				cell.died = time;		// time of death

				if (info.aliveCells === 0) { 
					console.log("No more cells alive.");
					break simulationLoop;		// no more alive cells left...
				}
				continue;
			}
			
			// Mutate & Replicate
			if (Math.random() < (simulation.getFitness(cell) * settings.growthRate)) {
				// mutate(cell); mutationg happens in new Cell()		
				var childCell = new Cell(cell);		// copy cell, id is cell length
				
				// if cell is stem cell and random() is larger than srp, create a normal cell
				if (cell.isStem && (Math.random() > settings.srp)) {
					childCell.isStem = false;		// -> normal cell
				} else {
					childCell.isStem = true;		// -> stem cell
				}
				
				if (simulation.getFitness(childCell) < 0) {
					childCell.alive = false; 	// update alive status
					childCell.died = time;		// time of death
				} 
				
				// stem cells and normal cell have the same genome!? only difference is the isStem bit
				
				simulation.cells.push(childCell);
			}		
			
		}
		time++;			// advance time on tick
	}
	
	console.log("Simulation finished:", simulation.cells.length, "Cells");
	console.timeEnd("simulation");

	summary.reduce();
	
	simulation.updateInfo();
	
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
	
	for (var i=0; i<simulation.cells.length; i++) {
		var cell = simulation.cells[i];
		if (cell.alive) {
			aliveCells++;	
		} else {
			deadCells++;
		}
		if (cell.isStem) stemCells++;
		if (!cell.isStem) normalCells++;
	}
	
	simulation.info.allCells = simulation.cells.length;
	simulation.info.aliveCells = aliveCells;
	simulation.info.deadCells = deadCells;
	simulation.info.stemCells = stemCells;
	simulation.info.normalCells = normalCells;
	
//	console.timeEnd("updateInfo");
}






/* - - - - - - - - - Summarize Cells - - - - - - - - - */



// reduce driver genes
summary.reduce = function() {
	// create and index of genetically same cells
	summary.cellsByGene = [];
	summary.map = [];
	for (var i=0; i<simulation.cells.length; i++) {
		var cell = simulation.cells[i];
		var genes = summary.driverGenesToBinary(cell);	// binary string to decimal number
		if (summary.cellsByGene[genes] === undefined) {
			summary.cellsByGene[genes] = [i];	// new array with intial cell id
			summary.map.push(genes);
			cell.summary.steps = [{'summaryID': summary.cells.length,'simulationID':i}];
			cell.summary.id = summary.cells.length;
			summary.cells.push(cell);
			
		} else {
			summary.cellsByGene[genes].push(i);
			var initialCellID = summary.cellsByGene[genes][0];
			var sameDriverCell = simulation.cells[initialCellID];
			sameDriverCell.summary.steps.push({'summaryID': summary.cells.length, 'simulationID':i})
			sameDriverCell.finalRadius = sameDriverCell.finalRadius * summary.scaleFactor;
		}
	}

	summary.findSummaryParents();
//	summary.createChanges();
	
	summary.length = this.map.length;
	summary.cellsCopy = deepCopy(summary.cells);
	console.log("Summary finished:", summary.cells.length, "Cells");
	
}

// broken
summary.getCellsByGene = function(geneArray) {
	var gene = summary.genesToBinary(geneArray);
	gene = parseInt(gene,2);
	return summary.cellsByGene[gene];
}
summary.getCells = function(i) {
	return summary.cellsByGene[summary.map[i]];
}

summary.driverGenesToBinary = function(cell) {
	var genes = cell.driverGenes.toString().replace(/\d+/g, "1").replace(/false/g, "0").replace(/,/g, "");
	genes = genes + cell.subtype.toString(2);	// add unique subtype as binary string
	genes = parseInt(genes,2);
	return genes;
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

summary.getGenes = function(summaryCellID) {
	// get a summary of genes & driver genes from a summary cell
	// loop over related cells & average genes
	
}

summary.findSummaryParents = function() {
	for (var i=0; i<summary.cells.length; i++) {
		// reverse loop through summary cells
		var parentID = summary.cells[i].parent;	// get parent ID
		if (parentID === false) continue;
		var parentDriverGenes = summary.driverGenesToBinary(simulation.cells[parentID]);		// get parent Gene as Number
		summary.map.map(function(cell, j) {
			var driverGenes = summary.driverGenesToBinary(summary.cells[j]);
			if (parentDriverGenes === driverGenes) {
				summary.cells[i].summary.parent = j;
			}
		});
	}
}


summary.createChanges = function() {
	
	// initate summary.changes with empty arrays
	var changes = [];	//summary.cells.map(function() { return []; });
	
	
	for (var i=0; i<summary.cells.length; i++) {
		var cell = summary.cells[i];
		for (var j=0; j<cell.summary.steps.length; j++) {
			var step = cell.summary.steps[j];
			
			if (!changes[step.summaryID]) changes[step.summaryID] = [];
			
	
			changes[step.summaryID].push({
				'summaryID':cell.id,
				'action': 'add',	// remove
				'simulationID': step.simulationID
			});
		} 
	}
	
	console.log(changes);
	

}


/* - - - - - - - - - Summarize Cells  End - - - - - - - - - */









simulation.findRoot = function(id) {
//	console.time("find root");
	var rootPath = [];
	var cell = simulation.cells[id];
//	console.log("parent", cell.parent);
	
	while (cell.parent) {
		cell = simulation.cells[cell.parent];
		rootPath.unshift(cell.id);
	}
//	console.log("root: " + cell.id, cell);
//	console.timeEnd("find root");
	return rootPath;
}





simulation.findChildren = function(id) {
	// brute force
	var childPath = [];
	var parentCell = simulation.cells[id];

	for (var i=id; i<simulation.cells.length; i++) {
		var childCell = simulation.cells[i];
		if (childCell.parent === parentCell.id) {
			childPath.push(childCell.id);
			childPath.push(findChildren());
		}
	}
	
	console.log(childPath);
	return childPath;
}



var deepCopy = function(obj) {
	return JSON.parse(JSON.stringify(obj));
}


var checkAlive = function() {
	for (var i=0; i<simulation.cells.length; i++) {
		var cell = simulation.cells[i];
		if (!cell.alive && (cell.born !== cell.died)) {
			console.log(i, "alive", cell.alive, "born", cell.born, "died", cell.died);
		}
	}
}

