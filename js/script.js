var defaultBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	minZoom: 2,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}),
	airportMap = L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
	maxZoom: 19,
	minZoom: 2,
	attribution: 'Map <a href="https://memomaps.de/">memomaps.de</a> <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}),
satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 19,
	minZoom: 2,
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}),
darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	subdomains: 'abcd',
	maxZoom: 19,
	minZoom: 2,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}),
topographicMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	minZoom: 2,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var baseMaps = {
	"Default": defaultBaseMap,
	"Topographic": topographicMap,
	"Satellite": satelliteMap,
	"Dark Mode": darkMap,
	"Airport Locations" : airportMap
};

/*
prevents a user from scrolling beyond -220 to 220 longitude. This helps to preserve the identificiation of countries that are clicked on via the map. Their longitude co-ordinates would otherwise be imcompatitble with Geonames.
*/
maxBounds = new L.LatLngBounds(new L.LatLng(85, -220), new L.LatLng(-85, 220));

var map = L.map('map', {
	zoomSnap: 0.5,
	zoomDelta: 0.1,
	layers: [defaultBaseMap],
	maxBounds,
	maxBoundsViscosity: 0.1

});

L.control.layers(baseMaps).addTo(map);

var startingCountryName;
var startingCountryIso;
var currentCountryCode;
var currentCountryName;

var border;
var initialCountryIso;
var countryInfoSidebar;

var boundingBoxArray;
var boundingBoxNorth;
var boundingBoxEast;
var boundingBoxSouth;
var boundingBoxWest;

var currencyKey;
var currencyRates;
var currencyRateButtonClickedBefore = false;

var countryMarkers = L.markerClusterGroup();

var weatherStationLayer = L.layerGroup();
var weatherLocationLayer = L.layerGroup();

	/*Icons*/

var landmarkIcon = L.ExtraMarkers.icon({
icon: 'fa-landmark',
markerColor: 'red',
shape: 'square',
prefix: 'fa'
});

var airportIcon = L.ExtraMarkers.icon({
	icon: 'fa-plane',
	markerColor: 'violet',
	shape: 'square',
	prefix: 'fa'
});

var cityIcon = L.ExtraMarkers.icon({
	icon: 'fas fa-city',
	markerColor: 'blue',
	shape: 'square',
	prefix: 'fa'
});

var educationIcon = L.ExtraMarkers.icon({
	icon: 'fa-graduation-cap',
	markerColor: 'black',
	shape: 'square',
	prefix: 'fa'
});

var pointOfInterestIcon = L.ExtraMarkers.icon({
	icon: 'fa-map-marker-alt',
	markerColor: 'orange',
	shape: 'square',
	prefix: 'fa'
});

var weatherStationIcon = L.ExtraMarkers.icon({
	icon: 'fa-wind',
	markerColor: 'purple',
	shape: 'circle',
	prefix: 'fa'
});

L.control.scale().addTo(map);

var infoIcon_fontAwsome = `<span style="color: blue;" class="fas fa-info fa-lg"></span>`;
var dollarSignIcon_fontAwsome = `<span style="color: red;" class="fas fa-dollar-sign fa-lg"></span>`;
var virusIcon_fontAwesome = `<span style="color: green;" class="fas fa-viruses fa-lg"></span>`;
var earthquakeIcon_fontAwesome = `<span style="color: brown;" class="fas fa-house-damage fa-lg"></span>`;
var weatherIcon_fontAwesome = `<span style="color: purple;" class="fas fa-wind fa-lg"></span>`;

/*Sidebar*/
countryInfoSidebar = L.control.sidebar('countryInfoSidebar', {
	position: 'left'
});

exchangeRateSideBar = L.control.sidebar('currencySidebar', {
	position: 'left'
});

//	country info button.
countryInfoEasyButton = L.easyButton({
	states: [{
		icon: infoIcon_fontAwsome,
		title: 'Country Information',
		onClick: function() {

			if (exchangeRateSideBar.isVisible() == true) {
				exchangeRateSideBar.hide();
				setTimeout(() => {countryInfoSidebar.toggle()}, 400);
			} else {
				countryInfoSidebar.toggle();
			}
			
		}
	}]
});

//	currency button.
function addCurrencyNamesToSidebar() {

	$.ajax({
		url: 'php/getCurrencyNames.php',
		type: 'GET',
		dataType: 'json',
		success: function assignCurrencies(result) {

			let currencyCodeNamePairs = result['data'];

			console.log(currencyCodeNamePairs);
			
			// for (const [currencyCode, currencyName] of Object.entries(currencyCodeNamePairs)) {
				
			// 	//console.log(`${key}: ${value}`);
			// 	$('#fromCurrencyNames').append(`<option value="${currencyCode}">${currencyName} (${currencyCode})</option>`);
			// 	$('#toCurrencyNames').append(`<option value="${currencyCode}">${currencyName} (${currencyCode})</option>`);

			// }
			
		},
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

function closeCountryInfoSidebarIfOpenFirst() {

	if (countryInfoSidebar.isVisible() == true) {
		countryInfoSidebar.hide();
		setTimeout(() => {exchangeRateSideBar.toggle()}, 400);
	} else {
		exchangeRateSideBar.toggle();
	}

}

currencyEasyButton = L.easyButton({
	states: [{
		icon: dollarSignIcon_fontAwsome,
		title: 'Currency Calculator',
		onClick: function() {

			//	prevents the currency data being downloaded everytime the currency easy button is clicked.
			if (exchangeRateSideBar.isVisible() == false && currencyRateButtonClickedBefore == false) {
				
				currencyRateButtonClickedBefore = true;

				$.ajax({
					url: 'php/getCurrencyRates.php',
					type: 'GET',
					dataType: 'json',
					success: function assignCurrencyRates(result) {
						
						//currencyRates = result['data']['rates'];
						console.log(result['data']);

						fx.base = "USD";
						fx.rates = result['data']['rates'];

						// addCurrencyNamesToSidebar();

					},
					error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
						console.log(jqXHR);
						console.log(textStatus);
						console.log(errorThrown);
					}
				});
				
				closeCountryInfoSidebarIfOpenFirst();

			} else {

				closeCountryInfoSidebarIfOpenFirst();

			}
		}
	}]
});

function formatModalDate(updatedTimestamp) {
	
	let dateRe = /\d{4}\-\d{2}\-\d{2}/g;
	let dateFormatted = dateRe.exec(updatedTimestamp);
	
	dateFormatted = new Date(dateFormatted[0]);
	dateFormatted = dateFormatted.toLocaleDateString("en-US");
	
	//	swap day and month positions.
	dateFormatted = dateFormatted.substr(3, 2) + "/" + dateFormatted.substr(0, 2) + "/" + dateFormatted.substr(6, 4);

	return dateFormatted;
}

function formatModalTime(updatedTimestamp) {

	let timeRe = /(?<=T)\d{2}\:\d{2}\:\d{2}/g;
	let timeFormatted = timeRe.exec(updatedTimestamp);
	timeFormatted = timeFormatted[0];

	return timeFormatted;
}

//	covid button.
function addCovidDataToModal(result) {

	//	Set modal title.
	let generalCovidData = result['data']['data'];
	let detailedCovidData = generalCovidData['timeline'][0];

	let countryReturnedName = $('#countryInput option:selected').text();
	$('#covidTableTitle').html(`<b style="color: white;">${countryReturnedName}</b> - Covid19 Statistics`);
	$('#covidModalCloseButton').blur();
	
	//	Get covid19 stats updated time updated value and assign to modal element.
	let updatedTimestamp = detailedCovidData['updated_at'];

	let dateFormatted = formatModalDate(updatedTimestamp);
	let timeFormatted = formatModalTime(updatedTimestamp);
	
	$('#covidLastUpdated').html(`<i>Last Updated: ${dateFormatted}, ${timeFormatted}</i>`);

	//	Get covid19 stat types and add them to modal.
	let statTypes = ['confirmed', 'active', 'deaths', 'new_deaths'];
	let modalElementIds = ['#confirmedCases', '#activeCases', '#totalCovidDeaths', '#dailyDeaths'];

	for (let i = 0; i < statTypes.length; i++) {
		$(modalElementIds[i]).html(formatWithCommas(detailedCovidData[statTypes[i]]));
	}

}

covidEasyButton = L.easyButton({
	states: [{
		icon: virusIcon_fontAwesome,
		title: "Covid19 Data",
		onClick: function() {
			
			$('#covidModal').modal('show');
			//$('#exampleModal').modal('show');
			
			//	get covid data.
			$.ajax({
				url: 'php/getCovidData.php',
				type: 'POST',
				data: {currentCountryCode},
				dataType: 'json',
				success: addCovidDataToModal,
				error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
			});
		}
	}]
});

function addEarthquakeDataToModal(result) {
	
	let earthquakesData = result['data']['earthquakes'];
	//console.log(earthquakesData);

	let currentlySelectedCountry = $('#countryInput option:selected').text();	

	//	Prevents countries with no earthquake data from being added to modal.
	if (earthquakesData.length == 0) {
		
		$('#earthquakeTable').empty();
		$('#earthquakeTableTitle').html(`<span style="color: white">${currentlySelectedCountry} - No Earthquake History Available</span>`);

	} else {

		let earthquakeTableHeaders = Object.keys(earthquakesData[0]);

		$('#earthquakeTable').empty();
		$('#earthquakeTable').append(`<tr id="earthquakeTableHeader"></tr>`);
	
		$('#earthquakeTableTitle').html(`<span style="color: white">${currentlySelectedCountry} - Earthquake History</span>`);
	
		for (let i = 0; i < earthquakeTableHeaders.length; i++) {
			$('#earthquakeTableHeader').append(`<th>${earthquakeTableHeaders[i]}</th>`);
		} 
	
		for (let i = 0; i < earthquakesData.length; i++) {
			$('#earthquakeTable').append(`<tr id="row${i}"></tr>`);
	
			earthquakeTableHeaders.forEach(header => {
				$(`#row${i}`).append(`<td>${earthquakesData[i][header]}</td>`);
			});
		}
	}

}

//	earthquake button.
earthquakeEasyButton = L.easyButton({
	states: [{
		icon: earthquakeIcon_fontAwesome,
		iconSize: [28,28],
		title: 'Earthquake History',
		onClick: function() {
			
			$('#earthquakeModal').modal('show');

			// getearthquake data.
			$.ajax({
				url: 'php/getEarthquakeData.php',
				type: 'POST',
				data: {
					north: boundingBoxNorth,
					east: boundingBoxEast,
					south: boundingBoxSouth,
					west: boundingBoxWest
				},
				dataType: 'json',
				success: addEarthquakeDataToModal,
				error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
			});
		}
	}]
});


function addWeatherStationsToMap(result) {
	
	let weatherDataArr = result['data']['weatherObservations'];
	//console.log(weatherDataArr);

	for (let i = 0; i < weatherDataArr.length; i++) {
		
		let weatherStationLatLng = L.latLng({lat: weatherDataArr[i]['lat'], lng: weatherDataArr[i]['lng']});

		let weatherStationName = weatherDataArr[i]['stationName'];
		let windSpeed = weatherDataArr[i]['windSpeed'];
		// let temperature = weatherDataArr[i]['temperature'];
		// let cloudDesciption = weatherDataArr[i]['clouds'];
		
		let weatherStationMarker = L.marker(weatherStationLatLng, {icon: weatherStationIcon});
		weatherStationMarker.bindPopup(`
			<div class="container mt-3">
			<h4 style="text-align: center; font-weight: bold;">${weatherStationName} <span><img style="height: 1.5em; width: 1.5em;" src='icons/weatherGifs/icons8-windsock.gif'></span></h4>
			<table class="table table-hover">
				<tbody>
					<tr>
						<th>Windspeed</th>
						<td>${windSpeed} Knots</td>
					</tr>
				</tbody>
			</table>
			</div>
		`).openPopup();
		weatherStationLayer.addLayer(weatherStationMarker);
	}
	
	weatherStationLayer.addTo(map);
}

weatherStationEasyButton = L.easyButton({
	states: [{
		icon: weatherIcon_fontAwesome,
		title: 'Wind Speed Report',
		onClick: function() {

			if (map.hasLayer(weatherStationLayer)) {
				
				weatherStationLayer.clearLayers();
				map.removeLayer(weatherStationLayer);

			} else {
				
				// get weather data.
				$.ajax({
					url: 'php/getWeather.php',
					type: 'POST',
					data : {
						north: boundingBoxNorth,
						east: boundingBoxEast,
						south: boundingBoxSouth,
						west: boundingBoxWest
					},
					dataType: 'json',
					success: addWeatherStationsToMap,
					error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
						console.log(jqXHR);
						console.log(textStatus);
						console.log(errorThrown);
					}
				});
			}
		}
	}]
});

//	add easyButtons to the map
countryInfoEasyButton.addTo(map);
currencyEasyButton.addTo(map);
covidEasyButton.addTo(map);
earthquakeEasyButton.addTo(map);
weatherStationEasyButton.addTo(map);

map.addControl(countryInfoSidebar);
map.addControl(exchangeRateSideBar);

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
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

//Highlight current country.
function setCountry(output) {
	startingCountryName = output['currentCountryData']['countryName'];
	startingCountryIso = output['currentCountryData']['countryCode'];

	//set current country indicator.
	$('#currentCountry').html(`${startingCountryName}`);

	//set input box to current country and update map.
	//console.log(startingCountryIso);
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
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
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
	//console.log(selectedCountryIso);

	/*search for the country in the feature collection who's ISO matches the ISO of the country selected*/
	countryFeature = result['countries']['features'].find(feature => {
		if (feature['properties']['iso_a2'] == selectedCountryIso) {
			return feature;
		}
	});

	if (border == undefined) {
		
		/*assign border object and style of the selected country to border*/
		border = L.geoJSON(countryFeature, {style: function () {
			return {color: 'crimson', weight: 2, fillOpacity: 0.25, fillColor: 'white'}
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
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

function formatWithCommas(value) {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function addDataToSideBar(result) {
	
	//console.log(result['data'][0]);
	//console.log(result['data'][0]['name']['common'] + ": " + result['status']['name']);

	//	Add country flag.
	$('#countryFlag').attr({
		src: `${result['data'][0]['flags']['png']}`,
	})

	//	Get country name.
	let countryName = result['data'][0]['name']['common'];
	
	if (result['data'] == undefined) {
		console.log('No info')
		//$('.countryName').html('No Information');
	} else {
		$('.countryName').html(countryName);
	}

	//	Get alt country names.
	$('#altSpellingsList').empty();
	let officialCountryName = result['data'][0]['name']['official'];
	$('#altSpellingsList').html(`${officialCountryName}`);

	//	Get iso2 code.
	$('#iso2').empty();
	let iso2 = result['data'][0]['altSpellings'];
	$('#iso2').append(`<li>${iso2[0]}</li>`);

	//	Get Region.
	let region = result['data'][0]['region'];
	$('#region').html(region);

	//	Get Subregion.
	let subregion = result['data'][0]['subregion'];
	$('#subregion').html(subregion);
	
	//	Get area.
	let area = result['data'][0]['area'];
	area = formatWithCommas(Number(area));
	$('#area').html(area + " Km²");

	//	Get capital.
	let capital = result['data'][0]['capital'][0];
	$('#capitalCity').html(capital);

	//	Get currencies.
	let currency = result['data'][0]['currencies'];
	currencyKey = Object.keys(currency)[0];
	let currencyKeyValue = currency[currencyKey];
	$('#currency').html(currencyKeyValue['name'] + ", " + `(${currencyKeyValue['symbol']})`)

	//	Get car driving side.
	let side = result['data'][0]['car']['side'];
	side = side[0].toUpperCase() + side.substring(1)
	$('#drivingSide').html(side);

	//	Get languages spoken.
	$('#languageList').empty();
	let languages = result['data'][0]['languages'];
	let languageKeys = Object.keys(languages);
	
	for (let i = 0; i < languageKeys.length; i++) {
		$('#languageList').append(`<li>${languages[languageKeys[i]]}</li>`);
	}

	//	Get Population.
	let population = result['data'][0]['population'];
	let populationFormatted = formatWithCommas(population)
	$('#population').html(populationFormatted);

	//	Get Countries Borderd.
	$('#countriesBorderedList').empty();

	let neighbouringCountries = result['data'][0]['borders'];
	
	if ('borders' in result['data'][0]) {
		$.ajax({
			url: 'php/getNeighbouringCountries.php',
			type: 'POST',
			dataType: 'json',
			data: {countriesBordered: neighbouringCountries},
			success: function(countries) {
				let borderingCountriesArr = countries['data'];
				for (let i = 0; i < borderingCountriesArr.length; i++) {
					$('#countriesBorderedList').append(`<li>${borderingCountriesArr[i]}</li>`);
				}
			},
			error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
		});
	} else {
		$('#countriesBorderedList').append(`<li>No bordered countries</li>`);
	}

	//this is the currently selected country's 3 letter country code (iso3).

	//	Get coat of arms.
	let coatOfArmsPNG = result['data'][0]['coatOfArms']['png'];

	if (result['data'][0]['coatOfArms'].length == 0) {
		$('#coatOfArmsImg').attr('src', null);
	} else {
		$('#coatOfArmsImg').attr('src', coatOfArmsPNG);
	}

}

function getCountrySidebarData() {

	let selectedCountryIso = $('#countryInput').val();

	$.ajax({
		url: 'php/getCountryInformation.php',
		type: 'POST',
		dataType: 'json',
		data: {selectedCountryIso},
		success: addDataToSideBar,
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});

}

function addPointsOfInterestToMap(result) {
	
	let pointsOfInterestArray = result['data']['geonames'];
	//console.log(pointsOfInterestArray);
	
	//remove previous marker layer if added from previous country selections.
	if (map.hasLayer(countryMarkers)) {
		countryMarkers.clearLayers();
	}

	for (let i = 0; i < pointsOfInterestArray.length; i++) {
		
		switch (pointsOfInterestArray[i]['feature']) {
			
			case 'landmark':
				let landmarkMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: landmarkIcon});
				landmarkMarker.bindPopup(`
					<h2 style="margin-bottom: 1em; text-align: center"><a style="text-decoration: none;" target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<h4 style="font-weight: bold; text-align: center;">Famous Landmark</h4>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(landmarkMarker);
			break;

			case 'city':
				let cityMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: cityIcon});
				cityMarker.bindPopup(`
					<h2 style="margin-bottom: 1em; text-align: center"><a style="text-decoration: none;" target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<h4 style="font-weight: bold; text-align: center;">City / Country</h4>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(cityMarker);
			break;

			case 'edu':
				let eduMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: educationIcon});
				eduMarker.bindPopup(`
					<h2 style="margin-bottom: 1em; text-align: center"><a style="text-decoration: none;" target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<h4 style="font-weight: bold; text-align: center;">Education Institution</h4>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(eduMarker);
			break;

			case 'airport':
				let airportMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: airportIcon});
				airportMarker.bindPopup(`
					<h2 style="margin-bottom: 1em; text-align: center"><a style="text-decoration: none;" target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<h4 style="font-weight: bold; text-align: center;">Major Airport</h4>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(airportMarker);
			break;
			
			default:
				let pointOfInterestMarker = L.marker([pointsOfInterestArray[i]['lat'], pointsOfInterestArray[i]['lng']], {icon: pointOfInterestIcon});
				pointOfInterestMarker.bindPopup(`
					<h2 style="margin-bottom: 1em; text-align: center"><a style="text-decoration: none;" target="_blank" href="https://${pointsOfInterestArray[i]['wikipediaUrl']}">${pointsOfInterestArray[i]['title']}</a></h2>
					<h4 style="font-weight: bold; text-align: center;">Point of Interest</h4>
					<p>${pointsOfInterestArray[i]['summary']}</p>
				`).openPopup();
				countryMarkers.addLayer(pointOfInterestMarker);
			break;
		}
	}

	map.addLayer(countryMarkers);

}

function setBoundingBox(result) {

	boundingBoxNorth = result['data']['north'];
	boundingBoxEast = result['data']['east'];
	boundingBoxSouth = result['data']['south'];
	boundingBoxWest = result['data']['west'];
	
	// console.log(boundingBoxNorth);
	// console.log(boundingBoxEast);
	// console.log(boundingBoxSouth);
	// console.log(boundingBoxWest);

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
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

function getWikiLinks() {
	
	let iso = $('#countryInput').val();
	//console.log(iso);
	
	$.ajax({
		url: 'php/getCountryData.php',
		type: 'POST',
		dataType: 'json',
		data: {countryCode: iso},
		success: setBoundingBox,
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

//	Initialise.
$(document).ready(function() {
	
	addCountriesToSelect();
	highlightCurrentCountry();

});



$('#countryInput').on('change', function() {

	if (map.hasLayer(weatherStationLayer)) {
		weatherStationLayer.clearLayers();
		map.removeLayer(weatherStationLayer)
		//weatherStationLayer = L.layerGroup();
	}

	//	sets countryCode to the selected country.
	currentCountryCode = $('#countryInput').val();

	getBorderData();
	getCountrySidebarData();
	getWikiLinks();

	currentCountryName = $('#countryInput option:selected').text();
	//	removes focus.
	//$('#countryInput').blur();

});

$('#resetLocation').on('click', function() {
	$('#countryInput').val(`${startingCountryIso}`).change();
});

$('#convertCurrencyBtn').on('click', function() {
	
	let fromCurrencyCode = $('#fromCurrencyNames').val();
	let fromCurrencyAmount = $('#fromCurrencyAmount').val();

	let toCurrencyCode  = $('#toCurrencyNames').val();

	fx.settings = { from: `${fromCurrencyCode}`, to: `${toCurrencyCode}` };
	let result = fx.convert(fromCurrencyAmount);
	result = result.toFixed(2);

	$('#conversionResultContainer').html(
		`${formatWithCommas(fromCurrencyAmount)} ${fromCurrencyCode}
		<br>converts to<br>
		${formatWithCommas(result)} ${toCurrencyCode}`
	);

});

function updateClickedCountry(result) {
	
	let countryClickedCode = result['data'];
			
	countryClickedCode = JSON.stringify(countryClickedCode);
	countryClickedCode = countryClickedCode.substring(1, 3);

	//	All lat/ lng coords that are located over water are returned by the Geonames CountryCode API as being located within Eritrea. Due to this limitation, Eritrea is not a country that can be selected by clicking on the map.
	if (countryClickedCode != 'ER') {
		//console.log(countryClickedCode);
		$('#countryInput').val(countryClickedCode).change();
	}

}

map.on('click', function(eventObject) {

	let latAtClick = eventObject['latlng']['lat'];
	let lngAtClick = eventObject['latlng']['lng'];
	
	$.ajax({
		url: 'php/getClickedCountryCode.php',
		type: 'POST',
		dataType: 'json',
		data: {
			lat: latAtClick,
			lng: lngAtClick
		},
		success: updateClickedCountry,
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
});

function addWeatherMarker(result) {
	
	let weatherData = result['data'];
	//console.log(weatherData);
	
	//	create location object.
	let latitudeAtLocation = weatherData['coord']['lat'];
	let longitudeAtLocation = weatherData['coord']['lon'];
	let weatherLocationObject = L.latLng({lat: latitudeAtLocation, lng: longitudeAtLocation});
	
	// create data variables.
	let location = weatherData['name'];
	let temperatureCelcius = weatherData['main']['temp'];
	temperatureCelcius = Math.round(temperatureCelcius);
	let dailyMinTemperature = weatherData['main']['temp_min'];
	dailyMinTemperature = Math.round(dailyMinTemperature);
	let dailyMaxTemperature = weatherData['main']['temp_max'];
	dailyMaxTemperature = Math.round(dailyMaxTemperature);
	
	let humidity = weatherData['main']['humidity'];
	
	let sunrise = weatherData['sys']['sunrise'];
	//	Create a new JavaScript Date object based on the unix timestamp
	//	multiplied by 1000 so that the argument is in milliseconds, not seconds.
	let sunriseTime = new Date(sunrise * 1000).toLocaleTimeString();
	
	let sunset = weatherData['sys']['sunset'];
	let sunsetTime =  new Date(sunset * 1000).toLocaleTimeString();
	
	//create marker.
	var weatherIcon = L.ExtraMarkers.icon({
		icon: 'fa-cloud-sun-rain',
		markerColor: 'black',
		iconColor: 'white',
		shape: 'circle',
		prefix: 'fa'
	});
	
	let weatherLocationMarker = L.marker(weatherLocationObject, {icon: weatherIcon});
	
	weatherLocationMarker.bindPopup(`
	<div class="container mt-3">
		<h4 style="font-weight: bold; text-align: center;">Local Weather</h4>
		<table class="table table-hover">
			<tbody>
				<tr>
					<th>Location</th>
					<td>${location}</td>
				</tr>
				<tr>
					<th>Coordinates</th>
					<td>${latitudeAtLocation}, ${longitudeAtLocation}</td>
				</tr>
				<tr>
					<th>Temperatures</th>
					<td><span style="color: blue;">${dailyMinTemperature}°</span> | ${temperatureCelcius}° | <span style="color: red;">${dailyMaxTemperature}°</span></td>
				</tr>
				<tr>
					<th>Humidity</th>
					<td>${humidity}%</td>
				</tr>
				<tr>
					<th>Sunrise</th>
					<td>${sunriseTime} (GMT)</td>
				</tr>
				<tr>
					<th>Sunset</th>
					<td>${sunsetTime} (GMT)</td>
				</tr>
			</tbody>
		</table>
	</div>
	`);

	/*
	weatherLocationMarker.bindPopup(`
	<h4 style="text-align: center; font-weight: bold;">Local Weather</h4>
	<br>
	<ul style="list-style-type: none; position: relative; margin: 0px; padding: 0px;">
		<li><span style="font-size: 1.1em;">Location: <span style="font-weight: bold;">${location}</span></span></li>
		<li><span style="font-size: 1.1em;">Latitude: <span style="font-weight: bold;">${latitudeAtLocation}</span></span></li>
		<li><span style="font-size: 1.1em;">Longitude: <span style="font-weight: bold;">${longitudeAtLocation}</span></span></li>
		<br>
		<li><span style="font-size: 1.1em;">Daily high: <span style="font-weight: bold; color: red;">${dailyMaxTemperature}°C</span></span></li>
		<li><span style="font-size: 1.1em;">Current Temperature: <span style="font-weight: bold;">${temperatureCelcius}°C</span></span></li>
		<li><span style="font-size: 1.1em;">Daily low: <span style="font-weight: bold; color: blue;">${dailyMinTemperature}°C</span></span></li>
		<br>
		<li><span style="font-size: 1.1em;">Humidity: <span style="font-weight: bold;">${humidity}%</span></span></li>
		<br>
		<li><span style="font-size: 1.1em;">Sunrise: <span style="font-weight: bold;">${sunriseTime} (GMT)</span></span></li>
		<li><span style="font-size: 1.1em;">Sunset: <span style="font-weight: bold;">${sunsetTime} (GMT)</span></span></li>
	</ul>
	<br>
	`);
	*/

	if (map.hasLayer(weatherLocationLayer)) {
		
		map.removeLayer(weatherLocationLayer);
		weatherLocationLayer.clearLayers();
		weatherLocationLayer.addLayer(weatherLocationMarker);
		weatherLocationLayer.addTo(map);
		weatherLocationMarker.openPopup();

	} else {
		
		weatherLocationLayer.addLayer(weatherLocationMarker);
		weatherLocationLayer.addTo(map);
		weatherLocationMarker.openPopup();
	}
}

map.on('contextmenu', function(eventObject) {

	let latAtRightClick = eventObject['latlng']['lat'];
	let lngAtRightClick = eventObject['latlng']['lng'];

	//console.log(latAtRightClick + ", " + lngAtRightClick);
	
	$.ajax({
		url: 'php/getWeatherAtLocation.php',
		type: 'POST',
		dataType: 'json',
		data: {
			lat: latAtRightClick,
			lng: lngAtRightClick
		},
		success: addWeatherMarker,
		error: function ajaxErrorFunction(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
});


