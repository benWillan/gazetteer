$("document").ready(function() {

	//draw map onto <div> element.
	/////////////////////////////////////////////////////////////////////////////////////////////
	var myMap = L.map('map',{
		//worldCopyJump: true
	});

	myMap.setView([51.505, -0.09], 1);

	var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 18,
		ext: 'png'}
	).addTo(myMap);

	// var OpenTopoMap = L.tileLayer(
	// 	'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
	// 	{
	// 		maxZoom: 17,
	// 		attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	// 	}
	// ).addTo(myMap);
	
	//Re-order functions	//NOTE: L.latLng method can be used instead.
	/////////////////////////////////////////////////////////////////////////////////////////////
	function reorderMultiPolygonArray(arrToReorder) {
		
		let numOfPolygonArrays = arrToReorder.length;

		for(let i = 0; i < numOfPolygonArrays; i++) {
			for(let j = 0; j < arrToReorder[i][0].length; j++) {
				arrToReorder[i][0][j].reverse();
			}
		}
		return arrToReorder;
	};

	function reorderPolygonArray(arrToReorder) {

		for(let i = 0; i < arrToReorder[0].length; i++) {
			arrToReorder[0][i].reverse();
		}
		return arrToReorder;
	};
	
	//Get Country Border function.
	/////////////////////////////////////////////////////////////////////////////////////////////
	let currentCountry;
	let newCountry;

	function getCountryBorder(countryCode) {
		$.ajax({
			url: "php/getBorderCoords.php", 
			type: 'POST',
			dataType: 'json',
			data: {
				ISO2: countryCode
			},
			success: function(countryJSON) {

				if (countryJSON['geometry']['type'] == 'MultiPolygon') {
					let reversedCoordsArr = reorderMultiPolygonArray(countryJSON['geometry']['coordinates']);
					polygon = L.polygon(reversedCoordsArr, {color: 'purple'}).addTo(myMap);
					myMap.fitBounds(polygon.getBounds());
					
				} else if (countryJSON['geometry']['type'] == 'Polygon') {
					let reversedCoordsArr = reorderPolygonArray(countryJSON['geometry']['coordinates']);
					let polygon = L.polygon(reversedCoordsArr, {color: 'purple'}).addTo(myMap);
					myMap.fitBounds(polygon.getBounds());
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		});
	};
	
	//Initialise location on load.
	/////////////////////////////////////////////////////////////////////////////////////////////
	const successCB = (position) => {

		let currentLat = position.coords.latitude;
		let currentLong = position.coords.longitude;

		$.ajax({
			url: "php/getCountryInfo.php", 
			type: 'POST',
			dataType: 'json',
			data: {
				lat: currentLat,
				lng: currentLong
			},
			success: function(data) {
				//console.log(JSON.stringify(data['data']['countryCode']));
				getCountryBorder(data['data']['countryCode']);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				//error code
			}
		});
	};
	
	const errorCB = (error) => {
		console.log(error);
	};

	function initialiseLocation() {
		navigator.geolocation.getCurrentPosition(successCB, errorCB);
	};

	initialiseLocation();
	
	//Read geo.json file and add coutries to <datalist>.
	/////////////////////////////////////////////////////////////////////////////////////////////
	$.ajax({
		url: "php/getDatalistCountries.php",
		type: 'GET',
		dataType: 'json',
		success: function(result) {
			//console.log(JSON.stringify(result));
			for (let i = 0; i < result.length; i++) {
				$("#countriesDL").append(`<option value="${result[i]}">`);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	});

	//Update location with input box selected country.
	/////////////////////////////////////////////////////////////////////////////////////////////
	$('#countriesInput').change(function () {
		let countryName = $('#countriesInput').val();
		
		$.ajax({
			url: "php/getCountryCode.php",
			type: 'GET',
			dataType: 'json',
			data: {
				countryName
			},
			success: function(countryCodeJSON) {
				//console.log(countryCodeJSON);
				//var myMap = L.map('map').setView([51.505, -0.09], 1);
				
				getCountryBorder(countryCodeJSON);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				//error code
			}
		});
	});

	$('#resetLocation').click(function() {
		myMap.flyTo([53.505, -1.5], 5);
		//polygon.remove();
	});

	$('#findLocation').click(function() {
		
		const successCB = (position) => {
			let currentLat = position.coords.latitude;
			let currentLong = position.coords.longitude;

			let currentLocationMarker = L.marker([currentLat, currentLong]);
			currentLocationMarker.addTo(myMap);

			console.log(currentLat + ", " + currentLong);
		};

		const errorCB = (error) => {
			console.log(error);
		};
		
		navigator.geolocation.getCurrentPosition(successCB, errorCB);
		// myMap.locate({setView: true});
		// myMap.on('locationfound', function(locationData) {
		// 	let lat = locationData.latlng.lat;
		// 	let lng = locationData.latlng.lng;
		// 	let currentLocationMarker = L.marker([lat, lng]).addTo(myMap);
		// 	//console.log(currentLocationMarker.getLatLng())
		// });
	});

	myMap.on('click', function(ev) {
		console.log(`Lat: ${ev.latlng.lat} Long: ${ev.latlng.lng}`); // ev is an event object (MouseEvent in this case)
	});


});
	