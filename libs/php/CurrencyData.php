<?php

//Read data from countryBorder.geo.json file
$data = file_get_contents('../data/Common-Currency.json');

//Decode JSON data into a php array 
$data_array = json_decode($data, true);

//Encode back into JSON before returning to client
echo json_encode($data_array);

?>