var express = require('express');
var app = express();
var PORT = 9999;

// Overriding static content paths
app.use(express.static('.'));
app.use('/core/resources', express.static('../resources'));
app.use('/resources/fonts', express.static('../resources/fonts'));
app.use('/resources/images', express.static('../resources/images'));
app.use('/scripts/comindware', express.static('../dist'));

var server = app.listen(PORT);
console.log('Server is listening on port ' + PORT);
