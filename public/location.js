// For more information http://diveintohtml5.info/geolocation.html

var ws = new WebSocket("ws://localhost:8080");

var locationHandler = {
    gmap: null,
    markers: [],
    counter: 0,

    // this variable is crucial for the application. The client will communicate
    // a new position to the server if the predicted position and the current position
    // different more than this threshold.
    errorThreshold: 30,

    // this variable stores the time (ms) to which the gps is used to check the position
    gpsPollingTime: 10000,

    currentModel: null,

    init: function (map) {
        gmap = this.gmap || map; // initialize if gmap is null
        geoPosition.getCurrentPosition(
            this.successCallback,
            this.errorCallback,
            { enableHighAccuracy: true });
        this.lookupPosition();
    },

    lookupPosition: function () {
        // emulate watchPosition(), for this experiment we need getCurrentPosition() (or do we?)
        setInterval( function() {
            geoPosition.getCurrentPosition(
                locationHandler.successCallback,
                locationHandler.errorCallback,
                { enableHighAccuracy: true });

        }, locationHandler.gpsPollingTime);
    },


    requestModelUpdate: function (pos) {
        ws.send(JSON.stringify ({
            type: 'requestModelUpdate',
            position: pos
        }))
    },

    sendCoords: function (position) {
        ws.send(JSON.stringify({
            type: 'position',
            position: position
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
        var positionObj = {
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
        }

        var predictedPosition = locationHandler.nextPosition(positionObj.timestamp);
        var distance = locationHandler.computeDistance(positionObj, predictedPosition);

        if (distance > locationHandler.errorThreshold && locationHandler.counter > 2) {
            locationHandler.currentModel = locationHandler.requestModelUpdate(positionObj);
        } else if (locationHandler.counter <= 2) {
            locationHandler.counter += 1;
            locationHandler.sendCoords(positionObj);
        }
        locationHandler.addMarker(position);
    },

    nextPosition: function (time) {
        return -1;
    },

    computeDistance: function (position1, position2) {
        return 31; // SEND ALWAYS

        // http://www.movable-type.co.uk/scripts/latlong.html
        var R = 6371; // km
        var φ1 = position1.latitude.toRadians();
        var φ2 = position2.latitude.toRadians();
        var Δφ = (position2.latitude-position1.latitude).toRadians();
        var Δλ = (position2.longitude-position1.longitude).toRadians();

        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var d = R * c;
        return d;
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
