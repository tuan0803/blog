const route = require('express').Router();
const account = require('../controllers/authController');


route.post('/register', account.register);
route.post('/login', account.login);

module.exports = route;