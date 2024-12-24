const { postModel, userModel, imageModel } = require('../models/associations');
const { Sequelize} = require('sequelize');
const redisClient = require('../utils/redisClient'); 
const fs = require('fs').promises;


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

async function getAllPostsApproved(req, res) {
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
            attributes: ['post_id', 'title', 'content'],
            where: { is_approved: true },
            include: [
                { 
                    model: userModel, 
                    attributes: ['full_name'] 
                },
                { 
                    model: imageModel, 
                    attributes: ['image_url'], 
                    where: { post_id: Sequelize.col('post_id') }  
                }
            ],
            limit: limit,
            offset: offset
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

        await setCache(cacheKey, posts);

        return res.status(200).json({ success: true, data: posts, fromCache: false });
    } catch (error) {
        console.error(`Error fetching posts with keyword "${keyword}": ${error.message}`);
        return res.status(500).json({ success: false, message: 'Failed to fetch posts.', error: error.message });
    }
}


async function createPost(req, res) {
    const user_id = req.user?.user_id;

    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required." });
        }

        const newPost = await postModel.create({
            title,
            content,
            user_id
        });
        if(req.files && req.files.length > 0){
            const image_urls = req.files.map(file => file.path)
            await Promise.all(
                image_urls.map(image_url => {
                    imageModel.create({
                        post_id: newPost.post_id,
                        image_url: image_url
                    })
                })
            )
        }

        await redisClient.del();

        return res.status(201).json({
            success: true,
            message: 'Post created successfully.'
        });
    } catch (error) {
        console.error(`Error creating post: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Failed to create post' });
    }
}

async function approvePost(req, res){
    const  post_id  = req.params.post_id;
    try {
        const post = await postModel.findByPk( post_id );
        if( !post ){
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        post.is_approved = true;
        await post.save();

        return res.status(200).json({ success: true, message: 'Post approved successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to approve post' });
    }
}

async function updatePost(req, res) {
    const post_id = req.params.post_id;
    const { user_id, role } = req.user;

    try {
        const post = await postModel.findOne({ where: { post_id } });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (role === 'admin' || post.user_id == user_id) {
            
            const { title, content } = req.body;
            await postModel.update(
                {
                    title: title || post.title,
                    content: content || post.content
                },
                { where: { post_id } }
            );

            const oldImages = await imageModel.findAll({
                where: { post_id },
                attributes: ['image_url']
            });

            if (req.files && req.files.length > 0) {
                await Promise.all(
                    oldImages.map(image => {
                        try {
                            fs.unlinkSync(image.image_url); 
                        } catch (error) {
                            console.error(`Failed to delete: ${image.image_url}`, error);
                        }
                    })
                );

                await imageModel.destroy({ where: { post_id } });

                const image_urls = req.files.map(file => file.path);
                await Promise.all(
                    image_urls.map(async (image_url) => {
                        await imageModel.create({
                            post_id,
                            image_url
                        });
                    })
                );
            }

            await redisClient.del(post_id);

            return res.status(200).json({ success: true, message: 'Post updated successfully.' });
        }

        return res.status(403).json({ success: false, message: 'You are not allowed to edit this post.' });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ success: false, message: 'Failed to edit post', error: error.message });
    }
}

async function removePost(req, res) {
    const post_id = req.params.post_id;
    const { user_id, role } = req.user;  
    console.log(role);
    try {
        const post = await postModel.findOne({ where: { post_id } });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        if (role === 'admin' || post.user_id === user_id) {
            const images = await imageModel.findAll({
                where: { post_id },
                attributes: ['image_url']
            });

            const unlinkPromises = images.map(image => {
                return new Promise((resolve, reject) => {
                    fs.unlink(image.image_url, (err) => {
                        if (err) {
                            console.error(`Failed to delete: ${image.image_url}`, err);
                            return reject(err);
                        }
                        resolve();
                    });
                });
            });

            await Promise.all(unlinkPromises);

            await imageModel.destroy({ where: { post_id } });
            await postModel.destroy({ where: { post_id } });
            await redisClient.del(post_id);

            return res.status(200).json({ success: true, message: 'Post deleted successfully.' });
        }
        return res.status(403).json({ success: false, message: 'You are not allowed to delete this post.' });
    } catch (error) {
        console.error(`Error deleting post: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Failed to delete post.' });
    }
}


module.exports = { getAllPostsApproved, getPost, createPost, approvePost, updatePost, removePost };
