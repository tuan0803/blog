const express = require('express');
const post = require('../controllers/postController');
const authenticateToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const checkBlackList = require('../middlewares/checkBlackList');
const upload = require('../middlewares/uploadMiddleware');

const route = express.Router();

route.get('/posts', post.getAllPostsApproved);
route.get('/posts/search', post.getPost);
route.post('/post/create', checkBlackList, authenticateToken, upload.array('images', 5), post.createPost);
route.put('/post/approve/:post_id', checkBlackList, authenticateToken, isAdmin, post.approvePost);
route.put('/post/edit/:post_id', checkBlackList, authenticateToken, upload.array('images', 5), post.updatePost);
route.delete('/post/delete/:post_id', checkBlackList, authenticateToken, post.removePost);

module.exports = route;