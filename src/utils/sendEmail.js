// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'your-email@gmail.com', //email gui
//         pass: 'your-email-password'    //password 
//     }
// });

// async function sendVerificationEmail(email, token) {
//     const verificationUrl = `http://localhost:5000/verify/${token}`;

//     const mailOptions = {
//         from: 'your-email@gmail.com',
//         to: email,
//         subject: 'Account Verification',
//         html: `<p>Click the link below to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         throw new Error('Error sending verification email');
//     }
// }

// module.exports = sendVerificationEmail;
