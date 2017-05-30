class Map{
    constructor(dimensions, position, id){
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.x = position.x;
        this.y = position.y;
        this.id = id;

        this.dScale = d3.scaleLinear( )
                        .range([0., 1.]);

        d3.select("#" + id).style("width", this.width + "px");
        d3.select("#" + id).style("height", this.height + "px");
    }

    show(latlong, zoomin){
        this.map = L.map(this.id).setView(latlong, zoomin);

        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibmlsc29ubGltYSIsImEiOiJjajNhY2wwbXowMHBrMnFvN2NmYWRzeDI4In0.bW4qF_znV3ShcHTG_gQokQ', {
            /*attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, \
                          <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, \
                          Imagery © <a href="http://mapbox.com">Mapbox</a>',*/
            maxZoom: 18
        }).addTo(this.map);

    }

    heatmap(gname){
      var that = this;
      var heat = L.heatLayer([ ], {radius: 20,
                    maxZoom: 6,
                    gradient: {
                      0.4: 'blue',
                      0.6: 'lime',
                      0.85: 'yellow',
                      0.97: 'yellow',
                      1: 'red'
                    }
                  }).addTo(this.map);

      d3.csv("https://raw.githubusercontent.com/jlocx/GlobalTerrorism-visualizacao-2017-1/master/datasets/reducedGTD.csv", function(err, data){
          if(err) throw err;

          var group = data.filter(function(d){ return d.gname == gname; });
          var kill = group.map(function(d){ var num = +d.nkill; if(!num) num = 0; return num; });

          that.dScale.domain(d3.extent(kill));

          for(var i = 0; i < group.length; i++){
              heat.addLatLng([group[i].latitude, group[i].longitude, that.dScale(kill[i])]);
          }
      });

    }
}
