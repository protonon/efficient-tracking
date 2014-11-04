var express = require('express'),
ws = require('websocket.io'),
redis = require('redis');

var app = express();
app.set('port', (process.env.PORT || 8080))

var model = require('./public/model');

var currentModel = null;

var httpServer = app.listen(app.get('port'), function () {
    console.log('Listening on port %d', httpServer.address().port);
});

var wsServer = ws.attach(httpServer);

// heroku deploy
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
app.use(express.static(__dirname + '/public', __dirname + '/shared'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('index');
});


function modelUpdate(socket, newPosition, callback) {
    var id = socket.user_id;
    redisClient.lpop(id, function (err, lastPosition) {
        if (err) {
            throw err;
        } else {
            // I want to keep the whole history so I push it back
            redisClient.lpush(id, lastPosition);

            // Push the new position
            redisClient.lpush(id, JSON.stringify(newPosition));

            // Get the new model with the last two position
            newModel = model.getModel(JSON.parse(lastPosition).position,
                                            newPosition.position);
            callback(socket, newModel);
        }
    });
}


function updateModelAndSend(socket, model) {
    currentModel = model;
    socket.send(JSON.stringify(currentModel));
}


// Websocket
wsServer.on('connection', function (socket) {
    socket.user_id = Math.ceil(Math.random() * 10000);
    console.log('Socket open with ID: ' + socket.user_id);

    socket.on('message', function (data) {
        console.log('Message received on sokedID: ' + socket.user_id);
        var obj = JSON.parse(data)
        if (obj.type == 'position') {
            redisClient.lpush(socket.user_id, data, redis.print);
        }
        else if (obj.type == 'requestModelUpdate') {
            modelUpdate(socket, obj, updateModelAndSend);
        }
    });

    socket.on('error', function () {
        //redisClient.del(socket.user_id);
        console.log('[ERROR] An error occurred. Closing gracefully...')
        socket.close();
    });

    socket.on('close', function () {
        //redisClient.del(socket.user_id);
        console.log('[CLOSE] Socket closed. Bye!');
        socket.close();
    });

});
