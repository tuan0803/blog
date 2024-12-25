const route = require('express').Router();
const account = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');
const authorization = require('../middlewares/authorization');



route.post('/register', account.register);
route.post('/login', account.login);
route.post('/logout', auth, account.logout);
route.put('/changPassword/:user_id', auth, authorization, account.changePassword);

module.exports = route;