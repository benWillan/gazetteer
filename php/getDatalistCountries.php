<?php
	
	$string = file_get_contents("../data/countryBorders.geo.json");
	$json_array = json_decode($string, true);
	$countries = array();

	foreach($json_array['features'] as $value) {
		array_push($countries, $value['properties']['name']);
	}
	
	header('Content-Type: application/json; charset=UTF-8');
	sort($countries);
		
	echo json_encode($countries);
		
?>