const datasetURL = "https://raw.githubusercontent.com/jlocx/GlobalTerrorism-visualizacao-2017-1/master/datasets/selectedGTD.csv";

var body = d3.select("body");

var spaceObj = {pos: {x: 0, y: 0}, size: {width: 1000, height: 80}, margin: {top: 10, bottom: 40, left: 20, right: 20} };
var rangeObj = {min: 1979, max: 2015};

var timeline = new Timeline(spaceObj, rangeObj);
timeline.add(body);

var sankeyDiagram = new SankeyDiagram();

//var concentricRadviz = new ConcentricRadviz([1,2,3,4,5], [attacktypeCodes, targettypeCodes, weapontypeCodes]);

var pDataset = new Promise((resolve, reject) => {
	d3.csv(datasetURL, function(d) {
		resolve(d);
	});
});

pDataset.then((dataset) => {
	sankeyDiagram.buildLinks(dataset);

	sankeyDiagram.sankey.nodes(sankeyDiagram.nodes);
	sankeyDiagram.sankey.links(sankeyDiagram.links);
});
