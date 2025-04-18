require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const appAPI = require('./controllerAPI/controller-api');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/api', appAPI);



const url = 'localhost';
const port = '8800';

app.listen(port, url, () => {
    console.log(`Server running at http://${url}:${port}`);
});