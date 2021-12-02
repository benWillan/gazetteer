// Global Variables //
var map = L.map('map', {
	zoomSnap: 0.5,
	zoomDelta: 0.1
});

var defaultLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

var border;
var initialCountryIso;
var infoEasyButton;
var sidebar;
//var cntrlSidebar;

L.control.scale().addTo(map);


// Global Variables //

//Add countries to select.
function populateCoutrySelect(countriesArr) {
	countriesArr['countries'].forEach(country => {
		$('#countryInput').append(
			`
			<option value=${country['iso']}>${country['name']}</option>
			`
		);
	});
}

function addCountriesToSelect() {
	$.ajax({
		url: "php/getCountryNamesAndISOs.php",
		type: "GET",
		dataType: "json",
		success: populateCoutrySelect,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

//Highlight current country.
function setCountry(output) {
	let currentCountryName = output['currentCountryData']['countryName'];
	let currentCountryIso = output['currentCountryData']['countryCode'];

	//set current country indicator.
	$('#currentCountry').html(`${currentCountryName}`);

	//set input box to current country and update map.
	$('#countryInput').val(`${currentCountryIso}`).change();
}

function errorCallback(errorMsg) {
	console.log(errorMsg);
}

function getCurrentCountry(position) {
	
	let currentLat = position.coords.latitude;
	let currentLng = position.coords.longitude;

	$.ajax({
		url: "php/getCurrentCountry.php",
		type: "POST",
		data: {lat: currentLat, lng: currentLng},
		dataType: "json",
		success: setCountry,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

function highlightCurrentCountry() {
	navigator.geolocation.getCurrentPosition(getCurrentCountry, errorCallback);
}

function highlightNewBorder(result) {

	let selectedCountryIso = $('#countryInput').val();

	//search for the country in the feature collection who's ISO matches the ISO of the country selected.
	countryFeature = result['countries']['features'].find(feature => {
		if (feature['properties']['iso_a2'] == selectedCountryIso) {
			return feature;
		}
	});

	if (border == undefined) {
		
		//assign border object and style of the selected country to border.
		border = L.geoJSON(countryFeature, {style: function () {
			return {color: 'crimson', weight: 2, fillOpacity: 0.35, fillColor: 'white'}
		}});

		border.addTo(map);
		map.fitBounds(border.getBounds());
		
	} else if (border != undefined) {
		
		map.removeLayer(border);

		border = L.geoJSON(countryFeature, {style: function () {
			return {color: 'crimson', weight: 2, fillOpacity: 0.35, fillColor: 'white'}
		}});
		
		border.addTo(map);
		map.fitBounds(border.getBounds());
	}

};

function getBorderData() {
	$.ajax({
		url: 'php/getgeoJSON.php',
		type: 'GET',
		dataType: 'json',
		success: highlightNewBorder,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

function getFlag() {
	
	let iso = $('#countryInput').val();
	let countryName = $('#countryInput').html();
	let flagWidth = 64;
	let flagHeight = 48;

	$('#countryFlag').attr({
		src: `https://flagcdn.com/${flagWidth}x${flagHeight}/${iso.toLowerCase()}.png`,
		srcset: `https://flagcdn.com/${flagWidth}x${flagHeight}/${iso.toLowerCase()}.png`,
		alt: `${countryName}`
	})
}


//initialisation.
$(document).ready(function() {
	defaultLayer.addTo(map);
	addCountriesToSelect();
	highlightCurrentCountry();
	
	infoEasyButton = L.easyButton({
		states: [{
				stateName: 'zoom-to-forest',        
				icon:      '<img class="infoButton" src="icons/icons8-info-squared-38.png">',
				title:     'Country Information',
				onClick: function(btn, map) {
					sidebar.toggle();
				}
			}]
		});
	
	infoEasyButton.addTo(map);
	
	sidebar = L.control.sidebar('sidebar', {
		position: 'left'
	});
	
	map.addControl(sidebar);

});

$('#countryInput').on('change', function() {
	getBorderData();
	getFlag()
	let marker = L.marker([51.5, -0.1]);
	//sidebar.show();
	
});