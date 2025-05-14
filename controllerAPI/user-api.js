const express = require('express');
const router = express.Router();
const database = require('../config/database');
const pool = database.getConnection();
const authenticate = require('../middleware/auth');


/**
 * Get user's information
 */
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

/**
 * Change user's password
 */
router.put('/changePassword',authenticate, async (req, res) => {
    try {
        const {password} = req.body;
        const id = req.user.id
        console.log("user "+id+" try to edit password to "+ password)
        const [result] = await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [password, id]
        );
        console.log("success")
        res.status(200).json({ result: result.affectedRows });
    } catch (err) {
        res.status(500).send({message: 'Server error', err});
    }
});

/**
 * Get user's favourite posts
 */
router.get('/posts/favourite',authenticate , async (req, res) => {
    try {
        console.log(req.user.id)
        const [posts] = await pool.query(
            'SELECT * FROM post_favourites JOIN posts ON post_favourites.post_id = posts.id WHERE post_favourites.user_id = ?',
            [req.user.id]
        );
        res.json(posts);
    } catch (err) {
        res.status(500).send({message: 'Server error', err});
    }
})

/**
 * Delete user's favourite post
 */
router.delete('/posts/favourite/:id',authenticate , async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM posts_favourites WHERE user_id = ? AND post_id = ?',
            [req.user.id, req.params.id]
        );
        res.status(200).json({ result: result.affectedRows });
    } catch (err) {
        res.status(500).send({message: 'Server error', err});
    }
})

/**
 * Get user's posts
 */
router.get('/posts',authenticate , async (req, res) => {
    try {
        const [posts] = await pool.query(
            'SELECT * FROM posts WHERE user_id = ?',
            [req.user.id]
        );
        res.json(posts);
    } catch (err) {
        res.status(500).send({message: 'Server error', err});
    }
})



module.exports = router;