//---------- INTERACTIVE VISULISATIONS FOR "BIKE STATION DRILLDOWN" ----------

function buildMetadata(destination) {
  d3.json("http://127.0.0.1:5000/api/data").then((data) => {

  // Create list of: 
  // (1) ride with start and end destination, 
  // (2) a list og all bike stations and their info 
  rideDestination = [];
  stationsInfoUnclean = [];

  for (let i = 0; i < data.length; i++) {
    rideDestination.push({
      end_station: data[i]["End_station"],
      start_station: data[i]["Start_station"]
      });
    stationsInfoUnclean.push({
      station: data[i]["End_station"],
      station_number: data[i]["End_station_number"],
      lat: data[i]["End_lat"],
      lon: data[i]["End_lon"]
    });
    stationsInfoUnclean.push({
      station: data[i]["Start_station"],
      station_number: data[i]["Start_station_number"],
      lat: data[i]["Start_lat"],
      lon: data[i]["Start_lon"]
    });

    }

  // "StationsInfo" list is a list of all bike stations and their info
 function removeDuplicates1(data1, key1) {
  return [...new Map(data1.map(x => [key1(x), x])).values()]
  }
  stationsInfo =removeDuplicates1(stationsInfoUnclean, it => it.station);

  // Filter the metadata for the object with the desired bike station destination
  function metadataFilter(metadataObject) {
    return metadataObject.station == destination;
  }
  metadataResult = stationsInfo.filter(metadataFilter);
  drilldownMetadataResult = metadataResult[0];

  // Use `.html("") to clear any existing metadata
  var panel = d3.select("#sample-metadata");
  panel.html("");

  // Inside a loop, you will need to use d3 to append new
  // tags for each key-value in the filtered metadata.
  var panel = d3.select("#sample-metadata");
  for (const [key, value] of Object.entries(drilldownMetadataResult)) {
    string = `${key}: ${value}`;
    panel.append('div').text(string);
  }

  });
}

// Setup graph for popular paths for each station
function graph(destination) {
  d3.json("https://raw.githubusercontent.com/mpeck34/Project-3-Group-1/main/static/data/stationTop5Destination.json").then((data) => {
  console.log(data);

  // Filter the top5 data for the desired station
  function top5Filter(chosenDestination) {
    return chosenDestination.baseStation == destination;
  }
  top5result = data.filter(top5Filter);
  top5result = top5result[0];
  
  var barData = [
    {
      x: top5result["pathStation"],
      y: top5result["pathStationCount"],
      type: 'bar'
    }
  ];

  let barLayout = {
    title: `Top 5 destinations from ${destination} bike station`,
    font: {
      size: 8
    },
    height: 300,
    width: 1050,
    xaxis: {
      title: "Bike Station"
    },
    yaxis: {
      title: "Number of Visits"
    }
  }
  
  Plotly.newPlot('bar', barData, barLayout);

  });
}

graph('Albert Embankment, Vauxhall');

// Setup initial dashboard and default station information shown
function init() {
  d3.json("http://127.0.0.1:5000/api/data").then((data) => {

  // Create list of: 
  // (3) a list of all bike stations names
  stationsUnclean = [];

  for (let i = 0; i < data.length; i++) {
    stationsUnclean.push(data[i]["End_station"]);
    stationsUnclean.push(data[i]["Start_station"]);
    }

  // "Stations" list is a list of all bike stations to be used in our dropdown menu.
  function removeDuplicates(input) {
    return input.filter((value, index) => input.indexOf(value) == index);
  }
  stations = removeDuplicates(stationsUnclean).sort();

  // Use d3 to select the dropdown with id of `#selDataset`
  let dropdown = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
    // Hint: Inside a loop, you will need to use d3 to append a new
    // option for each sample name.
    for (let i = 0; i < stations.length; i++) {
      dropdown.append('option').attr("value", stations[i]).text(stations[i]);
      };

  // Get the first station from the list
  firstStation = stations[0]

  //Insert graph functions here
  buildMetadata(firstStation);
  graph(firstStation);

  });
};

d3.selectAll("#selDataset").on("change", optionChanged);

// Function for event listener
function optionChanged(newStation) {

  // Build charts and metadata panel each time a new sample is selected
  let dropdown = d3.select("#selDataset");
  let newStation1 = dropdown.property("value");

  // Insert graph functions here
  buildMetadata(newStation1);
  graph(newStation1);
}

// Initialise the dashboard
init();


//---------- STATIC VISULISATIONS ----------

// Top 10 Stations to Start Journey
// Define variables
let projectStatic1 = "Top 10 Stations to Start Journey";
let stationNameStatic1 = ["Waterloo Station 3, Waterloo", "Wormwood Street, Liverppol Street","Hyde Park Corner, Hyde Park","Black Line Gate, Kensington Gardens", 
                   "Waterloo Station 1, Waterloo", "Albert Gate, Hyde Park", "Duke Street Hill, London Bridge", "Cheapside, Bank", "St Jame's Square, St Jame's",
                   "Brushfield Street, Liverpool Street"];
let startCountStatic1 = [392, 335, 319, 266, 248, 226, 192, 192, 191, 190];

let traceStatic1 = {
    x: stationNameStatic1,
    y: startCountStatic1,
    type: 'bar'
};

let dataStatic1 = [traceStatic1];

let layoutStatic1 = {
    title: projectStatic1,
    height: 300,
    width: 600
};

Plotly.newPlot("Static1", dataStatic1, layoutStatic1)

// Top 10 Stations to End Journey
// Define variables
let projectStatic2 = "Top 10 Stations to End Journey";
let stationNameStatic2 = ["Waterloo Station 3, Waterloo", "Wormwood Street, Liverpool Street", "Hyde Park Corner, Hyde Park", "Waterloo Station 1, Waterloo", 
                   "Black Line Gate, Kensington Gardens", "St Jame's Square, St Jame's", "Queen Street 1, Bank", "Brushfield Street, Liverpool Street",
                   "Hop Exchange, The Borough", "Albert Gate, Hyde Park"];
let startCountStatic2 = [421, 335, 329, 293, 272, 264, 259, 257, 244, 229];

let traceStatic2 = {
    x: stationNameStatic2,
    y: startCountStatic2,
    type: 'bar'
};

let dataStatic2 = [traceStatic2];

let layoutStatic2 = {
    title: projectStatic2,
    height: 300,
    width: 600
};

Plotly.newPlot("Static2", dataStatic2, layoutStatic2)