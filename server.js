require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');



const loginAPI = require('./controllerAPI/account-api');
const adminAPI = require('./controllerAPI/admin-api')
const userAPI = require('./controllerAPI/user-api')
const postAPI = require('./controllerAPI/post-api')
const commentAPI = require('./controllerAPI/comment-api')
const songAPI = require('./controllerAPI/song-api')
const aiAPI = require('./controllerAPI/ai-api')

const app = express();

app.use(cors({origin: '*'}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/api', loginAPI);
app.use('/api/admin', adminAPI);
app.use('/api/user', userAPI);
app.use('/api/posts', postAPI);
app.use('/api/comments', commentAPI);
app.use('/api/songs', songAPI);
app.use('/api/chat', aiAPI);




const url = 'localhost';
const port = '8800';

app.listen(port, url, () => {
    console.log(`Server running at http://${url}:${port}`);
});