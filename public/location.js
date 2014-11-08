// For more information http://diveintohtml5.info/geolocation.html

//var ws = new WebSocket("ws://188.226.176.165:8080");
var ws = new WebSocket("ws://localhost:8080");
var model = require('./model');

ws.onmessage =  function(message) {
    var o = JSON.parse(message.data)
    locationHandler.currentModel = model.customInit(o);
};

var locationHandler = {
    gmap: null,
    markers: [],
    predictions: [],
    counter: 0,
    seq_number: 0,
    maxDistance: 1000,

    // this variable is crucial for the application. The client will communicate
    // a new position to the server if the predicted position and the current position
    // different more than this threshold.
    // The error is in meters
    errorThreshold: 10,

    // this variable stores the time (ms) to which the gps is used to check the position
    gpsPollingTime: 6000,

    currentModel: null,

    init: function (map, useModelBased) {
        gmap = this.gmap || map; // initialize if gmap is null
        if (useModelBased) {
            // wait a bit before starting (so that the socket is open)
            setTimeout( function() {
                //navigator.geolocation.getCurrentPosition(
                //    locationHandler.successCallback,
                //    locationHandler.errorCallback,
                //    { enableHighAccuracy: true });
                locationHandler.lookupPosition();
            }, 1000);
        } else {
            navigator.geolocation.watchPosition(
                locationHandler.watchPositionSuccessCallback,
                locationHandler.errorCallback,
                { enableHighAccuracy: true });
        }
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
        //console.log("Sending..")
        //console.log(position)
        ws.send(JSON.stringify({
            type: 'position',
            position: position
        }));
    },

    sendLogs: function (position) {
        ws.send(JSON.stringify({
            type: 'log',
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

    watchPositionSuccessCallback: function (position) {
        var positionObj = {
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
        }
        self = locationHandler
        self.sendCoords(positionObj)
        self.addMarker(position)
    },

    successCallback: function (position) {
        locationHandler.seq_number += 1;
        console.log("Req. N. " + locationHandler.seq_number.toString())
        self = locationHandler

        var positionObj = {
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
        }

        if (self.counter < 2) {
            self.counter += 1;
            self.sendCoords(positionObj);
        } else {
            if (self.currentModel) {
                //console.log('yay! we have a model')
                var predictedPosition = self.currentModel.nextPoint(positionObj.timestamp);

                self.addPrediction(predictedPosition.latitude, predictedPosition.longitude);

                var distance = self.computeDistance(positionObj, predictedPosition);
                // if (distance > self.maxDistance) {
                //     alert("The distance is bigger than 1000!");
                // }

                // if (distance > self.maxDistance) {
                //    self.sendCoords(positionObj);
                //} else
                //console.log(model)
                //console.log(positionObj)
                //console.log(predictedPosition)

                console.log('distance: ' + distance)
                //console.log(predictedPosition)
                if (distance > self.errorThreshold) {
                    self.requestModelUpdate(positionObj);
                } else {
                    self.sendLogs(predictedPosition)
                }
            } else {
                //console.log(':( no model yet..  a sending a request...')
                self.requestModelUpdate(positionObj);
            }

        }
        self.addMarker(position);
    },

    // compute the distance in meters
    computeDistance: function (position1, position2) {
        // http://www.movable-type.co.uk/scripts/latlong.html
        var R = 6371000; // meters
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

module.exports = locationHandler;
