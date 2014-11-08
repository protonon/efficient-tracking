var locationHandler = require('./location')
var config = require('./configuration')

function initialize() {
    var mapOptions = {
        // center in Otaniemi
        center: { lat: 60.186692699999995, lng: 24.8212311},
        zoom: 15
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);
    if (geoPosition.init()) {
        // true is for model-based
        locationHandler.init(map, config.useModel)
    } else {
        alert("geoPosition.init() has failed")
    }
}

google.maps.event.addDomListener(window, 'load', initialize);
