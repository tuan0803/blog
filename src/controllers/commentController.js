const { commentModel, userModel, postModel } = require('../models/associations');

async function getAllComments(req, res){
    try {
        const { post_id } = req.query
        const comments = await commentModel.findAll({
            where: {
                post_id
            },
            attributes: ['comment_id','content', 'created_at'],
            include: [{
                model: userModel,
                as: 'author',
                attributes: ['username']
            }],
            order:[['created_at', 'DESC']]
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({success: false, message: "Failed to fectch comments.", error: error.message });
    }
}

async function createComment(req, res){
    const user_id = req.user?.user_id;
    const { post_id } = req.query;
    
    try{
        const { content } = req.body;
        const post = await postModel.findByPk(post_id);

        if(!post){
            return res.status(404).json({ success: false, message: "Post not Found." });
        }

        const newComment = await commentModel.create({
            content,
            post_id,
            user_id
        });

        return res.status(201).json({ success: true, message: "Created successfully.", comment: newComment });

    } catch(error){
        res.status(500).json({ success: false, message: "Comment faild.", erroor: error.message})
    }   
}

async function editComment(req, res){
    const user_id = req.user?.user_id;
    const { comment_id } = req.query;
    try {
        const comment = await commentModel.findOne({where: {comment_id}});
        if(!comment){
            return res.status(404).json({ success: false, message: "Comment not Found." });
        }
        if(comment.user_id !== user_id){
            return res.status(403).json({ success: false, message: "You are not allowed to edit this comment." });
        }
        const {content} = req.body;
        console.log(content)
        await commentModel.update({
            content: content || comment.content,
            user_id,
            post_id: comment.post_id
        }, {
            where: {comment_id: comment_id}
        })
        res.status(200).json({ success: true, message: "Updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update comment.", error: error.message });
    }
}

async function removeComment(req, res){
    const user_id = req.user?.user_id;
    const comment_id = req.params.comment_id;
    try {
        const comment = await commentModel.findOne({ where: {comment_id}});
        if(comment.user_id !== user_id){
            return res.status(403).json({ success: false, message: "You are not allowed to delete this comment." })
        }

        await commentModel.destroy({where: { comment_id }});
        res.status(200).json({ success: true, message: "Deleted successfully." })
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete comment.", error: error.message });
    }
}

module.exports = { getAllComments, createComment, editComment, removeComment };