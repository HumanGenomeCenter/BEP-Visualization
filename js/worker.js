// Importing Libraries for Worker

importScripts('science.v1.min.js');
importScripts('underscore-min.js');
importScripts('underscore-mixins.js');
importScripts('colorbrewer/colorbrewer.js');

// Worker's copy of global bep object
var bep;

onmessage = function(e) {
	var message = e.data.message;
	bep = e.data.bep;
	postMessage(e.data.message);
}
