// https://gist.github.com/mbostock/3231307

// default svg size
var width = 960;
var height = 500;


/* - - - - - - - - -  Settings - - - - - - - - -  */
// Define or get from local storage





/* - - - - - - - - -  Settings End - - - - - - - - -  */

var time = 0;
var simulating = false;
var cells = [];
var cachedCellCounter;

var force = d3.layout.force()
	.size([width, height])
	.gravity(0.00)
	.charge(100)
//	.chargeDistance
	.friction(0.2)
	.nodes(cells, function(n){ return n.id})
	.linkDistance(10)			// default 20
	.linkStrength(0)			// [0,1] default 1
//	.start();
	
	
var tree = d3.layout.tree()
	.size([width, height])
	
var tempChildren = [];
var updateTree = function() {
	cells.forEach(function(n){
		var a = n.children.map(function(childID){
			tempChildren.push(childID);
			return cachedCells[childID];
			
		});
		n.children = a;
	})
	tree.nodes(cells);
	tempChildren.sort(function(a,b){ return a-b });
}
	

/* - - - - - - - - -  Zoom - - - - - - - - -  */


var zoom = d3.behavior.zoom()
	.scaleExtent([0.05, 10])	// 1=>100%
	.on("zoom", zoomed);		// register zoom event

function zoomed() {
	$("#zoomLabel").text(zoom.scale().toPrecision(2));
	inner.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

var zooming = false;

var zoomBehaviour = function(scale) {
	var s, t, it, is, z;
	console.log(scale);
//	$("#zoomLabel").text(zoom.scale());
	
	// Clicks on the zoom buttons during zoom tweens are being ignored
	if (!zooming) {
		zooming = true;
		if (scale==='reset') {	// zoom reset
			t = {'start':zoom.translate(), 'end':[0,0]},
			s = {'start':zoom.scale(), 'end':1};
		} else if (scale==='in') {
			// 1
			z = zoom.scale()*2;
			t = {'start':zoom.translate(), 'end':[zoom.translate()[0]+(-zoom.scale()*width/2), zoom.translate()[1]+(-zoom.scale()*height/2)] },
			s = {'start':zoom.scale(), 'end':z};
		} else if (scale==='out') {
			z = zoom.scale()/2;
			t = {'start':zoom.translate(), 'end':[zoom.translate()[0]+(z*width/2), zoom.translate()[1]+(z*height/2)] },
			s = {'start':zoom.scale(), 'end':z};
		}
		it = d3.interpolate(t.start, t.end),
		is = d3.interpolate(s.start, s.end);
		d3.transition()
			.duration(750)
			.tween("zoom", function() {
				return function(tween) {
					inner.attr("transform", "translate(" + it(tween) + ")scale(" + is(tween) + ")");
				};
			})
			.each("end", function() {
				zoom.scale(s.end).translate(t.end);		// match object zoom settings with visual settings
				zooming = false;
				$("#zoomLabel").text(zoom.scale().toPrecision(2));
			});
	}	
}

/* - - - - - - - - -  Zoom End - - - - - - - - -  */


var inner = d3.select("div#cells svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "forceCells")
		.call(zoom)
	.append("g")
 		.attr("id", "inner");
	
var cellGroup = inner.append("g").attr("id", "cellGroup");
var linkGroup = inner.append("g").attr("id", "linkGroup");

var circles = cellGroup.selectAll("circle")
	.data(cells, function(n) { return n.id; })			// join node data with id
	.enter().append("circle")
		.attr("r", function(d) { return d.radius; })
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("fill", function(d) { return d.color; });

force.on("tick", function(e) {
	var q = d3.geom.quadtree(cells),
	i = 0,
	n = cells.length;
	while (++i < n) q.visit(collide(cells[i]));
	updateCellPosition();
});
 
var updateCellPosition = function() {
	// nodes
	circles
		.attr("cx", function(n) { return n.x; })
		.attr("cy", function(n) { return n.y; });
		
	// links
	if (force.links().length > 0) {
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
	}
}




	
	
/*

// var dragging = false;
// var circleElement;
inner.on("mousedown", function(c) {
	root = circle;
	root.fixed = true;
	root.color = this.style["fill"];				// temp save node color
	this.style["fill"] = "f00";						// highlight node	
	circleElement = this;							// save handler for circle svg	
	dragging = true;
	
});



svg.on("mousemove", function() {
	if (dragging) {
		var p1 = d3.mouse(this);
		root.px = p1[0];
		root.py = p1[1];
	}

});

svg.on("mouseup", function() {
	if (dragging) {
		dragging = false;
		delete root.fixed;
		circleElement.style["fill"] = root.color;		// restore color
		delete root.color;
		force.resume();
	}
});
*/

function collide(node) {

	var r = node.radius,	
	nx1 = node.x - 2*r,
	nx2 = node.x + 2*r,
	ny1 = node.y - 2*r,
	ny2 = node.y + 2*r;

	return function(quad, x1, y1, x2, y2) {
		if (quad.point && (quad.point !== node)) {
			var x = node.x - quad.point.x,
			y = node.y - quad.point.y,
			l = Math.sqrt(x * x + y * y),
			r = node.radius + quad.point.radius;
			if (l < r) {
				l = (l - r) / l * .5;
				node.x -= x *= l;
				node.y -= y *= l;
				quad.point.x += x;
				quad.point.y += y;
			}
		}
		return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	};
}




// Interactions

var interpolateNodeSize = function(node) {	
	var easeMode = "cubic-in-out";
	if (node.radius === node.finalRadius) return;
	var interpol = d3.interpolateNumber(node.radius, node.finalRadius);
	var ease= d3.ease(easeMode);
	var duration = 1000;
	var timer = d3.timer(function(t){
		if (t>duration) {
			node.radius = node.finalRadius;		// make sure the radius become the original radius
			delete node.finalRadius;			// remove finalRadius property
			return true; // true ends timer
		}
		node.radius = interpol(ease(t/duration));
	});	
}





var updateNodeDisplay = function(n) {
	
	force.charge(0);
	
	circles = cellGroup.selectAll("circle")						// select
		.data(cells, function(n) { return n.id; } );		// rebind with key

	force.nodes(cells, function(n) { return n.id; } );			// rebind new cells with force layout
	
	/*
	// create new link map
	links = [];
	cells.map(function(cell) {
		var ancestor = findAncestor(cell);									// get ancestor cell from cached cells
		if (ancestor !== false) {										// check if ancestor exists
			if (cell.alive && ancestor.alive) {						// check if cell and parent are alive
				links.push({'source': ancestor, 'target': cell});		// create link with objects
			}
		}
	});
	*/
	
	
//	force.links(links, function(d,i) { i + "-" + d.source.id + "-" + d.target.id; });
	force.start();
	
	circles.enter()											// enter
		.append("circle")
			.attr("r", 0)									// initial radius
			.attr("x", function(n) { return n.x; })
			.attr("y", function(n) { return n.y; })
			.attr("fill", function(n) {return n.color})
			.transition()
				.duration(1000)
				.ease("cubic-in-out")		// match with interpolateNodeSize()
				.attr("r", function(n) { return n.finalRadius; })
				.each("start", function(n) { interpolateNodeSize(n); })
			;	// update visuals
	
	//circles.exit().remove();
		
	
	circles.exit()
		.transition()
			.duration(199)				// match with delay time at adding cells..., or remove transition completely
			.ease("cubic-in-out")
			.attr("r", 0)
		.remove();
	
	
/*
	link = linkGroup.selectAll("line.link")		
		.data(links, function(d, i) { 
			var unique = i + "-" + d.source.id + "-" + d.target.id;
			return  unique; 
		});

	link.enter()
		.append("line").attr("class", "link")
		.attr("opacity", 0)
		.attr("line-width", 0)
		.transition()
			.duration(800)
			.attr("opacity", 1)
			.attr("line-width", 2)
	
	link.exit().remove();			// remove when they no longer exist
	*/
	
	
	if (cells.length>0) {
		$("#cellLabel").text(cells.length);
		$("#timeLabel").text(cells[cells.length-1].born);
	} else {
		$("#cellLabel").text("0");
		$("#timeLabel").text("0");
	}

	
}


// find closed ancestor of a cell. in cases when the parent died, create link to ancestor.
var findAncestor = function(cell) {
	var parentID = cell.parent;
	while (parentID !== false) {
		var ancestor = cachedCells[parentID];
		if (ancestor.alive) {
			return ancestor;
		}
		parentID = ancestor.parent
	}	
	return false;
}






/* - - - - - - - - - Create Inital Cells - - - - - - - - - */



var addCell = function(nr) {
	if (nr===undefined) nr = 1;
	for(var i=0; i<nr; i++) {
		cells.push(new Cell());
	}
	updateNodeDisplay();
}

var removeCell = function(nr) {
	if (nr===undefined) nr = 1;
	for(var i=0; i<Math.abs(nr); i++) {
		cells.pop();
	}
	updateNodeDisplay();
}

var initialCellsCopy;
var addInitialCells = function(next) {
	console.log("addInitialCells");
	cells = [];
	var intervalID = window.setInterval(function() {
		addCell();
		if (cells.length>=settings.initialCells) {
			clearInterval(intervalID);
			initialCellsCopy = deepCopy(cells);
			if (next) next();	// if exists, execute passed function
		}
	}, 300);

};




var addAdditionalCells = function(limit) {

	var delay = 200;
	force.charge(0); // neutralize force
		
	var intervalID = window.setInterval(function() {
		
		// add cell
		var cell = summary.cells[cachedCellCounter]; 		// get next cached cell
		cachedCellCounter++;							// increase cached cell counter
		
		var parentCell = summary.cells[cell.summary.parent];		// get parent cell with cell.parent it from cachedCells, because cells[] position will change when cells die
	
		cell.color = simulation.varyColor(parentCell.color);
		cell.x = Math.cos(cell.randomAngle)*parentCell.radius + parentCell.x;
		cell.y = Math.sin(cell.randomAngle)*parentCell.radius + parentCell.y;
		cells.push(cell);
		
		// check for dead cells and remove
		
		// update generation
		var now = cell.born;		// get the current time from the current cell's birth time
		$('#timeStep').text(now);
		
		/*
		var cellsToDelete = [];
		for (var i=0; i<cells.length; i++) {
			if ((cells[i].died !== undefined) && (now >= cells[i].died)) {
				cellsToDelete.push(i);
				cells[i].alive = false;
			}
		}
		for (var j = cellsToDelete.length-1; j>=0; j--) {
			var d = cellsToDelete[j];
			var deletedCell = cells.splice(d, 1); 
		}
		*/
		updateNodeDisplay();
		
		// stop adding cells
		if (cells.length>=summary.cells.length) clearInterval(intervalID);
		
		// add limited cells for testing
		if (cachedCellCounter > limit) clearInterval(intervalID);
			
	}, delay);
	simulating = false;
}

function stopSimulation() {
	clearInterval(intervalID);
}




var reset = function() {
	time = 0;
	simulating = false;
	cells = [];			// displayed cells
	cachedCellCounter = settings.initialCells;
}

reset();
addInitialCells();		// add at load




















/* - - - - - - - - - Save Frames End- - - - - - - - - */
