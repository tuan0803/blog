const express = require('express');
const comment = require('../controllers/commentController');
const authenticateToken = require('../middlewares/authMiddleware');
const route = express.Router();



route.get('/comments', comment.getAllComments);
route.post('/comment/create',authenticateToken, comment.createComment);
route.patch('/comment/edit', authenticateToken, comment.editComment);
route.delete('/comment/remove/:comment_id', authenticateToken, comment.removeComment);

module.exports = route;