// http://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html

var coordinator = require('coordinator');
var fromLatLong = coordinator('latlong', 'utm');
var toLatLong = coordinator('utm', 'latlong');

var computeLine = function (x1, y1, x2, y2) {
    var slope = (y1-y2)/(x1-x2);
    var intercept = (x1*y2 - x2*y1)/(x1-x2);
    var delta_x = x2 - x1;
    var delta_y = y2 - y1;
    var distance = Math.sqrt(delta_x*delta_x + delta_y*delta_y);
    var angle = Math.acos(delta_x / distance);
    return [slope, intercept, angle, distance]
}

var nextPoint = function (x_last, y_last, angle, speed, time) {
    var space = speed * time;
    return [x_last + space*Math.cos(angle), y_last + space*Math.sin(angle)];
}
