const postModel = require('./postModel');
const userModel = require('./userModel');
const accountModel = require('./accountModel');
const commentModel = require('./commentModel');


//post
postModel.belongsTo(userModel, { foreignKey: 'author_id', as: 'author' });
userModel.hasMany(postModel, { foreignKey: 'author_id' });
//comment
userModel.hasMany(commentModel, { foreignKey: 'user_id' });
commentModel.belongsTo(userModel, { foreignKey: 'user_id', as: 'author' });
//account
userModel.hasOne(accountModel, { foreignKey: 'user_id' });
accountModel.belongsTo(userModel, { foreignKey: 'user_id' });



module.exports = {accountModel, postModel, userModel, commentModel};



