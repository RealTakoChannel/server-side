const express = require('express');
const router = express.Router();
const database = require('../config/database');
const jwt = require('jsonwebtoken');
const pool = database.getConnection();

const authenticate = require('../middleware/auth');
const jwtKey = authenticate.jwtKey

/************************************************************************************************
 * 管理员账号系统
 */
// 登录后注册管理员账号
router.post('/register',authenticate, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // 检查用户名是否已存在
        const [users] = await pool.query(
            'SELECT id FROM admin WHERE username = ?',
            [username]
        );
        if (users.length > 0) {
            return res.status(400).json({
                error: 'Username Exists'
            });
        }
        // 检查邮箱是否已存在
        const [emails] = await pool.query(
            'SELECT id FROM admin WHERE email = ?',
            [email]
        );
        if (emails.length > 0) {
            return res.status(400).json({
                error: 'Email Exists'
            });
        }
        // 创建管理员账号
        const [result] = await pool.query(
            'INSERT INTO admin (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).send('Server error');
    }
});


// 处理登录
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM admin WHERE email = ? AND password = ?',
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
/************************************************************************************************
 * 管理员操作用户系统
 */
// 实现分页查询users 返回用户信息,总用户数，页码数
// 默认提供第一页
router.get('/users/',authenticate, async (req, res) => {
    try {
        const pageSize = 10;
        const [users] = await pool.query(
            'SELECT * FROM users LIMIT ? ',
            [pageSize]
        );
        const [totalUsers] = await pool.query(
            'SELECT COUNT(*) AS total FROM users'
        );
        const total = totalUsers[0].total;
        const totalPages = Math.ceil(total / pageSize);
        res.json({ users, total, totalPages });
    } catch (err) {
        res.status(500).send('Server error');
    }
})

// 指定页码查询
router.get('/users/:page',authenticate, async (req, res) => {
    try {
        const page = parseInt(req.params.page);
        const pageSize = 10;
        const offset = (page - 1) * pageSize;
        const [users] = await pool.query(
            'SELECT * FROM users LIMIT ? OFFSET ?',
            [pageSize, offset]
        );
        const [totalUsers] = await pool.query(
            'SELECT COUNT(*) AS total FROM users'
        );
        const total = totalUsers[0].total;
        const totalPages = Math.ceil(total / pageSize);
        res.json({ users, total, totalPages });
    } catch (err) {
        res.status(500).send('Server error');
    }
})

// 添加用户
router.post('/user',authenticate, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// 修改用户信息
router.put('/user/:id',authenticate, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const [result] = await pool.query(
            'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
            [username, email, password, req.params.id]
        );
        res.status(200).json({ result: result.affectedRows });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// 删除用户
router.delete('/user/:id',authenticate, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ?',
            [req.params.id]
        );
        res.status(200).json({ result: result.affectedRows });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// 使用id获取单个用户信息
router.get('/user/:id',authenticate, async (req, res) => {
    try {
        const [user] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [req.params.id]
        );
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// 分页通过关键字来查找用户 返回用户信息,总用户数，页码数
// 默认第一页
router.post('/user/search',authenticate, async (req, res) => {
    try {
        const { keyword } = req.body;
        const pageSize = 10;
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? LIMIT ?',
            [`%${keyword}%`, `%${keyword}%`, pageSize]
        );
        const [totalUsers] = await pool.query(
            'SELECT COUNT(*) AS total FROM users WHERE username LIKE ? OR email LIKE ?',
            [`%${keyword}%`, `%${keyword}%`]
        );
        const total = totalUsers[0].total;
        const totalPages = Math.ceil(total / pageSize);
        res.json({ users, total, totalPages });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// 其他页
router.post('/user/search/:page',authenticate, async (req, res) => {
    try {
        const { keyword } = req.body;
        const page = parseInt(req.params.page);
        const pageSize = 10;
        const offset = (page - 1) * pageSize;
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? LIMIT ? OFFSET ?',
            [`%${keyword}%`, `%${keyword}%`, pageSize, offset]
        );
        const [totalUsers] = await pool.query(
            'SELECT COUNT(*) AS total FROM users WHERE username LIKE ? OR email LIKE ?',
            [`%${keyword}%`, `%${keyword}%`]
        );
        const total = totalUsers[0].total;
        const totalPages = Math.ceil(total / pageSize);
        res.json({ users, total, totalPages });
    } catch (err) {
        res.status(500).send('Server error');
    }
});
/************************************************************************************************
 * 管理员操作帖子系统
 */
// 分页显示帖子 id倒序
router.get('/posts',authenticate, async (req, res) => {
    try {
        const pageSize = 10;
        const [posts] = await pool.query(
            'SELECT * FROM posts ORDER BY id DESC LIMIT ?'
            [pageSize]
        );
        const [totalPosts] = await pool.query(
            'SELECT COUNT(*) AS total FROM posts'
        );
        const total = totalPosts[0].total;
        const totalPages = Math.ceil(total / pageSize);
        res.json({posts, total, totalPages});
    } catch (err) {
        res.status(500).send('Server error');
    }
})

// 其他页的帖子
router.get('/posts/:page',authenticate, async (req, res) => {
    try {
        const page = parseInt(req.params.page);
        const pageSize = 10;
        const offset = (page - 1) * pageSize;
        const [posts] = await pool.query(
            'SELECT * FROM posts ORDER BY id DESC LIMIT ? OFFSET ?',
            [pageSize, offset]
        );
        const [totalPosts] = await pool.query(
            'SELECT COUNT(*) AS total FROM posts'
        );
        const total = totalPosts[0].total;
        const totalPages = Math.ceil(total / pageSize);
        res.json({posts, total, totalPages});
    } catch (err) {
        res.status(500).send('Server error');
    }
})

// 删除帖子
router.delete('/posts/:id',authenticate, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM posts WHERE id = ?',
            [req.params.id]
        );
        res.status(200).json({ result: result.affectedRows });
    } catch (err) {
        res.status(500).send('Server error');
    }
})
/************************************************************************************************
 * 管理员操作评论系统
 */

// 获取指定帖子下的评论
router.get('/comments/:id', async (req, res) => {
    try {
        const [comments] = await pool.query(
            'SELECT comments.content, users.username, comments.created_at, comments.id, comments.post_id FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ?',
            [req.params.id]
        );
        res.json(comments);
    } catch (err) {
        res.status(500).send('Server error');
    }
    })

// 删除评论
router.delete('/comments/:id',authenticate, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM comments WHERE id = ?',
            [req.params.id]
        );
        res.status(200).json({ result: result.affectedRows });
    } catch (err) {
        res.status(500).send('Server error');
    }
})
module.exports = router;