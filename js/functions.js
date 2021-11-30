//Add countries to datalist.
export function populateDatalist(countriesArr) {
	countriesArr['countries'].forEach(country => {
		$('#countriesDatalist').append(`
			<option value="${country['name']}">
				${country['name']}
			</option>`)
	});
}

export function addCountriesToDatalist() {
	$.ajax({
		url: "php/getCountryNamesAndISOs.php",
		type: "GET",
		dataType: "json",
		success: populateDatalist,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

//Highlight current country.
export function setCountry(output) {
	let currentCountryName = output['currentCountryData']['countryName'];
	$('#currentCountry').html(`${currentCountryName}`);
}

export function errorCallback(errorMsg) {
	console.log(errorMsg);
}

export function getCurrentCountry(position) {
	
	let currentLat = position.coords.latitude;
	let currentLng = position.coords.longitude;

	$.ajax({
		url: "php/getCurrentCountry.php",
		type: "POST",
		data: {lat: currentLat, lng: currentLng},
		datType: "json",
		success: setCountry,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

export function highlightCurrentCountry() {
	navigator.geolocation.getCurrentPosition(getCurrentCountry, errorCallback);
}