"use strict";

var path = require('path');
var express = require('express');
var app = express();
var PORT = 9999;

console.log('Comindware UI components demo page.');

// Overriding static content paths
app.use(express.static('public'));
app.use('/core/resources', express.static('../resources'));
app.use('/resources/fonts', express.static('../resources/fonts'));
app.use('/resources/images', express.static('../resources/images'));
app.use('/resources/shared/img', express.static('../resources/images'));
app.use('/scripts/dist', express.static('../dist'));

app.get('/', function (req, res) {
    var compiled = req.query.compiled !== undefined;
    res.render('index', {
        compiled: compiled
    });
});

var server = app.listen(PORT);
console.log('Server is listening on port ' + PORT);
