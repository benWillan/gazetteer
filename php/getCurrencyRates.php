<?php
	//api key.
	$apiKey = "ce0a99fccc974d72b4ebb44663d0a48f";

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	//api url.
	$url = "https://openexchangerates.org/api/latest.json?app_id=" . $apiKey;
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$currencyRates = json_decode($result, true);
	
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $currencyRates;
	
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
?>