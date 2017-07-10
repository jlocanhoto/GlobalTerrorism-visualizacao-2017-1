class Buttons {
    constructor(dimensions, path, stack, chosen){
        this.path = path;
        this.stack = stack;
        this.chosen = chosen;

        this.x = dimensions.x;
        this.y = dimensions.y;
        this.p = dimensions.p;
        this.r = dimensions.r;
    }

    show( ){
        var that = this;

        d3.selectAll("button")
          .data(gnames)
          .enter( )
          .append("button")
          .attr("class", "buttons tooltip-bottom")
          .attr("data-tooltip", (d) => { return d; })
          .attr("style", (d, i) => { return "background-image: url('" + this.path + i + ".png')"; })
          .style("left", (d, i) => { return ((this.r + (this.p / 2)) * 2 * i) + this.x + "px"; })
          .style("top", this.y + "px")
          .style("width", (this.r * 2) + "px")
          .style("height", (this.r * 2) + "px")
          .on("click", function(d){ that._stacked(d, this); });

    }

    _stacked(d, widget){
        var opacity = 1.0;
        var index = this.stack.indexOf(d);

        if(index > -1){
            this.stack.splice(index, 1);
        }
        else if(index == -1 && this.stack.length < this.chosen){
            this.stack.push(d);
            opacity = 0.7;
        }

        d3.select(widget).style("opacity", opacity);

    }
}
