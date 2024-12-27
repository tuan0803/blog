const { postModel, reactionModel, userModel } = require('../models/associations');



async function getAllReactions(req, res){
    try {
        const { post_id } = req.query;
        const reactions = await reactionModel.findAll({
            where: {
                post_id
            },
            attributes: ['reaction_id', 'reaction_type', 'created_at'],
            include: [{
                model: userModel,
                as: 'user',
                attributes: [ 'user_id','username']
            }],
            order:[['created_at', 'DESC']]
        });
        return res.status(200).json(reactions);
    } catch (error) {
        return res.status(500).json({success: false, message: "Failed to fectch comments.", error: error.message });
    }
}

const createReaction = async (req, res) => {
    const post_id = req.params.post_id;
    const { reaction_type  } = req.body;
    const { user_id } = req.user; 

    try {
        const post = await postModel.findByPk(post_id);
        if (!post || post.status !== 'approved') {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const existingReaction = await reactionModel.findOne({
            where: {
                post_id,
                user_id
            }
        });

        if (existingReaction) {
            return res.status(400).json({ success: false, message: 'You have already reacted to this post' });
        }

        const newReaction = await reactionModel.create({
            post_id,
            user_id,
            reaction_type
        });

        return res.status(201).json({
            success: true,
            message: 'Reaction added successfully',
            data: newReaction
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const updateReaction = async (req, res) => {
    const post_id = req.params.post_id;
    const { reaction_type } = req.body;
    const { user_id } = req.user; 
    try {
        const post = await postModel.findByPk(post_id);
        if (!post || post.status !== 'approved') {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const reaction = await reactionModel.findOne({
            where: {
                post_id,
                user_id
            }
        });

        if (!reaction) {
            return res.status(404).json({ success: false, message: 'Reaction not found' });
        }

        reaction.reaction_type = reaction_type;
        await reaction.save();

        return res.status(200).json({
            success: true,
            message: 'Reaction updated successfully',
            data: reaction
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const deleteReaction = async (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user; 
    try {
        const post = await postModel.findByPk(post_id);
        if (!post || post.status !== 'approved') {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const reaction = await reactionModel.findOne({
            where: {
                post_id,
                user_id
            }
        });

        if (!reaction) {
            return res.status(404).json({ success: false, message: 'Reaction not found' });
        }

        await reaction.destroy();

        return res.status(200).json({
            success: true,
            message: 'Reaction deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {getAllReactions, createReaction, updateReaction, deleteReaction};
