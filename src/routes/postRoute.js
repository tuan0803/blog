const express = require('express');
const post = require('../controllers/postController');
const reaction = require('../controllers/reactionController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin, isUser} = require('../middlewares/checkRole');
const checkBlackList = require('../middlewares/checkBlackList');
const upload = require('../middlewares/uploadMiddleware');

const route = express.Router();

route.get('/posts', post.getAllPostsApproved);
route.get('/posts/filter', post.getPost);
route.get('/posts/pending', post.getAllPosts);
route.post('/posts/create', checkBlackList, authenticateToken, upload.array('images', 5), post.createPost);
route.put('/posts/approve/:post_id', checkBlackList, authenticateToken, isAdmin, post.approvePost);
route.put('/posts/edit/:post_id', checkBlackList, authenticateToken, upload.array('images', 5), post.updatePost);
route.delete('/posts/delete/:post_id', checkBlackList, authenticateToken, post.removePost);


//Reaction (like, dislike, wow, ...)


route.post('/posts/:post_id/reactions', checkBlackList, authenticateToken, isUser, reaction.createReaction);
route.delete('/posts/:post_id/reactions/delete/', checkBlackList, authenticateToken, isUser, reaction.deleteReaction);
route.put('/posts/:post_id/reactions/edit', checkBlackList, authenticateToken, isUser, reaction.updateReaction);


module.exports = route;