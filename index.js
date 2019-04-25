const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const app = express();

const adminRoutes = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(adminRoutes);

app.listen(3000,function(req,res,next){
    console.log('App is running on port 4000');
})