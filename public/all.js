var locationHandler = require('./location');

function initialize() {
    var mapOptions = {
        // center in Otaniemi
        center: { lat: 60.186692699999995, lng: 24.8212311},
        zoom: 15
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);
    if (geoPosition.init())
        locationHandler.init(map)
    else
        alert("geoPosition.init() has failed")
}


google.maps.event.addDomListener(window, 'load', initialize);
