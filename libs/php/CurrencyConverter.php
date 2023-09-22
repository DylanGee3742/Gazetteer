<?php

//Initiate cURL session
$curl = curl_init();

//Set options for cURL session
curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.apilayer.com/fixer/convert?to=" . $_REQUEST['to'] ."&from=" . $_REQUEST['from'] . '&amount=' . $_REQUEST['amount'] ,
  CURLOPT_HTTPHEADER => array(
    "Content-Type: text/plain",
    "apikey: SECRET"
  ),
  CURLOPT_RETURNTRANSFER => true, //Indicates whether to return response as a string from curl_exec()
  CURLOPT_ENCODING => "", //Encdoing format to use for response
  CURLOPT_MAXREDIRS => 10, //Max number of redirects to follow before giving up
  CURLOPT_TIMEOUT => 0, //Max time in seconds to wait for response from server
  CURLOPT_FOLLOWLOCATION => true, //Indicate whether to follow any location headers in response
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, //HTTP protocol version to use
  CURLOPT_CUSTOMREQUEST => "GET" //Method in use
));

//Execute the cURL session
$response = curl_exec($curl);

//Close cURL session
curl_close($curl);

//Output response to browser
echo $response;

?>
