// Define variables
let project = "Top 10 Stations to End Journey";
let stationName = ["Waterloo Station 3, Waterloo", "Wormwood Street, Liverpool Street", "Hyde Park Corner, Hyde Park", "Waterloo Station 1, Waterloo", 
                   "Black Line Gate, Kensington Gardens", "St Jame's Square, St Jame's", "Queen Street 1, Bank", "Brushfield Street, Liverpool Street",
                   "Hop Exchange, The Borough", "Albert Gate, Hyde Park"];
let startCount = [421, 335, 329, 293, 272, 264, 259, 257, 244, 229];

let trace1 = {
    x: stationName,
    y: startCount,
    type: 'bar'
};

let data = [trace1];

let layout = {
    title: project
};

Plotly.newPlot("plot", data, layout)