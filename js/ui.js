var cursorHidden = false;

$(document).ready(function() {
	
	$("#simulate").click(function() {
		simulation.start();
		// don't use workers for now...
		// worker.postMessage(JSON.stringify({'message':'startSimulation', 'settings':settings, 'cells':cells}));
		
	});
	
	$("#playSimulation").click(function() {
		console.log("play");
		simulating = true;
		addAdditionalCells();
	});
	
	$("#replaySimulation").click(function() {
		simulating = false;
		console.log("replay");
				
		reset();
		updateNodeDisplay();
		
		addInitialCells(function() {
			console.log("next");
			summary.replay();
			simulating = true;
			addAdditionalCells();
		});
	});

	
	// preventing settings dropdown to hide when slider are changed
	$(".dropdown-menu-settings").on('click', function(e) {
		e.stopPropagation();
	});
	
	
	// Zoom Buttons
	$("#zoomIn").click(function() {
		zoomBehaviour('in');
	});
	
	$("#zoomOut").click(function() {
		zoomBehaviour('out');
	});
	
	$("#zoomReset").click(function() {
		zoomBehaviour('reset');
	});
	
	
	// hide cursor for filming
	$("body").keydown(function(e) {
		if (e.keyCode === 77) {
			if (cursorHidden) {
				$("body").css("cursor","auto");		// show
				cursorHidden = false;
			} else {
				$("body").css("cursor","none");		// hide
				cursorHidden = true;
			}
		} 
	});

	
	


});	
