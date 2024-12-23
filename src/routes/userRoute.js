const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
const isAuthorized = require('../middlewares/authorization');

const route = express.Router();
route.get('/', userController.getUsers);
route.get('/:user_id', userController.getUser);
route.put('/update/:user_id', auth, isAuthorized, userController.updateUser);
route.delete('/remove/:user_id', auth, isAuthorized, userController.removeUser);



module.exports = route;