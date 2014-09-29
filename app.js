var express = require('express'),
ws = require('websocket.io'),
redis = require('redis');

var app = express();
app.set('port', (process.env.PORT || 8080))

var model = require('./model');

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


function modelUpdate(id, newPosition) {
    redisClient.lpop(id, function (err, lastPosition) {
        if (err) {
            throw err;
        } else {
            // I want to keep the whole history so I push it back
            redisClient.lpush(id, lastPosition);

            // Push the new position
            redisClient.lpush(id, JSON.stringify(newPosition));

            // Get the new model
            newModel = model.getModel(JSON.parse(lastPosition).position,
                                      newPosition.position);
            return newModel;
        }
    });
}

// Websocket
wsServer.on('connection', function (socket) {
    var id = Math.ceil(Math.random() * 10000);
    console.log('Socket open with ID: ' + id);

    socket.on('message', function (data) {
        var obj = JSON.parse(data)
        if (obj.type == 'position') {
            redisClient.lpush(id, data, redis.print);
        }
        else if (obj.type == 'requestModelUpdate') {
            modelUpdate(id, obj);
        }
    });

    socket.on('error', function () {
        redisClient.del(id);
        console.log('[ERROR] An error occurred. Closing gracefully...')
        socket.close();
    });

    socket.on('close', function () {
        redisClient.del(id);
        console.log('[CLOSE] Socket closed. Bye!');
        socket.close();
    });

});
