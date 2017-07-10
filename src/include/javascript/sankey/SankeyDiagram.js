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
			let ret = false;

			if (links[terrorist] === undefined) {
				links[terrorist] = [];
			}
			if (links[terrorist][source] === undefined) {
				links[terrorist][source] = [];
			}
			if (links[terrorist][source][target] === undefined) {
				links[terrorist][source][target] = {"value": 1, "color": color};
			}
			else {
				links[terrorist][source][target].value++;
			}
		}

		var verifySrcTrgt = () => {
			//console.log(this.completeLinks);
			let terrorists = Object.keys(this.completeLinks);
			
			for (let i = 0; i < terrorists.length; i++)
			{
				let terroristLinks = this.completeLinks[terrorists[i]];
				let attacks = {"arr": [], "qty": [], "pass": []};
				let targets = {"arr": [], "qty": [], "pass": []};
				let weapons = {"arr": [], "qty": [], "pass": []};

				for (let j = 0; j < terroristLinks.length; j++)
				{
					let attack = terroristLinks[j][ATTACK];
					if (attacks.arr.pushIfNotExists(attack)) {
						attacks.qty[attack] = 1;
						attacks.pass[attack] = false;
					}
					else {
						attacks.qty[attack]++;
					}
					if (attacks.pass[attack] === false && attacks.qty[attack] > THRESHOLD) {
						attacks.pass[attack] = true;
					}
					
					let target = terroristLinks[j][TARGET];
					if (targets.arr.pushIfNotExists(target)) {
						targets.qty[target] = 1;
						targets.pass[target] = false;
					}
					else {
						targets.qty[target]++;
					}
					if (targets.pass[target] === false && targets.qty[target] > THRESHOLD) {
						targets.pass[target] = true;
					}

					let weapon = terroristLinks[j][WEAPON];
					if (weapons.arr.pushIfNotExists(weapon)) {
						weapons.qty[weapon] = 1;
						weapons.pass[weapon] = false;
					}
					else {
						weapons.qty[weapon]++;
					}
					if (weapons.pass[weapon] === false && weapons.qty[weapon] > THRESHOLD) {
						weapons.pass[weapon] = true;
					}
				}

				terroristAttacks[terrorists[i]] = attacks;
				terroristTargets[terrorists[i]] = targets;
				terroristWeapons[terrorists[i]] = weapons;

				this.selectedLinks[terrorists[i]] = [];

				for (let j = 0; j < terroristLinks.length; j++)
				{
					let attack = terroristLinks[j][ATTACK];
					let target = terroristLinks[j][TARGET];
					let weapon = terroristLinks[j][WEAPON];
					
					if (attacks.pass[attack] && targets.pass[target] && weapons.pass[weapon]) {
						this.selectedLinks[terrorists[i]].push(terroristLinks[j]);
					}
				}
			}
			
			
			//let terrorists = this.completeLinks
			
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
				let link = {"source": source, "target": target, "value": 1, "color": '', "class": ""};
				this.terrorists[terrorist].push(link);
			}
			
		};

		var generateLinksArray = () => {
			let terrorists = Object.keys(this.completeLinks);
			let terrorLinks = [];

			for (let i = 0; i < terrorists.length; i++)
			{
				let selLinks = this.completeLinks[terrorists[i]];
				let source;
				let target;

				for (let j = 0; j < selLinks.length; j++)
				{
					source = terrorists[i];
					target = selLinks[j][ATTACK];
					makeLink(terrorists[i], source, target, this.colors[i]);

					source = target;
					target = selLinks[j][TARGET];
					makeLink(terrorists[i], source, target, this.colors[i]);

					source = target;
					target = selLinks[j][WEAPON];
					makeLink(terrorists[i], source, target, this.colors[i]);
				}
			}

			console.log(links)

			for (let t = 0; t < terrorists.length; t++)
			{
				let sources = Object.keys(links[terrorists[t]]);
				for (let i = 0; i < sources.length; i++)
				{
					let source = sources[i];
					let targets = Object.keys(links[terrorists[t]][source]);

					for (let j = 0; j < targets.length; j++)
					{
						let target = targets[j];

						if (links[terrorists[t]][source][target].value > THRESHOLD)
							this.links.push({
								"source": source,
								"target": target,
								"value": links[terrorists[t]][source][target].value,
								"color": links[terrorists[t]][source][target].color,
								"class": ""
							});
					}
				}
			}

			console.log(this.links)

			//console.log(keys)
			/*
			for (let i = 0; i < keys.length; i++)
			{
				let key = keys[i];
				//if (key === "Taliban" || key === "Boko Haram")
				for (let j = 0; j < this.terrorists[key].length; j++)
				{
					if (this.terrorists[key][j].value < THRESHOLD) {
						this.terrorists[key][j].source
						reduceValue++;
						/*
						this.terrorists[key][j].color = this.colors[i];
						this.links.push(this.terrorists[key][j]);
						console.log(this.terrorists[key][j])
						*//*
					}
				}

				this.terrorists[key].map((t) => {
					t.value -= reduceValue;
					if (t.value > 0) {
						t.color = this.colors[i];
						this.links.push(t);
					}
					//console.log(t);
				})
				//this.links = this.links.concat(this.terrorists[key]);
			}*/
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
			this.activeNodes[id_attack] 	= true;
			this.activeNodes[id_target] 	= true;
			this.activeNodes[id_weapon] 	= true;
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