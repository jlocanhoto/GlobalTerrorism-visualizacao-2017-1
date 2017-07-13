class Map{
    constructor(dimension, size){
        this.size = size;
        this.map = L.map("map");

        this.tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibmlsc29ubGltYSIsImEiOiJjajR2bGNpZmgwd2N1MzJtYzZkaTdzYWxsIn0.QHRt44knAkyu-FkZLgR7tQ', {
                                      maxZoom: 18,
                                      mapId: "map"
                         });

        this.heatLayers = [ ];

        d3.select("#map").style("width", dimension.width + "px");
        d3.select("#map").style("height", dimension.height + "px");
        d3.select("#map").style("top", dimension.y + "px");
        d3.select("#map").style("left", dimension.x + "px")
        d3.select("#map").style("position", "absolute");

    }

    show(latlng, zoom, first){
        this.map.setView(latlng, zoom);
        this.tileLayer.addTo(this.map);

        this.heat = Array.apply(null, Array(this.size)).map(function( ){ return [ ]; });

        if(first){
            this.heat.forEach((h, i) => {
                this.heatLayers.push(
                                    L.heatLayer([ ], {
                                        "radius": 15,
                                        "blur": 10,
                                        "maxZoom": 6,
                                        "gradient": palette[i],
                              }).addTo(this.map));
            });
        }
    }

    heatmap(heat){
        heat.forEach((h, i) => {
            this.heat[i] = h;
            this.map.removeLayer(this.heatLayers[i]);
        });

        this.heat.forEach((h, i) => {
            this.heatLayers[i].setLatLngs(h);
            this.heatLayers[i].addTo(this.map);
        });
    }

}
