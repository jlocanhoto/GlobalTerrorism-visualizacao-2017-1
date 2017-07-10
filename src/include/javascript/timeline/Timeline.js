class Timeline {
	constructor(space, range) {
		// PUBLIC VARIABLES
		this.g;
		// spaceObj = {pos: {x: 0, y: 0}, size: {width: 0, height: 0}, margin: {top: 0, bottom: 0, left: 0, right: 0} }
		this.space = space;
		// rangeObj = {min: 1970, max: 2015}
		this.range = range;

		// PRIVATE VARIABLES
		var svg = null;

		// PRIVATE FUNCTIONS
		function getOrdinalArray(range) {
			var list = [];

			for (let i = range.min; i <= range.max; i++) {
				list.push(i);
			}

			return list;
		}

		function getDiscreteRange(range, length) {
			var list = [];
			const step = (range.max - range.min)/length;

			for (let i = 0; i < length; i++) {
				list.push(i*step);
			}

			return list;
		}

		function addScaleCircles(g, ticks, miniTicks, xScale, margin) {
			var radius = 12;

			var ticksData = g.selectAll("circle")
							 .data(ticks.concat(miniTicks));

			ticksData.exit().remove();

			var ticksCircles = ticksData.enter()
										.append("circle")
										.merge(ticksData)
										.attr("class", (d) => {
											if (ticks.indexOf(d) !== -1)
												return "timeNodes";
											else
												return "miniTimeNodes";
										})
										.attr("cx"   , (d) => xScale(d)+margin.left)
										.attr("cy"   , ( ) => ((+svg.attr("height")) - margin.bottom))
										.attr("r"    , (d) => {
											if (ticks.indexOf(d) !== -1)
												return radius;
											else
												return radius*0.3;
										});
		}

		function addAxis(g, xScale, margin) {
			const step = (range.max - range.min)/9;

			var xAxisGroup = g.append("g")
							  .attr("class", "xAxis")
							  .attr("transform", "translate(" + margin.left + ", " + ((+svg.attr("height")) - margin.bottom) + ")");

			let domain = xScale.domain();
			let ticksMin = domain[0];
			let ticksMax = domain[domain.length-1];
			var ticks = [];
			var miniTicks = [];

			for (let i = ticksMin; i <= ticksMax; i += step)
			{
				ticks.push(Math.round(i));
				
				for (let j = i + 1; (j < i+step) && (j < ticksMax); j++)
				{
					miniTicks.push(Math.round(j));
				}				
			}

			//var ticks = xScale.domain().filter((d, i) => (!(i%Math.round(step)) || (d === 2015) ));
			var xAxis = d3.axisBottom(xScale)
						  .tickValues(ticks)
						  .tickSizeInner(25);

			xAxisGroup.call(xAxis);

			var gTicks = g.append("g")
						  .attr("id", "ticksGroup");

			addScaleCircles(gTicks, ticks, miniTicks, xScale, margin);
		}

		// PUBLIC FUNCTIONS
		this.position = function(pos) {
			if (svg !== null) {
				svg.attr("transform", "translate(" + pos.x + "," + pos.y + ")");
			}
		}

		this.add = function(container) {
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
				  .style("fill", "#FFFFFF");

			var xScale_domain = getOrdinalArray(this.range);
			
			var range = {min: 0, max: (+svg.attr("width")) - this.space.margin.right};
			var xScale_range = getDiscreteRange(range, xScale_domain.length);
			
			var xScale = d3.scaleOrdinal()
						   .domain(xScale_domain)
						   .range(xScale_range);

			addAxis(this.g, xScale, this.space.margin);
		}
	}
}