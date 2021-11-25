$("document").ready(function() {

//draw map onto <div id="map"> element.
/////////////////////////////////////////////////////////////////////////////////////////////
	var myMap = L.map('map',
		{
			zoomSnap: 1,
			zoomDelta: 1,
			// animate: true,
			// duration: 5
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

//Determine current country, highlight borders and add country names to datalist.
/////////////////////////////////////////////////////////////////////////////////////////////	
	$.ajax({
		url: "php/getgeoJSON.php", 
		type: 'GET',
		dataType: 'json',
		success: function(geoJsonOutput) {	//get geo.json object from php data provider.
			function successCb(position) {
				
				let currentLat = position.coords.latitude;
				let currentLng = position.coords.longitude;
				
				$.ajax({
					url: "php/getCountryInfo.php", 
					type: 'POST',
					dataType: 'json',
					data: {
						lat: currentLat,
						lng: currentLng
					},
					success: function(countryInfoOutput) {	//countryInfoOutput is the array returned from the php request.
						
						let currentCountryName = countryInfoOutput['data']['countryName'];
						let geoJsonData = geoJsonOutput['geoJsonData'];
						
						let allCountryLayer = L.geoJSON(geoJsonData);								//create geoJSON object.
						allCountryLayer.setStyle({color: 'black', weight: 2, fill: true, fillOpacity: 0.01});	
						allCountryLayer.addTo(myMap);

						allCountryLayer.eachLayer(function (layer) {
							if (layer['feature']['properties']['name'] == currentCountryName) {
								let homeCountry = layer;
								homeCountry.setStyle({color: 'purple', fill: true, fillOpacity: 0.25});
							}
						});

						myMap.fitBounds([
							[57.712, -7],
							[49.774, -1]
						], );

						allCountryLayer.on('click', function click(e) {
							allCountryLayer.setStyle({color: 'black', weight: 2, fill: true, fillOpacity: 0.01});
							let clickedCountryId = e['layer']['_leaflet_id'];
							let countryLayer = allCountryLayer.getLayer(clickedCountryId);
							countryLayer.setStyle({color: 'red', fill: true, fillOpacity: 0.25});
						});
					},
					error: function(jqXHR, textStatus, errorThrown) {
						// your error code
					}
				});

			};
		
			function errorCb(errorMsg) {
				console.log(errorMsg);
			};
		
			navigator.geolocation.getCurrentPosition(successCb, errorCb)
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
		
	});
	
	

//Add border of selected country from datalist.
/////////////////////////////////////////////////////////////////////////////////////////////	
	$('#countriesInput').on('change', function() {
		//remove layers
		$.ajax({
			url: "php/getgeoJSON.php", 
			type: 'GET',
			dataType: 'json',
			success: function(geoJsonOutput) {	//get geo.json object from php data provider.
				let geoJsonData = geoJsonOutput['geoJsonData'];

				let selectedCountry = L.geoJSON(geoJsonData, {onEachFeature: function(feature, layer) {
					if ($('#countriesInput').val() == feature['properties']['name']) {
						return layer;
					}
				}});
				selectedCountry.addTo(myMap);
				// myMap.fitBounds(layer.getBounds());
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		});
	});
});