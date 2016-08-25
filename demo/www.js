"use strict";

var path = require('path');
var express = require('express');
var app = express();
var PORT = 9999;

console.log('Comindware UI components demo page.');

app.use(express.static('public/assets'));

app.listen(PORT);
console.log('Server is listening on port ' + PORT);
