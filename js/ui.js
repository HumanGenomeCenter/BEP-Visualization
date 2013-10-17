function updateField(name, value, factor) {
	if (factor === undefined) factor = 1;
	var v = parseInt(value, 10)/factor;
	$("#" + name + "_label").html(v);
	bep[name] = v;
}

$(document).ready(function() {
	console.log("ready");
	
	$("#maxBinary").on("change", function() {
		updateField("maxBinary", this.value);
	});
	
	$("#mutationRate").on("change", function() {
		updateField("mutationRate", this.value, 100);
	});
	
	$("#growthRate").on("change", function() {
		updateField("growthRate", this.value, 100);
	});
	
	$("#deathRate").on("change", function() {
		updateField("deathRate", this.value, 100000000);
	});
	
	$("#deathRateForNonStem").on("change", function() {
		updateField("deathRateForNonStem", this.value, 1000);
	});
	
	$("#symmetricReplicationProbablity").on("change", function() {
		updateField("symmetricReplicationProbablity", this.value, 1000);
	});
	
	$("#maxTime").on("change", function() {
		updateField("maxTime", this.value);
	});
	
	$("#maxPopulationSize").on("change", function() {
		updateField("maxPopulationSize", this.value);
	});
	
	$("#genomeSize").on("change", function() {
		updateField("genomeSize", this.value);
	});
	
	$("#driverSize").on("change", function() {
		updateField("driverSize", this.value);
	});
	
	$("#essensialGeneSize").on("change", function() {
		updateField("essensialGeneSize", this.value);
	});
	
	$("#fitnessIncrease").on("change", function() {
		updateField("fitnessIncrease", this.value);
	});
	
	$("#initialPopulationSize").on("change", function() {
		updateField("initialPopulationSize", this.value);
	});
	
	$("#startSimulation").on("click", function() {
		bep.initialize();
	});
	
	
});




var canvas = document.getElementById("sim");
var ctx = canvas.getContext("2d");
var drawImage = function() {
	console.log("draw");
	clearImage();
	
	var arraySize = 3 * bep.limXY + 1;

	
	ctx.translate(canvas.width/2, canvas.height/2);		// centering drawing
	ctx.save();
	
	var s = 2;
	var cells = _.values(bep.cells);
	for(var i=0; i<cells.length; i++) {
		var cell = cells[i];
		ctx.fillStyle = cell.color;
		ctx.fillRect(cell.x*s, cell.y*s, s, s);
	}

	ctx.restore();
	
};

var clearImage = function() {
	canvas.width = canvas.width;
};