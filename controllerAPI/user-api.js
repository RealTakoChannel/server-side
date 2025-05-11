const express = require('express');
const router = express.Router();
const database = require('../config/database');
const jwt = require('jsonwebtoken');

const pool = database.getConnection();

const authenticate = require('../middleware/auth');
const jwtKey = authenticate.jwtKey

router.get('/info',authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT email, username, id, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }
        const user = rows[0];
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
})

router.put('/info',authenticate, async (req, res) => {
    try {
        const { username, email, password, id } = req.body;
        const [result] = await pool.query(
            'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
            [username, email, password, id]
        );
        res.status(200).json({ result: result.affectedRows });
    } catch (err) {
        res.status(500).send('Server error');
    }
});





module.exports = router;