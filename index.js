function indexOfMinDiffZero(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var min = Number.MAX_SAFE_INTEGER;
    var minIndex = 0;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== 0 && arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }

    return minIndex;
}

function millis2TimeDiff(millis) {
	let seg   = Math.floor(millis/1000);
	let min   = Math.floor(seg/60);
	let hour  = Math.floor(min/60);
	let day   = Math.floor(hour/24);
	let week  = Math.floor(day/7);
	let month = Math.floor(day/30);
	let year  = Math.floor(day/365);

	let timeArray = [seg, min, hour, day, week, month, year];	
	let timeStrings = ["segundo", "minuto", "hora", "dia", "semana", "mes", "ano"];

	let indexMinTime = indexOfMinDiffZero(timeArray);

	let minValue = timeArray[indexMinTime];
	let unitOfTime = timeStrings[indexMinTime];
	
	let timeStr = minValue.toString() + " " + unitOfTime;

	// plural
	if (minValue > 1) {
		if (unitOfTime === 'mes') {
			timeStr += 'es';
		}
		else {
			timeStr += 's';
		}
	}

	return (timeStr + " atrás");
}

function getDiffTime(commitDate) {
	let today = new Date();
	let thatday = new Date(commitDate);

	let diffTime = today - thatday;

	return millis2TimeDiff(diffTime);
}

var groups = [
	{name: `Taliban`, info: '...', attacks: '5502', img: '0', link: '#'},
	{name: `Shining Path (SL)`, info: '...', attacks: '4548', img: '1', link: '#'},
	{name: `Farabundo Marti National Liberation Front (FMLN)`, info: '...', attacks: '3351', img: '2', link: '#'},
	{name: `Islamic State of Iraq and the Levant (ISIL)`, info: '...', attacks: '2833', img: '3', link: '#'},
	{name: `Irish Republican Army (IRA)`, info: '...', attacks: '2670', img: '4', link: '#'},
	{name: `Revolutionary Armed Forces of Colombia (FARC)`, info: '...', attacks: '2474', img: '5', link: '#'},
	{name: `New People's Army (NPA)`, info: '...', attacks: '2241', img: '6', link: '#'},
	{name: `Al-Shabaab`, info: '...', attacks: '2127', img: '7', link: '#'},
	{name: `Basque Fatherland and Freedom (ETA)`, info: '...', attacks: '2024', img: '8', link: '#'},
	{name: `Boko Haram`, info: '...', attacks: '1839', img: '9', link: '#'},
];

var flagGit = false;

$(document).ready(function() {
	$.each(groups, function (index, value) {
		$('#groups').children('.row').append(`
	<div class="col s12 m6 l4 xl3">
		<div class="card">
			<div class="card-image">
				<img src="flags/` + value.img + `.png">
			</div>
			<div class="card-content">
				<span class="card-title"><b>` + value.name + `</b></span>`
				+`<p>Quantidade de ataques registrados na base de dados: ` + value.attacks + `</p>
			</div>
			<div class="card-action">
				<a href="` + value.link + `" class="indigo-text text-lighten-2">Mais informações</a>
			</div>
		</div>
	</div>`);
	});
	/*
	var lastCommit = {author: {avatar_url: '', login: ''}, commit: {message: '', author: {date: ''}}};

	lastCommit.author.avatar_url = 'https://avatars1.githubusercontent.com/u/17601055?v=3'
	lastCommit.author.login = 'jlocx'
	lastCommit.commit.message ='Made "Introdução" tab active at first'
	lastCommit.commit.author.date = '2017-07-04T07:33:20Z'
	*/

	$('#visualization-tab').on('click', function() {
		if (flagGit === false) {
			flagGit = true;

			$.ajax({
			    url: 'https://api.github.com/repos/jlocx/GlobalTerrorism-visualizacao-2017-1/commits',  //Pass URL here 
			    type: "GET", //Also use GET method
			    crossDomain: true,
			    dataType: 'jsonp',
			    success: function(data) {
			        //var time = $(data).find('.commit-tease').html();
			        let lastCommit = data.data[0];
			        /*
			        console.log(lastCommit);
			        console.log(lastCommit.author.avatar_url);
			        console.log(lastCommit.author.login);
			        console.log(lastCommit.commit.message);
			        console.log(lastCommit.commit.author.date);
					*/
					let timeDifference = getDiffTime(lastCommit.commit.author.date);

			        $('#last-commit').html(`<div class="col s1">
		<img src="` + lastCommit.author.avatar_url + `" style="height:50px">
	</div>
	<div class="col s2">
		<span><b>` + lastCommit.author.login + `</b></span>
	</div>
	<div class="col s7">
		<span>` + lastCommit.commit.message + `</span>
	</div>
	<div class="col s2">
		<span>` + timeDifference + `</span>
	</div>`);
			    }
			});
		}
	});

	$('.other-tab').on('click', function() {
		flagGit = false;
	});
});