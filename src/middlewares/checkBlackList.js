const redisClient = require('../utils/redisClient'); 

async function getCache(key) {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
        return JSON.parse(cachedData);
    } else {
        return null;
    }
}

const checkBlackList = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Invalid token.' });
    }

    try {
        const result = await getCache(token); 

        if (result) {
            return res.status(401).json({ success: false, message: 'This token has expired.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal redis server error.', error: error.message });
    }
}

module.exports = checkBlackList;
