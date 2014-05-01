// reading & getting settings

// default settings
var settings = {
	n: 100,						// number of genes
	d: 10, 						// number of driver genes, first d genes of g
	e: 5,						// number of essential genes 
	mutationRate: 0.01,			// mutation probabiliy of each gene when replicated
	growthRate: 0.01,			// 0.0001
	deathRate: 0.0001,		
	deathRateForNonStem: 0.01,
	srp: 0.1,	//s ymmetricReplicationProbablity
	fitnessIncrease: 5, 
	maxNumberOfCells: 500,
	initialCells: 8,
};

var updateSettingsInUI = function() {
	$('#initialCellsNumber').html(settings.initialCells);
	$('#mutationRate_label').html(settings.mutationRate);
	$('#growthRate_label').html(settings.growthRate);
	$('#deathRate_label').html(settings.deathRate);
	$('#deathRateForNonStem_label').html(settings.deathRateForNonStem);
	$('#srp_label').html(settings.srp);
	$('#maxPopulationSize_label').html(settings.maxNumberOfCells);
	$('#genomeSize_label').html(settings.n);
	$('#driverSize_label').html(settings.d);
	$('#essensialGeneSize_label').html(settings.d);
	$('#fitnessIncrease_label').html(settings.fitnessIncrease);
}

var getSettings = function() {
	/*
	if (window.localStorage && window.localStorage.bepSettings) {
		settings = JSON.parse(window.localStorage.bepSettings);  	// reading cached settings
		updateSettingsInUI();									// updating display
	} 
	*/
	return settings;
}



$(document).ready(function() {
	// Update Settings
	
	$("#initialCellsSlider").on('change', function(e) {
		var n = parseInt(this.value);
		$('#initialCellsNumber').html(n);		// update number display
		settings.initialCells = n;						// update settings
	});
	
	$("#mutationRate").on("change", function() {
		updateSettings(this, "mutationRate", "mutationRate_label", "mutationRate", "mutationRate");
	});
	
	$("#growthRate").on("change", function() {
		updateSettings(this, "growthRate", "growthRate_label", "growthRate");
	});
	
	$("#deathRate").on("change", function() {
		updateSettings(this, "deathRate", "deathRate_label", "deathRate");
	});
	
	$("#deathRateForNonStem").on("change", function() {
		updateSettings(this, "deathRateForNonStem", "deathRateForNonStem_label", "deathRateForNonStem");
	});
	
	$("#srp").on("change", function() {
		updateSettings(this, "srp", "srp_label", "srp");
	});
	
	/*
	$("#maxTime").on("change", function() {
		updateField("maxTime", this.value);
	});
	*/
	
	$("#maxPopulationSize").on("change", function() {
		updateSettings(this, "maxPopulationSize", "maxPopulationSize_label", "maxNumberOfCells");
	});
	
	$("#genomeSize").on("change", function() {
		updateSettings(this, "genomeSize", "genomeSize_label", "n");
	});
	
	$("#driverSize").on("change", function() {
		updateSettings(this, "driverSize", "driverSize_label", "d");
	});
	
	$("#essensialGeneSize").on("change", function() {
		updateSettings(this, "essensialGeneSize", "essensialGeneSize_label", "essentialGeneSize");
	});
	
	$("#fitnessIncrease").on("change", function() {
		updateSettings(this, "fitnessIncrease", "fitnessIncrease_label", "fitnessIncrease");
	});
});

var updateSettings = function(that, key, label, settingName) {
	var s = $(that);
	var sliderMin = s.attr('min');
	var sliderMax = s.attr('max');
	var value = s.val();
	var displayValue = value;
		
	if (s.data('min')!==undefined && s.data('max')!==undefined) {		// transpose
		var scale = d3.scale.linear()
						.domain([sliderMin, sliderMax])
						.range([s.data('min'), s.data('max')]);
		value = scale(value);
		displayValue = value.toPrecision(2);
	}

	settings[settingName] = parseFloat(value);						// update settings
	$("#"+key+"_label").html(displayValue);							// update display
	if (window.localStorage) {										// update cache
		window.localStorage.bepSettings = JSON.stringify(settings);
	}
}

// get settings
settings = getSettings();






