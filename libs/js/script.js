//Global variables
let exchangeCurrency = '';
let border;

var streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

var map = L.map('map', {
  maxBounds: [
    [-90, -180],
    [90, 180]
  ],
  minZoom: 3,
  layers: [streets]
}).setView([54.5, -4], 6);


var cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: '#fff',
    color: '#000',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
})

var trainStations = L.markerClusterGroup({
  polygonOptions: {
    fillColor: '#fff',
    color: '#000',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
})

var airports = L.markerClusterGroup({
  polygonOptions: {
    fillColor: '#fff',
    color: '#000',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
})

var monuments = L.markerClusterGroup({
  polygonOptions: {
    fillColor: '#fff',
    color: '#000',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
})

var webCams = L.markerClusterGroup({
  polygonOptions: {
    fillColor: '#fff',
    color: '#000',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
})

// var parks = L.markerClusterGroup({
//   polygonOptions: {
//     fillColor: '#fff',
//     color: '#000',
//     weight: 2,
//     opacity: 1,
//     fillOpacity: 0.5
//   }
// })

// var bars = L.markerClusterGroup({
//   polygonOptions: {
//     fillColor: '#fff',
//     color: '#000',
//     weight: 2,
//     opacity: 1,
//     fillOpacity: 0.5
//   }
// })


var overlays = {
  "Train Stations": trainStations,
  "Monuments": monuments,
  "Airports": airports,
  "Major cities": cities,
  "Webcams": webCams
}

var layerControl = L.control.layers(basemaps, overlays).addTo(map);

//Ajax-Calls
async function getWebcams(iso_a2) {
  try {

    const response = await $.ajax({
      url: "libs/php/Webcams.php",
      method: "POST",
      dataType: "JSON",
      data: {
        iso_a2: iso_a2
      }
    });

    const webcamIcon = L.ExtraMarkers.icon({
      icon: 'fa-video',
      iconColor: 'black',
      markerColor: 'white',
      shape: 'square',
      prefix: 'fa'
    });


    response.data.map(webcam => {

      const selectOptions = ` 
      <option value=${webcam.player.day.embed}>Day</option>
      <option value=${webcam.player.month.embed}>Month</option>
      <option value=${webcam.player.year.embed}>Year</option>
      <option value=${webcam.player.lifetime.embed}>Lifetime</option>`

      if (webcam.player.live.available) {
        L.marker([webcam.latitude, webcam.longitude], { icon: webcamIcon })

          .bindPopup(`<iframe id="webcam-iframe-live" src="${webcam.player.live.embed}" title="Windy webcam"></iframe>

      <select id="iframe-select-live" class="form-select-sm" onchange="$('#webcam-iframe').attr('src', this.value)"> 
      <option value="${webcam.player.live.embed}">Live</option>
      ${selectOptions}
      </select>`)
          .addTo(webCams);


      } else {

        L.marker([webcam.latitude, webcam.longitude], { icon: webcamIcon })

          .bindPopup(`<iframe id="webcam-iframe" src="${webcam.player.day.embed}" title="Windy webcam"></iframe> 

      <select id="iframe-select" class="form-select-sm" onchange="$('#webcam-iframe').attr('src', this.value)">
      ${selectOptions}
      </select>`)
          .addTo(webCams);

      }

    });


  } catch (e) {
    console.log(e);
  }
}

async function getCities(iso_a2) {
  try {
    const response = await $.ajax({
      url: "libs/php/Cities.php",
      method: "POST",
      dataType: "JSON",
      data: {
        iso_a2: iso_a2
      }
    });
    //Create an icon to layer on map 
    const cityIcon = L.ExtraMarkers.icon({
      icon: 'fa-city',
      iconColor: 'black',
      markerColor: 'white',
      shape: 'square',
      prefix: 'fa'
    });

    response.data.map(city => {
      L.marker([city.latitude, city.longitude], { icon: cityIcon })
        .bindTooltip(city.name, { direction: 'top', sticky: true })
        .addTo(cities)
    })

    cities.addTo(map);

  } catch (e) {
    console.log(e);
  }
}

async function getAirports(iso_a2) {
  try {
    const response = await $.ajax({
      url: "libs/php/Airports.php",
      method: "POST",
      dataType: "JSON",
      data: {
        iso_a2: iso_a2
      }
    });


    //Create an icon to layer on map 
    const planeIcon = L.ExtraMarkers.icon({
      icon: 'fa-plane',
      iconColor: 'black',
      markerColor: 'white',
      shape: 'square',
      prefix: 'fa'
    });

    response.data.map(airport => {
      L.marker([airport.latitude, airport.longitude], { icon: planeIcon })
        .bindTooltip(airport.name, { direction: 'top', sticky: true })
        .addTo(airports)
    })

    airports.addTo(map);

  } catch (e) {
    console.log(e);
  }
}

async function getCovidData(iso_a2) {
  try {
    const countryName = await getNameIso(iso_a2);
    let formattedName = '';

    switch (countryName) {
      case 'United Kingdom':
        formattedName = 'UK';
        break;
      case 'United States':
        formattedName = 'USA';
        break;
      case 'United Arab Emirates':
        formattedName = 'UAE';
        break;
      case 'Dominican Rep.':
        formattedName = 'DRC';
        break;
      case 'Central African Rep.':
        formattedName = 'CAR';
        break;
      default:
        formattedName = countryName.replace(/\s+/g, '-');
        break;
    }

    const response = await $.ajax({
      url: "libs/php/Covid.php",
      method: "POST",
      dataType: "JSON",
      data: {
        formattedName
      }
    });

    const res = response.response[0];
    const cases = res ? res.cases : $('#total').text(`N/A`);
    $('#active').text(`N/A`);
    $('#recovered').text(`N/A`);
    $('#deaths').text(`N/A`);
    $('#tests').text(`N/A`);
    const active = cases.active ? cases.active.toLocaleString() : 'N/A';
    const recovered = cases.recovered ? cases.recovered.toLocaleString() : 'N/A';
    const total = cases.total ? cases.total.toLocaleString() : 'N/A';
    const deaths = res.deaths.total ? res.deaths.total.toLocaleString() : 'N/A';
    const tests = res.tests.total ? res.tests.total.toLocaleString() : 'N/A';


    $('#total').text(`${total}`);
    $('#active').text(`${active}`);
    $('#recovered').text(`${recovered}`);
    $('#deaths').text(`${deaths}`);
    $('#tests').text(`${tests}`);


  } catch (e) {
    console.log(e);
  }
};

async function getPopulationData(iso_a2) {

  const countryName = await getNameIso(iso_a2);
  let formattedName = '';

  formattedName = countryName.replace(/\s+/g, '%20');

  try {
    const response = await $.ajax({
      url: "libs/php/Population.php",
      method: "POST",
      dataType: "JSON",
      data: {
        formattedName
      }
    });

    const res = response[0];
    const fertility = res ? res.fertility : 'N/A';
    const internet_users = res ? res.internet_users : 'N/A';
    const life_expectancy_female = res ? res.life_expectancy_female : 'N/A';
    const life_expectancy_male = res ? res.life_expectancy_male : 'N/A';
    const unemployment = res ? res.unemployment : 'N/A ';

    $('#fertility').text(`${fertility} per woman`);
    $('#internet_users').text(`${internet_users}%`);
    $('#life_expectancy_female').text(`${life_expectancy_female} years`);
    $('#life_expectancy_male').text(`${life_expectancy_male} years`);
    $('#unemployment').text(`${unemployment}%`);


  } catch (e) {
    console.log(e);
  }
}


async function getGeomtry(iso_a2) {
  try {

    if (border) {
      map.removeLayer(border);
    }

    const response = await $.ajax({
      url: "libs/php/Geometry.php",
      method: "POST",
      dataType: "JSON",
      data: {
        iso_a2
      }
    });

    let geoJSON;

    if (response.type === 'MultiPolygon') {
      geoJSON = {
        "type": "MultiPolygon",
        "coordinates": response.coordinates
      };
    } else {
      geoJSON = {
        "type": "Polygon",
        "coordinates": response.coordinates
      };
    }


    //Create border layer
    border = L.geoJSON(geoJSON, {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0
    }).addTo(map);

    //Get the bounds of country and set the map to zoom on that country
    const bounds = border.getBounds();
    map.fitBounds(bounds);

    const latLng = getCenter(bounds);

    return { bounds, latLng };

  } catch (e) {
    console.log(e);
    throw e;
  }
}

//This function sends a POST request to fixer API which allows the user to convert a choosen currency into the currency of the currently selected country
//It takes the currency of selected country as a param
//The currency value is obtained from the getData response
async function currencyExchange(currency = "GBP", fromCurrency = 'USD', amount = 1) {

  try {
    //If no amount is entered, terminate function 
    if (amount === '') {
      alert('Please enter a value');
      return;
    }

    //Show loading
    $('.loader').show();

    //Send ajax request to php routine
    const response = await $.ajax({
      url: "libs/php/CurrencyConverter.php",
      method: "POST",
      dataType: "JSON",
      data: {
        to: currency,
        from: fromCurrency,
        amount: amount,
      }
    });

    //Save response in query variable
    const query = response.query;

    //Set HTML to response
    $('#result').text(`${query.amount} ${query.from} = ${response.result} ${query.to}`);
    $('#exchange-rate').text(`Exchange rate: ${(query.amount / response.result).toFixed(2)}\u0025`)

    //Hide loading
    $('.loader').hide();

  } catch (err) {
    console.log(err);
    throw err;
  };
};

//This function returns an array of attractions for a given country
//It takes the countries bounds as a param
//This value is obtained from the getData function
async function getAttractions(bounds) {
  //Set the bounds variables
  const northEast = bounds._northEast;
  const southWest = bounds._southWest;

  try {

    //Send ajax request to php routine
    const response = await $.ajax({
      url: "libs/php/Attractions.php",
      method: "POST",
      dataType: 'JSON',
      data: {
        north: northEast.lat,
        south: southWest.lat,
        east: northEast.lng,
        west: southWest.lng
      }
    });

    //Create an icon to layer on map and locate monuments
    const monumentIcon = L.ExtraMarkers.icon({
      icon: 'fa-monument',
      iconColor: 'black',
      markerColor: 'white',
      shape: 'square',
      prefix: 'fa'
    });

    const parkIcon = L.ExtraMarkers.icon({
      icon: 'fa-tree',
      iconColor: 'black',
      markerColor: 'green',
      shape: 'square',
      prefix: 'fa'
    });

    const railIcon = L.ExtraMarkers.icon({
      icon: 'fa-train',
      iconColor: 'black',
      markerColor: 'white',
      shape: 'square',
      prefix: 'fa'
    });


    const drinkIcon = L.ExtraMarkers.icon({
      icon: 'fa-beer-mug-empty',
      iconColor: 'black',
      markerColor: 'white',
      shape: 'square',
      prefix: 'fa'
    });


    //Map the response 
    response.data.map(attraction => {
      //console.log(feature.properties.kinds);

      //if the data contains type of attraction as monuments and memorials then add a marker layer for it and bind a popup with name of monument
      if (attraction.kind.includes('monuments_and_memorials')) {
        L.marker([attraction.latitude, attraction.longitude], { icon: monumentIcon })
          .bindTooltip(attraction.name, { direction: 'top', sticky: true })
          .addTo(monuments)
      };

      // if (feature.properties.kinds.includes('gardens_and_parks')) {
      //   L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: parkIcon })
      //     .bindTooltip(feature.properties.name, { direction: 'top', sticky: true })
      //     .addTo(parks)
      // };

      if (attraction.kind.includes('railway_stations')) {
        L.marker([attraction.latitude, attraction.longitude], { icon: railIcon })
          .bindTooltip(attraction.name, { direction: 'top', sticky: true })
          .addTo(trainStations)
      };

      // if (feature.properties.kinds.includes('pubs') || feature.properties.kinds.includes('bar')) {
      //   L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: drinkIcon })
      //     .bindTooltip(feature.properties.name, { direction: 'top', sticky: true })
      //     .addTo(bars)
      // };


    });


  } catch (err) {
    console.log(err);
  };
};

//This function retireves data from php routine which calls to countryBorders.json
//It retrieves the data then maps it to an options element
//All the options elements are then appended to the dropdown box found in html
//Data is returned for other functions to use
async function getCountryData() {

  try {
    //Make ajax request to php routine
    const response = await $.ajax({
      url: "libs/php/countryData.php",
      method: 'GET'
    });

    //Map out name and iso properties of the data 
    const mappedData = response.map(feature => {
      const name = feature.name;
      const iso = feature.iso_a2;

      return { name: name, iso: iso };
    });

    //Sort data into alphabetical order
    const sortedData = mappedData.sort((a, b) => a.name.localeCompare(b.name));


    //Create an options variable which contains the name and iso information for each country
    //Return an <option> that can be used as HTML
    const options = sortedData.map(option => {
      return `<option value="${option.iso}">${option.name}</option>`;
    })

    const selectElement = $('#country-select')
    //Appened data to the county-select dropdown
    selectElement.append(options);

  } catch (err) {
    alert("We're sorry, we were unable to retrieve the data for this country.")
    console.log(err);
  }
};

//This function retireves data from php routine which calls to Common-Currency.json
//It retrieves the data then maps it to an options element
//All the options elements are then appended to the dropdown box found in html
async function getCurrencyInfo() {

  try {
    //Make ajax request to php routine
    const response = await $.ajax({
      url: "libs/php/CurrencyData.php",
      method: "GET"
    });



    //Parse the data
    const currencyData = JSON.parse(response);

    //Create an options variable which contains the currency code for each country e.g, USD
    //Return an <option> that can be used as HTML
    const options = Object.values(currencyData).map(data => {
      const code = data.code;
      return `<option value="${code}">${code}</option>`;
    });

    const fromCurrencySelect = $('#from-currency');
    //Appened data to the county-select dropdown
    fromCurrencySelect.append(options);

  } catch (err) {

    console.log(err);
    throw (err);
  }
};

//This function calls to REST countries API to get data on population, capitals, currencies, continents, langauges
//Also gets data on the countries latitude and longitude and currency for following calls to use 
//Takes the countrys iso code e.g., GBR
async function getData(code) {
  const countrySelected = $('country-selected').val();

  //Check if country drop down has a value, if not value then dont run the call 
  if (countrySelected === "default") {
    return;
  }

  //Return a promise so can allow other calls to use results of this call
  try {
    const response = await $.ajax({
      url: "libs/php/RESTCountryData.php",
      method: "POST",
      dataType: 'JSON',
      data: { code }
    });

    //Set information variables
    const res = response.data[0]
    const countryName = res.name.common;
    const capital = res.capital[0];
    const currency = res.currencies;
    const language = res.languages;
    const population = res.population;
    const continent = res.continents;
    let currCode = Object.keys(currency)[0];

    //Set text from the information popup
    $('#name').text(`${countryName}`);
    $('#flag').attr('src', res.flags.png);
    $('#capital').text(`${capital}`);
    $('#population').text(` ${population.toLocaleString()}`);
    $('#currency').text(`${Object.values(currency)[0].symbol} ${Object.values(currency)[0].name}`);
    $('#continent').text(` ${continent}`);
    $('#language').text(`${Object.values(language)[0]}`);

    return { currCode, capital };

  } catch (err) {
    console.log(err);
    throw err;
  }
};

//This function retrieves earthquake data by making a call to Geonames API
//It takes the bounds of the current country as its parameter
//The bound values are obtsined from the response of the getData function
async function getEarthquakes(bounds) {
  //Set the bounds variables
  const northEast = bounds._northEast;
  const southWest = bounds._southWest;

  try {
    const response = await $.ajax({
      url: "libs/php/Earthquakes.php",
      method: "POST",
      dataType: 'JSON',
      data: {
        north: northEast.lat,
        south: southWest.lat,
        east: northEast.lng,
        west: southWest.lng
      }
    });

    //Set earthquakeData to the response of the call
    const earthquakeData = response.data.earthquakes;

    const earthquakeIcon = L.icon({
      iconUrl: 'libs/pics/earthquake.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: 'earthquake-icon'
    });

    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        const size = count < 10 ? [40, 40] : [50, 50]; // adjust icon size based on count
        return L.divIcon({
          html: `<div><span>${count}</span><img src="libs/pics/cluster-marker.png" /></div>`,
          className: "cluster-icon",
          iconSize: size
        });
      }
    });

    //Map through the data and set a circle for each earthquake and bind a popup for additional information
    earthquakeData.map(earthquakes => {
      let earthquakeMarker = L.marker([earthquakes.lat, earthquakes.lng], { icon: earthquakeIcon });
      earthquakeMarker.bindPopup(`This earthquakes occured on: ${earthquakes.datetime}. It had a depth of  ${earthquakes.depth} and a magnitude of ${earthquakes.magnitude}`);
      clusterGroup.addLayer(earthquakeMarker);
    });

    //Add the marker cluster group layer to map
    map.addLayer(clusterGroup);

  } catch (err) {
    console.log(err);
  };
};

async function getNameIso(iso_a2) {
  try {
    const response = await $.ajax({
      url: "libs/php/NameIso.php",
      method: "POST",
      dataType: 'JSON',
      data: {
        iso_a2: iso_a2
      }
    });


    const countryName = response[0];

    $('#country').text(`${countryName}`);

    return countryName;

  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getSunData(countryLatLng) {

  try {
    //Make ajax request to php routine
    const response = await $.ajax({
      url: "libs/php/OpenCageData.php",
      method: 'POST',
      dataType: 'JSON',
      data: {
        lat: countryLatLng[0],
        lng: countryLatLng[1]
      }
    });

    //Set variables from response
    const sun = response.data.results[0].annotations.sun;
    const timeZones = response.data.results[0].annotations.timezone

    //Set HTML to response data
    $("#sunrise").text('Sunrise: ' + convertToTime(sun.rise.apparent, timeZones.name));
    $("#sunset").text('Sunset: ' + convertToTime(sun.set.apparent, timeZones.name));

  } catch (err) {
    $('#errorMessage').text('Sorry we have problems receiving all the data');
    $('#errorModal').modal('show');
    console.log(err);
  }
}

//This function makes openweathermap API to retrieve data on the selected countries current weather
//It uses the latitude and longitude of a country as its parameters
//These values are obtained from the getData response
function getWeather(capital = "London") {
  $.ajax({
    url: "libs/php/Weather.php",
    type: 'POST',
    dataType: 'json',
    data: {
      location: capital
    },
    success: function (result) {
      var resultCode = result.status.code

      if (resultCode == 200) {

        var d = result.data;

        $('#weatherModalLabel').html(d.location + ", " + d.country);

        $('#todayConditions').html(d.forecast[0].conditionText);
        $('#todayIcon').attr("src", d.forecast[0].conditionIcon);
        $('#todayMaxTemp').html(d.forecast[0].maxC);
        $('#todayMinTemp').html(d.forecast[0].minC);
        var date1 = new Date(d.forecast[1].date)
        $('#day1Date').text(date1.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }));
        $('#day1Icon').attr("src", d.forecast[1].conditionIcon);
        $('#day1MinTemp').text(d.forecast[1].minC);
        $('#day1MaxTemp').text(d.forecast[1].maxC);

        var date2 = new Date(d.forecast[2].date)
        $('#day2Date').text(date2.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }));
        $('#day2Icon').attr("src", d.forecast[2].conditionIcon);
        $('#day2MinTemp').text(d.forecast[2].minC);
        $('#day2MaxTemp').text(d.forecast[2].maxC);

        var lastUpdated = new Date(d.lastUpdated);
        $('#lastUpdated').text(lastUpdated.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }));

        $('#pre-load').addClass("fadeOut");

      } else {

        $('#weatherModal .modal-title').replaceWith("Error retrieving data");

      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#weatherModal .modal-title').replaceWith("Error retrieving data");
    }
  })

}

//This function makes openweathermap API to retrieve data on the selected countries current weather
//It uses the latitude and longitude of a country as its parameters
//These values are obtained from the getData response
async function getAirPollution(countryLatLng) {

  try {
    const response = await $.ajax({
      url: "libs/php/AirPollution.php",
      method: "POST",
      dataType: 'JSON',
      data: {
        lat: countryLatLng[0],
        lon: countryLatLng[1]
      }

    });

    const res = response.data.list[0].components
    const carbonMonoxide = res.co
    const nitrogenDioxide = res.no2
    const sulphurDioxide = res.so2
    const particulates2_5 = res.pm2_5;
    const particulates10 = res.pm10;

    $('#co').text(`${carbonMonoxide}μg/m3`);
    $('#no2').text(`${nitrogenDioxide}μg/m3`);
    $('#so2').text(`${sulphurDioxide}μg/m3`);
    $('#pm2_5').text(`${particulates2_5}μg/m3`);
    $('#pm10').text(`${particulates10}μg/m3`);


  } catch (err) {
    console.log(err);
  }
}

//This function retrieves wikipedia entries by making a call to Geonames API
//It takes the bounds of the current country as its parameter
//The bound values are obtained from the response of the getData function
//Entries markers are mapped onto the main map so users can easily select an entry for a location
//Entries are from lat/lngs within the given bounds
async function getWikiLinks(bounds) {

  const northEast = bounds._northEast;
  const southWest = bounds._southWest;

  try {
    const response = await $.ajax({
      url: "libs/php/WikiLinks.php",
      method: "POST",
      dataType: 'JSON',
      data: {
        north: northEast.lat,
        south: southWest.lat,
        east: northEast.lng,
        west: southWest.lng
      }
    });

    const entries = response.data.entry;

    const wikiIcon = L.icon({
      iconUrl: 'libs/pics/wiki.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: 'wiki-icon'
    });

    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        const size = count < 10 ? [40, 40] : [50, 50]; // adjust icon size based on count
        return L.divIcon({
          html: `<div><span>${count}</span><img src="libs/pics/cluster-marker.png" /></div>`,
          className: "cluster-icon",
          iconSize: size
        });
      }
    });

    entries.map(entry => {
      let WikiMarker = L.marker([entry.lat, entry.lng], { icon: wikiIcon });
      //Bind a link to the wikipedia entry on the marker 
      WikiMarker.bindPopup(`<a href=" ${entry.wikipediaUrl}" target="_blank" rel="noopener noreferrer">${entry.title}</a>`);
      clusterGroup.addLayer(WikiMarker);
    });

    //Add the marker cluster group layer to map
    map.addLayer(clusterGroup);

  } catch (err) {
    console.log(err);
    $('#errorMessage').text('Sorry we have problems receiving all the Wikipedia data');
    $('#errorModal').modal('show');
  };
}

//Runs all the functions to obtain and display country data
async function loadCountryData() {
  try {

    if (airports || cities || trainStations || monuments) {
      airports.clearLayers();
      cities.clearLayers();
      trainStations.clearLayers();
      monuments.clearLayers();
    }

    //Set the loader to run
    $('.central-loader').show();

    //Get the name and Iso of selected country
    getNameIso($('#country-select').val());

    //Get the geometry of the country and used returned values to run functions
    getGeomtry($('#country-select').val()).then(({ bounds, latLng }) => {
      getAirPollution(latLng);
      getAttractions(bounds);
    });

    getWebcams($('#country-select').val());

    getPopulationData($('#country-select').val());

    getCovidData($('#country-select').val());

    getAirports($('#country-select').val());

    getCities($('#country-select').val());

    //Get extra data on country and use returned value for the currency converter function
    const { currCode, capital } = await getData($('#country-select').val());
    exchangeCurrency = currCode;

    getWeather(capital)

    //Hide loader
    $('.central-loader').hide();

  } catch (e) {
    $('.central-loader').hide();
    $('#errorModal').modal('show');
    console.log(e);
    throw (e);
  }
};

//This function is for a successful navigator.geolocation call
//It will obtain the users coordinates and set the map view to them coordinates
//It will then use getCountryData to obtain the iso code of the users country
//Iso code will be used to find the corresponding coordinates found from the countryBorder.JSON file
//A multipolygon or polygon depending on geometry will be plotted to highlight users country
//Several functions will then be called to obtain more information on the users country
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

async function success(pos) {

  try {

    const crd = pos.coords;

    const response = await $.ajax({
      url: "libs/php/OpenCageData.php",
      method: 'POST',
      dataType: 'JSON',
      data: {
        lat: crd.latitude,
        lng: crd.longitude
      }
    });

    //Save the ISO code for the users country 
    const userIso = response['data']['results'][0]['components']['ISO_3166-1_alpha-2'];
    $('#country-select').val(userIso).change();

  } catch (err) {
    console.log(err);
    throw err;

  }
};

async function error(err) {
  $('#country-select').val('GB').change();
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

//Helper Functions
function getCenter(bounds) {
  const northEast = bounds._northEast;
  const southWest = bounds._southWest;

  const north = northEast.lat;
  const east = northEast.lng;
  const south = southWest.lat;
  const west = southWest.lng;

  const lat = (north + south) / 2;
  const lng = (east + west) / 2;

  return [lat, lng];

}

//The sunrise and sunset times returned from the API are in milliseconds and are based on UTC time
//This function takes the total time in milliseconds and the timezone of that country and formats it to correct local time for that country 
function convertToTime(totalSeconds, timeZone) {
  const date = new Date(totalSeconds * 1000);
  const timeString = date.toLocaleTimeString("default", {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timeZone // example time zone (replace with desired time zone)
  });

  return timeString;
}

$(window).on('load', () => {

  getCountryData();
  getCurrencyInfo();
  navigator.geolocation.getCurrentPosition(success, error, options);

});

$('#country-select').on('change', () => {
  if ($('#preloader').length) {
    $('#preloader').delay(1500).fadeOut('slow', function () {
      $(this).remove();
    });
  }

  loadCountryData();
});

$('#convert-btn').on('click', () => {

  currencyExchange(exchangeCurrency, $('#from-currency').val(), $('#amount').val());
});

$('#exchangeModal').on('show.bs.modal', function () {
  currencyExchange(exchangeCurrency)
});

$('#exchangeModal').on('hidden.bs.modal', function () {
  $('#result').text("");
  $('#exchange-rate').text("")
});

