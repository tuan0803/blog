const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');



const Account = sequelize.define('Account', {
    account_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Username is required.' }, 
          len: {
            args: [3, 50], 
            msg: 'Username must be between 3 and 50 characters.',
          },
        },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required.' }, 
        len: {
          args: [8], 
          msg: 'Password must be at least 8 characters long.',
        },
      },
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    status: {
        type: DataTypes.ENUM('inactive', 'active'),
        defaultValue: 'inactive'
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'accounts',
    timestamps: false
});

module.exports = Account;
