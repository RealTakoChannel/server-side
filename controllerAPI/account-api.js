const express = require('express');
const router = express.Router();
const database = require('../config/database');
const jwt = require('jsonwebtoken');

const pool = database.getConnection();

const authenticate = require('../middleware/auth');
const jwtKey = authenticate.jwtKey

/**
 * Register a new user
 */
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const [users] = await pool.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
    );

    if (users.length > 0) {
        return res.status(400).json({
            error: 'Username Exists'
        });
    }

    const [emails] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (emails.length > 0) {
        return res.status(400).json({
            error: 'Email Exists'
        });
    }
    console.log(req.body);
    try {
        console.log(username, email, password)
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        console.log("User Registered",result)
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');

    }
});

/**
 * Existing user login
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length === 0) {
            console.log("Invalid email or password",rows)
            return res.status(401).send('Invalid email or password');
        }
        const user = rows[0];
        jwt.sign({email, id: user.id, username: user.username },
            jwtKey,
            {expiresIn: '1d'},
            (err, token) => res.status(200).json({
                message:"success login",
                email,
                token
            })
        );
        console.log("Login Success",rows)
    } catch (err) {
        res.status(500).send('Server error');
        console.log("Login Failed",err)
    }
});

router.get('/afterLogin',async (req, res) => {
    const header = req.headers;
    const token = header.authorization.split(' ')[1];
    console.log(token)
    jwt.verify(token, jwtKey, (err, payload) => {
        if(err){
            res.status(401).send('Unauthorized');
        }
        else{
            res.status(200).json({message:"Success!", payload});
        }
    })
})


module.exports = router;