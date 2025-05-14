const express = require('express');
const router = express.Router();
const database = require('../config/database');
const pool = database.getConnection();
const authenticate = require('../middleware/auth');

/**
 * Create a comment
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { content, postId } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)',
            [content, postId, req.user.id]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

/**
 * Get a comment of a post
 * @param id The id of the post
 */
router.get('/:id', async (req, res) => {
    try {
        console.log(req.params.id)
        const [comments] = await pool.query(
            'SELECT comments.content, users.username, comments.created_at, comments.id, comments.post_id FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ?',
            [req.params.id]
        );
        res.json(comments);
    } catch (err) {
        res.status(500).send('Server error');
    }
})

/**
 * Like a comment
 */
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        await pool.execute(
            'INSERT IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.status(200).send('Liked');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

/**
 * Favourite a comment
 */
router.post('/:id/favorite', authenticate, async (req, res) => {
    try {
        await pool.execute(
            'INSERT IGNORE INTO comment_favorites (user_id, comment_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.status(200).send('Favorite');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

/**
 * Get the number of likes of a comment
 */
router.get('/:id/like', async (req, res) => {
    try {
        const [likes] = await pool.query(
            'SELECT COUNT(*) FROM comment_likes WHERE comment_id = ?',
            [req.params.id]
        );
        res.json(likes);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

/**
 * Is the comment liked by the user
 */

router.get('/:id/liked',authenticate , async (req, res) => {
    try {
        console.log("user id:",req.user.id)
        const [liked] = await pool.query(
            'SELECT COUNT(*) FROM comment_likes WHERE comment_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json(liked);
    } catch (err) {
        res.status(500).send('Server error');
    }
})

/**
 * Is the comment favourite by the user
 */

router.get('/:id/favorite',authenticate , async (req, res) => {
    try {
        const [favorite] = await pool.query(
            'SELECT COUNT(*) FROM comment_favorites WHERE comment_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json(favorite);
    } catch (err) {
        res.status(500).send('Server error');
    }
})

module.exports = router;