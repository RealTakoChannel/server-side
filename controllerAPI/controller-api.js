const express = require('express');
const router = express.Router();
const database = require('../config/database');
const jwt = require('jsonwebtoken');

const pool = database.getConnection();

const authenticate = require('../middleware/auth');
const jwtKey = authenticate.jwtKey

//register route
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
            'INSERT IGNORE INTO post_like (user_id, post_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.status(200).send('Liked');
    } catch (err) {
        res.status(500).send('Server error');
    }
})

router.post('/posts/:id/favourite', authenticate, async (req, res) => {
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

router.get('/getPostLikes/:id', async (req, res) => {
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

router.get('/getPostUserLiked/:id',authenticate , async (req, res) => {
    try {
        const [posts] = await pool.query(
            'SELECT * FROM post_like WHERE user_id = ?',
            [req.params.id]
        );
        res.json(posts);
    } catch (err) {
        res.status(500).send('Server error');
    }
})

router.get('/getPostUserFavourite/:id',authenticate , async (req, res) => {
    try {
        const [posts] = await pool.query(
            'SELECT * FROM post_favourites WHERE user_id = ?',
            [req.params.id]
        );
        res.json(posts);
    } catch (err) {
        res.status(500).send('Server error');
    }
})
router.get('/getPostUserPosted/:id',authenticate , async (req, res) => {
    try {
        const [posts] = await pool.query(
            'SELECT * FROM posts WHERE user_id = ?',
            [req.params.id]
        );
        res.json(posts);
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

router.get('/comments/:id', async (req, res) => {
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

router.get('/getCommentLikes/:id', async (req, res) => {
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

router.post('/comments/:id/favorite', authenticate, async (req, res) => {
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

// score route

router.get('/scores',async (req,res)=>{
    try{
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