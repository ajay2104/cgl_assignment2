const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const emailRegex = require('email-regex');
const connection = require('../models/user').connec();

exports.signup = (req, res, next) => {
    let checkUser = () => {
        return new Promise(function (resolve, reject) {
            var object = {
                email: req.body.email
            }
            connection.query('SELECT * FROM users WHERE email = ?', object.email, function (error, result) {
                if (error) {
                    res.send('Error')
                }
                else {
                    if (result != '') {
                        var resultObj = {
                            msg: 'This User is Already Registered',
                            statusCode: 401,
                            data: []
                        }
                        reject(resultObj);

                    }
                    else if (!req.body.password) {
                        var passwordObj = {
                            msg: 'Plz Set Password',
                            statusCode: 401,
                            data: []
                        }
                        reject(passwordObj);
                    }
                    else if (req.body.password.length < 5) {
                        var lengthObj = {
                            msg: 'Password Length is less than 5',
                            statusCode: 401,
                            data: []
                        }
                        reject(lengthObj);
                    }
                    else {
                        var valid = emailRegex({ exact: true }).test(req.body.email);
                        if (!valid) {
                            var emailObj = {
                                msg: 'Plz Type proper email',
                                statusCode: 401,
                                data: []
                            }
                            reject(emailObj);
                        } else {
                            resolve(req.body);
                        }
                    }
                }

            })

        })
    }

    let hashPassword = (retrieveobj) => {
        return new Promise(function (resolve, reject) {
            const user = {
                id: retrieveobj.id,
                name: retrieveobj.name,
                email: retrieveobj.email,
            }
            bcrypt.hash(retrieveobj.password, 10).then(data => {
                user.password = data;
                connection.query("INSERT INTO users (`id`, `name`, `email`, `password`) VALUES ('" + user.id + "', '" + user.name + "', '" + user.email + "', '" + user.password + "');"), function (error, result) {
                    if (error) throw error;
                    else {
                        var bcryptObj = {
                            msg: 'SignUp Success',
                            statusCode: 200,
                            data: []
                        }
                        resolve(bcryptObj);
                    }

                }
            })
        })
    }

    async function msg(req,res,next) {
        try{
            var check = await checkUser(req,res);
            var hash = await hashPassword(check);
            return hash;
        }catch(error){
            res.send(error);
            console.log(error);
        }
    }

    msg(req,res,function(err,result){
        if(err){
            res.send('Error');
        }else{
            res.send(result)
        }   
    })
}




exports.signin = (req, res, next) => {
    var data1 = req.body;
    let checkEmail = () => {
        return new Promise(function (resolve, reject) {
            var object = {
                email: req.body.email
            }
            connection.query('SELECT * FROM users WHERE email = ?', object.email, function (error, result) {
                if (error) throw error;
                else {
                    if (!result) {
                        var resultObj = {
                            msg: 'User not Found',
                            statusCode: 401,
                            data: []
                        }
                        reject(resultObj);
                    }
                    else if (!req.body.email) {
                        var emailObj = {
                            msg: 'Plz Set Email',
                            statusCode: 401,
                            data: []
                        }
                        reject(emailObj);
                    }
                    else if (!req.body.password) {
                        var passwordObj = {
                            msg: 'Plz Set Password',
                            statusCode: 401,
                            data: []
                        }
                        reject(passwordObj);
                    }
                    else {
                        var elseObj = {
                            data: [],
                            result: result
                        }
                        resolve(elseObj);
                    }
                }
            })
        })

    }


    let comparePassword = (retrieveobj) => {
        return new Promise(function (resolve, reject) {
            bcrypt.compare(data1.password, retrieveobj.result[0].password)
                .then(doMatch => {
                    if (doMatch) {
                        resolve(retrieveobj);
                    } else {
                        var compareObj = {
                            msg: 'Password is Incorrect,Plz Enter correct Password',
                            statusCode: 401,
                            data: []
                        }
                        reject(compareObj);
                    }
                }).catch(err => {
                    res.send(err);
                })
        })
    }

    let generatedToken = (retrieveobj) => {
        return new Promise(function(resolve,reject){
            var object = {
                email: req.body.email
            }
            connection.query('SELECT * FROM users WHERE email = ?', object.email, function (error, result) {
                if(error){
                    reject(error);
                }else {
                    var token = jwt.sign({id:retrieveobj.id}, 'secret', {
                        expiresIn: 86400
                      });
            
                res.cookie('auth',token);
                res.status(200).send({ auth: true, token: token });
                resolve(result);
                }
        })
               
    })
}

        async function msg(req,res,next) {
            try{
                var email = await checkEmail(req,res);
                var compare = await comparePassword(email);
                var token = await generatedToken(compare);
                return token;
            }catch(error){
                res.send(error);
            }
        }

        msg(req,res,function(error,result){
            if(error){
                res.send(error);
            }else {
                res.send(result);
            }
        })

}


