(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./location":3}],2:[function(require,module,exports){

var Converter = {
    pi: Math.PI,

    /* Ellipsoid model constants (actual values here are for WGS84) */
    sm_a: 6378137.0,
    sm_b: 6356752.314,
    sm_EccSquared: 6.69437999013e-03,

    UTMScaleFactor: 0.9996,


    /*
     * DegToRad
     *
     * Converts degrees to radians.
     *
     */
    DegToRad: function (deg)
    {
        return (deg / 180.0 * this.pi)
    },




    /*
     * RadToDeg
     *
     * Converts radians to degrees.
     *
     */
    RadToDeg: function (rad)
    {
        return (rad / this.pi * 180.0)
    },




    /*
     * ArcLengthOfMeridian
     *
     * Computes the ellipsoidal distance from the equator to a point at a
     * given latitude.
     *
     * Reference: Hoffmann-Wellenhof, B., Lichtenegger, H., and Collins, J.,
     * GPS: Theory and Practice, 3rd ed.  New York: Springer-Verlag Wien, 1994.
     *
     * Inputs:
     *     phi - Latitude of the point, in radians.
     *
     * Globals:
     *     this.sm_a - Ellipsoid model major axis.
     *     this.sm_b - Ellipsoid model minor axis.
     *
     * Returns:
     *     The ellipsoidal distance of the point from the equator, in meters.
     *
     */
    ArcLengthOfMeridian: function (phi)
    {
        var alpha, beta, gamma, delta, epsilon, n;
        var result;

        /* Precalculate n */
        n = (this.sm_a - this.sm_b) / (this.sm_a + this.sm_b);

        /* Precalculate alpha */
        alpha = ((this.sm_a + this.sm_b) / 2.0)
            * (1.0 + (Math.pow (n, 2.0) / 4.0) + (Math.pow (n, 4.0) / 64.0));

        /* Precalculate beta */
        beta = (-3.0 * n / 2.0) + (9.0 * Math.pow (n, 3.0) / 16.0)
            + (-3.0 * Math.pow (n, 5.0) / 32.0);

        /* Precalculate gamma */
        gamma = (15.0 * Math.pow (n, 2.0) / 16.0)
            + (-15.0 * Math.pow (n, 4.0) / 32.0);

        /* Precalculate delta */
        delta = (-35.0 * Math.pow (n, 3.0) / 48.0)
            + (105.0 * Math.pow (n, 5.0) / 256.0);

        /* Precalculate epsilon */
        epsilon = (315.0 * Math.pow (n, 4.0) / 512.0);

        /* Now calculate the sum of the series and return */
        result = alpha
            * (phi + (beta * Math.sin (2.0 * phi))
               + (gamma * Math.sin (4.0 * phi))
               + (delta * Math.sin (6.0 * phi))
               + (epsilon * Math.sin (8.0 * phi)));

        return result;
    },



    /*
     * UTMCentralMeridian
     *
     * Determines the central meridian for the given UTM zone.
     *
     * Inputs:
     *     zone - An integer value designating the UTM zone, range [1,60].
     *
     * Returns:
     *   The central meridian for the given UTM zone, in radians, or zero
     *   if the UTM zone parameter is outside the range [1,60].
     *   Range of the central meridian is the radian equivalent of [-177,+177].
     *
     */
    UTMCentralMeridian: function (zone)
    {
        var cmeridian;

        cmeridian = this.DegToRad (-183.0 + (zone * 6.0));

        return cmeridian;
    },



    /*
     * FootpointLatitude
     *
     * Computes the footpoint latitude for use in converting transverse
     * Mercator coordinates to ellipsoidal coordinates.
     *
     * Reference: Hoffmann-Wellenhof, B., Lichtenegger, H., and Collins, J.,
     *   GPS: Theory and Practice, 3rd ed.  New York: Springer-Verlag Wien, 1994.
     *
     * Inputs:
     *   y - The UTM northing coordinate, in meters.
     *
     * Returns:
     *   The footpoint latitude, in radians.
     *
     */
    FootpointLatitude: function (y)
    {
        var y_, alpha_, beta_, gamma_, delta_, epsilon_, n;
        var result;

        /* Precalculate n (Eq. 10.18) */
        n = (this.sm_a - this.sm_b) / (this.sm_a + this.sm_b);

        /* Precalculate alpha_ (Eq. 10.22) */
        /* (Same as alpha in Eq. 10.17) */
        alpha_ = ((this.sm_a + this.sm_b) / 2.0)
            * (1 + (Math.pow (n, 2.0) / 4) + (Math.pow (n, 4.0) / 64));

        /* Precalculate y_ (Eq. 10.23) */
        y_ = y / alpha_;

        /* Precalculate beta_ (Eq. 10.22) */
        beta_ = (3.0 * n / 2.0) + (-27.0 * Math.pow (n, 3.0) / 32.0)
            + (269.0 * Math.pow (n, 5.0) / 512.0);

        /* Precalculate gamma_ (Eq. 10.22) */
        gamma_ = (21.0 * Math.pow (n, 2.0) / 16.0)
            + (-55.0 * Math.pow (n, 4.0) / 32.0);

        /* Precalculate delta_ (Eq. 10.22) */
        delta_ = (151.0 * Math.pow (n, 3.0) / 96.0)
            + (-417.0 * Math.pow (n, 5.0) / 128.0);

        /* Precalculate epsilon_ (Eq. 10.22) */
        epsilon_ = (1097.0 * Math.pow (n, 4.0) / 512.0);

        /* Now calculate the sum of the series (Eq. 10.21) */
        result = y_ + (beta_ * Math.sin (2.0 * y_))
            + (gamma_ * Math.sin (4.0 * y_))
            + (delta_ * Math.sin (6.0 * y_))
            + (epsilon_ * Math.sin (8.0 * y_));

        return result;
    },



    /*
     * MapLatLonToXY
     *
     * Converts a latitude/longitude pair to x and y coordinates in the
     * Transverse Mercator projection.  Note that Transverse Mercator is not
     * the same as UTM; a scale factor is required to convert between them.
     *
     * Reference: Hoffmann-Wellenhof, B., Lichtenegger, H., and Collins, J.,
     * GPS: Theory and Practice, 3rd ed.  New York: Springer-Verlag Wien, 1994.
     *
     * Inputs:
     *    phi - Latitude of the point, in radians.
     *    lambda - Longitude of the point, in radians.
     *    lambda0 - Longitude of the central meridian to be used, in radians.
     *
     * Outputs:
     *    xy - A 2-element array containing the x and y coordinates
     *         of the computed point.
     *
     * Returns:
     *    The function does not return a value.
     *
     */
    MapLatLonToXY: function (phi, lambda, lambda0, xy)
    {
        var N, nu2, ep2, t, t2, l;
        var l3coef, l4coef, l5coef, l6coef, l7coef, l8coef;
        var tmp;

        /* Precalculate ep2 */
        ep2 = (Math.pow (this.sm_a, 2.0) - Math.pow (this.sm_b, 2.0)) / Math.pow (this.sm_b, 2.0);

        /* Precalculate nu2 */
        nu2 = ep2 * Math.pow (Math.cos (phi), 2.0);

        /* Precalculate N */
        N = Math.pow (this.sm_a, 2.0) / (this.sm_b * Math.sqrt (1 + nu2));

        /* Precalculate t */
        t = Math.tan (phi);
        t2 = t * t;
        tmp = (t2 * t2 * t2) - Math.pow (t, 6.0);

        /* Precalculate l */
        l = lambda - lambda0;

        /* Precalculate coefficients for l**n in the equations below
           so a normal human being can read the expressions for easting
           and northing
           -- l**1 and l**2 have coefficients of 1.0 */
        l3coef = 1.0 - t2 + nu2;

        l4coef = 5.0 - t2 + 9 * nu2 + 4.0 * (nu2 * nu2);

        l5coef = 5.0 - 18.0 * t2 + (t2 * t2) + 14.0 * nu2
            - 58.0 * t2 * nu2;

        l6coef = 61.0 - 58.0 * t2 + (t2 * t2) + 270.0 * nu2
            - 330.0 * t2 * nu2;

        l7coef = 61.0 - 479.0 * t2 + 179.0 * (t2 * t2) - (t2 * t2 * t2);

        l8coef = 1385.0 - 3111.0 * t2 + 543.0 * (t2 * t2) - (t2 * t2 * t2);

        /* Calculate easting (x) */
        xy[0] = N * Math.cos (phi) * l
            + (N / 6.0 * Math.pow (Math.cos (phi), 3.0) * l3coef * Math.pow (l, 3.0))
            + (N / 120.0 * Math.pow (Math.cos (phi), 5.0) * l5coef * Math.pow (l, 5.0))
            + (N / 5040.0 * Math.pow (Math.cos (phi), 7.0) * l7coef * Math.pow (l, 7.0));

        /* Calculate northing (y) */
        xy[1] = this.ArcLengthOfMeridian (phi)
            + (t / 2.0 * N * Math.pow (Math.cos (phi), 2.0) * Math.pow (l, 2.0))
            + (t / 24.0 * N * Math.pow (Math.cos (phi), 4.0) * l4coef * Math.pow (l, 4.0))
            + (t / 720.0 * N * Math.pow (Math.cos (phi), 6.0) * l6coef * Math.pow (l, 6.0))
            + (t / 40320.0 * N * Math.pow (Math.cos (phi), 8.0) * l8coef * Math.pow (l, 8.0));

        return;
    },



    /*
     * MapXYToLatLon
     *
     * Converts x and y coordinates in the Transverse Mercator projection to
     * a latitude/longitude pair.  Note that Transverse Mercator is not
     * the same as UTM; a scale factor is required to convert between them.
     *
     * Reference: Hoffmann-Wellenhof, B., Lichtenegger, H., and Collins, J.,
     *   GPS: Theory and Practice, 3rd ed.  New York: Springer-Verlag Wien, 1994.
     *
     * Inputs:
     *   x - The easting of the point, in meters.
     *   y - The northing of the point, in meters.
     *   lambda0 - Longitude of the central meridian to be used, in radians.
     *
     * Outputs:
     *   philambda - A 2-element containing the latitude and longitude
     *               in radians.
     *
     * Returns:
     *   The function does not return a value.
     *
     * Remarks:
     *   The local variables Nf, nuf2, tf, and tf2 serve the same purpose as
     *   N, nu2, t, and t2 in MapLatLonToXY, but they are computed with respect
     *   to the footpoint latitude phif.
     *
     *   x1frac, x2frac, x2poly, x3poly, etc. are to enhance readability and
     *   to optimize computations.
     *
     */
    MapXYToLatLon: function (x, y, lambda0, philambda)
    {
        var phif, Nf, Nfpow, nuf2, ep2, tf, tf2, tf4, cf;
        var x1frac, x2frac, x3frac, x4frac, x5frac, x6frac, x7frac, x8frac;
        var x2poly, x3poly, x4poly, x5poly, x6poly, x7poly, x8poly;

        /* Get the value of phif, the footpoint latitude. */
        phif = this.FootpointLatitude (y);

        /* Precalculate ep2 */
        ep2 = (Math.pow (this.sm_a, 2.0) - Math.pow (this.sm_b, 2.0))
            / Math.pow (this.sm_b, 2.0);

        /* Precalculate cos (phif) */
        cf = Math.cos (phif);

        /* Precalculate nuf2 */
        nuf2 = ep2 * Math.pow (cf, 2.0);

        /* Precalculate Nf and initialize Nfpow */
        Nf = Math.pow (this.sm_a, 2.0) / (this.sm_b * Math.sqrt (1 + nuf2));
        Nfpow = Nf;

        /* Precalculate tf */
        tf = Math.tan (phif);
        tf2 = tf * tf;
        tf4 = tf2 * tf2;

        /* Precalculate fractional coefficients for x**n in the equations
           below to simplify the expressions for latitude and longitude. */
        x1frac = 1.0 / (Nfpow * cf);

        Nfpow *= Nf;   /* now equals Nf**2) */
        x2frac = tf / (2.0 * Nfpow);

        Nfpow *= Nf;   /* now equals Nf**3) */
        x3frac = 1.0 / (6.0 * Nfpow * cf);

        Nfpow *= Nf;   /* now equals Nf**4) */
        x4frac = tf / (24.0 * Nfpow);

        Nfpow *= Nf;   /* now equals Nf**5) */
        x5frac = 1.0 / (120.0 * Nfpow * cf);

        Nfpow *= Nf;   /* now equals Nf**6) */
        x6frac = tf / (720.0 * Nfpow);

        Nfpow *= Nf;   /* now equals Nf**7) */
        x7frac = 1.0 / (5040.0 * Nfpow * cf);

        Nfpow *= Nf;   /* now equals Nf**8) */
        x8frac = tf / (40320.0 * Nfpow);

        /* Precalculate polynomial coefficients for x**n.
           -- x**1 does not have a polynomial coefficient. */
        x2poly = -1.0 - nuf2;

        x3poly = -1.0 - 2 * tf2 - nuf2;

        x4poly = 5.0 + 3.0 * tf2 + 6.0 * nuf2 - 6.0 * tf2 * nuf2
            - 3.0 * (nuf2 *nuf2) - 9.0 * tf2 * (nuf2 * nuf2);

        x5poly = 5.0 + 28.0 * tf2 + 24.0 * tf4 + 6.0 * nuf2 + 8.0 * tf2 * nuf2;

        x6poly = -61.0 - 90.0 * tf2 - 45.0 * tf4 - 107.0 * nuf2
            + 162.0 * tf2 * nuf2;

        x7poly = -61.0 - 662.0 * tf2 - 1320.0 * tf4 - 720.0 * (tf4 * tf2);

        x8poly = 1385.0 + 3633.0 * tf2 + 4095.0 * tf4 + 1575 * (tf4 * tf2);

        /* Calculate latitude */
        philambda[0] = phif + x2frac * x2poly * (x * x)
            + x4frac * x4poly * Math.pow (x, 4.0)
            + x6frac * x6poly * Math.pow (x, 6.0)
            + x8frac * x8poly * Math.pow (x, 8.0);

        /* Calculate longitude */
        philambda[1] = lambda0 + x1frac * x
            + x3frac * x3poly * Math.pow (x, 3.0)
            + x5frac * x5poly * Math.pow (x, 5.0)
            + x7frac * x7poly * Math.pow (x, 7.0);

        return;
    },




    /*
     * LatLonToUTMXY
     *
     * Converts a latitude/longitude pair to x and y coordinates in the
     * Universal Transverse Mercator projection.
     *
     * Inputs:
     *   lat - Latitude of the point, in radians.
     *   lon - Longitude of the point, in radians.
     *   zone - UTM zone to be used for calculating values for x and y.
     *          If zone is less than 1 or greater than 60, the routine
     *          will determine the appropriate zone from the value of lon.
     *
     * Outputs:
     *   xy - A 2-element array where the UTM x and y values will be stored.
     *
     * Returns:
     *   The UTM zone used for calculating the values of x and y.
     *
     */
    LatLonToUTMXY: function (lat, lon, zone, xy)
    {
        this.MapLatLonToXY (lat, lon, this.UTMCentralMeridian (zone), xy);

        /* Adjust easting and northing for UTM system. */
        xy[0] = xy[0] * this.UTMScaleFactor + 500000.0;
        xy[1] = xy[1] * this.UTMScaleFactor;
        if (xy[1] < 0.0)
            xy[1] = xy[1] + 10000000.0;

        return zone;
    },



    /*
     * UTMXYToLatLon
     *
     * Converts x and y coordinates in the Universal Transverse Mercator
     * projection to a latitude/longitude pair.
     *
     * Inputs:
     *	x - The easting of the point, in meters.
     *	y - The northing of the point, in meters.
     *	zone - The UTM zone in which the point lies.
     *	southhemi - True if the point is in the southern hemisphere;
     *               false otherwise.
     *
     * Outputs:
     *	latlon - A 2-element array containing the latitude and
     *            longitude of the point, in radians.
     *
     * Returns:
     *	The function does not return a value.
     *
     */
    UTMXYToLatLon: function (x, y, zone, southhemi, latlon)
    {
        var cmeridian;

        x -= 500000.0;
        x /= this.UTMScaleFactor;

        /* If in southern hemisphere, adjust y accordingly. */
        if (southhemi)
            y -= 10000000.0;

        y /= this.UTMScaleFactor;

        cmeridian = this.UTMCentralMeridian (zone);
        this.MapXYToLatLon (x, y, cmeridian, latlon);

        return;
    },




    fromLatLon: function (lat, lon)
    {
        var xy = new Array(2);

        // Compute the UTM zone.
        zone = Math.floor ((lon + 180.0) / 6) + 1;
        zone = this.LatLonToUTMXY (this.DegToRad (lat), this.DegToRad (lon), zone, xy);

        return {
            x: xy[0],
            y: xy[1],
            zone: zone
        }
    },


    toLatLon: function (x, y, zone)
    {
        var southhemi = false
        var latlon = new Array(2)
        this.UTMXYToLatLon (x, y, zone, southhemi, latlon);

        return {
            latitude: this.RadToDeg(latlon[0]),
            longitude: this.RadToDeg(latlon[1])
        }
    }
}

module.exports = Converter;

},{}],3:[function(require,module,exports){
// For more information http://diveintohtml5.info/geolocation.html

var ws = new WebSocket("ws://efficient-tracking.herokuapp.com");
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

    // this variable is crucial for the application. The client will communicate
    // a new position to the server if the predicted position and the current position
    // different more than this threshold.
    errorThreshold: 30,

    // this variable stores the time (ms) to which the gps is used to check the position
    gpsPollingTime: 10000,

    currentModel: null,

    init: function (map) {
        gmap = this.gmap || map; // initialize if gmap is null
        setTimeout( function() {
            geoPosition.getCurrentPosition(
                locationHandler.successCallback,
                locationHandler.errorCallback,
                { enableHighAccuracy: true });
            locationHandler.lookupPosition();
        }, 1000);
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
        locationHandler.seq_number += 1;
        console.log("Req. N. " + locationHandler.seq_number.toString())
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
                console.log('yay! we have a model')
                var predictedPosition = locationHandler.currentModel.nextPoint(positionObj.timestamp);

                locationHandler.addPrediction(predictedPosition.latitude, predictedPosition.longitude);

                var distance = locationHandler.computeDistance(positionObj, predictedPosition);
                if (distance > 1000) {
                    console.log("The distance is bigger than 1000!");
                }
                console.log(distance)

                if (distance > locationHandler.errorThreshold)
                    locationHandler.requestModelUpdate(positionObj);
            } else {
                console.log(':( no model yet..  a sending a request...')
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

module.exports = locationHandler;

},{"./model":4}],4:[function(require,module,exports){
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
        delta_t = (latLon2.timestamp - latLon1.timestamp) / 1000; // convert to seconds
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
        var time = timestamp - this.last_timestamp;
        var space = this.speed * time;
        var next_x = this.x_last + space*Math.cos(this.angle);
        var next_y = this.y_last + space*Math.sin(this.angle);
        return converter.toLatLon(next_x, next_y, this.zoneNumber);
    }
}

module.exports = Model;

},{"./converter":2}]},{},[1]);
