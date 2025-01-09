const { commentModel, userModel, postModel } = require('../models/associations');
// const redisClient = require('../utils/redisClient'); 


async function getAllComments(req, res){
    try {
        const { post_id } = req.query;
        const comments = await commentModel.findAll({
            where: {
                post_id
            },
            attributes: ['comment_id','content', 'created_at'],
            include: [{ model: userModel, attributes: ['user_id', 'full_name'] },],
            order:[['created_at', 'DESC']]
        });
        return res.status(200).json({ success: true, data: comments});
    } catch (error) {
        res.status(500).json({success: false, message: "Failed to fectch comments.", error: error.message });
    }
}

async function createComment(req, res){
    const user_id = req.user?.user_id;
    const { post_id } = req.query;
    
    try{
        const { content } = req.body;
        console.log(user_id)
        const post = await postModel.findByPk(post_id);
        if (!post || post.status !== 'approved') {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const newComment = await commentModel.create({
            content,
            post_id,
            user_id
        });
        // await redisClient.flushDb();
        return res.status(201).json({ success: true, message: "Created successfully.", comment: newComment });

    } catch(error){
        res.status(500).json({ success: false, message: "Comment faild.", erroor: error.message})
    }   
}

async function editComment(req, res){
    const user_id = req.user.user_id;
    const { comment_id } = req.query;
    try {
        const comment = await commentModel.findOne({
            where: { comment_id },
            user_id
        });
        if( !comment ){
            return res.status(404).json({ success: false, message: "Comment not Found." });
        }
        const { content } = req.body;
        const commentEdit = await commentModel.update({
            content: content || comment.content,
            user_id,
            post_id: comment.post_id
        }, {
            where: {comment_id: comment_id}
        })
        // await redisClient.flushDb();
        res.status(200).json({ success: true, message: "Updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update comment.", error: error.message });
    }
}

async function removeComment(req, res){
    const { user_id, role } = req.user;
    const comment_id = req.params.comment_id;
    try {
        const comment = await commentModel.findOne({ where: {comment_id} });
        if( role ==='admin' || comment.user_id === user_id){
            // await redisClient.flushDb();
            await commentModel.destroy({ where: { comment_id } });
            return res.status(200).json({ success: true, message: "Deleted successfully." });
        }
        return res.status(403).json({ success: false, message: "You are not allowed to delete this comment." })
    } catch ( error ) {
        res.status(500).json({ success: false, message: "Failed to delete comment.", error: error.message });
    }
}

module.exports = { getAllComments, createComment, editComment, removeComment };