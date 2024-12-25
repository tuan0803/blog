const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; 
    if (!token) return res.status(403).json({ message: 'No token provided.' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;  
        next();
    });
}

module.exports = authenticateToken;
