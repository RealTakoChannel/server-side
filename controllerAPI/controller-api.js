const express = require('express');
const router = express.Router();
const database = require('../config/database');
const authenticate = require('../middleware/authenticate');

const pool = database.getConnection();


// post route
router.get('api/hello',async(req,res)=>{
    res.status(200).send('hello world');
} )



router.post('/api/posts', authenticate, async (req, res) => {
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

router.get('/api/posts', async (req, res) => {
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

// comment route
router.post('/api/comments', authenticate, async (req, res) => {
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

router.get('/api/comments', async (req, res) => {
    try {
        const { postId } = req.query;
        const [comments] = await pool.query(`
      SELECT c.*, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);
        res.json(comments);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// like route
router.post('/api/comments/:id/like', authenticate, async (req, res) => {
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

router.post('/api/comments/:id/favorite', authenticate, async (req, res) => {
    try {
        await pool.execute(
            'INSERT IGNORE INTO comment_favorites (user_id, comment_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.status(200).send('Favorited');
    } catch (err) {
        res.status(500).send('Server error');
    }
});




module.exports = router;