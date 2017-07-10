class Map{
    constructor(dimensions, position, id, heat_count){
        this.map = L.map(id);

        this.tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibmlsc29ubGltYSIsImEiOiJjajR2bGNpZmgwd2N1MzJtYzZkaTdzYWxsIn0.QHRt44knAkyu-FkZLgR7tQ', {
                                      maxZoom: 18,
                                      mapId: id
                         });

        this.heat_count = heat_count;

        d3.select("body").select("#" + id).style("width", dimensions.width + "px");
        d3.select("body").select("#" + id).style("height", dimensions.height + "px");
        d3.select("body").select("#" + id).style("top", position.y + "px");
        d3.select("body").select("#" + id).style("left", position.x + "px");

    }

    show(latlong, zoom){
        var slice = palette.slice(0, this.heat_count);

        this.map.setView(latlong, zoom);
        this.tileLayer.addTo(this.map);

        this.heatLayers = [ ];

        slice.forEach((s, i) => {
            var h = L.heatLayer([ ], {
                        "radius": 15,
                        "blur": 10,
                        "maxZoom": 6,
                        "gradient": s,
                    });

            h.addTo(this.map);
            this.heatLayers.push(h);
        });

    }

    heatmap(point, index){
        var h = this.heatLayers[index];
        var p = [ ];

        if(point.length > 0){
            p = point;
        }

        p.forEach(function(d){
            h.addLatLng(d);
        });

    }

}
