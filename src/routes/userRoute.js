const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const isAuthorized = require('../middlewares/authorization');
const checkBlackList = require('../middlewares/checkBlackList');

const route = express.Router();
route.get('/', userController.getUsers);
route.get('/:user_id', checkBlackList, userController.getUser);
route.put('/update/:user_id', checkBlackList, authenticateToken, isAuthorized, userController.updateUser);
route.delete('/remove/:user_id', checkBlackList, authenticateToken, isAuthorized, userController.removeUser);



module.exports = route;