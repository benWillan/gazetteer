<?php
	#Returns border of selected country.

	$executionStartTime = microtime(true);
	
	$countryBordersGeoJson = file_get_contents("../data/countryBorders.geo.json");
	$geoJsonBorderCoords = json_decode($countryBordersGeoJson, true);

	print_r($geoJsonBorderCoords['features'][0]['geometry']['coordinates']);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['countries'] = $countriesArr;

	// header('Content-Type: application/json; charset=UTF-8');
	// echo json_encode($output);
?>