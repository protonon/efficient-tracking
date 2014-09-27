var express = require('express'),
ws = require('websocket.io'),
redis = require('redis');

var app = express();
app.set('port', (process.env.PORT || 8080))

var httpServer = app.listen(app.get('port'), function () {
    console.log('Listening on port %d', httpServer.address().port);
});


var wsServer = ws.attach(httpServer);

if (process.env.REDISTOGO_URL) {
    var rtg = require("url").parse(process.env.REDISTOGO_URL);
    var redisClient = redis.createClient(rtg.port, rtg.hostname);
    redisClient.auth(rtg.auth.split(":")[1], function (err) { if (err) throw err; });
} else {
    var redisClient = redis.createClient();
}

// Redis
redisClient.on("error", function (err) {
    console.log("Error " + err);
});


// Express
app.set('views', './public/views');
app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('index');
});

// Websocket
wsServer.on('connection', function (socket) {
    var id = Math.ceil(Math.random() * 10000);
    console.log('Socke open. ID: ' + id);

    socket.on('message', function (data) {
        redisClient.lpush(id, data, redis.print);
    });

    socket.on('close', function () {
        redisClient.del(id);
        console.log('Socket closed. Bye!');
    });

});
