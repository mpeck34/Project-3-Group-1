let londonCoords = [51.5072, -0.1276];
let mapZoomLevel = 12;
let myMap; // Declare myMap globally to store the map instance


// Wait for the DOM to load before executing any code
document.addEventListener("DOMContentLoaded", function() {
  // Initialize the map and store the instance in myMap
  myMap = L.map("map-id").setView(londonCoords, mapZoomLevel);

  // Add a tile layer to the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

  // Perform an API call to the locally hosted Flask API to get the station information. Call createMarkers when it completes.
  fetch("http://localhost:5000/api/data")
    .then(response => response.json())
    .then(data => {
      console.log(data);
      let bikeMarkers = createMarkers(data);
      
      // Create a layer group from bike markers and add to the map
      let bikeStationsLayer = L.layerGroup(bikeMarkers);

      // Add bikeStationsLayer to myMap if myMap is initialized
      if (myMap) {
        bikeStationsLayer.addTo(myMap);

        // Fit the map bounds to all bike stations
        if (bikeMarkers.length > 0) {
          myMap.fitBounds(bikeStationsLayer.getBounds());
        } else {
          console.warn("No bike markers to fit bounds to.");
        }
      } else {
        console.error("Map instance (myMap) is not initialized.");
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
});

// Dropdown menu intialisation
let filterDropdown = document.getElementById("filter-dropdown");

// Listen for menu change
filterDropdown.addEventListener("change", function(event) {
  let selectedFilter = event.target.value;
  updateMarkersByFilter(selectedFilter);
});

// Update dropdown menu
function updateMarkersByFilter(selectedFilter) {
  let filteredMarkers = filterMarkersByModel(bikeMarkers, selectedFilter);

  // Clear existing markers from the map
  bikeStationsLayer.clearLayers();

  // Add filtered markers to the layer and potentially refit bounds
  bikeStationsLayer.addLayer(filteredMarkers);
  if (filteredMarkers.length > 0) {
    myMap.fitBounds(bikeStationsLayer.getBounds());
  }
}

// Function that does the logic to filter for model
function filterMarkersByModel(bikeMarkers, selectedFilter) {
  let filteredMarkers = [];
  if (selectedFilter === "all") {
    // No filtering, return all markers
    filteredMarkers = bikeMarkers;
  } else if (selectedFilter === "CLASSIC" || selectedFilter === "PBSC_EBIKE") {
    // Filter based on bike model
    filteredMarkers = bikeMarkers.filter(marker => marker.data.Bike_model === selectedFilter);
  } else {
    console.warn(`Invalid filter option: ${selectedFilter}`);
  }
  return filteredMarkers;
}

// Create markers
function createMarkers(response) {
  // Pull the data
  let stations = response;

  // Initialise an array to hold the unique bike markers.
  let bikeMarkers = [];

  // Use a Set to keep track of unique station coordinates
  let uniqueCoords = new Set();

  // Loop through the stations array.
  for (let i = 0; i < stations.length; i++) {
    let station = stations[i];
    let coordKey = `${station.Start_lat},${station.Start_lon}`;

    // Check if the station's coordinates are already in the Set
    if (!uniqueCoords.has(coordKey)) {
      // If station is new, create a marker and add it to bikeMarkers
      let bikeMarker = L.marker([station.Start_lat, station.Start_lon])
        .bindPopup(`<h3>${station.Start_station}</h3><hr><p>Most common destination: Loading...</p>`);

      // Attach event listener for click to draw lines
      bikeMarker.on('click', function(e) {
        // Call function to draw lines to the most traveled-to station
        drawLines(station.Start_station);
      });

      bikeMarkers.push(bikeMarker);
      uniqueCoords.add(coordKey);
    }
  }

  // Return bikeMarkers array so they can be added to the map outside of this function
  return bikeMarkers;
}


// Function to draw lines for the most common destination on each marker
function drawLines(startStation, endStation) {
  // Get data from API
  fetch(`http://localhost:5000/api/most_common_routes`)
    .then(response => response.json())
    .then(data => {
      // Find the most visited end station corresponding to the start station
      let route = data.find(route => route.Start_station === startStation);

      if (route) {
        // Update the popup content with the most common destination
        let popupContent = `<h3>${startStation}</h3><hr><p>Most common destination: ${route.End_station}</p>`;
        myMap.openPopup(popupContent, [route.Start_lat, route.Start_lon]);

        // Draw polyline from start station to most visited end station
        let startCoords = [route.Start_lat, route.Start_lon];
        let endCoords = [route.End_lat, route.End_lon];
        let line = L.polyline([startCoords, endCoords], { color: 'red' }).addTo(myMap);
      } else {
        console.error(`Most visited route not found for ${startStation} to ${endStation}`);
      }
    })
    .catch(error => {
      console.error("Error fetching most common routes:", error);
    });
}