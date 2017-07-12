class Main{
    constructor(dimensions, selected_gtd){
        this.b_dimension = dimensions.buttons;
        this.s_dimension = dimensions.stacked;
        this.m_dimension = dimensions.map;
        this.k_dimension = dimensions.sankey;

        this.selected_gtd = selected_gtd;
        this.data = null;
    }

    show( ){
        var p1 = this._loadData( );

        this._buttons( );
        this._stacked( );
        this._map( );

        p1.then((data) => {
            this.data = data;
            this._sankey( );
        });
    }

    _buttons( ){
        var handler = {
            set: (t, p, v) => {
                t[p] = v;

                this.selected = t;
                this.__select( );

                return true;
            }
        };

        var stack = new Proxy([ ], handler);
        var chosen = 2;

        this.b_dimension.p = this.__ratio( );

        var buttons = new Buttons(this.b_dimension, "../flags/", stack, chosen);
        buttons.show( );
    }

    _stacked( ){
        var stacked_div = d3.select("#stacked")
                            .style("top", this.s_dimension.y + "px")
                            .style("left", this.s_dimension.x + "px")
                            .style("width", this.s_dimension.width + "px")
                            .style("height", this.s_dimension.height + "px")
                            .style("position", "relative");

        var svg = stacked_div.append("svg")
                             .attr("width", this.s_dimension.width)
                             .attr("height", this.s_dimension.height)
                             .style("align-items", "left");

        var dimension = {width: this.s_dimension.width, height: this.s_dimension.height};

        this.stacked = new StackedArea(dimension, svg);

    }

    _map( ){
        this.map = new Map(this.m_dimension, 2);
        console.log(capitals["null"])
        this.map.show(capitals["null"], 2, true);

    }

    _sankey( ) {
        var sankey_div = d3.select("#sankey")
                            .style("top", this.k_dimension.y + "px")
                            .style("left", this.k_dimension.x + "px")
                            .style("width", this.k_dimension.width + "px")
                            .style("height", this.k_dimension.height + "px")
                            .style("position", "absolute");

        this.sankey = new SankeyDiagram(this.k_dimension.def, sankey_div);
        this.sankey.buildLinks(this.data);
        this.sankey.buildNodes();
    }

    _loadData() {
        return (new Promise((resolve, reject) => {
            d3.csv(this.selected_gtd, (data) => {
                resolve(data);
            });
        }));        
    }

    __select(selected){
        var stacked = this.__convert_stacked(this.data);
        var heatmap = this.__convert_heatmap(this.data);

        this.stacked.show(stacked, this.selected);

        this.map.show(this.__capital( ), 6, false);
        this.map.heatmap(heatmap);

        console.log(gnames.indexOf(this.selected), this.selected)
        
        this.sankey.show([1,2]);
    }

    __convert_stacked(data){
        var before = new Array(this.selected.length).fill(0);
        var unique = [ ];

        data = data.filter((d) => {
            return this.selected.indexOf(d.gname) > -1 && +d.nkill >= 0;

        });

        for(var i = 0; i < data.length; i++){
            var sum = +data[i].nkill;
            var current_date = new Date(+data[i].iyear, +data[i].imonth - 1, +data[i].iday);

            for(var x = i + 1; x < data.length; x++){
                var post_date = new Date(+data[x].iyear, +data[x].imonth - 1, +data[x].iday);

                if(current_date.getTime( ) == post_date.getTime( )){
                    sum = sum + (+data[x].nkill);

                }
                else{
                    unique.push({gname: data[x].gname, date: current_date, nkill: sum});
                    i = x;
                    break;

                }

            }
        }

        unique = unique.map((d) => {
            var g = { }
            g.date = d.date;

            this.selected.forEach((s, i) => {

                if(d.gname == s)
                    g[s] = d.nkill + before[i];
                else
                    g[s] = before[i];

                before[i] = g[s];
            });

            return g;
        });

        return unique;

    }

    __convert_heatmap(data){
        var heatmaps = [ ];
        var scales = [ ];

        this.selected.forEach((s) => {
            var deaths = [ ];

            data.forEach((d) => {
                if(d.gname == s)
                    deaths.push(+d.nkill);

            });

            var dScale = d3.scaleLinear( ).range([0., 1.]);
            var extent = d3.extent(deaths);

            dScale.domain(extent);

            scales.push(dScale);

        });

        this.selected.forEach((s, i) => {
            var heatmap = [ ];

            data.forEach((d) => {
                if(+d.latitude != 0 && (+d.longitude) != 0 && d.gname == s)
                    heatmap.push([+d.latitude, +d.longitude, scales[i](+d.nkill)]);

            });

            heatmaps.push(heatmap);
        });

        return heatmaps;
    }

    __capital( ){
        var group = null;

        if(this.selected.length > 0)
            group = this.selected[0];

        return capitals[group];

    }

    __ratio( ){
        return ((window.outerWidth - (2 * this.b_dimension.x)) - 10 * (2 * this.b_dimension.r)) / 9;
    }
}
