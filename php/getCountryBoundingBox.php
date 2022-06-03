<?php
	$geonamesUsername = "bwillan88";

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	//data send from script.
	$north = $_REQUEST['north'];
	$east = $_REQUEST['east'];
	$south = $_REQUEST['south'];
	$west = $_REQUEST['west'];

	
	//UK TEST EXAMPLE.
	//http://api.geonames.org/wikipediaBoundingBoxJSON?north=59.36&south=49.902&east=1.7689&west=-8.6177&username=bwillan88
	
	//$url = "http://api.geonames.org/wikipediaBoundingBoxJSON?north=" . $north . "&south=" . $south . "&east=" . $east . "&west=" . $west . "&username=" . $geonamesUsername;
	
	//	api url.
	$url = "http://api.geonames.org/wikipediaBoundingBoxJSON?north=" . $_REQUEST['north'] . "&south=" . $_REQUEST['south'] . "&east=" . $_REQUEST['east'] . "&west=" . $_REQUEST['west'] . "&username=" . $geonamesUsername;
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$wikiLinks = json_decode($result, true);
	
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $wikiLinks;
	
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
?>