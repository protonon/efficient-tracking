var express = require('express');
var app = express();

var server = app.listen(8080, function () {
    console.log('Listening on port %d', server.address().port);
});

app.set('views', './public/views');
app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('index');
});


