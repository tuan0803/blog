const { postModel, userModel, imageModel, reactionModel } = require('../models/associations');
const { Sequelize} = require('sequelize');
// const redisClient = require('../utils/redisClient'); 
const fs = require('fs').promises;
const { createPostSchema, updatePostSchema } = require('../utils/validationSchema');


const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// async function setCache(key, value) {
//     await redisClient.select(0);
//     const existingCache = await redisClient.get(key);
//     let updatedValue;

//     if (existingCache) {
//         const parsedCache = JSON.parse(existingCache);
//         updatedValue = Array.isArray(parsedCache) ? [...parsedCache, value] : [parsedCache, value];
//     } else {
//         updatedValue = Array.isArray(value) ? value : [value];
//     }

//     await redisClient.set(key, JSON.stringify(updatedValue), 'EX', 3600);
// }


// async function getCache(key) {
//     await redisClient.select(0);
//     const cachedData = await redisClient.get(key);
//     if (cachedData) {
//         return JSON.parse(cachedData);
//     } else {
//         return null;
//     }
// }
async function getAllPosts(req, res) {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;
    const { role } = req.user; 

    let statusFilter = ['approved'];  
    if (role === 'admin') {
        statusFilter = ['approved', 'pending', 'rejected']; 
    }

    try {
        const posts = await postModel.findAndCountAll({
            attributes: ['post_id', 'title', 'content', 'status', 'created_at', 'updated_at'],
            where: {
                status: {
                    [Sequelize.Op.in]: statusFilter 
                }
            },
            include: [
                { 
                    model: userModel,
                    attributes: ['user_id','full_name'] 
                },
                { 
                    model: imageModel, 
                    attributes: ['image_id','image_url']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: limit,
            offset: offset
        });

        const pagination = {
            total: posts.count,
            currentPage: page,
            totalPages: Math.ceil(posts.count / limit)
        };

        return res.status(200).json({ success: true, data: posts.rows, pagination });
    } catch (error) {
        console.error(`Error fetching posts: ${error.message}`);
        return res.status(500).json({ success: false, message: "Failed to fetch posts." });
    }
}


async function createPost(req, res) {
    const user_id = req.user?.user_id;

    try {
        // Validate input data
        const { error, value } = createPostSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { title, content } = value;

        const newPost = await postModel.create({
            title,
            content,
            user_id
        });

        if (req.files && req.files.length > 0) {
            const image_urls = req.files.map(file => file.path);
            await Promise.all(
                image_urls.map(image_url => {
                    imageModel.create({
                        post_id: newPost.post_id,
                        image_url: image_url
                    });
                })
            );
        }

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
        // await redisClient.flushDb();
        const post = await postModel.findByPk( post_id );
        if( !post ){
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        post.status = 'approved';
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
        const { error, value } = updatePostSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const post = await postModel.findOne({ where: { post_id } });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (role === 'admin' || post.user_id == user_id) {
            const { title, content } = value;

            await postModel.update(
                {
                    title: title || post.title,
                    content: content || post.content
                },
                { where: { post_id } }
            );

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
    try {
        const post = await postModel.findOne({ where: { post_id } });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        if (role === 'admin' || post.user_id === user_id) {
            
            await postModel.destroy({ where: { post_id } });
            // await redisClient.flushDb();

            return res.status(200).json({ success: true, message: 'Post deleted successfully.' });
        }

        return res.status(403).json({ success: false, message: 'You are not allowed to delete this post.' });
    } catch (error) {
        console.error(`Error deleting post: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Failed to delete post.' });
    }
}



module.exports = { getAllPosts, createPost, approvePost, updatePost, removePost };
