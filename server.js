require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const appAPI = require('./controllerAPI/controller-api');
const adminAPI = require('./controllerAPI/admin-api')
const userAPI = require('./controllerAPI/user-api')

const app = express();
app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/api', appAPI);
app.use('/api/admin', adminAPI);
app.use('/api/user', userAPI);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})



const url = 'localhost';
const port = '8800';

app.listen(port, url, () => {
    console.log(`Server running at http://${url}:${port}`);
});