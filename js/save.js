/* - - - - - - - - - Save Frames - - - - - - - - - */

window.URL = (window.URL || window.webkitURL);

var animation = {};
animation.counter = 0;

animation.saveFrame = function(svgID) {
	if svgID === undefined svgID = "#forceCells";		// default to svg#forceCells
	
	// add backslashes to prevent PHP parsing
	var doctype = '<\?xml version="1.0" standalone="no"\?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
	
	var documents = [window.document];

	SVGSources = []; // public for testing

    documents.forEach(function(doc) {
      styles = getStyles(doc);			// public for testing
      newSources = getSources(doc, styles, svgID);	 // public for testing
      // because of prototype on NYT pages
      for (var i = 0; i < newSources.length; i++) {
        SVGSources.push(newSources[i]);
      };
    })

/*
    if (SVGSources.length > 1) {
      createPopover(SVGSources);
    } else if (SVGSources.length > 0) {
      download(SVGSources[0]);
    } else {
      alert("The Crowbar couldn’t find any SVG nodes.");
    }
*/

	if (SVGSources.length === 1) {
		download(SVGSources[0]);
	} else {
		alert("Couldn’t find any SVG nodes.");
	}
	
	
	function getSources(doc, styles, svgID) {
    var svgInfo = [],
        svgs = d3.select(doc).selectAll("svg" + svgID);  // limit selecti to on svg via ID

    styles = (styles === undefined) ? "" : styles;

    svgs.each(function () {
      var svg = d3.select(this);
      svg.attr("version", "1.1")
        .insert("defs", ":first-child")
          .attr("class", "svg-crowbar")
        .append("style")
          .attr("type", "text/css");

      // removing attributes so they aren't doubled up
      svg.node().removeAttribute("xmlns");
      svg.node().removeAttribute("xlink");

      // These are needed for the svg
      if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns")) {
        svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns", d3.ns.prefix.svg);
      }

      if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink")) {
        svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink", d3.ns.prefix.xlink);
      }

      var source = (new XMLSerializer()).serializeToString(svg.node()).replace('</style>', '<![CDATA[' + styles + ']]></style>');
      var rect = svg.node().getBoundingClientRect();
      svgInfo.push({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        class: svg.attr("class"),
        id: svg.attr("id"),
        childElementCount: svg.node().childElementCount,
        source: [doctype + source]
      });
    });
    return svgInfo;
  }

	
	
	function getStyles(doc) {
	    var styles = "",
	        styleSheets = doc.styleSheets;

	    if (styleSheets) {
	      for (var i = 0; i < styleSheets.length; i++) {
	        processStyleSheet(styleSheets[i]);
	      }
	    }
	    function processStyleSheet(ss) {
	      if (ss.cssRules) {
	        for (var i = 0; i < ss.cssRules.length; i++) {
	          var rule = ss.cssRules[i];
	          if (rule.type === 3) {
	            // Import Rule
	            processStyleSheet(rule.styleSheet);
	          } else {
	            // hack for illustrator crashing on descendent selectors
	            if (rule.selectorText) {
	              if (rule.selectorText.indexOf(">") === -1) {
	                styles += "\n" + rule.cssText;
	              }
	            }
	          }
	        }
	      }
	    }
	    return styles;
	  }
	
	  function download(source) {
		test = source;
		console.log("download", source);
	    var filename = "untitled";

		console.log("filename", filename);
		
	    if (source.id) {
	      filename = source.id;
	    } else if (source.class) {
	      filename = source.class;
	    } else if (window.document.title) {
	      filename = window.document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
	    }

		filename = filename + "_"+ animation.counter;		// add counter to filename
		
		console.log("filename", filename);
		

	    var url = window.URL.createObjectURL(new Blob(source.source, { "type" : "text\/xml" }));

		// append blob as <a> 
	
	    var a = d3.select("body")
	        .append('a')
	  //     .attr("class", "svg-crowbar")
			.attr("id", filename)
	        .attr("download", filename + ".svg.txt")	// prevent Chrome form showing annoying Keep/Discard dialogue
	        .attr("href", url)
	        .style("display", "none");

		
	    a.node().click();								// click to download

		console.log(filename);
		// remove blob from document
		setTimeout(function() {
			window.URL.revokeObjectURL(url);			// releases blob from memory
			d3.selectAll("#"+filename).remove();		// remove <a> from DOM
	    }, 10);											// 10ms is enough?
	
	
		animation.counter++;							// update counter
		
	  }
	
	
}
