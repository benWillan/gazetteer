$("document").ready(function() {

	//draw map onto <div> element.
	
	var mymap = L.map('map').setView([51.505, -0.09], 4);
	
	var OpenTopoMap = L.tileLayer(
		'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
		{
			maxZoom: 17,
			attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		}
	).addTo(mymap);
	
	//var marker = L.marker([51.5, -0.09]).addTo(mymap);
		
	/*
	// create a red polygon from an array of LatLng points
	var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];

	var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);

	// zoom the map to the polygon
	map.fitBounds(polygon.getBounds());
	*/

	//Re-order functions
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

	//Onload locate device function.


	//retrieve lat/lng co-ords of user.
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
			success: function(result) {
				//console.log(JSON.stringify(result['data']['countryCode']));
				function getCountryBorder(result) {
					$.ajax({
						url: "php/getBorderCoords.php", 
						type: 'POST',
						dataType: 'json',
						data: {
							//ISO2: "IN", //test
							ISO2: result['data']['countryCode']
						},
						success: function(countryJSON) {
							//console.log(countryJSON);
							//console.log(JSON.stringify(countryJSON['geometry']['coordinates'].length));
							//console.log(JSON.stringify(countryJSON['geometry']['type']));
							
							if (countryJSON['geometry']['type'] == 'MultiPolygon') {
								let reversedCoordsArr = reorderMultiPolygonArray(countryJSON['geometry']['coordinates']);
								let polygon = L.polygon(reversedCoordsArr, {color: 'purple'}).addTo(mymap);
							} else if (countryJSON['geometry']['type'] == 'Polygon') {
								let reversedCoordsArr = reorderPolygonArray(countryJSON['geometry']['coordinates']);
								let polygon = L.polygon(reversedCoordsArr, {color: 'purple'}).addTo(mymap);
							}
							
						},
						error: function(jqXHR, textStatus, errorThrown) {
							// your error code
						}
					});
				};
				getCountryBorder(result);
				
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		});
	};
	
	const errorCB = (error) => {
		console.log(error);
	};

	//initialise location on load.
	navigator.geolocation.getCurrentPosition(successCB, errorCB);
	
	//read geo.json file and add coutries to <datalist>.
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

	
		
});
	