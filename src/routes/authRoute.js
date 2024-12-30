const route = require('express').Router();
const account = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const authorization = require('../middlewares/authorization');
const { isAdmin } = require('../middlewares/checkRole')



route.post('/register', account.register);
route.post('/login', account.login);
route.post('/logout', authenticateToken, account.logout);
route.put('/changPassword/:user_id', authenticateToken, authorization, account.changePassword);
route.put('/verify', authenticateToken, isAdmin, account.verifyAccount);
module.exports = route;



/*
 
*/