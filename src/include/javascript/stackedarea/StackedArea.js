class StackedArea{
  constructor(dimensions, container){

      var margin = {
          focus: {
              top: 50, right: 0, bottom: 110, left: 40
          },
          context: {
              top: 230, right: 20, bottom: 30, left: 40
          }
      };

      var width = dimensions.width - margin.focus.left - margin.focus.right;
      var heightFocus = dimensions.height - margin.focus.top - margin.focus.bottom;
      var heightContext = dimensions.height - margin.context.top - margin.context.bottom;

      this.xFScale = d3.scaleTime( ).range([0, width]);
      this.xCScale = d3.scaleTime( ).range([0, width]);
      this.yFScale = d3.scaleLinear( ).range([heightFocus, 0]);
      this.yCScale = d3.scaleLinear( ).range([heightContext, 0]);
      this.cScale = d3.scaleOrdinal( ).range(["#225ea8", "#e31a1c"]);

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
                    .attr("transform", "translate(" + (margin.focus.left - 1) + "," +
                                                       margin.focus.top + ")");

      this.container.append("g")
                    .attr("id", "xFocus")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(" + (margin.focus.left - 1) + "," +
                                                      (heightFocus + margin.focus.top) + ")");

      this.container.append("g")
                    .attr("id", "xContext")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(" + (margin.context.left - 1) + "," +
                                                      (heightContext + margin.context.top) + ")");

      this.focus = this.container.append("g")
                                 .attr("class", "focus")
                                 .attr("transform", "translate(" + margin.focus.left + "," +
                                                                   margin.focus.top + ")");

      this.context = this.container.append("g")
                                   .attr("class", "context")
                                   .attr("transform", "translate(" + margin.context.left + "," +
                                                                     margin.context.top + ")");

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

      this.width = width;

  }

  show(data, keys){
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
                .attr("class", "layer")
                .append("path");

      layerContext.enter( )
                  .append("g")
                  .merge(layerContext)
                  .attr("class", "layer")
                  .append("path");

      var fSelection = this.focus.selectAll("path");
      var cSelection = this.context.selectAll("path");

      if(fSelection.empty( )) {
          this.focus.selectAll("path")
                    .attr("class", "area")
                    .attr("fill", (d) => { return this.cScale(d.key); })
                    .attr("d", this.areaFocus);
      }
      else {
          this.focus.selectAll(".layer")
                    .select("path")
                    .attr("class", "area")
                    .attr("fill", (d) => { return this.cScale(d.key); })
                    .attr("d", this.areaFocus);
      }

      if(cSelection.empty( )) {
          this.context.selectAll("path")
                      .attr("class", "area")
                      .attr("fill", (d) => { return this.cScale(d.key); })
                      .attr("d", this.areaContext);
      }
      else {
          this.context.selectAll(".layer")
                      .select("path")
                      .attr("class", "area")
                      .attr("fill", (d) => { return this.cScale(d.key); })
                      .attr("d", this.areaContext);
      }

      this.xAxisFocus = d3.axisBottom(this.xFScale).ticks(d3.timeYear.every(5));
      this.yAxisFocus = d3.axisLeft(this.yFScale);

      this.xAxisContext = d3.axisBottom(this.xCScale).ticks(d3.timeYear.every(5));

      this.container.select("#xFocus").call(this.xAxisFocus);
      this.container.select("#yFocus").call(this.yAxisFocus);
      this.container.select("#xContext").call(this.xAxisContext);
      this.container.select(".zoom").call(this.zoom);

      var selected = this.context.select(".brush");

      if (selected.empty( )) {
          this.context.append("g").attr("class", "brush");
      }

      this.context.select(".brush").call(this.brush)
                  .call(this.brush.move, this.xFScale.range( ));

      var text = this.container.select("#legend");

      if (text.empty( )) {
          this.container.append("text")
                        .attr("text-anchor", "middle")
                        .attr("id", "legend")
                        .attr("x", (this.width + 60) / 2)
                        .attr("y", 40)
                        .attr("font-family", "sans-serif")
                        .text("Accumulative Deaths");
      }

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

  _max(data){
      return d3.max(data, (d) => { return d3.max(d); })
  }
}
