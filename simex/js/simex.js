
var values = {};
values.s = parseFloat($("#s > a").html());
values.r = parseFloat($("#r > a").html());
values.d = parseFloat($("#d > a").html());
values.f = parseFloat($("#f > a").html());

var details = [];
var selected = [false, false, false, false, false];
var bep = {};
bep.ε = {};
bep.μ = {};
bep.ρ = {};
bep.λ = {};
bep.τ = {};
bep.θ = {};

var settings = {};
settings.relative = true;
settings.boxWidth = 8;
settings.boxHeight = 12;
settings.boxSpacing = 1;


var data = {};

$(document).ready(function() {
	
	$.getJSON(
		"data/stat.json",
		function(d) {
			console.log("data loaded");
			data = d;
			readData();
		}
	);

});


var setLabel = function(id, val) {
	$("#"+id+"_label").html(val);
}


// buttons
$(".button#r a, .button#s a").on('click', function(e) {
	e.preventDefault();
	var id = $(this).parent().attr('id');
	var value = parseFloat($(this).html());
	
	$(this).siblings().removeClass("selected");
	$(this).addClass("selected");
	values[id] = value;
	setLabel(id, value);
	update();	
});

$(".button#d a, .button#f a").on('click', function(e) {
	e.preventDefault();
});

// scale
$(".button#abs a").on('click', function(e) {
	e.preventDefault();
	var v = $(this).data().value;
	if (v==="rel") settings.relative = true;
	if (v==="abs") settings.relative = false;
	$(this).siblings().removeClass("selected");
	$(this).addClass("selected");
	update();
});



var data; // a global
	
var readData = function() {	
	d3.json("data/stat.json", function(error, json) {
		if (error) return console.warn(error);
		data = json;
		init();
	});
}


// Scales to access array data & deal with JS error
var map = {};
map.s = {
	map: d3.scale.log().domain([1, 100]).range([0, 2]).clamp(true),
	value: function(x) { return this.map(x*100) },
	i: function(x) { return Math.round(this.map.invert(x))/100;},
}

map.r = {
	map: d3.scale.log().domain([1, 100]).range([0, 2]).clamp(true),
	value: function(x) { return this.map(x*10000) },
	i: function(x) { return Math.round(this.map.invert(x))/10000;},
}

map.d = {
	map: d3.scale.linear().domain([1, 10]).range([9, 0]).clamp(true),
	value: function(x) { return this.map(x) },
	i: function(x) { return Math.round(this.map.invert(x));},
}

map.f = {
	map: d3.scale.linear().domain([10, 150]).range([0, 28]).clamp(true),
	value: function(x) { return this.map(x*100) },
	i: function(x) { return Math.round(this.map.invert(x))/100;},
}


/*
"ε (population entropy)"		red 		#FF0000
"μ (founder mutation count)"	blue		#0000FF
"ρ (average mutation count)"	green3		#00CD00
"log10 λ (population fitness)"	yellow2		#EEEE00
"log10 τ (growth time)" 		purple 		#A020F0
"θ (self similality)"			orange		#FFA500

*/

bep.ε.colorMap = d3.scale.linear().range(["#FFFFFF", "#FF0000"]).clamp(true);
bep.μ.colorMap = d3.scale.linear().range(["#FFFFFF", "#0000FF"]).clamp(true);
bep.τ.colorMap = d3.scale.linear().range(["#FFFFFF", "#A020F0"]).clamp(true);

bep.ρ.colorMap = d3.scale.linear().range(["#FFFFFF", "#00CD00"]).clamp(true);
bep.λ.colorMap = d3.scale.linear().range(["#FFFFFF", "#EEEE00"]).clamp(true);
bep.θ.colorMap = d3.scale.linear().range(["#FFFFFF", "#FFA500"]).clamp(true);


var g = {};

var svg;
var init = function() {
	
	var width = 960, height = 350;
	var div = d3.select('#overview');
	svg = div.append('svg')
			.attr('width', width)
			.attr('height', height);
			
	d3.select('body').on("mouseup", generalMouseUp);		// general mouseup handler
	
	
	// helper function to add indicators
	var addIndicator = function(x) {

		var indicators = x.append('g').attr('class', 'indicators');
		
		var color = '#999999';
		var thickness = 7;
		var spacing = 3;
		
		indicators.append('rect')
			.attr('class','d-indicator')
			.attr('x', -thickness-spacing)
			.attr('y', (settings.boxHeight+settings.boxSpacing)*(map.d.value(values.d)))
			.attr('width', thickness)
			.attr('height', settings.boxHeight)
			.attr('fill', color);

		indicators.append('rect')
			.attr('class','f-indicator')
			.attr('x', (settings.boxWidth+settings.boxSpacing)*(map.f.value(values.f)))
			.attr('y', 131)
			.attr('width', settings.boxWidth)
			.attr('height', thickness)
			.attr('fill', color);
			
			
		// axis
		var fAxis = d3.svg.axis()
			.orient('left')
			.scale(d3.scale.linear().domain([1,10]).range([117,0]))
			.ticks(10)

		xAxis = x.append('g')
			.attr('class', 'f-axis axis')
			.attr('transform', 'translate(-3,6)')
			.call(fAxis);
			
		var dAxis = d3.svg.axis()
			.orient('bottom')
			.scale(d3.scale.linear().domain([0.1,1.5]).range([0,251]))
			.ticks(10)

		yAxis = x.append('g')
			.attr('class', 'd-axis axis')
			.attr('transform', 'translate(4.5,132)')
			.call(dAxis);
				
			
			
		
	}
	
	// positions
	g.ε = svg.append('g')
			.attr('class', 'ε')
			.attr('transform', 'translate(25,0)');
	g.ε.append('g').attr('class', 'boxes');
	addIndicator(g.ε);
	
	g.μ = svg.append('g')
		.attr('class', 'μ')
		.attr('transform', 'translate(355,0)');
	g.μ.append('g').attr('class', 'boxes');
	addIndicator(g.μ);
	
	g.τ = svg.append('g')
		.attr('class', 'τ')
		.attr('transform', 'translate(675,0)');
	g.τ.append('g').attr('class', 'boxes');
	addIndicator(g.τ);
	
	g.ρ = svg.append('g')
		.attr('class', 'ρ')
		.attr('transform', 'translate(25,180)');
	g.ρ.append('g').attr('class', 'boxes');
	addIndicator(g.ρ);
	
	g.λ = svg.append('g')
		.attr('class', 'λ')
		.attr('transform', 'translate(355,180)');
	g.λ.append('g').attr('class', 'boxes');
	addIndicator(g.λ);
	
	g.θ = svg.append('g')
		.attr('class', 'θ')
		.attr('transform', 'translate(675,180)');
	g.θ.append('g').attr('class', 'boxes');
	addIndicator(g.θ);
	

	
	
	
	update();
}




var srMatrix;

var update = function() {
	
	srMatrix = data[map.s.value(values.s)][map.r.value(values.r)];
	
	// get data
	
	// find higest & lowest values
	if (settings.relative) {
		updateLimits(srMatrix);
	} else {
		getLimits();		// cache
	}
	
	updateDisplay('ε');
	updateDisplay('μ');
	updateDisplay('τ');
	updateDisplay('ρ');
	updateDisplay('λ');
	updateDisplay('θ');
	
	updateImages();
}


var updateDisplay = function(x) {

	var rw = settings.boxWidth;
	var rh = settings.boxHeight;
	var p = settings.boxSpacing;
	// join

	var boxes = d3.select("g."+x+" g.boxes");  // select boxes
	grp = boxes.selectAll('g')
		.data(srMatrix);
	
	grp.enter()
		.append('g')
		.attr('transform', function(d, i) {
		    return 'translate(0,' + (rh + p) * (9-i) + ')';
		});
	
	var rect = grp.selectAll('rect')
		.data(function(d) { return d; })
		.attr('fill', function(d) { 
			if (d[x]===0) {
				console.log("empty");
				return "transparent";
			}
			return bep[x].colorMap(d[x]);
		});
						
	rect.enter()
		.append('rect')
			.attr('x', function(d, i) { 
				return (rw + p) * i; 
			})
			.attr('width', rw)
			.attr('height', rh)
			.attr('fill', function(d) {
				if (d[x]===0) {
					return "transparent";
				}
				return bep[x].colorMap(d[x]);
			})
//			.on("mouseover", rectOver)
			.on("mousedown", rectDown)
			.on("mouseup", rectUp)
			.on("mouseout", rectOut)
			.on("mousemove", rectMove);
}



var mouseDown = false;

var rectOver= function(d,x,y) {
	// update D, F
	console.log("over", x,y);
}

var rectDown= function(d,x,y) {
	mouseDown = true;
	updateIndicators(x,y);
}
var generalMouseUp= function() {
	mouseDown = false;
}

var rectUp= function() {
//	console.log(values);
	updateImages();
}

var rectOut= function(d,x,y) {
//	console.log("out", d,x,y);
}

var rectMove= function(d,x,y) {
	if (mouseDown) {
		updateIndicators(x,y);
		updateImages();
	}
}

var updateImages = function() {
	
	// close, reset details
	$(".details").hide(200);
	selected = [false, false, false, false, false];
	$(".line").css('background-color', '#fff');
	
	
	details = [];
	var baseurl = "results/s" + values.s + "_r" + values.r + "/d" + values.d + "_f"+ values.f;
	
	d3.selectAll("img.tumor")
		.data([0,1,2,3,4])
		.attr('src', function(d) {
			return baseurl + "_" + d + ".tumor.png";
		});
		
	d3.selectAll("img.mutprof")
		.data([0,1,2,3,4])
		.attr('src', function(d) {
			$.get(baseurl + "_" + d + ".html", function(data) {
				// QnD way of getting the data out of HTML
				var a = data.split("</td><td>");
				var v = {};
				v.ε = parseFloat(a[1]);
				v.μ = parseFloat(a[2]);
				v.ρ = parseFloat(a[3]);
				v.λ = parseFloat(a[4]);
				v.τ = parseFloat(a[5]);
				v.θ = parseFloat(a[6]);
				details[d] = v;
			});
			
			return baseurl + "_" + d + ".mutprof.png";
		});


}



var updateIndicators = function(x,y) {
	values.f = map.f.i(x);
	values.d = map.d.i(y);
	$("#f > a").html(values.f);
	$("#d > a").html(values.d);
	var f = (settings.boxWidth+settings.boxSpacing)*(x);
	var d = (settings.boxHeight+settings.boxSpacing)*(9-y);
	d3.selectAll(".f-indicator").attr('x', f);
	d3.selectAll(".d-indicator").attr('y', d);
}




var updateLimits = function(matrix) {
	var linear = [];
	matrix.map(function(d) { 
		d.map(function(f) { 
			linear.push(f);
		})
	});
	for (var key in bep) {
		if (bep.hasOwnProperty(key)) {
			var min = d3.min(linear, function(d) {return d[key]});
			var max = d3.max(linear, function(d) {return d[key]});
			bep[key].range = [min, max]; 
			bep[key].colorMap.domain([min, max]);
		}
	}
}

// get Limits. interate over data, get [min, max] of all types
var getLimits = function(matrix) {
	var linear = [];
	data.map(function(d) { 
		d.map(function(f) { 
			f.map(function(g) {
				g.map(function(h) { 
					linear.push(h);
				}) 
			})
		})
	});
	for (var key in bep) {
		if (bep.hasOwnProperty(key)) {
			var min = d3.min(linear, function(d) {return d[key]});
			var max = d3.max(linear, function(d) {return d[key]});
			bep[key].range = [min, max]; 
			bep[key].colorMap.domain([min, max]);
		}
	}	
}


// Tumor, Mutprof Interaction
$(document).ready(function() {
	
	$(".results a").mouseover(function(e) {
		$(this).next().css('background-color', '#ccc');
	});
	
	$(".results a").mouseout(function(e) {
		if ($(this).data('selected')) {
			$(this).next().css('background-color', '#999');
		} else {
			$(this).next().css('background-color', '#fff');
		}
	});
	
	$(".results a").click(function(e) {
		e.preventDefault();
		var id = $(this).data('id'); 
		if ($(this).data('selected')) {
			$(this).data('selected', false);
			selected[id] = false;			// deselect
			$(this).next().css('background-color', '#fff');
		} else {
			
			$(this).data('selected', true);
			selected[id] = true;
			$(this).next().css('background-color', '#999');
			$(".details").slideDown(200);
			
			$('html, body').animate({
				scrollTop: $(".results").offset().top
			}, 200);
		}
		
		
		// reduce
		var sum = selected.reduce(function(a, b) {
		  return a + b;
		});
		
		var col;
		if (sum===0) {
			$(".details").slideUp(200);
			return;
		} else if(sum===5) {
			col = 2;
		} else {
			col = 12/sum;
		}
		
		// reduce data form 'details'
		
		var selectedDetails = [];
		selected.forEach(function(d,i) {
			if (d) selectedDetails.push( details[i] );
		});
		
		console.log(selectedDetails, col);
	
		addColumns(selectedDetails, col);
	});
	
	
	
})


var addColumns = function(s, w) {
	
	var txt = [
		{'id':'epsilon', 'short':'ε', 'desc':'population entropy'},
		{'id':'mu', 'short':'μ', 'desc':'founder mutation count'},
		{'id':'rho', 'short':'ρ', 'desc':'average mutation count'},
		{'id':'lambda', 'short':'λ', 'desc':'population fitness'},
		{'id':'tau', 'short':'τ', 'desc':'growth time'},
		{'id':'theta', 'short':'θ', 'desc':'self similality'},
	];
	
	// values
	var h = $("<div>");		"empty"
	s.forEach(function(v) {
		var column = $('<div class="col-xs-'+w+'"></div>');
		txt.forEach(function(d) {
			column.append('<div id="'+d.id+'"><span>'+d.short+'</span> <span class="value">'+v[d.short]+'</span></div>')
		});
		h.append(column);
	});
	$(".row.values").html( h.html() );	// get html content


	var baseurl = "results/s" + values.s + "_r" + values.r + "/d" + values.d + "_f"+ values.f;
	
	selectedData = []
	selected.forEach(function(d, i){
		if (d) selectedData.push(i);
	});
	
		
	// mutprof
	var h = $("<div>");		"empty"
	s.forEach(function(v,i) {
		var url = baseurl + "_" + selectedData[i] + ".mutprof.png";
		h.append( $('<div class="col-xs-'+w+'"><img src='+url+'></div>)') );
	});
	$(".row.mutprof").html( h.html() );
	
	// tumor
	var h = $("<div>");		"empty"
	s.forEach(function(v,i) {
		var url = baseurl + "_" + selectedData[i] + ".tumor.png";
		h.append( $('<div class="col-xs-'+w+'"><img src='+url+'></div>)') );
	});
	$(".row.tumor").html( h.html() );
	
	// pc
	var h = $("<div>");		"empty"
	s.forEach(function(v,i) {
		var url = baseurl + "_" + selectedData[i] + ".pc.png";
		h.append( $('<div class="col-xs-'+w+'"><img src='+url+'></div>)') );
	});
	$(".row.pc").html( h.html() );
	
	// selfsim
	var h = $("<div>");		"empty"
	s.forEach(function(v,i) {
		var url = baseurl + "_" + selectedData[i] + ".selfsim.png";
		h.append( $('<div class="col-xs-'+w+'"><img src='+url+'></div>)') );
	});
	$(".row.selfsim").html( h.html() );
	
	// cellsim
	var h = $("<div>");		"empty"
	s.forEach(function(v,i) {
		var url = baseurl + "_" + selectedData[i] + ".cellsim.png";
		h.append( $('<div class="col-xs-'+w+'"><img src='+url+'></div>)') );
	});
	$(".row.cellsim").html( h.html() );
	
	// alfrq
	var h = $("<div>");		"empty"
	s.forEach(function(v,i) {
		var url = baseurl + "_" + selectedData[i] + ".alfrq.png";
		h.append( $('<div class="col-xs-'+w+'"><img src='+url+'></div>)') );
	});
	$(".row.alfrq").html( h.html() );
	
	
	//
}




