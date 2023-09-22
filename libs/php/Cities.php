<?php

//  error reporting when the routine is called from a browser, eg:


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// set the return header

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$executionStartTime = microtime(true);

// $_REQUEST is used initially because it accepts parameters passed as both $_POST and $_GET
// (for when the routine is called directly from the browser as per the example above).
// Replace with $_POST once you are sure that the routine is stable.

$ch = curl_init();

curl_setopt_array($ch, [
	CURLOPT_URL => "https://countries-cities.p.rapidapi.com/location/country/". $_REQUEST['iso_a2'] . "/city/list?per_page=20&population=300000",
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"X-RapidAPI-Host: countries-cities.p.rapidapi.com",
		"X-RapidAPI-Key: SECRET"
	],
]);

$result = curl_exec($ch);

$cURLERROR = curl_errno($ch);

curl_close($ch);

if ($cURLERROR) {

    $output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
    $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
    $output['data'] = null;

} else {

    // serialise the cURL result to an associative array so that it can be
    // tested for valid content before it is appended to the output array

    $cities = json_decode($result, true);

    if (json_last_error() !== JSON_ERROR_NONE) {

        $output['status']['code'] = json_last_error();
        $output['status']['name'] = "Failure - JSON";
        $output['status']['description'] = json_last_error_msg();
        $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
        $output['data'] = null;

    } else {

        // has the api returned an error?

        if (isset($cities['error'])) {

            $output['status']['code'] = $cities['error']['code'];
            $output['status']['name'] = "Failure - API";
            $output['status']['description'] = $cities['error']['message'];
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = null;

        } else {

            $finalResult = [];

            foreach ($cities['cities'] as $item) {

                  $city['name'] = $item['name'];
                  $city['latitude'] = $item['latitude'];
                  $city['longitude'] = $item['longitude'];

            array_push($finalResult, $city);

            }

            $output['status']['code'] = 200;
            $output['status']['name'] = "success";
            $output['status']['description'] = "all ok";
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = $finalResult;

        }

    }

}

echo json_encode($output, JSON_NUMERIC_CHECK);

?>
