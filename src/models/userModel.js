const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required.' },
      len: {
        args: [8, 255], 
        msg: 'Full name must be between 8 and 255 characters.',
      },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, 
    validate: {
      notEmpty: { msg: 'Email is required.' },
      isEmail: { msg: 'Email format is invalid.' },
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Phone number is required.' },
      isNumeric: { msg: 'Phone number must contain only numbers.' },
      len: {
        args: [10, 20], 
        msg: 'Phone number must be between 10 and 20 digits.',
      },
    },
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Address is required.' },
      len: {
        args: [5, 255], 
        msg: 'Address must be between 5 and 255 characters.',
      },
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'users',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
