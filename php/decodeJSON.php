<?php
	
	$string = file_get_contents("../data/countryBorders.geo.json");
	$json_a = json_decode($string, true);
	$countries = array();

	foreach($json_a['features'] as $value) {
		array_push($countries, $value['properties']['name']);
	}
	
	//header('Content-Type: application/json; charset=UTF-8');
	sort($countries);
		
	echo json_encode($countries);
	##clickytyping superstar coder bunny loves snowie snowie wants secy time soon!! watch me coding in my own little world :P im hackiug hacking away mawahahaha i want to take over the world mwahahaha enter # jps/(>5+£$^$) = kdjhu dgd okj
	
?>