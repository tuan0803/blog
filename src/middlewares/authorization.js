const { Account } = require('../models/accountModel');

async function isAuthorized(req, res, next) {
    try {
        console.log('res type:', typeof res);

        const user_id = req.params.user_id;
        const { role, user_id: requester_id } = req.user; 
        console.log(role)
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
