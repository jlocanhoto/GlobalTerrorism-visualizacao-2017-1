class SankeyDiagram {
	constructor(sankeyDef) {
		var svg 		= d3.select("#sankey").append("svg")
							.attr("width", sankeyDef.size.width)
							.attr("height", sankeyDef.size.height);

		this.sankey 	= d3.sankey()
							.nodeWidth(15)
							.nodePadding(10)
							.extent([1, 1], [sankeyDef.size.width - 1, sankeyDef.size.height - 6]);

		this.link		= svg.append("g")
							 .attr("class", "links")
							 .attr("fill", "none")
							 .attr("stroke", "#000")
							 .attr("stroke-opacity", 0.2)
							 .selectAll("path");

		this.node		= svg.append("g")
							 .attr("class", "nodes")
							 .attr("font-family", "sans-serif")
							 .attr("font-size", 10)
							 .selectAll("g");

		this.links 		= [];
		this.nodes 		= [];
		this.sankeyObj	= {};
		this.terrorists = {};
	}

	buildNodes(origNodes)
	{
		for (let i = 0; i < origNodes.length; i++)
		{
			let codes = origNodes[i].codes;
			let column = origNodes[i].column;

			for (let j = 0; j < codes.length; j++)
			{
				this.nodes.push({"id": column + "_" + codes[j].name.replaceAll(" ", "_"),
								 "name": codes[j].name});
			}
		}
	}

	buildLinks(data) {
		// Links: Terrorist Group -> Attack Type -> Target Type -> Weapon Type

		// PRIVATE FUNCTIONS
		var verifySrcTrgt = (terrorist, source, target) => {
			let obj = this.terrorists[terrorist];
			let ret = false;

			for (let i = 0; (i < obj.length) && (ret === false); i++)
			{
				if ((obj[i].source === source) && (obj[i].target === target)) {
					this.terrorists[terrorist][i].value++;
					ret = true;
				}
			}

			if (ret === false) {
				let link = {"source": source, "target": target, "value": 1};
				this.terrorists[terrorist].push(link);
			}
		};

		var genLinksArray = () => {
			let keys = Object.keys(this.terrorists);

			for (let i = 0; i < keys.length; i++)
			{
				let key = keys[i];
				this.links = this.links.concat(this.terrorists[key]);
			}			
		}

		// METHOD ITSELF
		for (let i = 0; i < data.length; i++)
		{
			let row = data[i];
			let terrorist = row.gname;
			let terrorist_id = terrorist.replaceAll(" ", "_");
			let indexTerrorist = Object.keys(this.terrorists).indexOf(terrorist);

			if (indexTerrorist === -1) {				
				this.nodes.push({"id" : terrorist_id, "name" : terrorist});
				this.terrorists[terrorist] = [];
			}

			let attack_index = +row[attacktypeCodes.column] - 1;
			let target_index = +row[targettypeCodes.column] - 1;
			let weapon_index = +row[weapontypeCodes.column] - 1;

			let attack_name	= attacktypeCodes.codes[attack_index].name.replaceAll(" ", "_");
			let target_name	= targettypeCodes.codes[target_index].name.replaceAll(" ", "_");
			let weapon_name	= weapontypeCodes.codes[weapon_index].name.replaceAll(" ", "_");

			let id_attack = attacktypeCodes.column + "_" + attack_name;
			let id_target = targettypeCodes.column + "_" + target_name;
			let id_weapon = weapontypeCodes.column + "_" + weapon_name;
			
			verifySrcTrgt(terrorist, terrorist_id, id_attack);
			verifySrcTrgt(terrorist, id_attack, id_target);
			verifySrcTrgt(terrorist, id_target, id_weapon);
		}

		//console.log(this.terrorists);
		genLinksArray();
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