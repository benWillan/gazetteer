<?php
	$executionStartTime = microtime(true);
	
	$geoJSONData = file_get_contents("../data/countryBorders.geo.json");

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['geoJsonData'] = json_decode($geoJSONData);

	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
?>