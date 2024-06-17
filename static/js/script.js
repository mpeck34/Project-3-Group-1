// Global variables
let londonCoords = [51.5072, -0.1276];
let mapZoomLevel = 12;
let myMap; // Declare myMap globally to store the map instance
let bikeMarkers = []; // Array to store all bike markers
let bikeStationsLayer; // Layer group for bike markers

// Wait for the DOM to load before executing any code
document.addEventListener("DOMContentLoaded", function() {
  // Initialize the map and store the instance in myMap
  myMap = L.map("map-id").setView(londonCoords, mapZoomLevel);

  // Add a tile layer to the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

  // Fetch station data and create markers
  fetch("http://localhost:5000/api/data")
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // Create markers
      bikeMarkers = createMarkers(data);
      console.log(bikeMarkers);

      // Create a layer group from bike markers
      bikeStationsLayer = L.layerGroup(bikeMarkers);
      bikeStationsLayer.addTo(myMap);

      // Populate dropdown menu with station names
      populateDropdown(bikeMarkers);
    })
    .catch(error => {
      console.error("Error fetching data for dropdown:", error);
    });

  // Event listener for Show All Stations button
  let showAllButton = document.getElementById("show-all-stations");
  showAllButton.addEventListener("click", function() {
    // Reset the dropdown menu to default option
    let dropdown = document.getElementById("bike-stations");
    dropdown.selectedIndex = 0; // Set the default option to be selected

    // Check if bikeStationsLayer exists and myMap is initialized
    if (myMap && bikeStationsLayer) {
      // Clear existing layers on the map
      myMap.removeLayer(bikeStationsLayer);

      // Add the bikeStationsLayer back to myMap
      bikeStationsLayer.addTo(myMap);
    }
  });
});

// Function to populate dropdown menu with station names
function populateDropdown(bikeMarkers) {
  let dropdown = document.getElementById("bike-stations");

  // Clear existing options
  dropdown.innerHTML = "";

  // Add default option
  let defaultOption = document.createElement("option");
  defaultOption.text = "Select a station";
  dropdown.add(defaultOption);

  // Create a temporary list of station names
  let stationNames = [];
  bikeMarkers.forEach(marker => {
    stationNames.push(marker.options.title);
  });

  // Sort station names alphabetically
  stationNames.sort();

  // Add sorted station names as options
  stationNames.forEach(stationName => {
    let option = document.createElement("option");
    option.text = stationName;
    dropdown.add(option);
  });

  // Event listener for dropdown change
  dropdown.addEventListener("change", function() {
    let selectedStation = dropdown.value;

    // Loop through all bikeMarkers
    bikeMarkers.forEach(marker => {
      if (marker.options.title === selectedStation) {
        // Show the selected marker
        marker.addTo(myMap).openPopup();
      } else {
        // Hide markers that are not selected
        myMap.removeLayer(marker);
      }
    });
  });
}


// Function to create markers
function createMarkers(response) {
  let stations = response;
  let bikeMarkers = [];
  let uniqueCoords = new Set(); // Set to store unique coordinates

  // Loop through stations array and create markers
  stations.forEach(station => {
    let coordKey = `${station.Start_lat},${station.Start_lon}`;

    // Check if the station's coordinates are already in the Set
    if (!uniqueCoords.has(coordKey)) {
      let bikeMarker = L.marker([station.Start_lat, station.Start_lon], { title: station.Start_station })
        .bindPopup(`<h3>${station.Start_station}</h3><hr><p>Most common destination: Loading...</p>`);

      // Attach click event to marker
      bikeMarker.on('click', function(e) {
        drawLines(station.Start_station);
      });

      bikeMarkers.push(bikeMarker);
      uniqueCoords.add(coordKey); // Add coordinates to Set to track uniqueness
    }
  });

  return bikeMarkers;
}

// Function to draw lines for most common destination
function drawLines(startStation) {
  // Fetch most common routes data from API
  fetch(`http://localhost:5000/api/most_common_routes`)
    .then(response => response.json())
    .then(data => {
      // Find the most visited end station corresponding to the start station
      let route = data.find(route => route.Start_station === startStation);

      if (route) {
        // Update popup content with most common destination
        let popupContent = `<h3>${startStation}</h3><hr><p>Most common destination: ${route.End_station}</p>`;
        myMap.openPopup(popupContent, [route.Start_lat, route.Start_lon]);

        // Draw polyline from start station to most visited end station
        let startCoords = [route.Start_lat, route.Start_lon];
        let endCoords = [route.End_lat, route.End_lon];
        let line = L.polyline([startCoords, endCoords], { color: 'red' }).addTo(myMap);
      } else {
        console.error(`Most visited route not found for ${startStation}`);
      }
    })
    .catch(error => {
      console.error("Error fetching most common routes:", error);
    });
}
