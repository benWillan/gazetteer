<?php
	$apiKey = "33dd0fdfa895c11af59fa6b96bbdeede";

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	//data send from script.
	$clickedLat = $_REQUEST['lat'];
	$clickedLng = $_REQUEST['lng'];

	//api url.
	$url = "http://api.openweathermap.org/data/2.5/weather?" . "lat=" . $clickedLat . "&lon=" . $clickedLng . "&units=metric" . "&appid=" . $apiKey;
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$weatherData = json_decode($result, true);
	
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $weatherData;
	
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
?>