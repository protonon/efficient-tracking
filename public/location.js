// For more information http://diveintohtml5.info/geolocation.html

var ws = new WebSocket("ws://localhost:8080");

ws.onmessage =  function(message) {
    var o = JSON.parse(message.data)
    locationHandler.currentModel = Model.customInit(o);
};

var locationHandler = {
    gmap: null,
    markers: [],
    predictions: [],
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

    addPrediction: function (lat, lon) {
        var myLatlng = new google.maps.LatLng(lat, lon);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: gmap,
            icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 10
            }
        });
        locationHandler.predictions.push(marker);
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

        if (locationHandler.counter < 2) {
            locationHandler.counter += 1;
            locationHandler.sendCoords(positionObj);
        } else {
            if (locationHandler.currentModel) {
                var predictedPosition = locationHandler.currentModel.nextPoint(positionObj.timestamp);

                locationHandler.addPrediction(predictedPosition.latitude, predictedPosition.longitude);

                var distance = locationHandler.computeDistance(positionObj, predictedPosition);
                console.log(distance)
                if (distance > locationHandler.errorThreshold)
                    locationHandler.requestModelUpdate(positionObj);
            } else {
                locationHandler.requestModelUpdate(positionObj);
            }

        }
        locationHandler.addMarker(position);
    },

    computeDistance: function (position1, position2) {
        // http://www.movable-type.co.uk/scripts/latlong.html
        var R = 6371; // km
        var φ1 = position1.latitude * Math.PI / 180;
        var φ2 = position2.latitude * Math.PI / 180;
        var Δφ = (position2.latitude-position1.latitude) * Math.PI / 180;
        var Δλ = (position2.longitude-position1.longitude) * Math.PI / 180;

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

