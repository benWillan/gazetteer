<?php

	$executionStartTime = microtime(true);
	
	$iso3Json = file_get_contents('../data/slim-3.json');
	$iso3JsonDecoded = json_decode($iso3Json, true);

	//neightbouring countries array.
	$neighbouringCountryCodes = $_REQUEST['countriesBordered'];

	$countries = array();
	
	foreach($iso3JsonDecoded as $countryAsCode) {
		foreach($neighbouringCountryCodes as $countryCodeToCompare) {
			if ($countryCodeToCompare == $countryAsCode['alpha-3']) {
				array_push($countries, $countryAsCode['name']);
			}
		}
	}

	//print_r($countries);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $countries;
	
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
?>