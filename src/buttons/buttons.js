class Buttons {
    constructor(path, radius, dimensions){
        this.path = path;
        this.radius = radius;

        this.x = dimensions.x;
        this.y = dimensions.y;
        this.p = dimensions.p;
    }

    show( ){
        d3.selectAll("button")
          .data(gnames)
          .enter( )
          .append("button")
          .attr("class", "buttons tooltip-bottom")
          .attr("data-tooltip", (d) => { return d; })
          .attr("style", (d, i) => { return "background-image: url('" + this.path + i + ".png')"; })
          .style("left", (d, i) => { return ((this.radius + (this.p / 2)) * 2 * i) + this.x + "px"; })
          .style("top", this.y + "px")
          .style("width", (this.radius * 2) + "px")
          .style("height", (this.radius * 2) + "px");

    }
}
