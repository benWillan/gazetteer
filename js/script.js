// Global Variables //
var defaultBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}),
	airportMap = L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map <a href="https://memomaps.de/">memomaps.de</a> <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}),
satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}),
darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}),
topographicMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var baseMaps = {
	"Default": defaultBaseMap,
	"Topographic": topographicMap,
	"Satellite": satelliteMap,
	"Dark Mode": darkMap,
	"Airport Locations" : airportMap
};

var map = L.map('map', {
	zoomSnap: 0.5,
	zoomDelta: 0.1,
	layers: [defaultBaseMap]
});

L.control.layers(baseMaps).addTo(map);

var startingCountryName;
var startingCountryIso;

var border;
var initialCountryIso;
var sidebar;

var boundingBoxNorth;
var boundingBoxEast;
var boundingBoxSouth;
var boundingBoxWest;

var countryMarkers = L.markerClusterGroup();

/*Icons*/
var landmarkIcon = L.icon({
    iconUrl: 'icons/icons8-obelisk-30.png',
    iconSize: [26, 62],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
    shadowUrl: null,
});

var airportIcon = L.icon({
    iconUrl: 'icons/icons8-airplane-128.png',
    iconSize: [52, 52],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
    shadowUrl: null,
});

var cityIcon = L.icon({
    iconUrl: 'icons/icons8-city-buildings-150.png',
    iconSize: [72, 72],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
    shadowUrl: null,
});

var educationIcon = L.icon({
    iconUrl: 'icons/icons8-college-100.png',
    iconSize: [46, 46],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
    shadowUrl: null,
});

var pointOfInterestIcon = L.icon({
    iconUrl: 'icons/icons8-point-of-interest-52.png',
    iconSize: [42, 42],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
    shadowUrl: null,
});

L.control.scale().addTo(map);

function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
	console.log(jqXHR);
	console.log(textStatus);
	console.log(errorThrown);
}

// Global Variables End//

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
		error: ajaxErrorFunction
	});
}

//Highlight current country.
function setCountry(output) {
	startingCountryName = output['currentCountryData']['countryName'];
	startingCountryIso = output['currentCountryData']['countryCode'];

	//set current country indicator.
	$('#currentCountry').html(`${startingCountryName}`);

	//set input box to current country and update map.
	$('#countryInput').val(`${startingCountryIso}`).change();
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
		error: ajaxErrorFunction
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
		error: ajaxErrorFunction
	});
}

function getFlag() {
	
	let iso = $('#countryInput').val();
	let countryName = $('#countryInput').html();
	let flagWidth = 144;	//96
	let flagHeight = 108;	//72	

	$('#countryFlag').attr({
		src: `https://flagcdn.com/${flagWidth}x${flagHeight}/${iso.toLowerCase()}.png`,
		srcset: `https://flagcdn.com/${flagWidth}x${flagHeight}/${iso.toLowerCase()}.png`,
		alt: `${countryName}`
	})
}

function formatWithCommas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function addDataToSideBar(result) {
	
	//console.log(result['data']);
	//console.log($('#countryInput'));

	let countryName = result['data']['countryName'];
	let countryCapital = result['data']['capital'];
	let population = formatWithCommas(result['data']['population']);
	let area = formatWithCommas(Number(result['data']['areaInSqKm']));
	let currencyCode = result['data']['currencyCode'];

	$('#countryName').html(countryName);
	$('#countryCapital').html(countryCapital);
	
	//population is formatted with commas first.
	$('#countryPopulation').html(population);

	//area is formatted with commas first.
	$('#countryArea').html(area + " Km²");

	$('#countryCurrencyCode').html(currencyCode);

}

function getCountrySidebarData() {
	
	let iso = $('#countryInput').val();
	
	$.ajax({
		url: 'php/getCountryData.php',
		type: 'POST',
		dataType: 'json',
		data: {countryCode: iso},
		success: addDataToSideBar,
		error: ajaxErrorFunction
	});
}

function addPointsOfInterestToMap(result) {
	
	let pointsOfInterestArray = (result['data']['geonames']);
	//console.log(pointsOfInterestArray);
	
	//remove previous marker layer if added from previous country selections.
	if (map.hasLayer(countryMarkers)) {
		countryMarkers.clearLayers();
	}

	for (let i = 0; i < pointsOfInterestArray.length; i++) {
		
		// console.log(pointsOfInterestArray[i]);
		// console.log(pointsOfInterestArray[i]['feature']);
		// console.log(pointsOfInterestArray[i]['title']);
		let feature;

		switch (pointsOfInterestArray[i]['feature']) {
			
			case 'landmark':
				let landmarkMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: landmarkIcon});
				
				
				landmarkMarker.bindPopup(`
					<h2 style="text-align: center"><a target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<h4>${pointsOfInterestArray[i]['feature'].charAt(0).toUpperCase() + pointsOfInterestArray[i]['feature'].slice(1)}</h4>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(landmarkMarker);
			break;

			case 'city':
				let cityMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: cityIcon});
				cityMarker.bindPopup(`
					<h2 style="text-align: center"><a target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(cityMarker);
			break;

			case 'edu':
				let eduMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: educationIcon});
				eduMarker.bindPopup(`
					<h2 style="text-align: center"><a target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(eduMarker);
			break;

			case 'airport':
				let airportMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: airportIcon});
				airportMarker.bindPopup(`
					<h2 style="text-align: center"><a target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(airportMarker);
			break;
			
			default:
				let pointOfInterestMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: pointOfInterestIcon});
				pointOfInterestMarker.bindPopup(`
					<h2 style="text-align: center"><a target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(pointOfInterestMarker);
			break;
		}
	}

	map.addLayer(countryMarkers);
	//map.removeLayer(countryMarkers);

}

function setBoundingBox(result) {
	boundingBoxNorth = result['data']['north'];
	boundingBoxEast = result['data']['east'];
	boundingBoxSouth = result['data']['south'];
	boundingBoxWest = result['data']['west'];

	$.ajax({
		url: 'php/getCountryBoundingBox.php',
		type: 'POST',
		dataType: 'json',
		data: {
			north: boundingBoxNorth,
			east: boundingBoxEast,
			south: boundingBoxSouth,
			west: boundingBoxWest
		},
		success: addPointsOfInterestToMap,
		error: ajaxErrorFunction
	});
}

function getWikiLinks() {
	
	let iso = $('#countryInput').val();
	
	$.ajax({
		url: 'php/getCountryData.php',
		type: 'POST',
		dataType: 'json',
		data: {countryCode: iso},
		success: setBoundingBox,
		error: ajaxErrorFunction
	});
}

////////////////////////////////////	initialisation.
$(document).ready(function() {
	
	addCountriesToSelect();
	highlightCurrentCountry();
	
	//country info button.
	infoEasyButton = L.easyButton({
		states: [{
			//icon:      '<img class="infoButton" src="icons/icons8-info-squared-38.png" style="width:38px; height:38px">',
			icon:      'fa-info',
			title:     'Country Information',
			onClick: function() {
				sidebar.toggle();
			}
		}]
	});

	//currency button.
	currencyEasyButton = L.easyButton({
		states: [{
			icon: '<img class="currencyButton" src="icons/icons8-dollar-yuan-exchange-38.png">',
			title: 'Currency Rates',
			onClick: function(btn, map) {
				sidebar.toggle();
			}
		}]
	});

	//covid button.
	covidEasyButton = L.easyButton({
		states: [{
			icon: '<img class="covidButton" src="icons/icons8-coronavirus-38.png">',
			title: 'Covid19 Data',
			onClick: function(btn, map) {
				sidebar.toggle();
			}
		}]
	});

	//earthquake button.
	earthquakeEasyButton = L.easyButton({
		states: [{
			icon: '<img class="earthquakeButton" src="icons/icons8-earthquake-28.png">',
			title: 'Earthquake History',
			onClick: function(btn, map) {
				sidebar.toggle();
			}
		}]
	});
	
	//add buttons to the map
	infoEasyButton.addTo(map);
	currencyEasyButton.addTo(map);
	covidEasyButton.addTo(map);
	earthquakeEasyButton.addTo(map);
	
	sidebar = L.control.sidebar('sidebar', {
		position: 'left'
	});
	
	map.addControl(sidebar);
});

$('#countryInput').on('change', function() {
	
	getBorderData();
	getCountrySidebarData();
	getFlag()
	getWikiLinks();
	
	
	
	
});

$('#resetLocation').on('click', function() {
	$('#countryInput').val(`${startingCountryIso}`).change();
});

