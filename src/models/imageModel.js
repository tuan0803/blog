const { DataTypes } = require('sequelize');
const db = require('../config/db');


const Image = db.define('Image', {
    image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'post_images',
    timestamps: false
});

module.exports = Image;