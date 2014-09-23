var express = require('express');
var ws = require('websocket.io');

var app = express();

var httpServer = app.listen(8080, function () {
    console.log('Listening on port %d', httpServer.address().port);
});

var wsServer = ws.attach(httpServer);

app.set('views', './public/views');
app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('index');
});


wsServer.on('connection', function (client) {
    console.log('connected');

    client.on('message', function (data) {
        console.log(data);
    });

    client.on('close', function () {
        console.log('closed');
    })

});
