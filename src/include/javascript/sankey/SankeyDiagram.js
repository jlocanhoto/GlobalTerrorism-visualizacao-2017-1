class SankeyDiagram {
	constructor(sankeyDef) {
		this.svg 			= d3.select("#sankey").append("svg")
								.attr("width", sankeyDef.size.width)
								.attr("height", sankeyDef.size.height);

		this.sankey 		= d3.sankey()
								.nodeId((d) => d.id)
								.nodeWidth(15)
								.nodePadding(7)
								.extent([[1, 1], [sankeyDef.size.width - 1, sankeyDef.size.height - 6]]);

		this.link			= this.svg.append("g")
								  .attr("class", "links")
								  .attr("fill", "none")
								  .attr("stroke", "#000")
								  .attr("stroke-opacity", 0.2)
								  .selectAll("path");

		this.node			= this.svg.append("g")
								  .attr("class", "nodes")
								  .attr("font-family", "sans-serif")
								  .attr("font-size", 10)
								  .selectAll("g");

		this.completeLinks 	= [];
		this.selectedLinks	= [];
		this.links			= [];
		this.nodes 			= [];
		this.sankeyObj		= {};
		this.terrorists		= {};

		this.activeAttack 	= arrayInit(attacktypeCodes.codes.length, false);
		this.activeTarget 	= arrayInit(targettypeCodes.codes.length, false);
		this.activeWeapon 	= arrayInit(weapontypeCodes.codes.length, false);

		this.activeNodes 	= [];

		this.colors 		= [ '#b71c1c',
								'#880e4f',
								'#4a148c',
								'#1a237e',
								'#00bcd4',
								'#1b5e20',
								'#827717',
								'#f57f17',
								'#3e2723',
								'#212121' ];
	}

	buildNodes(origNodes)
	{
		let nodeIDs = Object.keys(this.activeNodes);

		for (let i = 0; i < nodeIDs.length; i++)
		{
			let name = nodeIDs[i].replaceAll("_", " ");
			name = name.slice(name.indexOf(" "), name.length);

			this.nodes.push({"id": nodeIDs[i], "name": name, "color": ""});
		}
	}

	buildLinks(data) {
		// Links: Terrorist Group -> Attack Type -> Target Type -> Weapon Type
		const THRESHOLD = 200;
		const ATTACK = 0, TARGET = 1, WEAPON = 2;

		var terroristAttacks = [];
		var terroristTargets = [];
		var terroristWeapons = [];

		var links = [];

		// PRIVATE FUNCTIONS
		var makeLink = (terrorist, source, target, color) => {
			var flagPresent = false;
			links.map((l) => {
				if ((l.source === source) && (l.target === target) && (l.color === color)) {
					l.value++;
					flagPresent |= true;
				}
			});

			if (!flagPresent) {
				let link = {"source": source, "target": target, "value": 1, "color": color};
				links.push(link);
			}
		}

		var verifySrcTrgt = () => {
			let terrorists = Object.keys(this.completeLinks);
			let source, target;

			for (let i = 0; i < terrorists.length; i++)
			{
				let terrorist = terrorists[i];
				let linksTerrorist = this.completeLinks[terrorist];
				
				for (let j = 0; j < linksTerrorist.length; j++)
				{
					source = terrorist;
					target = linksTerrorist[j][ATTACK];
					makeLink(terrorist, source, target, this.colors[i]);

					source = target;
					target = linksTerrorist[j][TARGET];
					makeLink(terrorist, source, target, this.colors[i]);

					source = target;
					target = linksTerrorist[j][WEAPON];
					makeLink(terrorist, source, target, this.colors[i]);		
				}
			}
		};

		var generateLinksArray = () => {
			this.links = JSON.parse(JSON.stringify(links));
			console.log(this.links)
		};

		// METHOD ITSELF
		for (let i = 0; i < data.length; i++)
		{
			let row = data[i];
			let terrorist = row.gname;
			let id_terrorist = "terrorist_" + terrorist.replaceAll(" ", "_");

			if (Object.keys(this.terrorists).indexOf(terrorist) === -1) {
				this.terrorists[terrorist] = [];
				this.completeLinks[id_terrorist] = []
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
			
			this.completeLinks[id_terrorist].push([id_attack, id_target, id_weapon]);

			this.activeNodes[id_terrorist]	= true;
			this.activeNodes[id_attack]		= true;
			this.activeNodes[id_target]		= true;
			this.activeNodes[id_weapon]		= true;
		}

		verifySrcTrgt();
		generateLinksArray();
	}

	show() {
		var dy0, dy1, nodeHeight;
		var that = this;

		function dragstarted(d) {
			console.log(d)
			d3.select(this).raise().classed("active", true);
			nodeHeight = d.y1 - d.y0;
			dy0 = d3.event.y - d.y0;
		}

		function dragged(d) {
			let svgHeight = parseInt(d3.select("#sankey").select("svg").style("height"));
			d.y0 = Math.max(0, Math.min(d3.event.y - dy0, svgHeight - nodeHeight));
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
							 .attr("class", (d) => { return "link " + d.class;})
							 .attr("d", d3.sankeyLinkHorizontal())
							 .attr("stroke", (d) => {
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
							 .attr("class", (d) => "node")
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