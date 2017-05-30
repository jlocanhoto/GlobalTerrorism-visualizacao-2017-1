var body = d3.select("body");

var spaceObj = {pos: {x: 0, y: 0}, size: {width: 1000, height: 80}, margin: {top: 10, bottom: 40, left: 20, right: 20} };
var rangeObj = {min: 1979, max: 2015};

var timeline = new Timeline(spaceObj, rangeObj);
timeline.add(body);