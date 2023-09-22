<?php


//  error reporting when the routine is called from a browser, eg:


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// set the return header

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$executionStartTime = microtime(true);

//Initalise cURL session
$ch = curl_init();


//Set optiosn for cURL session
curl_setopt_array($ch, [
	CURLOPT_URL => "https://opentripmap-places-v1.p.rapidapi.com/en/places/bbox?lon_max=" . $_REQUEST['east'] . "&lat_min="  . $_REQUEST['south'] . "&lon_min=" . $_REQUEST['west'] . "&lat_max=" . $_REQUEST['north'],
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"X-RapidAPI-Host: opentripmap-places-v1.p.rapidapi.com",
		"X-RapidAPI-Key: SECRET"
	],
]);

//Execute cURL session
$result = curl_exec($ch);

//if cURL error then set it to $err
$cURLERROR = curl_errno($ch);

//Close cURL session
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

    $attractions = json_decode($result, true);

    if (json_last_error() !== JSON_ERROR_NONE) {

        $output['status']['code'] = json_last_error();
        $output['status']['name'] = "Failure - JSON";
        $output['status']['description'] = json_last_error_msg();
        $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
        $output['data'] = null;

    } else {

        // has the api returned an error?

        if (isset($attractions['error'])) {

            $output['status']['code'] = $attractions['error']['code'];
            $output['status']['name'] = "Failure - API";
            $output['status']['description'] = $attractions['error']['message'];
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = null;

        } else {

            $finalResult = [];

            foreach ($attractions['features'] as $feature) {

				$kinds = $feature['properties']['kinds'];

                //If string contains these keywords, then add them to the response
				if (strpos($kinds, 'monuments_and_memorials') !== false || strpos($kinds, 'railway_stations') !== false) {

                  $attraction['kind'] = $feature['properties']['kinds'];
                  $attraction['name'] = $feature['properties']['name'];
                  $attraction['latitude'] = $feature['geometry']['coordinates'][1];
                  $attraction['longitude'] = $feature['geometry']['coordinates'][0];

				  array_push($finalResult, $attraction);

				}

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
