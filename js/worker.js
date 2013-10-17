

onmessage = function(e) {
	var x = e.data;
	var x = 10000;
	var a = [];
	for (var i=0; i<x; i++) {
		a[i] = i;
	}
	postMessage(a);
}
