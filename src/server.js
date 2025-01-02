const express = require('express')
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const acc = require('./routes/authRoute')
const postRoute = require('./routes/postRoute');
const commentRoute = require('./routes/commentRoute');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cors());
//Posts
app.use('/', postRoute);
//user
app.use('/user', userRoute);
//auth
app.use('/auth', acc);
//coments
app.use('/api', commentRoute);


app.listen(5000,()=>{
    console.log('Server running: http://localhost:5000')
});