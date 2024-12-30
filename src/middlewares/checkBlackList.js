const BlackList = require('../models/blackListModel'); 



const isToken = async (token) =>{
    try {
        const blacklistToken = await BlackList.findOne({
            where: {
                token: token,
                expire_at: { [Sequelize.Op.gt]: new Date() }, 
            },
        });
        
        if(blacklistToken) {
            return JSON.parse(blacklistToken);
        }
        return null;
    } catch(e){
        console.log(e);
        return false;
    }
}

const checkBlackList = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Invalid token.' });
    }

    try {
        const result = await isToken(token); 

        if (result) {
            return res.status(401).json({ success: false, message: 'This token has expired.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal redis server error.', error: error.message });
    }
}




// async function getCache(key) {
//     const cachedData = await redisClient.get(key);
//     if (cachedData) {
//         return JSON.parse(cachedData);
//     } else {
//         return null;
//     }
// }



module.exports = checkBlackList;
