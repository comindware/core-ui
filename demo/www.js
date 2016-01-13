var path = require('path');
var express = require('express');
var app = express();
var PORT = 9999;

console.log('Comindware UI components demo page. Use options /?compiled (like http://localhost:9999/?compiled) to run with bundled version.');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Overriding static content paths
app.use(express.static('public'));
app.use('/core/resources', express.static('../resources'));
app.use('/resources/fonts', express.static('../resources/fonts'));
app.use('/resources/images', express.static('../resources/images'));
app.use('/resources/shared/img', express.static('../resources/images'));
app.use('/scripts/comindware', express.static('../dist'));
app.use('/scripts/core/js/comindware', express.static('../js/comindware'));
app.use('/scripts/core/js/core', express.static('../js/core'));
app.use('/scripts/core/js/lib', express.static('../js/lib'));

app.get('/', function (req, res) {
    var compiled = req.query.compiled !== undefined;
    res.render('index', {
        compiled: compiled
    });
});

var server = app.listen(PORT);
console.log('Server is listening on port ' + PORT);
