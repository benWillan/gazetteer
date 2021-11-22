<?php
	
	$string = file_get_contents("../data/countryBorders.geo.json");
	$json_array = json_decode($string, true);
	$countryName = $_REQUEST['countryName'];	//country name string value from the input box.
	//$testISO = "BS";
	
	//could be improved with an associative array search method?
	foreach($json_array['features'] as $countryObj) {
		if ($countryObj['properties']['name'] == $countryName) {
			//print_r($countryObj);
			header('Content-Type: application/json; charset=UTF-8');
			echo json_encode($countryObj['properties']['iso_a2']);
			//echo json_encode($countryObj);
		}
	}
	
			
	//echo json_encode($json_array['features'][0]['properties']['name']);
?>