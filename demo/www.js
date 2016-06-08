"use strict";

var path = require('path');
var express = require('express');
var app = express();
var PORT = 9999;

console.log('Comindware UI components demo page.');

// Overriding static content paths
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index', {
    });
});

var server = app.listen(PORT);
console.log('Server is listening on port ' + PORT);
