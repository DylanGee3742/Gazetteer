<?php

//Initiate error reporting so can run routine directly in browser and see all outputs, including errors
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

//API url concat with ajax calls params
$url = 'http://api.geonames.org/earthquakesJSON?north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=SECRET';

//Initate cURL object and set params
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

//Execute cURL and store results in $results
$result=curl_exec($ch);

curl_close($ch);

//Decode results from JSON to append to $output variable
$decode = json_decode($result, true);


//Append details of response
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";	
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode;
	
//response from JSON stored into data element of $output
//$output converted to JSON before sending
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
