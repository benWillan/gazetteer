$("document").ready(function() {

	//draw map onto <div> element.
	
	var mymap = L.map('map').setView([51.505, -0.09], 2);
	
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

	//Re-order function
	function reorderArray(arrToSort) {
		let numOfPolygonArrays = arrToSort.length;
		
		for(let i = 0; i < numOfPolygonArrays; i++) {
			for(let j = 0; j < arrToSort[i][0].length; j++) {
				arrToSort[i][0][j].reverse();
			}
		}
		return arrToSort;
	}

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
				
				$.ajax({
					url: "php/getBorderCoords.php", 
					type: 'POST',
					dataType: 'json',
					data: {
						ISO2: result['data']['countryCode']
					},
					success: function(countryJSON) {
						let reversedCoordsArr = reorderArray(countryJSON['geometry']['coordinates']);
						
						let polygon = L.polygon(reversedCoordsArr, {color: 'purple'}).addTo(mymap);
						//let polygon = L.polygon(countryJSON['geometry']['coordinates'][0][0], {color: 'purple'}).addTo(mymap);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						// your error code
					}
				});
				
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		});
	};
	
	const errorCB = (error) => {
		console.log(error);
	};
	
	//first method in script that is run.
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
	