const { postModel, userModel } = require('../models/associations');
const { Sequelize } = require('sequelize');
const redisClient = require('../utils/redisClient'); 


const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

async function setCache(key, value, expiration = 3600) {
    console.log(`Setting cache for key: ${key}`);
    await redisClient.set(key, JSON.stringify(value), 'EX', expiration);
    console.log(`Cache set for key: ${key}`);  
}


async function getCache(key) {
    console.log(`Getting cache for key: ${key}`);
    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log(`Cache hit for key: ${key}`);
        return JSON.parse(cachedData);
    } else {
        console.log(`Cache miss for key: ${key}`);
        return null;
    }
}

async function getAllPosts(req, res) {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const cacheKey = `posts:page=${page}:limit=${limit}`;

    try {
        const cachedPosts = await getCache(cacheKey);
        if (cachedPosts) {
            return res.status(200).json({ success: true, data: cachedPosts, fromCache: true });
        }

        const posts = await postModel.findAndCountAll({
            attributes: ['post_id', 'title', 'content', 'image_url'],
            include: [{
                model: userModel,
                as: 'author',
                attributes: ['username']
            }],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        await setCache(cacheKey, posts);

        return res.status(200).json({ success: true, data: posts, fromCache: false });
    } catch (error) {
        console.error(`Error fetching posts: ${error.message}`);
        return res.status(500).json({ success: false, message: "Failed to fetch posts." });
    }
}

async function getPost(req, res) {
    const { keyword = '' } = req.query;
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const sanitizedKeyword = keyword.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
    const cacheKey = `search:${sanitizedKeyword}:page=${page}:limit=${limit}`;

    try {
        const cachedPosts = await getCache(cacheKey);
        if (cachedPosts) {
            return res.status(200).json({ success: true, data: cachedPosts, fromCache: true });
        }

        const posts = await postModel.findAndCountAll({
            where: {
                [Sequelize.Op.or]: [
                    { title: { [Sequelize.Op.like]: `%${sanitizedKeyword}%` } },
                    { content: { [Sequelize.Op.like]: `%${sanitizedKeyword}%` } }
                ]
            },
            attributes: ['post_id', 'title', 'content', 'image_url'],
            include: [{
                model: userModel,
                as: 'author',
                attributes: ['username']
            }],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        await redisClient.set(cacheKey, JSON.stringify(posts), 'EX', 3600); // Lưu trong 1 giờ

        res.status(200).json({ success: true, data: posts, fromCache: false });
    } catch (error) {
        console.error(`Error fetching posts with keyword "${keyword}": ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch posts.', error: error.message });
    }
}

async function createPost(req, res) {
    const userId = req.user?.user_id;

    try {
        const { title, content, image_url } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required." });
        }

        const newPost = await postModel.create({
            title,
            content,
            image_url,
            author_id: userId
        });

        await redisClient.del(`posts:page=1:limit=10`);
        await redisClient.del(`posts:page=2:limit=10`);

        return res.status(201).json({
            success: true,
            message: 'Post created successfully.',
            post: newPost
        });
    } catch (error) {
        console.error(`Error creating post: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Failed to create post' });
    }
}

async function updatePost(req, res) {
    const post_id = req.params.post_id;
    const user_id = req.user?.user_id;

    try {
        const post = await postModel.findOne({ where: { post_id } });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.author_id !== user_id) {
            return res.status(403).json({ success: false, message: 'You are not allowed to edit this post.' });
        }

        const { title, content, image_url } = req.body;

        await postModel.update(
            {
                title: title || post.title,
                content: content || post.content,
                image_url: image_url || post.image_url
            },
            { where: { post_id } }
        );

        await redisClient.del(`posts:page=1:limit=10`);
        await redisClient.del(`posts:page=2:limit=10`);

        return res.status(200).json({ success: true, message: 'Post updated successfully.' });
    } catch (error) {
        console.error(`Error updating post with ID ${post_id}: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Failed to edit post' });
    }
}

async function removePost(req, res) {
    const post_id = req.params.post_id;
    const user_id = req.user?.user_id;

    try {
        const post = await postModel.findOne({ where: { post_id } });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        if (post.author_id !== user_id) {
            return res.status(403).json({ success: false, message: 'You are not allowed to delete this post.' });
        }

        await postModel.destroy({ where: { post_id } });

        await redisClient.del(`posts:page=1:limit=10`);
        await redisClient.del(`posts:page=2:limit=10`);

        return res.status(200).json({ success: true, message: 'Post deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting post with ID ${post_id}: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Failed to delete post.' });
    }
}


module.exports = { getAllPosts, getPost, createPost, updatePost, removePost };
