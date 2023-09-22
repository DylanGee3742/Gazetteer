<?php
//PHP routine to extract countries and returns only the required country name and Iso code 


//Read data from countryBorder.geo.json file
$data = file_get_contents('../data/countryBorders.json');

//Decode JSON data into a php array 
$data_array = json_decode($data, true);


$features = $data_array['features'];


for ($i = 0; $i < count($features); $i++) {

    $properties = $features[$i]['properties'];
    $name = $properties['name'];
    $iso_a2 = $properties['iso_a2'];

    if ($iso_a2 === $_REQUEST['iso_a2']) {

        echo json_encode([$name, $iso_a2]);

        break;
    };
};


?>