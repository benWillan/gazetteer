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

	
	$.ajax({
		url: "php/getgeoJSON.php", 
		type: 'GET',
		dataType: 'json',
		data: {},
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
					success: function(countryInfoOutput) {	//get current country name.
						let currentCountryName = countryInfoOutput['data']['countryName'];
						let geoJsonData = geoJsonOutput['geoJsonData'];
						
						let geoJsonLayer = L.geoJSON(geoJsonData, {onEachFeature: function(feature, layer) {

							if (currentCountryName == feature['properties']['name']) {
								let currentCountryLayer = layer;
								currentCountryLayer.addTo(myMap);
							}

						}});
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
	
//draw map onto <div> element.
/////////////////////////////////////////////////////////////////////////////////////////////

});
	