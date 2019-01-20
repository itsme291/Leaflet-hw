function createMap(earthquakes, legend, fault_lines, heat) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Outdoors": outdoormap,
    "Satellite": satellite
  };

  // Create an overlayMaps object to hold the earthquake earthquakes layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": fault_lines,
    "HeatMap": heat
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [36.1699, -115.1398],
    zoom: 6,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  legend.addTo(map);
  
}

// Perform an API call to the  API to get station information. Call createMarkers when complete
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
lines_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
d3.json(url, function(data){
  d3.json(lines_url, function(lines_data){
    createFeatures(data.features, lines_data.features);
  });
    
});

function createFeatures(earthquakeData, lineData) {

  var latlngs = [];
  function popups(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + " | Mag: " + feature.properties.mag + 
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  };


  function getColor(mag){

    return mag > 5 ? "#CB4335":
            mag >= 4 ? "#F5CBA7":
            mag >= 3 ? "#FAD7A0":
            mag >= 2 ? "#F9E79F":
            mag >= 1 ? "#ABEBC6":
                      "#71F41C";

  };

  function circle_markers(feature, latlng) {
    latlngs.push(latlng);
    var color = "";
    var geojsonMarkerOptions = {
      radius: feature.properties.mag * 5,
      fillColor: getColor(feature.properties.mag),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      dashArray: "15 15",
      dashSpeed: 30
    };
    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  var earthquakes = L.geoJSON(earthquakeData,{
    onEachFeature: popups,
    pointToLayer: circle_markers 
  });

  // Set up the legend
  var legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = function() {

    var div = L.DomUtil.create('div', 'info legend');
    var colors = ["#71F41C", "#ABEBC6", "#F9E79F", "#FAD7A0", "#F5CBA7", "#CB4335"];
    var labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < colors.length; i++) {
      labels.push(
        '<i style="background:' + colors[i] + '"></i> '
        + i + ((i+1)<colors.length ? "- "+(i+1) + '<br>': '+')
      );

            
    }
    div.innerHTML += labels.join('');
    return div;
  };

  var fault_lines = L.geoJSON(lineData)


  console.log(latlngs);
  var heat = L.heatLayer(latlngs, {radius: 100});

  createMap(earthquakes, legend, fault_lines, heat);  
};
