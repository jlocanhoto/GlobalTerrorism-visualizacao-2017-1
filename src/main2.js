class Main{
    constructor( dimensions, selectedGtd ) {
        this.bDimension  = dimensions.buttons;
        this.sDimension  = dimensions.stacked;
        this.mDimension  = dimensions.map;
        this.kDimension  = dimensions.sankey;

        this.selectedGtd = selectedGtd;
        this.data        = null;
    }

    show( ) {
        var p1 = this.__loadData( );

        this._buttons( );
        this._stacked( );
        this._map( );

        p1.then(( data ) => {
            this.data = data;
            this._sankey( );
        });
    }

    _buttons( ) {
        var handler = {
            set: ( t, p, v ) => {
                t[p] = v;

                this.selected = t;
                this.__select( );

                return true;
            }
        };

        var stack = new Proxy( [ ], handler );

        this.bDimension.p = this.__ratio( );

        this.buttons = new Buttons( this.bDimension, "../flags/", stack, 2 );
        this.buttons.show( );
    }

    _stacked( ) {
        var stackedDiv = d3.select( "#stacked" )
                            .style( "top", this.sDimension.y + "px" )
                            .style( "left", this.sDimension.x + "px" )
                            .style( "width", this.sDimension.width + "px" )
                            .style( "height", this.sDimension.height + "px" )
                            .style( "position", "relative" );

        var svg = stackedDiv.append( "svg" )
                             .attr( "width", this.sDimension.width )
                             .attr( "height", this.sDimension.height )
                             .style( "align-items", "left" );

        var dimension = { width: this.sDimension.width, height: this.sDimension.height };

        this.stacked = new StackedArea( dimension, svg );
    }

    _map( ) {
        this.map = new Map( this.mDimension, 2 );
        this.map.show( capitals[ null ], 2, true );
    }

    _sankey( ) {
        var sankeyDiv = d3.select("#sankey")
                            .style("top", this.kDimension.y + "px")
                            .style("left", this.kDimension.x + "px")
                            .style("width", this.kDimension.width + "px")
                            .style("height", this.kDimension.height + "px")
                            .style("position", "absolute");

        this.sankey = new SankeyDiagram(this.kDimension.def, sankeyDiv);
        this.sankey.buildLinks(this.data);
        this.sankey.buildNodes();
        this.sankey.genSankey();
    }

    __loadData( ) {
        var load = new Promise(( resolve, reject ) => {
            d3.csv( this.selectedGtd, ( data ) => {
                resolve( data );
            });
        });

        return load;
    }

    __select( selected ) {
        var stacked = this.__convert_stacked( this.data );
        var heatmap = this.__convert_heatmap( this.data );

        this.__capital( );

        this.buttons.setColor( this.selected );

        this.stacked.show( stacked, this.selected );

        this.sankey.show( this.selected );

        this.map.show( this.capital, this.zoom, false );
        this.map.heatmap( heatmap );
    }

    __convert_stacked( data ) {
        var before      = new Array( this.selected.length ).fill( 0 );
        var unique      = [ ];
        var currentDate = null;
        var postDate    = null;
        var sum         = 0;

        data = data.filter(( d ) => {
            return this.selected.indexOf( d.gname ) > -1 && +d.nkill >= 0;
        });

        for ( var i = 0; i < data.length; i++ ) {
            sum = +data[ i ].nkill;
            currentDate = new Date( +data[ i ].iyear, +data[ i ].imonth - 1, +data[ i ].iday );

            for ( var x = i + 1; x < data.length; x++ ) {
                postDate = new Date( +data[ x ].iyear, +data[ x ].imonth - 1, +data[ x ].iday );

                if ( currentDate.getTime( ) == postDate.getTime( ) ) {
                    sum = sum + ( +data[ x ].nkill );
                }
                else {
                    unique.push({ gname: data[ x ].gname, date: currentDate, nkill: sum });
                    i = x;
                    break;
                }
            }
        }

        unique = unique.map(( d ) => {
            var g  = { };
            g.date = d.date;

            this.selected.forEach(( s, i ) => {
                if ( d.gname == s ) {
                    g[ s ] = d.nkill + before[ i ];
                }
                else {
                    g[ s ] = before[ i ];
                }

                before[ i ] = g[ s ];
            });

            return g;
        });

        return unique;
    }

    __convert_heatmap( data ) {
        var heatmaps = [ ];
        var heatmap  = [ ];
        var deaths   = [ ];
        var scales   = [ ];
        var extent   = null;
        var dScale   = null;

        this.selected.forEach(( s ) => {
            deaths = [ ];

            data.forEach(( d ) => {
                if ( d.gname == s ){
                    deaths.push( +d.nkill );
                }
            });

            extent = d3.extent( deaths );
            dScale = d3.scaleLinear( ).range([ 0., 1. ]);

            dScale.domain( extent );
            scales.push( dScale );
        });

        this.selected.forEach(( s, i ) => {
            heatmap = [ ];

            data.forEach(( d ) => {
                if ( +d.latitude != 0 && (+d.longitude) != 0 && d.gname == s ){
                    heatmap.push([ +d.latitude, +d.longitude, scales[ i ]( +d.nkill ) ]);
                }
            });

            heatmaps.push( heatmap );
        });

        return heatmaps;
    }

    __capital( ) {
        var group = null;
        this.zoom = 2;

        if ( this.selected.length == 1){
            group = this.selected[ 0 ];
            this.zoom = 6;
        }

        this.capital = capitals[ group ];
    }

    __ratio( ) {
        return ( ( (window.outerWidth - 30) - ( 2 * this.bDimension.x ) ) - 10 * ( 2 * this.bDimension.r ) ) / 9;
    }
}
