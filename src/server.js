const express = require('express')
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const acc = require('./routes/authRoute')
const postRoute = require('./routes/postRoute');
const commentRoute = require('./routes/commentRoute')


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
//Posts
app.use('/', postRoute);
//user
app.use('/user', userRoute);
//auth
app.use('/auth', acc);
//coments
app.use('/api', commentRoute);


app.listen(3000,()=>{
    console.log('Server running: http://localhost:3000')
})