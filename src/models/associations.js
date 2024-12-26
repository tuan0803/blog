const postModel = require('./postModel');
const userModel = require('./userModel');
const accountModel = require('./accountModel');
const commentModel = require('./commentModel');
const imageModel = require('./imageModel');


//post
postModel.belongsTo(userModel, { foreignKey: 'user_id'});
userModel.hasMany(postModel, { foreignKey: 'user_id' });
//Image
postModel.hasMany(imageModel, { foreignKey: 'post_id' });
imageModel.belongsTo(postModel, { foreignKey: 'post_id' });
//comment
userModel.hasMany(commentModel, { foreignKey: 'user_id' });
commentModel.belongsTo(userModel, { foreignKey: 'user_id' });
postModel.hasMany(commentModel, { foreignKey: 'post_id' });
commentModel.belongsTo(postModel, { foreignKey: 'post_id' });
//account
userModel.hasOne(accountModel, { foreignKey: 'user_id' });
accountModel.belongsTo(userModel, { foreignKey: 'user_id' });



module.exports = {accountModel, postModel, imageModel, userModel, commentModel};



