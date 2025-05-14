const express = require('express');
const router = express.Router();
const database = require('../config/database');
const pool = database.getConnection();
const authenticate = require('../middleware/auth');


/**
 * Get all posts
 */
router.get('/', async (req, res) => {
    try {
        const [posts] = await pool.query(`
      SELECT p.*, u.username 
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
        res.json(posts);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

/**
 * Create a post
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'INSERT INTO posts (content, user_id) VALUES (?, ?)',
            [req.body.content, req.user.id]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).send('Server error');
    }
});
/**
 * Show how many likes a post has
 */
router.get('/:id/like',authenticate , async (req, res) => {
    try {
        const [likes] = await pool.query(
            'SELECT COUNT(*) FROM post_like WHERE post_id = ?',
            [req.params.id]
        );
        res.json(likes);
    } catch (err) {
        res.status(500).send('Server error');
    }
})

/**
 * Like a post
 */
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        await pool.execute(
            'INSERT IGNORE INTO post_like (user_id, post_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.status(200).send('Liked');
    } catch (err) {
        res.status(500).send('Server error');
    }
})

/**
 * Favourite a post
 */
router.post('/:id/favourite', authenticate, async (req, res) => {
    try {
        await pool.execute(
            'INSERT IGNORE INTO post_favourites (user_id, post_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.status(200).send('Favourite');
    } catch (err) {
        res.status(500).send('Server error');
    }
})

module.exports = router;