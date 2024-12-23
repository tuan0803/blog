const db = require('../config/db');
const DATATYPES = require('sequelize');


const comment = db.define('comment', {
    comment_id: {
        type: DATATYPES.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    post_id:{
        type: DATATYPES.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DATATYPES.INTEGER,
        allowNull: false
    },
    content: {
        type: DATATYPES.STRING,
        allowNull: false
    },
    created_at: {
        type: DATATYPES.DATE,
        defaultValue: DATATYPES.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'comments',
    timestamps: false,
    createdAt: 'created_at'
})


module.exports = comment;