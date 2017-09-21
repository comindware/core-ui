'use strict';

const path = require('path');
const express = require('express');
const app = express();
const PORT = 9999;

console.log('Comindware UI components demo page.');

app.use(express.static('public/assets'));

app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
