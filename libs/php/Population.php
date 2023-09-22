<?php
$curl = curl_init();

$url = "https://api.api-ninjas.com/v1/country?name=" . $_REQUEST['formattedName'] ;

$headers = array(
    'X-Api-Key: SECRET',
    'Content-Type: application/json'
);

curl_setopt_array($curl, array(
    CURLOPT_URL => $url,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo 'Error: ' . $err;
} else {
    echo $response;
}

?>
