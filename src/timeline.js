class Timeline {
	constructor(space, range) {
		var svg = null;

		this.g;
		// spaceObj = {pos: {x: 0, y: 0}, size: {width: 0, height: 0}, padding: {top: 0, bottom: 0, left: 0, right: 0} }
		this.space = space;
		// rangeObj = {begin: 1970, end: 2015}
		this.range = range;
		/*
		a = document.createElement("div")
		d3.select(a).append("svg")
		*/
		this.position = function(pos) {
			if (svg !== null) {
				svg.attr("transform", "translate(" + pos.x + "," + pos.y + ")");
			}
		}

		this.add = function(container) {
			//var svg = d3.select(this.svg);
			svg = container.append("svg");

			svg.attr("width", this.space.size.width)
			   .attr("height", this.space.size.height);
			
			this.position(this.space.pos);

			this.g = svg.append("g");

			this.g.append("rect")
				  .attr("width", +svg.attr("width"))
				  .attr("height", +svg.attr("height"))
				  .attr("x", 0)
				  .attr("y", 0)
				  .style("fill", "#DDDDDD");
		}

	}
}