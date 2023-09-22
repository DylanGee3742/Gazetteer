<?php

//Initiate error reporting so can run routine directly in browser and see all outputs, including errors
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

//API url concat with ajax calls params
$url = 'http://api.geonames.org/wikipediaBoundingBox?north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] .  '&maxRows=10'. '&username=SECRET';

//Initate cURL object and set params
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

//Execute cURL and store results in $results
$result = curl_exec($ch);

curl_close($ch);

//Load the XML string into a SimpleXMLElement object
$xml = simplexml_load_string($result); 

//Convert the SimpleXMLElement object to a JSON string
$json = json_encode($xml);
//Convert the JSON string to an associative array
$data = json_decode($json, true); 

//Append details of response
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";	
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $data;
	
//response from JSON stored into data element of $output
//$output converted to JSON before sending
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
