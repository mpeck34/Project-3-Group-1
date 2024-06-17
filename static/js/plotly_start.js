// Define variables
let project = "Top 10 Stations to Start Journey";
let stationName = ["Waterloo Station 3, Waterloo", "Wormwood Street, Liverppol Street","Hyde Park Corner, Hyde Park","Black Line Gate, Kensington Gardens", 
                   "Waterloo Station 1, Waterloo", "Albert Gate, Hyde Park", "Duke Street Hill, London Bridge", "Cheapside, Bank", "St Jame's Square, St Jame's",
                   "Brushfield Street, Liverpool Street"];
let startCount = [392, 335, 319, 266, 248, 226, 192, 192, 191, 190];

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