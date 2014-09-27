// For more information http://diveintohtml5.info/geolocation.html

var ws = new WebSocket("ws://localhost:8080");

var locationHandler = {
    gmap: null,
    markers: [],

    lookupPosition: function (map) {
        gmap = this.gmap || map; // initialize if gmap is null
        geoPosition.getCurrentPosition(
            this.successCallback,
            this.errorCallback,
            { enableHighAccuracy: true });

        var self = this;
        // emulate watchPosition(), for this experiment we need getCurrentPosition()
        setInterval( function() {
            self.lookupPosition(self.gmap)
        }, 10000);
    },

    sendCoords: function (position) {
        ws.send(JSON.stringify({
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
        }));
    },

    addMarker: function (position) {
        var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: gmap
        });
        locationHandler.markers.push(marker);
    },

    setCenter: function (position) {
        gmap.setCenter(myLatlng);
        gmap.setZoom(15);
    },

    successCallback: function (position) {
        locationHandler.sendCoords(position);
        locationHandler.addMarker(position);
    },

    errorCallback: function (err) {
        if (err.code == 1) {
            alert("error1");
            // the user said no
        } else if (err.code == 2) {
            alert("error2");
            // position unavailable
        } else if (err.code == 3) {
            alert("error3");
            // timeout
        } else {
            alert("error?");
            // unknown error
        }
    }
};


// the client has a way to request a model update
