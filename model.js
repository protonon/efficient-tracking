// http://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html

var coordinator = require('coordinator');
var fromLatLon = coordinator('latlong', 'utm');
var toLatLon = coordinator('utm', 'latlong');

var model = {

    x_last: null,
    y_last: null,
    speed: null,
    angle: null,
    zoneNumber: null,

    getModel: function (latLon1, latLon2) {
        this.x_last = fromLatLon(latLon2.latitude, latLon2.longitude).easting;
        this.y_last = fromLatLon(latLon2.latitude, latLon2.longitude).northing;
        this.zoneNumber = fromLatLon(latLon2.latitude, latLon2.longitude).zoneNumber;

        x1 = fromLatLon(latLon1.latitude, latLon1.longitude).easting;
        y1 = fromLatLon(latLon1.latitude, latLon1.longitude).northing;

        // FIX IT
        if (y1 === this.y_last) {
            y1++;
        }

        var res = this.computeLine(x1, y1, this.x_last, this.y_last);
        console.log(res);

        if (latLon2.speed) {
            this.speed = latLon2.speed;
        } else {
            delta_t = latLon2.timestamp - latLon2.timestamp;
            delta_s = this.computeDistance(x1, y1, this.x_last, this.y_last);
            this.speed = delta_s / delta_t;
        }
        this.angle = this.computeLine(x1, y1, this.x_last, this.y_last);

        return (function(time) {
            var res = this.nextPoint(time);
            return toLatLon(res[0], res[1], this.zoneNumber);
        })
    },

    computeDistance: function (x1, y1, x2, y2) {
        var delta_x = x2 - x1;
        var delta_y = y2 - y1;
        return  Math.sqrt(delta_x*delta_x + delta_y*delta_y);
    },

    computeLine:  function (x1, y1, x2, y2) {
        var slope = (y1-y2)/(x1-x2);
        var intercept = (x1*y2 - x2*y1)/(x1-x2);
        var distance = this.computeDistance(x1, y2, x2, y2);
        var angle = Math.acos((x2-x1) / distance);
        return angle;
    },

    nextPoint: function (time) {
        var space = this.speed * time;
        var next_x = this.x_last + space*Math.cos(this.angle);
        var next_y = this.y_last + space*Math.sin(this.angle);
        return [next_x, next_y];
    }
}

module.exports = model;
