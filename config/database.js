const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const http = require('http');

var db = mysql.createConnection({

})
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '352981790',
    database: 'guitar_learn_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    getConnection: () => {
        return pool;
    }
}