<?php

//Initiate error reporting so can run routine directly in browser and see all outputs, including errors
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

//API url concat with ajax calls params
$url = 'https://restcountries.com/v3.1/alpha/'. $_REQUEST['code'] . '?access_key=SECRET';

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

//response from JSON stored into data element of $output
//$output converted to JSON before sending
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode;
	
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
