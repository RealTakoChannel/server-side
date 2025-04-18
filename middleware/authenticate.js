const jwt = require("jsonwebtoken");

const jwtKey = 'baca5d882bbced5e43ce691edde266291ea71d2dd7d710e70c1e9f6ad6837308';

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

module.exports = authenticate;