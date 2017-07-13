class SankeyDiagram {
	constructor(sankeyDef, container) {
		const _width 		= sankeyDef.size.width - (sankeyDef.margin.left + sankeyDef.margin.right);
		const _height 		= sankeyDef.size.height - (sankeyDef.margin.top + sankeyDef.margin.bottom);

		this.svg 			= container.append("svg")
								.attr("width", _width)
								.attr("height", _height);

		this.sankey 		= d3.sankey()
								.nodeId((d) => d.id)
								.nodeWidth(15)
								.nodePadding(7)
								.extent([[1, 1], [_width - 1, _height - 6]]);

		this.completeLinks 	= [];
		this.selectedLinks	= [];
		this.links			= [];
		this.nodes 			= [];
		this._links			= [];
		this.sankeyObj		= {};
		this.terrorists		= {};

		this._THRESHOLD		= 50;

		//this._rootName 		= {'id': 'terrorists', 'value': 0, 'color': '#000000'};
		//this.tree 			= new Tree(this._rootName);

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

		this.kount = 0;
	}

	buildNodes()
	{
		this.nodes = [];
		let nodeIDs = Object.keys(this.activeNodes);
		//console.log(this.activeNodes)

		for (let i = 0; i < nodeIDs.length; i++)
		{
			let name = nodeIDs[i].replaceAll("_", " ");
			name = name.slice(name.indexOf(" "), name.length);

			this.nodes.push({"id": nodeIDs[i], "name": name, "color": ""});
		}
	}

	generateLinksArray(ref) {
		if (ref === null) {
			ref = gnames.map((g) => "terrorist_" + g.replaceAll(" ", "_"));
		}
		else {
			ref = ref.map((r) => "terrorist_" + r.replaceAll(" ", "_"));
		}

		this.links 		 = [];
		this.activeNodes = [];
		this.kount++;
		console.log(ref);

		for (let i = 0; i < this._links.length; i++)
		{
			let link = this._links[i];
			//console.log(this.kount, link);
			//this.tree.add({'id': link.target.id, 'value': link.target., 'color': link.color}, {'id': link.source.id, 'value': 1, 'color': link.color}, this.tree.traverseBF);
			if (link.value > this._THRESHOLD && ref.indexOf(link.gname) !== -1)  {
				//console.log(link.source)
				this.activeNodes[link.source] = true;
				this.activeNodes[link.target] = true;
				this.links.push(JSON.parse(JSON.stringify(link)));
			}
		}		
	};

	buildLinks(data) {
		// Links: Terrorist Group -> Attack Type -> Target Type -> Weapon Type
		const ATTACK = 0, TARGET = 1, WEAPON = 2;

		var terroristAttacks = [];
		var terroristTargets = [];
		var terroristWeapons = [];

		var links = [];

		// PRIVATE FUNCTIONS
		var makeLink = (terrorist, source, target, color) => {
			var flagPresent = false;
			this._links.map((l) => {
				if ((l.source === source) && (l.target === target) && (l.color === color)) {
					l.value++;
					flagPresent |= true;
				}
			});

			if (!flagPresent) {
				//this.tree.add({'id': target, 'value': 1, 'color': color}, {'id': source, 'value': 1, 'color': color}, this.tree.traverseBF);

				let link = {"source": source, "target": target, "value": 1, "color": color, "gname": terrorist};
				this._links.push(link);
			}
			else {
				//this.tree.incLinkValue({'id': source, 'color': color}, {'id': target, 'color': color}, this.tree.traverseBF);
			}	
		}

		var verifySrcTrgt = () => {
			let terrorists = Object.keys(this.completeLinks);
			let source, target;

			for (let i = 0; i < terrorists.length; i++)
			{
				let terrorist = terrorists[i];
				let linksTerrorist = this.completeLinks[terrorist];
				let color = this.colors[i];

				//this.tree.add({'id': terrorist, 'value': 1, 'color': color}, this._rootName, this.tree.traverseBF);

				for (let j = 0; j < linksTerrorist.length; j++)
				{
					source = terrorist;
					target = linksTerrorist[j][ATTACK];
					makeLink(terrorist, source, target, color);

					source = target;
					target = linksTerrorist[j][TARGET];
					makeLink(terrorist, source, target, color);

					source = target;
					target = linksTerrorist[j][WEAPON];
					makeLink(terrorist, source, target, color);		
				}
			}
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
			/*
			this.activeNodes[id_terrorist]	= true;
			this.activeNodes[id_attack]		= true;
			this.activeNodes[id_target]		= true;
			this.activeNodes[id_weapon]		= true;
			*/
		}

		verifySrcTrgt();
		this.generateLinksArray(null);
	}

	genSankey() {
		this.sankeyObj = {"nodes": this.nodes, "links": this.links};
		this.sankey(this.sankeyObj);
	}
/*
	removeValue(link, value) {
		link.value = 0;
		console.log('height:', link.source.height);

		if (link.source.height === 3) {
			console.log(link);
			//debugger;
			return;
		}
		else {
			link.source.targetLinks.forEach((l) => {
				if (l.color === link.color) {
					//debugger;

					console.log('(antes) link value:', l.value, 'reduceValue:', value)
					l.value -= value;
					console.log('(depois) link value:', l.value, 'reduceValue:', value)

					if (l.value < this._THRESHOLD) {
						//value += l.value;
						//debugger;
						console.log(value + l.value);
						this.removeValue(l, value + l.value);
					}
				}
			});
		}
	}

	recursiveRemoval() {
		var len = this.links.length;

		for (let h = 0; h < 2; h++)
		{
			for (let i = 0; i < len; i++)
			{
				let l = this.links[i];
				console.log(i, 'of', len)
				//debugger;
				console.log(l);
				if (l.target.height === h) {
					console.log('old value = ', l.value);
					if (h > 0)
						l.value = l.target.sourceLinks.reduce((a, b) => (a.value + b.value), 0);
					console.log('new value = ', l.value);
					
					if (l.value < this._THRESHOLD) {
						//this.links.splice(i, 1);
						l.value = 0;
						//this.removeValue(l, l.value);

						/*
						if (l.value === 0) {
							this.links.splice(i, 1)
						}
						*//*
					}
				}
			}	
		}

		this.sankey.update(this.sankeyObj);
		//this.link.attr("d", d3.sankeyLinkHorizontal());
	};
*/

	selectNodesLinks(terrorists) {
		this.generateLinksArray(terrorists);
		this.buildNodes();
		this.sankeyObj = {"nodes": this.nodes, "links": this.links};
		this.sankey(this.sankeyObj);
		this.svg.selectAll("g").remove();
	}

	show(terrorists) {
		var dy0, dy1, nodeHeight;
		var that = this;

		this.selectNodesLinks(terrorists);

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

			console.log(that.sankey)
			that.sankey.update(that.sankeyObj);
			that.link.attr("d", d3.sankeyLinkHorizontal());
		}

		function dragended(d) {
			d3.select(this).classed("active", false);
		}

		this.link = this.link.data(this.sankeyObj.links)
							 .enter()
							 .append("path")
							 .attr("class", (d) => "link")
							 .attr("d", d3.sankeyLinkHorizontal())
							 .attr("stroke", (d) => d.color)
							 .attr("stroke-width", (d) => Math.max(1, d.width))
							 .on("mouseover", function(d, i) {
							 	/*console.log(d);
							 	console.log(this);*/
							 })
							 .on("click", function(d) { console.log(d); });

		this.link.append("title")
				 .text((d) => {
				 	return d.source.name + " -> " + d.target.name + "\n" + d.value.toString() + " ataques";
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