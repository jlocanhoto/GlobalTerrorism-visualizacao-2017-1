class Map{
    constructor(dimensions, position, id, heat_count){
        this.map = L.map(id);

        this.tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?\
                                      access_token=pk.eyJ1Ijoibmlsc29ubGltYSIsImEiOiJjajNhY2wwbXowMHBrMnFvN2Nm\
                                      YWRzeDI4In0.bW4qF_znV3ShcHTG_gQokQ', {
                                      maxZoom: 18
                         });

        this.heatLayers = new Array(heat_count);

        this.heat_count = heat_count;

        d3.select("#" + id).style("width", dimensions.width + "px");
        d3.select("#" + id).style("height", dimensions.height + "px");
        d3.select("#" + id).style("top", position.x + "px");
        d3.select("#" + id).style("height", position.y + "px");

    }

    show(latlong, zoom){
        var slice = palette.slice(0, this.heat_count);

        this.map.setView(latlong, zoom);
        this.tileLayer.addTo(this.map);
        this.heatLayers = this.heatLayers.map(function(h, i){
                                h = L.heatLayer([ ], {
                                        radius: 20,
                                        maxZoom: 6,
                                        gradient: slice[i]
                                    });
                                h.addTo(this.map);

                                return h;
                          });

    }

    heatmap(points){
        this.heatLayers.forEach(function(h, i){
            h.setLatLangs(points[i]);
        });

    }

}
