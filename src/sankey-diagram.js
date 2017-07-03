var origNodes = [attacktypeCodes, targettypeCodes, weapontypeCodes];

class SankeyDiagram {
	constructor() {
		this.sankey = d3.sankey();
		this.links = [];
		this.nodes = [];

		for (let i = 0; i < origNodes.length; i++)
		{
			let classes = origNodes[i].codes;
			let column = origNodes[i].column;

			for (let j = 0; j < classes.length; j++)
			{
				this.nodes.push({"id": column + "_" + classes[j].name.replace(" ", "_"),
								 "name": classes[j].name});
			}
		}
	}

	makeLinks(data) {
		for (let i = 0; i < 1/*data.length*/; i++)
		{
			let row = data[i];

			let attack_index = +row[attacktypeCodes.column] - 1;
			let target_index = +row[targettypeCodes.column] - 1;
			let weapon_index = +row[weapontypeCodes.column] - 1;

			let attack_name	= attacktypeCodes.codes[attack_index].name;
			let target_name	= targettypeCodes.codes[target_index].name;
			let weapon_name	= weapontypeCodes.codes[weapon_index].name;
			
			console.log(attacktypeCodes.codes[attack_index].name);
			console.log(targettypeCodes.codes[target_index].name);
			console.log(weapontypeCodes.codes[weapon_index].name);
		}
	}
}

/*
var colors = {
        'environment':         '#edbd00',
        'social':              '#367d85',
        'animals':             '#97ba4c',
        'health':              '#f5662b',
        'research_ingredient': '#3f3e47',
        'fallback':            '#9f9fa3'
      };
  d3.json("product.json", function(error, json) {
    var chart = d3.select("#sankey").append("svg").chart("Sankey.Path");
    chart
      .name(label)
      .colorNodes(function(name, node) {
        return color(node, 1) || colors.fallback;
      })
      .colorLinks(function(link) {
        return color(link.source, 4) || color(link.target, 1) || colors.fallback;
      })
      .nodeWidth(15)
      .nodePadding(10)
      .spread(true)
      .iterations(0)
      .draw(json);
    function label(node) {
      return node.name.replace(/\s*\(.*?\)$/, '');
    }
    function color(node, depth) {
      var id = node.id.replace(/(_score)?(_\d+)?$/, '');
      if (colors[id]) {
        return colors[id];
      } else if (depth > 0 && node.targetLinks && node.targetLinks.length == 1) {
        return color(node.targetLinks[0].source, depth-1);
      } else {
        return null;
      }
    }
  });
  */