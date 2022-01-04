<?php
	#Returns all country names as JSON object.

	$executionStartTime = microtime(true);
	
	$countryBordersGeoJson = file_get_contents("../data/countryBorders.geo.json");
	$geoJsonArr = json_decode($countryBordersGeoJson, true);
	sort($geoJsonArr['features']);

	$numOfCountries = count($geoJsonArr['features']);
	$countriesArr = array();

	for($i = 0; $i < $numOfCountries; $i++) {
		$countriesArr[$i]['name'] = $geoJsonArr['features'][$i]['properties']['name'];
		$countriesArr[$i]['iso'] = $geoJsonArr['features'][$i]['properties']['iso_a2'];
	}

	// foreach($countriesReturned['geonames'] as $country) {
	// 	if ($country['countryCode'] == $iso) {
	// 		$countryReturned = $country;
	// 	}
	// }

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['countries'] = $countriesArr;

	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
?>