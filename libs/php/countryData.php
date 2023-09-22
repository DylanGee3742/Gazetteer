<?php
//Returns only country Names and codes for populating dropdown

//Read data from countryBorder.geo.json file
$data = file_get_contents('../data/countryBorders.json');

//Decode JSON data into a php array 
$data_array = json_decode($data, true);

$features = $data_array['features'];

//Extract the name and iso_a2 properites from each feature
$countryData = array_map(function($feature) {
    $properties = $feature['properties'];
    return array(
        'name' => $properties['name'],
        'iso_a2' => $properties['iso_a2']
    );
}, $features);

//Encode the data as JSON and return it
header('Content-Type: application/json');
echo json_encode($countryData);

?>