class SankeyDiagram {
	constructor(sankeyDef) {
		this.svg 		= d3.select("#sankey").append("svg")
							.attr("width", sankeyDef.size.width)
							.attr("height", sankeyDef.size.height);

		this.sankey 	= d3.sankey()
							.nodeId((d) => d.id)
							.nodeWidth(15)
							.nodePadding(7)
							.extent([[1, 1], [sankeyDef.size.width - 1, sankeyDef.size.height - 6]]);

		this.link		= this.svg.append("g")
							 .attr("class", "links")
							 .attr("fill", "none")
							 .attr("stroke", "#000")
							 .attr("stroke-opacity", 0.2)
							 .selectAll("path");

		this.node		= this.svg.append("g")
							 .attr("class", "nodes")
							 .attr("font-family", "sans-serif")
							 .attr("font-size", 10)
							 .selectAll("g");

		this.links 		= [];
		this.nodes 		= [];
		this.sankeyObj	= {};
		this.terrorists = {};

		this.activeAttack;
		this.activeTarget;
		this.activeWeapon;

		this.colors 	= [ '#b71c1c',
							'#880e4f',
							'#4a148c',
							'#1a237e',
							'#00bcd4',
							'#1b5e20',
							'#827717',
							'#f57f17',
							'#3e2723',
							'#212121' ];

		/*							
		this.colors 	= [ '#880e4f',
							'#880e4f',
							'#880e4f',
							'#880e4f',
							'#880e4f',
							'#880e4f',
							'#880e4f',
							'#880e4f',
							'#880e4f',
							'#880e4f' ];
		*/

		console.log(this.svg.style("height"))
	}

	buildNodes(origNodes)
	{
		for (let i = 0; i < origNodes.length; i++)
		{
			let codes = origNodes[i].codes;
			let column = origNodes[i].column;
			let activeNodes;

			switch(column)
			{
				case "attacktype1":
					activeNodes = this.activeAttack;
					break;
				case "targtype1":
					activeNodes = this.activeTarget;
					break;
				case "weaptype1":
					activeNodes = this.activeWeapon;
					break;
			}

			for (let j = 0; j < codes.length; j++)
			{
				if (activeNodes[j] === true) {
					this.nodes.push({"id": column + "_" + codes[j].name.replaceAll(" ", "_"),
								 "name": codes[j].name});
				}
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
				let link = {"source": source, "target": target, "value": 1, "color": '#000000'};
				this.terrorists[terrorist].push(link);
			}
		};

		var genLinksArray = () => {
			const THRESHOLD = 0;
			let keys = Object.keys(this.terrorists);
			//console.log(keys)

			for (let i = 0; i < keys.length; i++)
			{
				let key = keys[i];
				//if (key === "Taliban" || key === "Boko Haram")
				for (let j = 0; j < this.terrorists[key].length; j++)
				{
					if (this.terrorists[key][j].value > THRESHOLD) {
						this.terrorists[key][j].color = this.colors[i];
						this.links.push(this.terrorists[key][j]);
					}
				}
				//this.links = this.links.concat(this.terrorists[key]);
			}			
		}

		// METHOD ITSELF
		this.activeAttack = arrayInit(attacktypeCodes.codes.length, false);
		this.activeTarget = arrayInit(targettypeCodes.codes.length, false);
		this.activeWeapon = arrayInit(weapontypeCodes.codes.length, false);

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

			this.activeAttack[attack_index] = true;
			this.activeTarget[target_index] = true;
			this.activeWeapon[weapon_index] = true;
		}

		genLinksArray();
	}

	show() {
		var dy0, dy1, nodeHeight;
		var that = this;

		function dragstarted(d) {
			d3.select(this).raise().classed("active", true);
			nodeHeight = d.y1 - d.y0;
			dy0 = d3.event.y - d.y0;
			dy1 = d.y1 - d3.event.y;
		}

		function dragged(d) {
			console.log(that.svg)
			console.log(d3.event.y)
			let svgHeight = parseInt(d3.select("#sankey").select("svg").style("height"));
			d.y0 = Math.max(0, Math.min(d3.event.y - dy0, svgHeight - nodeHeight));
			//d.y1 = d3.event.y + dy1;
			d.y1 = d.y0 + nodeHeight;

			d3.select(this).select("text").attr("y", (d.y0 + d.y1)/2);
			d3.select(this).select("rect").attr("y", d.y0);

			that.sankey.update(that.sankeyObj);
			that.link.attr("d", d3.sankeyLinkHorizontal());
		}

		function dragended(d) {
			d3.select(this).classed("active", false);
		}

		this.sankeyObj = {"nodes": this.nodes, "links": this.links};
		this.sankey(this.sankeyObj);

		this.link = this.link.data(this.sankeyObj.links)
							 .enter()
							 .append("path")
							 .attr("class", "link")
							 .attr("d", d3.sankeyLinkHorizontal())
							 .attr("stroke", (d) => {
							 	//console.log(d);
							 	return d.color;
							 })
							 .attr("stroke-width", (d) => {
								 return Math.max(1, d.width);
							 });

		this.link.append("title")
				 .text((d) => {
				 	return d.source.name + " → " + d.target.name + "\n" + d.value.toString() + " ataques";
				 });

		this.node = this.node.data(this.sankeyObj.nodes)
							 .enter()
							 .append("g")
							 .attr("class", "node")
							 .call(d3.drag()
								 .on("start", dragstarted)
								 .on("drag", dragged)
								 .on("end", dragended));

		this.node.append("rect")
				 .attr("x", function(d) { return d.x0; })
				 .attr("y", function(d) { return d.y0; })
				 .attr("height", function(d) { return d.y1 - d.y0; })
				 .attr("width", function(d) { return d.x1 - d.x0; })
				 .attr("stroke", "#000");

		this.node.append("text")
				 .attr("x", function(d) { return d.x0 - 6; })
				 .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
				 .attr("dy", "0.35em")
				 .attr("text-anchor", "end")
				 .text(function(d) { return d.name; })
				 .filter((d) => { return d.x0 < +this.svg.attr("width") / 2; })
				 .attr("x", function(d) { return d.x1 + 6; })
				 .attr("text-anchor", "start");

		this.node.append("title")
				 .text(function(d) { return d.name + "\n" + d.value.toString() + " ataques"; });
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