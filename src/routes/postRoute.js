const express = require('express');
const post = require('../controllers/postController');
const authenticateToken = require('../middlewares/authMiddleware');

const route = express.Router();

route.get('/posts', post.getAllPosts);
route.get('/posts/search', post.getPost);
route.post('/createPost', authenticateToken, post.createPost);
route.patch('/editPost/:post_id', authenticateToken, post.updatePost);
route.delete('/deletePost/:post_id', authenticateToken, post.removePost);

module.exports = route;