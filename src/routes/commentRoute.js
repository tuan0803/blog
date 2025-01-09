const express = require('express');
const comment = require('../controllers/commentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const checkBlackList = require('../middlewares/checkBlackList');
const route = express.Router();



route.get('/comments', comment.getAllComments);
route.post('/comments/create', checkBlackList, authenticateToken, comment.createComment);
route.put('/comments/edit', checkBlackList, authenticateToken, comment.editComment);
route.delete('/comments/remove/:comment_id', checkBlackList, authenticateToken, comment.removeComment);

module.exports = route;