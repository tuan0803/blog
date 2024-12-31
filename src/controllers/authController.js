// controllers/authController.js
const { userModel, accountModel } = require('../models/associations');
const BlackList = require('../models/blackListModel'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middlewares/authMiddleware');
const sequelize = require('../config/db');
// const redisClient = require('../utils/redisClient');
// const sendEmail = require('../utils/sendEmail');  


const TOKEN_EXPIRATION_TIME = 3600;
function generateToken(acc) {
    const payload = {
        user_id: acc.user_id,
        role: acc.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

async function login(req, res) {
    const { username, password } = req.body;

    try {
        const acc = await accountModel.findOne({ where: { username } });
        if (!acc) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, acc.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = generateToken(acc);
        res.status(200).json({ success: true, message: "Login successful.", token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed", error: error.message });
    }
}

async function register (req, res) {
    const { full_name, email, username, password, phone, address } = req.body;
    const transaction = await sequelize.transaction();
    try {
        const existingUser = await userModel.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = await userModel.create({
            full_name,
            email,
            phone,
            address
        }, { transaction });

        const newAccount = await accountModel.create({
            user_id: newUser.user_id,
            username,
            password: hashedPassword,
            role: 'user',
            status: 'inactive'
        }, { transaction });

        await transaction.commit();
        // const token = jwt.sign({ user_id: newUser.user_id }, 'secret_key', { expiresIn: '1h' });
        // sendEmail(newUser.email, 'Verify your account', `<a href="http://localhost:5000/verify/${token}">Verify Account</a>`);

        res.status(201).json({
            message: 'Account created successfully. Please verify your email.'
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error creating account', error: error.message });
    }
};


async function logout(req, res) {
    const token = req.header('Authorization')?.split(' ')[1];  // Extract token from the Authorization header

    if (!token) {
        return res.status(400).json({ message: 'Token not provided.' });
    }

    try {

        const expireDate = new Date();
        expireDate.setSeconds(expireDate.getSeconds() + TOKEN_EXPIRATION_TIME); 

        await BlackList.create({
            token: token,
            expire_at: expireDate,
            created_at: new Date(), 
        });
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ message: 'Error logging out.', error: error.message });
    }
}

async function changePassword(req, res) {
    const user_id = req.user?.user_id;
    const { password, newpassword } = req.body;

    if (!newpassword || newpassword.length < 8) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
    }

    try {
        const acc = await accountModel.findOne({ where: { user_id } });

        if (!acc) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isValidPassword = await bcrypt.compare(password, acc.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid old password' });
        }

        const hashedNewPassword = await bcrypt.hash(newpassword, 10); 
        await accountModel.update({ password: hashedNewPassword }, { where: { user_id } });

        return res.status(200).json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error changing password', error: error.message });
    }
}

async function verifyAccount (req, res) {
    const { token } = req.query;
   
    try {
        const decoded = await verifyToken( token );
        console.log(token)
        const account = await accountModel.findOne({ where: { user_id: decoded.user_id } });
        
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        account.is_verified = true;
        account.status = 'active';
        await account.save();

        res.status(200).json({ message: 'Account verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying account', error: error.message });
    }
};

module.exports = { login, register, logout, changePassword, verifyAccount };
