// controllers/authController.js
const { userModel, accountModel } = require('../models/associations');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');  

function generateToken(acc) {
    const payload = {
        user_id: acc.user_id,
        role: acc.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token)
    return token;
}

async function login(req, res) {
    const { username, password } = req.body;
    console.log(req.body)

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
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
    const { full_name, email, username, password } = req.body;
    console.log(req.body)

    try {
        if (!full_name || !email || !username || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        const existingUser = await userModel.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = await userModel.create({
            full_name,
            email,
        });

        const newAccount = await accountModel.create({
            user_id: newUser.user_id,
            username,
            password: hashedPassword,
            role: 'user',
            status: 'inactive'
        });

        // const token = jwt.sign({ user_id: newUser.user_id }, 'secret_key', { expiresIn: '1h' });
        // sendEmail(newUser.email, 'Verify your account', `<a href="http://localhost:5000/verify/${token}">Verify Account</a>`);

        res.status(201).json({
            message: 'Account created   successfully. Please verify your email.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating account', error: error.message });
    }
};


async function verifyAccount (req, res) {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, 'secret_key');
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

module.exports = { login, register, verifyAccount };
