const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
const permiss = require('../middlewares/authorization')

const route = express.Router();
route.get('/', userController.getUsers);
route.get('/:user_id', userController.getUser);
route.patch('/update/:user_id', auth, permiss, userController.updateUser);
route.delete('/remove/:user_id', auth, permiss, userController.removeUser);



module.exports = route;