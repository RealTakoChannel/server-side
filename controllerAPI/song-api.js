const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const database = require("../config/database");
const pool = database.getConnection();

router.get('/',authenticate, async (req, res) => {
    try {
        const [songs] = await pool.query(
            'SELECT * FROM songs ORDER BY created_at DESC'
        );
        res.json(songs);
    }
    catch (err) {
        res.status(500).send('Server Error');
    }
})

router.post('/',authenticate, async (req, res) => {
    try {
        const { title, artist, lyrics } = req.body;
        const [result] = await pool.query(
            'INSERT INTO songs (title, artist, lyrics) VALUES (?, ?, ?)',
            [title, artist, lyrics]
        );
        res.status(201).json({ id: result.insertId });
    }
    catch (err) {
        res.status(500).send('Server Error');
    }
})
module.exports = router;