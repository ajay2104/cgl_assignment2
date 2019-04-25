const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const emailRegex = require('email-regex');
const connection = require('../models/user').connec();

exports.signup = (req,res,next) => {
    let checkUser = () => {
        return new Promise(function (resolve, reject) {
            var object = {
                email : req.body.email
            }
            connection.query('SELECT * FROM users WHERE email = ?',object.email,function(error,result){
                if(error){
                    res.send('Error')
                }
                else{
                    if (result != '') {
                        console.log(result)
                        var resultObj = {
                            msg: 'This User is Already Registered',
                            statusCode: 401,
                            data: []
                        }
                        reject(resultObj);
    
                    } 
                    else if(!req.body.password){
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
                       var valid = emailRegex({exact: true}).test(req.body.email);
                        if(!valid){
                            var emailObj = {
                                msg: 'Plz Type proper email',
                                statusCode: 401,
                                data: []
                            }
                            reject(emailObj);
                        }else{
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
                    connection.query("INSERT INTO users (`id`, `name`, `email`, `password`) VALUES ('" + user.id + "', '" + user.name + "', '" + user.email + "', '" + user.password + "');"),function(error,result){
                    if(error) throw error;
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

        checkUser(req,res)
            .then(hashPassword)
            .then(result1 => {
                var signupObj = {
                    msg: 'login success',
                    statusCode: 200,
                    data: result1
                }
                res.send(signupObj);
            }).catch(error2 => {
                res.send(error2)
             });
}



exports.signin = (req,res,next) => {
    let checkEmail = () => {
        return new Promise(function (resolve, reject) {
            var obj = {
                email : req.body.email
            }
            connection.query('SELECT * FROM users WHERE email = ?',obj.email,function(error,result){
                if(error) throw error;
                else{
                    if (!result) {
                        var obj = {
                            msg: 'User not Found',
                            statusCode: 401,
                            data: []
                        }
                        reject(obj);
                    }
                    else if (!req.body.email) {
                        var obj1 = {
                            msg: 'Plz Set Email',
                            statusCode: 401,
                            data: []
                        }
                        reject(obj1);
                    }
                    else if (!req.body.password) {
                        var obj2 = {
                            msg: 'Plz Set Password',
                            statusCode: 401,
                            data: []
                        }
                        reject(obj2);
                    }
                    else {
                        var obj3 = {
                            data: [],
                            result: result
                        }
                        resolve(obj3);
                    }
        }
                })
            })
                    
    }


    let comparePassword = (retrieveobj3) => {
        return new Promise(function (resolve, reject) {
            bcrypt.compare(retrieveobj3.req.body.password, retrieveobj3.result.password)
                .then(doMatch => {
                    if (doMatch) {
                        resolve(retrieveobj3);
                    } else {
                        var obj4 = {
                            msg: 'Password is Incorrect,Plz Enter correct Password',
                            statusCode: 401,
                            data: []
                        }
                        reject(obj4);
                    }
                })
        })
    }

    let savegeneratedToken = (retrieveobj2) => {
        return new Promise(function (resolve, reject) {
            var accessToken = generatewebToken(retrieveobj2.result._id);
            User.findByIdAndUpdate(retrieveobj2.result.id, { $set: { authToken: accessToken } })
                .select('-password')
                .then(result1 => {
                    resolve(result1);
                }).catch(error3 => { reject(error3) });
        })
    }
    
    return new Promise(function (resolve, reject) {
        checkEmail(req,res)
            .then(comparePassword)
            .then(savegeneratedToken)
            .then(result => {
                var obj2 = {
                    msg: 'login success',
                    statusCode: 200,
                    data: result
                }
                res.send(obj2);
            })
            .catch(error4 => {
                res.send(error4)
            });
    })
}