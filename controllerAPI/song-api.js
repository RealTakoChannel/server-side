const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const database = require("../config/database");
const pool = database.getConnection();

router.get('/',authenticate, async (req, res) => {
    try {
        const [songs] = await pool.query(
            'SELECT title, artist FROM songs ORDER BY created_at DESC'
        );
        res.json(songs);
    }
    catch (err) {
        res.status(500).send('Server Error');
    }
})

router.get('/:id',authenticate, async (req, res) => {
    try {
        const [song] = await pool.query(
            'SELECT * FROM songs WHERE id = ?',
            [req.params.id]
        );
        res.json(song);
    }
    catch (err) {
        res.status(500).send('Server Error');
    }
})

router.post('/',authenticate, async (req, res) => {
    try {
        const { title, artist, lyrics } = req.body;
        if (!Array.isArray(lyrics)) {
            return res.status(400).json({ error: "Lyrics must be an array" });
        }
        const lyricsJson = JSON.stringify(lyrics);
        const [result] = await pool.query(
            'INSERT INTO songs (title, artist, lyrics) VALUES (?, ?, ?)',
            [title, artist, lyricsJson]
        );
        res.status(201).json({
            id: result.insertId,
            message: "Song created successfully",
            lyrics: lyrics
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error', details: err});
    }
});
module.exports = router;