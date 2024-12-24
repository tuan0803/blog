const express = require('express');
const post = require('../controllers/postController');
const authenticateToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const upload = require('../middlewares/uploadMiddleware');

const route = express.Router();

route.get('/posts', post.getAllPostsApproved);
route.get('/posts/search', post.getPost);
route.post('/createPost',  upload.array('images', 5), authenticateToken, post.createPost);
route.put('/posts/approve/:post_id', authenticateToken, isAdmin, post.approvePost);
route.put('/editPost/:post_id', upload.array('images', 5), authenticateToken, post.updatePost);
route.delete('/deletePost/:post_id', authenticateToken, post.removePost);

module.exports = route;