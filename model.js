// http://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html

var orb = require('orbjs');

var lat1 = 45.0;
var lon1 = 11.0;

var lat2 = 45.1;
var lon2 = 11.1;

var earthRadius = 6378.1;
var ellipticity = 0.00335;
var height = 0;


//geodedic
var cartesian1 = orb.transformations.geodeticToCartesian(
    [lat1, lon1, earthRadius, height, ellipticity]
);

var cartesian2 = orb.transformations.geodeticToCartesian(
    [lat2, lon2, earthRadius, height, ellipticity]
);

//spherical
var cartesian1s = orb.transformations.sphericalToCartesian(
    [lat1, lon1, earthRadius]
);

var cartesian2s = orb.transformations.sphericalToCartesian(
    [lat2, lon2, earthRadius]
);

var computeLine = function (x1, y1, x2, y2) {
    var slope = (y1-y2)/(x1-x2);
    var intercept = (x1*y2 - x2*y1)/(x1-x2);
    return [slope, intercept]
}

var line = computeLine(cartesian1[0], cartesian1[1], cartesian2[0], cartesian2[1])
console.log(line);
