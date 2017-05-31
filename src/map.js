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

        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibmlsc29ubGltYSIsImEiOiJjajNhY2wwbXowMHBrMnFvN2NmYWRzeDI4In0.bW4qF_znV3ShcHTG_gQokQ', {
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
                         '0.0': 'rgb(0, 0, 0)',
                         '0.6': 'rgb(24, 53, 103)',
                         '0.75': 'rgb(46, 100, 158)',
                         '0.9': 'rgb(23, 173, 203)',
                         '1.0': 'rgb(0, 250, 250)'
                    }
                  }).addTo(this.map);

      d3.csv("https://raw.githubusercontent.com/jlocx/GlobalTerrorism-visualizacao-2017-1/master/datasets/reducedGTD.csv", function(err, data){
          if(err) throw err;

          var group = data.filter(function(d){ return d.gname == gname; });
          var kill = group.map(function(d){ var num = +d.nkill; if(!num) num = 0; return num; });

          that.dScale.domain([0, d3.max(kill)]);

          group.forEach(function(d, i){
              var lat = d.latitude;
              var lng = d.longitude;
              var alt = that.dScale(kill[i]);

              that.__delay__(1000).then(() => {
                  console.log("waiting...");

              }).then(() => { 
                return heat.addLatLng([lat, lng, alt]);

              });
          });


      });

    }

    __delay__(ms){
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };

}
