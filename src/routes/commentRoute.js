const express = require('express');
const comment = require('../controllers/commentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const checkBlackList = require('../middlewares/checkBlackList');
const route = express.Router();



route.get('/comments', comment.getAllComments);
route.post('/comment/create', checkBlackList, authenticateToken, comment.createComment);
route.put('/comment/edit', checkBlackList, authenticateToken, comment.editComment);
route.delete('/comment/remove/:comment_id', checkBlackList, authenticateToken, comment.removeComment);

module.exports = route;