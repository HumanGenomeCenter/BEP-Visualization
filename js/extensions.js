// MATH convenience functions from Processing

Math.sq=function(a){return a*a;};
Math.constrain=function(a,l,h){return(a<l)?l:((a>h)?h:a);};
Math.degrees=function(r){return r*(180/Math.PI);};
Math.radians=function(d){return d*(Math.PI/180);};
Math.mag=function(a,b){return Math.sqrt(a*a+b*b);};
Math.dist=function(x1,y1,x2,y2){return Math.sqrt(Math.sq(x2-x1)+Math.sq(y2-y1));};
Math.lerp=function(a,z,amt){return a+(z-a)*amt;};
Math.norm=function(v,a,z){return (v-a)/(z-a);};
Math.map=function(v,ia,iz,oa,oz){return oa+(oz-oa)*((v-ia)/(iz-ia));};





// Array Prototypes
Array.prototype.has = function(value) {
	if (this.indexOf(value) >= 0) {
		return true;
	}
	return false;
};

Array.prototype.between = function(value) {
	if (this[0] < value && value < this[1]) {
		return true;
	}
	return false;
};

Array.prototype.sortNumeric = function() {
	this.sort( function(x, y) {
		return x - y;
	});
	return this;
};

Array.prototype.sortAlphaNumeric = function() {
	// sort mixed: chr1, chr2, ..., chr10
	// adapted from: http://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
	
	var reA = /[^a-zA-Z]/g;
	var reN = /[^0-9]/g;
	
	this.sort( function(a, b) {
		var aA = a.replace(reA, "");
	    var bA = b.replace(reA, "");
	    if(aA === bA) {
	        var aN = parseInt(a.replace(reN, ""), 10);
	        var bN = parseInt(b.replace(reN, ""), 10);
	        return aN === bN ? 0 : aN > bN ? 1 : -1;
	    } else {
	        return aA > bA ? 1 : -1;
	    }
	});
	return this;
};

// use d3.min, d3.max, d3.sum instead... can also handle arrays with missing values f.e.[1,2,NaN,,,,4]
// http://ejohn.org/blog/fast-javascript-maxmin/
/*
Array.prototype.min = function() {
	return Math.min.apply( Math, this );
}

Array.prototype.max = function() {
	return Math.max.apply( Math, this );
}

Array.prototype.sum = function(obj) {
	
	var from = 0;
	var to = this.length;
	
	if (obj !== undefined) {
		if (obj.from !== undefined ) from = Math.floor(obj.from);
		if (obj.to !== undefined) {
			to = Math.floor(obj.to);
			if (to < 0) to = this.length + to;		// minus counts back from this.length
		}
	}
	
	var sum = 0;
	for (var i=from; i<to; i++) {
		sum += this[i];
	}
		
	return sum;
	
	
	// for (var i=0, sum=0; sum = this[i]; i++) {};

	// for (var i=0, sum=0; this[i]; sum+=this[i++]);
	// return sum;
	
}

*/




Array.prototype.trueLength = function() {
	// Calculation the 'true' length of an array, without taking into account undefined values
	var sum=0;
	for (var i=0; i<this.length; i++) {
		if (this[i] !== undefined) {
			sum++;
		}
	}
	return sum;
};

/*
Array.prototype.copy = function() {
	return this.slice(0);
};
*/

Array.prototype.copy = function() {
	// return this.slice(0);	// only creates a shallow copy, works only with number arrays, and not arrays containing other objects or arrays
	// requires $ as jQuery
	var a = [];					// new empty array
	$.extend(true, a, this);	// deep copy this onto a
	return a;					// return a
};

		
	

Array.prototype.swap = function(a, b) {
    this[a]= this.splice(b, 1, this[a])[0];		// splice returns an array, we need to get the first element of that
    return this;
};

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
};

Array.prototype.indexOfDiv = function(element) {
	var	i = this.length;
	while (i--) {
		if (this[i][0] === element[0]) {			// only compares the 1st elements of the jQuery selections!!!			
			return i;
		}
	}
	return -1;		// default	
};




Array.prototype.unique = function() {
	var o = {}, i, l = this.length, r = [];
	for(i=0; i<l;i+=1) o[this[i]] = this[i];
	for(i in o) r.push(o[i]);
	return r;
};

/*
Array.prototype.intersect = function(arr2) {
	var i = 0, length = this.length, newArr = [];
	
	for (i=0; i<length; i++) {
		if (arr2.has(this[i])) {
			newArr.push(this[i]);
		}
	}
	return newArr;
};
*/

Array.prototype.intersect = function(a) {
	return this.filter(function(i) {
		return (a.indexOf(i) > -1);
	});
	

};

// Difference between arrays, a.diff(b) and b.diff(a) produce same result
Array.prototype.diff = function(a) {
	var arr = this;
	var arr2 = a;
	if (a.length > this.length) { 
		arr = a;
		arr2 = this;
	}
    return arr.filter(function(i) {
		return !(arr2.indexOf(i) > -1);
	});
};



// Numbers Prototypes
Number.prototype.between = function(v1, v2) {
	var v = this.valueOf();
	if (v > v1 && v < v2) {
		return true;
	}
	return false;
};

Number.prototype.betweenInclusive = function(v1, v2) {
	var v = this.valueOf();
	if (v >= v1 && v <= v2) {
		return true;
	}
	return false;
};


Number.prototype.truncate = function(digits) {
	var str = this.valueOf().toString(10);
//	console.log(str.length,str.indexOf('.') );
	if (str.indexOf('.')>=0) {
		var before = str.substring(0, str.indexOf('.'));		// before comma
		var after = str.substring(str.indexOf('.')+1, str.indexOf('.')+1+digits);		// after comma
//		console.log("jhjk", before, after);
		return parseFloat(before + '.' + after);
		
	} 
	return this.valueOf();
};


Number.prototype.isInt = function() {
	return this.valueOf() % 1 === 0;
};

Number.prototype.isPositiveInt = function() {
	if (this.valueOf() <= 0) return false;
	return this.valueOf() % 1 === 0;
};



String.prototype.count = function(substring) {
	
	/*
	// shorter but slower
	var count = this.match(/is/g); 
	return count.length;
	*/
	
	if (substring) {
		var n=0, pos=0;

		while(true){
		    pos = this.indexOf(substring, pos);
		    if (pos!=-1) { 
				n++; 
				pos += substring.length;
			} else{
				break;
			}
		}
		return(n);		
	} 
	return this.length;		// else return length of string
};
/*
Number.prototype.limit = function(lower, upper) {
	if (this <= lower) {
		return lower;
	} else if (this >= upper ) {
		return upper;
	}
	return this;
}
*/


// jQuery Utility Function
// call with $.isEmpty("str");
jQuery.isEmpty = function(value) {
	var emptyValues = ["", "---"];
	return emptyValues.has(value.toString());
};

/*
// Timer Function
(function() {
	self.timer = timer;
	timer.version = "1.0.0";
	timer.names = {};
	
	function timer(name) {
		return {
			start: function() {
				timer.names[name] = {};
				timer.names[name].start = new Date().getTime();
				console.log("Timer '" + name + "' started.");
			},
			stop: function() {
				if (timer.names[name] && timer.names[name].start) {
					var diff = new Date().getTime() - timer.names[name].start;
					console.log("Timer '" + name + "' took " + diff/1000 + " sec.");
					delete timer.names[name];		// remove timer object
				}	
				
			},
			test: function() {
				console.log(timer.names);
			}
		}
	}
	
})();

*/
// queue.js from https://github.com/mbostock/queue
(function(){function n(n){function t(){for(;f=a<c.length&&n>p;){var u=a++,t=c[u],r=l.call(t,1);r.push(e(u)),++p,t[0].apply(null,r)}}function e(n){return function(u,l){--p,null==d&&(null!=u?(d=u,a=s=0/0,r()):(c[n]=l,--s?f||t():r()))}}function r(){null!=d?v(d):i?v(d,c):v.apply(null,[d].concat(c))}var o,f,i,c=[],a=0,p=0,s=0,d=null,v=u;return n||(n=1/0),o={defer:function(){return d||(c.push(arguments),++s,t()),o},await:function(n){return v=n,i=!1,s||r(),o},awaitAll:function(n){return v=n,i=!0,s||r(),o}}}function u(){}"undefined"==typeof module?self.queue=n:module.exports=n,n.version="1.0.4";var l=[].slice})();


