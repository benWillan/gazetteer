// Global Variables //
var myMap = L.map('map', {
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

var previousBorder;
var newBorder;
// Global Variables //

//Add countries to datalist.
function populateCoutrySelect(countriesArr) {
	countriesArr['countries'].forEach(country => {
		$('#countryInput').append(
			`
			<option value=${country['iso']}>${country['name']}</option>
			`
		)
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

	countryFeature = result['countries']['features'].find(feature => {
		if (feature['properties']['iso_a2'] == selectedCountryIso) {
			return feature;
		}
	});

	if (previousBorder != true) {
		
		newBorder = L.geoJSON(countryFeature, {style: function (geoJsonFeature) {
			return {color: 'maroon', fillOpacity: 0.15}
		}});

		newBorder.addTo(myMap);
		myMap.fitBounds(newBorder.getBounds());

		previousBorder = true;

	} else if (previousBorder == true) {
		myMap.removeLayer(newBorder);

		newBorder = L.geoJSON(countryFeature, {style: function (geoJsonFeature) {
			return {color: 'maroon'}
		}});
		
		newBorder.addTo(myMap);
		myMap.fitBounds(newBorder.getBounds());
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

$('#countryInput').on('change', function() {
	getBorderData();
});

$(document).ready(function() {
	defaultLayer.addTo(myMap);
	addCountriesToSelect();
	highlightCurrentCountry();
});