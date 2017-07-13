class Buttons {
    constructor( dimensions, path, stack, chosen ) {
        this.path = path;
        this.stack = stack;
        this.chosen = chosen;

        this.x = dimensions.x;
        this.y = dimensions.y;
        this.p = dimensions.p;
        this.r = dimensions.r;
    }

    show( ) {
        var that = this;
        var buttons_div = d3.select( "body" )
                            .select( "#buttons" )
                            .style( "top", this.y + "px" )
                            .style( "left", this.x + "px" )
                            .style( "position", "relative" );

        buttons_div.selectAll( "button" )
                   .data( gnames )
                   .enter( )
                   .append( "button" )
                   .attr( "class", "buttons tooltip-bottom" )
                   .attr( "data-tooltip", ( d ) => { return d; } )
                   .attr( "style", ( d, i ) => { return "background-image: url('" + this.path + i + ".png')"; } )
                   .style( "left", ( d, i ) => { return ( ( this.r + ( this.p / 2 ) ) * 2 * i ) + "px"; } )
                   .style( "width", ( this.r * 2 ) + "px" )
                   .style( "height", ( this.r * 2 ) + "px" )
                   .on( "click", function( d ){ that._stacked( d, this ); } );
    }

    setColor( names ) {
        var colors = Array.apply( null, Array( 10 ) ).map(function( ){ return [ ]; });
        var color;
        var index;

        names.forEach(( name, i ) => {
            index = gnames.indexOf( name );

            if ( index > -1 ) {
                colors[ index ] = palette[ i ][ "0.8" ];
            }
        });

        d3.selectAll( "button" )
          .style( "border", function( button, i ) {
              color = "#f5f5f5";

              if ( colors[ i ].length ) {
                  color = colors[ i ];
              }

              return "4px solid " + color;
          });
    }

    _stacked( d, widget ) {
        var index = this.stack.indexOf( d );

        if ( index > -1 ) {
            this.stack.splice( index, 1 );
        }
        else if ( index == -1 && this.stack.length < this.chosen ) {
            this.stack.push( d );
        }
    }
}
