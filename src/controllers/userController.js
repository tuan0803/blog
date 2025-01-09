const { userModel, accountModel} = require('../models/associations');
const isAuthorized = require('../middlewares/authorization');
require('dotenv').config();



async function getUsers(req, res){
    try {
        const users =  await userModel.findAll();
        return res.status(200).json(users)
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getUser(req, res){
    try {
        const user_id = req.params.user_id;
        const user = await userModel.findOne({where: {user_id}});
        (!user) ? res.status(404).json('Not Found User') : res.status(200).json(user);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function updateUser(req, res) {
    const user_id = req.params.user_id;
    const { full_name, email, phone, address } = req.body;

    try {
        const user = await userModel.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const data = {};
        if (full_name) data.full_name = full_name;
        if (email) data.email = email;
        if (phone) data.phone = phone;
        if (address) data.address = address;

        if (email) {
            const existingUser = await userModel.findOne({ where: { email } });
            if (existingUser && existingUser.user_id !== parseInt(user_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Email existed.",
                });
            }
        }

        const [update] = await userModel.update(data, { where: { user_id } });

        if (update) {
            return res.status(200).json({
                success: true,
                message: "Updated successfully.",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Update failed.",
            });
        }
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Update error.",
            error: e.message,
        });
    }
}


async function removeUser(req, res) {
    const { user_id } = req.params;

    try {
        const userDeleted = await userModel.destroy({ where: { user_id } });

        if (userDeleted) {
            return res.status(200).json({
                success: true,
                message: 'User and associated account deleted successfully.',
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Failed to delete user or account.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting user.',
            error: error.message,
        });
    }
}


module.exports = {getUsers, getUser, updateUser, removeUser};