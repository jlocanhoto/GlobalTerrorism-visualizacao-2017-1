class ConcentricRadviz {
	constructor(dataset, classifications) {
		// classifications = [{name: , classes: []}, ...]

		// PRIVATE METHODS
		var getClasses = function(classifications) {
			var classesLimits = [];
			var probClasses = [];

			for (let i = 0; i < classifications.length; i++)
			{
				let len = classifications[i].classes.length;
				classesLimits.push(len);

				probClasses = probClasses.concat(Array(len).fill(0));
			}

			//console.log(probClasses);
			return {probs: probClasses, limits: classesLimits};
		}

		var associateProbs = function(data, limits) {
			var totalLen = 0;

			for (let i = 0; i < limits.length; i++)
			{
				totalLen += limits[i];
			}

			for (let i = 0; i < data.length; i++)
			{
				//var probs = Array(totalLen).fill(0);
				var probs = [];

				for (let j = 0; j < totalLen; j++)
				{
					probs.push(Math.random());
				}

				data[i] = {instance: data[i], probs: probs};
			}
		}

		var normalizeArray = function(arr) {
			// data = {probs: [...], limits: [...]}
			let range = {max: Math.max.apply(null, arr), min: Math.min.apply(null, arr)};
			let delta = range.max - range.min;

			let _begin = 0
			let _end = arr.length;

			for (let j = _begin; j < _end; j++)
			{
				if (delta === 0) {
					j = arr.length + 1;
				}
				else {
					arr[j] = (arr[j] - range.min)/delta;
				}
			}
		}

		var normalize = function(data, limits) {
			for (let i = 0; i < data.length; i++)
			{
				// normalize per instance
				var probs = data[i].probs;

				normalizeArray(probs);

				// normalize per class
				var normProbs = [];
				let begin;				
				for (let j = 0; j < limits.length; j++)
				{
					if (j === 0) {
						begin = 0;
					}
					else {
						begin += limits[j-1];
					}

					let end = begin + limits[j];

					let arr = probs.slice(begin, end);

					normalizeArray(arr);

					normProbs = normProbs.concat(arr);
				}
				
				data[i].probs = normProbs;
				//console.log(normProbs)
			}
		}

		// PRIVATE VARIABLES
		let ret = getClasses(classifications);
		var probs = ret.probs;
		var limits = ret.limits;

		associateProbs(dataset, limits);

		normalize(dataset, limits);

		console.log(dataset)
	}
}