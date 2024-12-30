const { DataTypes } = require('sequelize');
const db = require('../config/db');

const BlackList = db.define('blacklist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    token: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    expire_at: {  
        type: DataTypes.DATE,
        allowNull: false,
    },
    created_at: { 
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'token_blacklist',
    timestamps: false, 
    createdAt: 'created_at', 
});

module.exports = BlackList;
