const postModel = require('./postModel');
const userModel = require('./userModel');
const accountModel = require('./accountModel');
const commentModel = require('./commentModel');
const imageModel = require('./imageModel');
const reactionModel = require('./reactionModel');


//post
postModel.belongsTo(userModel, { foreignKey: 'user_id'});
postModel.hasMany(reactionModel, { foreignKey: 'post_id'});
postModel.hasMany(imageModel, { foreignKey: 'post_id' });
postModel.hasMany(commentModel, { foreignKey: 'post_id' });
//Image
imageModel.belongsTo(postModel, { foreignKey: 'post_id' });
//comment
commentModel.belongsTo(userModel, { foreignKey: 'user_id' });
commentModel.belongsTo(postModel, { foreignKey: 'post_id' });
//account
userModel.hasOne(accountModel, { foreignKey: 'user_id' });
userModel.hasMany(postModel, { foreignKey: 'user_id' });
userModel.hasMany(commentModel, { foreignKey: 'user_id' });
accountModel.belongsTo(userModel, { foreignKey: 'user_id' });
//reaction
reactionModel.belongsTo(userModel, { foreignKey: 'user_id' });
reactionModel.belongsTo(postModel, { foreignKey: 'post_id' });




module.exports = {accountModel, postModel, imageModel, reactionModel, userModel, commentModel};



