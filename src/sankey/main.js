const datasetURL = "https://raw.githubusercontent.com/jlocx/GlobalTerrorism-visualizacao-2017-1/master/datasets/selectedGTD.csv";

var body = d3.select("body");

var sankeyDef = {pos: {x: 0, y: 0}, size: {width: 1330, height: 650}, margin: {top: 10, bottom: 10, left: 10, right: 10} };

var sankeyDiagram = new SankeyDiagram(sankeyDef);

var pDataset = new Promise((resolve, reject) => {
	d3.csv(datasetURL, function(d) {
		resolve(d);
	});
});

pDataset.then((dataset) => {
	sankeyDiagram.buildLinks(dataset);
	sankeyDiagram.buildNodes();
	sankeyDiagram.show([1,2]);
});
