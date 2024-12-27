const { DataTypes } = require('sequelize');
const db = require('../config/db');


const Reaction = db.define('Reaction', {
    reaction_id: {
        type: DataTypes.INTEGER,
        autoIcrement: true,
        primaryKey: true
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reaction_type: {
        type: DataTypes.ENUM( 'like', 'love', 'dislike', 'wow', 'sad', 'angry'),
        allowNUll: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'reactions',
    timestamps: false,
    createdAt: 'created_at'
});

module.exports = Reaction;