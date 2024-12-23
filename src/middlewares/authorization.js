const { Account } = require('../models/accountModel');

async function isAuthorized(req, res, next) {
    try {
        const { user_id } = req.user?.user_id;
        console.log(user_id)
        const { role, user_id: requester_id } = req.user; 

        if (role === 'admin' || parseInt(user_id) === requester_id) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Permission denied.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authorization error.',
            error: error.message,
        });
    }
}

module.exports = isAuthorized;
