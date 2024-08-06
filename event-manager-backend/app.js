const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');  // Import cors
const routes = require('./routes');

app.use(bodyParser.json());
app.use(cors());  // Use cors middleware
app.use('/api', routes);
app.use(cors({
    origin: 'http://localhost:3000'
}));

module.exports = app;