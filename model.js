// http://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html

var converter = require('./converter')

var model = {

    latLon1: null,
    latLon2: null,
    x_last: null,
    y_last: null,
    speed: null,
    angle: null,
    zoneNumber: null,
    last_timestamp: null,

    init: function (json) {
        var obj = JSON.parse(json);
        this.latLon1 =    obj.latLon1;
        this.latLon2 =    obj.latLon2;
        this.x_last  =    obj.x_last;
        this.y_last  =    obj.y_last;
        this.speed   =    obj.speed;
        this.angle   =    obj.angle;
        this.zoneNumber = obj.zoneNumber;
        this.last_timestamp = obj.last_timestamp;
    },

    getModel: function (latLon1, latLon2) {
        this.latLon1 = latLon1;
        this.latLon2 = latLon2;
        var conversion1 = converter.fromLatLon(latLon1.latitude, latLon1.longitude)
        var conversion2 = converter.fromLatLon(latLon2.latitude, latLon2.longitude)
        this.x_last = conversion2.x;
        this.y_last = conversion2.y;
        this.zoneNumber = conversion2.zone;
        this.last_timestamp = latLon2.timestamp;

        x1 = conversion1.x
        y1 = conversion1.y

        // FIX IT
        if (y1 === this.y_last) {
            y1++;
        }
        if (x1 === this.x_last) {
            x1++;
        }

        if (latLon2.speed) {
            this.speed = latLon2.speed;
        } else {
            delta_t = (latLon2.timestamp - latLon1.timestamp) / 1000; // convert to seconds
            delta_s = this.computeDistanceBetweenLatLon(latLon1, latLon2);
            this.speed = delta_s / delta_t;
        }
        this.angle = this.computeLine(x1, y1, this.x_last, this.y_last);

        return this;
    },

    computeDistance: function (x1, y1, x2, y2) {
        var delta_x = x2 - x1;
        var delta_y = y2 - y1;
        return Math.sqrt(Math.pow(delta_x,2) + Math.pow(delta_y,2));
    },

    computeDistanceBetweenLatLon: function (position1, position2) {
        // http://www.movable-type.co.uk/scripts/latlong.html
        var R = 6371000; // metres
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

    computeLine:  function (x1, y1, x2, y2) {
        var slope = (y1-y2)/(x1-x2);
        var intercept = (x1*y2 - x2*y1)/(x1-x2);
        var distance = this.computeDistance(x1, y2, x2, y2);
        //var angle = Math.acos((x2-x1) / distance);
        var angle =  Math.atan2(y2 - y1, x2 - x1);

        return angle;
    },

    nextPoint: function (time) {
        var time = timestamp - this.last_timestamp;
        var space = this.speed * time;
        var next_x = this.x_last + space*Math.cos(this.angle);
        var next_y = this.y_last + space*Math.sin(this.angle);
        return converter.toLatLon(next_x, next_y, this.zoneNumber);
    }
}

module.exports = model;


// l1 = { timestamp: 1412345848377,
//        latitude: 60.190444199999995,
//        longitude: 24.8401204,
//        accuracy: 20,
//        speed: null }

// l2 = { timestamp: 1412345861658,
//        latitude: 60.190435699999995,
//        longitude: 24.8401081,
//        accuracy: 24,
//        speed: null }
// l1 = {latitude: 60, longitude: 20, timestamp: 0, speed: 3}
// l2 = {latitude: 60.001, longitude: 20.001, timestamp: 1000, speed: 3}
//m = model.getModel(l1,l2)
//console.log(m)
//console.log(m.nextPoint(10))

//m = model.computeLine(1, 1, 0, 0)
//console.log(m)
//console.log(m * 180 / Math.PI);
