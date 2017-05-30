var body = d3.select("body");

var spaceObj = {pos: {x: 50, y: 600}, size: {width: 1200, height: 100}, padding: {top: 10, bottom: 10, left: 10, right: 10} };
var rangeObj = {begin: 1970, end: 2015};

var timeline = new Timeline(spaceObj, rangeObj);
timeline.add(body);