const postModel = require('./postModel');
const userModel = require('./userModel');
const accountModel = require('./accountModel');
const commentModel = require('./commentModel');
const imageModel = require('./imageModel');
const reactionModel = require('./reactionModel');
const fs = require('fs/promises');


//post
postModel.belongsTo(userModel, { foreignKey: 'user_id'});
postModel.hasMany(reactionModel, { foreignKey: 'post_id', onDelete: 'CASCADE'});
postModel.hasMany(imageModel, { foreignKey: 'post_id', onDelete: 'CASCADE' });
postModel.hasMany(commentModel, { foreignKey: 'post_id', onDelete: 'CASCADE' });
//Image
imageModel.belongsTo(postModel, { foreignKey: 'post_id' });
//comment
commentModel.belongsTo(userModel, { foreignKey: 'user_id' });
commentModel.belongsTo(postModel, { foreignKey: 'post_id' });
//account
userModel.hasOne(accountModel, { foreignKey: 'user_id'  });
userModel.hasMany(postModel, { foreignKey: 'user_id', onDelete: 'CASCADE' });
userModel.hasMany(commentModel, { foreignKey: 'user_id', onDelete: 'CASCADE' });
accountModel.belongsTo(userModel, { foreignKey: 'user_id' });
//reaction
reactionModel.belongsTo(userModel, { foreignKey: 'user_id' });
reactionModel.belongsTo(postModel, { foreignKey: 'post_id' });


//Hook 

postModel.beforeDestroy(async (post) => {
    const images = await imageModel.findAll({ where: { post_id: post.post_id } });

    const unlinkPromises = images.map(async (image) => {
        try {
            await Promise.all(unlinkPromises);
            await fs.access(image.image_url); 
            console.log(`Deleting: ${image.image_url}`);
            await fs.unlink(image.image_url);
        } catch (error) {
            console.error(`Cannot remove file: ${image.image_url}`);
        }
    });

    await Promise.all(unlinkPromises);
});

postModel.afterDestroy(async (post, options) => {
    await commentModel.destroy({ where: { post_id: post.post_id } });
    await imageModel.destroy({ where: { post_id: post.post_id } });
});

userModel.beforeDestroy(async (user, options) => {
    try {
        await accountModel.destroy({ where: { user_id: user.user_id } });
    } catch (error) {
        console.error(`Error deleting account for user with ID: ${user.user_id}. Error: ${error.message}`);
    }
});


userModel.afterDestroy(async (users, options) => {
    await commentModel.destroy({ where: { user_id: users.user_id } });
    await postModel.destroy({ where: { user_id: users.user_id } });

});





module.exports = {accountModel, postModel, imageModel, reactionModel, userModel, commentModel};



