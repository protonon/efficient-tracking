var converter = require('./converter');

var Model = {

    latLon1: null,
    latLon2: null,
    x_last: null,
    y_last: null,
    last_timestamp: null,
    speed: null,
    angle: null,
    zoneNumber: null,

    customInit: function (obj) {
        this.latLon1 =    obj.latLon1;
        this.latLon2 =    obj.latLon2;
        this.x_last  =    obj.x_last;
        this.y_last  =    obj.y_last;
        this.speed   =    obj.speed;
        this.angle   =    obj.angle;
        this.zoneNumber = obj.zoneNumber;
        this.last_timestamp = obj.last_timestamp;
        return this;
    },

    getModel: function (latLon1, latLon2) {
        this.latLon1 = latLon1;
        this.latLon2 = latLon2;

        var conversion1 = converter.fromLatLon(latLon1.latitude, latLon1.longitude)
        var conversion2 = converter.fromLatLon(latLon2.latitude, latLon2.longitude)
        this.x_last = conversion2.x;
        this.y_last = conversion2.y;
        this.zoneNumber = conversion2.zone;

        x1 = conversion1.x
        y1 = conversion1.y

        // FIX IT
        if (y1 === this.y_last) {
            y1++;
        }
        if (x1 === this.x_last) {
            x1++;
        }

//        if (latLon2.speed) {
//            this.speed = latLon2.speed;
//        } else {
        delta_t = (latLon2.timestamp - latLon1.timestamp) / 1000000000; // convert to seconds
        delta_s = this.computeDistanceBetweenLatLon(latLon1, latLon2);
        this.speed = delta_s / delta_t;
//        }
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

    nextPoint: function (timestamp) {
        console.log('computing next point...')

        var time = (timestamp - this.last_timestamp) / 1000000000;
        var space = this.speed * time;
        console.log('time - speed - space')
        console.log(time)
        console.log(this.speed)
        console.log(space)
        var next_x = this.x_last + space*Math.cos(this.angle);
        var next_y = this.y_last + space*Math.sin(this.angle);
        return converter.toLatLon(next_x, next_y, this.zoneNumber);
    }
}

module.exports = Model;
