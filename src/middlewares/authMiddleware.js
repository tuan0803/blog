const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                reject(err);  
            } else {
                resolve(user); 
            }
        });
    });
}

async function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; 
    if (!token) return res.status(403).json({ message: 'No token provided.' });
    try {
        const user = await verifyToken(token);  
        req.user = user; 
        next(); 
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });  // Nếu có lỗi, trả về lỗi
    }
}

module.exports = { authenticateToken, verifyToken};
