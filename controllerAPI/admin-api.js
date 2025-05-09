const express = require('express');
const router = express.Router();
const database = require('../config/database');
const jwt = require('jsonwebtoken');
const pool = database.getConnection();

const authenticate = require('../middleware/auth');
const jwtKey = authenticate.jwtKey

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

// 实现分页查询users 返回页码总用户数量，页码数量，所在页数
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
        res.status(200).json({ result: "success" });
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
        res.status(200).json({ result: "success" });
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

// 查找用户
router.post('/user/search',authenticate, async (req, res) => {
    try {
        const { keyword } = req.body;
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username LIKE ? OR email LIKE ?',
            [`%${keyword}%`, `%${keyword}%`]
        );
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;