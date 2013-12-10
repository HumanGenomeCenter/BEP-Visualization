// Importing Libraries for Worker

importScripts('science.v1.min.js');
importScripts('underscore-min.js');
importScripts('underscore-mixins.js');
importScripts('colorbrewer.js');

// Worker's copy of global bep object
var cells = [];
var newCells = [];
var running = false;
var time = 0;




onmessage = function(e) {
	if (e.message == "play") {
		running = true;
		postMessage("started");
	} else if (e.message == "pause") {
		running = false;
		postMessage("paused");
	} else {
		//	var message = e.data.cell;
		//	bep = e.data.bep;
			var newCell = Math.random();
			cells.push(newCell);
			postMessage(cells);
	}
	

}
