const Joi = require('joi');

// Login schema
const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

// Register schema
const registerSchema = Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().optional(),
    address: Joi.string().optional()
});

// Change password schema
const changePasswordSchema = Joi.object({
    password: Joi.string().required(),
    newpassword: Joi.string().min(8).required()
});


const createPostSchema = Joi.object({
    title: Joi.string().trim().min(3).max(255).required(),
    content: Joi.string().trim().min(10).required(),
});

const updatePostSchema = Joi.object({
    title: Joi.string().trim().min(3).max(255).optional(),
    content: Joi.string().trim().min(10).optional(),
});

module.exports = {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    createPostSchema, 
    updatePostSchema 
};
