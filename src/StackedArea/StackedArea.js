class StackedArea{
  constructor(dimensions, container){

      var margin = {
          focus: {
              top: 20, right: 20, bottom: 110, left: 40
          },
          context: {
              top: 430, right: 20, bottom: 30, left: 40
          }
      };

      var width = dimensions.width - margin.focus.left - margin.focus.right;
      var heightFocus = dimensions.height - margin.focus.top - margin.focus.bottom;
      var heightContext = dimensions.height - margin.context.top - margin.context.bottom;

      this.xFScale = d3.scaleTime( ).range([0, width]);
      this.xCScale = d3.scaleTime( ).range([0, width]);
      this.yFScale = d3.scaleLinear( ).range([heightFocus, 0]);
      this.yCScale = d3.scaleLinear( ).range([heightContext, 0]);
      this.cScale = d3.scaleOrdinal( ).range(d3.schemeCategory10);

      this.stack = d3.stack( );

      this.areaFocus = d3.area( )
                    .curve(d3.curveCardinal)
                    .x((d) => {  return this.xFScale(d.data.date); })
                    .y0((d) => { return this.yFScale(d[0]); })
                    .y1((d) => { return this.yFScale(d[1]); });

      this.areaContext = d3.area( )
                    .curve(d3.curveCardinal)
                    .x((d) => {  return this.xCScale(d.data.date); })
                    .y0((d) => { return this.yCScale(d[0]); })
                    .y1((d) => { return this.yCScale(d[1]); });

      this.container = container.append("g");

      this.container.append("g")
                    .attr("id", "yFocus")
                    .attr("class", "yAxis")
                    .attr("transform", "translate(" + (margin.focus.left + dimensions.x - 1) + "," +
                                                      (margin.focus.top + dimensions.y) + ")");

      this.container.append("g")
                    .attr("id", "xFocus")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(" + (margin.focus.left + dimensions.x - 1)+ "," +
                                                      (heightFocus + margin.focus.top + dimensions.y) + ")");

      this.container.append("g")
                    .attr("id", "xContext")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(" + (margin.context.left + dimensions.x - 1)+ "," +
                                                      (heightContext + margin.context.top + dimensions.y) + ")");

      this.focus = this.container.append("g")
                                 .attr("class", "focus")
                                 .attr("transform", "translate(" + (margin.focus.left + dimensions.x) + "," +
                                                                   (margin.focus.top + dimensions.y) + ")");

      this.context = this.container.append("g")
                                   .attr("class", "context")
                                   .attr("transform", "translate(" + (margin.context.left + dimensions.x) + "," +
                                                                     (margin.context.top + dimensions.y) + ")");

      this.focus.append("rect")
                .attr("class", "zoom")
                .attr("width", width)
                .attr("height", heightFocus);

      this.focus.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", heightFocus);

      this.brush = d3.brushX( ).extent([[0, 0], [width, heightContext]])
                     .on("brush end", ( ) => { this._brushed( ); });

      this.zoom = d3.zoom( ).scaleExtent([1, Infinity])
                    .translateExtent([[0, 0], [width, heightFocus]])
                    .extent([[0, 0], [width, heightFocus]])
                    .on("zoom", ( ) => { this._zoomed( ); });

      this.timeParser = d3.timeParse("%m/%d/%y");

      this.width = width;

  }

  show(data){
      var keys = data.columns.slice(1);
      var data = this._fix(data);

      this.stack.keys(keys);

      var layerFocus = this.focus.selectAll(".layer")
                           .data(this.stack(data));

      var layerContext = this.context.selectAll(".layer")
                             .data(this.stack(data));

      this.xFScale.domain(d3.extent(data, (d) => { return d.date; }));
      this.yFScale.domain([0, d3.max(this.stack(data), (d) => { return this._max(d); })]);
      this.xCScale.domain(this.xFScale.domain( ));
      this.yCScale.domain(this.yFScale.domain( ));
      this.cScale.domain(keys);

      layerFocus.exit( ).remove( );
      layerContext.exit( ).remove( );

      layerFocus.enter( )
                .append("g")
                .merge(layerFocus)
                .attr("class", "layer");

      layerContext.enter( )
                  .append("g")
                  .merge(layerContext)
                  .attr("class", "layer");

      this.focus.selectAll(".layer")
                .append("path")
                .attr("class", "area")
                .attr("fill", (d) => { return this.cScale(d.key); })
                .attr("d", this.areaFocus);

      this.context.selectAll(".layer")
                  .append("path")
                  .attr("class", "area")
                  .attr("fill", (d) => { return this.cScale(d.key); })
                  .attr("d", this.areaContext);

      this.xAxisFocus = d3.axisBottom(this.xFScale).ticks(d3.timeDay);
      this.yAxisFocus = d3.axisLeft(this.yFScale);

      this.xAxisContext = d3.axisBottom(this.xCScale).ticks(d3.timeDay);

      this.container.select("#xFocus").call(this.xAxisFocus);
      this.container.select("#yFocus").call(this.yAxisFocus);
      this.container.select("#xContext").call(this.xAxisContext);
      this.container.select(".zoom").call(this.zoom);

      var selected = this.context.select(".brush");

      if (selected.empty( ))
          this.context.append("g").attr("class", "brush");

      this.context.select(".brush").call(this.brush)
                  .call(this.brush.move, this.xFScale.range( ));

      return;

  }

  _brushed( ){
      if(d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;

      var s = d3.event.selection || this.xCScale.range( );
      var identity = d3.zoomIdentity.scale(this.width / (s[1] - s[0])).translate(-s[0], 0);

      this.xFScale.domain(s.map(this.xCScale.invert, this.xCScale));
      this.focus.selectAll(".area").attr("d", this.areaFocus);
      this.container.select("#xFocus").call(this.xAxisFocus);
      this.container.select(".zoom").call(this.zoom.transform, identity);

  }

  _zoomed( ){
      if(d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;

      var t = d3.event.transform;

      this.xFScale.domain(t.rescaleX(this.xCScale).domain( ));
      this.focus.selectAll(".area").attr("d", this.areaFocus);
      this.container.select("#xFocus").call(this.xAxisFocus);
      this.context.select(".brush").call(this.brush.move, this.xFScale.range( ).map(t.invertX, t));

  }

  _fix(data){
      var columns = data.columns;

      data.forEach((d) => {
          d.date = this.timeParser(d.date);

          for(var i = 1, n = columns.length; i < n; ++i){
              d[columns[i]] = +d[columns[i]];
          }
      });

      return data;
  }

  _max(data){
      return d3.max(data, (d) => { return d3.max(d); })
  }
}
