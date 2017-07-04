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

$.each(groups, function (index, value) {
	$('#groups').children('.row').append(`
<div class="col s12 m4">
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

$.ajax({
    url: 'https://api.github.com/repos/jlocx/GlobalTerrorism-visualizacao-2017-1/commits',  //Pass URL here 
    type: "GET", //Also use GET method
    crossDomain: true,
    dataType: 'jsonp',
    success: function(data) {
        //var time = $(data).find('.commit-tease').html();
        console.log(data.data[0]);
        //$('#last-commit').append(time);
    }
});