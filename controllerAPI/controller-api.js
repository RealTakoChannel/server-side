const express = require('express');
const router = express.Router();
const database = require('../config/database');
const jwt = require('jsonwebtoken');

const pool = database.getConnection();

const jwtKey = 'baca5d882bbced5e43ce691edde266291ea71d2dd7d710e70c1e9f6ad6837308';

// middleware to authenticate user
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('Unauthorized');

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, jwtKey);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};


//register route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        console.log("User Registered",result)
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

//login route
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


// post route
router.post('/posts', authenticate, async (req, res) => {
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

router.get('/posts', async (req, res) => {
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
router.post('/posts/:id/like', authenticate, async (req, res) => {
    try {
        await pool.execute(
            'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.status(200).send('Liked');
    } catch (err) {
        res.status(500).send('Server error');
    }
})

// comment route
router.post('/comments', authenticate, async (req, res) => {
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

router.get('/comments', async (req, res) => {
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
router.post('/comments/:id/like', authenticate, async (req, res) => {
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

router.post('/comments/:id/favorite', authenticate, async (req, res) => {
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