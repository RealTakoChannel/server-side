const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

router.get('/scores',authenticate, async (req, res) => {
    try {
        const [scores] = await pool.query(`
      SELECT s.*, u.username 
      FROM scores s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
        res.json(scores);
    }
    catch (err) {
        res.status(500).send('Server Error');
    }
    }
)

module.exports = router;