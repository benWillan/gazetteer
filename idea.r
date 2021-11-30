Function getcountries(){

	$.ajax(‘getgeoJSON.php’, function(){

		navigator.geolocation.getCurrentPosition(handleUserAcceptingLocation(position), function(){console.log(“user denied location”)})

	})
}

Function getUserCountry(lat, lng){

	$.ajax(‘linktogetcountrycodefromapi’, function(data){

		$(‘#yourselect’).val(data.ISOCode).change(); // activate the change so that it can automatically call the getCountryDetails

	})

}

Function handleUserAcceptingLocation(position){

	getUserCountry(position.coords.latitude, position.coords.longitude)

}

Function getCountryDetails(isocode){

	$.ajax(‘linktophproutinetogetcountrydata?isocode=’ + isocode, function(){

		//highlight your map and so forth

	})

}

$(document).ready(function(){

	$(‘yourselect’).on(“change”, function(){

		getCountryDetails($(this).val())

	})

	getCountries();

})